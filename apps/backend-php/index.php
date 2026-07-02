<?php

declare(strict_types=1);

require_once __DIR__ . '/src/Response.php';
require_once __DIR__ . '/src/Config.php';
require_once __DIR__ . '/src/RateLimiter.php';
require_once __DIR__ . '/src/Database.php';
require_once __DIR__ . '/src/CertificateValidator.php';
require_once __DIR__ . '/src/AuthGate.php';
require_once __DIR__ . '/src/AdminCertificateService.php';

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

if ($path === '/admin/certificados') {
    if ($method !== 'POST') {
        header('Allow: POST');
        Response::error(405, 'METHOD_NOT_ALLOWED', 'Método no permitido.', $requestId);
        return;
    }

    if (!requireJsonContentType($requestId)) {
        return;
    }

    $config = Config::load();
    if (!requireAdmin($config, $requestId)) {
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

    $body = readJsonBody($requestId);
    if ($body === null) {
        return;
    }

    respondToAdmin(static function () use ($config, $requestId, $body, $tokenCipherKey): array {
        $service = new AdminCertificateService(
            Database::pdo($config),
            (string) $config['token_pepper'],
            $requestId,
            null,
            (string) $config['app_salt'],
            new CertificatePdfService((string) $config['certificate_storage_path']),
            (string) $config['public_base_url'],
            $tokenCipherKey,
        );

        return ['status' => 201, 'data' => $service->emitir($body)];
    }, $requestId);
    return;
}

if (preg_match('#^/admin/certificados/(\d+)/revocar$#', $path, $matches) === 1) {
    if ($method !== 'POST') {
        header('Allow: POST');
        Response::error(405, 'METHOD_NOT_ALLOWED', 'Método no permitido.', $requestId);
        return;
    }

    if (!requireJsonContentType($requestId)) {
        return;
    }

    $config = Config::load();
    if (!requireAdmin($config, $requestId)) {
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

    $config = Config::load();
    if (!requireAdmin($config, $requestId)) {
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

    $config = Config::load();
    if (!requireAdmin($config, $requestId)) {
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
    $body = json_decode(file_get_contents('php://input') ?: '', true);

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
    $validator = new CertificateValidator($config);
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
    $statement = Database::pdo($config)->prepare('SELECT codigo_certificado FROM cert_certificados WHERE id = ? LIMIT 1');
    $statement->execute([$certificateId]);
    $code = $statement->fetchColumn();

    if (!is_string($code) || $code === '') {
        Response::error(404, 'PDF_NOT_FOUND', 'PDF no encontrado.', $requestId);
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

    $filename = $code . '.pdf';

    http_response_code(200);
    header('X-Content-Type-Options: nosniff');
    header('X-Frame-Options: SAMEORIGIN');
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
