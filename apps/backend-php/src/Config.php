<?php

declare(strict_types=1);

final class Config
{
    private const string DEFAULT_PATH = '/home/usuario_demo/certificados_config/certificados-api.php';

    /** @return array<string, string> */
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

        return $config;
    }
}
