<?php

declare(strict_types=1);

/**
 * Cobertura runtime de la entrega manual de certificados sobre un fake PDO.
 *
 * Cubre:
 *  - 200 exitoso: DTO {certificadoId, publicValidationUrl, pdfDownloadUrl, tokenPrefix}
 *    sin token completo como campo separado; sin escritura/rotación.
 *  - 409 TOKEN_NOT_RECOVERABLE: token_cifrado ausente, envelope inválido,
 *    clave inválida, descifrado fallido.
 *  - 404 CERTIFICATE_NOT_FOUND: inexistente y no vigente.
 *  - 400 VALIDATION_ERROR: id no numérico.
 *  - Privacidad: el DTO no contiene el token completo fuera de la URL.
 */

require_once __DIR__ . '/../src/TokenCipher.php';
require_once __DIR__ . '/../src/AdminCertificateService.php';

// --- Fake PDO en memoria para entrega manual ---
final class FakePdoForManual extends PDO
{
    /** @var array<int, array<string, mixed>> */
    public array $certs = [];
    /** @var array<int, array<string, mixed>> */
    public array $tokens = [];
    /** @var array<int, array<string, mixed>> */
    public array $audits = [];
    public bool $inTx = false;

    public function __construct()
    {
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
        return new FakeStmtForManual($query, $this);
    }

    public function seedCert(int $id, string $estado, ?string $venceEn = '2027-12-31'): void
    {
        $this->certs[] = ['id' => $id, 'estado' => $estado, 'vence_en' => $venceEn];
    }

    public function seedToken(int $certId, string $prefix, ?string $tokenCipher): void
    {
        $this->tokens[] = [
            'certificado_id' => $certId,
            'token_prefijo' => $prefix,
            'token_cifrado' => $tokenCipher,
            'estado' => 'activo',
        ];
    }

    /** @return array<string, mixed>|false */
    public function selectCertWithToken(int $id): array|false
    {
        foreach ($this->certs as $cert) {
            if ((int) $cert['id'] === $id) {
                $vigente = $cert['vence_en'] === null || (string) $cert['vence_en'] >= date('Y-m-d');
                $tokenCipher = null;
                $tokenPrefix = '';
                foreach ($this->tokens as $tok) {
                    if ((int) $tok['certificado_id'] === $id && $tok['estado'] === 'activo') {
                        $tokenCipher = $tok['token_cifrado'];
                        $tokenPrefix = (string) $tok['token_prefijo'];
                        break;
                    }
                }
                return [
                    'id' => $cert['id'],
                    'estado' => $cert['estado'],
                    'vence_en' => $cert['vence_en'],
                    'vence_en_vigente' => $vigente ? 1 : 0,
                    'token_prefijo' => $tokenPrefix,
                    'token_cifrado' => $tokenCipher,
                ];
            }
        }
        return false;
    }
}

final class FakeStmtForManual extends PDOStatement
{
    /** @var list<mixed> */
    private array $bindings = [];
    /** @var array<string, mixed>|false */
    private array|false $result = false;

