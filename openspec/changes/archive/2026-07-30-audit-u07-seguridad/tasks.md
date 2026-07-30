# Tasks: audit-u07-seguridad — Seguridad + PII (U7)

## Review Workload Forecast

| Field | Value |
|-------|-------|
| Estimated changed lines | ~60–150 (htaccess + privacy script + cookie reflection test + 1 doc ¶) |
| 400-line budget risk | Low |
| Chained PRs recommended | No |
| Suggested split | PR único (`size:exception`) |
| Delivery strategy | exception-ok |
| Chain strategy | size-exception |

Decision needed before apply: No
Chained PRs recommended: No
Chain strategy: size-exception
400-line budget risk: Low

### Suggested Work Units

| Unit | Goal | Likely PR | Focused test command | Runtime harness | Rollback boundary |
|------|------|-----------|----------------------|-----------------|-------------------|
| 1 | Deny htaccess app + privacy gate + D-009 docs + cookie reflection + PLAN §U7 | PR único (`audit/u07-seguridad`) | `bash scripts/test-privacy-headers.sh` && `docker run --rm -v "$PWD/apps/backend-php":/app -w /app ifts14-php84 sh -lc 'php tests/AdminSessionAuthTest.php && php tests/AdminAuthHttpTest.php && php tests/AuthPrivacyTest.php'` | Staging HTTP 403 `src/` DEFER U9; local privacy grep + PHP auth suite | Revert `.htaccess` + `test-privacy-headers.sh` + `AdminSessionAuthTest` + `docs/backend/00-php84-api.md` + PLAN §U7; leave U6 archive |

**TDD**: `apply.tdd: false`. RED→GREEN liviano: privacy deny grep + cookieOptions reflection si falta. Threat: Apache path deny → privacy script; VCS/shell N/A.

**Locks**: Deny `RewriteEngine On` + `^(src|config)/` + `vendor/` + `composer.(json|lock)` **antes** de `FallbackResource`; **NO** `RewriteBase` en app tree; MUST NOT aflojar TTL 14400/28800 ni `Secure`; U6 archive intacto; no keys/token/QR; **no commit**.

**Apply**: `size-exception` / single PR. Specs delta ya escritos. Ready for **sdd-apply**.

## Phase 1: RED — Cookie reflection + privacy deny

- [x] 1.1 RED `apps/backend-php/tests/AdminSessionAuthTest.php` — reflection `cookieOptions`: path/secure/httponly/samesite; sin `expires`; lifetime=0; TTL 14400/28800 intactos [D-009 / admin-auth]
- [x] 1.2 RED `scripts/test-privacy-headers.sh` — exigir `RewriteRule ^(src|config)/` + `[F` en htaccess API listados (app + staging + smoke); **debe fallar** hoy en `apps/backend-php/.htaccess` [deploy deny]

## Phase 2: GREEN — htaccess + docs D-009

- [x] 2.1 `apps/backend-php/.htaccess` — `Options -Indexes`; `RewriteEngine On`; deny `src|config`, `vendor/`, `composer.(json|lock)` `[F,L]` **antes** de `FallbackResource /certificados/api/index.php`; sin RewriteBase; Header block intacto
- [x] 2.2 `docs/backend/00-php84-api.md` — 1 ¶ D-009: lifetime=0 vs absolute 28800; attrs fijos; cross-link deploy §API htaccess; **no** tocar números TTL
- [x] 2.3 GREEN — reflection 1.1 pasa; confirmar `deploy/staging/.htaccess-api` + smoke api ya deniegan (verify-only; editar solo si drift)

## Phase 3: Privacy gate + PLAN §U7

- [x] 3.1 GREEN privacy script — deny assert verde en todos los htaccess API del set [Phase 1.2]
- [x] 3.2 `docs/qa/PLAN-AUDITORIA-EXHAUSTIVA-STAGING-1.0.md` §U7 — marcar checklist: CSRF, rate-limit, D-009, deny `src/`, headers/cookies, PII, `__checks__` (según evidencia apply)
- [x] 3.3 Confirmar deltas `openspec/changes/audit-u07-seguridad/specs/{admin-auth,deploy-cpanel-certificados}/spec.md` alineados; no tocar archive U6

## Phase 4: Regresiones

- [x] 4.1 PHP: `php tests/AdminSessionAuthTest.php && php tests/AdminAuthHttpTest.php && php tests/AuthPrivacyTest.php` (cwd `apps/backend-php` o docker Unit 1) — CSRF/429/503/cookie attrs/PII
- [x] 4.2 FE: `ng test --watch=false --browsers=ChromeHeadless --include='**/__checks__/**'` en `apps/frontend-angular` (no-secrets + no-real-data)
- [x] 4.3 `bash scripts/test-privacy-headers.sh` verde; `php -l` archivos PHP tocados si hubo edits
- [x] 4.4 Locks: U6 archive intacto; TTL/keys/token sin tocar; **no commit**
- [x] 4.5 Prep `verify-report.md` → **sdd-verify**

## Verify (sdd-verify)

- [x] V.1 Focused Unit 1 + privacy script + FE `__checks__` → `verify-report.md` (deltas admin-auth + deploy deny + PLAN §U7); HTTP 403 live DEFER U9
