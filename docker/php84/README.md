# Runtime Docker PHP 8.4

Imagen local mínima para verificar el backend PHP con una versión compatible con producción (`php:8.4-cli`). No usa Docker Compose, no conecta a base de datos y no copia credenciales.

## Uso rápido

Ejecutar desde la raíz del repositorio:

```bash
bash scripts/php-docker-build.sh
bash scripts/php-docker-version.sh
bash scripts/php-docker-modules-check.sh
bash scripts/php-docker-lint.sh
```

## Qué valida

| Script | Validación |
|---|---|
| `scripts/php-docker-build.sh` | Construye la imagen local `ifts14-php84`. |
| `scripts/php-docker-version.sh` | Muestra la versión de PHP dentro del contenedor. |
| `scripts/php-docker-modules-check.sh` | Verifica `pdo_mysql`, `openssl`, `mbstring`, `curl`, `zip` y `xml`. |
| `scripts/php-docker-lint.sh` | Ejecuta `php -l` solo sobre `apps/backend-php/`. |

## Alcance

- Base: imagen oficial `php:8.4-cli`.
- Extensiones instaladas: `pdo_mysql`, `mbstring`, `curl`, `zip`, `xml`.
- `openssl` se valida porque viene habilitada en la imagen oficial.
- No instala Composer.
- No ejecuta endpoints ni accede a datos reales.
