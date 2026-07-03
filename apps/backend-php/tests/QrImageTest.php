<?php

declare(strict_types=1);

require_once __DIR__ . '/../src/TokenCipher.php';
require_once __DIR__ . '/../src/AdminCertificateService.php';
require_once __DIR__ . '/../vendor/autoload.php';
require_once __DIR__ . '/../src/CertificateQrImageService.php';

final class FakePdoForQr extends PDO
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

    public function prepare(string $query, array $options = []): PDOStatement|false
    {
        return new FakeStmtForQr($query, $this);
    }

    public function seedCert(int $id, string $estado = 'vigente', ?string $venceEn = '2027-12-31', ?string $revocadoEn = null, string $codigo = 'CERT-2026-DEMO'): void
    {
        $this->certs[] = [
            'id' => $id,
            'estado' => $estado,
            'vence_en' => $venceEn,
            'revocado_en' => $revocadoEn,
            'codigo_certificado' => $codigo,
        ];
    }

    public function seedToken(int $certId, string $prefix, ?string $tokenCipher): void
    {
        $this->tokens[] = [
            'certificado_id' => $certId,
            'token_prefijo' => $prefix,
            'token_cifrado' => $tokenCipher,
            'estado' => 'activo',
            'revocado_en' => null,
            'vigente_desde' => date('Y-m-d H:i:s', strtotime('-1 hour')),
            'vigente_hasta' => null,
        ];
    }

    /** @return array<string, mixed>|false */
    public function selectCertWithToken(int $id): array|false
    {
        foreach ($this->certs as $cert) {
            if ((int) $cert['id'] !== $id) {
                continue;
            }

            $tokenPrefix = '';
            $tokenCipher = null;
            foreach ($this->tokens as $token) {
                if ((int) $token['certificado_id'] === $id) {
                    $tokenPrefix = (string) $token['token_prefijo'];
                    $tokenCipher = $token['token_cifrado'];
                    break;
                }
            }

            return [
                'id' => $cert['id'],
                'estado' => $cert['estado'],
                'vence_en_vigente' => ($cert['vence_en'] === null || (string) $cert['vence_en'] >= date('Y-m-d')) ? 1 : 0,
                'cert_revocado_en' => $cert['revocado_en'],
                'codigo_certificado' => $cert['codigo_certificado'],
                'token_prefijo' => $tokenPrefix,
                'token_cifrado' => $tokenCipher,
            ];
        }

        return false;
    }
}

final class FakeStmtForQr extends PDOStatement
{
    /** @var list<mixed> */
    private array $bindings = [];
    /** @var array<string, mixed>|false */
    private array|false $result = false;

    public function __construct(
        private readonly string $query,
        private readonly FakePdoForQr $pdo,
    ) {
    }

    public function execute(?array $params = null): bool
    {
        if ($params !== null) {
            foreach ($params as $i => $value) {
                $this->bindings[$i + 1] = $value;
            }
        }

        $this->result = str_contains($this->query, 'SELECT c.id, c.estado')
            ? $this->pdo->selectCertWithToken((int) $this->bindings[1])
            : false;

        return true;
    }

    public function fetch(int $mode = PDO::FETCH_DEFAULT, int $orientation = PDO::FETCH_ORI_NEXT, int $offset = 0): mixed
    {
        return $this->result;
    }
}

function buildQrManualService(FakePdoForQr $pdo, string $cipherKey): AdminCertificateService
{
    $service = (new ReflectionClass(AdminCertificateService::class))->newInstanceWithoutConstructor();
    foreach ([
        'tokenPepper' => 'pepper_demo_qr',
        'requestId' => 'req_test_qr',
        'publicBaseUrl' => 'https://demo.example.edu.ar/certificados',
        'tokenCipherKey' => $cipherKey,
        'pdfStoragePath' => sys_get_temp_dir(),
    ] as $name => $value) {
        (new ReflectionProperty(AdminCertificateService::class, $name))->setValue($service, $value);
    }
    (new ReflectionProperty(AdminCertificateService::class, 'pdo'))->setValue($service, $pdo);

    return $service;
}

$validKey = str_repeat('q', 32);
$demoToken = 'TOKEN_DEMO_QR_2026';
$tokenCipher = TokenCipher::encrypt($demoToken, $validKey);

