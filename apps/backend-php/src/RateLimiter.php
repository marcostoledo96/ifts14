<?php

declare(strict_types=1);

final class RateLimiter
{
    private int $threshold;
    private int $windowSeconds;
    private string $storagePath;
    private string $salt;

    /** @param array<string, mixed> $config @param array<string, mixed> $server */
    public function __construct(array $config, private readonly array $server)
    {
        $this->threshold = (int) $config['rate_limit_threshold'];
        $this->windowSeconds = (int) $config['rate_limit_window_seconds'];
        $this->storagePath = (string) $config['rate_limit_storage_path'];
        $this->salt = (string) $config['app_salt'];
    }

    public function allow(): bool
    {
        set_error_handler(static fn (): bool => true);

        try {
            return $this->allowWithFile();
        } finally {
            restore_error_handler();
        }
    }

    private function allowWithFile(): bool
    {
        $directory = dirname($this->storagePath);
        if (!is_dir($directory) || !is_writable($directory)) {
            return true;
        }

        $created = !is_file($this->storagePath);
        $handle = fopen($this->storagePath, 'c+');
        if ($handle === false) {
            return true;
        }

        try {
            if (!flock($handle, LOCK_EX)) {
                return true;
            }

            $contents = stream_get_contents($handle);
            if ($contents === false) {
                return true;
            }

            $buckets = trim($contents) === '' ? [] : json_decode($contents, true);
            if (!is_array($buckets)) {
                return true;
            }

            $allowed = $this->hit($buckets);
            $encoded = json_encode($buckets, JSON_UNESCAPED_SLASHES);
            if ($encoded === false || !rewind($handle) || !ftruncate($handle, 0) || fwrite($handle, $encoded) === false || !fflush($handle)) {
                return true;
            }

            if ($created) {
                chmod($this->storagePath, 0600);
            }

            return $allowed;
        } finally {
            flock($handle, LOCK_UN);
            fclose($handle);
        }
    }

    /** @param array<string, mixed> $buckets */
    private function hit(array &$buckets): bool
    {
        $now = time();

        foreach ($buckets as $key => $bucket) {
            if (!is_array($bucket) || (int) ($bucket['resetAt'] ?? 0) < $now) {
                unset($buckets[$key]);
            }
        }

        $bucketKey = substr(hash('sha256', $this->origin() . '|' . $this->salt), 0, 32);
        $bucket = $buckets[$bucketKey] ?? null;

        if (!is_array($bucket)) {
            $buckets[$bucketKey] = ['count' => 1, 'resetAt' => $now + $this->windowSeconds];

            return true;
        }

        $count = (int) ($bucket['count'] ?? 0) + 1;
        $buckets[$bucketKey] = [
            'count' => $count,
            'resetAt' => (int) ($bucket['resetAt'] ?? ($now + $this->windowSeconds)),
        ];

        return $count <= $this->threshold;
    }

    private function origin(): string
    {
        $origin = $this->server['REMOTE_ADDR'] ?? '';

        return is_string($origin) && trim($origin) !== '' ? trim($origin) : 'unknown';
    }
}
