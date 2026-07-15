<?php

declare(strict_types=1);

require_once __DIR__ . '/../src/DniCipher.php';
require_once __DIR__ . '/SessionHttpTest.php';

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
applySqlFile($pdo, __DIR__ . '/../../../database/migrations/005_prevenir_certificados_duplicados.sql');
applySqlFile($pdo, __DIR__ . '/../../../database/migrations/006_reconciliar_esquema_m4_02.sql');
applySqlFile($pdo, __DIR__ . '/../../../database/migrations/007_schema_migrations.sql');
applySqlFile($pdo, __DIR__ . '/../../../database/migrations/008_certificados_revision_contenido.sql');
applySqlFile($pdo, __DIR__ . '/../../../database/migrations/009_auditoria_sync_snapshot.sql');

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
    'admin_username' => 'bedelia',
    'admin_password_hash' => password_hash($adminKey, PASSWORD_DEFAULT),
    'admin_session_idle_seconds' => 1800,
    'admin_session_absolute_seconds' => 28800,
    'rate_limit_storage_path' => $ratePath,
    'app_salt' => 'salt_demo_http_e2e',
    'public_base_url' => 'https://demo.example.edu.ar/certificados',
    'certificate_storage_path' => $storagePath,
    'token_encryption_key' => base64_encode($tokenKey),
    'dni_cipher_key' => base64_encode($dniKey),
], true) . ';');

$dni = '12345678';

