<?php

declare(strict_types=1);

$root = dirname(__DIR__);
$tmpDir = sys_get_temp_dir() . '/ifts14-admin-auth-http-' . bin2hex(random_bytes(4));
mkdir($tmpDir, 0700);
$sessionDir = $tmpDir . '/sessions';
mkdir($sessionDir, 0700);
$password = 'password-demo-auth';
$configPath = $tmpDir . '/config.php';
$configSource = '<?php return ' . var_export([
    'db_host' => '127.0.0.1',
    'db_name' => 'demo',
    'db_user' => 'demo',
    'db_pass' => 'demo',
    'token_pepper' => 'pepper_demo_auth_http',
    'admin_username' => 'bedelia',
    'admin_password_hash' => password_hash($password, PASSWORD_DEFAULT),
    'admin_session_idle_seconds' => 14400,
    'admin_session_absolute_seconds' => 28800,
    'rate_limit_storage_path' => $tmpDir . '/rate-limit.json',
], true) . ';';
file_put_contents($configPath, $configSource);

$port = random_int(24000, 24999);
$previousConfigPath = getenv('CERTIFICADOS_CONFIG_PATH');
putenv('CERTIFICADOS_CONFIG_PATH=' . $configPath);
$process = proc_open([PHP_BINARY, '-d', 'session.save_path=' . $sessionDir, '-S', '127.0.0.1:' . $port, '-t', $root, $root . '/index.php'], [['pipe', 'r'], ['pipe', 'w'], ['pipe', 'w']], $pipes, $root);

if (!is_resource($process)) {
    throw new RuntimeException('No se pudo iniciar el servidor embebido.');
}
stream_set_blocking($pipes[2], false);

try {
    waitForServer($port);
    assertError(request($port, 'POST', '/admin/auth/login', ['Content-Type: application/json'], '{'), 400, 'VALIDATION_ERROR', 'login JSON inválido');
    $login = request($port, 'POST', '/admin/auth/login', ['Content-Type: application/json'], json_encode(['username' => 'bedelia', 'password' => $password], JSON_THROW_ON_ERROR));
    assertStatus($login, 200, 'login válido');
    $loginBody = json_decode($login['body'], true);
    $csrf = $loginBody['data']['csrfToken'] ?? '';
    if (($loginBody['data']['authenticated'] ?? false) !== true || !is_string($csrf) || preg_match('/\A[A-Za-z0-9_-]{43}\z/', $csrf) !== 1) {
        throw new RuntimeException('login válido: body inválido.');
    }
    $cookie = $login['headers']['set-cookie'] ?? '';
    $cookieAttributes = strtolower($cookie);
    foreach (['ifts14_cert_admin=', 'path=/certificados/', 'httponly', 'secure', 'samesite=strict'] as $required) {
        if (!str_contains($cookieAttributes, $required)) {
            throw new RuntimeException('login válido: cookie sin atributo ' . $required);
        }
    }
    $cookieHeader = 'Cookie: ' . explode(';', $cookie, 2)[0];
    $sessionId = explode('=', explode(';', $cookie, 2)[0], 2)[1] ?? '';
    $state = request($port, 'GET', '/admin/auth/session', [$cookieHeader]);
    assertStatus($state, 200, 'estado autenticado');
    $stateBody = json_decode($state['body'], true);
    if (($stateBody['data']['authenticated'] ?? false) !== true || ($stateBody['data']['csrfToken'] ?? '') !== $csrf) {
        throw new RuntimeException('estado autenticado: body inválido.');
    }

    assertError(request($port, 'GET', '/admin/cursos', ['X-Admin-Key: legacy_demo_key_2026']), 401, 'UNAUTHORIZED', 'header HTTP no autoriza');
    assertError(request($port, 'POST', '/admin/auth/logout', [$cookieHeader]), 403, 'CSRF_INVALID', 'logout sin CSRF');

    unlink($configPath);
    $logout = request($port, 'POST', '/admin/auth/logout', [$cookieHeader, 'X-CSRF-Token: ' . $csrf]);
    file_put_contents($configPath, $configSource);
    assertStatus($logout, 200, 'logout con configuración no disponible');
    if ((json_decode($logout['body'], true)['data']['authenticated'] ?? true) !== false) {
        throw new RuntimeException('logout válido: body inválido.');
    }
    $afterLogout = request($port, 'GET', '/admin/auth/session', [$cookieHeader]);
    assertStatus($afterLogout, 200, 'estado posterior a logout');
    if ((json_decode($afterLogout['body'], true)['data']['authenticated'] ?? true) !== false) {
        throw new RuntimeException('logout no invalidó la sesión.');
    }

    if (!rmdir($sessionDir) || file_put_contents($sessionDir, 'blocked') === false) {
        throw new RuntimeException('No se pudo preparar la falla de almacenamiento de sesión.');
    }
    $failedSessionLogin = request($port, 'POST', '/admin/auth/login', ['Content-Type: application/json'], json_encode(['username' => 'bedelia', 'password' => $password], JSON_THROW_ON_ERROR));
    assertError($failedSessionLogin, 500, 'INTERNAL_ERROR', 'falla de almacenamiento tras credenciales válidas');
    $diagnostic = $failedSessionLogin['body'] . stream_get_contents($pipes[2]);
    if (!str_contains($diagnostic, 'ifts14_admin_session_start_failed') || str_contains($diagnostic, 'bedelia') || str_contains($diagnostic, $password) || str_contains($diagnostic, $sessionDir) || ($sessionId !== '' && str_contains($diagnostic, $sessionId))) {
        throw new RuntimeException('La falla de sesión no emitió un diagnóstico operativo sanitizado.');
    }
    for ($attempt = 0; $attempt < 3; $attempt++) {
        assertError(request($port, 'POST', '/admin/auth/login', ['Content-Type: application/json'], json_encode(['username' => 'bedelia', 'password' => 'incorrecta'], JSON_THROW_ON_ERROR)), 401, 'UNAUTHORIZED', 'login inválido');
    }
    assertError(request($port, 'POST', '/admin/auth/login', ['Content-Type: application/json'], json_encode(['username' => 'bedelia', 'password' => $password], JSON_THROW_ON_ERROR)), 429, 'RATE_LIMITED', 'login limitado antes de verificar credenciales');
} finally {
    proc_terminate($process);
    proc_close($process);
    putenv($previousConfigPath === false ? 'CERTIFICADOS_CONFIG_PATH' : 'CERTIFICADOS_CONFIG_PATH=' . $previousConfigPath);
    array_map(static fn (string $file): bool => is_file($file) ? unlink($file) : true, glob($tmpDir . '/*') ?: []);
    if (is_dir($sessionDir)) {
        rmdir($sessionDir);
    }
    rmdir($tmpDir);
}

echo "OK AdminAuthHttpTest\n";

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
    $context = stream_context_create(['http' => ['method' => $method, 'ignore_errors' => true, 'header' => implode("\r\n", $headers), 'content' => $body]]);
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
function assertStatus(array $response, int $status, string $label): void
{
    if ($response['status'] !== $status) {
        throw new RuntimeException("{$label}: HTTP esperado {$status}, recibido {$response['status']}.");
    }
}

/** @param array{status:int,headers:array<string,string>,body:string} $response */
function assertError(array $response, int $status, string $code, string $label): void
{
    assertStatus($response, $status, $label);
    $body = json_decode($response['body'], true);
    if (($body['error']['code'] ?? '') !== $code) {
        throw new RuntimeException("{$label}: código de error inválido.");
    }
}
