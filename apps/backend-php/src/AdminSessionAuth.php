<?php

declare(strict_types=1);

require_once __DIR__ . '/Config.php';

final class AdminSessionAuth
{
    /** @param array<string, mixed> $config @return array{name:string,path:string,lifetime:int,secure:bool,httponly:bool,samesite:string,idleSeconds:int,absoluteSeconds:int}|null */
    public static function settings(array $config, string $basePath): ?array
    {
        $session = Config::adminSessionSettings($config);
        $settings = self::fallbackSettings($basePath);
        if ($session === null || $settings === null) {
            return null;
        }

        $settings['idleSeconds'] = $session['idleSeconds'];
        $settings['absoluteSeconds'] = $session['absoluteSeconds'];

        return $settings;
    }

    /** @param array<string, mixed> $config */
    public static function credentialsValid(array $config, string $username, string $password): bool
    {
        if ($username === '' || $password === '') {
            return false;
        }

        $session = Config::adminSessionSettings($config);
        if ($session === null) {
            return false;
        }

        $usernameValid = hash_equals($session['username'], $username);
        $passwordValid = password_verify($password, $session['passwordHash']);

        return $usernameValid && $passwordValid;
    }

    public static function csrfToken(): string
    {
        return rtrim(strtr(base64_encode(random_bytes(32)), '+/', '-_'), '=');
    }

    /** @param array<string, mixed> $session */
    public static function csrfValid(array $session, string $provided): bool
    {
        $stored = $session['csrfToken'] ?? null;

        return is_string($stored) && $stored !== '' && $provided !== '' && hash_equals($stored, $provided);
    }

    /** @param array<string, mixed> $session @param array<string, mixed> $config */
    public static function sessionIsActive(array $session, array $config, int $now): bool
    {
        $settings = Config::adminSessionSettings($config);
        $createdAt = self::sessionTimestamp($session['createdAt'] ?? null);
        $lastSeen = self::sessionTimestamp($session['lastSeen'] ?? null);

        return $settings !== null
            && ($session['authenticated'] ?? false) === true
            && $createdAt !== null
            && $lastSeen !== null
            && $createdAt <= $lastSeen
            && $lastSeen <= $now
            && $now - $lastSeen < $settings['idleSeconds']
            && $now - $createdAt < $settings['absoluteSeconds'];
    }

    /** @param array<string, mixed> $server */
    public static function basePath(array $server): string
    {
        $uri = $server['REQUEST_URI'] ?? '';
        $path = is_string($uri) ? parse_url($uri, PHP_URL_PATH) : '';

        return is_string($path) && str_starts_with($path, '/certificados_staging/')
            ? '/certificados_staging'
            : '/certificados';
    }

    /**
     * @param array<string, mixed> $config
     * @param array<string, mixed> $server
     * @return bool|null true permitido; false rate-limit; null storage no usable
     */
    public static function allowLoginAttempt(array $config, array $server): ?bool
    {
        $rateLimitPath = $config['rate_limit_storage_path'] ?? null;
        $directory = is_string($rateLimitPath) ? dirname($rateLimitPath) : '';
        if ($directory === '' || !is_dir($directory) || !is_writable($directory)) {
            return null;
        }

        $origin = $server['REMOTE_ADDR'] ?? '';
        $origin = is_string($origin) && trim($origin) !== '' ? trim($origin) : 'unknown';
        $path = $directory . '/ifts14-admin-login-' . hash('sha256', $origin) . '.json';
        $handle = @fopen($path, 'c+');
        if ($handle === false) {
            return null;
        }
        try {
            if (!@flock($handle, LOCK_EX) || ($contents = @stream_get_contents($handle)) === false) {
                return null;
            }

            $bucket = trim($contents) === '' ? ['count' => 0, 'resetAt' => 0] : json_decode($contents, true);
            if (!is_array($bucket) || !is_int($bucket['count'] ?? null) || !is_int($bucket['resetAt'] ?? null)) {
                return null;
            }

            $now = time();
            if ($bucket['resetAt'] <= $now) {
                $bucket = ['count' => 0, 'resetAt' => $now + 300];
            }
            if ($bucket['count'] >= 5) {
                return false;
            }

            $encoded = json_encode(['count' => $bucket['count'] + 1, 'resetAt' => $bucket['resetAt']], JSON_UNESCAPED_SLASHES);
            if (
                $encoded === false
                || !@rewind($handle)
                || !@ftruncate($handle, 0)
                || @fwrite($handle, $encoded) !== strlen($encoded)
                || !@fflush($handle)
            ) {
                return null;
            }

            return true;
        } finally {
            @flock($handle, LOCK_UN);
            fclose($handle);
        }
    }

    /** @param array{name:string,path:string,lifetime:int,secure:bool,httponly:bool,samesite:string,idleSeconds:int,absoluteSeconds:int} $settings */
    public static function start(array $settings): bool
    {
        if (session_status() === PHP_SESSION_ACTIVE) {
            return session_name() === $settings['name'];
        }

        ini_set('session.use_strict_mode', '1');
        ini_set('session.use_only_cookies', '1');
        ini_set('session.use_trans_sid', '0');
        ini_set('session.gc_maxlifetime', (string) $settings['absoluteSeconds']);
        session_name($settings['name']);
        session_set_cookie_params(self::cookieOptions($settings));

        return @session_start();
    }

