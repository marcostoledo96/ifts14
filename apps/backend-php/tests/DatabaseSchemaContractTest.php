<?php

declare(strict_types=1);

/**
 * Schema contract test (REQ-MDB-003).
 *
 * Verifica que el esquema aplicado por las migraciones 001-013 coincide con
 * lo esperado: tablas presentes, columnas clave, tipos y enums. Hard-fail si
 * la DB no está disponible o el esquema no cumple.
 *
 * No usa SKIP: en CI la DB siempre debe estar disponible.
 */

$dsn = getenv('IFTS14_TEST_DB_DSN');
$user = getenv('IFTS14_TEST_DB_USER') ?: 'root';
$pass = getenv('IFTS14_TEST_DB_PASS') ?: '';

if (!is_string($dsn) || $dsn === '' || getenv('IFTS14_TEST_DB_ALLOW_RESET') !== '1') {
    fwrite(STDERR, "FATAL: DatabaseSchemaContractTest requires IFTS14_TEST_DB_DSN and IFTS14_TEST_DB_ALLOW_RESET=1 on a disposable DB.\n");
    exit(1);
}

try {
    $pdo = new PDO($dsn, $user, $pass, [
        PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
        PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
        PDO::ATTR_EMULATE_PREPARES => false,
    ]);
} catch (Throwable $e) {
    fwrite(STDERR, "FATAL: No se pudo conectar a MariaDB: " . $e->getMessage() . "\n");
    exit(1);
}

/**
 * Tablas que DEBEN existir tras las migraciones 001-013.
 * Derivado de las migraciones versionadas (no hardcodeado de memoria).
 */
$expectedTables = [
    'cert_certificados',
    'cert_tokens_verificacion',
    'cert_eventos_auditoria',
    'cert_alumnos',
    'cert_cursos',
    'cert_curso_fechas',
    'cert_asistencias',
    'cert_certificado_fechas',
    'cert_configuracion_institucional',
    'cert_parametros_sistema',
    'cert_schema_migrations',
];

/**
 * Columnas clave por tabla: [tabla => [col => tipo-esperado-substr]].
 * El tipo se valida por substring (más tolerante a variaciones de longitud/signo).
 */
$expectedColumns = [
    'cert_certificados' => [
        'id' => 'bigint',
        'codigo_certificado' => 'varchar',
        'estado' => 'enum',
        'alumno_id' => 'bigint',
        'curso_id' => 'bigint',
        'contenido_revision' => 'int',
        'pdf_estado' => 'enum',
        'certificado_bloqueo_activo' => 'tinyint',
    ],
    'cert_tokens_verificacion' => [
        'token_hash' => 'binary',
        'token_cifrado' => 'varbinary',
        'estado' => 'enum',
    ],
    'cert_eventos_auditoria' => [
        'tipo_evento' => 'enum',
        'resultado' => 'enum',
    ],
    'cert_alumnos' => [
        'dni_hash' => 'binary',
        'dni_cifrado' => 'varbinary',
        'apellido_nombre' => 'varchar',
        'apellido' => 'varchar',
        'nombre' => 'varchar',
        'estado' => 'enum',
    ],
    'cert_cursos' => [
        'codigo' => 'varchar',
        'estado' => 'enum',
    ],
    'cert_curso_fechas' => [
        'curso_id' => 'bigint',
        'fecha' => 'date',
        'orden' => 'smallint',
    ],
    'cert_asistencias' => [
        'alumno_id' => 'bigint',
        'curso_fecha_id' => 'bigint',
        'asistencia_activa' => 'tinyint',
    ],
    'cert_certificado_fechas' => [
        'certificado_id' => 'bigint',
        'curso_fecha_id' => 'bigint',
        'orden' => 'smallint',
    ],
    'cert_configuracion_institucional' => [
        'institucion_nombre' => 'varchar',
        'rector_nombre' => 'varchar',
        'texto_certificado' => 'text',
    ],
    'cert_parametros_sistema' => [
        'clave' => 'varchar',
        'valor' => 'text',
        'tipo' => 'enum',
        'grupo' => 'enum',
        'etiqueta' => 'varchar',
        'updated_at' => 'datetime',
    ],
    'cert_schema_migrations' => [
        'version' => 'varchar',
        'aplicado_en' => 'datetime',
    ],
];

