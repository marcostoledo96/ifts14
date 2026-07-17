<?php

declare(strict_types=1);

require_once __DIR__ . '/../src/AdminMasterDataService.php';
require_once __DIR__ . '/../src/AdminCertificateService.php';
require_once __DIR__ . '/../src/CertificatePdfService.php';
require_once __DIR__ . '/../src/CertificateValidator.php';

$dsn = getenv('IFTS14_TEST_DB_DSN');
$user = getenv('IFTS14_TEST_DB_USER') ?: 'root';
$pass = getenv('IFTS14_TEST_DB_PASS') ?: '';
if (!is_string($dsn) || $dsn === '' || getenv('IFTS14_TEST_DB_ALLOW_RESET') !== '1') {
    fwrite(STDERR, "FATAL: AttendanceRevisionTest requires IFTS14_TEST_DB_DSN and IFTS14_TEST_DB_ALLOW_RESET=1 on a disposable DB.\n");
    exit(1);
}

$pdo = new PDO($dsn, $user, $pass, [
    PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
    PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
    PDO::ATTR_EMULATE_PREPARES => false,
]);

// 0. Setup DB
$pdo->exec('SET FOREIGN_KEY_CHECKS=0');
foreach (['cert_configuracion_institucional', 'cert_certificado_fechas', 'cert_asistencias', 'cert_curso_fechas', 'cert_cursos', 'cert_alumnos', 'cert_eventos_auditoria', 'cert_tokens_verificacion', 'cert_certificados'] as $table) {
    $pdo->exec('DROP TABLE IF EXISTS ' . $table);
}
$pdo->exec('SET FOREIGN_KEY_CHECKS=1');

foreach (glob(__DIR__ . '/../../../database/migrations/*.sql') ?: [] as $path) {
    $sql = file_get_contents($path);
    if (!is_string($sql)) continue;
    $sql = implode("\n", array_filter(explode("\n", $sql), static fn ($l) => !str_starts_with(trim($l), '--')));
    foreach (array_filter(array_map('trim', explode(';', $sql))) as $statement) {
        if (str_starts_with(strtoupper($statement), 'SELECT') || str_starts_with(strtoupper($statement), 'DELIMITER')) continue;
        $pdo->exec($statement);
    }
}

// 1. Crear dependencias
$pepper = 'test_pepper';
$dniKey = '12345678901234561234567890123456';
$masterData = new AdminMasterDataService($pdo, 'req_test', $dniKey);
$certificateService = new AdminCertificateService(
    pdo: $pdo,
    tokenPepper: $pepper,
    requestId: 'req_test',
    pdfService: new CertificatePdfService(sys_get_temp_dir()),
    publicBaseUrl: 'http://localhost',
    tokenCipherKey: $dniKey,
    pdfStoragePath: sys_get_temp_dir(),
    dniCipherKey: $dniKey
);

// 2. Crear Alumno, Curso, Fechas y Asistencias
$student = $masterData->createStudent(['dni' => '11222333', 'apellidoNombre' => 'Alumno Test']);
$course = $masterData->createCourse(['codigo' => 'TEST01', 'nombre' => 'Curso Test']);
$date1 = $masterData->createCourseDate($course['id'], ['fecha' => '2026-06-01', 'estado' => 'realizada']);
$date2 = $masterData->createCourseDate($course['id'], ['fecha' => '2026-06-08', 'estado' => 'realizada']);

$attendance1 = $masterData->recordAttendance(['alumnoId' => $student['id'], 'cursoId' => $course['id'], 'cursoFechaId' => $date1['id']]);
$attendance2 = $masterData->recordAttendance(['alumnoId' => $student['id'], 'cursoId' => $course['id'], 'cursoFechaId' => $date2['id']]);

// 3. Emitir certificado
$cert = $certificateService->emitir([
    'alumnoId' => $student['id'],
    'cursoId' => $course['id'],
    'issuedAt' => '2026-06-15',
    'expiresAt' => null
]);

$certificateId = (int) $cert['id'];
$initialUrl = $cert['publicValidationUrl'];
$initialToken = basename((string) parse_url($initialUrl, PHP_URL_PATH));

