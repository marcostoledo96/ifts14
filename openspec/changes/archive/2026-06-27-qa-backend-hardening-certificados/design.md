# Diseño: hardening mínimo de seguridad backend certificados

## Enfoque técnico

Aplicar un cambio quirúrgico sobre el front controller PHP y las clases comunes existentes. El diseño evita dependencias, migraciones y nuevos módulos: centraliza headers en `Response`, agrega helpers locales en `index.php` para validar `Content-Type` y decodificar JSON, y ajusta `Config` para que una `admin_api_key` configurada con menos de 16 caracteres quede inutilizable. Esto cubre los deltas de `backend-contrato-api-certificados`, `backend-base-php-certificados`, `admin-certificate-emission` y `admin-auth`.

## Decisiones de arquitectura

| Opción | Tradeoff | Decisión |
|---|---|---|
| Helpers privados en `index.php` vs. nueva clase `JsonRequest` | Menos reutilizable, pero menor diff y suficiente para 3 endpoints. | Usar helpers locales `requireJsonContentType()` y `readJsonBody()` para no duplicar lógica ni abrir una abstracción prematura. |
| Validar JSON después de auth admin vs. antes | Auth primero evita parsear payloads no autorizados; content type sigue validándose antes de side effects. | En admin, conservar `requireAdmin()` antes de leer body; luego rechazar JSON malformado con `400`. |
| Headers en cada endpoint vs. `Response` | Centralizar reduce omisiones en errores/éxitos. | Agregar `X-Content-Type-Options: nosniff` y `X-Frame-Options: SAMEORIGIN` en `Response::json()` y `Response::error()`. |
| `Config::load()` lanza excepción por clave corta vs. normaliza a vacío | Lanzar rompería endpoints públicos cuando la clave admin esté ausente/corta. | `Config::adminApiKey()` debe devolver `''` si falta, está vacía o mide menos de 16; admin falla cerrado con `401`, público no se rompe. |

## Flujo de datos

```txt
POST JSON ──→ index.php
              ├─ requireJsonContentType() ──415 si no es application/json
              ├─ readJsonBody() ───────────400 si JSON malformado
              ├─ requireAdmin() ───────────401 en rutas admin
              └─ servicios existentes ─────Response::{json,error} + headers seguros
```

## Cambios de archivos

| Archivo | Acción | Descripción |
|---|---|---|
| `apps/backend-php/index.php` | Modificar | Crear helpers mínimos y aplicarlos a `POST /certificados/consulta`, `POST /admin/certificados` y `POST /admin/certificados/{id}/revocar`. Mantener `Allow` y flujo actual. |
| `apps/backend-php/src/Response.php` | Modificar | Emitir headers de seguridad en respuestas JSON de éxito y error. |
| `apps/backend-php/src/Config.php` | Modificar | Hacer que `adminApiKey()` devuelva vacío si la clave configurada tiene menos de 16 caracteres. |
| `apps/backend-php/tests/AuthGateTest.php` | Modificar | Actualizar clave demo a 16+ caracteres y agregar caso de clave corta. |
| `apps/backend-php/tests/*` o smoke HTTP | Modificar/usar | Agregar cobertura mínima para headers, `415` y JSON malformado sin side effects, preferentemente con servidor embebido y config ficticia. |
| `docs/backend/00-php84-api.md` | Modificar en archive | Registrar hardening aplicado y pendientes diferidos. |
| `docs/backend/01-contrato-api-certificados.md` | Modificar en archive | Documentar `415`, headers y longitud mínima de `X-Admin-Key` configurada. |

## Interfaces / contratos

- `Content-Type` aceptado: cualquier valor compatible que contenga `application/json`, incluyendo `application/json; charset=utf-8`.
- `415 UNSUPPORTED_MEDIA_TYPE`: sobre seguro de error, sin payload parseado ni side effects.
- `400 VALIDATION_ERROR`: JSON sintácticamente inválido en los tres POST JSON.
- `admin_api_key`: ausente, vacía o menor a 16 caracteres equivale a no configurada; las rutas admin responden `401 UNAUTHORIZED` sin causa específica.

## Estrategia de pruebas

| Capa | Qué probar | Enfoque |
|---|---|---|
| Unit | `AuthGate` rechaza clave corta y no filtra secretos. | Actualizar `AuthGateTest.php`. |
| Contract/smoke | Headers en éxito/error, `415` por content type inválido y `400` por JSON malformado. | Curl o test PHP mínimo contra servidor embebido con config ficticia. |
| Regression | Emisión/revocación válidas conservan comportamiento actual. | Ejecutar tests existentes y `php -l`. |

## Migración / rollout

No requiere migración. Rollback: revertir el commit y validar `php -l`/tests. Riesgo esperado: clientes que omitan `Content-Type` en POST deberán corregirse.

## Plan de documentación y diferidos

Durante `sdd-archive`, actualizar docs backend con esta frase base: “Quedan fuera de este ciclo: CORS/preflight, límite de tamaño de body, rate limiting distribuido, observabilidad real y actualización de `ultimo_uso_en` en verificación pública”.

## Preguntas abiertas

Ninguna bloqueante.
