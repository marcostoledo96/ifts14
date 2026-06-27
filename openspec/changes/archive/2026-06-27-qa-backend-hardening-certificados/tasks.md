# Tasks: hardening mínimo de seguridad backend certificados

## Review Workload Forecast

| Campo | Valor |
|-------|-------|
| Líneas estimadas | 200–280 |
| Riesgo de presupuesto 400 | Low |
| Chained PRs recomendado | No |
| Suggested split | Single PR |
| Delivery strategy | auto-chain |

Decision needed before apply: No
Chained PRs recommended: No
Chain strategy: size-exception
400-line budget risk: Low

### Suggested Work Units

| Unit | Goal | Likely PR | Notes |
|------|------|-----------|-------|
| 1 | Headers + Content-Type/JSON + admin key + tests + archive | PR 1 | Único cambio; helpers locales; sin DB/migrations/secrets |

## Phase 1: Base común (Response + Config)

- [x] 1.1 `src/Response.php`: emitir `X-Content-Type-Options: nosniff` y `X-Frame-Options: SAMEORIGIN` en `json()` y `error()` antes del header `Content-Type`.
- [x] 1.2 `src/Config.php`: `adminApiKey()` devuelve `''` si la clave está vacía o mide <16 (con `trim` previo).
- [x] 1.3 `tests/AuthGateTest.php`: clave <16 → `401` cerrada; clave 16+ aceptada; header ausente → `401`.

## Phase 2: Helpers de request en index.php

- [x] 2.1 Helper `requireJsonContentType()`: split en `;`, `trim` + `strtolower`, exige exactamente `application/json`; falla con `415` vía `Response::error()`.
- [x] 2.2 Helper `readJsonBody()`: lee `php://input`, exige `json_decode` array sin `JSON_ERROR_NONE`; falla con `400 VALIDATION_ERROR`.
- [x] 2.3 Admin `POST /admin/certificados` y `POST /admin/certificados/{id}/revocar`: orden `method` → CT → `requireAdmin()` → body → servicio/DB/auditoría.
- [x] 2.4 Público `POST /certificados/consulta`: orden `method` → CT → body → `allowPublicRequest()` → validación; CT/JSON malo no llega a `RateLimiter`.

## Phase 3: Cobertura de tests (smoke + contract)

- [x] 3.1 `415` cuando falta `Content-Type` o no es `application/json` en los 3 POST; no se invoca servicio/DB/auditoría.
- [x] 3.2 `400` con JSON malformado en los 3 POST; bucket de `RateLimiter` no se incrementa en el público.
- [x] 3.3 Toda respuesta JSON (éxito/error) trae `X-Content-Type-Options` y `X-Frame-Options` correctos.
- [x] 3.4 Regresión: emisión y revocación válidas con admin key 16+ siguen funcionando. (Reconciliado en `sdd-archive` con evidencia del `verify-report.md`: smoke HTTP + MariaDB 10.6 efímero con config ficticia, `emit=201` y `revoke=200` con `tokens_revoked=1`.)

## Phase 4: Verificación y archive

- [x] 4.1 `php -l` sobre `index.php`, `src/Response.php`, `src/Config.php`.
- [x] 4.2 Correr `apps/backend-php/tests/` y registrar resultados.
- [x] 4.3 `sdd-verify` mapeando escenarios de las 4 specs delta; documentar cobertura por escenario. (Cumplido por `verify-report.md` durante la fase `sdd-verify`; matriz de cumplimiento cubre headers, `415`, `400`, regresión emisión/revocación, fail-closed admin y rate-limit sin side effects.)
- [x] 4.4 `sdd-archive`: sincronizar deltas a `openspec/specs/`; actualizar `docs/backend/00-php84-api.md` y `01-contrato-api-certificados.md` con headers, `415`, longitud mínima de `X-Admin-Key` y gaps diferidos (CORS, body size, rate limit distribuido, observabilidad, `ultimo_uso_en`).

## Design gate warnings (pin obligatorio)

- **POST admin**: `method` → `requireJsonContentType()` → `requireAdmin()` → `readJsonBody()` → servicio/DB/auditoría. Ningún path de error toca DB ni auditoría.
- **POST público**: `method` → `requireJsonContentType()` → `readJsonBody()` → `allowPublicRequest()` → validación. `RateLimiter::allow()` NO recibe CT/JSON inválido (persiste bucket en disco).
- **`Content-Type`**: split en `;`, `trim` + `strtolower`, exigir exactamente `application/json`. Prohibido `str_contains`/substring.
- **Tests anti side-effect**: CT/JSON inválido NO alcanza DB / servicio / auditoría / rate limiter. Público NO se rompe con admin key <16 o ausente.
- **`admin_api_key`**: 16+ aceptado; <16 / ausente / header faltante → `401` cerrada. Logs y respuesta NO exponen clave ni fragmentos.
