<?php

declare(strict_types=1);

require_once __DIR__ . '/../src/AdminMasterDataService.php';
require_once __DIR__ . '/../src/AdminCertificateService.php';
require_once __DIR__ . '/../src/CertificatePdfService.php';

$dsn = getenv('IFTS14_TEST_DB_DSN');
$user = getenv('IFTS14_TEST_DB_USER') ?: 'root';
$pass = getenv('IFTS14_TEST_DB_PASS') ?: '';
if (!is_string($dsn) || $dsn === '' || getenv('IFTS14_TEST_DB_ALLOW_RESET') !== '1') {
    fwrite(STDERR, "FATAL: AutoCourseDateEstadoTest requires IFTS14_TEST_DB_DSN and IFTS14_TEST_DB_ALLOW_RESET=1 on a disposable DB.\n");
    exit(1);
}

$pdo = new PDO($dsn, $user, $pass, [
    PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
    PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
    PDO::ATTR_EMULATE_PREPARES => false,
]);

$pdo->exec('SET FOREIGN_KEY_CHECKS=0');
foreach (['cert_configuracion_institucional', 'cert_certificado_fechas', 'cert_asistencias', 'cert_curso_fechas', 'cert_cursos', 'cert_alumnos', 'cert_eventos_auditoria', 'cert_tokens_verificacion', 'cert_certificados'] as $table) {
    $pdo->exec('DROP TABLE IF EXISTS ' . $table);
}
$pdo->exec('SET FOREIGN_KEY_CHECKS=1');

foreach (glob(__DIR__ . '/../../../database/migrations/*.sql') ?: [] as $path) {
    $sql = file_get_contents($path);
    if (!is_string($sql)) {
        continue;
    }
    $sql = implode("\n", array_filter(explode("\n", $sql), static fn ($l) => !str_starts_with(trim($l), '--')));
    foreach (array_filter(array_map('trim', explode(';', $sql))) as $statement) {
        if (str_starts_with(strtoupper($statement), 'SELECT') || str_starts_with(strtoupper($statement), 'DELIMITER')) {
            continue;
        }
        $pdo->exec($statement);
    }
}

$dniKey = '12345678901234561234567890123456';
$pepper = 'test_pepper';
$masterData = new AdminMasterDataService($pdo, 'req_auto_estado', $dniKey);
$certificateService = new AdminCertificateService(
    pdo: $pdo,
    tokenPepper: $pepper,
    requestId: 'req_auto_estado',
    pdfService: new CertificatePdfService(sys_get_temp_dir()),
    publicBaseUrl: 'http://localhost',
    tokenCipherKey: $dniKey,
    pdfStoragePath: sys_get_temp_dir(),
    dniCipherKey: $dniKey,
);

$hoy = (new DateTimeImmutable('now', new DateTimeZone('America/Argentina/Buenos_Aires')))->format('Y-m-d');
$pasada = '2020-01-15';
$futura = '2099-06-01';

$student = $masterData->createStudent(['dni' => '22333444', 'apellido' => 'Alumno', 'nombre' => 'Auto Estado']);
$course = $masterData->createCourse(['codigo' => 'AUTO01', 'nombre' => 'Curso Auto Estado']);

// 1.1 Fecha pasada + presente → realizada
$datePast = $masterData->createCourseDate($course['id'], ['fecha' => $pasada, 'estado' => 'programada']);
$attPast = $masterData->recordAttendance([
    'alumnoId' => $student['id'],
    'cursoId' => $course['id'],
    'cursoFechaId' => $datePast['id'],
]);
$estadoPast = $masterData->listCourseDates($course['id']);
$foundPast = null;
foreach ($estadoPast['items'] as $item) {
    if ((int) $item['id'] === (int) $datePast['id']) {
        $foundPast = $item;
        break;
    }
}
if (($foundPast['estado'] ?? '') !== 'realizada') {
    throw new RuntimeException('1.1 Esperaba realizada tras marcar en fecha pasada, got ' . ($foundPast['estado'] ?? 'null'));
}
if (($attPast['fechaEstado'] ?? '') !== 'realizada') {
    throw new RuntimeException('1.1 DTO asistencia debía reportar fechaEstado=realizada');
}

