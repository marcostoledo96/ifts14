```yaml
schema: gentle-ai.verify-result/v1
evidence_revision: sha256:1cffb77fe621a41753a8d74bc7a7438b2b677cf9eb46095f60a7c5544c535a5e
verdict: pass_with_warnings
blockers: 0
critical_findings: 0
requirements: 2/2
scenarios: 7/8
test_command: bash scripts/test-privacy-headers.sh && docker run --rm -v "$PWD/apps/backend-php":/app -w /app ifts14-php84 sh -lc 'php -l src/AdminSessionAuth.php && php tests/AdminSessionAuthTest.php && php tests/AdminAuthHttpTest.php && php tests/AuthPrivacyTest.php'
test_exit_code: 0
test_output_hash: sha256:0788e02ab7a1315f975cbb51a8e190b866a9b05ca1aa32eb6b33bcc8d0d2daa3
build_command: docker run --rm -v "$PWD/apps/backend-php":/app -w /app ifts14-php84 sh -lc 'php -l src/AdminSessionAuth.php'; cd apps/frontend-angular && CHROME_BIN=.tmp/chrome-wrapper.sh npx ng test --include='**/__checks__/**' --no-watch --browsers=ChromeHeadless --no-progress
build_exit_code: 0
build_output_hash: sha256:e7e6e59b6de312ef335975450d1e268e6aa596ca9688aa52242a17f56804163d
```

## Verification Report

