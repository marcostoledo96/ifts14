<?php

declare(strict_types=1);

require_once __DIR__ . '/Config.php';
require_once __DIR__ . '/Response.php';
require_once __DIR__ . '/AdminSessionAuth.php';

final class UnauthorizedException extends RuntimeException
{
}

final class CsrfException extends RuntimeException
{
}

final class ServiceUnavailableException extends RuntimeException
{
}

final class AuthGate
{
    /** @param array<string, mixed> $config @param array<string, mixed> $server */
    public static function requireHttpSession(array $config, array $server, string $requestId, bool $mutates): void
    {
        $status = AdminSessionAuth::authorize(
            $config,
            AdminSessionAuth::basePath($server),
            $mutates,
            self::csrfHeader($server),
            time(),
        );

        if ($status === 401) {
            Response::error(401, 'UNAUTHORIZED', 'No autorizado.', $requestId);
            throw new UnauthorizedException('Admin session authorization failed.');
        }

        if ($status === 403) {
            Response::error(403, 'CSRF_INVALID', 'Solicitud inválida.', $requestId);
            throw new CsrfException('Admin CSRF validation failed.');
        }

        if ($status === 503) {
            Response::error(503, 'SERVICE_UNAVAILABLE', 'No se pudo procesar la solicitud.', $requestId);
            throw new ServiceUnavailableException('Admin session start failed.');
        }
    }

    /** @param array<string, mixed> $config */
    public static function requireLegacyCli(string $providedKey, array $config, int $now): bool
    {
        if (PHP_SAPI !== 'cli' || ($config['admin_legacy_key_enabled'] ?? false) !== true || ($config['app_environment'] ?? '') === 'production') {
            return false;
        }

        $expected = $config['admin_legacy_key'] ?? '';
        $expiresAt = $config['admin_legacy_key_expires_at'] ?? '';
        if (!is_string($expected) || strlen($expected) < 16 || !is_string($expiresAt)) {
            return false;
        }

        try {
            $expiry = new DateTimeImmutable($expiresAt);
        } catch (Exception) {
            return false;
        }

        return $expiry->getTimestamp() > $now && strlen($providedKey) >= 16 && hash_equals($expected, $providedKey);
    }

    /** @param array<string, mixed> $server */
    private static function csrfHeader(array $server): string
    {
        $value = $server['HTTP_X_CSRF_TOKEN'] ?? '';

        return is_string($value) ? trim($value) : '';
    }
}
