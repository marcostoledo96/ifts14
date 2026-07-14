<?php

declare(strict_types=1);

require_once __DIR__ . '/src/Response.php';
require_once __DIR__ . '/src/Config.php';
require_once __DIR__ . '/src/RateLimiter.php';
require_once __DIR__ . '/src/Database.php';
require_once __DIR__ . '/src/CertificateValidator.php';
require_once __DIR__ . '/src/AuthGate.php';
require_once __DIR__ . '/src/AdminCertificateService.php';
require_once __DIR__ . '/src/AdminMasterDataService.php';
require_once __DIR__ . '/src/AdminInstitutionalConfigService.php';

$requestId = 'req_' . bin2hex(random_bytes(8));

set_exception_handler(static function (Throwable $exception) use ($requestId): void {
    Response::error(500, 'INTERNAL_ERROR', 'No se pudo procesar la solicitud.', $requestId);
});

$method = $_SERVER['REQUEST_METHOD'] ?? 'GET';
$path = parse_url($_SERVER['REQUEST_URI'] ?? '/', PHP_URL_PATH) ?: '/';
$path = normalizePath($path);

if ($path === '/health') {
    if ($method !== 'GET') {
        header('Allow: GET');
        Response::error(405, 'METHOD_NOT_ALLOWED', 'Método no permitido.', $requestId);
        return;
    }

    Response::json(200, [
        'status' => 'ok',
        'service' => 'certificados-api',
    ], $requestId);
    return;
}

if (preg_match('#^/certificados/([^/]*)/verificacion$#', $path, $matches) === 1) {
    if ($method !== 'GET') {
        header('Allow: GET');
        Response::error(405, 'METHOD_NOT_ALLOWED', 'Método no permitido.', $requestId);
        return;
    }

    $config = Config::load();
    if (!allowPublicRequest($config, $requestId)) {
        return;
    }

    respondToValidation(rawurldecode($matches[1]), $requestId, $config);
    return;
}

if ($path === '/certificados/consulta') {
    if ($method !== 'POST') {
        header('Allow: POST');
        Response::error(405, 'METHOD_NOT_ALLOWED', 'Método no permitido.', $requestId);
        return;
    }

    if (!requireJsonContentType($requestId)) {
        return;
    }

    $body = readJsonBody($requestId);
    if ($body === null) {
        return;
    }

    $config = Config::load();
    if (!allowPublicRequest($config, $requestId)) {
        return;
    }

    $token = isset($body['token']) && is_string($body['token']) ? $body['token'] : '';

    respondToValidation($token, $requestId, $config);
    return;
}

if ($path === '/admin/cursos') {
    if (!in_array($method, ['GET', 'POST'], true)) {
        Response::error(404, 'NOT_FOUND', 'Recurso no encontrado.', $requestId);
        return;
    }
    $config = adminConfig($requestId, $method === 'POST');
    if ($config === null) {
        return;
    }

    $body = $method === 'POST' ? readJsonBody($requestId) : null;
    if ($method === 'POST' && $body === null) {
        return;
    }

    respondToAdmin(static function () use ($config, $requestId, $method, $body): array {
        $service = new AdminMasterDataService(Database::pdo($config), $requestId);
        return $method === 'POST'
            ? ['status' => 201, 'data' => $service->createCourse($body ?? [])]
            : ['status' => 200, 'data' => $service->listCourses(is_string($_GET['estado'] ?? null) ? $_GET['estado'] : null)];
    }, $requestId);
    return;
}

if (preg_match('#^/admin/cursos/(\d+)$#', $path, $matches) === 1) {
    if ($method !== 'GET') {
        Response::error(404, 'NOT_FOUND', 'Recurso no encontrado.', $requestId);
        return;
    }

    $config = adminConfig($requestId);
    if ($config === null) {
        return;
    }

    respondToAdmin(static function () use ($config, $requestId, $matches): array {
        return ['status' => 200, 'data' => (new AdminMasterDataService(Database::pdo($config), $requestId))->getCourse((int) $matches[1])];
    }, $requestId);
    return;
}

