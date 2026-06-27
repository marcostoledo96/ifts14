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
| `POST` | `/certificados/api/admin/certificados` | Emite certificado y token persistido; requiere `X-Admin-Key` y devuelve DTO seguro sin DNI ni token completos. |
| `POST` | `/certificados/api/admin/certificados/{id}/revocar` | Revoca certificado e invalida tokens activos; requiere `X-Admin-Key`. |

La validación pública acepta tokens de 32 a 128 caracteres alfanuméricos, `_` o `-`. Los casos inexistentes, revocados, vencidos o fuera de ventana responden `404 CERTIFICATE_NOT_FOUND` sin revelar la causa. Los endpoints públicos aplican rate limiting mínimo por origen y responden `429 RATE_LIMITED` al superar el umbral configurado. El endpoint no devuelve DNI completo, token completo, SQL, rutas internas ni configuración.

`token_pepper` es obligatorio en la configuración externa real y debe mantenerse fuera de Git. El ejemplo versionable usa valores ficticios solo para demo local.

## Contrato vigente

El contrato público futuro de la API de certificados QR está documentado en:

- `docs/backend/01-contrato-api-certificados.md`

Ese contrato define endpoints, DTOs, sobre de errores, validación de token QR, reglas de seguridad y expectativas de integración. La implementación actual cubre la validación pública mínima y el slice administrativo mínimo de emisión/revocación protegido por `X-Admin-Key`.

## Pendientes

- Confirmar si Composer está disponible.
- Confirmar mecanismo de email.
- Confirmar generación de PDF/QR viable en el hosting.
- Definir mecanismo de reenvío/entrega de token en un ciclo SDD posterior; el endpoint de reenvío administrativo sigue fuera de alcance hasta confirmar email o canal seguro.
- **Rate limiting público**: implementado como protección básica de nodo único con JSON temporal y `flock()`. No reemplaza controles anti-abuso distribuidos.
- **Auditoría fault-injection**: disponible en `apps/backend-php/tests/fault-injection-audit.php` para DB demo ficticia; restaura `cert_eventos_auditoria` en `finally`.

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

Las respuestas capturadas no incluyen DNI completo, token completo, SQL, credenciales, rutas internas ni configuración sensible. La falla del `INSERT` de auditoría quedó probada con `apps/backend-php/tests/fault-injection-audit.php` contra DB demo ficticia: válido conserva `200`, no verificable conserva `404`, token inválido conserva `400` y `cert_eventos_auditoria` se restaura en `finally`.

Detalle de uso en `docker/php84/README.md` y en `apps/backend-php/README.md` (sección "Smoke HTTP local con `sudo docker run`").

## Hallazgos de auditoría (hipótesis)

- **Observado**: el material original incluye una carpeta `api/` con subcarpetas PHP por recurso y operaciones CRUD candidatas.
- **Observado**: existen archivos de conexión/configuración bajo `api/`; no fueron abiertos por riesgo de credenciales.
- **Observado**: `api.zip` existe como artefacto comprimido y no fue descomprimido.
- **Hipótesis**: el backend original parece procedural y desplegado en carpeta pública; el nuevo módulo debe separar configuración, servicios y acceso a datos.

## Hardening aplicado (ciclo `qa-backend-hardening-certificados`)

Cambios quirúrgicos implementados en el front controller PHP y las clases comunes, sin dependencias, migraciones ni nuevos módulos.

| Comportamiento | Implementación | Spec |
|---|---|---|
| Headers de seguridad en toda respuesta JSON | `Response::json()` y `Response::error()` emiten `X-Content-Type-Options: nosniff` y `X-Frame-Options: SAMEORIGIN` antes de `Content-Type`. | `backend-base-php-certificados`, `backend-contrato-api-certificados`. |
| `415 UNSUPPORTED_MEDIA_TYPE` por `Content-Type` no JSON | Helper local `requireJsonContentType()` en `index.php`: split por `;`, `trim`, `strtolower`, exige `application/json` exacto. Se aplica antes de cualquier side effect o rate-limit. | `backend-contrato-api-certificados`. |
| `400 VALIDATION_ERROR` por JSON malformado en POST JSON | Helper local `readJsonBody()` exige `json_decode` como array sin `JSON_ERROR_NONE`. Aplica a `POST /certificados/consulta`, `POST /admin/certificados` y `POST /admin/certificados/{id}/revocar`. | `backend-contrato-api-certificados`, `admin-certificate-emission`. |
| Falla cerrada para `admin_api_key` corta | `Config::adminApiKey()` devuelve `''` si la clave configurada está vacía o mide menos de 16 caracteres tras `trim`. Las rutas admin responden `401 UNAUTHORIZED` sin revelar causa; los endpoints públicos no se rompen. | `admin-auth`. |
| Revocación sin motivo | Cuando no se envía `reason`, el cliente debe enviar un body JSON `{}`. Un body sin `Content-Type: application/json` o con JSON malformado responde `415`/`400` sin persistir. | `backend-contrato-api-certificados`. |

### Pendientes diferidos (fuera de este ciclo)

Los siguientes gaps quedan registrados en specs y deben abordarse en ciclos SDD posteriores:

- **CORS / preflight**: no se implementan respuestas a `OPTIONS` ni cabeceras `Access-Control-*`.
- **Límite de tamaño de body**: no se aplica `post_max_size` ni chequeo manual del largo de `php://input`.
- **Rate limiting distribuido**: el `RateLimiter` actual es de nodo único con JSON temporal y `flock`; no escala horizontalmente.
- **Observabilidad real**: no hay agregador de logs, métricas ni trazas; el backend solo emite eventos puntuales.
- **`ultimo_uso_en` en verificación pública**: la columna existe en el modelo, pero la verificación pública no la actualiza todavía.
