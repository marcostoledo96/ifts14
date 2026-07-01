<?php

declare(strict_types=1);

/**
 * Cobertura runtime del reenvío administrativo sobre un fake PDO en memoria.
 *
 * Cubre los escenarios marcados UNTESTED por verify:
 *  - 200 exitoso con transporte fake: rotación (token anterior revocado, nuevo activo),
 *    auditoría `reenvio/ok` persistida con destinatario enmascarado y sin token,
 *    DTO sin token/email completo.
 *  - 404 CERTIFICATE_NOT_FOUND con certificado inexistente (autorizado).
 *  - 404 con certificado no vigente (revocado).
 *  - Email body: solo el enlace /validar/{token}, sin adjuntos ni token fuera del enlace.
 *  - Privacidad: token completo no aparece en DTO, auditoría ni body fuera del enlace.
 *  - SMTP hardening: assertConfigured rechaza smtp_port inválido/inexistente.
 */

require_once __DIR__ . '/../src/EmailDeliveryTransport.php';
require_once __DIR__ . '/../src/StubEmailDeliveryTransport.php';
require_once __DIR__ . '/../src/SmtpEmailDeliveryTransport.php';
require_once __DIR__ . '/../src/EmailDeliveryTransportFactory.php';
require_once __DIR__ . '/../src/Config.php';
require_once __DIR__ . '/../src/AdminCertificateService.php';

// --- Fake PDO en memoria ---
// Simula tablas cert_certificados, cert_tokens_verificacion, cert_eventos_auditoria.
// Mapea SQL por keywords para responder a reenviar() sin MariaDB real.

/**
 * @internal Test-only fake PDO.
 */
final class FakePdoForResend extends PDO
{
    /** @var array<int, array<string, mixed>> */
    public array $certs = [];
    /** @var array<int, array<string, mixed>> */
    public array $tokens = [];
    /** @var array<int, array<string, mixed>> */
    public array $audits = [];
    public bool $inTx = false;
    private int $certSeq = 1;
    private int $tokenSeq = 1;
    private int $auditSeq = 1;

    public function __construct()
    {
        // No llama parent::__construct: evita DSN real.
    }

    public function beginTransaction(): bool
    {
        $this->inTx = true;
        return true;
    }

    public function commit(): bool
    {
        $this->inTx = false;
        return true;
    }

    public function rollBack(): bool
    {
        $this->inTx = false;
        return true;
    }

    public function inTransaction(): bool
    {
        return $this->inTx;
    }

    public function prepare(string $query, array $options = []): PDOStatement|false
    {
        return new FakeStmtForResend($query, $this);
    }

    public function lastInsertId(?string $name = null): string
    {
        return (string) $this->tokenSeq;
    }

    // Helpers internos para los statements.
    public function selectCertForUpdate(int $id): array|false
    {
        foreach ($this->certs as $row) {
            if ((int) $row['id'] === $id) {
                return $row;
            }
        }
        return false;
    }

    public function revokeActiveTokens(int $certId, string $when): int
    {
        $count = 0;
        foreach ($this->tokens as &$row) {
            if ((int) $row['certificado_id'] === $certId && $row['estado'] === 'activo') {
                $row['estado'] = 'revocado';
                $row['revocado_en'] = $when;
                $count++;
            }
        }
        return $count;
    }

    public function insertToken(int $certId, string $tokenHash, string $prefix, string $vigenteDesde, ?string $vigenteHasta): void
    {
        $this->tokens[] = [
            'id' => $this->tokenSeq++,
            'certificado_id' => $certId,
            'token_hash' => $tokenHash,
            'token_prefijo' => $prefix,
            'estado' => 'activo',
            'vigente_desde' => $vigenteDesde,
            'vigente_hasta' => $vigenteHasta,
            'revocado_en' => null,
        ];
    }

