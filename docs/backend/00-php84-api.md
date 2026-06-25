# Backend PHP 8.4.21

## Objetivo

Implementar la API del módulo de certificaciones QR usando PHP 8.4.21.

## Principios

- Usar PDO.
- Usar prepared statements.
- No exponer credenciales.
- No imprimir DNI ni tokens completos en logs.
- Separar configuración, rutas, servicios y acceso a datos.
- Mantener documentación en español argentino formal.

## Ruta conceptual

```txt
/certificados/api/
```

## Contrato vigente

El contrato público futuro de la API de certificados QR está documentado en:

- `docs/backend/01-contrato-api-certificados.md`

Ese contrato define endpoints, DTOs, sobre de errores, validación de token QR, reglas de seguridad y expectativas de integración. No implica implementación PHP todavía.

## Pendientes

- Confirmar si Composer está disponible.
- Confirmar mecanismo de email.
- Confirmar generación de PDF/QR viable en el hosting.
- Definir endpoints administrativos de emisión, revocación y reenvío en un ciclo SDD posterior.

## Validación local con PHP 8.4

Si el PHP nativo local no coincide con producción (PHP 8.4.21), existe un runtime Docker mínimo en `docker/php84/` con scripts en `scripts/php-docker-*.sh`. El runtime local se ejecuta exclusivamente con `sudo docker build` y `sudo docker run`; no se usa Docker Compose en este ciclo ni en los siguientes hasta decisión explícita. No conecta a bases de datos reales y no monta credenciales. Fue validado localmente con PHP 8.4.22, módulos requeridos OK y `php -l` sin errores sobre el backend base.

El smoke HTTP local real se ejecutó dentro de la imagen `ifts14-php84` mediante `sudo docker run` (sin Docker Compose) con el siguiente comando:

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

Casos verificados:

- `GET http://127.0.0.1:8080/health` → 200 JSON `data.status: ok`, `data.service: certificados-api`.
- `POST http://127.0.0.1:8080/health` → 405 con `Allow: GET` y `error.code: METHOD_NOT_ALLOWED`.
- `GET http://127.0.0.1:8080/no-existe` → 404 con `error.code: NOT_FOUND`.

Detalle de uso en `docker/php84/README.md` y en `apps/backend-php/README.md` (sección "Smoke HTTP local con `sudo docker run`").

## Hallazgos de auditoría (hipótesis)

- **Observado**: el material original incluye una carpeta `api/` con subcarpetas PHP por recurso y operaciones CRUD candidatas.
- **Observado**: existen archivos de conexión/configuración bajo `api/`; no fueron abiertos por riesgo de credenciales.
- **Observado**: `api.zip` existe como artefacto comprimido y no fue descomprimido.
- **Hipótesis**: el backend original parece procedural y desplegado en carpeta pública; el nuevo módulo debe separar configuración, servicios y acceso a datos.