/**
 * Enums que DEBEN contener ciertos valores (verificación post-006 y post-009).
 * [tabla.col => [valores-esperados]].
 */
$expectedEnumValues = [
    'cert_cursos.estado' => ['borrador', 'activo', 'cerrado', 'archivado'],
    'cert_certificados.estado' => ['vigente', 'revocado'],
    'cert_certificados.pdf_estado' => ['vigente', 'desactualizado', 'no_generado'],
    'cert_eventos_auditoria.tipo_evento' => ['emision', 'verificacion', 'revocacion', 'reenvio', 'error', 'sync_snapshot'],
    'cert_parametros_sistema.tipo' => ['texto', 'textarea', 'url', 'email'],
    'cert_parametros_sistema.grupo' => ['identidad', 'certificados', 'contacto', 'validacion'],
];

$failures = [];

// 1. Tablas presentes.
$present = array_flip(
    $pdo->query("SHOW TABLES")->fetchAll(PDO::FETCH_COLUMN)
);
foreach ($expectedTables as $table) {
    if (!isset($present[$table])) {
        $failures[] = "Tabla faltante: $table";
    }
}

// 2. Columnas y tipos (solo tablas presentes).
foreach ($expectedColumns as $table => $cols) {
    if (!isset($present[$table])) {
        continue; // ya reportado arriba
    }
    $rows = $pdo->query("SHOW COLUMNS FROM `$table`")->fetchAll();
    $byName = [];
    foreach ($rows as $row) {
        $byName[$row['Field']] = strtolower((string) $row['Type']);
    }
    foreach ($cols as $col => $typeSubstr) {
        if (!isset($byName[$col])) {
            $failures[] = "Columna faltante: $table.$col";
            continue;
        }
        if (!str_contains($byName[$col], $typeSubstr)) {
            $failures[] = "Tipo inesperado en $table.$col: esperado '$typeSubstr', encontrado '{$byName[$col]}'";
        }
    }
}

// 3. Enum values.
foreach ($expectedEnumValues as $qualified => $values) {
    [$table, $col] = explode('.', $qualified, 2);
    if (!isset($present[$table])) {
        continue;
    }
    $rows = $pdo->query("SHOW COLUMNS FROM `$table` LIKE " . $pdo->quote($col))->fetchAll();
    if (empty($rows)) {
        $failures[] = "Columna enum faltante: $qualified";
        continue;
    }
    $type = (string) $rows[0]['Type'];
    if (!preg_match('/^enum\((.*)\)$/i', $type, $m)) {
        $failures[] = "$qualified no es enum: $type";
        continue;
    }
    $declared = array_map(
        static fn (string $v): string => trim($v, "'\""),
        explode(',', $m[1])
    );
    foreach ($values as $expected) {
        if (!in_array($expected, $declared, true)) {
            $failures[] = "Valor enum faltante en $qualified: '$expected'";
        }
    }
}

// 4. Versiones de migración registradas (007-010 al menos).
$migrationsApplied = $pdo->query(
    "SELECT version FROM cert_schema_migrations ORDER BY version"
)->fetchAll(PDO::FETCH_COLUMN);
foreach (['007', '008', '009', '010'] as $v) {
    if (!in_array($v, $migrationsApplied, true)) {
        $failures[] = "Migración no registrada en cert_schema_migrations: $v";
    }
}

if (!empty($failures)) {
    fwrite(STDERR, "FAIL DatabaseSchemaContractTest: " . count($failures) . " discrepancia(s):\n");
    foreach ($failures as $f) {
        fwrite(STDERR, "  - $f\n");
    }
    exit(1);
}

echo "OK DatabaseSchemaContractTest\n";
exit(0);