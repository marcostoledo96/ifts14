<?php

declare(strict_types=1);

// Uso: CERTIFICADOS_CONFIG_PATH=/ruta/demo.php php apps/backend-php/tests/fault-injection-audit.php
// CI MariaDB: con IFTS14_TEST_DB_* + IFTS14_TEST_DB_ALLOW_RESET=1 genera config demo temporal.
require_once __DIR__ . '/../src/Config.php';
require_once __DIR__ . '/../src/Database.php';
require_once __DIR__ . '/../src/CertificateValidator.php';

const FAULT_DEMO_TOKEN = 'TOKEN_DEMO_FICTICIO_VALIDO_2026_0001';
const FAULT_DEMO_PEPPER = 'pepper_demo_ficticio_2026_no_usar';

$configPath = getenv('CERTIFICADOS_CONFIG_PATH');
if (!is_string($configPath) || $configPath === '') {
    $configPath = bootstrapCiDemoConfigPath();
    putenv('CERTIFICADOS_CONFIG_PATH=' . $configPath);
    $_ENV['CERTIFICADOS_CONFIG_PATH'] = $configPath;
}
assertDemoOnlyConfigPath($configPath);

$config = Config::load();
assertDemoOnlyConfig($config);
$config['rate_limit_threshold'] = 1000;
$config['rate_limit_storage_path'] = sys_get_temp_dir() . '/ifts14-fault-injection-' . getmypid() . '.json';

$pdo = Database::pdo($config);
ensureFaultDemoToken($pdo, (string) $config['token_pepper']);
$backupTable = 'cert_eventos_auditoria_fault_bak';
$validator = new CertificateValidator($config);

try {
    assertTableMissing($pdo, $backupTable);
    $pdo->exec("RENAME TABLE cert_eventos_auditoria TO {$backupTable}");

    expectStatus($validator, FAULT_DEMO_TOKEN, 200, 'válido conserva 200');
    expectStatus($validator, 'TOKEN_DEMO_FICTICIO_NO_EXISTE_2026_0002', 404, 'no verificable conserva 404');
    expectStatus($validator, 'bad', 400, 'token inválido conserva 400');
} finally {
    if (tableExists($pdo, $backupTable) && !tableExists($pdo, 'cert_eventos_auditoria')) {
        $pdo->exec("RENAME TABLE {$backupTable} TO cert_eventos_auditoria");
    }

    if (is_file((string) $config['rate_limit_storage_path'])) {
        unlink((string) $config['rate_limit_storage_path']);
    }
}

if (!tableExists($pdo, 'cert_eventos_auditoria')) {
    throw new RuntimeException('La tabla de auditoría no fue restaurada.');
}

echo "OK fault-injection audit: 200/404/400 y tabla restaurada.\n";

function bootstrapCiDemoConfigPath(): string
{
    $dsn = getenv('IFTS14_TEST_DB_DSN');
    $user = getenv('IFTS14_TEST_DB_USER');
    $pass = getenv('IFTS14_TEST_DB_PASS');
    $allowReset = getenv('IFTS14_TEST_DB_ALLOW_RESET');

    if (
        !is_string($dsn) || $dsn === ''
        || !is_string($user) || $user === ''
        || !is_string($pass)
        || $allowReset !== '1'
    ) {
        throw new RuntimeException('Fault-injection audit refused: set CERTIFICADOS_CONFIG_PATH to an explicit demo/test config.');
    }

    $db = mysqlConfigFromDsnForFault($dsn);
    if (!hasDemoMarker($db['dbname'])) {
        throw new RuntimeException('Fault-injection audit refused: set CERTIFICADOS_CONFIG_PATH to an explicit demo/test config.');
    }

    $path = sys_get_temp_dir() . '/ifts14-fault-injection-config-demo-' . getmypid() . '.php';
    $config = [
        'db_host' => $db['host'],
        'db_name' => $db['dbname'],
        'db_user' => $user,
        'db_pass' => $pass,
        'token_pepper' => FAULT_DEMO_PEPPER,
        'rate_limit_threshold' => 1000,
        'rate_limit_window_seconds' => 60,
        'rate_limit_storage_path' => sys_get_temp_dir() . '/ifts14-fault-injection-rl.json',
        'admin_api_key' => 'admin_key_demo_test_no_usar',
        'admin_rate_limit_threshold' => 1000,
        'admin_rate_limit_window_seconds' => 60,
        'admin_rate_limit_storage_path' => sys_get_temp_dir() . '/ifts14-fault-injection-admin-rl.json',
        'dni_cipher_key' => '0123456789abcdef0123456789abcdef0123456789abcdef0123456789abcdef',
    ];
    $exported = var_export($config, true);
    if (file_put_contents($path, "<?php\n\ndeclare(strict_types=1);\n\nreturn {$exported};\n") === false) {
        throw new RuntimeException('No se pudo escribir la config demo temporal de fault-injection.');
    }

    register_shutdown_function(static function () use ($path): void {
        if (is_file($path)) {
            unlink($path);
        }
    });

    return $path;
}

