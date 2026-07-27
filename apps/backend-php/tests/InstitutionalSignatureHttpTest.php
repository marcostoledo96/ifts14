<?php

declare(strict_types=1);

/**
 * Runtime HTTP: auth 401/403 en firmas/{rol} + GET preview autenticado (nosniff, no-store, MIME).
 * Sin MariaDB: router inyecta PDO fake (InstitutionalSignatureHttpRouter.php).
 * Ejecutar: php apps/backend-php/tests/InstitutionalSignatureHttpTest.php
 */

$root = dirname(__DIR__);
$tmpDir = sys_get_temp_dir() . '/ifts14-firmas-http-' . bin2hex(random_bytes(4));
mkdir($tmpDir, 0700);
$sessionDir = $tmpDir . '/sessions';
mkdir($sessionDir, 0700);
$storage = $tmpDir . '/firmas';
mkdir($storage, 0700);

$pngPath = $storage . '/rector.png';
$im = imagecreatetruecolor(200, 60);
imagepng($im, $pngPath);
imagedestroy($im);
$pngBytes = (string) file_get_contents($pngPath);
$pngHash = hash_file('sha256', $pngPath);

$statePath = $tmpDir . '/state.json';
file_put_contents($statePath, json_encode([
    'institucion_nombre' => 'IFTS Test',
    'rector_nombre' => 'Rector',
    'rector_cargo' => 'Rector/a',
    'asesor_nombre' => 'Asesor',
    'asesor_cargo' => 'Asesor/a',
    'texto_certificado' => 'Texto',
    'updated_at' => '2026-07-01 00:00:00',
    'rector_firma_filename' => 'rector.png',
    'rector_firma_sha256' => $pngHash,
    'asesor_firma_filename' => null,
    'asesor_firma_sha256' => null,
], JSON_THROW_ON_ERROR));

$password = 'password-demo-firmas-http';
$configPath = $tmpDir . '/config.php';
file_put_contents($configPath, '<?php return ' . var_export([
    'db_host' => '127.0.0.1',
    'db_name' => 'demo',
    'db_user' => 'demo',
    'db_pass' => 'demo',
    'token_pepper' => 'pepper_demo_firmas_http',
    'admin_username' => 'bedelia',
    'admin_password_hash' => password_hash($password, PASSWORD_DEFAULT),
    'admin_session_idle_seconds' => 1800,
    'admin_session_absolute_seconds' => 28800,
    'rate_limit_storage_path' => $tmpDir . '/rate-limit.json',
    'signature_storage_path' => $storage,
], true) . ';');

$port = random_int(26000, 26999);
$previousConfigPath = getenv('CERTIFICADOS_CONFIG_PATH');
$previousState = getenv('IFTS14_SIG_HTTP_STATE');
putenv('CERTIFICADOS_CONFIG_PATH=' . $configPath);
putenv('IFTS14_SIG_HTTP_STATE=' . $statePath);

$router = __DIR__ . '/InstitutionalSignatureHttpRouter.php';
$process = proc_open(
    [
        PHP_BINARY,
        '-d',
        'session.save_path=' . $sessionDir,
        '-d',
        'opcache.enable=0',
        '-S',
        '127.0.0.1:' . $port,
        '-t',
        $root,
        $router,
    ],
    [['pipe', 'r'], ['pipe', 'w'], ['pipe', 'w']],
    $pipes,
    $root,
);

if (!is_resource($process)) {
    throw new RuntimeException('No se pudo iniciar el servidor embebido.');
}
stream_set_blocking($pipes[2], false);

