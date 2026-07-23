<?php

declare(strict_types=1);

require_once __DIR__ . '/../src/AdminCertificateService.php';
require_once __DIR__ . '/../src/CertificateValidator.php';
require_once __DIR__ . '/../src/CertificatePdfService.php';

$dsn = getenv('IFTS14_TEST_DB_DSN');
$user = getenv('IFTS14_TEST_DB_USER') ?: 'root';
$pass = getenv('IFTS14_TEST_DB_PASS') ?: '';

if (!is_string($dsn) || $dsn === '' || getenv('IFTS14_TEST_DB_ALLOW_RESET') !== '1') {
    fwrite(STDERR, "FATAL: SnapshotEmissionTest requires IFTS14_TEST_DB_DSN and IFTS14_TEST_DB_ALLOW_RESET=1 on a disposable DB.\n");
    exit(1);
}

final class CommitFailingPdo extends PDO
{
    public bool $failCommit = false;

    public function commit(): bool
    {
        if ($this->failCommit) {
            throw new RuntimeException('Commit fail injected.');
        }

        return parent::commit();
    }
}

$pdo = new CommitFailingPdo($dsn, $user, $pass, [
    PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
    PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
    PDO::ATTR_EMULATE_PREPARES => false,
]);

resetSchema($pdo);
applySqlFile($pdo, __DIR__ . '/../../../database/migrations/001_certificados_qr.sql');
applySqlFile($pdo, __DIR__ . '/../../../database/migrations/002_token_cifrado_entrega_manual.sql');
applySqlFile($pdo, __DIR__ . '/../../../database/migrations/003_cursos_alumnos_asistencias.sql');
applySqlFile($pdo, __DIR__ . '/../../../database/migrations/004_certificados_alumno_curso.sql');
applySqlFile($pdo, __DIR__ . '/../../../database/migrations/005_prevenir_certificados_duplicados.sql');
applySqlFile($pdo, __DIR__ . '/../../../database/migrations/006_reconciliar_esquema_m4_02.sql');
applySqlFile($pdo, __DIR__ . '/../../../database/migrations/007_schema_migrations.sql');
applySqlFile($pdo, __DIR__ . '/../../../database/migrations/008_certificados_revision_contenido.sql');
applySqlFile($pdo, __DIR__ . '/../../../database/migrations/009_auditoria_sync_snapshot.sql');
applySqlFile($pdo, __DIR__ . '/../../../database/migrations/010_backfill_pdf_revision.sql');
applySqlFile($pdo, __DIR__ . '/../../../database/migrations/011_alumnos_email_opcional.sql');
applySqlFile($pdo, __DIR__ . '/../../../database/migrations/012_alumnos_apellido_nombre_separados.sql');
applySqlFile($pdo, __DIR__ . '/../../../database/migrations/013_parametros_sistema.sql');
applySqlFile($pdo, __DIR__ . '/../../../database/migrations/014_firmas_autoridades.sql');

$tokenKey = str_repeat('t', 32);
$dniKey = str_repeat('d', 32);
$pepper = 'pepper_snapshot_demo';
$storage = sys_get_temp_dir() . '/ifts14-snapshot-pdf-' . bin2hex(random_bytes(4));
$pdf = new CertificatePdfService($storage);

$dni = '12345678';
$dniCipher = DniCipher::encrypt($dni, $dniKey);
$dniHash = hash('sha256', $dni, true);

$pdo->prepare('INSERT INTO cert_alumnos (apellido_nombre, apellido, nombre, dni_hash, dni_cifrado, dni_mostrar, estado) VALUES (?, ?, ?, ?, ?, ?, \'activo\')')
    ->execute(['Alumno Demo', 'Alumno', 'Demo', $dniHash, $dniCipher, '12345678']);
$alumnoId = (int) $pdo->lastInsertId();

$pdo->prepare('INSERT INTO cert_cursos (codigo, nombre, estado) VALUES (?, ?, \'activo\')')
    ->execute(['CUR-DEMO', 'Curso Demo']);
$cursoId = (int) $pdo->lastInsertId();

