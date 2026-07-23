<?php

declare(strict_types=1);

require_once __DIR__ . '/SessionHttpTest.php';

$dsn = getenv('IFTS14_TEST_DB_DSN');
$user = getenv('IFTS14_TEST_DB_USER') ?: 'root';
$pass = getenv('IFTS14_TEST_DB_PASS') ?: '';

if (!is_string($dsn) || $dsn === '' || getenv('IFTS14_TEST_DB_ALLOW_RESET') !== '1') {
    fwrite(STDERR, "FATAL: AdminMasterDataHttpTest requires IFTS14_TEST_DB_DSN and IFTS14_TEST_DB_ALLOW_RESET=1 on a disposable DB.\n");
    exit(1);
}

$db = mysqlConfigFromDsn($dsn);
$pdo = new PDO($dsn, $user, $pass, [
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

$root = dirname(__DIR__);
$tmpDir = sys_get_temp_dir() . '/ifts14-master-data-http-' . bin2hex(random_bytes(4));
if (!mkdir($tmpDir, 0700) && !is_dir($tmpDir)) {
    throw new RuntimeException('No se pudo preparar el directorio temporal.');
}

$adminKey = 'admin_demo_key_master_data_2026';
$configPath = $tmpDir . '/config.php';
$baseConfig = [
    'db_host' => $db['host'],
    'db_name' => $db['dbname'],
    'db_user' => $user,
    'db_pass' => $pass,
    'token_pepper' => 'pepper_master_data_demo_2026',
    'admin_username' => 'bedelia',
    'admin_password_hash' => password_hash($adminKey, PASSWORD_DEFAULT),
    'admin_session_idle_seconds' => 1800,
    'admin_session_absolute_seconds' => 28800,
    'rate_limit_storage_path' => $tmpDir . '/rate-limit.json',
    'app_salt' => 'salt_demo_master_data',
    'public_base_url' => 'https://demo.example.edu.ar/certificados',
    'certificate_storage_path' => $tmpDir . '/pdf-storage',
    'token_encryption_key' => base64_encode(str_repeat('t', 32)),
];
writeConfig($configPath, $baseConfig + ['dni_cipher_key' => base64_encode(str_repeat('d', 32))]);

$port = random_int(22000, 22999);
$previousConfigPath = getenv('CERTIFICADOS_CONFIG_PATH');
putenv('CERTIFICADOS_CONFIG_PATH=' . $configPath);
$process = proc_open([
    PHP_BINARY,
    '-d',
    'opcache.enable=0',
    '-S',
    '127.0.0.1:' . $port,
    '-t',
    $root,
    $root . '/index.php',
], [['pipe', 'r'], ['pipe', 'w'], ['pipe', 'w']], $pipes, $root);

if (!is_resource($process)) {
    throw new RuntimeException('No se pudo iniciar el servidor embebido.');
}

try {
    waitForServer($port);
    $authHeaders = loginAdminSessionHeaders($port, 'bedelia', $adminKey);

    assertError(request($port, 'GET', '/admin/cursos'), 401, 'UNAUTHORIZED', 'admin sin sesión');
    assertError(request($port, 'POST', '/admin/cursos', array_merge(['Content-Type: text/plain'], $authHeaders), '{}'), 415, 'UNSUPPORTED_MEDIA_TYPE', 'POST sin JSON content-type');
    assertError(request($port, 'POST', '/admin/cursos', jsonHeaders($adminKey), '{'), 400, 'VALIDATION_ERROR', 'JSON malformado');

    $course = postJson($port, '/admin/cursos', $adminKey, ['codigo' => 'CUR-MD-01', 'nombre' => 'Curso Master Data']);
    assertStatus($course, 201, 'crear curso');
    $courseBody = assertJson($course, 'crear curso');
    $courseId = (int) ($courseBody['data']['id'] ?? 0);
    if ($courseId < 1 || ($courseBody['data']['estado'] ?? '') !== 'activo') {
        throw new RuntimeException('Curso creado con DTO inválido.');
    }
    assertError(postJson($port, '/admin/cursos', $adminKey, ['codigo' => 'CUR-MD-01', 'nombre' => 'Duplicado']), 409, 'CONFLICT', 'curso duplicado');
    assertStatus(request($port, 'GET', '/admin/cursos/' . $courseId, $authHeaders), 200, 'detalle curso');
    assertStatus(request($port, 'GET', '/admin/cursos', $authHeaders), 200, 'listar cursos');
    assertError(patchJson($port, '/admin/cursos/' . $courseId . '/estado', $adminKey, ['estado' => 'invalido']), 400, 'VALIDATION_ERROR', 'estado curso inválido');
    assertStatus(patchJson($port, '/admin/cursos/' . $courseId . '/estado', $adminKey, ['estado' => 'activo']), 200, 'estado curso');
    assertError(patchJson($port, '/admin/cursos/' . $courseId, $adminKey, []), 400, 'VALIDATION_ERROR', 'curso PATCH vacío');
    $renamed = patchJson($port, '/admin/cursos/' . $courseId, $adminKey, [
        'codigo' => 'CUR-MD-01B',
        'nombre' => 'Curso Master Data Renombrado',
    ]);
    assertStatus($renamed, 200, 'actualizar codigo/nombre curso');
    $renamedBody = assertJson($renamed, 'actualizar curso');
    if (($renamedBody['data']['codigo'] ?? '') !== 'CUR-MD-01B' || ($renamedBody['data']['nombre'] ?? '') !== 'Curso Master Data Renombrado') {
        throw new RuntimeException('PATCH curso no persistió codigo/nombre.');
    }
    $otherCourse = postJson($port, '/admin/cursos', $adminKey, ['codigo' => 'CUR-MD-02', 'nombre' => 'Otro curso']);
    assertStatus($otherCourse, 201, 'crear segundo curso');
    assertError(
        patchJson($port, '/admin/cursos/' . $courseId, $adminKey, ['codigo' => 'CUR-MD-02']),
        409,
        'CONFLICT',
        'codigo curso duplicado al editar',
    );

    writeConfig($configPath, $baseConfig);
    $beforeStudents = (int) $pdo->query('SELECT COUNT(*) FROM cert_alumnos')->fetchColumn();
    assertError(postJson($port, '/admin/alumnos', $adminKey, ['apellido' => 'Alumno', 'nombre' => 'Config Demo', 'dni' => '12345678']), 500, 'CONFIGURATION_ERROR', 'dni key ausente');
    $afterStudents = (int) $pdo->query('SELECT COUNT(*) FROM cert_alumnos')->fetchColumn();
    if ($beforeStudents !== $afterStudents) {
        throw new RuntimeException('POST alumno persistió aun sin dni_cipher_key válida.');
    }
    writeConfig($configPath, $baseConfig + ['dni_cipher_key' => base64_encode(str_repeat('d', 32))]);

    $student = postJson($port, '/admin/alumnos', $adminKey, ['apellido' => 'Alumno', 'nombre' => 'Master Demo', 'dni' => '12.345.678']);
    assertStatus($student, 201, 'crear alumno');
    $studentBody = assertJson($student, 'crear alumno');
    $studentId = (int) ($studentBody['data']['id'] ?? 0);
    assertNoSensitiveStudentData($student['body']);
    if ($studentId < 1 || ($studentBody['data']['dniMostrar'] ?? '') !== '12345678') {
        throw new RuntimeException('Alumno creado con DTO inválido.');
    }
    if (!array_key_exists('email', $studentBody['data']) || $studentBody['data']['email'] !== null) {
        throw new RuntimeException('Alumno sin email debía devolver email null.');
    }
    $withEmail = postJson($port, '/admin/alumnos', $adminKey, [
        'apellido' => 'Alumno',
        'nombre' => 'Email Demo',
        'dni' => '87654321',
        'email' => 'alumno.demo@example.invalid',
    ]);
    assertStatus($withEmail, 201, 'crear alumno con email');
    $withEmailBody = assertJson($withEmail, 'crear alumno con email');
    if (($withEmailBody['data']['email'] ?? '') !== 'alumno.demo@example.invalid') {
        throw new RuntimeException('Email opcional no persistió en DTO.');
    }
    assertNoSensitiveStudentData($withEmail['body']);
    assertError(postJson($port, '/admin/alumnos', $adminKey, ['apellido' => 'Alumno', 'nombre' => 'Dup', 'dni' => '12345678']), 409, 'CONFLICT', 'alumno duplicado');
    $studentDetail = request($port, 'GET', '/admin/alumnos/' . $studentId, $authHeaders);
    assertStatus($studentDetail, 200, 'detalle alumno');
    assertNoSensitiveStudentData($studentDetail['body']);
    assertStatus(request($port, 'GET', '/admin/alumnos', $authHeaders), 200, 'listar alumnos');

    writeConfig($configPath, $baseConfig);
    assertStatus(patchJson($port, '/admin/alumnos/' . $studentId . '/estado', $adminKey, ['estado' => 'inactivo']), 200, 'estado alumno sin dni key');
    assertStatus(patchJson($port, '/admin/alumnos/' . $studentId . '/estado', $adminKey, ['estado' => 'activo']), 200, 'reactivar alumno sin dni key');
    writeConfig($configPath, $baseConfig + ['dni_cipher_key' => base64_encode(str_repeat('d', 32))]);

    assertStatus(patchJson($port, '/admin/alumnos/' . $studentId . '/estado', $adminKey, ['estado' => 'activo']), 200, 'estado alumno');

    $patched = patchJson($port, '/admin/alumnos/' . $studentId, $adminKey, [
        'apellido' => 'Alumno',
        'nombre' => 'Master Editado',
        'email' => 'alumno.editado@example.invalid',
    ]);
    assertStatus($patched, 200, 'editar alumno sin dni');
    $patchedBody = assertJson($patched, 'editar alumno sin dni');
    if (($patchedBody['data']['apellido'] ?? '') !== 'Alumno' || ($patchedBody['data']['nombre'] ?? '') !== 'Master Editado') {
        throw new RuntimeException('apellido/nombre no se actualizaron.');
    }
    if (($patchedBody['data']['email'] ?? '') !== 'alumno.editado@example.invalid') {
        throw new RuntimeException('email no se actualizó.');
    }
    assertNoSensitiveStudentData($patched['body']);

    writeConfig($configPath, $baseConfig);
    assertError(patchJson($port, '/admin/alumnos/' . $studentId, $adminKey, ['dni' => '99887766']), 500, 'CONFIGURATION_ERROR', 'editar dni sin key');
    writeConfig($configPath, $baseConfig + ['dni_cipher_key' => base64_encode(str_repeat('d', 32))]);

    $patchedDni = patchJson($port, '/admin/alumnos/' . $studentId, $adminKey, ['dni' => '99.887.766']);
    assertStatus($patchedDni, 200, 'editar dni alumno');
    $patchedDniBody = assertJson($patchedDni, 'editar dni alumno');
    if (($patchedDniBody['data']['dniMostrar'] ?? '') !== '99887766') {
        throw new RuntimeException('dniMostrar no se actualizó al editar DNI.');
    }

    $hub = request($port, 'GET', '/admin/hub/asistencias', $authHeaders);
    assertStatus($hub, 200, 'hub asistencias');
    $hubBody = assertJson($hub, 'hub asistencias');
    if (!isset($hubBody['data']['cursos'], $hubBody['data']['fechas'], $hubBody['data']['asistencias'], $hubBody['data']['alumnosActivos'])) {
        throw new RuntimeException('Hub asistencias sin claves esperadas.');
    }

    $date1 = postJson($port, '/admin/cursos/' . $courseId . '/fechas', $adminKey, ['fecha' => '2026-08-01', 'descripcion' => 'Clase 1', 'estado' => 'programada']);
    assertStatus($date1, 201, 'crear fecha 1');
    $date1Id = (int) (assertJson($date1, 'crear fecha 1')['data']['id'] ?? 0);
    $date2 = postJson($port, '/admin/cursos/' . $courseId . '/fechas', $adminKey, ['fecha' => '2026-08-08', 'descripcion' => 'Clase 2', 'orden' => 2, 'estado' => 'realizada']);
    assertStatus($date2, 201, 'crear fecha 2');
    assertError(postJson($port, '/admin/cursos/' . $courseId . '/fechas', $adminKey, ['fecha' => '2026-08-22', 'orden' => 65536]), 400, 'VALIDATION_ERROR', 'orden fecha crear fuera de rango');
    assertError(patchJson($port, '/admin/cursos/' . $courseId . '/fechas/' . $date1Id, $adminKey, ['orden' => 65536]), 400, 'VALIDATION_ERROR', 'orden fecha actualizar fuera de rango');
    assertStatus(postJson($port, '/admin/cursos/' . $courseId . '/fechas', $adminKey, ['fecha' => '2026-08-22', 'orden' => 65535]), 201, 'crear fecha orden máximo');
    assertError(postJson($port, '/admin/cursos/' . $courseId . '/fechas', $adminKey, ['fecha' => '2026-08-29']), 400, 'VALIDATION_ERROR', 'orden fecha automático fuera de rango');
    assertError(postJson($port, '/admin/cursos/' . $courseId . '/fechas', $adminKey, ['fecha' => '2026-08-08', 'orden' => 3]), 409, 'CONFLICT', 'fecha duplicada');
    assertError(patchJson($port, '/admin/cursos/' . $courseId . '/fechas/' . $date1Id, $adminKey, ['estado' => 'invalido']), 400, 'VALIDATION_ERROR', 'estado fecha inválido');
    assertStatus(request($port, 'GET', '/admin/cursos/' . $courseId . '/fechas', $authHeaders), 200, 'listar fechas');

    $attendance = postJson($port, '/admin/asistencias', $adminKey, ['alumnoId' => $studentId, 'cursoId' => $courseId, 'cursoFechaId' => $date1Id]);
    assertStatus($attendance, 201, 'registrar asistencia');
    $attendanceId = (int) (assertJson($attendance, 'registrar asistencia')['data']['id'] ?? 0);
    assertError(postJson($port, '/admin/asistencias', $adminKey, ['alumnoId' => $studentId, 'cursoId' => $courseId, 'cursoFechaId' => $date1Id]), 409, 'CONFLICT', 'asistencia duplicada');

    $dateCancelled = postJson($port, '/admin/cursos/' . $courseId . '/fechas', $adminKey, ['fecha' => '2026-08-15', 'orden' => 3, 'estado' => 'cancelada']);
    $dateCancelledId = (int) (assertJson($dateCancelled, 'fecha cancelada')['data']['id'] ?? 0);
    assertError(postJson($port, '/admin/asistencias', $adminKey, ['alumnoId' => $studentId, 'cursoId' => $courseId, 'cursoFechaId' => $dateCancelledId]), 400, 'VALIDATION_ERROR', 'asistencia con fecha cancelada');

    assertStatus(request($port, 'GET', '/admin/asistencias?cursoId=' . $courseId . '&alumnoId=' . $studentId, $authHeaders), 200, 'listar asistencias');
    assertError(request($port, 'GET', '/admin/asistencias?cursoId=abc', $authHeaders), 400, 'VALIDATION_ERROR', 'cursoId inválido en listado asistencias');
    assertError(request($port, 'GET', '/admin/asistencias?alumnoId=abc', $authHeaders), 400, 'VALIDATION_ERROR', 'alumnoId inválido en listado asistencias');
    assertStatus(request($port, 'DELETE', '/admin/asistencias/' . $attendanceId, $authHeaders), 200, 'anular asistencia');
    $activeAfterVoid = assertJson(request($port, 'GET', '/admin/asistencias?cursoId=' . $courseId . '&alumnoId=' . $studentId, $authHeaders), 'listar luego de anular');
    if (($activeAfterVoid['data']['items'] ?? []) !== []) {
        throw new RuntimeException('La asistencia anulada sigue listada como activa.');
    }

    assertStatus(postJson($port, '/admin/asistencias', $adminKey, ['alumnoId' => $studentId, 'cursoId' => $courseId, 'cursoFechaId' => $date1Id]), 201, 'registrar asistencia luego de anular');
} finally {
    proc_terminate($process);
    proc_close($process);
    putenv($previousConfigPath === false ? 'CERTIFICADOS_CONFIG_PATH' : 'CERTIFICADOS_CONFIG_PATH=' . $previousConfigPath);
    cleanDir($tmpDir);
}

echo "OK AdminMasterDataHttpTest\n";

/** @return array{host:string,dbname:string} */
function mysqlConfigFromDsn(string $dsn): array
{
    if (preg_match('/^mysql:(.*)$/', $dsn, $matches) !== 1) {
        throw new RuntimeException('DSN de prueba inválido.');
    }
    parse_str(str_replace(';', '&', $matches[1]), $parts);
    if (!isset($parts['host'], $parts['dbname']) || !is_string($parts['host']) || !is_string($parts['dbname'])) {
        throw new RuntimeException('DSN de prueba incompleto.');
    }

    return ['host' => $parts['host'], 'dbname' => $parts['dbname']];
}

function writeConfig(string $path, array $config): void
{
    file_put_contents($path, '<?php return ' . var_export($config, true) . ';');
}

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
    $sql = implode("\n", array_filter(explode("\n", $sql), static fn (string $line): bool => !str_starts_with(trim($line), '--')));
    foreach (array_filter(array_map('trim', explode(';', $sql))) as $statement) {
        $pdo->exec($statement);
    }
}

function waitForServer(int $port): void
{
    for ($attempt = 0; $attempt < 50; $attempt++) {
        $socket = @stream_socket_client('tcp://127.0.0.1:' . $port, $errno, $error, 0.1);
        if (is_resource($socket)) {
            fclose($socket);
            return;
        }
        usleep(100000);
    }
    throw new RuntimeException('El servidor embebido no respondió.');
}

/** @return list<string> */
function jsonHeaders(string $adminKey): array
{
    global $authHeaders;

    return sessionJsonHeaders($authHeaders);
}

/** @return array{status:int,headers:array<string,string>,body:string} */
function postJson(int $port, string $path, string $adminKey, array $body): array
{
    return request($port, 'POST', $path, jsonHeaders($adminKey), json_encode($body, JSON_THROW_ON_ERROR));
}

/** @return array{status:int,headers:array<string,string>,body:string} */
function patchJson(int $port, string $path, string $adminKey, array $body): array
{
    return request($port, 'PATCH', $path, jsonHeaders($adminKey), json_encode($body, JSON_THROW_ON_ERROR));
}

/** @param list<string> $headers @return array{status:int,headers:array<string,string>,body:string} */
function request(int $port, string $method, string $path, array $headers = [], string $body = ''): array
{
    $context = stream_context_create(['http' => [
        'method' => $method,
        'ignore_errors' => true,
        'header' => implode("\r\n", $headers),
        'content' => $body,
    ]]);
    $contents = file_get_contents('http://127.0.0.1:' . $port . $path, false, $context);
    if ($contents === false) {
        throw new RuntimeException($path . ': request fallido.');
    }

    $statusLine = $http_response_header[0] ?? '';
    preg_match('/\s(\d{3})\s/', $statusLine, $matches);
    $parsedHeaders = [];
    foreach ($http_response_header ?? [] as $line) {
        if (str_contains($line, ':')) {
            [$name, $value] = explode(':', $line, 2);
            $parsedHeaders[strtolower(trim($name))] = trim($value);
        }
    }

    return ['status' => (int) ($matches[1] ?? 0), 'headers' => $parsedHeaders, 'body' => $contents];
}

/** @param array{status:int,headers:array<string,string>,body:string} $response */
function assertStatus(array $response, int $expected, string $label): void
{
    if ($response['status'] !== $expected) {
        throw new RuntimeException("{$label}: HTTP esperado {$expected}, recibido {$response['status']}. Body: {$response['body']}");
    }
}

/** @param array{status:int,headers:array<string,string>,body:string} $response @return array<string,mixed> */
function assertJson(array $response, string $label): array
{
    $body = json_decode($response['body'], true);
    if (!is_array($body)) {
        throw new RuntimeException("{$label}: JSON inválido.");
    }

    return $body;
}

/** @param array{status:int,headers:array<string,string>,body:string} $response */
function assertError(array $response, int $status, string $code, string $label): void
{
    assertStatus($response, $status, $label);
    $body = assertJson($response, $label);
    if (($body['error']['code'] ?? '') !== $code) {
        throw new RuntimeException("{$label}: código de error inválido.");
    }
}

function assertNoSensitiveStudentData(string $body): void
{
    // D0: DNI completo en UI admin está permitido; no deben filtrarse hash/cifrado ni token.
    foreach (['dni_hash', 'dni_cifrado', 'token_cifrado'] as $forbidden) {
        if (str_contains($body, $forbidden)) {
            throw new RuntimeException('DTO administrativo expuso dato sensible: ' . $forbidden);
        }
    }
}

function cleanDir(string $path): void
{
    if (!is_dir($path)) {
        return;
    }
    foreach (scandir($path) ?: [] as $entry) {
        if ($entry === '.' || $entry === '..') {
            continue;
        }
        $child = $path . '/' . $entry;
        is_dir($child) ? cleanDir($child) : @unlink($child);
    }
    @rmdir($path);
}
