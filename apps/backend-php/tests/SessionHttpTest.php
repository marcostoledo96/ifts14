<?php

declare(strict_types=1);

/** @return list<string> */
function loginAdminSessionHeaders(int $port, string $username, string $password): array
{
    $context = stream_context_create(['http' => [
        'method' => 'POST',
        'ignore_errors' => true,
        'header' => 'Content-Type: application/json',
        'content' => json_encode(['username' => $username, 'password' => $password], JSON_THROW_ON_ERROR),
    ]]);
    $body = @file_get_contents('http://127.0.0.1:' . $port . '/admin/auth/login', false, $context);
    if ($body === false || !str_contains($http_response_header[0] ?? '', ' 200 ')) {
        throw new RuntimeException('No se pudo iniciar sesión de prueba.');
    }
    $data = json_decode($body, true);
    $cookie = '';
    foreach ($http_response_header ?? [] as $header) {
        if (str_starts_with(strtolower($header), 'set-cookie:')) {
            $cookie = trim(explode(':', $header, 2)[1]);
            break;
        }
    }
    $csrf = $data['data']['csrfToken'] ?? null;
    if ($cookie === '' || !is_string($csrf) || $csrf === '') {
        throw new RuntimeException('La sesión de prueba no emitió cookie y CSRF.');
    }

    return ['Cookie: ' . explode(';', $cookie, 2)[0], 'X-CSRF-Token: ' . $csrf];
}

/** @param list<string> $sessionHeaders @return list<string> */
function sessionJsonHeaders(array $sessionHeaders): array
{
    return array_merge(['Content-Type: application/json'], $sessionHeaders);
}