$pdo->prepare('INSERT INTO cert_configuracion_institucional (id, institucion_nombre, rector_nombre, rector_cargo, asesor_nombre, asesor_cargo, texto_certificado) VALUES (1, ?, ?, ?, ?, ?, ?)')
    ->execute(['IFTS 14 HTTP', 'Rector HTTP', 'Rector', 'Asesora HTTP', 'Asesora Pedagogica', 'Texto institucional HTTP.']);

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
    $authHeaders = loginAdminSessionHeaders($port, 'bedelia', $adminKey);

    $courseResponse = postJson($port, '/admin/cursos', $adminKey, [
        'codigo' => 'CUR-HTTP',
        'nombre' => 'Curso HTTP Demo',
    ]);
    assertStatus($courseResponse, 201, 'crear curso HTTP');
    $cursoId = (int) (assertJson($courseResponse, 'crear curso HTTP')['data']['id'] ?? 0);

    $studentResponse = postJson($port, '/admin/alumnos', $adminKey, [
        'apellidoNombre' => 'Alumno HTTP Demo',
        'dni' => $dni,
    ]);
    assertStatus($studentResponse, 201, 'crear alumno HTTP');
    $alumnoId = (int) (assertJson($studentResponse, 'crear alumno HTTP')['data']['id'] ?? 0);

    $date1Response = postJson($port, '/admin/cursos/' . $cursoId . '/fechas', $adminKey, [
        'fecha' => '2026-06-01',
        'descripcion' => 'Clase 1',
        'orden' => 1,
        'estado' => 'realizada',
    ]);
    assertStatus($date1Response, 201, 'crear fecha 1 HTTP');
    $fecha1 = (int) (assertJson($date1Response, 'crear fecha 1 HTTP')['data']['id'] ?? 0);

    $date2Response = postJson($port, '/admin/cursos/' . $cursoId . '/fechas', $adminKey, [
        'fecha' => '2026-06-08',
        'descripcion' => 'Clase 2',
        'orden' => 2,
        'estado' => 'realizada',
    ]);
    assertStatus($date2Response, 201, 'crear fecha 2 HTTP');
    $fecha2 = (int) (assertJson($date2Response, 'crear fecha 2 HTTP')['data']['id'] ?? 0);

    $asistencia1Response = postJson($port, '/admin/asistencias', $adminKey, ['alumnoId' => $alumnoId, 'cursoId' => $cursoId, 'cursoFechaId' => $fecha1]);
    assertStatus($asistencia1Response, 201, 'crear asistencia 1 HTTP');
    $asistencia1Id = (int) (assertJson($asistencia1Response, 'crear asistencia 1 HTTP')['data']['id'] ?? 0);

    assertStatus(postJson($port, '/admin/asistencias', $adminKey, ['alumnoId' => $alumnoId, 'cursoId' => $cursoId, 'cursoFechaId' => $fecha2]), 201, 'crear asistencia 2 HTTP');

    $emission = request($port, 'POST', '/admin/certificados', sessionJsonHeaders($authHeaders), json_encode([
        'alumnoId' => $alumnoId,
        'cursoId' => $cursoId,
        'issuedAt' => '2026-07-02',
        'expiresAt' => null,
    ], JSON_THROW_ON_ERROR));
    assertStatus($emission, 201, 'emisión HTTP');
    $emissionBody = assertJson($emission, 'emisión HTTP');
    $certificateId = (int) ($emissionBody['data']['id'] ?? 0);
    $validationUrl = (string) ($emissionBody['data']['publicValidationUrl'] ?? '');
    $pdfDownloadUrl = (string) ($emissionBody['data']['pdfDownloadUrl'] ?? '');
    $tokenPrefix = (string) ($emissionBody['data']['tokenPrefix'] ?? '');
    if ($certificateId < 1 || $validationUrl === '' || $pdfDownloadUrl === '' || $tokenPrefix === '' || isset($emissionBody['data']['student']['documentNumber'])) {
        throw new RuntimeException('emisión HTTP: DTO administrativo inválido.');
    }

    $duplicateEmission = postJson($port, '/admin/certificados', $adminKey, [
        'alumnoId' => $alumnoId,
        'cursoId' => $cursoId,
        'issuedAt' => '2026-07-02',
        'expiresAt' => null,
    ]);
    assertError($duplicateEmission, 409, 'CERTIFICATE_ALREADY_EXISTS', 'emisión duplicada HTTP');

    $pdfPath = (string) parse_url($pdfDownloadUrl, PHP_URL_PATH);
    if ($pdfPath === '') {
        throw new RuntimeException('emisión HTTP: URL de descarga PDF inválida.');
    }
    $pdf = request($port, 'GET', $pdfPath, $authHeaders);
    assertPdfDownload($pdf, 'descarga PDF HTTP', ['IFTS 14 HTTP', 'Texto institucional HTTP.', 'Rector HTTP', 'Rector', 'Asesora HTTP', 'Asesora Pedagogica']);

    $unsafeCertificateCode = "CERT/2026\r\nBAD\\TOKEN";
    $safeCertificateCode = 'CERT_2026__BAD_TOKEN';
    $pdfFiles = glob($storagePath . '/*.pdf') ?: [];
    if (count($pdfFiles) !== 1 || !rename($pdfFiles[0], $storagePath . '/' . $safeCertificateCode . '.pdf')) {
        throw new RuntimeException('descarga PDF/QR HTTP: no se pudo preparar código inseguro de certificado.');
    }
    $pdo->prepare('UPDATE cert_certificados SET codigo_certificado = ? WHERE id = ?')
        ->execute([$unsafeCertificateCode, $certificateId]);

    $pdfWithUnsafeCode = request($port, 'GET', $pdfPath, $authHeaders);
    assertPdfDownload($pdfWithUnsafeCode, 'descarga PDF HTTP con filename sanitizado');
    assertContentDisposition($pdfWithUnsafeCode, 'attachment; filename="' . $safeCertificateCode . '.pdf"', 'descarga PDF HTTP con filename sanitizado');

    // Desactualizar el PDF borrando una asistencia
    $deleteAtt = request($port, 'DELETE', '/admin/asistencias/' . $asistencia1Id, $authHeaders);
    assertStatus($deleteAtt, 200, 'anular asistencia HTTP');

    $outdatedPdf = request($port, 'GET', $pdfPath, $authHeaders);
    assertError($outdatedPdf, 409, 'PDF_OUTDATED', 'descarga PDF desactualizado HTTP');

    $tokenSnapshotBeforeQr = tokenSnapshot($pdo, $certificateId);
    $qr = request($port, 'GET', '/admin/certificados/' . $certificateId . '/qr.png', $authHeaders);
    assertPngDownload($qr, 'descarga QR HTTP');
    assertContentDisposition($qr, 'attachment; filename="' . $safeCertificateCode . '-qr.png"', 'descarga QR HTTP con filename sanitizado');
    if (tokenSnapshot($pdo, $certificateId) !== $tokenSnapshotBeforeQr) {
        throw new RuntimeException('descarga QR HTTP: mutó token o certificado.');
    }

    $missingQr = request($port, 'GET', '/admin/certificados/999999/qr.png', $authHeaders);
    assertError($missingQr, 404, 'CERTIFICATE_NOT_FOUND', 'QR inexistente HTTP');

    $token = basename((string) parse_url($validationUrl, PHP_URL_PATH));
    $validation = request($port, 'GET', '/certificados/' . rawurlencode($token) . '/verificacion');
    assertStatus($validation, 200, 'validación pública HTTP');
    $validationBody = assertJson($validation, 'validación pública HTTP');
    if (($validationBody['data']['student']['documentNumber'] ?? '') !== $dni || ($validationBody['data']['course']['attendedDates'] ?? []) !== ['2026-06-08']) {
        throw new RuntimeException('validación pública HTTP: DTO inválido.');
    }

    $manual = request($port, 'GET', '/admin/certificados/' . $certificateId . '/entrega-manual', $authHeaders);
    assertStatus($manual, 200, 'entrega manual HTTP');
    $manualBody = assertJson($manual, 'entrega manual HTTP');
    if (($manualBody['data']['publicValidationUrl'] ?? '') !== $validationUrl || ($manualBody['data']['tokenPrefix'] ?? '') !== $tokenPrefix) {
        throw new RuntimeException('entrega manual HTTP: rotó o cambió el token.');
    }
    if (($manualBody['data']['pdfAvailable'] ?? null) !== false) {
        throw new RuntimeException('entrega manual HTTP: pdfAvailable no es false para certificado desactualizado.');
    }
    if (($manualBody['data']['pdfStatus'] ?? '') !== 'outdated') {
        throw new RuntimeException('entrega manual HTTP: pdfStatus no es outdated.');
    }

    $resend = request($port, 'POST', '/admin/certificados/' . $certificateId . '/reenviar', sessionJsonHeaders($authHeaders), '{"destinatarioEmail":"persona@example.edu.ar"}');
    assertError($resend, 404, 'NOT_FOUND', 'reenvío removido HTTP');

    $pdo->exec('DELETE FROM cert_configuracion_institucional WHERE id = 1');
    $revocation = postJson($port, '/admin/certificados/' . $certificateId . '/revocar', $adminKey, []);
    assertStatus($revocation, 200, 'revocación HTTP previa a nueva emisión');
    $fallbackEmission = request($port, 'POST', '/admin/certificados', sessionJsonHeaders($authHeaders), json_encode([
        'alumnoId' => $alumnoId,
        'cursoId' => $cursoId,
        'issuedAt' => '2026-07-02',
        'expiresAt' => null,
    ], JSON_THROW_ON_ERROR));
    assertStatus($fallbackEmission, 201, 'emisión HTTP sin config institucional');
    $fallbackBody = assertJson($fallbackEmission, 'emisión HTTP sin config institucional');
    if (!isset($fallbackBody['data']['publicValidationUrl'], $fallbackBody['data']['pdfDownloadUrl'], $fallbackBody['data']['tokenPrefix']) || isset($fallbackBody['data']['student']['documentNumber'])) {
        throw new RuntimeException('emisión HTTP sin config institucional: DTO administrativo inválido.');
    }

    $fallbackCertificateId = (int) ($fallbackBody['data']['id'] ?? 0);
    $pdo->prepare('UPDATE cert_certificados SET estado = \'vencido\' WHERE id = ?')
        ->execute([$fallbackCertificateId]);
    $expiredStateEmission = postJson($port, '/admin/certificados', $adminKey, [
        'alumnoId' => $alumnoId,
        'cursoId' => $cursoId,
        'issuedAt' => '2026-07-02',
        'expiresAt' => null,
    ]);
    assertStatus($expiredStateEmission, 201, 'emisión HTTP tras estado vencido');
    $expiredStateBody = assertJson($expiredStateEmission, 'emisión HTTP tras estado vencido');
    $expiredStateCertificateId = (int) ($expiredStateBody['data']['id'] ?? 0);

    $pdo->prepare('UPDATE cert_tokens_verificacion SET token_cifrado = NULL WHERE certificado_id = ?')
        ->execute([$expiredStateCertificateId]);
    $legacyQr = request($port, 'GET', '/admin/certificados/' . $expiredStateCertificateId . '/qr.png', $authHeaders);
    assertError($legacyQr, 409, 'TOKEN_NOT_RECOVERABLE', 'QR token no recuperable HTTP');
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

