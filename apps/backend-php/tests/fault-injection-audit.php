<?php

declare(strict_types=1);

// Uso: CERTIFICADOS_CONFIG_PATH=/ruta/demo.php php apps/backend-php/tests/fault-injection-audit.php
require_once __DIR__ . '/../src/Config.php';
require_once __DIR__ . '/../src/Database.php';
require_once __DIR__ . '/../src/CertificateValidator.php';

$configPath = getenv('CERTIFICADOS_CONFIG_PATH');
assertDemoOnlyConfigPath(is_string($configPath) ? $configPath : '');

$config = Config::load();
assertDemoOnlyConfig($config);
$config['rate_limit_threshold'] = 1000;
$config['rate_limit_storage_path'] = sys_get_temp_dir() . '/ifts14-fault-injection-' . getmypid() . '.json';

$pdo = Database::pdo($config);
$backupTable = 'cert_eventos_auditoria_fault_bak';
$validator = new CertificateValidator($config);

try {
    assertTableMissing($pdo, $backupTable);
    $pdo->exec("RENAME TABLE cert_eventos_auditoria TO {$backupTable}");

    expectStatus($validator, 'TOKEN_DEMO_FICTICIO_VALIDO_2026_0001', 200, 'válido conserva 200');
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
