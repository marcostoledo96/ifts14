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
    echo "SKIP CourseDateRevisionTest: requiere IFTS14_TEST_DB_DSN e IFTS14_TEST_DB_ALLOW_RESET=1 sobre una DB descartable.\n";
    return;
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
    if (!is_string($sql)) continue;
    $sql = implode("\n", array_filter(explode("\n", $sql), static fn ($l) => !str_starts_with(trim($l), '--')));
    foreach (array_filter(array_map('trim', explode(';', $sql))) as $statement) {
        if (str_starts_with(strtoupper($statement), 'SELECT') || str_starts_with(strtoupper($statement), 'DELIMITER')) continue;
        $pdo->exec($statement);
    }
}

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

$student = $masterData->createStudent(['dni' => '11222333', 'apellidoNombre' => 'Alumno Test']);
$course = $masterData->createCourse(['codigo' => 'TEST01', 'nombre' => 'Curso Test']);
$date1 = $masterData->createCourseDate($course['id'], ['fecha' => '2026-06-01', 'descripcion' => 'Clase 1', 'estado' => 'realizada']);
$date2 = $masterData->createCourseDate($course['id'], ['fecha' => '2026-06-08', 'descripcion' => 'Clase 2', 'estado' => 'realizada']);

$masterData->recordAttendance(['alumnoId' => $student['id'], 'cursoId' => $course['id'], 'cursoFechaId' => $date1['id']]);
$masterData->recordAttendance(['alumnoId' => $student['id'], 'cursoId' => $course['id'], 'cursoFechaId' => $date2['id']]);

$cert = $certificateService->emitir([
    'alumnoId' => $student['id'],
    'cursoId' => $course['id'],
    'issuedAt' => '2026-06-15',
    'expiresAt' => null
]);

$certificateId = (int) $cert['id'];
$initialToken = basename((string) parse_url($cert['publicValidationUrl'], PHP_URL_PATH));

// Cambiar la descripción de la fecha 1
$masterData->updateCourseDate($course['id'], $date1['id'], ['descripcion' => 'Clase 1 Modificada']);

// Cambiar la fecha 2 a estado 'cancelada'
$masterData->updateCourseDate($course['id'], $date2['id'], ['estado' => 'cancelada']);

$statement = $pdo->query("SELECT contenido_revision, pdf_estado FROM cert_certificados WHERE id = $certificateId");
$row = $statement->fetch();

if ((int)$row['contenido_revision'] !== 3) { // 1 inicial + 1 modif + 1 modif
    throw new RuntimeException('La revisión debería ser 3 (inicial + 2 modificaciones)');
}

$validator = new CertificateValidator([
    'db_host' => '', 'db_name' => '', 'db_user' => '', 'db_pass' => '', 'token_pepper' => $pepper, 'token_encryption_key' => $dniKey
], $dniKey);

$dbPdoRef = new ReflectionProperty(Database::class, 'pdo');
$dbPdoRef->setAccessible(true);
$dbPdoRef->setValue(null, $pdo);


$verified = $validator->verify($initialToken, 'req_verify');
if (($verified['status'] ?? 0) !== 200) {
    throw new RuntimeException('El certificado no valida públicamente tras la modificación de fechas');
}

$dates = $verified['data']['course']['attendedDatesRaw'] ?? $verified['data']['course']['attendedDates'] ?? [];
// depending on how snapshot formats the output, it could be just string dates or detailed
// In the current system, 'attendedDates' in validator returns list of strings 'Y-m-d' from SnapshotEmissionTest.
// Actually, let's look at SnapshotEmissionTest: attendedDates is ['2026-06-01', '2026-06-08'].

if ($dates !== ['2026-06-01']) {
    throw new RuntimeException('La validación no excluyó la fecha cancelada del snapshot');
}

// Ensure the description changed. Public validation doesn't expose description in attendedDates currently,
// but the snapshot in cert_certificado_fechas should have 'Clase 1 Modificada'
$descCount = (int) $pdo->query("SELECT COUNT(*) FROM cert_certificado_fechas WHERE certificado_id = $certificateId AND descripcion = 'Clase 1 Modificada'")->fetchColumn();
if ($descCount !== 1) {
    throw new RuntimeException('La descripción actualizada no se sincronizó al snapshot');
}

echo "OK CourseDateRevisionTest\n";
