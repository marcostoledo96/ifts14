<?php

declare(strict_types=1);

/**
 * RED/GREEN: seguridad firmas (rol inválido, traversal, replace fallido, DELETE).
 * Auth HTTP 401/403: InstitutionalSignatureHttpTest + AdminAuthorizationMatrixTest.
 * Ejecutar: php apps/backend-php/tests/InstitutionalSignatureSecurityTest.php
 */

require_once __DIR__ . '/../src/AdminCertificateService.php';
require_once __DIR__ . '/../src/AdminInstitutionalConfigService.php';
require_once __DIR__ . '/../src/InstitutionalConfig.php';
require_once __DIR__ . '/../src/SystemParameters.php';

final class FakePdoSigSec extends PDO
{
    /** @var array<string, mixed> */
    public array $row;

    public bool $failNextUpdate = false;

    public function __construct()
    {
        $this->row = [
            'institucion_nombre' => 'IFTS Test',
            'rector_nombre' => 'Rector',
            'rector_cargo' => 'Rector/a',
            'asesor_nombre' => 'Asesor',
            'asesor_cargo' => 'Asesor/a',
            'texto_certificado' => 'Texto',
            'updated_at' => '2026-07-01 00:00:00',
            'rector_firma_filename' => 'rector.png',
            'rector_firma_sha256' => str_repeat('a', 64),
            'asesor_firma_filename' => null,
            'asesor_firma_sha256' => null,
        ];
    }

    public function prepare(string $query, array $options = []): PDOStatement|false
    {
        return new FakeStmtSigSec($query, $this);
    }

    public function query(string $query, ?int $fetchMode = null, mixed ...$fetchModeArgs): PDOStatement|false
    {
        return new FakeStmtSigSec($query, $this);
    }
}

final class FakeStmtSigSec extends PDOStatement
{
    /** @var list<mixed> */
    private array $bindings = [];

    public function __construct(
        private readonly string $query,
        private readonly FakePdoSigSec $pdo,
    ) {
    }

    public function execute(?array $params = null): bool
    {
        if ($params !== null) {
            $this->bindings = array_values($params);
        }

        if ($this->pdo->failNextUpdate && str_starts_with(ltrim($this->query), 'UPDATE') && str_contains($this->query, 'firma')) {
            $this->pdo->failNextUpdate = false;
            throw new PDOException('simulated write failure');
        }

        if (str_starts_with(ltrim($this->query), 'UPDATE') && str_contains($this->query, 'firma')) {
            if (str_contains($this->query, 'rector_firma_filename') && str_contains($this->query, 'NULL')) {
                $this->pdo->row['rector_firma_filename'] = null;
                $this->pdo->row['rector_firma_sha256'] = null;
            } elseif (str_contains($this->query, 'asesor_firma_filename') && str_contains($this->query, 'NULL')) {
                $this->pdo->row['asesor_firma_filename'] = null;
                $this->pdo->row['asesor_firma_sha256'] = null;
            } elseif (str_contains($this->query, 'rector_firma_filename') && isset($this->bindings[0])) {
                $this->pdo->row['rector_firma_filename'] = $this->bindings[0];
                $this->pdo->row['rector_firma_sha256'] = $this->bindings[1] ?? null;
            } elseif (str_contains($this->query, 'asesor_firma_filename') && isset($this->bindings[0])) {
                $this->pdo->row['asesor_firma_filename'] = $this->bindings[0];
                $this->pdo->row['asesor_firma_sha256'] = $this->bindings[1] ?? null;
            }
        }

        return true;
    }

    public function fetch(int $mode = PDO::FETCH_DEFAULT, int $orientation = PDO::FETCH_ORI_NEXT, int $offset = 0): mixed
    {
        if (str_contains($this->query, 'AS filename')) {
            if (str_contains($this->query, 'asesor_firma_filename')) {
                return ['filename' => $this->pdo->row['asesor_firma_filename']];
            }

            return ['filename' => $this->pdo->row['rector_firma_filename']];
        }
        if (str_contains($this->query, 'FROM cert_configuracion_institucional')) {
            return $this->pdo->row;
        }

        return false;
    }

    public function fetchAll(int $mode = PDO::FETCH_DEFAULT, ...$args): array
    {
        return [];
    }

    public function rowCount(): int
    {
        return 1;
    }
}

function assertTrue(bool $cond, string $msg): void
{
    if (!$cond) {
        fwrite(STDERR, "FAIL: {$msg}\n");
        exit(1);
    }
    echo "OK: {$msg}\n";
}

function makePng(string $path, int $w = 200, int $h = 60): void
{
    $im = imagecreatetruecolor($w, $h);
    imagepng($im, $path);
    imagedestroy($im);
}

