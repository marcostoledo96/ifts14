<?php

declare(strict_types=1);

final class Response
{
    /** @param array<string, mixed> $data */
    public static function json(int $status, array $data, ?string $requestId = null): void
    {
        http_response_code($status);
        self::noStoreSecurityHeaders();
        header('Content-Type: application/json; charset=utf-8');

        echo json_encode([
            'data' => $data,
            'meta' => [
                'requestId' => $requestId ?? self::requestId(),
            ],
        ], JSON_UNESCAPED_SLASHES | JSON_UNESCAPED_UNICODE);
    }

    public static function error(int $status, string $code, string $message, ?string $requestId = null): void
    {
        http_response_code($status);
        self::noStoreSecurityHeaders();
        header('Content-Type: application/json; charset=utf-8');

        echo json_encode([
            'error' => [
                'code' => $code,
                'message' => $message,
                'details' => [],
            ],
            'meta' => [
                'requestId' => $requestId ?? self::requestId(),
            ],
        ], JSON_UNESCAPED_SLASHES | JSON_UNESCAPED_UNICODE);
    }

    private static function requestId(): string
    {
        return 'req_' . bin2hex(random_bytes(8));
    }

    private static function securityHeaders(): void
    {
        header('X-Content-Type-Options: nosniff');
        header('X-Frame-Options: SAMEORIGIN');
    }

    public static function noStoreSecurityHeaders(): void
    {
        self::securityHeaders();
        header('Cache-Control: no-store, private, max-age=0');
        header('Pragma: no-cache');
        header('Expires: 0');
    }
}