try {
    sigHttpWait($port);

    $firmaPath = '/admin/configuracion-institucional/firmas/rector';

    // Sin sesión → 401
    foreach (['GET', 'POST', 'DELETE'] as $method) {
        $unauth = sigHttpRequest($port, $method, $firmaPath);
        sigHttpError($unauth, 401, 'UNAUTHORIZED', "sin auth {$method} firmas/rector");
    }

    // X-Admin-Key no autoriza
    $legacy = sigHttpRequest($port, 'GET', $firmaPath, ['X-Admin-Key: legacy_demo_key_2026']);
    sigHttpError($legacy, 401, 'UNAUTHORIZED', 'X-Admin-Key no autoriza GET firmas');

    $login = sigHttpRequest(
        $port,
        'POST',
        '/admin/auth/login',
        ['Content-Type: application/json'],
        json_encode(['username' => 'bedelia', 'password' => $password], JSON_THROW_ON_ERROR),
    );
    sigHttpStatus($login, 200, 'login firmas http');
    $csrf = json_decode($login['body'], true)['data']['csrfToken'] ?? '';
    $cookie = 'Cookie: ' . explode(';', $login['headers']['set-cookie'] ?? '', 2)[0];
    if (!is_string($csrf) || $csrf === '' || $cookie === 'Cookie: ') {
        throw new RuntimeException('login firmas http inválido.');
    }

    // Mutaciones con sesión pero sin CSRF → 403
    foreach (['POST', 'DELETE'] as $method) {
        $noCsrf = sigHttpRequest($port, $method, $firmaPath, [$cookie]);
        sigHttpError($noCsrf, 403, 'CSRF_INVALID', "csrf {$method} firmas/rector");
    }

    // GET autenticado: bytes + headers de seguridad + MIME real
    $preview = sigHttpRequest($port, 'GET', $firmaPath, [$cookie]);
    sigHttpStatus($preview, 200, 'GET preview autenticado');
    if (($preview['headers']['x-content-type-options'] ?? '') !== 'nosniff') {
        throw new RuntimeException('GET preview: falta X-Content-Type-Options: nosniff');
    }
    $cacheControl = $preview['headers']['cache-control'] ?? '';
    if ($cacheControl === '' || !str_contains($cacheControl, 'no-store')) {
        throw new RuntimeException('GET preview: Cache-Control debe contener no-store');
    }
    $contentType = strtolower($preview['headers']['content-type'] ?? '');
    if (!str_starts_with($contentType, 'image/png') && !str_starts_with($contentType, 'image/jpeg')) {
        throw new RuntimeException('GET preview: Content-Type no es image/png|jpeg, recibido: ' . $contentType);
    }
    if ($preview['body'] !== $pngBytes) {
        throw new RuntimeException('GET preview: bytes no coinciden con la firma PNG.');
    }

    // DELETE autenticado (CSRF): flags/archivo/metadatos (cubre también vía HTTP)
    $deleted = sigHttpRequest($port, 'DELETE', $firmaPath, [$cookie, 'X-CSRF-Token: ' . $csrf]);
    sigHttpStatus($deleted, 200, 'DELETE firmas autenticado');
    $deletedBody = json_decode($deleted['body'], true);
    if (($deletedBody['data']['rectorSignaturePresent'] ?? true) !== false) {
        throw new RuntimeException('DELETE HTTP: rectorSignaturePresent no es false.');
    }
    if (is_file($pngPath)) {
        throw new RuntimeException('DELETE HTTP: archivo no fue unlinked.');
    }
    $stateAfter = json_decode((string) file_get_contents($statePath), true);
    if (
        !is_array($stateAfter)
        || !array_key_exists('rector_firma_filename', $stateAfter)
        || $stateAfter['rector_firma_filename'] !== null
        || !array_key_exists('rector_firma_sha256', $stateAfter)
        || $stateAfter['rector_firma_sha256'] !== null
    ) {
        throw new RuntimeException('DELETE HTTP: metadatos DB no quedaron NULL.');
    }
} finally {
    proc_terminate($process);
    proc_close($process);
    putenv($previousConfigPath === false ? 'CERTIFICADOS_CONFIG_PATH' : 'CERTIFICADOS_CONFIG_PATH=' . $previousConfigPath);
    putenv($previousState === false ? 'IFTS14_SIG_HTTP_STATE' : 'IFTS14_SIG_HTTP_STATE=' . $previousState);
    foreach (glob($storage . '/*') ?: [] as $file) {
        @unlink($file);
    }
    @rmdir($storage);
    foreach (glob($sessionDir . '/*') ?: [] as $file) {
        @unlink($file);
    }
    @rmdir($sessionDir);
    foreach (glob($tmpDir . '/*') ?: [] as $file) {
        if (is_file($file)) {
            @unlink($file);
        }
    }
    @rmdir($tmpDir);
}

echo "InstitutionalSignatureHttpTest: PASS\n";
exit(0);

function sigHttpWait(int $port): void
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
function sigHttpRequest(int $port, string $method, string $path, array $headers = [], string $body = ''): array
{
    $context = stream_context_create([
        'http' => [
            'method' => $method,
            'ignore_errors' => true,
            'header' => implode("\r\n", $headers),
            'content' => $body,
        ],
    ]);
    $contents = @file_get_contents('http://127.0.0.1:' . $port . $path, false, $context);
    if ($contents === false) {
        throw new RuntimeException($path . ': request fallido.');
    }
    preg_match('/\s(\d{3})\s/', $http_response_header[0] ?? '', $matches);
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
function sigHttpStatus(array $response, int $status, string $label): void
{
    if ($response['status'] !== $status) {
        throw new RuntimeException("{$label}: HTTP esperado {$status}, recibido {$response['status']} body=" . substr($response['body'], 0, 200));
    }
}

/** @param array{status:int,headers:array<string,string>,body:string} $response */
function sigHttpError(array $response, int $status, string $code, string $label): void
{
    sigHttpStatus($response, $status, $label);
    $body = json_decode($response['body'], true);
    if (($body['error']['code'] ?? '') !== $code) {
        throw new RuntimeException("{$label}: código de error inválido (" . ($body['error']['code'] ?? 'none') . ').');
    }
}
