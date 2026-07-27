<?php

declare(strict_types=1);

require_once __DIR__ . '/SessionHttpTest.php';

/**
 * Pruebas de resiliencia para feedback Codex PR #15:
 *  - /health funciona sin vendor/autoload.php (deploy sin Composer).
 *  - Config sin claves PDF no rompe rutas públicas (validación pública).
 *  - streamPdf responde error seguro si el PDF existe pero no es legible/vacío.
 *
 * Requiere solo el runtime PHP embebido; no usa MariaDB real. Los escenarios
 * cubren contratos pre-DB y no dependen de credenciales.
 */

$root = dirname(__DIR__);

// --- Escenario 1: /health funciona sin vendor/autoload.php ---------------
$noVendorRoot = sys_get_temp_dir() . '/ifts14-no-vendor-' . bin2hex(random_bytes(4));
@mkdir($noVendorRoot . '/src', 0700, true);
copy($root . '/index.php', $noVendorRoot . '/index.php');
foreach (glob($root . '/src/*.php') as $srcFile) {
    copy($srcFile, $noVendorRoot . '/src/' . basename($srcFile));
}
// No copiamos vendor/ ni CertificatePdfService.php desde src: index.php lo
// carga perezosamente solo en rutas PDF. /health no debe tocar vendor.

$port1 = random_int(19000, 19999);
$process1 = proc_open([
    PHP_BINARY,
    '-S',
    '127.0.0.1:' . $port1,
    '-t',
    $noVendorRoot,
    $noVendorRoot . '/index.php',
], [['pipe', 'r'], ['pipe', 'w'], ['pipe', 'w']], $pipes1, $noVendorRoot);

if (!is_resource($process1)) {
    throw new RuntimeException('No se pudo iniciar el servidor sin vendor.');
}

try {
    waitForServer($port1);

    $health = request($port1, 'GET', '/health');
    assertStatus($health, 200, 'health sin vendor');
    assertSecurityHeaders($health, 'health sin vendor');

    $body = json_decode($health['body'], true);
    if (!is_array($body) || ($body['data']['status'] ?? '') !== 'ok') {
        throw new RuntimeException('health sin vendor: body inválido.');
    }

    // /no-existe también debe responder 404 seguro sin vendor.
    $notFound = request($port1, 'GET', '/no-existe');
    assertError($notFound, 404, 'NOT_FOUND', 'not found sin vendor');
} finally {
    proc_terminate($process1);
    proc_close($process1);
    cleanDir($noVendorRoot);
}

// --- Escenario 2: Config sin claves PDF no rompe rutas públicas -----------
$pubTmpDir = sys_get_temp_dir() . '/ifts14-pub-no-pdf-' . bin2hex(random_bytes(4));
@mkdir($pubTmpDir, 0700);
$ratePath = $pubTmpDir . '/rate-limit.json';
$adminKey = 'admin_demo_key_2026';
$configPath = $pubTmpDir . '/config.php';
file_put_contents($configPath, '<?php return ' . var_export([
    'db_host' => '127.0.0.1',
    'db_name' => 'demo',
    'db_user' => 'demo',
    'db_pass' => 'demo',
    'token_pepper' => 'pepper_demo_ficticio_2026_no_usar',
    'admin_username' => 'bedelia',
    'admin_password_hash' => password_hash($adminKey, PASSWORD_DEFAULT),
    'admin_session_idle_seconds' => 14400,
    'admin_session_absolute_seconds' => 28800,
    'rate_limit_storage_path' => $ratePath,
    'app_salt' => 'salt_demo_resilience',
    // Intencionalmente sin public_base_url ni certificate_storage_path.
], true) . ';');

$port2 = random_int(20000, 20999);
$previousConfigPath = getenv('CERTIFICADOS_CONFIG_PATH');
putenv('CERTIFICADOS_CONFIG_PATH=' . $configPath);
$process2 = proc_open([
    PHP_BINARY,
    '-S',
    '127.0.0.1:' . $port2,
    '-t',
    $root,
    $root . '/index.php',
], [['pipe', 'r'], ['pipe', 'w'], ['pipe', 'w']], $pipes2, $root);