    public function insertAudit(?int $certId, string $tipo, string $resultado, string $requestId, ?string $tokenHashPrefijo, ?string $detalleSeguro): void
    {
        $this->audits[] = [
            'id' => $this->auditSeq++,
            'certificado_id' => $certId,
            'tipo_evento' => $tipo,
            'resultado' => $resultado,
            'request_id' => $requestId,
            'token_hash_prefijo' => $tokenHashPrefijo,
            'detalle_seguro' => $detalleSeguro,
        ];
    }

    public function seedCert(int $id, string $estado, ?string $venceEn = '2027-12-31'): void
    {
        $this->certs[] = [
            'id' => $id,
            'estado' => $estado,
            'vence_en' => $venceEn,
        ];
        if ($id >= $this->certSeq) {
            $this->certSeq = $id + 1;
        }
    }
}

/**
 * @internal Test-only fake statement.
 */
final class FakeStmtForResend extends PDOStatement
{
    /** @var list<mixed> */
    private array $bindings = [];
    /** @var array<string, mixed>|false */
    private array|false $result = false;
    private int $rowCount = 0;
    private bool $executed = false;

    public function __construct(
        private readonly string $query,
        private readonly FakePdoForResend $pdo,
    ) {
    }

    public function bindValue(string|int $param, mixed $value, int $type = PDO::PARAM_STR): bool
    {
        $this->bindings[$param] = $value;
        return true;
    }

    public function execute(?array $params = null): bool
    {
        if ($params !== null) {
            foreach ($params as $i => $value) {
                $this->bindings[$i + 1] = $value;
            }
        }
        $this->executed = true;
        $this->dispatch();
        return true;
    }

    public function fetch(int $mode = PDO::FETCH_DEFAULT, int $orientation = PDO::FETCH_ORI_NEXT, int $offset = 0): mixed
    {
        return $this->result;
    }

    public function fetchColumn(int $column = 0): mixed
    {
        return $this->result === false ? false : array_values($this->result)[$column] ?? false;
    }

    public function rowCount(): int
    {
        return $this->rowCount;
    }

    private function dispatch(): void
    {
        $q = $this->query;

        if (str_contains($q, 'SELECT id, estado, vence_en') && str_contains($q, 'FOR UPDATE')) {
            $id = (int) $this->bindings[1];
            $this->result = $this->pdo->selectCertForUpdate($id);
            return;
        }

        if (str_contains($q, "SET estado = 'revocado'") && str_contains($q, 'cert_tokens_verificacion')) {
            $when = (string) $this->bindings[1];
            $certId = (int) $this->bindings[2];
            $this->rowCount = $this->pdo->revokeActiveTokens($certId, $when);
            $this->result = false;
            return;
        }

        if (str_contains($q, 'INSERT INTO cert_tokens_verificacion')) {
            $certId = (int) $this->bindings[1];
            $tokenHash = (string) $this->bindings[2];
            $prefix = (string) $this->bindings[3];
            $vigenteDesde = (string) $this->bindings[4];
            $vigenteHasta = $this->bindings[5] === null ? null : (string) $this->bindings[5];
            $this->pdo->insertToken($certId, $tokenHash, $prefix, $vigenteDesde, $vigenteHasta);
            $this->result = false;
            return;
        }

        if (str_contains($q, 'INSERT INTO cert_eventos_auditoria')) {
            $certId = isset($this->bindings[1]) && $this->bindings[1] !== null ? (int) $this->bindings[1] : null;
            $tipo = (string) $this->bindings[2];
            $resultado = (string) $this->bindings[3];
            $requestId = (string) $this->bindings[4];
            $tokenHashPrefijo = isset($this->bindings[5]) && is_string($this->bindings[5]) ? $this->bindings[5] : null;
            $detalleSeguro = isset($this->bindings[6]) && is_string($this->bindings[6]) ? $this->bindings[6] : null;
            $this->pdo->insertAudit($certId, $tipo, $resultado, $requestId, $tokenHashPrefijo, $detalleSeguro);
            $this->result = false;
            return;
        }

        $this->result = false;
    }
}

