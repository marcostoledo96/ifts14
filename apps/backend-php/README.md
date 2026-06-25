# Backend PHP — certificados

Base mínima de la API PHP 8.4 para `/certificados/api/`.

## Estructura

| Ruta | Uso |
|---|---|
| `index.php` | Front controller con `GET /health`, 404, 405 y error 500 seguro. |
| `src/Response.php` | Respuestas JSON UTF-8 con envelope `data/meta` o `error/meta`. |
| `src/Config.php` | Carga configuración real desde un archivo externo no versionado. |
| `src/Database.php` | Crea PDO de forma diferida para endpoints futuros. |
| `config/certificados-config.example.php` | Ejemplo ficticio, sin credenciales reales. |
| `.htaccess` | Fallback mínimo hacia `index.php` para Apache. |

## Configuración externa

La configuración real debe vivir fuera del repositorio y fuera del webroot.

Orden de carga:

1. `CERTIFICADOS_CONFIG_PATH`, si está definida.
2. `/home/usuario_demo/certificados_config/certificados-api.php` como ruta externa documentada.

No versionar `.env`, `config.php`, `db.php`, `database.php`, `conexion.php` ni credenciales reales.

## QA local

Servidor local:

```bash
php -S 127.0.0.1:8080 -t apps/backend-php
```

Comandos de verificación:

```bash
git status --ignored --short
php -l apps/backend-php/index.php
php -l apps/backend-php/src/Response.php
php -l apps/backend-php/src/Config.php
php -l apps/backend-php/src/Database.php
php -l apps/backend-php/config/certificados-config.example.php
php -m
curl -i http://127.0.0.1:8080/health
curl -i -X POST http://127.0.0.1:8080/health
```

`GET /health` no carga configuración ni abre PDO.