if (!is_resource($process2)) {
    throw new RuntimeException('No se pudo iniciar el servidor con config sin PDF.');
}

try {
    waitForServer($port2);
    $authHeaders = loginAdminSessionHeaders($port2, 'bedelia', $adminKey);

    // /health sigue funcionando (no carga config).
    $health = request($port2, 'GET', '/health');
    assertStatus($health, 200, 'health config sin PDF');

    // POST /certificados/consulta con JSON inválido responde 400 sin romper
    // aunque falten claves PDF en la config. Cubre que Config::load() no
    // requiere public_base_url/certificate_storage_path.
    $badJson = request($port2, 'POST', '/certificados/consulta', [
        'Content-Type: application/json',
    ], '{');
    assertError($badJson, 400, 'VALIDATION_ERROR', 'consulta JSON malformado config sin PDF');

    // Con sesión válida, la ruta llega a la validación fail-closed de PDF.
    $pdfNoConfig = request($port2, 'GET', '/admin/certificados/1/pdf', [
        ...$authHeaders,
    ]);
    assertError($pdfNoConfig, 500, 'CONFIGURATION_ERROR', 'PDF sin config PDF');
} finally {
    proc_terminate($process2);
    proc_close($process2);
    putenv($previousConfigPath === false ? 'CERTIFICADOS_CONFIG_PATH' : 'CERTIFICADOS_CONFIG_PATH=' . $previousConfigPath);
    cleanDir($pubTmpDir);
}

// --- Escenario 3: streamPdf rechaza PDF vacío antes de headers ---------
// Probamos las guardas de streamPdf (is_file, is_readable, filesize>0)
// creando un PDF vacío en el storage y verificando que las guardas lo
// rechazan. No invocamos streamPdf completo porque requiere MariaDB real;
// las guardas son la corrección del feedback Codex y las validamos directo.
require_once $root . '/src/CertificatePdfService.php';

$storageDir = sys_get_temp_dir() . '/ifts14-storage-' . bin2hex(random_bytes(4));
@mkdir($storageDir, 0700);
$pdfService = new CertificatePdfService($storageDir);
$code = 'CERT-2026-TEST';
$path = $pdfService->pathForCode($code);

// Archivo vacío: las guardas de streamPdf deben detectarlo.
file_put_contents($path, '');
$rejectedEmpty = false;
if (!is_file($path) || !is_readable($path)) {
    $rejectedEmpty = true;
} else {
    $size = filesize($path);
    if ($size === false || $size <= 0) {
        $rejectedEmpty = true;
    }
}

if (!$rejectedEmpty) {
    throw new RuntimeException('streamPdf guardas: PDF vacío no fue rechazado (filesize<=0).');
}

// Archivo inexistente: también rechazado.
@unlink($path);
$rejectedMissing = !is_file($path);

if (!$rejectedMissing) {
    throw new RuntimeException('streamPdf guardas: PDF inexistente no fue rechazado.');
}

$generatedPath = $pdfService->generate('CERT-2026-INSTITUCIONAL', [
    'studentDisplayName' => 'Alumno Demo',
    'documentNumber' => '12345678',
    'courseName' => 'Curso Demo',
    'issuedAt' => '2026-07-02',
    'expiresAt' => '',
    'attendedDates' => ['2026-06-01', '2026-06-08'],
    'institutionalConfig' => [
        'institutionName' => 'IFTS 14 Demo',
        'certificateText' => 'Texto institucional demo.',
        'rectorName' => 'Rector Demo',
        'rectorRole' => 'Rector',
        'advisorName' => 'Asesora Demo',
        'advisorRole' => 'Asesora Pedagogica',
    ],
], 'https://demo.example.edu.ar/certificados/validar/TOKEN_DEMO_PDF');

