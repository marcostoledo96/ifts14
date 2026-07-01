<?php

declare(strict_types=1);

$root = dirname(__DIR__);
$tmpDir = sys_get_temp_dir() . '/ifts14-http-contract-' . bin2hex(random_bytes(4));
if (!mkdir($tmpDir, 0700) && !is_dir($tmpDir)) {
    throw new RuntimeException('No se pudo preparar el directorio temporal.');
}

$ratePath = $tmpDir . '/rate-limit.json';
$adminKey = 'admin_demo_key_2026';
$configPath = $tmpDir . '/config.php';
file_put_contents($configPath, '<?php return ' . var_export([
    'db_host' => '127.0.0.1',
    'db_name' => 'demo',
    'db_user' => 'demo',
    'db_pass' => 'demo',
    'token_pepper' => 'pepper_demo_ficticio_2026_no_usar',
    'admin_api_key' => $adminKey,
    'rate_limit_storage_path' => $ratePath,
    'app_salt' => 'salt_demo_http_contract',
    'public_base_url' => 'https://demo.example.edu.ar/certificados',
    'certificate_storage_path' => $tmpDir . '/pdf-storage',
], true) . ';');

$port = random_int(18080, 18999);
$previousConfigPath = getenv('CERTIFICADOS_CONFIG_PATH');
putenv('CERTIFICADOS_CONFIG_PATH=' . $configPath);
$process = proc_open([
    PHP_BINARY,
    '-S',
    '127.0.0.1:' . $port,
    '-t',
    $root,
    $root . '/index.php',
], [['pipe', 'r'], ['pipe', 'w'], ['pipe', 'w']], $pipes, $root);

if (!is_resource($process)) {
    throw new RuntimeException('No se pudo iniciar el servidor embebido.');
}