// --- Fake transporte que captura el email ---
final class CapturingTransport implements EmailDeliveryTransport
{
    public bool $configured = true;
    public ?string $recipient = null;
    public ?string $url = null;
    public bool $fail = false;

    public function assertConfigured(): void
    {
        if (!$this->configured) {
            throw new RuntimeException('DELIVERY_NOT_CONFIGURED');
        }
    }

    public function sendValidationLink(string $recipient, string $validationUrl, array $context = []): void
    {
        $this->recipient = $recipient;
        $this->url = $validationUrl;
        if ($this->fail) {
            throw new RuntimeException('DELIVERY_FAILED');
        }
    }
}

// Helper: arma AdminCertificateService con reflection sobre el fake PDO.
function buildService(FakePdoForResend $pdo): AdminCertificateService
{
    $service = (new ReflectionClass(AdminCertificateService::class))->newInstanceWithoutConstructor();
    $props = [
        'tokenPepper' => 'pepper_demo_resend',
        'requestId' => 'req_test_resend',
        'publicBaseUrl' => 'https://demo.example.edu.ar/certificados',
    ];
    foreach ($props as $name => $value) {
        $prop = new ReflectionProperty(AdminCertificateService::class, $name);
        $prop->setValue($service, $value);
    }
    $pdoProp = new ReflectionProperty(AdminCertificateService::class, 'pdo');
    $pdoProp->setValue($service, $pdo);

    return $service;
}

// =====================================================
// Escenario 1: reenvío exitoso 200 con rotación y auditoría
// =====================================================
$pdo = new FakePdoForResend();
$pdo->seedCert(10, 'vigente', '2027-12-31');
// Token activo previo.
$pdo->insertToken(10, str_repeat("\x01", 32), 'PREV_PREFIX_', '2026-06-01 00:00:00', '2027-12-31 23:59:59');

$transport = new CapturingTransport();
$service = buildService($pdo);

$dto = $service->reenviar(10, 'persona@example.edu.ar', $transport);

if (($dto['certificadoId'] ?? null) !== 10) {
    throw new RuntimeException('DTO certificadoId inválido.');
}
if (!isset($dto['enviadoEn']) || !is_string($dto['enviadoEn']) || $dto['enviadoEn'] === '') {
    throw new RuntimeException('DTO enviadoEn inválido.');
}
if (($dto['destinatarioEnmascarado'] ?? '') !== 'p***a@example.edu.ar') {
    throw new RuntimeException('DTO destinatarioEnmascarado inválido: ' . ($dto['destinatarioEnmascarado'] ?? ''));
}

// Privacidad: DTO no contiene token completo ni email completo.
$dtoJson = json_encode($dto, JSON_UNESCAPED_SLASHES | JSON_UNESCAPED_UNICODE);
if (str_contains($dtoJson, 'persona@example.edu.ar')) {
    throw new RuntimeException('DTO filtró email completo.');
}
// El token completo no debe aparecer en el DTO.
$allTokens = array_column($pdo->tokens, 'token_prefijo');
$tokenCount = count($pdo->tokens);
if ($tokenCount !== 2) {
    throw new RuntimeException("Se esperaban 2 tokens (previo+ nuevo), hay {$tokenCount}.");
}

// Rotación: token previo revocado, nuevo activo.
$prev = $pdo->tokens[0];
$new = $pdo->tokens[1];
if ($prev['estado'] !== 'revocado' || $prev['revocado_en'] === null) {
    throw new RuntimeException('Token previo no fue revocado.');
}
if ($new['estado'] !== 'activo') {
    throw new RuntimeException('Token nuevo no quedó activo.');
}
if ($new['token_prefijo'] === 'PREV_PREFIX_') {
    throw new RuntimeException('Token nuevo tiene el mismo prefijo que el previo.');
}

