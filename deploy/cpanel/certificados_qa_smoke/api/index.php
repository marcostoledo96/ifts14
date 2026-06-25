<?php

declare(strict_types=1);

require_once __DIR__ . '/src/Response.php';

set_exception_handler(static function (Throwable $exception): void {
    Response::error(500, 'INTERNAL_ERROR', 'No se pudo procesar la solicitud.');
});

$method = $_SERVER['REQUEST_METHOD'] ?? 'GET';
$path = parse_url($_SERVER['REQUEST_URI'] ?? '/', PHP_URL_PATH) ?: '/';
$path = normalizePath($path);

if ($path === '/health') {
    if ($method !== 'GET') {
        header('Allow: GET');
        Response::error(405, 'METHOD_NOT_ALLOWED', 'Método no permitido.');
        return;
    }

    Response::json(200, [
        'status' => 'ok',
        'service' => 'certificados-api',
    ]);
    return;
}

Response::error(404, 'NOT_FOUND', 'Recurso no encontrado.');

function normalizePath(string $path): string
{
    foreach (['/certificados_qa/api', '/index.php'] as $prefix) {
        if (str_starts_with($path, $prefix)) {
            $path = substr($path, strlen($prefix)) ?: '/';
        }
    }

    $path = '/' . trim($path, '/');

    return $path === '/' ? '/' : $path;
}