$statement = $pdo->query("SELECT contenido_revision, pdf_estado FROM cert_certificados WHERE id = $certificateId");
$row = $statement->fetch();
if ((int)$row['contenido_revision'] !== 1) {
    throw new RuntimeException('Revisión inicial debería ser 1');
}

// 4. Anular una asistencia
$masterData->voidAttendance($attendance1['id']);

// 5. Verificar que el certificado se haya actualizado
$statement = $pdo->query("SELECT contenido_revision, pdf_estado FROM cert_certificados WHERE id = $certificateId");
$rowAfter = $statement->fetch();

if ((int)$rowAfter['contenido_revision'] !== 2) {
    throw new RuntimeException('La revisión no se incrementó al anular asistencia');
}
if ($rowAfter['pdf_estado'] !== 'desactualizado') {
    throw new RuntimeException('El estado del PDF no pasó a desactualizado');
}

$snapshotCount = (int) $pdo->query("SELECT COUNT(*) FROM cert_certificado_fechas WHERE certificado_id = $certificateId")->fetchColumn();
if ($snapshotCount !== 1) {
    throw new RuntimeException("Se esperaba 1 fecha en el snapshot, se encontraron $snapshotCount");
}

// Validar token y URL siguen funcionando igual
$validator = new CertificateValidator([
    'db_host' => '', 'db_name' => '', 'db_user' => '', 'db_pass' => '', 'token_pepper' => $pepper, 'token_encryption_key' => $dniKey
], $dniKey);

$dbPdoRef = new ReflectionProperty(Database::class, 'pdo');
$dbPdoRef->setAccessible(true);
$dbPdoRef->setValue(null, $pdo);


$verified = $validator->verify($initialToken, 'req_verify');
if (($verified['status'] ?? 0) !== 200 || ($verified['data']['course']['attendedDates'] ?? []) !== ['2026-06-08']) {
    throw new RuntimeException('La validación pública no refleja la nueva asistencia (snapshot actualizado)');
}

// 6. Restaurar/Agregar una asistencia (crea nueva fila activa)
$newAttendance = $masterData->recordAttendance(['alumnoId' => $student['id'], 'cursoId' => $course['id'], 'cursoFechaId' => $date1['id']]);

$statement = $pdo->query("SELECT contenido_revision, pdf_estado FROM cert_certificados WHERE id = $certificateId");
$rowAfterRestore = $statement->fetch();

if ((int)$rowAfterRestore['contenido_revision'] !== 3) {
    throw new RuntimeException('La revisión no se incrementó al agregar asistencia');
}

$snapshotCountAfterRestore = (int) $pdo->query("SELECT COUNT(*) FROM cert_certificado_fechas WHERE certificado_id = $certificateId")->fetchColumn();
if ($snapshotCountAfterRestore !== 2) {
    throw new RuntimeException("Se esperaba 2 fechas tras restaurar, se encontraron $snapshotCountAfterRestore");
}

$verifiedAfterRestore = $validator->verify($initialToken, 'req_verify_restore');
if (($verifiedAfterRestore['status'] ?? 0) !== 200 || ($verifiedAfterRestore['data']['course']['attendedDates'] ?? []) !== ['2026-06-01', '2026-06-08']) {
    throw new RuntimeException('La validación pública no refleja la asistencia agregada');
}

// 7. Fechas programadas (no deberían afectar revisiones)
$date3 = $masterData->createCourseDate($course['id'], ['fecha' => '2026-06-15', 'estado' => 'programada']);
$attendance3 = $masterData->recordAttendance(['alumnoId' => $student['id'], 'cursoId' => $course['id'], 'cursoFechaId' => $date3['id']]);

$statement = $pdo->query("SELECT contenido_revision FROM cert_certificados WHERE id = $certificateId");
if ((int)$statement->fetchColumn() !== 3) {
    throw new RuntimeException('Agregar una asistencia programada no debe incrementar revisión');
}

$masterData->voidAttendance($attendance3['id']);
$statement = $pdo->query("SELECT contenido_revision FROM cert_certificados WHERE id = $certificateId");
if ((int)$statement->fetchColumn() !== 3) {
    throw new RuntimeException('Anular una asistencia programada no debe incrementar revisión');
}

echo "OK AttendanceRevisionTest\n";