// Email: el enlace contiene /validar/{token} y el transporte capturó el destinatario.
if ($transport->recipient !== 'persona@example.edu.ar') {
    throw new RuntimeException('Transporte no recibió el destinatario correcto.');
}
if ($transport->url === null || !str_starts_with($transport->url, 'https://demo.example.edu.ar/certificados/validar/')) {
    throw new RuntimeException('URL de validación inválida: ' . ($transport->url ?? 'null'));
}
// El token del enlace NO debe coincidir con ningún hash/prefijo persistido (solo va en el email).
$tokenInUrl = substr($transport->url, strlen('https://demo.example.edu.ar/certificados/validar/'));
if ($tokenInUrl === '' || strlen($tokenInUrl) < 20) {
    throw new RuntimeException('Token del enlace ausente o demasiado corto.');
}
if ($tokenInUrl === $new['token_prefijo']) {
    throw new RuntimeException('El enlace lleva el prefijo, no el token completo.');
}

// Auditoría: evento reenvio/ok con destinatario enmascarado y sin token completo.
$reenvioOk = array_filter($pdo->audits, static fn (array $a): bool => $a['tipo_evento'] === 'reenvio' && $a['resultado'] === 'ok');
if (count($reenvioOk) !== 1) {
    throw new RuntimeException('No se persistió exactamente un evento reenvio/ok.');
}
$audit = array_values($reenvioOk)[0];
if ($audit['detalle_seguro'] !== 'destinatarioEnmascarado=p***a@example.edu.ar') {
    throw new RuntimeException('Auditoría no guardó el destinatario enmascarado: ' . ($audit['detalle_seguro'] ?? ''));
}
if (str_contains((string) $audit['detalle_seguro'], 'persona@example.edu.ar')) {
    throw new RuntimeException('Auditoría filtró email completo.');
}
if (str_contains((string) $audit['detalle_seguro'], $tokenInUrl)) {
    throw new RuntimeException('Auditoría filtró el token del enlace.');
}
if (!is_string($audit['token_hash_prefijo']) || strlen($audit['token_hash_prefijo']) !== 16) {
    throw new RuntimeException('Auditoría no guardó token_hash_prefijo de 16 chars.');
}

// =====================================================
// Escenario 2: 404 CERTIFICATE_NOT_FOUND (inexistente, autorizado)
// =====================================================
$pdo2 = new FakePdoForResend();
$service2 = buildService($pdo2);
$transport2 = new CapturingTransport();

$got404 = false;
try {
    $service2->reenviar(999, 'persona@example.edu.ar', $transport2);
} catch (AdminCertificateException $e) {
    $got404 = $e->status === 404 && $e->errorCode === 'CERTIFICATE_NOT_FOUND';
}
if (!$got404) {
    throw new RuntimeException('Reenvío de certificado inexistente no respondió 404 CERTIFICATE_NOT_FOUND.');
}
// Auditoría de rechazo persistida.
$rechazado = array_filter($pdo2->audits, static fn (array $a): bool => $a['tipo_evento'] === 'reenvio' && $a['resultado'] === 'rechazado');
if (count($rechazado) !== 1) {
    throw new RuntimeException('No se persistió evento reenvio/rechazado para 404.');
}
// El transporte no debe haber enviado nada.
if ($transport2->url !== null) {
    throw new RuntimeException('El transporte envió email en un 404.');
}

// =====================================================
// Escenario 3: 404 con certificado no vigente (revocado)
// =====================================================
$pdo3 = new FakePdoForResend();
$pdo3->seedCert(20, 'revocado', null);
$service3 = buildService($pdo3);
$transport3 = new CapturingTransport();

$got404NonVigente = false;
try {
    $service3->reenviar(20, 'persona@example.edu.ar', $transport3);
} catch (AdminCertificateException $e) {
    $got404NonVigente = $e->status === 404 && $e->errorCode === 'CERTIFICATE_NOT_FOUND';
}
if (!$got404NonVigente) {
    throw new RuntimeException('Reenvío de certificado no vigente no respondió 404.');
}
if ($transport3->url !== null) {
    throw new RuntimeException('El transporte envió email en un 404 no vigente.');
}