$insertDate = $pdo->prepare('INSERT INTO cert_curso_fechas (curso_id, fecha, descripcion, orden, estado) VALUES (?, ?, ?, ?, ?)');
$insertDate->execute([$cursoId, '2026-06-01', 'Clase 1', 1, 'realizada']);
$fecha1 = (int) $pdo->lastInsertId();
$insertDate->execute([$cursoId, '2026-06-08', 'Clase 2', 2, 'realizada']);
$fecha2 = (int) $pdo->lastInsertId();
$insertDate->execute([$cursoId, '2026-06-15', 'Cancelada', 3, 'cancelada']);
$fechaCancelada = (int) $pdo->lastInsertId();

$insertAttendance = $pdo->prepare('INSERT INTO cert_asistencias (alumno_id, curso_fecha_id, eliminado_en) VALUES (?, ?, ?)');
$insertAttendance->execute([$alumnoId, $fecha1, null]);
$insertAttendance->execute([$alumnoId, $fecha2, null]);
$insertAttendance->execute([$alumnoId, $fechaCancelada, null]);

$pdo->prepare('INSERT INTO cert_configuracion_institucional (id, institucion_nombre, rector_nombre, rector_cargo, asesor_nombre, asesor_cargo, texto_certificado) VALUES (1, ?, ?, ?, ?, ?, ?)')
    ->execute(['IFTS 14 Demo', 'Rector Demo', 'Rector', 'Asesora Demo', 'Asesora Pedagogica', 'Texto institucional demo.']);

$service = new AdminCertificateService($pdo, $pepper, 'req_snapshot', null, 'salt_snapshot', $pdf, 'https://demo.example.edu.ar/certificados', $tokenKey, null, $dniKey);
$result = $service->emitir([
    'alumnoId' => $alumnoId,
    'cursoId' => $cursoId,
    'issuedAt' => '2026-07-02',
    'expiresAt' => null,
]);

if (($result['student']['documentMasked'] ?? '') !== '12345678' || !isset($result['publicValidationUrl'], $result['pdfDownloadUrl'], $result['tokenPrefix'])) {
    throw new RuntimeException('DTO administrativo seguro inválido.');
}

$certificateId = (int) $result['id'];
$pdfPath = $pdf->pathForCode((string) $result['certificateCode']);
assertPdfPersisted($pdfPath, 'PDF institucional con configuración', ['IFTS 14 Demo', 'Texto institucional demo.', 'Rector Demo', 'Rector', 'Asesora Demo', 'Asesora Pedagogica']);

$snapshotCount = (int) $pdo->query('SELECT COUNT(*) FROM cert_certificado_fechas WHERE certificado_id = ' . $certificateId)->fetchColumn();
if ($snapshotCount !== 2) {
    throw new RuntimeException('El snapshot no excluyó asistencias canceladas/eliminadas.');
}

$token = basename((string) parse_url((string) $result['publicValidationUrl'], PHP_URL_PATH));
$validator = new CertificateValidator([
    'db_host' => '',
    'db_name' => '',
    'db_user' => '',
    'db_pass' => '',
    'token_pepper' => $pepper,
], $dniKey);
injectValidatorPdo($pdo);
$verified = $validator->verify($token, 'req_verify_snapshot');
if (($verified['status'] ?? 0) !== 200 || ($verified['data']['student']['documentNumber'] ?? '') !== $dni || ($verified['data']['course']['attendedDates'] ?? []) !== ['2026-06-01', '2026-06-08']) {
    throw new RuntimeException('Validación pública desde snapshot inválida.');
}

$pdo->prepare('UPDATE cert_asistencias SET eliminado_en = CURRENT_TIMESTAMP WHERE alumno_id = ? AND curso_fecha_id = ?')->execute([$alumnoId, $fecha1]);
$verifiedAfterDelete = $validator->verify($token, 'req_verify_snapshot_after_delete');
if (($verifiedAfterDelete['data']['course']['attendedDates'] ?? []) !== ['2026-06-01', '2026-06-08']) {
    throw new RuntimeException('La validación recalculó asistencias vivas en vez de usar snapshot.');
}

