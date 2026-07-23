<?php

declare(strict_types=1);

/**
 * RED/GREEN: validación de firmas institucionales (MIME, tamaño, dimensiones).
 * Ejecutar: php apps/backend-php/tests/InstitutionalSignatureValidationTest.php
 */

require_once __DIR__ . '/../src/AdminCertificateService.php';
require_once __DIR__ . '/../src/AdminInstitutionalConfigService.php';
require_once __DIR__ . '/../src/InstitutionalConfig.php';
require_once __DIR__ . '/../src/SystemParameters.php';

final class FakePdoSignatures extends PDO
{
    /** @var array<string, mixed> */
    public array $row = [
        'institucion_nombre' => 'IFTS Test',
        'rector_nombre' => 'Rector',
        'rector_cargo' => 'Rector/a',
        'asesor_nombre' => 'Asesor',
        'asesor_cargo' => 'Asesor/a',
        'texto_certificado' => 'Texto',
        'updated_at' => '2026-07-01 00:00:00',
        'rector_firma_filename' => null,
        'rector_firma_sha256' => null,
        'asesor_firma_filename' => null,
        'asesor_firma_sha256' => null,
    ];

    /** @var list<string> */
    public array $writes = [];

    public function __construct()
    {
    }

    public function beginTransaction(): bool
    {
        return true;
    }

    public function commit(): bool
    {
        return true;
    }

    public function rollBack(): bool
    {
        return true;
    }

    public function inTransaction(): bool
    {
        return false;
    }

    public function prepare(string $query, array $options = []): PDOStatement|false
    {
        return new FakeStmtSignatures($query, $this);
    }

    public function query(string $query, ?int $fetchMode = null, mixed ...$fetchModeArgs): PDOStatement|false
    {
        return new FakeStmtSignatures($query, $this);
    }
}

final class FakeStmtSignatures extends PDOStatement
{
    /** @var list<mixed> */
    private array $bindings = [];

    public function __construct(
        private readonly string $query,
        private readonly FakePdoSignatures $pdo,
    ) {
    }

    public function execute(?array $params = null): bool
    {
        if ($params !== null) {
            $this->bindings = array_values($params);
        }

        if (str_starts_with(ltrim($this->query), 'UPDATE') && str_contains($this->query, 'firma')) {
            $this->pdo->writes[] = $this->query;
            if (str_contains($this->query, 'rector_firma_filename') && isset($this->bindings[0])) {
                $this->pdo->row['rector_firma_filename'] = $this->bindings[0];
                $this->pdo->row['rector_firma_sha256'] = $this->bindings[1] ?? null;
            }
            if (str_contains($this->query, 'asesor_firma_filename') && isset($this->bindings[0])) {
                $this->pdo->row['asesor_firma_filename'] = $this->bindings[0];
                $this->pdo->row['asesor_firma_sha256'] = $this->bindings[1] ?? null;
            }
        }

        return true;
    }

