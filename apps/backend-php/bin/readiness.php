<?php

declare(strict_types=1);

if (php_sapi_name() !== 'cli') {
    http_response_code(403);
    echo "CLI only\n";
    exit(1);
}

require_once __DIR__ . '/../src/Config.php';
require_once __DIR__ . '/../src/Database.php';
require_once __DIR__ . '/../src/TokenCipher.php';
require_once __DIR__ . '/../src/DniCipher.php';

$exitCode = 0;
ob_start();

function check(string $name, callable $fn): void {
    global $exitCode;
    try {
        $result = $fn();
        if ($result === true || $result === null) {
            echo "{$name}: OK\n";
        } else {
            echo "{$name}: FAIL\n";
            $exitCode = 1;
        }
    } catch (Throwable $e) {
        echo "{$name}: FAIL\n";
        $exitCode = 1;
    }
}

check('OpenSSL', fn() => extension_loaded('openssl'));
check('GD', fn() => extension_loaded('gd'));
check('mbstring', fn() => extension_loaded('mbstring'));
check('Composer Autoload', fn() => file_exists(__DIR__ . '/../vendor/autoload.php'));
check('Timezone', fn() => date_default_timezone_get() !== '');

$config = null;
check('Config', function() use (&$config) {
    $config = Config::load();
    return true;
});

if ($config === null) {
    $config = [];
}

check('Admin Session Config', fn() => Config::adminSessionSettings($config) !== null);

check('PHP Session Storage', function() {
    if (session_status() !== PHP_SESSION_NONE) {
        return false;
    }

    session_name('ifts14_readiness');
    $key = '__readiness';
    $value = bin2hex(random_bytes(16));
    if (!@session_start()) {
        return false;
    }
    $_SESSION[$key] = $value;
    if (!session_write_close() || !@session_start()) {
        return false;
    }
    $valid = ($_SESSION[$key] ?? null) === $value;
    $_SESSION = [];

    return $valid && @session_destroy();
});

check('Token Encryption Key', function() use ($config) {
    $encoded = $config['token_encryption_key'] ?? '';
    TokenCipher::key($encoded);
    return true;
});

check('DNI Cipher Key', function() use ($config) {
    $encoded = $config['dni_cipher_key'] ?? '';
    DniCipher::key($encoded);
    return true;
});

check('Storage PDF', function() use ($config) {
    $path = $config['certificate_storage_path'] ?? '';
    return is_dir($path) && is_writable($path);
});

check('Rate Limiter', function() use ($config) {
    $path = $config['rate_limit_storage_path'] ?? '';
    if (is_file($path)) {
        return is_writable($path);
    }
    $dir = dirname((string) $path);
    return is_dir($dir) && is_writable($dir);
});

check('PDO/MariaDB', function() use ($config) {
    Database::pdo($config);
    return true;
});

check('Migraciones', function() use ($config) {
    $pdo = Database::pdo($config);
    try {
        $stmt = $pdo->query(
            "SELECT COUNT(DISTINCT version)
             FROM cert_schema_migrations
             WHERE version IN ('008', '009', '010', '011', '012', '013')"
        );
        if (((int) $stmt->fetchColumn()) !== 6) {
            return false;
        }

        $pdo->query("SELECT contenido_revision, pdf_estado, pdf_generado_revision FROM cert_certificados LIMIT 1");
        $pdo->query("SELECT apellido, nombre FROM cert_alumnos LIMIT 1");
        $pdo->query("SELECT clave, valor FROM cert_parametros_sistema LIMIT 1");
        return true;
    } catch (PDOException $e) {
        return false;
    }
});

ob_end_flush();
exit($exitCode);
