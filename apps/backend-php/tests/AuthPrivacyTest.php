<?php

declare(strict_types=1);

$root = dirname(__DIR__);
$tmp = sys_get_temp_dir() . '/ifts14-auth-privacy-' . bin2hex(random_bytes(4));
mkdir($tmp, 0700);
$password = 'password-private-demo';
$configPath = $tmp . '/config.php';
file_put_contents($configPath, '<?php return ' . var_export([
    'db_host' => '127.0.0.1', 'db_name' => 'demo', 'db_user' => 'demo', 'db_pass' => 'demo',
    'token_pepper' => 'token-private-demo', 'admin_username' => 'bedelia-private',
    'admin_password_hash' => password_hash($password, PASSWORD_DEFAULT),
    'admin_session_idle_seconds' => 14400, 'admin_session_absolute_seconds' => 28800,
    'rate_limit_storage_path' => $tmp . '/rate-limit.json',
], true) . ';');
$port = random_int(26000, 26999); $previous = getenv('CERTIFICADOS_CONFIG_PATH'); putenv('CERTIFICADOS_CONFIG_PATH=' . $configPath);
$process = proc_open([PHP_BINARY, '-S', '127.0.0.1:' . $port, '-t', $root, $root . '/index.php'], [['pipe', 'r'], ['pipe', 'w'], ['pipe', 'w']], $pipes, $root);
if (!is_resource($process)) throw new RuntimeException('No se pudo iniciar servidor.');
try {
    for ($i = 0; $i < 50; $i++) { $socket = @stream_socket_client('tcp://127.0.0.1:' . $port, $e, $m, .1); if (is_resource($socket)) { fclose($socket); break; } usleep(100000); }
    $body = json_encode(['username' => 'bedelia-private', 'password' => 'incorrecta'], JSON_THROW_ON_ERROR);
    $context = stream_context_create(['http' => ['method' => 'POST', 'ignore_errors' => true, 'header' => 'Content-Type: application/json', 'content' => $body]]);
    $response = @file_get_contents('http://127.0.0.1:' . $port . '/admin/auth/login', false, $context);
    if ($response === false || !str_contains($http_response_header[0] ?? '', '401')) throw new RuntimeException('Login inválido no respondió 401.');
    foreach (['bedelia-private', $password, 'token-private-demo', 'SELECT ', 'ifts14_cert_admin=', 'csrfToken'] as $forbidden) if (str_contains($response, $forbidden)) throw new RuntimeException('Respuesta de auth filtró dato sensible.');
} finally {
    proc_terminate($process); proc_close($process); putenv($previous === false ? 'CERTIFICADOS_CONFIG_PATH' : 'CERTIFICADOS_CONFIG_PATH=' . $previous);
    array_map(static fn (string $file): bool => is_file($file) ? unlink($file) : true, glob($tmp . '/*') ?: []); rmdir($tmp);
}
echo "OK AuthPrivacyTest\n";
