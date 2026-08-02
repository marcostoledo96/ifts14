# Exploración: audit-u06-backend

**Cambio:** `audit-u06-backend`
**Rama:** `audit/u06-backend` @ `0b9d786` (staging1.0 post-merge PR #113; U5 archivado)
**Plan:** `docs/qa/PLAN-AUDITORIA-EXHAUSTIVA-STAGING-1.0.md` §U6
**Locks:** D0 · token/QR permanente sin rotar · auth sesión PHP + CSRF · `X-Admin-Key` solo CLI · no rotar encryption keys · no tocar archive U5 · fixes quirúrgicos · sin commit
**Artifact store:** hybrid

---

## Exploration: Backend PHP — contrato, errores, sesión (U6)

### Current State

El backend admin/público ya tiene un contrato de envelope maduro y auth por sesión:

- **Envelope:** `Response::json` / `Response::error` emiten `{ data|error, meta.requestId }` con headers anti-cache. `respondToAdmin` / `respondToValidation` centralizan el camino feliz y excepciones (`AdminCertificateException`).
- **Auth:** `AdminSessionAuth` + `AuthGate::requireHttpSession`. Login/logout/session en `index.php`. Mutaciones exigen CSRF; GETs admin pasan por `authorize(..., mutates=false)`.
- **TTL reales en código:** `Config::ADMIN_SESSION_IDLE_SECONDS = 14400` y `ABSOLUTE = 28800` con igualdad estricta en `adminSessionSettings()`. Ejemplo y tests usan esos valores. Deploy docs (`docs/deploy/00-cpanel-certificados.md`) coinciden.
- **D-009 — gap confirmado en código:** `authorize()` renueva `$_SESSION['lastSeen']` y llama `session_write_close()`. `state()` (usado por `GET /admin/auth/session`) **no** renueva `lastSeen` ni libera el lock con write_close tras touch. GETs autorizados vía `requireAdmin` **sí** renuevan.
- **Drift documental:** `openspec/specs/admin-auth/spec.md` y `docs/backend/00-php84-api.md` aún dicen idle **30 minutos**; el producto/PLAN/código prometen **4 h / 8 h**.
- **400/409:** Códigos de negocio presentes (`CERTIFICATE_ALREADY_EXISTS`, `TOKEN_NOT_RECOVERABLE`, `CONFLICT` + `existingStudentId`, `VALIDATION_ERROR`, `PDF_OUTDATED`). UI Angular mapea por status/código en páginas clave; mensajes backend a menudo genéricos («Solicitud inválida.») — FE suele overlayar copy operable.
- **PII en logs:** `error_log('ifts14_admin_session_start_failed')` sanitizado; `AuthPrivacyTest` cubre filtrado en login 401; auditoría usa prefijos (`token_hash_prefijo`). DNI completo en UI (D0), no en logs observados en el muestreo.
- **D-004:** `allowLoginAttempt` falla cerrado (storage no escribible → `false` → `429 RATE_LIMITED`). Rate limit público (`RateLimiter`) falla abierto. Hipótesis PLAN: 429 espurio por storage.
- **Tests del área:** `AdminSessionAuthTest`, `AdminAuthHttpTest`, `AuthPrivacyTest`, `AuthGateTest`, `HttpContractTest`, matriz admin, etc. (scripts procedurales, sin PHPUnit).

### Affected Areas

| Área | Archivos / specs | Por qué |
|------|------------------|---------|
| Sesión / D-009 | `AdminSessionAuth.php` (`state`/`authorize`), `index.php` (`/admin/auth/session`), `Config.php` | Touch `lastSeen` en GET session; TTL exactos; write_close |
| Auth gate | `AuthGate.php`, `requireAdmin` | GETs autorizados ya tocan `lastSeen`; regresión |
| Envelope / errores | `Response.php`, servicios admin, `index.php` | Consistencia data/meta; códigos 400/409 spot |
| Rate-limit login (D-004) | `AdminSessionAuth::allowLoginAttempt` | 429 vs falla de storage |
| Tests | `AdminSessionAuthTest`, `AdminAuthHttpTest` (+ opc. AuthPrivacy) | lastSeen + TTL + no PII |
| Specs | `admin-auth`, opc. `backend-contrato-api-certificados` | Idle 4 h; requisito lastSeen; envelope si hace falta |
| Fuera | archive U5, FE states, U7 seguridad profunda, U9 smokes staging | DEFER / locks |

### Inventory — gaps rankeados

| # | Gap | Severidad | Fix quirúrgico | DEFER |
|---|-----|-----------|----------------|-------|
| 1 | **D-009:** `state()` / `GET /admin/auth/session` no renueva `lastSeen` (solo `authorize`) | **P1** | Tras `sessionIsActive` OK: set `lastSeen=now`, `session_write_close()` (o helper compartido con authorize) | Repro staging con reloj → **U9**; política cookie/headers profunda → **U7** |
| 2 | **Drift TTL:** spec/docs dicen 30 min; código exige 14400/28800 | **P1** (contrato) | MODIFIED `admin-auth`: idle 4 h / absolute 8 h; nota en propose; docs backend pueden ir U6 mínimo o **U8** | No hacer TTL “configurable libre” (rompe fail-closed) |
| 3 | Verificar config staging real = 14400/28800 (si login funciona, ya es exacto) | Media | Checklist + evidencia sin secretos; no leer material privado | Confirmación operativa **U9** |
| 4 | **D-004:** storage rate-limit login fallido → 429 genérico | P2 (PLAN→U6) | Fail-open como público **o** 503/INTERNAL distinto de RATE_LIMITED; mensaje sin PII | Rediseño rate-limit / headers → **U7** |
| 5 | Códigos/mensajes 400/409 vs UI | Baja–Media | Spot: emisión 409, entrega `TOKEN_NOT_RECOVERABLE`, alumnos `CONFLICT`+details; solo si mensaje/código rompe FE | Unificar `mensajeErrorApi` FE; rediseño API |
| 6 | Envelope `data/meta` outliers | Baja | Smoke `HttpContractTest` + rutas admin ya cubiertas; arreglar solo desviaciones reales | Envelope v2 / paginación listados |
| 7 | `session_write_close` en rutas pesadas | Baja | Ya en `authorize`; reforzar si queda path que mantiene lock | — |
| 8 | PII en logs (muestreo) | Baja en U6 | Regresión tests privacy; no ampliar logging | Auditoría profunda logs/hosting → **U7** |
| 9 | CSRF / rate-limit público / path traversal / Secure cookies policy | — | **No tocar** salvo regresión | **U7** |
| 10 | Smokes idle 4 h en staging | — | **No tocar** | **U9** |
| 11 | Rotar keys / token permanente / archive U5 | — | **Prohibido** | — |

### Approaches

1. **Auditoría + fixes quirúrgicos (recomendado)** — Priorizar D-009 (`lastSeen` en `state`/GET session + tests), alinear spec `admin-auth` (30 min → 14400/28800), spot D-004 y 400/409 solo si hay mismatch FE, regresión PII/tests PHP del área. Sin rediseño de API.
   - Pros: cierra checklist U6; bajo riesgo; no toca semántica de token ni keys; aprovecha tests existentes.
   - Cons: no prueba staging real (U9); no cierra política de sesión “producto” completa (U7).
   - Effort: Low–Medium

2. **Rediseño de contrato API + catálogo unificado de errores** — Envelope v2, códigos tipados, mensajes i18n centralizados, rate-limit storage redesign.
   - Pros: consistencia a largo plazo.
   - Cons: alto blast radius FE+BE; viola hard lock; >400 líneas; solapa U7.
   - Effort: High

3. **Solo documentar + defer código a U7/U9** — Actualizar specs/docs sin tocar PHP.
   - Pros: cero regresión runtime.
   - Cons: no corrige gap `lastSeen` (P1 en código); no cierra PLAN §U6.
   - Effort: Low (no cumple objetivo)

### Recommendation

**Approach 1.** Orden sugerido para propose/design/tasks:

1. **D-009 código:** renovar `lastSeen` en `AdminSessionAuth::state()` (y write_close) para que `GET /admin/auth/session` y GETs vía `authorize` mantengan idle; tests unitarios + HTTP.
2. **D-009 contrato:** MODIFIED lean en `admin-auth` (idle 4 h / absolute 8 h + escenario lastSeen en lecturas auth); opcional ADDED mínimo si conviene separar requisito.
3. **D-004:** decisión fail-open o status distinto a 429 ante storage roto (bajo riesgo).
4. **Spot 400/409:** solo mismatches que rompan UI; no reescribir catálogo.
5. **Envelope/PII:** confirmar con tests existentes; no inventar logger nuevo.
6. **Docs:** mínimo necesario en propose; drift `docs/backend` puede ir en U6 (1 párrafo) o defer **U8**.

Specs lean:

- **Primario:** `admin-auth` — MODIFIED vigencia (4 h / 8 h) + escenario lastSeen en `GET /admin/auth/session` y GETs autorizados.
- **Secundario (si hace falta escenario de envelope/código):** `backend-contrato-api-certificados` — ADDED/MODIFIED mínimo (no reabrir emisión/revocación completa).

### Risks

- Scope creep a U7 (CSRF profundo, headers, rate-limit global, path traversal).
- Tocar `state()` mal y regenerar/destruir sesión o romper logout.
- Afirmar “config staging corta” sin evidencia: con igualdad estricta, idle ≠ 14400 implica login 401, no idle 30 min.
- Cambiar mensajes 400/409 que el FE ya overlaya → ruido visual o tests FE.
- Rotar accidentalmente token/PDF keys (prohibido).
- Reabrir archive U5.

### Ready for Proposal

**Yes** — hay gaps accionables (D-009 `lastSeen` + drift TTL en `admin-auth`), approach quirúrgico claro, DEFER explícito a U7/U9, y targets de spec lean. El orquestador puede lanzar `sdd-propose` para `audit-u06-backend` sin más aclaración de alcance.

---

## Resumen ejecutivo (orquestador)

| Campo | Valor |
|-------|--------|
| Path | `openspec/changes/audit-u06-backend/explore.md` |
| Top gaps | (1) `lastSeen` no se renueva en GET session; (2) drift 30 min vs 14400/28800 en spec/docs; (3) D-004 429 por storage; (4) spot 400/409 |
| Approach | Quirúrgico: touch lastSeen + alinear admin-auth + D-004 bajo riesgo + tests |
| DEFER | U7 seguridad/CSRF/headers/PII profundo; U9 repro staging; rediseño API; archive U5 |
| Spec targets | `admin-auth` (primario); `backend-contrato-api-certificados` (opcional lean) |
| Ready for propose? | **Yes** |