$storage = sys_get_temp_dir() . '/ifts14-firmas-sec-' . bin2hex(random_bytes(4));
mkdir($storage, 0700, true);

// Semilla: firma previa PNG
$prev = $storage . '/rector.png';
makePng($prev, 200, 60);
$prevHash = hash_file('sha256', $prev);

$pdo = new FakePdoSigSec();
$pdo->row['rector_firma_sha256'] = $prevHash;
$svc = new AdminInstitutionalConfigService($pdo, 'req_sec', $storage);

// Rol inválido
$threw = false;
try {
    $svc->uploadSignature('director', ['tmp_name' => $prev, 'error' => UPLOAD_ERR_OK, 'size' => filesize($prev)]);
} catch (AdminCertificateException $e) {
    $threw = $e->status === 400 && $e->errorCode === 'VALIDATION_ERROR';
}
assertTrue($threw, 'Rol inválido → 400 VALIDATION_ERROR');

// Traversal en basename interno (assertSafeBasename vía preview con filename manipulado)
$pdo->row['rector_firma_filename'] = '../etc/passwd';
$threw = false;
try {
    $svc->previewSignature('rector');
} catch (AdminCertificateException $e) {
    $threw = $e->status === 400 && $e->errorCode === 'VALIDATION_ERROR';
}
assertTrue($threw, 'Traversal en filename rechazado');
$pdo->row['rector_firma_filename'] = 'rector.png';

// Replace fallido (DB): conserva archivo previo
$pdo->failNextUpdate = true;
$newJpg = $storage . '/candidate.jpg';
$jpeg1x1 = base64_decode(
    '/9j/4AAQSkZJRgABAQEASABIAAD/2wBDAAEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQH/2wBDAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQH/wAARCAABAAEDAREAAhEBAxEB/8QAFAABAAAAAAAAAAAAAAAAAAAACv/EABQBAQAAAAAAAAAAAAAAAAAAAAD/xAAUAQEAAAAAAAAAAAAAAAAAAAAA/8QAFBEBAAAAAAAAAAAAAAAAAAAAAP/aAAwDAQACEAMQAAAABSf/xAAUEAEAAAAAAAAAAAAAAAAAAAAA/9oACAEBAAE/IL//xAAUEQEAAAAAAAAAAAAAAAAAAAAA/9oACAEDAQE/AX//xAAUEQEAAAAAAAAAAAAAAAAAAAAA/9oACAECAQE/AX//2Q==',
);
file_put_contents($newJpg, $jpeg1x1);

$threw = false;
try {
    $svc->uploadSignature('rector', ['tmp_name' => $newJpg, 'error' => UPLOAD_ERR_OK, 'size' => filesize($newJpg)]);
} catch (AdminCertificateException $e) {
    $threw = $e->status === 500 && $e->errorCode === 'CONFIGURATION_ERROR';
}
assertTrue($threw, 'Replace fallido → CONFIGURATION_ERROR');
assertTrue(is_file($prev), 'Replace fallido conserva firma PNG previa');
assertTrue($pdo->row['rector_firma_filename'] === 'rector.png', 'DB conserva basename previo');
assertTrue(!is_file($storage . '/rector.jpg'), 'Replace fallido no deja jpg huérfano');

// DELETE exitoso: flags false, archivo unlinked, metadatos NULL
$dto = $svc->deleteSignature('rector');
assertTrue(($dto['rectorSignaturePresent'] ?? true) === false, 'DELETE: rectorSignaturePresent false');
assertTrue(($dto['advisorSignaturePresent'] ?? true) === false, 'DELETE: advisorSignaturePresent false');
assertTrue(!is_file($prev), 'DELETE: archivo rector.png unlinked');
assertTrue($pdo->row['rector_firma_filename'] === null, 'DELETE: rector_firma_filename NULL');
assertTrue($pdo->row['rector_firma_sha256'] === null, 'DELETE: rector_firma_sha256 NULL');

// Smoke: Service sin storage path falla cerrado.
$pdo->row['rector_firma_filename'] = 'rector.png';
$pdo->row['rector_firma_sha256'] = $prevHash;
makePng($prev, 200, 60);
$svcNoPath = new AdminInstitutionalConfigService($pdo, 'req_sec', null);
$threw = false;
try {
    $svcNoPath->deleteSignature('rector');
} catch (AdminCertificateException $e) {
    $threw = $e->status === 500 && $e->errorCode === 'CONFIGURATION_ERROR';
}
assertTrue($threw, 'Sin signature_storage_path → CONFIGURATION_ERROR');
assertTrue(is_file($prev), 'Sin storage path no borra archivo');

foreach (glob($storage . '/*') ?: [] as $f) {
    @unlink($f);
}
@rmdir($storage);

echo "InstitutionalSignatureSecurityTest: PASS\n";
exit(0);
