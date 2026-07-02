<?php

declare(strict_types=1);

require_once __DIR__ . '/../src/DniCipher.php';

$dsn = getenv('IFTS14_TEST_DB_DSN');
$user = getenv('IFTS14_TEST_DB_USER') ?: 'root';
$pass = getenv('IFTS14_TEST_DB_PASS') ?: '';

if (!is_string($dsn) || $dsn === '' || getenv('IFTS14_TEST_DB_ALLOW_RESET') !== '1') {
    echo "SKIP HttpEmissionE2eTest: requiere IFTS14_TEST_DB_DSN e IFTS14_TEST_DB_ALLOW_RESET=1 sobre una DB descartable.\n";
    return;
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

$root = dirname(__DIR__);
$tmpDir = sys_get_temp_dir() . '/ifts14-http-emission-e2e-' . bin2hex(random_bytes(4));
if (!mkdir($tmpDir, 0700) && !is_dir($tmpDir)) {
    throw new RuntimeException('No se pudo preparar el directorio temporal.');
}

$adminKey = 'admin_demo_key_http_e2e_2026';
$tokenKey = str_repeat('t', 32);
$dniKey = str_repeat('d', 32);
$pepper = 'pepper_http_e2e_demo_2026';
$configPath = $tmpDir . '/config.php';
$storagePath = $tmpDir . '/pdf-storage';
$ratePath = $tmpDir . '/rate-limit.json';

file_put_contents($configPath, '<?php return ' . var_export([
    'db_host' => $db['host'],
    'db_name' => $db['dbname'],
    'db_user' => $user,
    'db_pass' => $pass,
    'token_pepper' => $pepper,
    'admin_api_key' => $adminKey,
    'rate_limit_storage_path' => $ratePath,
    'app_salt' => 'salt_demo_http_e2e',
    'public_base_url' => 'https://demo.example.edu.ar/certificados',
    'certificate_storage_path' => $storagePath,
    'token_encryption_key' => base64_encode($tokenKey),
    'dni_cipher_key' => base64_encode($dniKey),
], true) . ';');

$dni = '12345678';
$pdo->prepare('INSERT INTO cert_alumnos (apellido_nombre, dni_hash, dni_cifrado, dni_mostrar, estado) VALUES (?, ?, ?, ?, \'activo\')')
    ->execute(['Alumno HTTP Demo', hash('sha256', $dni, true), DniCipher::encrypt($dni, $dniKey), '12******78']);
$alumnoId = (int) $pdo->lastInsertId();

$pdo->prepare('INSERT INTO cert_cursos (codigo, nombre, estado) VALUES (?, ?, \'activo\')')
    ->execute(['CUR-HTTP', 'Curso HTTP Demo']);
$cursoId = (int) $pdo->lastInsertId();

$insertDate = $pdo->prepare('INSERT INTO cert_curso_fechas (curso_id, fecha, descripcion, orden, estado) VALUES (?, ?, ?, ?, ?)');
$insertDate->execute([$cursoId, '2026-06-01', 'Clase 1', 1, 'realizada']);
$fecha1 = (int) $pdo->lastInsertId();
$insertDate->execute([$cursoId, '2026-06-08', 'Clase 2', 2, 'programada']);
$fecha2 = (int) $pdo->lastInsertId();

$insertAttendance = $pdo->prepare('INSERT INTO cert_asistencias (alumno_id, curso_fecha_id, eliminado_en) VALUES (?, ?, NULL)');
$insertAttendance->execute([$alumnoId, $fecha1]);
$insertAttendance->execute([$alumnoId, $fecha2]);

$port = random_int(21000, 21999);
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

    $emission = request($port, 'POST', '/admin/certificados', [
        'Content-Type: application/json',
        'X-Admin-Key: ' . $adminKey,
    ], json_encode([
        'alumnoId' => $alumnoId,
        'cursoId' => $cursoId,
        'issuedAt' => '2026-07-02',
        'expiresAt' => null,
    ], JSON_THROW_ON_ERROR));
    assertStatus($emission, 201, 'emisión HTTP');
    $emissionBody = assertJson($emission, 'emisión HTTP');
    $certificateId = (int) ($emissionBody['data']['id'] ?? 0);
    $validationUrl = (string) ($emissionBody['data']['publicValidationUrl'] ?? '');
    $tokenPrefix = (string) ($emissionBody['data']['tokenPrefix'] ?? '');
    if ($certificateId < 1 || $validationUrl === '' || $tokenPrefix === '' || isset($emissionBody['data']['student']['documentNumber'])) {
        throw new RuntimeException('emisión HTTP: DTO administrativo inválido.');
    }

    $token = basename((string) parse_url($validationUrl, PHP_URL_PATH));
    $validation = request($port, 'GET', '/certificados/' . rawurlencode($token) . '/verificacion');
    assertStatus($validation, 200, 'validación pública HTTP');
    $validationBody = assertJson($validation, 'validación pública HTTP');
    if (($validationBody['data']['student']['documentNumber'] ?? '') !== $dni || ($validationBody['data']['course']['attendedDates'] ?? []) !== ['2026-06-01', '2026-06-08']) {
        throw new RuntimeException('validación pública HTTP: DTO inválido.');
    }

    $manual = request($port, 'GET', '/admin/certificados/' . $certificateId . '/entrega-manual', [
        'X-Admin-Key: ' . $adminKey,
    ]);
    assertStatus($manual, 200, 'entrega manual HTTP');
    $manualBody = assertJson($manual, 'entrega manual HTTP');
    if (($manualBody['data']['publicValidationUrl'] ?? '') !== $validationUrl || ($manualBody['data']['tokenPrefix'] ?? '') !== $tokenPrefix) {
        throw new RuntimeException('entrega manual HTTP: rotó o cambió el token.');
    }

    $resend = request($port, 'POST', '/admin/certificados/' . $certificateId . '/reenviar', [
        'Content-Type: application/json',
        'X-Admin-Key: ' . $adminKey,
    ], '{"destinatarioEmail":"persona@example.edu.ar"}');
    assertError($resend, 404, 'NOT_FOUND', 'reenvío removido HTTP');
} finally {
    proc_terminate($process);
    proc_close($process);
    putenv($previousConfigPath === false ? 'CERTIFICADOS_CONFIG_PATH' : 'CERTIFICADOS_CONFIG_PATH=' . $previousConfigPath);
    cleanDir($tmpDir);
}

echo "OK HttpEmissionE2eTest\n";

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
        throw new RuntimeException("{$label}: HTTP esperado {$expected}, recibido {$response['status']}.");
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
