<?php

declare(strict_types=1);

require_once __DIR__ . '/TokenCipher.php';
require_once __DIR__ . '/DniCipher.php';

final class Config
{
    private const string DEFAULT_PATH = '/home/usuario_demo/certificados_config/certificados-api.php';
    private const int ADMIN_SESSION_IDLE_SECONDS = 1800;
    private const int ADMIN_SESSION_ABSOLUTE_SECONDS = 28800;

    /** @return array<string, mixed> */
    public static function load(): array
    {
        $envPath = getenv('CERTIFICADOS_CONFIG_PATH');
        $path = is_string($envPath) && $envPath !== '' ? $envPath : self::DEFAULT_PATH;

        if (!is_file($path)) {
            throw new RuntimeException('Configuration unavailable.');
        }

        $config = require $path;

        if (!is_array($config)) {
            throw new RuntimeException('Configuration invalid.');
        }

        foreach (['db_host', 'db_name', 'db_user', 'db_pass'] as $key) {
            if (!isset($config[$key]) || !is_string($config[$key])) {
                throw new RuntimeException('Configuration invalid.');
            }
        }

        if (!isset($config['token_pepper']) || !is_string($config['token_pepper']) || trim($config['token_pepper']) === '') {
            throw new RuntimeException('Configuration invalid.');
        }

        $config['rate_limit_threshold'] = self::positiveInt($config['rate_limit_threshold'] ?? 60, 60);
        $config['rate_limit_window_seconds'] = self::positiveInt($config['rate_limit_window_seconds'] ?? 60, 60);

        if (!isset($config['rate_limit_storage_path']) || !is_string($config['rate_limit_storage_path']) || trim($config['rate_limit_storage_path']) === '') {
            $config['rate_limit_storage_path'] = sys_get_temp_dir() . '/ifts14-cert-rate-limit.json';
        }

        if (!isset($config['app_salt']) || !is_string($config['app_salt']) || trim($config['app_salt']) === '') {
            $config['app_salt'] = $config['token_pepper'];
        }

        return $config;
    }

    /**
     * Valida y normaliza las claves requeridas solo para flujos PDF (emisión y
     * descarga). Las configs de validación pública existentes pueden omitir
     * estas claves sin romper `Config::load()`.
     *
     * @param array<string, mixed> $config
     * @return array<string, mixed> Config con public_base_url y certificate_storage_path normalizados.
     * @throws RuntimeException Si alguna clave PDF falta o es inválida.
     */
    public static function requirePdfConfig(array $config): array
    {
        foreach (['public_base_url', 'certificate_storage_path'] as $key) {
            if (!isset($config[$key]) || !is_string($config[$key]) || trim($config[$key]) === '') {
                throw new RuntimeException('Configuration invalid.');
            }
        }

        $config['public_base_url'] = rtrim(trim($config['public_base_url']), '/');
        $config['certificate_storage_path'] = rtrim(trim($config['certificate_storage_path']), '/');

        return $config;
    }

    /**
     * Valida y normaliza la clave de cifrado de tokens (AES-256-GCM). La clave
     * DEBE provenir de configuración externa a Git y decodificar exactamente a
     * 32 bytes (base64/base64url). Falla cerrado si falta o es inválida.
     *
     * @param array<string, mixed> $config
     * @return array{0:array<string,mixed>,1:string} Config con token_encryption_key crudo y la clave binaria de 32 bytes.
     * @throws RuntimeException Si la clave falta, no es string o no decodifica a 32 bytes.
     */
    public static function requireTokenCipherKey(array $config): array
    {
        $encoded = $config['token_encryption_key'] ?? null;
        if (!is_string($encoded) || trim($encoded) === '') {
            throw new RuntimeException('Configuration invalid.');
        }

        $key = TokenCipher::key($encoded);
        $config['token_encryption_key'] = $encoded;

        return [$config, $key];
    }

    /**
     * Valida y normaliza la clave de cifrado de DNI. Misma regla que tokens:
     * clave externa a Git, base64/base64url, 32 bytes exactos.
     *
     * @param array<string, mixed> $config
     * @return array{0:array<string,mixed>,1:string}
     */
    public static function requireDniCipherKey(array $config): array
    {
        $encoded = $config['dni_cipher_key'] ?? null;
        if (!is_string($encoded) || trim($encoded) === '') {
            throw new RuntimeException('Configuration invalid.');
        }

        $key = DniCipher::key($encoded);
        $config['dni_cipher_key'] = $encoded;

        return [$config, $key];
    }

    /** @param array<string, mixed> $config @return array{username:string,passwordHash:string,idleSeconds:int,absoluteSeconds:int}|null */
    public static function adminSessionSettings(array $config): ?array
    {
        $username = self::stringOrEmpty($config['admin_username'] ?? '');
        $passwordHash = self::stringOrEmpty($config['admin_password_hash'] ?? '');
        $hashInfo = $passwordHash === '' ? ['algo' => null] : password_get_info($passwordHash);

        if (
            $username === ''
            || !is_string($hashInfo['algo'] ?? null)
            || password_verify('', $passwordHash)
            || self::positiveInt($config['admin_session_idle_seconds'] ?? 0, 0) !== self::ADMIN_SESSION_IDLE_SECONDS
            || self::positiveInt($config['admin_session_absolute_seconds'] ?? 0, 0) !== self::ADMIN_SESSION_ABSOLUTE_SECONDS
        ) {
            return null;
        }

        return [
            'username' => $username,
            'passwordHash' => $passwordHash,
            'idleSeconds' => self::ADMIN_SESSION_IDLE_SECONDS,
            'absoluteSeconds' => self::ADMIN_SESSION_ABSOLUTE_SECONDS,
        ];
    }

    private static function positiveInt(mixed $value, int $default): int
    {
        if (is_int($value)) {
            return $value > 0 ? $value : $default;
        }

        if (is_string($value) && ctype_digit($value)) {
            $number = (int) $value;

            return $number > 0 ? $number : $default;
        }

        return $default;
    }

    private static function stringOrEmpty(mixed $value): string
    {
        return is_string($value) ? trim($value) : '';
    }
}