if (preg_match('#^/admin/cursos/(\d+)/estado$#', $path, $matches) === 1) {
    if ($method !== 'PATCH') {
        Response::error(404, 'NOT_FOUND', 'Recurso no encontrado.', $requestId);
        return;
    }
    $config = adminConfig($requestId, true);
    if ($config === null) {
        return;
    }
    $body = readJsonBody($requestId);
    if ($body === null) {
        return;
    }

    respondToAdmin(static function () use ($config, $requestId, $matches, $body): array {
        return ['status' => 200, 'data' => (new AdminMasterDataService(Database::pdo($config), $requestId))->updateCourseStatus((int) $matches[1], $body)];
    }, $requestId);
    return;
}

if ($path === '/admin/alumnos') {
    if (!in_array($method, ['GET', 'POST'], true)) {
        Response::error(404, 'NOT_FOUND', 'Recurso no encontrado.', $requestId);
        return;
    }
    $config = adminConfig($requestId, $method === 'POST');
    if ($config === null) {
        return;
    }
    $dniCipherKey = $method === 'POST' ? loadDniCipherKey($config, $requestId) : null;
    if ($method === 'POST' && $dniCipherKey === null) {
        return;
    }
    $body = $method === 'POST' ? readJsonBody($requestId) : null;
    if ($method === 'POST' && $body === null) {
        return;
    }

    respondToAdmin(static function () use ($config, $requestId, $method, $body, $dniCipherKey): array {
        $service = new AdminMasterDataService(Database::pdo($config), $requestId, $dniCipherKey);
        return $method === 'POST'
            ? ['status' => 201, 'data' => $service->createStudent($body ?? [])]
            : ['status' => 200, 'data' => $service->listStudents()];
    }, $requestId);
    return;
}

if (preg_match('#^/admin/alumnos/(\d+)$#', $path, $matches) === 1) {
    if ($method !== 'GET') {
        Response::error(404, 'NOT_FOUND', 'Recurso no encontrado.', $requestId);
        return;
    }

    $config = adminConfig($requestId);
    if ($config === null) {
        return;
    }

    respondToAdmin(static function () use ($config, $requestId, $matches): array {
        return ['status' => 200, 'data' => (new AdminMasterDataService(Database::pdo($config), $requestId))->getStudent((int) $matches[1])];
    }, $requestId);
    return;
}

if (preg_match('#^/admin/alumnos/(\d+)/estado$#', $path, $matches) === 1) {
    if ($method !== 'PATCH') {
        Response::error(404, 'NOT_FOUND', 'Recurso no encontrado.', $requestId);
        return;
    }
    $config = adminConfig($requestId, true);
    if ($config === null) {
        return;
    }
    $body = readJsonBody($requestId);
    if ($body === null) {
        return;
    }

    respondToAdmin(static function () use ($config, $requestId, $matches, $body): array {
        return ['status' => 200, 'data' => (new AdminMasterDataService(Database::pdo($config), $requestId))->updateStudentStatus((int) $matches[1], $body)];
    }, $requestId);
    return;
}

if (preg_match('#^/admin/cursos/(\d+)/fechas$#', $path, $matches) === 1) {
    if (!in_array($method, ['GET', 'POST'], true)) {
        Response::error(404, 'NOT_FOUND', 'Recurso no encontrado.', $requestId);
        return;
    }
    $config = adminConfig($requestId, $method === 'POST');
    if ($config === null) {
        return;
    }
    $body = $method === 'POST' ? readJsonBody($requestId) : null;
    if ($method === 'POST' && $body === null) {
        return;
    }

    respondToAdmin(static function () use ($config, $requestId, $method, $matches, $body): array {
        $service = new AdminMasterDataService(Database::pdo($config), $requestId);
        return $method === 'POST'
            ? ['status' => 201, 'data' => $service->createCourseDate((int) $matches[1], $body ?? [])]
            : ['status' => 200, 'data' => $service->listCourseDates((int) $matches[1])];
    }, $requestId);
    return;
}

if (preg_match('#^/admin/cursos/(\d+)/fechas/(\d+)$#', $path, $matches) === 1) {
    if ($method !== 'PATCH') {
        Response::error(404, 'NOT_FOUND', 'Recurso no encontrado.', $requestId);
        return;
    }
    $config = adminConfig($requestId, true);
    if ($config === null) {
        return;
    }
    $body = readJsonBody($requestId);
    if ($body === null) {
        return;
    }

    respondToAdmin(static function () use ($config, $requestId, $matches, $body): array {
        return ['status' => 200, 'data' => (new AdminMasterDataService(Database::pdo($config), $requestId))->updateCourseDate((int) $matches[1], (int) $matches[2], $body)];
    }, $requestId);
    return;
}

