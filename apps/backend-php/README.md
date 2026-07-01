# Backend PHP — certificados

Base mínima de la API PHP 8.4 para `/certificados/api/`.

## Estructura

| Ruta | Uso |
|---|---|
| `index.php` | Front controller con `GET /health`, validación pública, emisión, revocación, descarga PDF y reenvío por email. |
| `src/Response.php` | Respuestas JSON UTF-8 con envelope `data/meta` o `error/meta`. |
| `src/Config.php` | Carga configuración real desde un archivo externo no versionado. Normaliza `requirePdfConfig()` y `requireDeliveryConfig()`. |
| `src/Database.php` | Crea PDO de forma diferida para endpoints que requieren base. |
| `src/AdminCertificateService.php` | Emisión, revocación y reenvío con rotación de token, auditoría segura y `maskEmail()`. |
| `src/EmailDeliveryTransport.php` | Contrato del adaptador de entrega por email. |
| `src/StubEmailDeliveryTransport.php` | Modo seguro: siempre `503 DELIVERY_NOT_CONFIGURED`. |
| `src/SmtpEmailDeliveryTransport.php` | Modo SMTP con PHPMailer; no loguea token ni credenciales. |
| `src/EmailDeliveryTransportFactory.php` | Selecciona `stub` o `smtp` desde `Config::requireDeliveryConfig()`. |
| `config/certificados-config.example.php` | Ejemplo ficticio con `delivery_transport => 'stub'` y placeholders SMTP. |
| `composer.json` / `composer.lock` | Fija `tecnickcom/tcpdf` y `phpmailer/phpmailer`. `vendor/` ignorado. |
| `.htaccess` | Fallback mínimo hacia `index.php` para Apache. |

## Configuración externa

La configuración real debe vivir fuera del repositorio y fuera del webroot.

Orden de carga:

1. `CERTIFICADOS_CONFIG_PATH`, si está definida.
2. `/home/usuario_demo/certificados_config/certificados-api.php` como ruta externa documentada.

No versionar `.env`, `config.php`, `db.php`, `database.php`, `conexion.php` ni credenciales reales.

### Entrega por email (reenvío)

El reenvío administrativo (`POST /admin/certificados/{id}/reenviar`) usa un adaptador de transporte configurable:

| Clave | Default | Uso |
|---|---|---|
| `delivery_transport` | `stub` | `stub` no envía real (responde `503`); `smtp` exige credenciales. |
| `smtp_host` | — | Host SMTP. Exigido en `smtp`. |
| `smtp_port` | — | Puerto (1-65535). Exigido en `smtp`. |
| `smtp_username` | — | Usuario SMTP. Exigido en `smtp`. |
| `smtp_password` | — | Contraseña SMTP. Exigida en `smtp`. |
| `smtp_secure` | `tls` | `tls` o `ssl`. Vacío se rechaza (riesgo de credenciales en claro). |
| `mail_from` | — | Remitente. Exigido en `smtp`. |
| `mail_from_name` | — | Nombre del remitente (opcional). |
| `public_base_url` | — | Base pública para `/validar/{token}`. Exigida en `smtp`. |

El token completo solo viaja dentro del email; nunca en JSON, logs ni auditoría. La auditoría guarda `destinatario_enmascarado` en `detalle_seguro`.

### Composer / dependencias

El backend versiona `composer.lock` para fijar `tecnickcom/tcpdf` y `phpmailer/phpmailer`. `vendor/` está ignorado y se regenera con:

```bash
composer install --no-dev --no-interaction
```

Regenerar el lock tras cambiar `composer.json`:

```bash
docker run --rm --volume "$PWD/apps/backend-php:/app" --workdir /app composer:2 composer update --no-dev --no-interaction
```

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