    /** @param array<string, mixed> $config */
    public static function login(array $config, string $basePath, string $username, string $password, int $now): string|false|null
    {
        $settings = self::settings($config, $basePath);
        if ($settings === null || !self::credentialsValid($config, $username, $password)) {
            return false;
        }
        if (!self::start($settings)) {
            return null;
        }

        session_regenerate_id(true);
        $csrf = self::csrfToken();
        $_SESSION = [
            'authenticated' => true,
            'createdAt' => $now,
            'lastSeen' => $now,
            'csrfToken' => $csrf,
        ];

        return $csrf;
    }

    /** @param array<string, mixed> $config */
    public static function state(array $config, string $basePath, int $now): ?array
    {
        $settings = self::settings($config, $basePath);
        if ($settings === null || !isset($_COOKIE[$settings['name']])) {
            return null;
        }

        if (!self::start($settings)) {
            return null;
        }

        if (!self::sessionIsActive($_SESSION, $config, $now)) {
            self::destroy($settings);
            return null;
        }

        $_SESSION['lastSeen'] = $now;
        session_write_close();

        return $_SESSION;
    }

    /** @param array<string, mixed> $config */
    public static function authorize(array $config, string $basePath, bool $mutates, string $csrf, int $now): int
    {
        $settings = self::settings($config, $basePath);
        if ($settings === null || !isset($_COOKIE[$settings['name']])) {
            return 401;
        }

        // Fallo de session_start (contención de lock en cPanel) NO debe verse como
        // 401: el interceptor FE limpia CSRF y manda a login. Devolver 503.
        if (!self::start($settings)) {
            error_log('ifts14_admin_session_start_failed');

            return 503;
        }

        if (!self::sessionIsActive($_SESSION, $config, $now)) {
            self::destroy($settings);
            return 401;
        }

        if ($mutates && !self::csrfValid($_SESSION, $csrf)) {
            return 403;
        }

        $_SESSION['lastSeen'] = $now;
        // Liberar lock de sesión antes del trabajo pesado (PDF, lotes de mutaciones).
        session_write_close();

        return 200;
    }

    /** @param array<string, mixed>|null $config */
    public static function logout(?array $config, string $basePath): bool
    {
        $settings = is_array($config) ? self::settings($config, $basePath) : null;
        $settings ??= self::fallbackSettings($basePath);
        if ($settings === null) {
            return false;
        }

        if (!self::start($settings)) {
            self::expireCookie($settings);
            return false;
        }

        return self::destroy($settings);
    }

    /** @param array{name:string,path:string,lifetime:int,secure:bool,httponly:bool,samesite:string,idleSeconds:int,absoluteSeconds:int} $settings */
    public static function destroy(array $settings): bool
    {
        $destroyed = true;
        if (session_status() === PHP_SESSION_ACTIVE) {
            $_SESSION = [];
            $destroyed = @session_destroy();
        }

        return $destroyed && self::expireCookie($settings);
    }

    /** @return array{name:string,path:string,lifetime:int,secure:bool,httponly:bool,samesite:string,idleSeconds:int,absoluteSeconds:int}|null */
    private static function fallbackSettings(string $basePath): ?array
    {
        $name = match ($basePath) {
            '/certificados_staging' => 'ifts14_cert_stg_admin',
            '/certificados' => 'ifts14_cert_admin',
            default => null,
        };

        return $name === null ? null : [
            'name' => $name, 'path' => $basePath . '/', 'lifetime' => 0, 'secure' => true,
            'httponly' => true, 'samesite' => 'Strict', 'idleSeconds' => 14400, 'absoluteSeconds' => 28800,
        ];
    }

    /** @param array{name:string,path:string,lifetime:int,secure:bool,httponly:bool,samesite:string,idleSeconds:int,absoluteSeconds:int} $settings */
    private static function expireCookie(array $settings): bool
    {
        return setcookie($settings['name'], '', self::cookieOptions($settings) + ['expires' => time() - 3600]);
    }

    /** @param array{name:string,path:string,lifetime:int,secure:bool,httponly:bool,samesite:string,idleSeconds:int,absoluteSeconds:int} $settings @return array{expires?:int,path:string,domain:string,secure:bool,httponly:bool,samesite:string} */
    private static function cookieOptions(array $settings): array
    {
        return [
            'path' => $settings['path'],
            'domain' => '',
            'secure' => $settings['secure'],
            'httponly' => $settings['httponly'],
            'samesite' => $settings['samesite'],
        ];
    }

    /** Timestamps de sesión: int nativo o dígitos string (serializadores PHP). */
    private static function sessionTimestamp(mixed $value): ?int
    {
        if (is_int($value)) {
            return $value;
        }
        if (is_string($value) && $value !== '' && ctype_digit($value)) {
            return (int) $value;
        }

        return null;
    }
}
