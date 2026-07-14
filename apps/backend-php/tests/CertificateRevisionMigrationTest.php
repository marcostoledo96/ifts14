<?php

declare(strict_types=1);

$dsn = getenv('IFTS14_TEST_DB_DSN');
$user = getenv('IFTS14_TEST_DB_USER') ?: 'root';
$pass = getenv('IFTS14_TEST_DB_PASS') ?: '';

if (!is_string($dsn) || $dsn === '' || getenv('IFTS14_TEST_DB_ALLOW_RESET') !== '1') {
    echo "SKIP CertificateRevisionMigrationTest: requiere IFTS14_TEST_DB_DSN e IFTS14_TEST_DB_ALLOW_RESET=1 sobre una DB descartable.\n";
    return;
}

$pdo = new PDO($dsn, $user, $pass, [
    PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
    PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
    PDO::ATTR_EMULATE_PREPARES => false,
]);

$pdo->exec('SET FOREIGN_KEY_CHECKS=0');
foreach (['cert_configuracion_institucional', 'cert_certificado_fechas', 'cert_asistencias', 'cert_curso_fechas', 'cert_cursos', 'cert_alumnos', 'cert_eventos_auditoria', 'cert_tokens_verificacion', 'cert_certificados', 'cert_schema_migrations'] as $table) {
    $pdo->exec('DROP TABLE IF EXISTS ' . $table);
}
$pdo->exec('SET FOREIGN_KEY_CHECKS=1');

foreach (glob(__DIR__ . '/../../../database/migrations/*.sql') ?: [] as $path) {
    // RED: if we haven't applied 008, the test should fail when querying the new columns.
    // GREEN: once 008 is created, the glob will include it, and the columns will exist.
    $sql = file_get_contents($path);
    if (!is_string($sql)) continue;

    $sql = implode("\n", array_filter(
        explode("\n", $sql),
        static fn (string $line): bool => !str_starts_with(trim($line), '--')
    ));

    foreach (array_filter(array_map('trim', explode(';', $sql))) as $statement) {
        if (str_starts_with(strtoupper($statement), 'SELECT ') || str_starts_with(strtoupper($statement), 'DELIMITER ')) {
            continue;
        }
        $pdo->exec($statement);
    }
}

// Check if new columns exist
$statement = $pdo->query('SHOW COLUMNS FROM cert_certificados');
$columns = [];
while ($row = $statement->fetch()) {
    $columns[] = $row['Field'];
}

$expectedColumns = [
    'contenido_revision',
    'contenido_actualizado_en',
    'pdf_estado',
    'pdf_generado_revision',
];

$missing = array_diff($expectedColumns, $columns);
if ($missing !== []) {
    throw new RuntimeException('Faltan columnas de revisión en cert_certificados: ' . implode(', ', $missing));
}

$pdo->query('SELECT contenido_revision, contenido_actualizado_en, pdf_estado, pdf_generado_revision FROM cert_certificados LIMIT 1');

echo "OK CertificateRevisionMigrationTest\n";
