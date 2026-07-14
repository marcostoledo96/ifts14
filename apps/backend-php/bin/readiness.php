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

check('Admin API Key', fn() => strlen($config['admin_api_key'] ?? '') >= 16);

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
        $stmt = $pdo->query("SELECT 1 FROM cert_schema_migrations WHERE version = '009' LIMIT 1");
        if ($stmt->fetchColumn() !== false) {
            return true;
        }
        return false;
    } catch (PDOException $e) {
        return false;
    }
});

exit($exitCode);