    public function fetch(int $mode = PDO::FETCH_DEFAULT, int $orientation = PDO::FETCH_ORI_NEXT, int $offset = 0): mixed
    {
        if (str_contains($this->query, 'FROM cert_configuracion_institucional')) {
            if (str_contains($this->query, 'AS filename')) {
                if (str_contains($this->query, 'rector_firma_filename')) {
                    return ['filename' => $this->pdo->row['rector_firma_filename']];
                }
                if (str_contains($this->query, 'asesor_firma_filename')) {
                    return ['filename' => $this->pdo->row['asesor_firma_filename']];
                }
            }

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

function makePng(string $path, int $w, int $h): void
{
    $im = imagecreatetruecolor($w, $h);
    $white = imagecolorallocate($im, 255, 255, 255);
    imagefill($im, 0, 0, $white);
    imagepng($im, $path);
    imagedestroy($im);
}

function makeJpeg(string $path, int $w, int $h): void
{
    // Sin imagejpeg en la imagen Docker: JPEG 1×1 válido (dims dentro del límite).
    unset($w, $h);
    $jpeg1x1 = base64_decode(
        '/9j/4AAQSkZJRgABAQEASABIAAD/2wBDAAEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQH/2wBDAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQH/wAARCAABAAEDAREAAhEBAxEB/8QAFAABAAAAAAAAAAAAAAAAAAAACv/EABQBAQAAAAAAAAAAAAAAAAAAAAD/xAAUAQEAAAAAAAAAAAAAAAAAAAAA/8QAFBEBAAAAAAAAAAAAAAAAAAAAAP/aAAwDAQACEAMQAAAABSf/xAAUEAEAAAAAAAAAAAAAAAAAAAAA/9oACAEBAAE/IL//xAAUEQEAAAAAAAAAAAAAAAAAAAAA/9oACAEDAQE/AX//xAAUEQEAAAAAAAAAAAAAAAAAAAAA/9oACAECAQE/AX//2Q==',
    );
    if (!is_string($jpeg1x1) || $jpeg1x1 === '') {
        throw new RuntimeException('JPEG fixture missing');
    }
    file_put_contents($path, $jpeg1x1);
}

$storage = sys_get_temp_dir() . '/ifts14-firmas-val-' . bin2hex(random_bytes(4));
mkdir($storage, 0700, true);

$pdo = new FakePdoSignatures();
$svc = new AdminInstitutionalConfigService($pdo, 'req_test', $storage);

// SVG / MIME inválido
$svg = $storage . '/bad.svg';
file_put_contents($svg, '<svg xmlns="http://www.w3.org/2000/svg"><rect width="10" height="10"/></svg>');
$threw = false;
try {
    $svc->uploadSignature('rector', ['tmp_name' => $svg, 'error' => UPLOAD_ERR_OK, 'size' => filesize($svg)]);
} catch (AdminCertificateException $e) {
    $threw = $e->status === 400 && $e->errorCode === 'VALIDATION_ERROR';
}
assertTrue($threw, 'SVG rechazado con 400 VALIDATION_ERROR');
assertTrue($pdo->row['rector_firma_filename'] === null, 'SVG no persistió metadatos');
assertTrue(!is_file($storage . '/rector.png') && !is_file($storage . '/rector.jpg'), 'SVG no dejó archivo');

// > 1 MB
$big = $storage . '/big.png';
makePng($big, 10, 10);
$fh = fopen($big, 'ab');
fwrite($fh, str_repeat('A', 1_048_576));
fclose($fh);
$threw = false;
try {
    $svc->uploadSignature('rector', ['tmp_name' => $big, 'error' => UPLOAD_ERR_OK, 'size' => filesize($big)]);
} catch (AdminCertificateException $e) {
    $threw = $e->status === 400 && $e->errorCode === 'VALIDATION_ERROR';
}
assertTrue($threw, '>1 MB rechazado con 400 VALIDATION_ERROR');
assertTrue($pdo->row['rector_firma_filename'] === null, '>1 MB no persistió');

// Dimensiones > ~1200×400
$wide = $storage . '/wide.png';
makePng($wide, 1201, 100);
$threw = false;
try {
    $svc->uploadSignature('rector', ['tmp_name' => $wide, 'error' => UPLOAD_ERR_OK, 'size' => filesize($wide)]);
} catch (AdminCertificateException $e) {
    $threw = $e->status === 400 && $e->errorCode === 'VALIDATION_ERROR';
}
assertTrue($threw, 'Ancho >1200 rechazado');

$tall = $storage . '/tall.png';
makePng($tall, 100, 401);
$threw = false;
try {
    $svc->uploadSignature('asesor', ['tmp_name' => $tall, 'error' => UPLOAD_ERR_OK, 'size' => filesize($tall)]);
} catch (AdminCertificateException $e) {
    $threw = $e->status === 400 && $e->errorCode === 'VALIDATION_ERROR';
}
assertTrue($threw, 'Alto >400 rechazado');

// Happy path PNG
$ok = $storage . '/ok.png';
makePng($ok, 400, 120);
$dto = $svc->uploadSignature('rector', ['tmp_name' => $ok, 'error' => UPLOAD_ERR_OK, 'size' => filesize($ok)]);
assertTrue($dto['rectorSignaturePresent'] === true, 'PNG: flag rectorSignaturePresent');
assertTrue(is_file($storage . '/rector.png'), 'PNG persistido como rector.png');

// Happy path JPEG (asesor)
$okJpg = $storage . '/ok.jpg';
makeJpeg($okJpg, 300, 80);
$dto = $svc->uploadSignature('asesor', ['tmp_name' => $okJpg, 'error' => UPLOAD_ERR_OK, 'size' => filesize($okJpg)]);
assertTrue($dto['advisorSignaturePresent'] === true, 'JPEG: flag advisorSignaturePresent');
assertTrue(is_file($storage . '/asesor.jpg'), 'JPEG persistido como asesor.jpg');

$get = $svc->get();
assertTrue($get['rectorSignaturePresent'] === true && $get['advisorSignaturePresent'] === true, 'GET refleja ambos flags');

// Cleanup
foreach (glob($storage . '/*') ?: [] as $f) {
    @unlink($f);
}
@rmdir($storage);

echo "InstitutionalSignatureValidationTest: PASS\n";
exit(0);