if ($path === '/admin/asistencias') {
    if (!in_array($method, ['GET', 'POST'], true)) {
        Response::error(404, 'NOT_FOUND', 'Recurso no encontrado.', $requestId);
        return;
    }
    $config = adminConfig($requestId, $method === 'POST');
    if ($config === null) {
        return;
    }
    $body = $method === 'POST' ? readJsonBody($requestId) : null;
    if ($method === 'POST' && $body === null) {
        return;
    }

    respondToAdmin(static function () use ($config, $requestId, $method, $body): array {
        $service = new AdminMasterDataService(Database::pdo($config), $requestId);
        if ($method === 'POST') {
            return ['status' => 201, 'data' => $service->recordAttendance($body ?? [])];
        }

        $courseId = optionalPositiveQueryInt('cursoId');
        $studentId = optionalPositiveQueryInt('alumnoId');
        return ['status' => 200, 'data' => $service->listAttendances($courseId, $studentId)];
    }, $requestId);
    return;
}

if (preg_match('#^/admin/asistencias/(\d+)$#', $path, $matches) === 1) {
    if ($method !== 'DELETE') {
        Response::error(404, 'NOT_FOUND', 'Recurso no encontrado.', $requestId);
        return;
    }

    $config = adminConfig($requestId);
    if ($config === null) {
        return;
    }

    respondToAdmin(static function () use ($config, $requestId, $matches): array {
        return ['status' => 200, 'data' => (new AdminMasterDataService(Database::pdo($config), $requestId))->voidAttendance((int) $matches[1])];
    }, $requestId);
    return;
}

if ($path === '/admin/certificados') {
    if (!in_array($method, ['GET', 'POST'], true)) {
        header('Allow: GET, POST');
        Response::error(405, 'METHOD_NOT_ALLOWED', 'Método no permitido.', $requestId);
        return;
    }

    if ($method === 'GET') {
        $config = adminConfig($requestId);
        if ($config === null) {
            return;
        }

        respondToAdmin(static function () use ($config, $requestId): array {
            $estado = optionalQueryString('estado');
            $cursoId = optionalPositiveQueryInt('cursoId');
            $alumnoId = optionalPositiveQueryInt('alumnoId');
            $service = new AdminCertificateService(
                Database::pdo($config),
                (string) $config['token_pepper'],
                $requestId,
                null,
                (string) $config['app_salt'],
            );

            return [
                'status' => 200,
                'data' => $service->listCertificados([
                    'estado' => $estado,
                    'cursoId' => $cursoId,
                    'alumnoId' => $alumnoId,
                ]),
            ];
        }, $requestId);
        return;
    }

    $config = adminConfig($requestId, true);
    if ($config === null) {
        return;
    }

    if (!loadPdfDependencies($requestId)) {
        return;
    }

    try {
        $config = Config::requirePdfConfig($config);
    } catch (RuntimeException) {
        Response::error(500, 'CONFIGURATION_ERROR', 'No se pudo procesar la solicitud.', $requestId);
        return;
    }

    $tokenCipherKey = loadTokenCipherKey($config, $requestId);
    if ($tokenCipherKey === null) {
        return;
    }

    $dniCipherKey = loadDniCipherKey($config, $requestId);
    if ($dniCipherKey === null) {
        return;
    }

    $body = readJsonBody($requestId);
    if ($body === null) {
        return;
    }

    respondToAdmin(static function () use ($config, $requestId, $body, $tokenCipherKey, $dniCipherKey): array {
        $service = new AdminCertificateService(
            Database::pdo($config),
            (string) $config['token_pepper'],
            $requestId,
            null,
            (string) $config['app_salt'],
            new CertificatePdfService((string) $config['certificate_storage_path']),
            (string) $config['public_base_url'],
            $tokenCipherKey,
            null,
            $dniCipherKey,
        );

        return ['status' => 201, 'data' => $service->emitir($body)];
    }, $requestId);
    return;
}

