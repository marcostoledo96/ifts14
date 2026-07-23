<?php

declare(strict_types=1);

$root = dirname(__DIR__);
$tmpDir = sys_get_temp_dir() . '/ifts14-admin-matrix-' . bin2hex(random_bytes(4));
mkdir($tmpDir, 0700);
$password = 'password-demo-matrix';
$configPath = $tmpDir . '/config.php';
file_put_contents($configPath, '<?php return ' . var_export([
    'db_host' => '127.0.0.1', 'db_name' => 'demo', 'db_user' => 'demo', 'db_pass' => 'demo',
    'token_pepper' => 'pepper_demo_matrix', 'admin_username' => 'bedelia',
    'admin_password_hash' => password_hash($password, PASSWORD_DEFAULT),
    'admin_session_idle_seconds' => 1800, 'admin_session_absolute_seconds' => 28800,
    'rate_limit_storage_path' => $tmpDir . '/rate-limit.json',
], true) . ';');
$port = random_int(25000, 25999);
$previousConfigPath = getenv('CERTIFICADOS_CONFIG_PATH');
putenv('CERTIFICADOS_CONFIG_PATH=' . $configPath);
$process = proc_open([PHP_BINARY, '-S', '127.0.0.1:' . $port, '-t', $root, $root . '/index.php'], [['pipe', 'r'], ['pipe', 'w'], ['pipe', 'w']], $pipes, $root);
if (!is_resource($process)) {
    throw new RuntimeException('No se pudo iniciar el servidor embebido.');
}

try {
    matrixWait($port);
    $login = matrixRequest($port, 'POST', '/admin/auth/login', ['Content-Type: application/json'], json_encode(['username' => 'bedelia', 'password' => $password], JSON_THROW_ON_ERROR));
    matrixStatus($login, 200, 'login');
    $csrf = json_decode($login['body'], true)['data']['csrfToken'] ?? '';
    $cookie = 'Cookie: ' . explode(';', $login['headers']['set-cookie'] ?? '', 2)[0];
    if (!is_string($csrf) || $csrf === '' || $cookie === 'Cookie: ') {
        throw new RuntimeException('login de matriz inválido.');
    }

    // Invocaciones reales a adminConfig() en index.php (incluye firmas/{rol}).
    $sites = [
        ['GET', '/admin/cursos', false], ['GET', '/admin/cursos/1', false], ['PATCH', '/admin/cursos/1', true], ['PATCH', '/admin/cursos/1/estado', true],
        ['GET', '/admin/alumnos', false], ['GET', '/admin/alumnos/1', false], ['PATCH', '/admin/alumnos/1', true], ['PATCH', '/admin/alumnos/1/estado', true],
        ['GET', '/admin/cursos/1/fechas', false], ['PATCH', '/admin/cursos/1/fechas/1', true],
        ['GET', '/admin/asistencias', false], ['GET', '/admin/hub/asistencias', false], ['DELETE', '/admin/asistencias/1', true],
        ['GET', '/admin/certificados', false], ['POST', '/admin/certificados', true], ['GET', '/admin/certificados/1', false],
        ['GET', '/admin/configuracion-institucional', false], ['POST', '/admin/certificados/1/revocar', true],
        ['GET', '/admin/certificados/1/pdf', false], ['GET', '/admin/certificados/1/qr.png', false], ['GET', '/admin/certificados/1/entrega-manual', false],
        ['GET', '/admin/configuracion-institucional/firmas/rector', false],
        ['POST', '/admin/configuracion-institucional/firmas/rector', true],
        ['DELETE', '/admin/configuracion-institucional/firmas/rector', true],
    ];
    foreach ($sites as [$method, $path, $mutates]) {
        $headerOnly = matrixRequest($port, $method, $path, ['X-Admin-Key: legacy_demo_key_2026', 'Content-Type: application/json'], '{}');
        matrixStatus($headerOnly, 401, "header {$method} {$path}");
        if ($mutates) {
            $noCsrf = matrixRequest($port, $method, $path, [$cookie, 'Content-Type: application/json'], '{}');
            matrixStatus($noCsrf, 403, "csrf {$method} {$path}");
            $withCsrf = matrixRequest($port, $method, $path, [$cookie, 'X-CSRF-Token: ' . $csrf, 'Content-Type: application/json'], '{}');
            if (in_array($withCsrf['status'], [401, 403], true)) {
                throw new RuntimeException("csrf válido no alcanzó negocio en {$method} {$path}.");
            }
        } else {
            $authorized = matrixRequest($port, $method, $path, [$cookie]);
            if ($authorized['status'] === 401) {
                throw new RuntimeException("sesión no autorizó {$method} {$path}.");
            }
        }
    }
} finally {
    proc_terminate($process); proc_close($process);
    putenv($previousConfigPath === false ? 'CERTIFICADOS_CONFIG_PATH' : 'CERTIFICADOS_CONFIG_PATH=' . $previousConfigPath);
    array_map(static fn (string $file): bool => is_file($file) ? unlink($file) : true, glob($tmpDir . '/*') ?: []); rmdir($tmpDir);
}
echo 'OK AdminAuthorizationMatrixTest: ' . count($sites) . " sitios reconciliados\n";

function matrixWait(int $port): void { for ($i = 0; $i < 50; $i++) { $s = @stream_socket_client('tcp://127.0.0.1:' . $port, $e, $m, .1); if (is_resource($s)) { fclose($s); return; } usleep(100000); } throw new RuntimeException('Servidor no disponible.'); }
/** @param list<string> $headers @return array{status:int,headers:array<string,string>,body:string} */
function matrixRequest(int $port, string $method, string $path, array $headers = [], string $body = ''): array { $ctx = stream_context_create(['http' => ['method' => $method, 'ignore_errors' => true, 'header' => implode("\r\n", $headers), 'content' => $body]]); $contents = @file_get_contents('http://127.0.0.1:' . $port . $path, false, $ctx); if ($contents === false) throw new RuntimeException($path . ': request fallido.'); preg_match('/\s(\d{3})\s/', $http_response_header[0] ?? '', $m); $parsed = []; foreach ($http_response_header ?? [] as $line) if (str_contains($line, ':')) { [$n, $v] = explode(':', $line, 2); $parsed[strtolower(trim($n))] = trim($v); } return ['status' => (int) ($m[1] ?? 0), 'headers' => $parsed, 'body' => $contents]; }
/** @param array{status:int,headers:array<string,string>,body:string} $response */
function matrixStatus(array $response, int $status, string $label): void { if ($response['status'] !== $status) throw new RuntimeException("{$label}: esperado {$status}, recibido {$response['status']}."); }