/** @return array{status:int,headers:array<string,string>,body:string} */
function postJson(int $port, string $path, string $adminKey, array $body): array
{
    global $authHeaders;

    return request($port, 'POST', $path, sessionJsonHeaders($authHeaders), json_encode($body, JSON_THROW_ON_ERROR));
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
    assertSecurityHeaders($response, $label);
    assertAntiCacheHeaders($response, $label);
    if (!str_starts_with($response['headers']['content-type'] ?? '', 'application/json')) {
        throw new RuntimeException("{$label}: Content-Type JSON inválido.");
    }
    $body = assertJson($response, $label);
    if (($body['error']['code'] ?? '') !== $code) {
        throw new RuntimeException("{$label}: código de error inválido.");
    }
}

/** @param array{status:int,headers:array<string,string>,body:string} $response */
function assertContentDisposition(array $response, string $expected, string $label): void
{
    if (($response['headers']['content-disposition'] ?? '') !== $expected) {
        throw new RuntimeException("{$label}: Content-Disposition no fue sanitizado.");
    }
}

/** @param array{status:int,headers:array<string,string>,body:string} $response */
function assertAntiCacheHeaders(array $response, string $label): void
{
    if (($response['headers']['cache-control'] ?? '') !== 'no-store, private, max-age=0') {
        throw new RuntimeException("{$label}: falta Cache-Control anti-cache.");
    }
    if (($response['headers']['pragma'] ?? '') !== 'no-cache') {
        throw new RuntimeException("{$label}: falta Pragma anti-cache.");
    }
    if (($response['headers']['expires'] ?? '') !== '0') {
        throw new RuntimeException("{$label}: falta Expires anti-cache.");
    }
}