try {
    waitForServer($port);

    $health = request($port, 'GET', '/health');
    assertStatus($health, 200, 'health');
    assertSecurityHeaders($health, 'health');

    $notFound = request($port, 'GET', '/no-existe');
    assertStatus($notFound, 404, 'not found');
    assertSecurityHeaders($notFound, 'not found');

    $publicNoContentType = request($port, 'POST', '/certificados/consulta');
    assertError($publicNoContentType, 415, 'UNSUPPORTED_MEDIA_TYPE', 'consulta sin Content-Type');
    assertNoRateLimitFile($ratePath, 'consulta sin Content-Type');

    $publicWrongContentType = request($port, 'POST', '/certificados/consulta', ['Content-Type: text/plain'], '{}');
    assertError($publicWrongContentType, 415, 'UNSUPPORTED_MEDIA_TYPE', 'consulta Content-Type inválido');
    assertNoRateLimitFile($ratePath, 'consulta Content-Type inválido');

    $publicBadJson = request($port, 'POST', '/certificados/consulta', ['Content-Type: application/json; charset=utf-8'], '{');
    assertError($publicBadJson, 400, 'VALIDATION_ERROR', 'consulta JSON malformado');
    assertNoRateLimitFile($ratePath, 'consulta JSON malformado');

    $adminNoContentType = request($port, 'POST', '/admin/certificados');
    assertError($adminNoContentType, 415, 'UNSUPPORTED_MEDIA_TYPE', 'admin sin Content-Type');

    $adminWrongContentType = request($port, 'POST', '/admin/certificados', [
        'Content-Type: text/plain',
        'X-Admin-Key: ' . $adminKey,
    ], '{}');
    assertError($adminWrongContentType, 415, 'UNSUPPORTED_MEDIA_TYPE', 'admin Content-Type inválido');

    $revokeNoContentType = request($port, 'POST', '/admin/certificados/1/revocar');
    assertError($revokeNoContentType, 415, 'UNSUPPORTED_MEDIA_TYPE', 'revocación sin Content-Type');

    $revokeWrongContentType = request($port, 'POST', '/admin/certificados/1/revocar', [
        'Content-Type: text/plain',
        'X-Admin-Key: ' . $adminKey,
    ], '{}');
    assertError($revokeWrongContentType, 415, 'UNSUPPORTED_MEDIA_TYPE', 'revocación Content-Type inválido');

    $adminBadJson = request($port, 'POST', '/admin/certificados', [
        'Content-Type: application/json',
        'X-Admin-Key: ' . $adminKey,
    ], '{');
    assertError($adminBadJson, 400, 'VALIDATION_ERROR', 'emisión JSON malformado');

    $revokeBadJson = request($port, 'POST', '/admin/certificados/1/revocar', [
        'Content-Type: application/json',
        'X-Admin-Key: ' . $adminKey,
    ], '{');
    assertError($revokeBadJson, 400, 'VALIDATION_ERROR', 'revocación JSON malformado');

    // Endpoint de descarga PDF: cubre contrato pre-DB (401, 405, 400 id no numérico).
    // 200 y 404 PDF_NOT_FOUND requieren MariaDB real y quedan como verificación
    // de integración diferida.
    $pdfNoAuth = request($port, 'GET', '/admin/certificados/1/pdf');
    assertError($pdfNoAuth, 401, 'UNAUTHORIZED', 'PDF sin X-Admin-Key');
    assertSecurityHeaders($pdfNoAuth, 'PDF sin X-Admin-Key');

    $pdfWrongMethod = request($port, 'POST', '/admin/certificados/1/pdf', [
        'X-Admin-Key: ' . $adminKey,
    ], '{}');
    assertError($pdfWrongMethod, 405, 'METHOD_NOT_ALLOWED', 'PDF método no permitido');
    assertSecurityHeaders($pdfWrongMethod, 'PDF método no permitido');
    if (($pdfWrongMethod['headers']['allow'] ?? '') !== 'GET') {
        throw new RuntimeException('PDF método no permitido: falta Allow: GET.');
    }

    $pdfNonNumericId = request($port, 'GET', '/admin/certificados/abc/pdf', [
        'X-Admin-Key: ' . $adminKey,
    ]);
    assertError($pdfNonNumericId, 400, 'VALIDATION_ERROR', 'PDF id no numérico');
    assertSecurityHeaders($pdfNonNumericId, 'PDF id no numérico');

    // --- Reenvío: contrato del endpoint POST /admin/certificados/{id}/reenviar ---

    // 401 sin X-Admin-Key (antes de Content-Type/body).
    $resendNoAuth = request($port, 'POST', '/admin/certificados/1/reenviar', [
        'Content-Type: application/json',
    ], '{}');
    assertError($resendNoAuth, 401, 'UNAUTHORIZED', 'reenvío sin X-Admin-Key');
    assertSecurityHeaders($resendNoAuth, 'reenvío sin X-Admin-Key');

    // 415 sin Content-Type correcto.
    $resendNoContentType = request($port, 'POST', '/admin/certificados/1/reenviar');
    assertError($resendNoContentType, 415, 'UNSUPPORTED_MEDIA_TYPE', 'reenvío sin Content-Type');

    $resendWrongContentType = request($port, 'POST', '/admin/certificados/1/reenviar', [
        'Content-Type: text/plain',
        'X-Admin-Key: ' . $adminKey,
    ], '{}');
    assertError($resendWrongContentType, 415, 'UNSUPPORTED_MEDIA_TYPE', 'reenvío Content-Type inválido');

    // 405 método no permitido.
    $resendWrongMethod = request($port, 'GET', '/admin/certificados/1/reenviar', [
        'X-Admin-Key: ' . $adminKey,
    ]);
    assertError($resendWrongMethod, 405, 'METHOD_NOT_ALLOWED', 'reenvío método no permitido');
    assertSecurityHeaders($resendWrongMethod, 'reenvío método no permitido');
    if (($resendWrongMethod['headers']['allow'] ?? '') !== 'POST') {
        throw new RuntimeException('reenvío método no permitido: falta Allow: POST.');
    }

    // 400 id no numérico (la regex captura [^/]+ y se valida con filter_var).
    $resendNonNumericId = request($port, 'POST', '/admin/certificados/abc/reenviar', [
        'Content-Type: application/json',
        'X-Admin-Key: ' . $adminKey,
    ], '{"destinatarioEmail":"persona@example.edu.ar"}');
    assertError($resendNonNumericId, 400, 'VALIDATION_ERROR', 'reenvío id no numérico');
    assertSecurityHeaders($resendNonNumericId, 'reenvío id no numérico');

    // 400 JSON malformado.
    $resendBadJson = request($port, 'POST', '/admin/certificados/1/reenviar', [
        'Content-Type: application/json',
        'X-Admin-Key: ' . $adminKey,
    ], '{');
    assertError($resendBadJson, 400, 'VALIDATION_ERROR', 'reenvío JSON malformado');

    // 503 con transporte stub (default del config de ejemplo no incluye delivery_transport,
    // pero el config de test hereda el default 'stub' de Config::requireDeliveryConfig).
    $resendStub = request($port, 'POST', '/admin/certificados/1/reenviar', [
        'Content-Type: application/json',
        'X-Admin-Key: ' . $adminKey,
    ], '{"destinatarioEmail":"persona@example.edu.ar"}');
    assertError($resendStub, 503, 'DELIVERY_NOT_CONFIGURED', 'reenvío stub 503');
    assertSecurityHeaders($resendStub, 'reenvío stub 503');
    $stubBody = json_decode($resendStub['body'], true);
    if (str_contains($resendStub['body'], 'TOKEN') || str_contains($resendStub['body'], 'persona@example.edu.ar')) {
        throw new RuntimeException('reenvío stub 503: el cuerpo filtró token o email completo.');
    }
    if (($stubBody['error']['message'] ?? '') === '') {
        throw new RuntimeException('reenvío stub 503: mensaje vacío.');
    }

    // 503 con modo smtp sin credenciales (segundo config + segundo servidor).
    $smtpIncompletePath = $tmpDir . '/config-smtp-incomplete.php';
    file_put_contents($smtpIncompletePath, '<?php return ' . var_export([
        'db_host' => '127.0.0.1',
        'db_name' => 'demo',
        'db_user' => 'demo',
        'db_pass' => 'demo',
        'token_pepper' => 'pepper_demo_ficticio_2026_no_usar',
        'admin_api_key' => $adminKey,
        'rate_limit_storage_path' => $ratePath,
        'app_salt' => 'salt_demo_http_contract',
        'public_base_url' => 'https://demo.example.edu.ar/certificados',
        'certificate_storage_path' => $tmpDir . '/pdf-storage',
        'delivery_transport' => 'smtp',
        'smtp_host' => '',
        'smtp_port' => 587,
        'smtp_username' => '',
        'smtp_password' => '',
        'mail_from' => '',
        'smtp_secure' => 'tls',
    ], true) . ';');

    $port2 = random_int(19000, 19999);
    $previousConfigPath2 = getenv('CERTIFICADOS_CONFIG_PATH');
    putenv('CERTIFICADOS_CONFIG_PATH=' . $smtpIncompletePath);
    $process2 = proc_open([
        PHP_BINARY,
        '-S',
        '127.0.0.1:' . $port2,
        '-t',
        $root,
        $root . '/index.php',
    ], [['pipe', 'r'], ['pipe', 'w'], ['pipe', 'w']], $pipes2, $root);

    if (!is_resource($process2)) {
        throw new RuntimeException('No se pudo iniciar el segundo servidor embebido.');
    }

    try {
        waitForServer($port2);

        $resendSmtpIncomplete = request($port2, 'POST', '/admin/certificados/1/reenviar', [
            'Content-Type: application/json',
            'X-Admin-Key: ' . $adminKey,
        ], '{"destinatarioEmail":"persona@example.edu.ar"}');
        assertError($resendSmtpIncomplete, 503, 'DELIVERY_NOT_CONFIGURED', 'reenvío smtp incompleto 503');
        assertSecurityHeaders($resendSmtpIncomplete, 'reenvío smtp incompleto 503');
        if (str_contains($resendSmtpIncomplete['body'], 'persona@example.edu.ar') || str_contains($resendSmtpIncomplete['body'], 'TOKEN')) {
            throw new RuntimeException('reenvío smtp incompleto: filtró token o email.');
        }
    } finally {
        proc_terminate($process2);
        proc_close($process2);
        putenv($previousConfigPath2 === false ? 'CERTIFICADOS_CONFIG_PATH' : 'CERTIFICADOS_CONFIG_PATH=' . $previousConfigPath2);
        if (is_file($smtpIncompletePath)) {
            unlink($smtpIncompletePath);
        }
    }
} finally {
    proc_terminate($process);
    proc_close($process);
    putenv($previousConfigPath === false ? 'CERTIFICADOS_CONFIG_PATH' : 'CERTIFICADOS_CONFIG_PATH=' . $previousConfigPath);
    array_map(static fn (string $file): bool => is_file($file) ? unlink($file) : true, glob($tmpDir . '/*') ?: []);
    rmdir($tmpDir);
}

echo "OK HttpContractTest\n";

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

function assertNoRateLimitFile(string $ratePath, string $label): void
{
    if (is_file($ratePath)) {
        throw new RuntimeException("{$label}: el rate limiter recibió un request inválido.");
    }
}