if (preg_match('#^/admin/certificados/(\d+)$#', $path, $matches) === 1) {
    if ($method !== 'GET') {
        header('Allow: GET');
        Response::error(405, 'METHOD_NOT_ALLOWED', 'Método no permitido.', $requestId);
        return;
    }

    $config = adminConfig($requestId);
    if ($config === null) {
        return;
    }

    respondToAdmin(static function () use ($config, $requestId, $matches): array {
        $service = new AdminCertificateService(
            Database::pdo($config),
            (string) $config['token_pepper'],
            $requestId,
            null,
            (string) $config['app_salt'],
        );

        return ['status' => 200, 'data' => $service->getCertificado((int) $matches[1])];
    }, $requestId);
    return;
}

if ($path === '/admin/configuracion-institucional') {
    if (!in_array($method, ['GET', 'PUT'], true)) {
        header('Allow: GET, PUT');
        Response::error(405, 'METHOD_NOT_ALLOWED', 'Método no permitido.', $requestId);
        return;
    }

    $config = adminConfig($requestId, $method === 'PUT');
    if ($config === null) {
        return;
    }

    if ($method === 'GET') {
        respondToAdmin(static function () use ($config, $requestId): array {
            return [
                'status' => 200,
                'data' => (new AdminInstitutionalConfigService(Database::pdo($config), $requestId))->get(),
            ];
        }, $requestId);
        return;
    }

    $body = readJsonBody($requestId);
    if ($body === null) {
        return;
    }

    respondToAdmin(static function () use ($config, $requestId, $body): array {
        return [
            'status' => 200,
            'data' => (new AdminInstitutionalConfigService(Database::pdo($config), $requestId))->update($body),
        ];
    }, $requestId);
    return;
}

if (preg_match('#^/admin/certificados/(\d+)/revocar$#', $path, $matches) === 1) {
    if ($method !== 'POST') {
        header('Allow: POST');
        Response::error(405, 'METHOD_NOT_ALLOWED', 'Método no permitido.', $requestId);
        return;
    }

    $config = adminConfig($requestId, true);
    if ($config === null) {
        return;
    }

    $body = readJsonBody($requestId);
    if ($body === null) {
        return;
    }
    $reason = isset($body['reason']) && is_string($body['reason']) ? $body['reason'] : null;

    respondToAdmin(static function () use ($config, $requestId, $matches, $reason): array {
        $service = new AdminCertificateService(
            Database::pdo($config),
            (string) $config['token_pepper'],
            $requestId,
            null,
            (string) $config['app_salt'],
        );

        return ['status' => 200, 'data' => $service->revocar($matches[1], $reason)];
    }, $requestId);
    return;
}

if (preg_match('#^/admin/certificados/([^/]+)/pdf$#', $path, $matches) === 1) {
    if ($method !== 'GET') {
        header('Allow: GET');
        Response::error(405, 'METHOD_NOT_ALLOWED', 'Método no permitido.', $requestId);
        return;
    }

    $certificateId = filter_var($matches[1], FILTER_VALIDATE_INT, ['options' => ['min_range' => 1]]);
    if (!is_int($certificateId)) {
        Response::error(400, 'VALIDATION_ERROR', 'Solicitud inválida.', $requestId);
        return;
    }

    $config = adminConfig($requestId);
    if ($config === null) {
        return;
    }

    if (!loadPdfDependencies($requestId)) {
        return;
    }

    try {
        $config = Config::requirePdfConfig($config);
    } catch (RuntimeException) {
        Response::error(500, 'CONFIGURATION_ERROR', 'No se pudo procesar la solicitud.', $requestId);
        return;
    }

    streamPdf($config, $certificateId, $requestId);
    return;
}

if (preg_match('#^/admin/certificados/([^/]+)/qr\.png$#', $path, $matches) === 1) {
    if ($method !== 'GET') {
        header('Allow: GET');
        Response::error(405, 'METHOD_NOT_ALLOWED', 'Método no permitido.', $requestId);
        return;
    }

    $certificateId = filter_var($matches[1], FILTER_VALIDATE_INT, ['options' => ['min_range' => 1]]);
    if (!is_int($certificateId)) {
        Response::error(400, 'VALIDATION_ERROR', 'Solicitud inválida.', $requestId);
        return;
    }

    $config = adminConfig($requestId);
    if ($config === null) {
        return;
    }

    if (!loadPdfDependencies($requestId)) {
        return;
    }

    try {
        $config = Config::requirePdfConfig($config);
    } catch (RuntimeException) {
        Response::error(500, 'CONFIGURATION_ERROR', 'No se pudo procesar la solicitud.', $requestId);
        return;
    }

    $tokenCipherKey = loadTokenCipherKey($config, $requestId);
    if ($tokenCipherKey === null) {
        return;
    }

    streamQrPng($config, $certificateId, $requestId, $tokenCipherKey);
    return;
}