/** @return array{host:string,dbname:string} */
function mysqlConfigFromDsnForFault(string $dsn): array
{
    if (preg_match('/^mysql:(.*)$/', $dsn, $matches) !== 1) {
        throw new RuntimeException('DSN de prueba inválido para fault-injection.');
    }

    parse_str(str_replace(';', '&', $matches[1]), $parts);
    if (!isset($parts['host'], $parts['dbname']) || !is_string($parts['host']) || !is_string($parts['dbname'])) {
        throw new RuntimeException('DSN de prueba incompleto para fault-injection.');
    }

    return ['host' => $parts['host'], 'dbname' => $parts['dbname']];
}

function ensureFaultDemoToken(PDO $pdo, string $pepper): void
{
    $tokenHash = hash('sha256', FAULT_DEMO_TOKEN . $pepper, true);
    $exists = $pdo->prepare(
        'SELECT 1 FROM cert_tokens_verificacion WHERE token_hash = ? AND estado = \'activo\' LIMIT 1'
    );
    $exists->execute([$tokenHash]);
    if ($exists->fetchColumn() !== false) {
        return;
    }

    $codigo = 'CERT-DEMO-FAULT-' . substr(bin2hex(random_bytes(4)), 0, 8);
    $insertCert = $pdo->prepare(<<<'SQL'
        INSERT INTO cert_certificados (
          codigo_certificado, estado, alumno_nombre_mostrar, documento_enmascarado,
          curso_nombre, emitido_en
        ) VALUES (?, 'vigente', 'Alumno Demo Fault', '********99', 'Curso Demo Fault', CURDATE())
    SQL);
    $insertCert->execute([$codigo]);
    $certId = (int) $pdo->lastInsertId();

    $insertToken = $pdo->prepare(<<<'SQL'
        INSERT INTO cert_tokens_verificacion (
          certificado_id, token_hash, token_prefijo, estado, vigente_desde
        ) VALUES (?, ?, ?, 'activo', NOW())
    SQL);
    $insertToken->execute([$certId, $tokenHash, substr(FAULT_DEMO_TOKEN, 0, 12)]);
}

function assertDemoOnlyConfigPath(string $path): void
{
    if ($path !== '' && hasDemoMarker($path)) {
        return;
    }

    throw new RuntimeException('Fault-injection audit refused: set CERTIFICADOS_CONFIG_PATH to an explicit demo/test config.');
}

/** @param array<string, mixed> $config */
function assertDemoOnlyConfig(array $config): void
{
    $dbName = (string) ($config['db_name'] ?? '');
    $tokenPepper = (string) ($config['token_pepper'] ?? '');

    if (hasDemoMarker($dbName) && hasDemoMarker($tokenPepper)) {
        return;
    }

    throw new RuntimeException('Fault-injection audit refused: use only demo/test config with explicit demo/test markers.');
}

function hasDemoMarker(string $value): bool
{
    $normalized = preg_replace('/[^a-z0-9]+/i', '_', $value) ?? '';

    return preg_match('/(^|_)(demo|test|testing|fixture|ficticio|example|no_usar)(_|$)/i', $normalized) === 1;
}

function expectStatus(CertificateValidator $validator, string $token, int $expected, string $label): void
{
    $result = $validator->verify($token, 'req_fault_injection');
    $actual = (int) $result['status'];

    if ($actual !== $expected) {
        throw new RuntimeException("{$label}: esperado {$expected}, recibido {$actual}.");
    }

    echo "OK {$label}\n";
}

function assertTableMissing(PDO $pdo, string $table): void
{
    if (tableExists($pdo, $table)) {
        throw new RuntimeException('Existe una tabla de respaldo previa; revisar la DB demo antes de continuar.');
    }
}

function tableExists(PDO $pdo, string $table): bool
{
    $statement = $pdo->prepare(<<<'SQL'
        SELECT 1
        FROM information_schema.tables
        WHERE table_schema = DATABASE()
          AND table_name = ?
        LIMIT 1
        SQL);
    $statement->execute([$table]);

    return $statement->fetchColumn() !== false;
}
