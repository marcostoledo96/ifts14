<?php

declare(strict_types=1);

final class Config
{
    private const string DEFAULT_PATH = '/home/usuario_demo/certificados_config/certificados-api.php';
    private const int MIN_ADMIN_KEY_LENGTH = 16;

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

        $config['admin_api_key'] = self::adminApiKey($config);

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
     * Valida y normaliza la configuración de entrega por email. El transporte
     * se normaliza a `stub|smtp`. En modo `smtp` exige host, puerto, usuario,
     * pass, from y `public_base_url`. En modo `stub` no exige credenciales.
     *
     * @param array<string, mixed> $config
     * @return array<string, mixed> Config con delivery_transport y claves SMTP normalizadas.
     * @throws RuntimeException Si el modo es inválido o falta una clave SMTP requerida.
     */
    public static function requireDeliveryConfig(array $config): array
    {
        $transport = strtolower(trim((string) ($config['delivery_transport'] ?? 'stub')));
        if ($transport !== 'stub' && $transport !== 'smtp') {
            throw new RuntimeException('Configuration invalid.');
        }

        $config['delivery_transport'] = $transport;

        if ($transport === 'stub') {
            return $config;
        }

        foreach (['smtp_host', 'smtp_username', 'smtp_password', 'mail_from', 'public_base_url'] as $key) {
            if (!isset($config[$key]) || !is_string($config[$key]) || trim($config[$key]) === '') {
                throw new RuntimeException('Configuration invalid.');
            }
        }

        $port = $config['smtp_port'] ?? null;
        if (!is_int($port) || $port <= 0 || $port > 65535) {
            if (is_string($port) && ctype_digit($port)) {
                $port = (int) $port;
            } else {
                throw new RuntimeException('Configuration invalid.');
            }
        }
        $config['smtp_port'] = $port;

        // ponytail: smtp exige transporte cifrado (tls|ssl). Vacío desactiva TLS
        // con credenciales activas: riesgo de credenciales en claro. No hay caso
        // legítimo de SMTP plano en este flujo (solo enlace de validación).
        $secure = strtolower(trim((string) ($config['smtp_secure'] ?? 'tls')));
        if (!in_array($secure, ['ssl', 'tls'], true)) {
            throw new RuntimeException('Configuration invalid.');
        }
        $config['smtp_secure'] = $secure;

        $config['public_base_url'] = rtrim(trim($config['public_base_url']), '/');
        $config['mail_from_name'] = trim((string) ($config['mail_from_name'] ?? $config['mail_from']));

        return $config;
    }

    /** @param array<string, mixed> $config */
    public static function adminApiKey(array $config): string
    {
        $key = self::stringOrEmpty($config['admin_api_key'] ?? '');

        return strlen($key) >= self::MIN_ADMIN_KEY_LENGTH ? $key : '';
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