if (preg_match('#^/admin/certificados/([^/]+)/entrega-manual$#', $path, $matches) === 1) {
    if ($method !== 'GET') {
        header('Allow: GET');
        Response::error(405, 'METHOD_NOT_ALLOWED', 'Método no permitido.', $requestId);
        return;
    }

    $certificateId = filter_var($matches[1], FILTER_VALIDATE_INT, ['options' => ['min_range' => 1]]);
    if (!is_int($certificateId)) {
        Response::error(400, 'VALIDATION_ERROR', 'Solicitud inválida.', $requestId);
        return;
    }

    $config = adminConfig($requestId);
    if ($config === null) {
        return;
    }

    try {
        $config = Config::requirePdfConfig($config);
    } catch (RuntimeException) {
        Response::error(500, 'CONFIGURATION_ERROR', 'No se pudo procesar la solicitud.', $requestId);
        return;
    }

    $tokenCipherKey = loadTokenCipherKey($config, $requestId);
    if ($tokenCipherKey === null) {
        return;
    }

    respondToAdmin(static function () use ($config, $requestId, $certificateId, $tokenCipherKey): array {
        $service = new AdminCertificateService(
            Database::pdo($config),
            (string) $config['token_pepper'],
            $requestId,
            null,
            (string) $config['app_salt'],
            null,
            (string) $config['public_base_url'],
            $tokenCipherKey,
            (string) $config['certificate_storage_path'],
        );

        return ['status' => 200, 'data' => $service->entregaManual($certificateId)];
    }, $requestId);
    return;
}

Response::error(404, 'NOT_FOUND', 'Recurso no encontrado.', $requestId);

function requireJsonContentType(string $requestId): bool
{
    $contentType = $_SERVER['CONTENT_TYPE'] ?? $_SERVER['HTTP_CONTENT_TYPE'] ?? '';
    $mediaType = strtolower(trim(explode(';', is_string($contentType) ? $contentType : '', 2)[0]));

    if ($mediaType === 'application/json') {
        return true;
    }

    Response::error(415, 'UNSUPPORTED_MEDIA_TYPE', 'Content-Type no soportado.', $requestId);

    return false;
}

/** @return array<string, mixed>|null */
function readJsonBody(string $requestId): ?array
{
    $contentLength = $_SERVER['CONTENT_LENGTH'] ?? null;
    if ($contentLength !== null) {
        if (!is_numeric($contentLength) || (int) $contentLength > 65536) {
            Response::error(413, 'PAYLOAD_TOO_LARGE', 'consulta JSON demasiado grande.', $requestId);
            return null;
        }
    }

    $bodyContent = file_get_contents('php://input', false, null, 0, 65537) ?: '';
    
    if (strlen($bodyContent) > 65536) {
        Response::error(413, 'PAYLOAD_TOO_LARGE', 'consulta JSON demasiado grande.', $requestId);
        return null;
    }

    $body = json_decode($bodyContent, true);

    if (json_last_error() === JSON_ERROR_NONE && is_array($body)) {
        return $body;
    }

    Response::error(400, 'VALIDATION_ERROR', 'Solicitud inválida.', $requestId);

    return null;
}

/** @param array<string, mixed> $config */
function requireAdmin(array $config, string $requestId): bool
{
    try {
        AuthGate::requireAdmin($config, $_SERVER, $requestId);

        return true;
    } catch (UnauthorizedException) {
        return false;
    }
}

/** @return array<string, mixed>|null */
function adminConfig(string $requestId, bool $requiresJson = false): ?array
{
    if ($requiresJson && !requireJsonContentType($requestId)) {
        return null;
    }

    $config = Config::load();
    if (!requireAdmin($config, $requestId)) {
        return null;
    }

    return $config;
}

