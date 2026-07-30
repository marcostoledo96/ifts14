<?php

declare(strict_types=1);

require_once __DIR__ . '/../src/AdminSessionAuth.php';

$password = 'password-demo-auth';
$config = [
    'admin_username' => 'bedelia',
    'admin_password_hash' => password_hash($password, PASSWORD_DEFAULT),
    'admin_session_idle_seconds' => 14400,
    'admin_session_absolute_seconds' => 28800,
];

$production = AdminSessionAuth::settings($config, '/certificados');
if ($production === null || $production['name'] !== 'ifts14_cert_admin' || $production['path'] !== '/certificados/' || $production['lifetime'] !== 0 || !$production['secure'] || !$production['httponly'] || $production['samesite'] !== 'Strict') {
    throw new RuntimeException('La cookie de producción no respeta el contrato.');
}
if ($production['idleSeconds'] !== 14400 || $production['absoluteSeconds'] !== 28800) {
    throw new RuntimeException('Los TTL de sesión deben ser exactamente 14400/28800.');
}

$staging = AdminSessionAuth::settings($config, '/certificados_staging');
if ($staging === null || $staging['name'] !== 'ifts14_cert_stg_admin' || $staging['path'] !== '/certificados_staging/') {
    throw new RuntimeException('La cookie de staging no respeta el contrato.');
}

if (!AdminSessionAuth::credentialsValid($config, 'bedelia', $password) || AdminSessionAuth::credentialsValid($config, 'otra', $password) || AdminSessionAuth::credentialsValid($config, 'bedelia', 'incorrecta')) {
    throw new RuntimeException('La validación de credenciales no falla cerrada.');
}

$emptyPasswordConfig = $config;
$emptyPasswordConfig['admin_password_hash'] = password_hash('', PASSWORD_DEFAULT);
if (
    Config::adminSessionSettings($emptyPasswordConfig) !== null
    || AdminSessionAuth::credentialsValid($emptyPasswordConfig, 'bedelia', '')
    || AdminSessionAuth::credentialsValid($emptyPasswordConfig, '', '')
    || AdminSessionAuth::login($emptyPasswordConfig, '/certificados', 'bedelia', '', time()) !== false
    || AdminSessionAuth::login($emptyPasswordConfig, '/certificados', '', '', time()) !== false
) {
    throw new RuntimeException('Una contraseña vacía o ausente no debe autenticar ni habilitar configuración.');
}

$knownHashConfig = $config;
$knownHashConfig['admin_password_hash'] = '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2uheWG/igi.';
if (Config::adminSessionSettings($knownHashConfig) !== null) {
    throw new RuntimeException('Un hash bcrypt público conocido no debe habilitar sesión admin.');
}

$invalidTtlConfig = $config;
$invalidTtlConfig['admin_session_idle_seconds'] = 1;
if (AdminSessionAuth::settings([], '/certificados') !== null || AdminSessionAuth::settings($invalidTtlConfig, '/certificados') !== null) {
    throw new RuntimeException('La configuración inválida no falló cerrada.');
}

$csrf = AdminSessionAuth::csrfToken();
if (preg_match('/\A[A-Za-z0-9_-]{43}\z/', $csrf) !== 1 || !AdminSessionAuth::csrfValid(['csrfToken' => $csrf], $csrf) || AdminSessionAuth::csrfValid(['csrfToken' => $csrf], 'incorrecto')) {
    throw new RuntimeException('El token CSRF no cumple el contrato.');
}

$active = ['authenticated' => true, 'createdAt' => 100, 'lastSeen' => 200];
// Idle 14400: activo en lastSeen+14399; inactivo en lastSeen+14400. Absolute: inactivo en createdAt+28800.
if (
    !AdminSessionAuth::sessionIsActive($active, $config, 14599)
    || AdminSessionAuth::sessionIsActive($active, $config, 14600)
    || AdminSessionAuth::sessionIsActive($active, $config, 28900)
) {
    throw new RuntimeException('La vigencia de sesión no respeta idle/absolute.');
}

