<?php

declare(strict_types=1);

require_once __DIR__ . '/../src/InstitutionalConfig.php';
require_once __DIR__ . '/SessionHttpTest.php';

$dsn = getenv('IFTS14_TEST_DB_DSN');
$user = getenv('IFTS14_TEST_DB_USER') ?: 'root';
$pass = getenv('IFTS14_TEST_DB_PASS') ?: '';

if (!is_string($dsn) || $dsn === '' || getenv('IFTS14_TEST_DB_ALLOW_RESET') !== '1') {
    fwrite(STDERR, "FATAL: AdminCertificadosConsultaHttpTest requires IFTS14_TEST_DB_DSN and IFTS14_TEST_DB_ALLOW_RESET=1 on a disposable DB.\n");
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
applySqlFile($pdo, __DIR__ . '/../../../database/migrations/013_parametros_sistema.sql');

$root = dirname(__DIR__);
$tmpDir = sys_get_temp_dir() . '/ifts14-consulta-http-' . bin2hex(random_bytes(4));
if (!mkdir($tmpDir, 0700) && !is_dir($tmpDir)) {
    throw new RuntimeException('No se pudo preparar el directorio temporal.');
}

$adminKey = 'admin_demo_key_consulta_2026';
$dni = '87654321';
$configPath = $tmpDir . '/config.php';
writeConfig($configPath, [
    'db_host' => $db['host'],
    'db_name' => $db['dbname'],
    'db_user' => $user,
    'db_pass' => $pass,
    'token_pepper' => 'pepper_consulta_demo_2026',
    'admin_username' => 'bedelia',
    'admin_password_hash' => password_hash($adminKey, PASSWORD_DEFAULT),
    'admin_session_idle_seconds' => 1800,
    'admin_session_absolute_seconds' => 28800,
    'rate_limit_storage_path' => $tmpDir . '/rate-limit.json',
    'app_salt' => 'salt_demo_consulta',
    'public_base_url' => 'https://demo.example.edu.ar/certificados',
    'certificate_storage_path' => $tmpDir . '/pdf-storage',
    'token_encryption_key' => base64_encode(str_repeat('t', 32)),
    'dni_cipher_key' => base64_encode(str_repeat('d', 32)),
]);

$port = random_int(23000, 23999);
$previousConfigPath = getenv('CERTIFICADOS_CONFIG_PATH');
putenv('CERTIFICADOS_CONFIG_PATH=' . $configPath);
$process = proc_open([
    PHP_BINARY,
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

    assertError(request($port, 'GET', '/admin/certificados'), 401, 'UNAUTHORIZED', 'listado sin admin key');
    assertError(request($port, 'GET', '/admin/configuracion-institucional'), 401, 'UNAUTHORIZED', 'config sin admin key');

    $configGet = request($port, 'GET', '/admin/configuracion-institucional', $authHeaders);
    assertStatus($configGet, 200, 'config GET inicial');
    $configBody = assertJson($configGet, 'config GET inicial');
    if (($configBody['data']['institutionName'] ?? '') !== 'IFTS N.° 14') {
        throw new RuntimeException('config GET inicial: fallback institucional inesperado.');
    }
    $params = $configBody['data']['parameters'] ?? null;
    if (!is_array($params) || !isset($params['titulo_certificado']['value'])) {
        throw new RuntimeException('config GET inicial: faltan parameters tipados.');
    }
    if (($params['titulo_certificado']['value'] ?? '') !== 'Certificado de Aprobación') {
        throw new RuntimeException('config GET inicial: seed titulo_certificado inesperado.');
    }

    $configPut = putJson($port, '/admin/configuracion-institucional', $adminKey, [
        'institutionName' => 'IFTS 14 Consulta Demo',
        'certificateText' => 'Texto certificado demo consulta.',
        'rectorName' => 'Rector Demo',
        'rectorRole' => 'Rector/a',
        'advisorName' => 'Asesora Demo',
        'advisorRole' => 'Asesor/a Pedagógica',
        'parameters' => [
            'titulo_certificado' => 'Certificado Demo Persistido',
            'email_contacto' => 'bedelia@ifts14.example',
        ],
    ]);
    assertStatus($configPut, 200, 'config PUT');
    $configPutBody = assertJson($configPut, 'config PUT');
    if (($configPutBody['data']['institutionName'] ?? '') !== 'IFTS 14 Consulta Demo') {
        throw new RuntimeException('config PUT: no persistió institutionName.');
    }
    if (($configPutBody['data']['parameters']['titulo_certificado']['value'] ?? '') !== 'Certificado Demo Persistido') {
        throw new RuntimeException('config PUT: no persistió parameters.titulo_certificado.');
    }
    if (($configPutBody['data']['parameters']['email_contacto']['value'] ?? '') !== 'bedelia@ifts14.example') {
        throw new RuntimeException('config PUT: no persistió parameters.email_contacto.');
    }

    assertError(putJson($port, '/admin/configuracion-institucional', $adminKey, ['institutionName' => '   ']), 400, 'VALIDATION_ERROR', 'config PUT sin nombre');
    assertError(putJson($port, '/admin/configuracion-institucional', $adminKey, [
        'institutionName' => 'IFTS N.° 14',
        'parameters' => ['clave_desconocida' => 'x'],
    ]), 400, 'VALIDATION_ERROR', 'config PUT parámetro desconocido');
    assertError(putJson($port, '/admin/configuracion-institucional', $adminKey, [
        'institutionName' => 'IFTS N.° 14',
        'parameters' => ['email_contacto' => 'no-es-email'],
    ]), 400, 'VALIDATION_ERROR', 'config PUT email inválido');

    $course = postJson($port, '/admin/cursos', $adminKey, ['codigo' => 'CUR-CNS-01', 'nombre' => 'Curso Consulta']);
    assertStatus($course, 201, 'crear curso consulta');
    $cursoId = (int) (assertJson($course, 'crear curso consulta')['data']['id'] ?? 0);

    $student = postJson($port, '/admin/alumnos', $adminKey, ['apellido' => 'Alumno', 'nombre' => 'Consulta', 'dni' => $dni]);
    assertStatus($student, 201, 'crear alumno consulta');
    $alumnoId = (int) (assertJson($student, 'crear alumno consulta')['data']['id'] ?? 0);

    $fecha = postJson($port, '/admin/cursos/' . $cursoId . '/fechas', $adminKey, [
        'fecha' => '2026-06-01',
        'descripcion' => 'Clase consulta',
        'orden' => 1,
        'estado' => 'realizada',
    ]);
    assertStatus($fecha, 201, 'crear fecha consulta');
    $fechaId = (int) (assertJson($fecha, 'crear fecha consulta')['data']['id'] ?? 0);
    assertStatus(postJson($port, '/admin/asistencias', $adminKey, [
        'alumnoId' => $alumnoId,
        'cursoId' => $cursoId,
        'cursoFechaId' => $fechaId,
    ]), 201, 'crear asistencia consulta');

    $emission = postJson($port, '/admin/certificados', $adminKey, [
        'alumnoId' => $alumnoId,
        'cursoId' => $cursoId,
        'issuedAt' => '2026-07-02',
    ]);
    assertStatus($emission, 201, 'emitir certificado consulta');
    $certificateId = (int) (assertJson($emission, 'emitir certificado consulta')['data']['id'] ?? 0);
    if ($certificateId < 1) {
        throw new RuntimeException('emisión consulta sin id.');
    }

    $course2 = postJson($port, '/admin/cursos', $adminKey, ['codigo' => 'CUR-CNS-02', 'nombre' => 'Curso Consulta 2']);
    assertStatus($course2, 201, 'crear curso consulta 2');
    $curso2Id = (int) (assertJson($course2, 'crear curso consulta 2')['data']['id'] ?? 0);

    $fecha2 = postJson($port, '/admin/cursos/' . $curso2Id . '/fechas', $adminKey, [
        'fecha' => '2026-06-01',
        'descripcion' => 'Clase consulta 2',
        'orden' => 1,
        'estado' => 'realizada',
    ]);
    assertStatus($fecha2, 201, 'crear fecha consulta 2');
    $fecha2Id = (int) (assertJson($fecha2, 'crear fecha consulta 2')['data']['id'] ?? 0);

    assertStatus(postJson($port, '/admin/asistencias', $adminKey, [
        'alumnoId' => $alumnoId,
        'cursoId' => $curso2Id,
        'cursoFechaId' => $fecha2Id,
    ]), 201, 'crear asistencia consulta 2');

    $emissionExpired = postJson($port, '/admin/certificados', $adminKey, [
        'alumnoId' => $alumnoId,
        'cursoId' => $curso2Id,
        'issuedAt' => '2026-07-02',
    ]);
    assertStatus($emissionExpired, 201, 'emitir segundo certificado');
    $expiredCertificateId = (int) (assertJson($emissionExpired, 'emitir segundo certificado')['data']['id'] ?? 0);
    $pdo->prepare("UPDATE cert_certificados SET vence_en = '2020-01-01' WHERE id = ?")->execute([$expiredCertificateId]);

    $list = request($port, 'GET', '/admin/certificados', $authHeaders);
    assertStatus($list, 200, 'listado certificados');
    $listBody = assertJson($list, 'listado certificados');
    $items = $listBody['data']['items'] ?? null;
    if (!is_array($items) || count($items) < 2) {
        throw new RuntimeException('listado certificados no tiene al menos 2.');
    }
    assertNoSensitiveAdminCertificateData($list['body']);

    $filtered = request($port, 'GET', '/admin/certificados?estado=vigente&cursoId=' . $cursoId . '&alumnoId=' . $alumnoId, $authHeaders);
    assertStatus($filtered, 200, 'listado filtrado vigente');
    $filteredItems = assertJson($filtered, 'listado filtrado vigente')['data']['items'] ?? [];
    if (!is_array($filteredItems) || count($filteredItems) !== 1 || (int) ($filteredItems[0]['id'] ?? 0) !== $certificateId) {
        throw new RuntimeException('listado filtrado vigente no devolvió el certificado esperado o incluyó el vencido.');
    }

    $expiredAsVigente = request($port, 'GET', '/admin/certificados?estado=vigente&cursoId=' . $curso2Id . '&alumnoId=' . $alumnoId, $authHeaders);
    $items = assertJson($expiredAsVigente, 'vencido excluido del filtro vigente')['data']['items'] ?? [];
    if ($items !== []) {
        throw new RuntimeException('El filtro vigente incluyó un certificado vencido.');
    }

    $filteredVencido = request($port, 'GET', '/admin/certificados?estado=vencido&cursoId=' . $curso2Id . '&alumnoId=' . $alumnoId, $authHeaders);
    assertStatus($filteredVencido, 200, 'listado filtrado vencido');
    $filteredVencidoItems = assertJson($filteredVencido, 'listado filtrado vencido')['data']['items'] ?? [];
    if (!is_array($filteredVencidoItems) || count($filteredVencidoItems) !== 1 || (int) ($filteredVencidoItems[0]['id'] ?? 0) !== $expiredCertificateId) {
        throw new RuntimeException('listado filtrado vencido no devolvió el certificado esperado o incluyó el vigente.');
    }

    assertError(request($port, 'GET', '/admin/certificados?estado=invalido', $authHeaders), 400, 'VALIDATION_ERROR', 'filtro estado inválido');
    assertError(request($port, 'GET', '/admin/certificados?estado%5B%5D=invalido', $authHeaders), 400, 'VALIDATION_ERROR', 'filtro estado no escalar');

    assertError(putJson($port, '/admin/configuracion-institucional', $adminKey, [
        'institutionName' => 'IFTS N.° 14',
        'rectorRole' => str_repeat('x', InstitutionalConfig::ROLE_MAX_LENGTH + 1),
    ]), 400, 'VALIDATION_ERROR', 'config PUT excede largo de cargo');

    $detail = request($port, 'GET', '/admin/certificados/' . $certificateId, $authHeaders);
    assertStatus($detail, 200, 'detalle certificado');
    $detailBody = assertJson($detail, 'detalle certificado')['data'] ?? [];
    if (($detailBody['student']['documentMasked'] ?? '') === '' || isset($detailBody['student']['documentNumber'])) {
        throw new RuntimeException('detalle: DTO estudiante administrativo inválido.');
    }
    if (!is_array($detailBody['attendedDates'] ?? null) || count($detailBody['attendedDates']) < 1) {
        throw new RuntimeException('detalle: faltan fechas asistidas del snapshot.');
    }
    if (($detailBody['attendedDates'][0]['descripcion'] ?? '') !== 'Clase consulta') {
        throw new RuntimeException('detalle: descripción del snapshot inesperada.');
    }

    $updateLiveDate = $pdo->prepare('UPDATE cert_curso_fechas SET descripcion = ? WHERE id = ?');
    $updateLiveDate->execute(['Clase editada post emisión', $fechaId]);
    $detailAfterLiveEdit = request($port, 'GET', '/admin/certificados/' . $certificateId, $authHeaders);
    $detailAfterLiveEditBody = assertJson($detailAfterLiveEdit, 'detalle tras editar fecha viva')['data'] ?? [];
    if (($detailAfterLiveEditBody['attendedDates'][0]['descripcion'] ?? '') !== 'Clase consulta') {
        throw new RuntimeException('detalle: driftó al editar cert_curso_fechas en lugar de leer snapshot.');
    }
    if (!isset($detailBody['links']['manualDelivery'], $detailBody['links']['pdf'])) {
        throw new RuntimeException('detalle: faltan links administrativos relativos.');
    }
    assertNoSensitiveAdminCertificateData($detail['body']);
    if (str_contains($detail['body'], $dni)) {
        throw new RuntimeException('detalle expuso DNI completo.');
    }

    assertError(request($port, 'GET', '/admin/certificados/999999', $authHeaders), 404, 'CERTIFICATE_NOT_FOUND', 'detalle inexistente');
} finally {
    proc_terminate($process);
    proc_close($process);
    putenv($previousConfigPath === false ? 'CERTIFICADOS_CONFIG_PATH' : 'CERTIFICADOS_CONFIG_PATH=' . $previousConfigPath);
    cleanDir($tmpDir);
}

echo "OK AdminCertificadosConsultaHttpTest\n";

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
function putJson(int $port, string $path, string $adminKey, array $body): array
{
    return request($port, 'PUT', $path, jsonHeaders($adminKey), json_encode($body, JSON_THROW_ON_ERROR));
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

    return ['status' => (int) ($matches[1] ?? 0), 'headers' => [], 'body' => $contents];
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

function assertNoSensitiveAdminCertificateData(string $body): void
{
    foreach (['token_cifrado', 'documentNumber', 'dni_cifrado', 'token_hash'] as $forbidden) {
        if (str_contains($body, $forbidden)) {
            throw new RuntimeException('DTO administrativo expuso campo sensible: ' . $forbidden);
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
