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

        foreach (['public_base_url', 'certificate_storage_path'] as $key) {
            if (!isset($config[$key]) || !is_string($config[$key]) || trim($config[$key]) === '') {
                throw new RuntimeException('Configuration invalid.');
            }
        }

        $config['public_base_url'] = rtrim(trim($config['public_base_url']), '/');
        $config['certificate_storage_path'] = rtrim(trim($config['certificate_storage_path']), '/');

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
