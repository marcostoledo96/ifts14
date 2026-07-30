# Exploración: audit-u07-seguridad

**Cambio:** `audit-u07-seguridad`
**Rama:** `audit/u07-seguridad` @ `613b305` (staging1.0 tip = merge PR #114 U6)
**Plan:** `docs/qa/PLAN-AUDITORIA-EXHAUSTIVA-STAGING-1.0.md` §U7
**Locks:** D0 token/QR permanente sin rotar · no rotar encryption keys · auth = sesión PHP + CSRF · `X-Admin-Key` solo CLI/smokes · DNI completo en UI OK; logs/errores/dumps sin DNI/token completos · archive U6 intacto bajo `openspec/changes/archive/2026-07-30-audit-u06-backend/` · sin commit
**Artifact store:** hybrid

---

## Exploration: Seguridad + PII (U7)

### Current State

Post-U6 el núcleo de sesión/TTL ya está cerrado en código + SoT canónica:

- **TTL:** idle `14400` / absolute `28800` exactos (`Config` + `AdminSessionAuth::sessionIsActive`); `state()` y `authorize()` renuevan `lastSeen` + `session_write_close`. Spec `admin-auth` ya lo exige y deja explícito que U7 posee profundidad de política de cookie/absoluto.
- **CSRF:** FE `csrf.interceptor.ts` inyecta `X-CSRF-Token` en POST/PUT/PATCH/DELETE + `withCredentials`; BE `AuthGate::requireHttpSession` → `authorize(..., mutates)` → `403 CSRF_INVALID`. Logout autenticado pasa por `requireAdmin` (exige CSRF). Tests: `csrf.interceptor.spec.ts`, `AdminAuthHttpTest`, `AuthGateTest`.
- **Cookies (código):** `fallbackSettings` fija `secure=true`, `httponly=true`, `samesite=Strict`, `lifetime=0` (cookie de sesión del navegador); path `/certificados/` o `/certificados_staging/`. `settings()` solo overlaya idle/absolute desde config (attrs de cookie **no** son configurables). `AdminAuthHttpTest` ya asserta `httponly` / `secure` / `samesite=strict` / path en `Set-Cookie`.
- **Rate-limit login:** `allowLoginAttempt` → `true` / `false` (≥5 en 300 s) / `null` (storage inutilizable). `index.php`: `null` → `503 SERVICE_UNAVAILABLE`; `false` → `429 RATE_LIMITED`. Tests HTTP cubren ambos. Rate-limit **público** (`RateLimiter`) sigue fail-open ante storage roto (diseño previo; distinto del login admin).
- **Headers API:** `Response::securityHeaders` (nosniff, SAMEORIGIN, `Referrer-Policy: no-referrer`, robots, CSP sandbox) + no-store. `.htaccess` de API en repo app solo robots + referrer.
- **Path / exposición:** plantilla canónica de staging `deploy/staging/.htaccess-api` y smoke `deploy/cpanel/certificados_qa_smoke/api/.htaccess` deniegan `src|config` (staging también `vendor`, composer, `.user.ini`). **`apps/backend-php/.htaccess` NO incluye `RewriteRule ^(src|config)/ - [F,L]`** — solo `FallbackResource` + headers. Con archivos reales presentes, Apache sirve `src/*.php` si no hay deny antes del fallback (riesgo de exposición de código).
- **PII:** login 401 sanitizado (`AuthPrivacyTest`); `error_log('ifts14_admin_session_start_failed')` sin credenciales; `TokenCipher` documenta no loguear token; UI admin `truncarUrl`; **no** hay SDK analytics/gtag en FE. Token en ruta pública `validar/:tokenCertificacion` es producto (QR), no analytics.
- **Checks FE:** `__checks__/no-secrets` + `no-real-data` en courses/students/attendances/certifications.
- **U6 archive:** presente e intacto (`openspec/changes/archive/2026-07-30-audit-u06-backend/`).

### Affected Areas

| Área | Archivos / specs | Por qué |
|------|------------------|---------|
| Path deny | `apps/backend-php/.htaccess` vs `deploy/staging/.htaccess-api` / smoke api | Alinear deny `src\|config` (+ vendor/composer si cabe) |
| Cookie policy | `AdminSessionAuth` (`cookieOptions`/`fallbackSettings`), `admin-auth`, `docs/backend/00-php84-api.md` | Documentar profundidad: attrs fijos, `lifetime=0` vs absolute app-side; no aflojar TTL |
| CSRF | `csrf.interceptor.ts`, `AuthGate`, `index.php` logout, tests | Regresión / checklist; sin rediseño |
| Rate-limit login | `allowLoginAttempt`, `index.php`, `AdminAuthHttpTest` / `AdminSessionAuthTest` | Confirmar 429 real + 503; gaps residuales |
| Headers | `Response.php`, `.htaccess` API/SPA, `scripts/test-privacy-headers.sh` | Spot; opcional reforzar check de deny |
| PII | `AuthPrivacyTest`, logs, `truncarUrl`, rutas públicas | Regresión; no inventar logger |
| Checks | `__checks__/no-secrets` / `no-real-data` | Verificar verdes en apply/verify |
| Fuera | archive U6, U8 docs amplios, U9 repro idle staging, fail-open público, HSTS CDN | DEFER / locks |

### Inventory — gaps rankeados

| # | Gap | Severidad | Evidencia | Fix quirúrgico | DEFER |
|---|-----|-----------|-----------|----------------|-------|
| 1 | **`apps/backend-php/.htaccess` sin deny `src\|config`** (drift vs plantilla staging/smoke/docs) | **P0–P1** | App: solo `FallbackResource`; staging: `RewriteRule ^(src\|config)/ - [F,L]` (+ vendor/composer); docs deploy §API | Copiar/alinear reglas de deny canónicas al `.htaccess` del árbol app (y smoke si divergiera); `Options -Indexes` si falta | Repro HTTP en staging real → **U9** |
| 2 | **D-009 política cookie/absoluto — profundidad documental + asserts** | **P1** | Código OK + test cookie attrs; spec dice «U7 no rediseña» pero PLAN pide documentada y aplicada; `lifetime=0` vs absolute 28800 app-side poco explícito fuera de código | MODIFIED lean `admin-auth` (política cookie: Secure/HttpOnly/SameSite=Strict, path por entorno, session cookie + absolute app-side; **MUST NOT** aflojar 14400/28800 sin evidencia); 1 párrafo docs backend; no tocar TTL | Idle ~30 min staging con reloj → **U9** |
| 3 | Gate de privacidad htaccess **no valida deny `src/`** | **P2** | `scripts/test-privacy-headers.sh` solo robots/referrer | Extender check a presencia de `RewriteRule` deny en plantillas API versionadas | — |
| 4 | CSRF: cobertura existente; riesgo solo de regresión | Baja (OK) | Interceptor + AuthGate + logout CSRF en `AdminAuthHttpTest` | Solo regresión en verify; no reescribir | — |
| 5 | Rate-limit login 429/503 ya cableados; gap residual = público fail-open + FE 503 genérico | Baja–P2 | `index.php` 102–109; tests 503/429; `RateLimiter` fail-open | Confirmar tests verdes; **no** rediseñar público | Rate-limit distribuido / fail-open público |
| 6 | PII en analytics/URLs: sin analytics; token en URL pública es diseño | Baja (OK) | Sin gtag; `truncarUrl`; `Referrer-Policy: no-referrer` | Spot AuthPrivacy + no introducir trackers; no rotar tokens | Telemetría futura |
| 7 | `__checks__/no-secrets` / `no-real-data` | Baja (verify) | 8 specs en 4 features | Ejecutar en apply/verify; arreglar solo fallos reales | — |
| 8 | Headers HSTS / CSP SPA | — | API ya CSP sandbox; SPA distinta | **No** inventar HSTS en app sin hosting | CDN/cPanel / **U8** |
| 9 | Docs Git/staging1.0 / índice | — | PLAN §U8 | **No tocar** | **U8** |
| 10 | Repro idle 30 min staging | — | D-009 histórico | **No tocar** | **U9** |
| 11 | Rotar keys / token / archive U6 | — | Locks | **Prohibido** | — |

### Ya OK (no reabrir salvo regresión)

- CSRF FE↔BE en mutaciones admin + logout autenticado.
- Rate-limit login: umbral real → `429`; storage → `503 ≠ 429` (U6).
- TTL idle/absolute + renovación `lastSeen` en `state`/`authorize` (U6).
- Cookie attrs Secure/HttpOnly/SameSite=Strict assertados en `AdminAuthHttpTest`.
- Auth HTTP no usa `X-Admin-Key`; CLI legacy opt-in.
- PII básica en login/errores (`AuthPrivacyTest`); sin SDKs analytics.
- Plantilla staging API con bloqueo `src|config|vendor` (si el deploy usa esa plantilla).

### Approaches

1. **Auditoría + fixes quirúrgicos (recomendado)** — (A) alinear `apps/backend-php/.htaccess` al deny canónico de staging/docs; (B) documentar política de sesión/cookie en `admin-auth` (+ párrafo backend) **sin** aflojar TTL; (C) reforzar check privacy/deny; (D) regresión CSRF/rate-limit/PII/tests PHP + `__checks__` FE. Sin rediseño auth ni rate-limit público.
   - Pros: cierra checklist U7; bajo blast radius; respeta locks U6/D0.
   - Cons: no prueba idle en staging (U9); no cierra docs Git (U8).
   - Effort: Low–Medium (~4–10 archivos)

2. **Hardening amplio (HSTS, CSP SPA, rate-limit redistribuido, logger PII central)** — Rediseño transversal FE+BE+hosting.
   - Pros: superficie más “enterprise”.
   - Cons: alto blast radius; >400 líneas; viola hard lock; solapa U8/U9.
   - Effort: High

3. **Solo documentar + defer código** — Specs/docs sin tocar `.htaccess`.
   - Pros: cero regresión runtime.
   - Cons: deja drift P0–P1 de exposición `src/` en el árbol app.
   - Effort: Low (no cumple objetivo)

### Recommendation

**Approach 1.** Orden sugerido para propose/design/tasks:

1. **Path deny:** alinear `apps/backend-php/.htaccess` con reglas de `deploy/staging/.htaccess-api` / docs (`src|config`; valorar `vendor` + `composer.*` + `Options -Indexes`) manteniendo fallback a `index.php` y headers de privacidad.
2. **D-009 cookie policy depth:** MODIFIED lean en `admin-auth` documentando attrs fijos + cookie de sesión (`lifetime=0`) + absolute 8 h app-side + path por entorno; **MUST NOT** cambiar 14400/28800; párrafo mínimo en `docs/backend/00-php84-api.md` si hace falta.
3. **Gate:** extender `scripts/test-privacy-headers.sh` (o test mínimo) para exigir deny `src`/`config` en htaccess API versionados.
4. **Regresión:** CSRF + 429/503 login + cookie attrs + `AuthPrivacyTest`; FE `__checks__` no-secrets/no-real-data.
5. **No tocar:** TTL numéricos, keys, token permanente, archive U6, rate-limit público fail-open, smokes idle staging.

Specs lean:

- **Primario:** `admin-auth` — MODIFIED política cookie/sesión (profundidad U7; sin cambiar TTL).
- **Secundario (si hace falta escenario de deny):** `deploy-cpanel-certificados` — ADDED/MODIFIED mínimo “API `.htaccess` MUST denegar `src|config`” alineado a docs ya existentes.
- Opcional: nota en `security-docs-ci-gates` solo si se agrega check CI; preferir script local ya cableado.

### Risks

- Alinear `.htaccess` mal y romper fallback API en local/embebido PHP (sin Apache).
- Copiar reglas `RewriteBase` de staging a app sin adaptar path `/certificados/api/`.
- Scope creep a HSTS/CSP SPA / rediseño rate-limit.
- Aflojar `Secure` para HTTP local (prohibido sin evidencia; staging/prod son HTTPS).
- Reabrir archive U6 o cambiar TTL “por si acaso”.
- Tratar token en URL pública como bug y rotar QR (viola D0).

### Ready for Proposal

**Yes** — gap accionable principal (deny `src/` en htaccess del árbol app), política cookie documentable sin tocar TTL, regresiones claras, DEFER explícito a U8/U9. El orquestador puede lanzar `sdd-propose` para `audit-u07-seguridad`.

---

## Resumen ejecutivo (orquestador)

| Campo | Valor |
|-------|--------|
| Path | `openspec/changes/audit-u07-seguridad/explore.md` |
| Top gaps | (1) htaccess app sin deny `src\|config`; (2) política cookie/absoluto a documentar en profundidad; (3) privacy script sin check deny; (4–7) CSRF/429/PII/checks ya OK → regresión |
| Approach 1 | Quirúrgico: deny htaccess + docs/spec cookie policy + gate deny + regresiones CSRF/rate/PII/checks |
| Files estimate | ~4–10 |
| DEFER | U8 docs Git/índice; U9 repro idle staging; rate-limit público fail-open; HSTS CDN; telemetría |
| Spec targets | `admin-auth` (primario); `deploy-cpanel-certificados` (opcional lean) |
| Blockers | Ninguno para propose |
| Ready for propose? | **Yes** |
