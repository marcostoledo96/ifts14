# Backend PHP — certificados

Base mínima de la API PHP 8.4 para `/certificados/api/`.

## Estructura

| Ruta | Uso |
|---|---|
| `index.php` | Front controller con `GET /health`, validación pública, emisión, revocación, descarga PDF y entrega manual. |
| `src/Response.php` | Respuestas JSON UTF-8 con envelope `data/meta` o `error/meta`. |
| `src/Config.php` | Carga configuración real desde un archivo externo no versionado. Normaliza PDF y clave externa de cifrado. |
| `src/Database.php` | Crea PDO de forma diferida para endpoints que requieren base. |
| `src/AdminCertificateService.php` | Emisión, revocación y entrega manual sin rotar token. |
| `config/certificados-config.example.php` | Ejemplo ficticio con cifrado y configuración externa de sesión admin. |
| `composer.json` / `composer.lock` | Fija `tecnickcom/tcpdf`. `vendor/` ignorado. |
| `.htaccess` | Fallback mínimo hacia `index.php` para Apache. |

## Configuración externa

La configuración real debe vivir fuera del repositorio y fuera del webroot.

Orden de carga:

1. `CERTIFICADOS_CONFIG_PATH`, si está definida.
2. `/home/usuario_demo/certificados_config/certificados-api.php` como ruta externa documentada.

No versionar `.env`, `config.php`, `db.php`, `database.php`, `conexion.php` ni credenciales reales.

### Sesión administrativa

`admin_username`, `admin_password_hash`, `admin_session_idle_seconds` (`14400`) y `admin_session_absolute_seconds` (`28800`) son obligatorios para login. El hash se genera con `PASSWORD_DEFAULT` fuera de Git. Las rutas de browser son `POST /admin/auth/login`, `GET /admin/auth/session` y `POST /admin/auth/logout`; toda mutación admin requiere `X-CSRF-Token` emitido por la sesión. `X-Admin-Key` no autoriza HTTP.

### Entrega manual

El endpoint `GET /admin/certificados/{id}/entrega-manual` devuelve `publicValidationUrl`, `pdfDownloadUrl` y `tokenPrefix` para que Bedelía entregue el certificado por canal externo. No envía email, no rota token y no escribe auditoría operativa. La clave externa `token_encryption_key` debe decodificar a 32 bytes y nunca se versiona.

### Composer / dependencias

El backend versiona `composer.lock` para fijar `tecnickcom/tcpdf`. `vendor/` está ignorado y se regenera con:

```bash
composer install --no-dev --no-interaction
```

Si el cambio en `composer.json` solo requiere refrescar metadata/content-hash del lock, sin agregar, quitar ni actualizar paquetes:

```bash
docker run --rm --volume "$PWD/apps/backend-php:/app" --workdir /app composer:2 composer update --lock --no-install
```

Para agregar, quitar o actualizar paquetes, usar un flujo explícito de Composer, por ejemplo `composer update <paquete> --no-dev --no-interaction`, y luego validar que `composer.lock` haya quedado coherente con el cambio.

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

## QA local con Docker PHP 8.4

Si el PHP nativo local no coincide con producción, usar el runtime Docker mínimo:

```bash
bash scripts/php-docker-build.sh
bash scripts/php-docker-version.sh
bash scripts/php-docker-modules-check.sh
bash scripts/php-docker-lint.sh
```

Validado localmente con la imagen `ifts14-php84:latest`: PHP 8.4.22, módulos requeridos OK y `php -l` sin errores sobre los PHP del backend base.

Los scripts usan `sudo docker build` y `sudo docker run`. No usan Docker Compose, no montan credenciales reales y no conectan con bases de datos reales.

### Smoke HTTP local con `sudo docker run`

Para arrancar el servidor embebido y correr el smoke HTTP local sin Docker Compose, dentro de la imagen `ifts14-php84`:

```bash
sudo docker run -d --rm \
  --name ifts14-php84-smoke \
  -p 8080:8080 \
  -v "$PWD/apps/backend-php":/app \
  -w /app \
  -e CERTIFICADOS_CONFIG_PATH=/app/config/certificados-config.example.php \
  ifts14-php84 \
  php -S 0.0.0.0:8080 -t /app /app/index.php
```

Casos validados:

| Caso | Resultado esperado |
|---|---|
| `curl -i http://127.0.0.1:8080/health` | 200 con `data.status: ok`, `data.service: certificados-api`. |
| `curl -i -X POST http://127.0.0.1:8080/health` | 405 con `Allow: GET` y `error.code: METHOD_NOT_ALLOWED`. |
| `curl -i http://127.0.0.1:8080/no-existe` | 404 con `error.code: NOT_FOUND`. |

Cierre limpio:

```bash
sudo docker stop ifts14-php84-smoke
```
