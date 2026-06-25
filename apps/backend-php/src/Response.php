<?php

declare(strict_types=1);

final class Response
{
    /** @param array<string, mixed> $data */
    public static function json(int $status, array $data): void
    {
        http_response_code($status);
        header('Content-Type: application/json; charset=utf-8');

        echo json_encode([
            'data' => $data,
            'meta' => [
                'requestId' => self::requestId(),
            ],
        ], JSON_UNESCAPED_SLASHES | JSON_UNESCAPED_UNICODE);
    }

    public static function error(int $status, string $code, string $message): void
    {
        http_response_code($status);
        header('Content-Type: application/json; charset=utf-8');

        echo json_encode([
            'error' => [
                'code' => $code,
                'message' => $message,
                'details' => [],
            ],
            'meta' => [
                'requestId' => self::requestId(),
            ],
        ], JSON_UNESCAPED_SLASHES | JSON_UNESCAPED_UNICODE);
    }

    private static function requestId(): string
    {
        return 'req_' . bin2hex(random_bytes(8));
    }
}