/** @param array{status:int,headers:array<string,string>,body:string} $response */
function assertSecurityHeaders(array $response, string $label): void
{
    if (($response['headers']['x-content-type-options'] ?? '') !== 'nosniff') {
        throw new RuntimeException("{$label}: falta X-Content-Type-Options.");
    }
    if (($response['headers']['x-frame-options'] ?? '') !== 'SAMEORIGIN') {
        throw new RuntimeException("{$label}: falta X-Frame-Options.");
    }
}

/** @param array{status:int,headers:array<string,string>,body:string} $response @param list<string> $expectedText */
function assertPdfDownload(array $response, string $label, array $expectedText = []): void
{
    assertStatus($response, 200, $label);
    if (!str_starts_with($response['headers']['content-type'] ?? '', 'application/pdf')) {
        throw new RuntimeException("{$label}: Content-Type inválido.");
    }
    if (!str_contains($response['headers']['content-disposition'] ?? '', 'attachment')) {
        throw new RuntimeException("{$label}: Content-Disposition inválido.");
    }
    if (!str_starts_with($response['body'], '%PDF-')) {
        throw new RuntimeException("{$label}: cuerpo PDF inválido.");
    }
    foreach ($expectedText as $text) {
        if (!str_contains($response['body'], $text)) {
            throw new RuntimeException("{$label}: falta texto visible esperado: {$text}.");
        }
    }
}

/** @param array{status:int,headers:array<string,string>,body:string} $response */
function assertPngDownload(array $response, string $label): void
{
    assertStatus($response, 200, $label);
    if (!str_starts_with($response['headers']['content-type'] ?? '', 'image/png')) {
        throw new RuntimeException("{$label}: Content-Type inválido.");
    }
    if (!str_contains($response['headers']['content-disposition'] ?? '', 'attachment')) {
        throw new RuntimeException("{$label}: Content-Disposition inválido.");
    }
    if (($response['headers']['cache-control'] ?? '') !== 'no-store, private, max-age=0') {
        throw new RuntimeException("{$label}: Cache-Control inválido.");
    }
    if (($response['headers']['content-length'] ?? '') !== (string) strlen($response['body'])) {
        throw new RuntimeException("{$label}: Content-Length inválido.");
    }
    if (!str_starts_with($response['body'], "\x89PNG\r\n\x1a\n")) {
        throw new RuntimeException("{$label}: cuerpo PNG inválido.");
    }
}

/** @return array<string, mixed> */
function tokenSnapshot(PDO $pdo, int $certificateId): array
{
    $statement = $pdo->prepare('SELECT estado, token_prefijo, token_cifrado FROM cert_tokens_verificacion WHERE certificado_id = ? ORDER BY id');
    $statement->execute([$certificateId]);

    return $statement->fetchAll(PDO::FETCH_ASSOC);
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
