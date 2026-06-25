# Plan — php84-docker-runtime

## Contexto

El entorno local de Ubuntu tiene PHP 8.5, mientras que producción (cPanel) usa PHP 8.4.21. No se dispone de `docker compose`. Se necesita un runtime Docker mínimo basado en `php:8.4-cli` para validar sintaxis, módulos y smoke local sin modificar producto ni acceder a DB reales.

## Estructura propuesta

| Ruta | Propósito |
|---|---|
| `docker/php84/Dockerfile` | Imagen oficial PHP 8.4-cli con extensiones requeridas. |
| `docker/php84/README.md` | Instrucciones de uso y verificación. |
| `scripts/php-docker-build.sh` | Build de la imagen (`sudo docker build`). |
| `scripts/php-docker-version.sh` | Muestra versión PHP del contenedor. |
| `scripts/php-docker-modules-check.sh` | Lista módulos y chequea los requeridos. |
| `scripts/php-docker-lint.sh` | Ejecuta `php -l` sobre `apps/backend-php/`. |

## Dockerfile (propuesta)

```dockerfile
FROM php:8.4-cli
RUN apt-get update && apt-get install -y \
    libzip-dev \
    libxml2-dev \
    libonig-dev \
    && docker-php-ext-install pdo_mysql mbstring zip xml \
    && apt-get clean && rm -rf /var/lib/apt/lists/*
```

Notas:
- `openssl` y `curl` suelen estar habilitados por defecto en la imagen oficial; se validarán con `php-docker-modules-check.sh`.
- No se instala Composer ni se copia código fuente; la imagen es solo runtime.

## Scripts (resumen)

- `php-docker-build.sh`: `sudo docker build -t ifts14-php84 -f docker/php84/Dockerfile .`
- `php-docker-version.sh`: `sudo docker run --rm ifts14-php84 php -v`
- `php-docker-modules-check.sh`: corre `php -m`, verifica presencia de `pdo_mysql`, `openssl`, `mbstring`, `curl`, `zip`, `xml`.
- `php-docker-lint.sh`: monta el repo en `/workspace` y ejecuta `find apps/backend-php -name "*.php" -exec php -l {} +`.

## Actualización de documentación recomendada

- `apps/backend-php/README.md`: agregar sección "QA local con Docker" alternativa a `php -S`/`php -l` nativos.
- `docs/backend/00-php84-api.md`: mencionar la existencia del runtime Docker como opción de validación local.

## Verificación esperada (Marcos ejecutará)

1. `bash scripts/php-docker-build.sh`
2. `bash scripts/php-docker-version.sh` → debe mostrar `PHP 8.4.x`
3. `bash scripts/php-docker-modules-check.sh` → todos `OK`
4. `bash scripts/php-docker-lint.sh` → sin errores de sintaxis

## Restricciones respetadas

- Sin Docker Compose.
- Sin modificar lógica de producto.
- Sin acceso a DB real ni credenciales.
- Sin tocar `material_privado_no_versionar/`.