// 1.2 Same-day → realizada; futura → programada
$dateToday = $masterData->createCourseDate($course['id'], ['fecha' => $hoy, 'estado' => 'programada']);
$attToday = $masterData->recordAttendance([
    'alumnoId' => $student['id'],
    'cursoId' => $course['id'],
    'cursoFechaId' => $dateToday['id'],
]);
if (($attToday['fechaEstado'] ?? '') !== 'realizada') {
    throw new RuntimeException('1.2 Same-day debía quedar realizada, got ' . ($attToday['fechaEstado'] ?? 'null'));
}

$dateFuture = $masterData->createCourseDate($course['id'], ['fecha' => $futura, 'estado' => 'programada']);
$attFuture = $masterData->recordAttendance([
    'alumnoId' => $student['id'],
    'cursoId' => $course['id'],
    'cursoFechaId' => $dateFuture['id'],
]);
if (($attFuture['fechaEstado'] ?? '') !== 'programada') {
    throw new RuntimeException('1.2 Futura debía quedar programada, got ' . ($attFuture['fechaEstado'] ?? 'null'));
}

// 1.3 Anular último presente → programada + sync
$studentSync = $masterData->createStudent(['dni' => '33444555', 'apellido' => 'Alumno', 'nombre' => 'Sync']);
$courseSync = $masterData->createCourse(['codigo' => 'AUTO02', 'nombre' => 'Curso Sync']);
$dateSync = $masterData->createCourseDate($courseSync['id'], ['fecha' => $pasada, 'estado' => 'programada', 'orden' => 1]);
$attSync = $masterData->recordAttendance([
    'alumnoId' => $studentSync['id'],
    'cursoId' => $courseSync['id'],
    'cursoFechaId' => $dateSync['id'],
]);
$cert = $certificateService->emitir([
    'alumnoId' => $studentSync['id'],
    'cursoId' => $courseSync['id'],
    'issuedAt' => $hoy,
    'expiresAt' => null,
]);
$certId = (int) $cert['id'];
$rowBefore = $pdo->query("SELECT contenido_revision, pdf_estado FROM cert_certificados WHERE id = $certId")->fetch();
$revBefore = (int) $rowBefore['contenido_revision'];

$masterData->voidAttendance($attSync['id']);
$afterVoid = null;
foreach ($masterData->listCourseDates($courseSync['id'])['items'] as $item) {
    if ((int) $item['id'] === (int) $dateSync['id']) {
        $afterVoid = $item;
        break;
    }
}
if (($afterVoid['estado'] ?? '') !== 'programada') {
    throw new RuntimeException('1.3 Tras anular último presente debía volver a programada');
}
$rowAfter = $pdo->query("SELECT contenido_revision, pdf_estado FROM cert_certificados WHERE id = $certId")->fetch();
if ((int) $rowAfter['contenido_revision'] !== $revBefore + 1) {
    throw new RuntimeException('1.3 Debía incrementar contenido_revision al salir de realizada');
}
if (($rowAfter['pdf_estado'] ?? '') !== 'desactualizado') {
    throw new RuntimeException('1.3 Debía marcar pdf_estado=desactualizado');
}
$snapCount = (int) $pdo->query("SELECT COUNT(*) FROM cert_certificado_fechas WHERE certificado_id = $certId")->fetchColumn();
if ($snapCount !== 0) {
    throw new RuntimeException("1.3 Snapshot debía quedar vacío, got $snapCount");
}

// 1.4 Cancelada intacta
$dateCancelled = $masterData->createCourseDate($course['id'], [
    'fecha' => '2020-02-01',
    'estado' => 'cancelada',
    'orden' => 10,
]);
try {
    $masterData->recordAttendance([
        'alumnoId' => $student['id'],
        'cursoId' => $course['id'],
        'cursoFechaId' => $dateCancelled['id'],
    ]);
    throw new RuntimeException('1.4 Debía rechazar asistencia en fecha cancelada');
} catch (AdminCertificateException $e) {
    if ($e->status !== 400) {
        throw new RuntimeException('1.4 Esperaba 400 al marcar cancelada');
    }
}
$cancelledAfter = null;
foreach ($masterData->listCourseDates($course['id'])['items'] as $item) {
    if ((int) $item['id'] === (int) $dateCancelled['id']) {
        $cancelledAfter = $item;
        break;
    }
}
if (($cancelledAfter['estado'] ?? '') !== 'cancelada') {
    throw new RuntimeException('1.4 Cancelada no debe ser alterada por auto');
}

echo "OK AutoCourseDateEstadoTest\n";