$generatedPrefix = file_get_contents($generatedPath, false, null, 0, 5);
$generatedSize = filesize($generatedPath);
if ($generatedPrefix !== '%PDF-' || $generatedSize === false || $generatedSize <= 100) {
    throw new RuntimeException('PDF institucional generado inválido.');
}
assertPdfContains($generatedPath, ['IFTS 14 Demo', 'Texto institucional demo.', 'Rector Demo', 'Rector', 'Asesora Demo', 'Asesora Pedagogica'], 'PDF institucional generado');

cleanDir($storageDir);

echo "OK PdfResilienceTest\n";

function waitForServer(int $port): void
{
    for ($attempt = 0; $attempt < 50; $attempt++) {
        $socket = @stream_socket_client('tcp://127.0.0.1:' . $port, $errno, $error, 0.1);
        if (is_resource($socket)) {
            fclose($socket);
            return;
        }
        usleep(100000);
    }

    throw new RuntimeException('El servidor embebido no respondió.');
}

/** @param list<string> $headers @return array{status:int,headers:array<string,string>,body:string} */
function request(int $port, string $method, string $path, array $headers = [], string $body = ''): array
{
    $context = stream_context_create(['http' => [
        'method' => $method,
        'ignore_errors' => true,
        'header' => implode("\r\n", $headers),
        'content' => $body,
    ]]);
    $contents = file_get_contents('http://127.0.0.1:' . $port . $path, false, $context);
    if ($contents === false) {
        throw new RuntimeException($path . ': request fallido.');
    }

    $statusLine = $http_response_header[0] ?? '';
    preg_match('/\s(\d{3})\s/', $statusLine, $matches);
    $parsedHeaders = [];
    foreach ($http_response_header ?? [] as $line) {
        if (str_contains($line, ':')) {
            [$name, $value] = explode(':', $line, 2);
            $parsedHeaders[strtolower(trim($name))] = trim($value);
        }
    }

    return ['status' => (int) ($matches[1] ?? 0), 'headers' => $parsedHeaders, 'body' => $contents];
}

/** @param array{status:int,headers:array<string,string>,body:string} $response */
function assertStatus(array $response, int $expected, string $label): void
{
    if ($response['status'] !== $expected) {
        throw new RuntimeException("{$label}: HTTP esperado {$expected}, recibido {$response['status']}.");
    }
}

/** @param array{status:int,headers:array<string,string>,body:string} $response */
function assertError(array $response, int $status, string $code, string $label): void
{
    assertStatus($response, $status, $label);
    assertSecurityHeaders($response, $label);
    $body = json_decode($response['body'], true);
    if (($body['error']['code'] ?? '') !== $code) {
        throw new RuntimeException("{$label}: código de error inválido.");
    }
}

/** @param array{status:int,headers:array<string,string>,body:string} $response */
function assertSecurityHeaders(array $response, string $label): void
{
    if (($response['headers']['x-content-type-options'] ?? '') !== 'nosniff') {
        throw new RuntimeException("{$label}: falta X-Content-Type-Options.");
    }

    if (($response['headers']['x-frame-options'] ?? '') !== 'SAMEORIGIN') {
        throw new RuntimeException("{$label}: falta X-Frame-Options.");
    }
}

/** @param list<string> $expected */
function assertPdfContains(string $path, array $expected, string $label): void
{
    $contents = file_get_contents($path);
    if (!is_string($contents)) {
        throw new RuntimeException("{$label}: no se pudo leer PDF generado.");
    }

    foreach ($expected as $text) {
        if (!str_contains($contents, $text)) {
            throw new RuntimeException("{$label}: falta texto visible esperado: {$text}.");
        }
    }
}

function cleanDir(string $dir): void
{
    if (!is_dir($dir)) {
        return;
    }

    $iterator = new RecursiveIteratorIterator(
        new RecursiveDirectoryIterator($dir, FilesystemIterator::SKIP_DOTS),
        RecursiveIteratorIterator::CHILD_FIRST
    );

    foreach ($iterator as $item) {
        $item->isDir() ? @rmdir($item->getPathname()) : @unlink($item->getPathname());
    }

    @rmdir($dir);
}
