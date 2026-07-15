<?php

declare(strict_types=1);

$tmpDir = sys_get_temp_dir() . '/ifts14-readiness-test-' . bin2hex(random_bytes(4));
if (!mkdir($tmpDir, 0700) && !is_dir($tmpDir)) {
    throw new RuntimeException('No se pudo preparar el directorio temporal.');
}

$configPath = $tmpDir . '/config.php';
// Invalid config to test failures
file_put_contents($configPath, '<?php return ' . var_export([
    'db_host' => '127.0.0.1', // Will fail connection (usually)
    'db_name' => 'demo',
    'db_user' => 'demo',
    'db_pass' => 'demo',
    'token_pepper' => 'pep',
    'admin_username' => '',
    'admin_password_hash' => 'invalid',
    'admin_session_idle_seconds' => 1,
    'admin_session_absolute_seconds' => 1,
    'rate_limit_storage_path' => $tmpDir . '/invalid/path/rate.json', // Invalid dir
    'app_salt' => 'salt',
    'public_base_url' => 'http://localhost',
    'certificate_storage_path' => $tmpDir . '/invalid/path', // Invalid dir
    'token_encryption_key' => 'invalid_base64', // Invalid length/format
    'dni_cipher_key' => 'invalid_base64', // Invalid length/format
], true) . ';');

$previousConfigPath = getenv('CERTIFICADOS_CONFIG_PATH');
putenv('CERTIFICADOS_CONFIG_PATH=' . $configPath);

$output = [];
$exitCode = 0;
exec(PHP_BINARY . ' ' . escapeshellarg(dirname(__DIR__) . '/bin/readiness.php') . ' 2>&1', $output, $exitCode);

$positiveSessionOutput = [];
$positiveSessionExit = 0;
exec(PHP_BINARY . ' -d ' . escapeshellarg('session.save_path=' . $tmpDir) . ' ' . escapeshellarg(dirname(__DIR__) . '/bin/readiness.php') . ' 2>&1', $positiveSessionOutput, $positiveSessionExit);

$brokenSessionOutput = [];
$brokenSessionExit = 0;
exec(PHP_BINARY . ' -d ' . escapeshellarg('session.save_path=' . $tmpDir . '/missing') . ' ' . escapeshellarg(dirname(__DIR__) . '/bin/readiness.php') . ' 2>&1', $brokenSessionOutput, $brokenSessionExit);

putenv($previousConfigPath === false ? 'CERTIFICADOS_CONFIG_PATH' : 'CERTIFICADOS_CONFIG_PATH=' . $previousConfigPath);
array_map(static fn(string $file) => is_file($file) ? unlink($file) : true, glob($tmpDir . '/*') ?: []);
rmdir($tmpDir);

$outputStr = implode("\n", $output);

$failures = [
    'PDO/MariaDB' => 'FAIL',
    'Admin Session Config' => 'FAIL',
    'Token Encryption Key' => 'FAIL',
    'DNI Cipher Key' => 'FAIL',
    'Storage PDF' => 'FAIL',
    'Rate Limiter' => 'FAIL',
];

foreach ($failures as $check => $expected) {
    if (!str_contains($outputStr, $check . ': ' . $expected)) {
        throw new RuntimeException("Esperado {$expected} para {$check}, pero no se encontró en la salida.\n{$outputStr}");
    }
}

if ($exitCode === 0) {
    throw new RuntimeException("Se esperaba exit code > 0, se recibió 0.");
}

if (!str_contains(implode("\n", $brokenSessionOutput), 'PHP Session Storage: FAIL') || $brokenSessionExit === 0) {
    throw new RuntimeException('Readiness no detectó session.save_path inutilizable.');
}

if (!str_contains(implode("\n", $positiveSessionOutput), 'PHP Session Storage: OK')) {
    throw new RuntimeException('Readiness no completó el round-trip de session.save_path utilizable.');
}

echo "OK ReadinessTest\n";
