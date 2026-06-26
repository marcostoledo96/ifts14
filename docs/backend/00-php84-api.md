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

## Endpoints implementados

| Método | Ruta pública | Resultado |
|---|---|---|
| `GET` | `/certificados/api/health` | Estado técnico básico, sin abrir configuración ni PDO. |
| `GET` | `/certificados/api/certificados/{token}/verificacion` | Valida token público por hash `SHA-256(token + token_pepper)` y devuelve DTO público mínimo. |
| `POST` | `/certificados/api/certificados/consulta` | Lee JSON `{ "token": "..." }` y reutiliza la misma validación que el GET. |

La validación pública acepta tokens de 32 a 128 caracteres alfanuméricos, `_` o `-`. Los casos inexistentes, revocados, vencidos o fuera de ventana responden `404 CERTIFICATE_NOT_FOUND` sin revelar la causa. El endpoint no devuelve DNI completo, token completo, SQL, rutas internas ni configuración.

`token_pepper` es obligatorio en la configuración externa real y debe mantenerse fuera de Git. El ejemplo versionable usa valores ficticios solo para demo local.

## Contrato vigente

El contrato público futuro de la API de certificados QR está documentado en:

- `docs/backend/01-contrato-api-certificados.md`

Ese contrato define endpoints, DTOs, sobre de errores, validación de token QR, reglas de seguridad y expectativas de integración. La implementación actual cubre la validación pública mínima; los endpoints administrativos siguen fuera de alcance.

## Pendientes

- Confirmar si Composer está disponible.
- Confirmar mecanismo de email.
- Confirmar generación de PDF/QR viable en el hosting.
- Definir endpoints administrativos de emisión, revocación y reenvío en un ciclo SDD posterior.
- **Rate limiting público**: el contrato lo menciona (`429 RATE_LIMITED`) pero la implementación actual no lo aplica; queda pendiente para un ciclo posterior.
- **Auditoría fault-injection**: el `try/catch` interno está implementado, pero no se ejecutó fault-injection en runtime sobre `cert_eventos_auditoria`.

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

### Verificación local del endpoint público

La implementación de `backend-validacion-publica-certificados` quedó validada con evidencia local real provista por Marcos en una sesión interactiva, con `sudo docker run` aislado y un MariaDB 10.6 con configuración ficticia bajo `/tmp`:

| Verificación | Resultado |
|---|---|
| `bash scripts/php-docker-modules-check.sh` (módulos PHP) | `PASS` — `pdo_mysql`, `openssl`, `mbstring`, `curl`, `zip`, `xml`. |
| `bash scripts/php-docker-lint.sh` (`php -l` sobre archivos modificados/nuevos) | `PASS` — sin errores de sintaxis. |
| `GET /health` con config de ejemplo | `PASS` — `200` con `data.status: ok`, `data.service: certificados-api`. |
| `GET .../verificacion` con token de formato inválido (`bad`) | `PASS` — `400 VALIDATION_ERROR` sin DB lookup. |
| `POST .../consulta` con `{"token":"bad"}` | `PASS` — `400 VALIDATION_ERROR` sin DB lookup. |
| DB-backed `GET .../verificacion` con token demo válido | `PASS` — `200` con DTO público (`data.valid: true`, `documentMasked`, `requestId`). |
| DB-backed `POST .../consulta` con token demo válido | `PASS` — `200` con el mismo DTO que GET. |
| DB-backed `GET .../verificacion` con token no verificable | `PASS` — `404 CERTIFICATE_NOT_FOUND` unificado. |

Las respuestas capturadas no incluyen DNI completo, token completo, SQL, credenciales, rutas internas ni configuración sensible. La falla del `INSERT` de auditoría no fue probada con fault-injection en runtime; el `try/catch` interno está verificado estáticamente.

Detalle de uso en `docker/php84/README.md` y en `apps/backend-php/README.md` (sección "Smoke HTTP local con `sudo docker run`").

## Hallazgos de auditoría (hipótesis)

- **Observado**: el material original incluye una carpeta `api/` con subcarpetas PHP por recurso y operaciones CRUD candidatas.
- **Observado**: existen archivos de conexión/configuración bajo `api/`; no fueron abiertos por riesgo de credenciales.
- **Observado**: `api.zip` existe como artefacto comprimido y no fue descomprimido.
- **Hipótesis**: el backend original parece procedural y desplegado en carpeta pública; el nuevo módulo debe separar configuración, servicios y acceso a datos.
