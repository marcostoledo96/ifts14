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

    $config = Config::load();
    if (!allowPublicRequest($config, $requestId)) {
        return;
    }

    $body = json_decode(file_get_contents('php://input') ?: '', true);
    $token = is_array($body) && isset($body['token']) && is_string($body['token']) ? $body['token'] : '';

    respondToValidation($token, $requestId, $config);
    return;
}

if ($path === '/admin/certificados') {
    if ($method !== 'POST') {
        header('Allow: POST');
        Response::error(405, 'METHOD_NOT_ALLOWED', 'Método no permitido.', $requestId);
        return;
    }

    $config = Config::load();
    if (!requireAdmin($config, $requestId)) {
        return;
    }

    $body = json_decode(file_get_contents('php://input') ?: '', true);
    $body = is_array($body) ? $body : [];

    respondToAdmin(static function () use ($config, $requestId, $body): array {
        $service = new AdminCertificateService(
            Database::pdo($config),
            (string) $config['token_pepper'],
            $requestId,
            null,
            (string) $config['app_salt'],
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

    $config = Config::load();
    if (!requireAdmin($config, $requestId)) {
        return;
    }

    $body = json_decode(file_get_contents('php://input') ?: '', true);
    $reason = is_array($body) && isset($body['reason']) && is_string($body['reason']) ? $body['reason'] : null;

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

Response::error(404, 'NOT_FOUND', 'Recurso no encontrado.', $requestId);

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
    foreach (['/certificados/api', '/index.php'] as $prefix) {
        if (str_starts_with($path, $prefix)) {
            $path = substr($path, strlen($prefix)) ?: '/';
        }
    }

    $path = '/' . trim($path, '/');

    return $path === '/' ? '/' : $path;
}