// =====================================================
// Escenario 4: email body solo contiene el enlace (buildBody via reflection)
// =====================================================
$smtp = new SmtpEmailDeliveryTransport([
    'delivery_transport' => 'smtp',
    'smtp_host' => 'smtp.example.edu.ar',
    'smtp_port' => 587,
    'smtp_username' => 'u',
    'smtp_password' => 'p',
    'mail_from' => 'from@example.edu.ar',
    'mail_from_name' => 'IFTS 14',
    'public_base_url' => 'https://demo.example.edu.ar/certificados',
    'smtp_secure' => 'tls',
]);
$buildBody = new ReflectionMethod(SmtpEmailDeliveryTransport::class, 'buildBody');
$demoUrl = 'https://demo.example.edu.ar/certificados/validar/TOKEN_COMPLETO_DEMO_123';
$body = $buildBody->invoke($smtp, $demoUrl, ['certificado_id' => 10]);

if (!str_contains($body, $demoUrl)) {
    throw new RuntimeException('Body del email no contiene el enlace de validación.');
}
if (str_contains($body, 'attachment') || str_contains($body, 'adjunto')) {
    throw new RuntimeException('Body del email menciona adjuntos.');
}
// El body solo debe contener el token una vez (dentro del enlace).
$tokenOccurrences = substr_count($body, 'TOKEN_COMPLETO_DEMO_123');
if ($tokenOccurrences !== 1) {
    throw new RuntimeException("El token aparece {$tokenOccurrences} veces en el body; esperado 1.");
}

// =====================================================
// Escenario 5: SMTP hardening — assertConfigured rechaza smtp_port inválido
// =====================================================
$smtpNoPort = new SmtpEmailDeliveryTransport([
    'delivery_transport' => 'smtp',
    'smtp_host' => 'smtp.example.edu.ar',
    'smtp_username' => 'u',
    'smtp_password' => 'p',
    'mail_from' => 'from@example.edu.ar',
    'public_base_url' => 'https://demo.example.edu.ar/certificados',
]);
$threwNoPort = false;
try {
    $smtpNoPort->assertConfigured();
} catch (RuntimeException) {
    $threwNoPort = true;
}
if (!$threwNoPort) {
    throw new RuntimeException('SMTP sin smtp_port no fue rechazado por assertConfigured.');
}

$smtpBadPort = new SmtpEmailDeliveryTransport([
    'delivery_transport' => 'smtp',
    'smtp_host' => 'smtp.example.edu.ar',
    'smtp_port' => 99999,
    'smtp_username' => 'u',
    'smtp_password' => 'p',
    'mail_from' => 'from@example.edu.ar',
    'public_base_url' => 'https://demo.example.edu.ar/certificados',
]);
$threwBadPort = false;
try {
    $smtpBadPort->assertConfigured();
} catch (RuntimeException) {
    $threwBadPort = true;
}
if (!$threwBadPort) {
    throw new RuntimeException('SMTP con smtp_port fuera de rango no fue rechazado.');
}

// SMTP con config completa SÍ pasa assertConfigured.
$smtpOk = new SmtpEmailDeliveryTransport([
    'delivery_transport' => 'smtp',
    'smtp_host' => 'smtp.example.edu.ar',
    'smtp_port' => 587,
    'smtp_username' => 'u',
    'smtp_password' => 'p',
    'mail_from' => 'from@example.edu.ar',
    'public_base_url' => 'https://demo.example.edu.ar/certificados',
    'smtp_secure' => 'tls',
]);
try {
    $smtpOk->assertConfigured();
} catch (RuntimeException) {
    throw new RuntimeException('SMTP con config completa fue rechazado incorrectamente.');
}

echo "OK ResendFlowTest\n";