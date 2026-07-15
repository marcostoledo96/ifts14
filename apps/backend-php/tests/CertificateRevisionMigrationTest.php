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

$migrations = glob(__DIR__ . '/../../../database/migrations/*.sql') ?: [];
sort($migrations);

// Apply up to 007
foreach ($migrations as $path) {
    if (basename($path) > '007_schema_migrations.sql') continue;

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

// Insert a legacy certificate before 008
$pdo->exec("INSERT INTO cert_alumnos (id, dni_hash, dni_cifrado, dni_mostrar, apellido_nombre) VALUES (1, 0x1234, 0x1234, '1234', 'Juan')");
$pdo->exec("INSERT INTO cert_cursos (id, codigo, nombre, estado) VALUES (1, 'C1', 'Curso 1', 'activo')");
$pdo->exec("INSERT INTO cert_certificados (alumno_id, curso_id, codigo_certificado, alumno_nombre_mostrar, documento_enmascarado, curso_nombre, emitido_en, estado) 
            VALUES (1, 1, 'LEGACY', 'Juan', '123', 'Curso', '2026-01-01', 'vigente')");

// Apply 008 and onwards
foreach ($migrations as $path) {
    if (basename($path) <= '007_schema_migrations.sql') continue;

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

$legacy = $pdo->query("SELECT pdf_estado, pdf_generado_revision FROM cert_certificados WHERE codigo_certificado = 'LEGACY'")->fetch();
if ($legacy['pdf_estado'] !== 'vigente' || (int)$legacy['pdf_generado_revision'] !== 1) {
    throw new RuntimeException('La migración de backfill no actualizó correctamente el PDF legacy');
}

$version010 = (int) $pdo->query(
    "SELECT COUNT(*)
     FROM cert_schema_migrations
     WHERE version = '010'"
)->fetchColumn();

if ($version010 !== 1) {
    throw new RuntimeException(
        'La migración 010 no quedó registrada.'
    );
}

echo "OK CertificateRevisionMigrationTest\n";
