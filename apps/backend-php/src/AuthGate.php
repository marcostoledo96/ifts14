<?php

declare(strict_types=1);

require_once __DIR__ . '/Config.php';
require_once __DIR__ . '/Response.php';

final class UnauthorizedException extends RuntimeException
{
}

final class AuthGate
{
    /** @param array<string, mixed> $config @param array<string, mixed> $server */
    public static function requireAdmin(array $config, array $server, string $requestId): void
    {
        $expected = Config::adminApiKey($config);
        $received = self::header($server);

        if ($expected === '' || $received === '' || !hash_equals($expected, $received)) {
            Response::error(401, 'UNAUTHORIZED', 'No autorizado.', $requestId);
            throw new UnauthorizedException('Admin authorization failed.');
        }
    }

    /** @param array<string, mixed> $server */
    private static function header(array $server): string
    {
        $value = $server['HTTP_X_ADMIN_KEY'] ?? '';

        return is_string($value) ? trim($value) : '';
    }
}