function optionalPositiveQueryInt(string $name): ?int
{
    if (!array_key_exists($name, $_GET)) {
        return null;
    }

    $value = $_GET[$name];
    if (!is_string($value)) {
        throw new AdminCertificateException(400, 'VALIDATION_ERROR', 'Solicitud inválida.');
    }

    $id = filter_var($value, FILTER_VALIDATE_INT, ['options' => ['min_range' => 1]]);
    if (!is_int($id)) {
        throw new AdminCertificateException(400, 'VALIDATION_ERROR', 'Solicitud inválida.');
    }

    return $id;
}

function optionalQueryString(string $name): ?string
{
    if (!array_key_exists($name, $_GET)) {
        return null;
    }

    $value = $_GET[$name];
    if (!is_string($value)) {
        throw new AdminCertificateException(400, 'VALIDATION_ERROR', 'Solicitud inválida.');
    }

    return $value === '' ? null : $value;
}

/** @param callable(): array{status:int,data:array<string,mixed>} $handler */
function respondToAdmin(callable $handler, string $requestId): void
{
    try {
        $result = $handler();
        Response::json($result['status'], $result['data'], $requestId);
    } catch (AdminCertificateException $exception) {
        Response::error($exception->status, $exception->errorCode, $exception->getMessage(), $requestId);
    }
}

/** @param array<string, mixed> $config */
function allowPublicRequest(array $config, string $requestId): bool
{
    if ((new RateLimiter($config, $_SERVER))->allow()) {
        return true;
    }

    Response::error(429, 'RATE_LIMITED', 'Demasiadas consultas. Intente nuevamente más tarde.', $requestId);

    return false;
}

/** @param array<string, mixed> $config */
function respondToValidation(string $token, string $requestId, array $config): void
{
    $validator = new CertificateValidator($config, loadDniCipherKeyOrNull($config));
    $result = $validator->verify($token, $requestId);

    if (isset($result['data'])) {
        Response::json($result['status'], $result['data'], $requestId);
        return;
    }

    Response::error($result['status'], $result['error']['code'], $result['error']['message'], $requestId);
}

function normalizePath(string $path): string
{
    // Un único router cubre producción, staging y PHP embebido.
    // Soporta prefijos /certificados/api (prod), /certificados_staging/api (staging)
    // y /index.php (built-in server). Orden por longitud: staging primero para
    // evitar que el prefijo más corto matchee y deje el resto incorrecto.
    foreach (['/certificados_staging/api', '/certificados/api', '/index.php'] as $prefix) {
        if (str_starts_with($path, $prefix)) {
            $path = substr($path, strlen($prefix)) ?: '/';
        }
    }

    $path = '/' . trim($path, '/');

    return $path === '/' ? '/' : $path;
}

/** @param array<string, mixed> $config */
function streamPdf(array $config, int $certificateId, string $requestId): void
{
    $statement = Database::pdo($config)->prepare('SELECT codigo_certificado, pdf_estado, pdf_generado_revision, contenido_revision FROM cert_certificados WHERE id = ? LIMIT 1');
    $statement->execute([$certificateId]);
    $row = $statement->fetch(PDO::FETCH_ASSOC);

    if ($row === false || !is_string($row['codigo_certificado']) || $row['codigo_certificado'] === '') {
        Response::error(404, 'PDF_NOT_FOUND', 'PDF no encontrado.', $requestId);
        return;
    }

    $code = $row['codigo_certificado'];
    $pdfEstado = $row['pdf_estado'] ?? 'no_generado';
    $pdfGeneradoRevision = $row['pdf_generado_revision'] !== null ? (int) $row['pdf_generado_revision'] : null;
    $contenidoRevision = (int) ($row['contenido_revision'] ?? 1);

    if ($pdfEstado !== 'vigente' || $pdfGeneradoRevision !== $contenidoRevision) {
        Response::error(409, 'PDF_OUTDATED', 'El PDF está desactualizado y debe ser regenerado.', $requestId);
        return;
    }

    $path = (new CertificatePdfService((string) $config['certificate_storage_path']))->pathForCode($code);

    // Validaciones previas a headers: existencia, legibilidad y no vacío.
    // Si el archivo existe pero no es legible o está vacío, respondemos error
    // seguro en vez de emitir 200 application/pdf y fallar en readfile().
    if (!is_file($path) || !is_readable($path)) {
        Response::error(404, 'PDF_NOT_FOUND', 'PDF no encontrado.', $requestId);
        return;
    }

    $size = filesize($path);
    if ($size === false || $size <= 0) {
        Response::error(404, 'PDF_NOT_FOUND', 'PDF no encontrado.', $requestId);
        return;
    }

    $filename = safeDownloadName($code) . '.pdf';

    http_response_code(200);
    Response::noStoreSecurityHeaders();
    header('Content-Type: application/pdf');
    header('Content-Disposition: attachment; filename="' . $filename . '"');
    header('Content-Length: ' . (string) $size);

    if (readfile($path) === false) {
        // readfile falló después de headers 200: no podemos cambiar el status,
        // pero al menos limpiamos el buffer para no enviar basura mixta.
        if (ob_get_length() !== false) {
            ob_end_clean();
        }
    }
}

