# Design: audit-u07-seguridad

## Technical Approach

Approach 1 (quirúrgico): alinear el `.htaccess` del árbol app al contrato deny de deploy/staging **sin** migrar a RewriteCond/`!-f`/`!-d`; documentar profundidad D-009 cookie vs absolute; gate textual en `test-privacy-headers.sh`; regresiones CSRF/429/503/PII/`__checks__`. Specs delta (sdd-spec, paralelo) desde proposal: MODIFIED lean `admin-auth` + `deploy-cpanel-certificados`. `apply.tdd: false` (Standard). Single PR size-exception. Sin commit en design.

## Architecture Decisions

| Decision | Options | Tradeoff | Choice |
|----------|---------|----------|--------|
| Deny placement | A) RewriteRule `[F,L]` antes de `FallbackResource` B) Migrar a staging RewriteCond+`index.php` | B rompe patrón app/prod doc; A cierra exposición de archivos reales | **A** + `RewriteEngine On` |
| RewriteBase (app tree) | A) Sin RewriteBase B) `/certificados/api/` C) Copiar staging | B/C rompen si el docroot relativo difiere; deny `^` es per-dir | **A** — sin RewriteBase; conservar `FallbackResource /certificados/api/index.php` |
| Vendor/composer deny | A) Incluir como staging B) Solo `src\|config` C) DEFER | A low-risk additive; smoke omitió vendor | **A** — `vendor/` + `composer.(json\|lock)`; **DEFER** `AddHandler`, `.user.ini`, SetEnv |
| Options -Indexes | A) Incluir (doc deploy) B) Omitir | Bajo riesgo | **A** |
| Cookie D-009 docs | A) Párrafo en `00-php84-api.md` B) Solo spec C) Ambos | Código ya OK | **A+C** — párrafo + MODIFIED spec; **MUST NOT** tocar 14400/28800 ni aflojar Secure |
| Privacy gate | A) Assert deny en script B) Solo CI smoke HTTP | Script ya lista htaccess API | **A** — grep `RewriteRule ^(src\|config)/` + `[F` en htaccess API versionados (app + staging + smoke) |
| cookieOptions unit | A) Reflection en AdminSessionAuthTest B) Solo HTTP Set-Cookie | settings() ya cubre attrs; cookieOptions privado sin `expires` | **A** si falta assert explícito de opciones sin `expires`; mantener HTTP attrs |
| Vendor DEFER residual | — | Hosting-only rules | Documentar DEFER: PHP handler ea-php84, `.user.ini` deny (solo plantilla staging) |

## Data Flow

```
HTTP …/api/src/*  ──→  RewriteRule ^(src|config)/ [F,L]  ──→  403
HTTP …/api/vendor/* ──→  RewriteRule ^vendor/ [F,L]       ──→  403
HTTP …/api/<ruta>   ──→  FallbackResource → index.php     ──→  API
Cookie Set-Cookie   ──→  lifetime=0 (sesión navegador)
App TTL             ──→  idle 14400 / absolute 28800 (sessionIsActive)
```

## File Changes

| File | Action | Description |
|------|--------|-------------|
| `apps/backend-php/.htaccess` | Modify | `Options -Indexes`; `RewriteEngine On`; deny `src\|config`, `vendor/`, `composer.(json\|lock)` **antes** de `FallbackResource`; conservar Header block |
| `docs/backend/00-php84-api.md` | Modify | 1 párrafo D-009: lifetime=0 vs absolute 28800; attrs fijos; cross-link `docs/deploy/00-cpanel-certificados.md` §API htaccess |
| `scripts/test-privacy-headers.sh` | Modify | Exigir deny `src\|config` `[F` en htaccess API listados |
| `apps/backend-php/tests/AdminSessionAuthTest.php` | Modify | Assert cookieOptions (reflection): path/secure/httponly/samesite; sin `expires` |
| `openspec/changes/.../specs/admin-auth/spec.md` | Create* | MODIFIED política cookie/absoluto (*sdd-spec) |
| `openspec/changes/.../specs/deploy-cpanel-certificados/spec.md` | Create* | MODIFIED/ADDED deny API htaccess (*sdd-spec) |
| `deploy/staging/.htaccess-api` / smoke api | Verify only | Ya deniegan; no editar salvo drift |
| Archive U6 / TTL / keys / token QR | — | **Prohibido** |

Target app `.htaccess` (no-obvio):

```apache
Options -Indexes
RewriteEngine On
RewriteRule ^(src|config)/ - [F,L]
RewriteRule ^vendor/ - [F,L]
RewriteRule ^composer\.(json|lock)$ - [F,L]
FallbackResource /certificados/api/index.php
# Header block existing unchanged
```

## Interfaces / Contracts

- Deny: URI bajo `src/` o `config/` → **403 Forbidden** (Apache `[F]`), sin servir `.php` existente.
- Cookie: `lifetime=0` → session cookie; absolute **solo** app-side vía `createdAt`+28800; attrs no configurables vía `settings()` overlay.
- Privacy script: exit ≠0 si falta deny en cualquier htaccess API del set.

## Testing Strategy

| Layer | What | Approach |
|-------|------|----------|
| Unit | cookieOptions attrs + lifetime=0 / TTL 14400/28800 | Extender `AdminSessionAuthTest`; no aflojar asserts |
| HTTP | Set-Cookie Secure/HttpOnly/SameSite; CSRF 403; login 429/503 | Regresión `AdminAuthHttpTest` / AuthGate |
| Privacy | Deny textual en htaccess | `scripts/test-privacy-headers.sh` |
| PII / FE | AuthPrivacy; no-secrets/no-real-data | `AuthPrivacyTest`; `__checks__` focused |
| E2E staging HTTP 403 src/ | — | **DEFER U9** |

## Threat Matrix

Filas del matrix VCS/shell (`references/threat-matrix.md`): **N/A** — sin automatización git/PR/shell ejecutable.

| Boundary | Applicability | Design response | Planned check |
|----------|---------------|-----------------|---------------|
| Apache path deny (`src\|config\|vendor`) | Applicable | `[F,L]` antes de FallbackResource; sin RewriteBase en app | Privacy script grep; manual doc contract |
| Docs-like / git / commit / push / PR | N/A | — | — |

## Migration / Rollout

Sin migración DB. Deploy: al subir API, el `.htaccess` del paquete app ya incluye deny (reduce drift si no se copia solo la plantilla staging). Rollback: restaurar `.htaccess` previo + script/docs. PHP built-in server **no** aplica estas reglas (doc existente).

## Open Questions

- [x] Vendor deny → **incluir** (staging + low risk); hosting-only → DEFER
- [x] FallbackResource vs RewriteCond → **conservar** FallbackResource + deny delante
- [x] Éxito sin U9 → **sí**
- [ ] Ninguno bloqueante