**Change**: audit-u07-seguridad
**Version**: delta MODIFIED `admin-auth` + ADDED `deploy-cpanel-certificados` — 2 requirements / 8 scenarios (Engram `sdd/audit-u07-seguridad/spec` #7610)
**Mode**: Standard (`strict_tdd: false` / `apply.tdd: false`)
**HEAD**: `613b3053da1d744ef2cc00aaa799c7d241aab7ad`
**Branch**: `audit/u07-seguridad`

### Completeness

| Metric | Value |
|--------|-------|
| Tasks total (Phase 1–4 + V.1) | 15 |
| Tasks complete | 15 |
| Tasks incomplete | 0 |
| Verify task V.1 | marked complete after this run |

Apply phases 1–4 were already `[x]`. V.1 was open pending this verify run.

### Build & Tests Execution

**Build / lint + FE checks**: ✅ Passed

```text
docker … php -l src/AdminSessionAuth.php
→ No syntax errors detected in src/AdminSessionAuth.php

cd apps/frontend-angular
CHROME_BIN=.tmp/chrome-wrapper.sh npx ng test --include='**/__checks__/**' --no-watch --browsers=ChromeHeadless --no-progress
→ TOTAL: 51 SUCCESS
exit 0
build_output_hash sha256:e7e6e59b6de312ef335975450d1e268e6aa596ca9688aa52242a17f56804163d
(components: php -l line + FE TOTAL line)
```

**Tests**: ✅ privacy gate + PHP auth suite green / ❌ 0 failed

```text
bash scripts/test-privacy-headers.sh
→ OK PrivacyHeadersTest
exit 0
privacy_out_hash sha256:f6cdebff3e621e0a5e1b30f42b5cd6e65360bb74adb3a6c3882f5af0a250b73b

docker run --rm -v "$PWD/apps/backend-php":/app -w /app ifts14-php84 sh -lc \
  'php -l src/AdminSessionAuth.php && php tests/AdminSessionAuthTest.php && php tests/AdminAuthHttpTest.php && php tests/AuthPrivacyTest.php'
→ No syntax errors detected in src/AdminSessionAuth.php
→ OK AdminSessionAuthTest
→ OK AdminAuthHttpTest
→ OK AuthPrivacyTest
exit 0
php_out_hash sha256:19e0e13aea291fb7c4ceb9915155e084ab75a1db80022d9d14d93fff65bbfdb1

combined test_output_hash (privacy stdout + php stdout as captured):
sha256:0788e02ab7a1315f975cbb51a8e190b866a9b05ca1aa32eb6b33bcc8d0d2daa3
```

**Coverage**: ➖ Not available (focused PHP scripts + Karma; no coverage threshold in change)

**Static deny order** (manual inspection, all API htaccess in privacy set):
- `apps/backend-php/.htaccess` — `RewriteRule ^(src|config)/` before `FallbackResource` ✅
- `deploy/staging/.htaccess-api` — deny before index routing ✅
- `deploy/cpanel/certificados_qa_smoke/api/.htaccess` — deny before FallbackResource ✅

### Spec Compliance Matrix

Source: Engram `sdd/audit-u07-seguridad/spec` (#7610) + deltas
`openspec/changes/audit-u07-seguridad/specs/admin-auth/spec.md`,
`openspec/changes/audit-u07-seguridad/specs/deploy-cpanel-certificados/spec.md`.

| Requirement | Scenario | Test | Result |
|-------------|----------|------|--------|
| Protección y vigencia de sesión | Idle y absoluto exactos | `AdminSessionAuthTest.php` > `sessionIsActive` idle 14400 / absolute 28800 boundaries | ✅ COMPLIANT |
| Protección y vigencia de sesión | Poll de session renueva idle | `AdminSessionAuthTest.php` > `state()` lastSeen touch + `AdminAuthHttpTest.php` > GET `/admin/auth/session` persists lastSeen | ✅ COMPLIANT |
| Protección y vigencia de sesión | GET autorizado renueva idle | `AdminSessionAuthTest.php` > `authorize(mutates=false)` lastSeen + write_close storage assert | ✅ COMPLIANT |
| Protección y vigencia de sesión | Configuración temporal inválida | `AdminSessionAuthTest.php` > TTL ≠ 14400/28800 → `settings()` null (fail-closed) | ✅ COMPLIANT |
| Protección y vigencia de sesión | Atributos fijos de cookie en login | `AdminSessionAuthTest.php` > settings path/secure/httponly/samesite; `AdminAuthHttpTest.php` > Set-Cookie HttpOnly/Secure/SameSite=Strict + path | ✅ COMPLIANT |
| Protección y vigencia de sesión | Cookie de sesión vs absoluto app-side | `AdminSessionAuthTest.php` > `lifetime===0` + `cookieOptions` sin `expires`; `absoluteSeconds===28800` | ✅ COMPLIANT |
| Deny de src\|config en `.htaccess` de API | Deny declarado antes del fallback | `scripts/test-privacy-headers.sh` RewriteRule+`[F]` on API htaccess set; source order deny → FallbackResource/index | ✅ COMPLIANT |
| Deny de src\|config en `.htaccess` de API | Acceso directo a src denegado | Static: `.htaccess` `[F,L]` + privacy gate ✅; live HTTP 403 on Apache/staging **DEFER U9** | ⚠️ PARTIAL |

**Compliance summary**: 7/8 scenarios COMPLIANT; 1/8 PARTIAL (static deny evidence present; live 403 deferred)

### Correctness (Static Evidence)

| Requirement | Status | Notes |
|------------|--------|-------|
| Protección y vigencia de sesión (D-009) | ✅ Implemented | Cookie lifetime=0 / no expires; TTL 14400/28800 locked; lastSeen touch on poll + authorized GET |
| Deny de src\|config en `.htaccess` de API | ✅ Implemented | App `.htaccess` Options -Indexes + RewriteEngine + deny src\|config/vendor/composer before FallbackResource; privacy script green |

### Coherence (Design)

| Decision | Followed? | Notes |
|----------|-----------|-------|
| RewriteRule `[F,L]` before FallbackResource (no RewriteCond migration) | ✅ Yes | App tree matches design target snippet |
| NO RewriteBase on app tree | ✅ Yes | Absolute FallbackResource retained |
| Vendor + composer deny additive | ✅ Yes | Present in app `.htaccess` |
| Options -Indexes | ✅ Yes | Present |
| D-009 docs paragraph | ✅ Yes | `docs/backend/00-php84-api.md` |
| Privacy gate grep deny | ✅ Yes | `test-privacy-headers.sh` asserts rule + `[F]` |
| cookieOptions reflection | ✅ Yes | AdminSessionAuthTest |
| Live HTTP 403 DEFER U9 | ✅ Yes | Explicit defer; not blocking verify |
| MUST NOT loosen TTL / U6 archive | ✅ Yes | Asserts still exact 14400/28800 |

### Issues Found

**CRITICAL**: None

**WARNING**:
1. Scenario **Acceso directo a src denegado** — live Apache HTTP 403 against staging `src/` not executed in this verify run (**DEFER U9**). Static gate (versioned `.htaccess` `[F,L]` + `scripts/test-privacy-headers.sh`) passed; not treated as CRITICAL per change contract.

**SUGGESTION**:
1. `scripts/test-privacy-headers.sh` asserts presence of `RewriteRule ^(src|config)/` + `[F]`, but does not assert textual order before `FallbackResource`. Order was confirmed by inspection on all three API htaccess files; a line-order assert would harden the gate.

### Verdict

**PASS WITH WARNINGS**

7/8 delta scenarios COMPLIANT with green privacy + PHP auth + FE `__checks__`; 1 PARTIAL (live HTTP 403 DEFER U9) with static deny evidence sufficient to avoid CRITICAL/UNTESTED.