$pdo->prepare('UPDATE cert_curso_fechas SET fecha = ?, descripcion = ?, orden = ? WHERE id = ?')->execute(['2099-01-01', 'Clase mutada', 99, $fecha2]);
$verifiedAfterCourseDateChange = $validator->verify($token, 'req_verify_snapshot_after_course_date_change');
if (($verifiedAfterCourseDateChange['data']['course']['attendedDates'] ?? []) !== ['2026-06-01', '2026-06-08']) {
    throw new RuntimeException('La validación usó fechas vivas modificadas en vez del snapshot.');
}

$validatorWithoutDniKey = new CertificateValidator([
    'db_host' => '',
    'db_name' => '',
    'db_user' => '',
    'db_pass' => '',
    'token_pepper' => $pepper,
]);
$dniKeyFailure = $validatorWithoutDniKey->verify($token, 'req_verify_snapshot_no_dni_key');
if (($dniKeyFailure['status'] ?? 0) !== 500 || ($dniKeyFailure['error']['code'] ?? '') !== 'CONFIGURATION_ERROR') {
    throw new RuntimeException('Validación pública sin dni_cipher_key no falló cerrada.');
}

$beforeDuplicate = tableCounts($pdo);
$directDuplicateRejected = false;
try {
    $pdo->prepare('INSERT INTO cert_certificados (alumno_id, curso_id, codigo_certificado, estado, alumno_nombre_mostrar, documento_enmascarado, curso_nombre, emitido_en) VALUES (?, ?, ?, \'vigente\', ?, ?, ?, ?)')
        ->execute([$alumnoId, $cursoId, 'CERT-DIRECT-DUP', 'Alumno Demo', '12345678', 'Curso Demo', '2026-07-02']);
} catch (PDOException $e) {
    $directDuplicateRejected = ($e->errorInfo[0] ?? $e->getCode()) === '23000';
}
if (!$directDuplicateRejected || tableCounts($pdo) !== $beforeDuplicate) {
    throw new RuntimeException('Constraint DB no rechazó duplicado vigente directo.');
}

$duplicateRejected = false;
try {
    $service->emitir([
        'alumnoId' => $alumnoId,
        'cursoId' => $cursoId,
        'issuedAt' => '2026-07-02',
        'expiresAt' => null,
    ]);
} catch (AdminCertificateException $e) {
    $duplicateRejected = $e->status === 409 && $e->errorCode === 'CERTIFICATE_ALREADY_EXISTS';
}
if (!$duplicateRejected || tableCounts($pdo) !== $beforeDuplicate) {
    throw new RuntimeException('Duplicado vigente no rechazó sin persistir filas.');
}

$pdo->exec('DELETE FROM cert_configuracion_institucional WHERE id = 1');
// El fallback institucional reutiliza el par alumno+curso: revocar el certificado previo libera el slot.
$pdo->prepare('UPDATE cert_certificados SET estado = \'revocado\', revocado_en = CURRENT_TIMESTAMP WHERE id = ?')->execute([$certificateId]);
$fallbackResult = $service->emitir([
    'alumnoId' => $alumnoId,
    'cursoId' => $cursoId,
    'issuedAt' => '2026-07-02',
    'expiresAt' => null,
]);
if (($fallbackResult['status'] ?? '') !== 'vigente' || !isset($fallbackResult['publicValidationUrl'], $fallbackResult['pdfDownloadUrl'], $fallbackResult['tokenPrefix'])) {
    throw new RuntimeException('Emisión con configuración ausente no conservó DTO administrativo.');
}
assertPdfPersisted($pdf->pathForCode((string) $fallbackResult['certificateCode']), 'PDF institucional con fallback');