$tmpDir = sys_get_temp_dir() . '/ifts14-admin-session-auth-' . bin2hex(random_bytes(4));
mkdir($tmpDir, 0700);
$sessionDir = $tmpDir . '/sessions';
mkdir($sessionDir, 0700);
$rateDir = $tmpDir . '/rate';
mkdir($rateDir, 0700);
$previousSavePath = ini_get('session.save_path');
ini_set('session.save_path', $sessionDir);

try {
    $now = 1_700_000_000;
    $csrfLogin = AdminSessionAuth::login($config, '/certificados', 'bedelia', $password, $now);
    if (!is_string($csrfLogin) || $csrfLogin === '') {
        throw new RuntimeException('login de prueba no creó sesión.');
    }
    $sessionName = 'ifts14_cert_admin';
    $sessionId = session_id();
    if ($sessionId === '') {
        throw new RuntimeException('login de prueba sin session_id.');
    }
    $_COOKIE[$sessionName] = $sessionId;
    session_write_close();

    $later = $now + 90;
    $state = AdminSessionAuth::state($config, '/certificados', $later);
    if ($state === null || ($state['lastSeen'] ?? null) !== $later || ($state['csrfToken'] ?? null) !== $csrfLogin) {
        throw new RuntimeException('state() activo debe renovar lastSeen y devolver la sesión.');
    }

    // GET autorizado (authorize mutates=false) también renueva lastSeen + write_close (D-009).
    $authorizedAt = $later + 30;
    $authStatus = AdminSessionAuth::authorize($config, '/certificados', false, '', $authorizedAt);
    if ($authStatus !== 200) {
        throw new RuntimeException('authorize() GET debe devolver 200 con sesión activa.');
    }
    // Tras write_close, releer sesión desde storage para assert lastSeen persistido.
    if (session_status() === PHP_SESSION_ACTIVE) {
        session_write_close();
    }
    if (!AdminSessionAuth::start(AdminSessionAuth::settings($config, '/certificados'))) {
        throw new RuntimeException('No se pudo reabrir sesión tras authorize().');
    }
    if (($_SESSION['lastSeen'] ?? null) !== $authorizedAt) {
        throw new RuntimeException('authorize() GET debe renovar lastSeen en el storage de sesión.');
    }
    session_write_close();

    $rateConfig = $config + ['rate_limit_storage_path' => $rateDir . '/marker.json'];
    $server = ['REMOTE_ADDR' => '203.0.113.10'];
    if (AdminSessionAuth::allowLoginAttempt($rateConfig, $server) !== true) {
        throw new RuntimeException('allowLoginAttempt debe permitir el primer intento con storage usable.');
    }
    for ($i = 0; $i < 4; $i++) {
        if (AdminSessionAuth::allowLoginAttempt($rateConfig, $server) !== true) {
            throw new RuntimeException('allowLoginAttempt debe permitir hasta 5 intentos.');
        }
    }
    if (AdminSessionAuth::allowLoginAttempt($rateConfig, $server) !== false) {
        throw new RuntimeException('allowLoginAttempt con bucket>=5 debe devolver false (rate-limit).');
    }

    $blockedMarker = $tmpDir . '/not-a-dir';
    file_put_contents($blockedMarker, 'x');
    $brokenConfig = $config + ['rate_limit_storage_path' => $blockedMarker . '/marker.json'];
    if (AdminSessionAuth::allowLoginAttempt($brokenConfig, $server) !== null) {
        throw new RuntimeException('allowLoginAttempt con storage inutilizable debe devolver null (D-004).');
    }
} finally {
    if (session_status() === PHP_SESSION_ACTIVE) {
        session_write_close();
    }
    ini_set('session.save_path', is_string($previousSavePath) ? $previousSavePath : '');
    unset($_COOKIE['ifts14_cert_admin']);
    foreach (glob($sessionDir . '/*') ?: [] as $file) {
        unlink($file);
    }
    foreach (glob($rateDir . '/*') ?: [] as $file) {
        unlink($file);
    }
    @rmdir($sessionDir);
    @rmdir($rateDir);
    @unlink($tmpDir . '/not-a-dir');
    @rmdir($tmpDir);
}

echo "OK AdminSessionAuthTest\n";