$pdo = new FakePdoForQr();
$pdo->seedCert(10, 'vigente', '2027-12-31', null, "CERT;2026\nDEMO");
$pdo->seedToken(10, 'QR_PREFIX_', $tokenCipher);
$tokensBefore = $pdo->tokens;
$service = buildQrManualService($pdo, $validKey);
$data = $service->deliveryTokenData(10);

if (($data['certificateCode'] ?? '') !== "CERT;2026\nDEMO") {
    throw new RuntimeException('Código de certificado QR inválido.');
}
if (($data['tokenPrefix'] ?? '') !== 'QR_PREFIX_') {
    throw new RuntimeException('Token prefix QR inválido.');
}
if (!str_ends_with((string) $data['publicValidationUrl'], $demoToken)) {
    throw new RuntimeException('La URL pública QR no usa el token permanente.');
}

$safeFilename = (preg_replace('/[^A-Za-z0-9_-]/', '_', (string) $data['certificateCode']) ?? '') . '-qr.png';
if ($safeFilename !== 'CERT_2026_DEMO-qr.png') {
    throw new RuntimeException('Filename QR no fue sanitizado.');
}

if (function_exists('imagecreate')) {
    $png = (new CertificateQrImageService())->render((string) $data['publicValidationUrl']);
    if (!str_starts_with($png, "\x89PNG\r\n\x1a\n") || strlen($png) === 0) {
        throw new RuntimeException('QR PNG inválido.');
    }
} else {
    echo "SKIP QrImageTest PNG runtime: gd no disponible\n";
}

$gotRenderFailure = false;
try {
    (new CertificateQrImageService())->render('');
} catch (RuntimeException) {
    $gotRenderFailure = true;
}
if (!$gotRenderFailure) {
    throw new RuntimeException('CertificateQrImageService no falló cerrado con URL vacía.');
}

if ($pdo->inTx || count($pdo->audits) !== 0 || $pdo->tokens !== $tokensBefore) {
    throw new RuntimeException('La descarga QR mutó estado/auditoría/token.');
}
if (is_file(sys_get_temp_dir() . '/' . $safeFilename)) {
    throw new RuntimeException('La descarga QR persistió un PNG en disco.');
}

$pdoMissing = new FakePdoForQr();
$serviceMissing = buildQrManualService($pdoMissing, $validKey);
$got404 = false;
try {
    $serviceMissing->deliveryTokenData(999);
} catch (AdminCertificateException $exception) {
    $got404 = $exception->status === 404 && $exception->errorCode === 'CERTIFICATE_NOT_FOUND';
}
if (!$got404) {
    throw new RuntimeException('QR inexistente no respondió 404.');
}

$pdoRevoked = new FakePdoForQr();
$pdoRevoked->seedCert(30, 'revocado');
$pdoRevoked->seedToken(30, 'REVOKED_', $tokenCipher);
$serviceRevoked = buildQrManualService($pdoRevoked, $validKey);
$got404Revoked = false;
try {
    $serviceRevoked->deliveryTokenData(30);
} catch (AdminCertificateException $exception) {
    $got404Revoked = $exception->status === 404 && $exception->errorCode === 'CERTIFICATE_NOT_FOUND';
}
if (!$got404Revoked) {
    throw new RuntimeException('QR revocado no respondió 404.');
}

$pdoLegacy = new FakePdoForQr();
$pdoLegacy->seedCert(20);
$pdoLegacy->seedToken(20, 'LEGACY_', null);
$serviceLegacy = buildQrManualService($pdoLegacy, $validKey);
$got409 = false;
try {
    $serviceLegacy->deliveryTokenData(20);
} catch (AdminCertificateException $exception) {
    $got409 = $exception->status === 409 && $exception->errorCode === 'TOKEN_NOT_RECOVERABLE';
}
if (!$got409) {
    throw new RuntimeException('QR con token no recuperable no respondió 409.');
}

$serviceWrongKey = buildQrManualService($pdo, str_repeat('x', 32));
$got409WrongKey = false;
try {
    $serviceWrongKey->deliveryTokenData(10);
} catch (AdminCertificateException $exception) {
    $got409WrongKey = $exception->status === 409 && $exception->errorCode === 'TOKEN_NOT_RECOVERABLE';
}
if (!$got409WrongKey) {
    throw new RuntimeException('QR con clave inválida no respondió 409.');
}

echo "OK QrImageTest\n";