    public function __construct(
        private readonly string $query,
        private readonly FakePdoForManual $pdo,
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

    private function dispatch(): void
    {
        if (str_contains($this->query, 'SELECT c.id, c.estado')) {
            $id = (int) $this->bindings[1];
            $this->result = $this->pdo->selectCertWithToken($id);
            return;
        }

        $this->result = false;
    }
}

// --- Helper: arma AdminCertificateService con reflection sobre el fake PDO ---
function buildManualService(FakePdoForManual $pdo, string $cipherKey): AdminCertificateService
{
    $service = (new ReflectionClass(AdminCertificateService::class))->newInstanceWithoutConstructor();
    $props = [
        'tokenPepper' => 'pepper_demo_manual',
        'requestId' => 'req_test_manual',
        'publicBaseUrl' => 'https://demo.example.edu.ar/certificados',
        'tokenCipherKey' => $cipherKey,
    ];
    foreach ($props as $name => $value) {
        $prop = new ReflectionProperty(AdminCertificateService::class, $name);
        $prop->setValue($service, $value);
    }
    $pdoProp = new ReflectionProperty(AdminCertificateService::class, 'pdo');
    $pdoProp->setValue($service, $pdo);

    return $service;
}

// Clave de 32 bytes para los tests.
$validKey = str_repeat('k', 32);

// =====================================================
// Escenario 1: entrega manual exitosa 200
// =====================================================
$pdo = new FakePdoForManual();
$pdo->seedCert(10, 'vigente', '2027-12-31');
$demoToken = 'TOKEN_DEMO_ENTREGA_MANUAL_2026';
$tokenCipher = TokenCipher::encrypt($demoToken, $validKey);
$pdo->seedToken(10, 'PREV_PREFIX_', $tokenCipher);

$service = buildManualService($pdo, $validKey);
$dto = $service->entregaManual(10);

if (($dto['certificadoId'] ?? null) !== 10) {
    throw new RuntimeException('DTO certificadoId inválido.');
}
if (($dto['tokenPrefix'] ?? '') !== 'PREV_PREFIX_') {
    throw new RuntimeException('DTO tokenPrefix inválido: ' . ($dto['tokenPrefix'] ?? ''));
}
if (!isset($dto['publicValidationUrl']) || !str_starts_with($dto['publicValidationUrl'], 'https://demo.example.edu.ar/certificados/validar/')) {
    throw new RuntimeException('DTO publicValidationUrl inválido: ' . ($dto['publicValidationUrl'] ?? 'null'));
}
if (!str_ends_with($dto['publicValidationUrl'], $demoToken)) {
    throw new RuntimeException('publicValidationUrl no contiene el token descifrado.');
}
if (!isset($dto['pdfDownloadUrl']) || !str_contains($dto['pdfDownloadUrl'], '/api/admin/certificados/10/pdf')) {
    throw new RuntimeException('DTO pdfDownloadUrl inválido: ' . ($dto['pdfDownloadUrl'] ?? 'null'));
}

// Privacidad: el token completo NO aparece como campo separado, solo dentro de la URL.
$dtoJson = json_encode($dto, JSON_UNESCAPED_SLASHES | JSON_UNESCAPED_UNICODE);
if (substr_count($dtoJson, $demoToken) !== 1) {
    throw new RuntimeException('El token aparece más de una vez en el DTO (debe ir solo en la URL).');
}

// Sin escritura: no se abrió transacción, no se insertó auditoría.
if ($pdo->inTx) {
    throw new RuntimeException('entregaManual abrió transacción (debe ser solo lectura).');
}
if (count($pdo->audits) !== 0) {
    throw new RuntimeException('entregaManual insertó auditoría (spec: sin escritura).');
}

// =====================================================
// Escenario 2: 409 TOKEN_NOT_RECOVERABLE — token_cifrado ausente
// =====================================================
$pdo2 = new FakePdoForManual();
$pdo2->seedCert(20, 'vigente', '2027-12-31');
$pdo2->seedToken(20, 'OLD_PREFIX_', null); // certificado viejo sin token_cifrado

$service2 = buildManualService($pdo2, $validKey);
$got409 = false;
try {
    $service2->entregaManual(20);
} catch (AdminCertificateException $e) {
    $got409 = $e->status === 409 && $e->errorCode === 'TOKEN_NOT_RECOVERABLE';
}
if (!$got409) {
    throw new RuntimeException('Certificado sin token_cifrado no respondió 409 TOKEN_NOT_RECOVERABLE.');
}

// =====================================================
// Escenario 3: 409 TOKEN_NOT_RECOVERABLE — envelope inválido
// =====================================================
$pdo3 = new FakePdoForManual();
$pdo3->seedCert(30, 'vigente', '2027-12-31');
$pdo3->seedToken(30, 'BAD_PREFIX_', 'no-es-un-envelope-valido');

$service3 = buildManualService($pdo3, $validKey);
$got409Bad = false;
try {
    $service3->entregaManual(30);
} catch (AdminCertificateException $e) {
    $got409Bad = $e->status === 409 && $e->errorCode === 'TOKEN_NOT_RECOVERABLE';
}
if (!$got409Bad) {
    throw new RuntimeException('Envelope inválido no respondió 409 TOKEN_NOT_RECOVERABLE.');
}

// =====================================================
// Escenario 4: 409 TOKEN_NOT_RECOVERABLE — clave inválida (descifrado fallido)
// =====================================================
$pdo4 = new FakePdoForManual();
$pdo4->seedCert(40, 'vigente', '2027-12-31');
$pdo4->seedToken(40, 'KEY_PREFIX_', $tokenCipher); // cifrado con $validKey

$wrongKey = str_repeat('x', 32);
$service4 = buildManualService($pdo4, $wrongKey);
$got409Key = false;
try {
    $service4->entregaManual(40);
} catch (AdminCertificateException $e) {
    $got409Key = $e->status === 409 && $e->errorCode === 'TOKEN_NOT_RECOVERABLE';
}
if (!$got409Key) {
    throw new RuntimeException('Descifrado con clave incorrecta no respondió 409 TOKEN_NOT_RECOVERABLE.');
}

// =====================================================
// Escenario 5: 409 TOKEN_NOT_RECOVERABLE — clave ausente (servicio sin key)
// =====================================================
$pdo5 = new FakePdoForManual();
$pdo5->seedCert(50, 'vigente', '2027-12-31');
$pdo5->seedToken(50, 'NO_KEY_PREFIX_', $tokenCipher);

$serviceNoKey = (new ReflectionClass(AdminCertificateService::class))->newInstanceWithoutConstructor();
$propsNoKey = [
    'tokenPepper' => 'pepper_demo',
    'requestId' => 'req_test',
    'publicBaseUrl' => 'https://demo.example.edu.ar/certificados',
    'tokenCipherKey' => null,
];
foreach ($propsNoKey as $name => $value) {
    $prop = new ReflectionProperty(AdminCertificateService::class, $name);
    $prop->setValue($serviceNoKey, $value);
}
$pdoPropNoKey = new ReflectionProperty(AdminCertificateService::class, 'pdo');
$pdoPropNoKey->setValue($serviceNoKey, $pdo5);

$got409NoKey = false;
try {
    $serviceNoKey->entregaManual(50);
} catch (AdminCertificateException $e) {
    $got409NoKey = $e->status === 409 && $e->errorCode === 'TOKEN_NOT_RECOVERABLE';
}
if (!$got409NoKey) {
    throw new RuntimeException('Servicio sin clave no respondió 409 TOKEN_NOT_RECOVERABLE.');
}

// =====================================================
// Escenario 6: 404 CERTIFICATE_NOT_FOUND — inexistente
// =====================================================
$pdo6 = new FakePdoForManual();
$service6 = buildManualService($pdo6, $validKey);
$got404 = false;
try {
    $service6->entregaManual(999);
} catch (AdminCertificateException $e) {
    $got404 = $e->status === 404 && $e->errorCode === 'CERTIFICATE_NOT_FOUND';
}
if (!$got404) {
    throw new RuntimeException('Certificado inexistente no respondió 404 CERTIFICATE_NOT_FOUND.');
}

// =====================================================
// Escenario 7: 404 CERTIFICATE_NOT_FOUND — no vigente (revocado)
// =====================================================
$pdo7 = new FakePdoForManual();
$pdo7->seedCert(70, 'revocado', null);
$service7 = buildManualService($pdo7, $validKey);
$got404Revoked = false;
try {
    $service7->entregaManual(70);
} catch (AdminCertificateException $e) {
    $got404Revoked = $e->status === 404 && $e->errorCode === 'CERTIFICATE_NOT_FOUND';
}
if (!$got404Revoked) {
    throw new RuntimeException('Certificado revocado no respondió 404.');
}

// =====================================================
// Escenario 8: 400 VALIDATION_ERROR — id no numérico
// =====================================================
$pdo8 = new FakePdoForManual();
$service8 = buildManualService($pdo8, $validKey);
$got400 = false;
try {
    $service8->entregaManual('abc');
} catch (AdminCertificateException $e) {
    $got400 = $e->status === 400 && $e->errorCode === 'VALIDATION_ERROR';
}
if (!$got400) {
    throw new RuntimeException('id no numérico no respondió 400 VALIDATION_ERROR.');
}

// =====================================================
// Escenario 9: 404 CERTIFICATE_NOT_FOUND — vigente pero vencido
// =====================================================
$pdo9 = new FakePdoForManual();
$pdo9->seedCert(90, 'vigente', '2000-01-01');
$pdo9->seedToken(90, 'EXPIRED_PREFIX_', $tokenCipher);
$service9 = buildManualService($pdo9, $validKey);
$got404Expired = false;
try {
    $service9->entregaManual(90);
} catch (AdminCertificateException $e) {
    $got404Expired = $e->status === 404 && $e->errorCode === 'CERTIFICATE_NOT_FOUND';
}
if (!$got404Expired) {
    throw new RuntimeException('Certificado vencido no respondió 404.');
}

echo "OK EntregaManualTest\n";

// =====================================================
// Escenario 10: TokenCipher::decrypt fail-closed — IV malformado (longitud != 12)
// =====================================================
$ivKey = str_repeat('k', 32);
$goodEnvelope = TokenCipher::encrypt('TOKEN_OK', $ivKey);
$ivParts = explode('.', $goodEnvelope);

// IV de 11 bytes (uno menos de lo esperado).
$shortIv = self_b64url(str_repeat("\x00", 11));
$ivParts[1] = $shortIv;
$malformedIvShort = implode('.', $ivParts);
$gotBadIvShort = false;
try {
    TokenCipher::decrypt($malformedIvShort, $ivKey);
} catch (RuntimeException $e) {
    $gotBadIvShort = str_contains($e->getMessage(), 'envelope invalid') || str_contains($e->getMessage(), 'decrypt failed');
}
if (!$gotBadIvShort) {
    throw new RuntimeException('IV de 11 bytes no fue rechazado por decrypt (fail-closed).');
}

// IV de 13 bytes (uno más de lo esperado).
$ivParts2 = explode('.', $goodEnvelope);
$ivParts2[1] = self_b64url(str_repeat("\x00", 13));
$malformedIvLong = implode('.', $ivParts2);
$gotBadIvLong = false;
try {
    TokenCipher::decrypt($malformedIvLong, $ivKey);
} catch (RuntimeException $e) {
    $gotBadIvLong = str_contains($e->getMessage(), 'envelope invalid') || str_contains($e->getMessage(), 'decrypt failed');
}
if (!$gotBadIvLong) {
    throw new RuntimeException('IV de 13 bytes no fue rechazado por decrypt (fail-closed).');
}

// =====================================================
// Escenario 11: TokenCipher::decrypt fail-closed — tag malformado (longitud != 16)
// =====================================================
$tagParts = explode('.', $goodEnvelope);

// Tag de 15 bytes.
$tagParts[2] = self_b64url(str_repeat("\x00", 15));
$malformedTagShort = implode('.', $tagParts);
$gotBadTagShort = false;
try {
    TokenCipher::decrypt($malformedTagShort, $ivKey);
} catch (RuntimeException $e) {
    $gotBadTagShort = str_contains($e->getMessage(), 'envelope invalid') || str_contains($e->getMessage(), 'decrypt failed');
}
if (!$gotBadTagShort) {
    throw new RuntimeException('Tag de 15 bytes no fue rechazado por decrypt (fail-closed).');
}

// Tag de 17 bytes.
$tagParts2 = explode('.', $goodEnvelope);
$tagParts2[2] = self_b64url(str_repeat("\x00", 17));
$malformedTagLong = implode('.', $tagParts2);
$gotBadTagLong = false;
try {
    TokenCipher::decrypt($malformedTagLong, $ivKey);
} catch (RuntimeException $e) {
    $gotBadTagLong = str_contains($e->getMessage(), 'envelope invalid') || str_contains($e->getMessage(), 'decrypt failed');
}
if (!$gotBadTagLong) {
    throw new RuntimeException('Tag de 17 bytes no fue rechazado por decrypt (fail-closed).');
}

// =====================================================
// Escenario 12: TokenCipher::decrypt fail-closed — clave de longitud incorrecta
// =====================================================
$gotBadKey = false;
try {
    TokenCipher::decrypt($goodEnvelope, str_repeat('k', 31));
} catch (RuntimeException $e) {
    $gotBadKey = str_contains($e->getMessage(), 'key invalid');
}
if (!$gotBadKey) {
    throw new RuntimeException('Clave de 31 bytes no fue rechazada por decrypt (fail-closed).');
}

// =====================================================
// Escenario 13: TokenCipher::decrypt fail-closed — envelope con partes != 4
// =====================================================
$gotBadParts = false;
try {
    TokenCipher::decrypt('v1.' . self_b64url(str_repeat("\x00", 12)), $ivKey);
} catch (RuntimeException $e) {
    $gotBadParts = str_contains($e->getMessage(), 'envelope invalid');
}
if (!$gotBadParts) {
    throw new RuntimeException('Envelope con 2 partes no fue rechazado (fail-closed).');
}

// =====================================================
// Escenario 14: TokenCipher::decrypt fail-closed — versión incorrecta
// =====================================================
$exp = explode('.', $goodEnvelope);
$badVersion = 'v2.' . $exp[1] . '.' . $exp[2] . '.' . $exp[3];
$gotBadVersion = false;
try {
    TokenCipher::decrypt($badVersion, $ivKey);
} catch (RuntimeException $e) {
    $gotBadVersion = str_contains($e->getMessage(), 'envelope invalid');
}
if (!$gotBadVersion) {
    throw new RuntimeException('Envelope con versión v2 no fue rechazado (fail-closed).');
}

// =====================================================
// Escenario 15: TokenCipher::decrypt — envelope válido descifra correctamente
// =====================================================
$roundTrip = TokenCipher::decrypt($goodEnvelope, $ivKey);
if ($roundTrip !== 'TOKEN_OK') {
    throw new RuntimeException('Envelope válido no descifró al token original: ' . var_export($roundTrip, true));
}

echo "OK TokenCipher fail-closed + round-trip\n";

// --- Helpers locales para los tests de cifrado ---
function self_b64url(string $binary): string
{
    return rtrim(strtr(base64_encode($binary), '+/', '-_'), '=');
}