$fallbackCertificateId = (int) $fallbackResult['id'];
$pdo->prepare('UPDATE cert_certificados SET vence_en = CURRENT_DATE - INTERVAL 1 DAY WHERE id = ?')->execute([$fallbackCertificateId]);
$pastDueStillVigenteRejected = false;
try {
    $service->emitir([
        'alumnoId' => $alumnoId,
        'cursoId' => $cursoId,
        'issuedAt' => '2026-07-02',
        'expiresAt' => null,
    ]);
} catch (AdminCertificateException $e) {
    $pastDueStillVigenteRejected = $e->status === 409 && $e->errorCode === 'CERTIFICATE_ALREADY_EXISTS';
}
if (!$pastDueStillVigenteRejected) {
    throw new RuntimeException('Certificado con vence_en pasado pero estado vigente no bloqueó.');
}

$pdo->prepare('UPDATE cert_certificados SET estado = \'vencido\' WHERE id = ?')->execute([$fallbackCertificateId]);
$expiredStateResult = $service->emitir([
    'alumnoId' => $alumnoId,
    'cursoId' => $cursoId,
    'issuedAt' => '2026-07-02',
    'expiresAt' => null,
]);
if (($expiredStateResult['status'] ?? '') !== 'vigente') {
    throw new RuntimeException('Certificado con estado vencido bloqueó una nueva emisión.');
}

$pdo->prepare('UPDATE cert_certificados SET estado = \'revocado\', revocado_en = CURRENT_TIMESTAMP WHERE id = ?')->execute([(int) $expiredStateResult['id']]);
$pdo->prepare('INSERT INTO cert_certificados (codigo_certificado, estado, alumno_nombre_mostrar, documento_enmascarado, curso_nombre, emitido_en) VALUES (?, \'vigente\', ?, ?, ?, ?)')
    ->execute(['CERT-LEGACY-NULL', 'Legacy Null', '00****00', 'Curso Legacy', '2026-07-01']);
$legacyNullResult = $service->emitir([
    'alumnoId' => $alumnoId,
    'cursoId' => $cursoId,
    'issuedAt' => '2026-07-02',
    'expiresAt' => null,
]);
if (($legacyNullResult['status'] ?? '') !== 'vigente') {
    throw new RuntimeException('Certificado legacy sin alumno/curso bloqueó una nueva emisión.');
}

$pdo->prepare('UPDATE cert_certificados SET estado = \'revocado\', revocado_en = CURRENT_TIMESTAMP WHERE id = ?')->execute([(int) $legacyNullResult['id']]);
$pdo->prepare('UPDATE cert_asistencias SET eliminado_en = CURRENT_TIMESTAMP WHERE alumno_id = ? AND curso_fecha_id = ?')->execute([$alumnoId, $fecha2]);
$beforeNoAttendance = tableCounts($pdo);
$noAttendanceRejected = false;
try {
    $service->emitir([
        'alumnoId' => $alumnoId,
        'cursoId' => $cursoId,
        'issuedAt' => '2026-07-02',
        'expiresAt' => null,
    ]);
} catch (AdminCertificateException $e) {
    $noAttendanceRejected = $e->status === 400 && $e->errorCode === 'VALIDATION_ERROR';
}

if (!$noAttendanceRejected || tableCounts($pdo) !== $beforeNoAttendance) {
    throw new RuntimeException('Emisión sin asistencias activas no rechazó sin persistir filas.');
}

$pdfFilesBefore = glob($storage . '/*.pdf') ?: [];
$pdo->prepare('UPDATE cert_asistencias SET eliminado_en = NULL WHERE alumno_id = ? AND curso_fecha_id = ?')->execute([$alumnoId, $fecha1]);
$beforePdfFailureWithRestoredAttendance = tableCounts($pdo);
$pdo->failCommit = true;
$pdfFailureRolledBack = false;
try {
    $service->emitir([
        'alumnoId' => $alumnoId,
        'cursoId' => $cursoId,
        'issuedAt' => '2026-07-02',
        'expiresAt' => null,
    ]);
} catch (RuntimeException $e) {
    $pdfFailureRolledBack = str_contains($e->getMessage(), 'Commit fail injected.');
} finally {
    $pdo->failCommit = false;
}

$pdfFilesAfter = glob($storage . '/*.pdf') ?: [];
if (!$pdfFailureRolledBack || tableCounts($pdo) !== $beforePdfFailureWithRestoredAttendance || $pdfFilesAfter !== $pdfFilesBefore) {
    throw new RuntimeException('Falla post-PDF no revirtió filas ni limpió PDF huérfano.');
}

