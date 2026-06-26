<?php

declare(strict_types=1);

require_once __DIR__ . '/src/Response.php';
require_once __DIR__ . '/src/Config.php';
require_once __DIR__ . '/src/Database.php';
require_once __DIR__ . '/src/CertificateValidator.php';

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

    respondToValidation(rawurldecode($matches[1]), $requestId);
    return;
}

if ($path === '/certificados/consulta') {
    if ($method !== 'POST') {
        header('Allow: POST');
        Response::error(405, 'METHOD_NOT_ALLOWED', 'Método no permitido.', $requestId);
        return;
    }

    $body = json_decode(file_get_contents('php://input') ?: '', true);
    $token = is_array($body) && isset($body['token']) && is_string($body['token']) ? $body['token'] : '';

    respondToValidation($token, $requestId);
    return;
}

Response::error(404, 'NOT_FOUND', 'Recurso no encontrado.', $requestId);

function respondToValidation(string $token, string $requestId): void
{
    $validator = new CertificateValidator(Config::load());
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