/** @param array<string, mixed> $config */
function streamQrPng(array $config, int $certificateId, string $requestId, string $tokenCipherKey): void
{
    try {
        $service = new AdminCertificateService(
            Database::pdo($config),
            (string) $config['token_pepper'],
            $requestId,
            null,
            (string) $config['app_salt'],
            null,
            (string) $config['public_base_url'],
            $tokenCipherKey,
            (string) $config['certificate_storage_path'],
        );
        $data = $service->deliveryTokenData($certificateId);
        $png = (new CertificateQrImageService())->render((string) $data['publicValidationUrl']);
    } catch (AdminCertificateException $exception) {
        Response::error($exception->status, $exception->errorCode, $exception->getMessage(), $requestId);
        return;
    } catch (RuntimeException) {
        Response::error(500, 'CONFIGURATION_ERROR', 'No se pudo procesar la solicitud.', $requestId);
        return;
    }

    $filename = safeDownloadName((string) $data['certificateCode']) . '-qr.png';

    http_response_code(200);
    Response::noStoreSecurityHeaders();
    header('Content-Type: image/png');
    header('Content-Disposition: attachment; filename="' . $filename . '"');
    header('Content-Length: ' . (string) strlen($png));
    echo $png;
}

function safeDownloadName(string $value): string
{
    return preg_replace('/[^A-Za-z0-9_-]/', '_', $value) ?? $value;
}

/**
 * Carga diferida de dependencias PDF (Composer autoload y CertificatePdfService).
 * Solo se invoca para rutas que requieren generación/descarga de PDF.
 * Si vendor/autoload.php no existe (deploy sin Composer), responde error seguro
 * sin romper rutas no-PDF como /health ni validación pública.
 *
 * @return bool True si las dependencias están listas; false si ya se respondió error.
 */
function loadPdfDependencies(string $requestId): bool
{
    $autoloadPath = __DIR__ . '/vendor/autoload.php';
    if (!is_file($autoloadPath) || !is_readable($autoloadPath)) {
        Response::error(500, 'CONFIGURATION_ERROR', 'No se pudo procesar la solicitud.', $requestId);
        return false;
    }

    require_once $autoloadPath;
    require_once __DIR__ . '/src/CertificatePdfService.php';
    require_once __DIR__ . '/src/CertificateQrImageService.php';

    return true;
}

/**
 * Carga y valida la clave de cifrado de tokens (AES-256-GCM, 32 bytes).
 * Fail closed: responde 500 CONFIGURATION_ERROR si la clave falta o es inválida.
 * La clave DEBE provenir de configuración externa a Git.
 *
 * @param array<string, mixed> $config
 * @return string|null Clave binaria de 32 bytes, o null si ya se respondió error.
 */
function loadTokenCipherKey(array $config, string $requestId): ?string
{
    try {
        [$config, $key] = Config::requireTokenCipherKey($config);
        return $key;
    } catch (RuntimeException) {
        Response::error(500, 'CONFIGURATION_ERROR', 'No se pudo procesar la solicitud.', $requestId);
        return null;
    }
}

/** @param array<string, mixed> $config */
function loadDniCipherKey(array $config, string $requestId): ?string
{
    try {
        [, $key] = Config::requireDniCipherKey($config);
        return $key;
    } catch (RuntimeException) {
        Response::error(500, 'CONFIGURATION_ERROR', 'No se pudo procesar la solicitud.', $requestId);
        return null;
    }
}

/** @param array<string, mixed> $config */
function loadDniCipherKeyOrNull(array $config): ?string
{
    try {
        [, $key] = Config::requireDniCipherKey($config);
        return $key;
    } catch (RuntimeException) {
        return null;
    }
}