$pdo->prepare('INSERT INTO cert_certificados (codigo_certificado, estado, alumno_nombre_mostrar, documento_enmascarado, curso_nombre, emitido_en) VALUES (?, \'vigente\', ?, ?, ?, ?)')
    ->execute(['CERT-LEGACY', 'Legacy Demo', '00****00', 'Curso Legacy', '2026-07-01']);
$legacyId = (int) $pdo->lastInsertId();
$legacyToken = 'TOKEN_LEGACY_DEMO_2026_1234567890AB';
$pdo->prepare('INSERT INTO cert_tokens_verificacion (certificado_id, token_hash, token_prefijo, estado) VALUES (?, ?, ?, \'activo\')')
    ->execute([$legacyId, hash('sha256', $legacyToken . $pepper, true), substr($legacyToken, 0, 12)]);
$legacy = $validator->verify($legacyToken, 'req_verify_legacy');
if (($legacy['status'] ?? 0) !== 200 || isset($legacy['data']['course']['attendedDates']) || !isset($legacy['data']['student']['documentMasked'])) {
    throw new RuntimeException('Fallback legacy inválido.');
}

echo "OK SnapshotEmissionTest\n";

function resetSchema(PDO $pdo): void
{
    $pdo->exec('SET FOREIGN_KEY_CHECKS=0');
    foreach (['cert_configuracion_institucional', 'cert_certificado_fechas', 'cert_asistencias', 'cert_curso_fechas', 'cert_cursos', 'cert_alumnos', 'cert_eventos_auditoria', 'cert_tokens_verificacion', 'cert_certificados'] as $table) {
        $pdo->exec('DROP TABLE IF EXISTS ' . $table);
    }
    $pdo->exec('SET FOREIGN_KEY_CHECKS=1');
}

function applySqlFile(PDO $pdo, string $path): void
{
    $sql = file_get_contents($path);
    if (!is_string($sql)) {
        throw new RuntimeException('No se pudo leer migración: ' . $path);
    }

    $sql = implode("\n", array_filter(
        explode("\n", $sql),
        static fn (string $line): bool => !str_starts_with(trim($line), '--')
    ));

    foreach (array_filter(array_map('trim', explode(';', $sql))) as $statement) {
        if (str_starts_with(strtoupper($statement), 'SELECT ')) {
            $pdo->query($statement)?->closeCursor();
            continue;
        }

        $pdo->exec($statement);
    }
}

function injectValidatorPdo(PDO $pdo): void
{
    $prop = new ReflectionProperty(Database::class, 'pdo');
    $prop->setValue(null, $pdo);
}

/** @return array{certificados:int,tokens:int,snapshot:int} */
function tableCounts(PDO $pdo): array
{
    return [
        'certificados' => (int) $pdo->query('SELECT COUNT(*) FROM cert_certificados')->fetchColumn(),
        'tokens' => (int) $pdo->query('SELECT COUNT(*) FROM cert_tokens_verificacion')->fetchColumn(),
        'snapshot' => (int) $pdo->query('SELECT COUNT(*) FROM cert_certificado_fechas')->fetchColumn(),
    ];
}

/** @param list<string> $expectedText */
function assertPdfPersisted(string $path, string $label, array $expectedText = []): void
{
    if (!is_file($path) || !is_readable($path)) {
        throw new RuntimeException($label . ': archivo PDF no persistido.');
    }

    $contents = file_get_contents($path, false, null, 0, 5);
    $size = filesize($path);
    if ($contents !== '%PDF-' || $size === false || $size <= 100) {
        throw new RuntimeException($label . ': binario PDF inválido.');
    }

    $fullContents = file_get_contents($path);
    if (!is_string($fullContents)) {
        throw new RuntimeException($label . ': PDF no legible.');
    }

    foreach ($expectedText as $text) {
        if (!str_contains($fullContents, $text)) {
            throw new RuntimeException($label . ': falta texto visible esperado: ' . $text . '.');
        }
    }
}
