# Exploration: P7-04 Seguridad/docs CI

## Current State

### CI workflow (`.github/workflows/backend-tests.yml`)
The existing CI has two jobs:
- `php-tests`: composer validate, composer audit, php -l, unit tests, MariaDB E2E, schema contract, upgrade test, privacy headers, PHP lint.
- `frontend-tests`: npm ci, test:ci, tsc --noEmit, build prod, build staging, mock guard.

**What is NOT present:**
- No gitleaks step or `.gitleaks.toml`.
- No secret scan.
- No `git diff --check` step.
- No link validation.
- No obsolete-term check.
- No OpenSpec active-cleanup check.

### Git hygiene
- `git diff --check` ran clean (no whitespace errors).
- No tracked secret files (`.env`, `.key`, `.pem`, `config.php`, `db.php`, `credentials.php`, `secrets.php`).
- `.gitignore` already blocks these patterns comprehensively.
- `material_privado_no_versionar/` exists locally, is gitignored, and is NOT tracked.

### OpenSpec active changes
Three folders in `openspec/changes/` are NOT in `archive/`:
- `m4-01a-backend-contrato-token-permanente-dni-fechas/` — archived as `2026-07-02-backend-emision-desde-asistencias` (actually m4-01a was archived on 2026-07-02).
- `m4-02-database-cursos-alumnos-asistencias/` — archived as `2026-07-02-database-cursos-alumnos-asistencias`.
- `p5-03-environments/` — archived as `2026-07-15-p5-03-environments`.

These active folders are **orphaned** (no `state.yaml`, superseded by dated archives). They should be moved/removed during P7-04.

### Internal links
- `docs/00-indice-general.md`: all referenced files exist. PASS.
- `docs/planificacion/IFTS14_PLAN_CORRECCIONES_PREPRODUCCION_SDD_TDD.md`: one **false-positive** broken link detected by a naive regex that captured a Python assertion string inside a fenced code block (`'verify' in row.lower()`). The actual prose links in the plan are all valid.

### Obsolete terms in active docs
The plan (section P2-02) defines these as obsolete and requires a CI gate to fail if they appear in active docs:

| Term | Found in active docs? | Location |
|---|---|---|
| SMTP | Yes (historical references, not active claims) | `docs/deploy/00-cpanel-certificados.md`, `docs/deploy/01-staging-cpanel-certificados.md`, `openspec/specs/deploy-cpanel-certificados/spec.md` (as "gate/stub", not active feature) |
| PHPMailer | Yes (historical references) | same deploy docs; `openspec/specs/admin-certificate-delivery/spec.md` (as REMOVED reason) |
| firma digital verificada | No in product code; Yes in specs as REMOVED reason | `openspec/specs/ui-cleanup/spec.md` (REQ-CLEAN-003) — this is the spec that *removes* it; acceptable. |
| reenvío automático | No in product code; Yes in specs as out-of-scope | `openspec/specs/backend-contrato-api-certificados/spec.md` (scenario name) — acceptable because it states it stays out of scope. |
| M4-01B | **Yes** — used as label in active docs | `docs/frontend/00-angular20-port-v0.md` line 436; `docs/backend/00-php84-api.md` line 129 |
| entregado | **Yes** — in public-validation UI copy | `apps/frontend-angular/src/app/features/public-validation/public-validation-page.html:256` — "último entregado por el instituto" |
| pendiente-entrega | **Yes** — in canonical spec | `openspec/specs/frontend-http-services/spec.md:174` — `envio` default `'pendiente-entrega'` |
| requiere-nueva-entrega | No | Not found in active code/docs. |

**Interpretation:**
- References to SMTP/PHPMailer in deploy docs are OK because they explicitly say "no SMTP/PHPMailer in MVP" and "SMTP de prueba/stub como gate".
- `M4-01B` label in `docs/frontend/00-angular20-port-v0.md` and `docs/backend/00-php84-api.md` is a **living doc reference** to a past cycle. The plan says to check if docs still reference it as if it were pending; these docs correctly say the D0 contract (M4-01A) is closed and M4-01B implementation is pending. That is still accurate.
- `pendiente-entrega` in `frontend-http-services/spec.md` is a spec that still prescribes the default value for a frontend model field. The plan says this should not exist. **This is a real gap.**
- `entregado` in `public-validation-page.html` is UI copy. The plan says the state "entregado" should not appear. **This is a real gap.**

## Affected Areas
- `.github/workflows/backend-tests.yml` — needs new job for security/docs gates.
- `openspec/changes/m4-01a-backend-contrato-token-permanente-dni-fechas/` — orphaned active folder.
- `openspec/changes/m4-02-database-cursos-alumnos-asistencias/` — orphaned active folder.
- `openspec/changes/p5-03-environments/` — orphaned active folder.
- `openspec/specs/frontend-http-services/spec.md` — contains obsolete `pendiente-entrega`.
- `apps/frontend-angular/src/app/features/public-validation/public-validation-page.html` — contains obsolete word "entregado".
- `docs/planificacion/IFTS14_PLAN_CORRECCIONES_PREPRODUCCION_SDD_TDD.md` — may need update to P7 row after this cycle closes.

## Approaches

1. **Add a new CI job `security-docs-gates`**
   - Pros: non-intrusive to existing jobs; can run in parallel; easy to extend.
   - Cons: adds ~30-60s to CI runtime.
   - Effort: Low

2. **Create standalone scripts and wire them into CI**
   - `scripts/ci-gitleaks.sh` (or use gitleaks action)
   - `scripts/ci-obsolete-terms.sh`
   - `scripts/ci-link-check.sh`
   - `scripts/ci-openspec-orphan-check.sh`
   - Pros: scripts are reusable locally; CI just calls them.
   - Cons: slightly more files.
   - Effort: Low

3. **Extend existing `php-tests` or `frontend-tests` job**
   - Pros: fewer jobs.
   - Cons: mixes unrelated concerns; harder to debug failures.
   - Effort: Low — but not recommended.

## Recommendation

Use **Approach 1 + 2**: add a new `security-docs-gates` job in `.github/workflows/backend-tests.yml` that runs in parallel with the others. The job will:
1. `git diff --check` (fail on whitespace errors).
2. Run gitleaks via `zricethezav/gitleaks-action@v2` (or install gitleaks CLI).
3. Verify no prohibited files are tracked (`git ls-files | grep -E ...` must be empty).
4. Run a local script `scripts/ci-obsolete-terms.sh` that greps active docs for forbidden terms and fails if any match (excluding `openspec/changes/archive/` and `docs/auditoria/`).
5. Run a local script `scripts/ci-link-check.sh` that validates internal markdown links.
6. Run a local script `scripts/ci-openspec-orphan-check.sh` that lists active change folders without a `state.yaml` and fails if any exist (or auto-moves them).

Also:
- Update `openspec/specs/frontend-http-services/spec.md` to remove `pendiente-entrega` default (or mark the field as removed).
- Update `public-validation-page.html` to replace "entregado" with neutral copy (e.g., "emitido" or "proporcionado").
- Move the three orphaned active folders to `archive/` or delete them if already archived.

## Risks
- **False positives in gitleaks**: the repo contains test tokens, fake credentials in tests, and `muestra_pagina/` mock data. Need a `.gitleaks.toml` allowlist for `apps/backend-php/tests/`, `muestra_pagina/`, and `apps/frontend-angular/src/environments/environment.ts` (demo key).
- **Term-check false positives**: specs legitimately mention "SMTP" or "PHPMailer" when documenting that they are OUT of scope. The script must use an allowlist or precise regex (e.g., fail only on affirmative claims like "SMTP activo", not on "no SMTP").
- **Orphaned OpenSpec folders**: moving them may break relative links inside them, but they are already archived under dated folders. Safe to delete active copies.

## Estimated scope
- Files touched: ~6-8 (workflow + 3 scripts + 2 doc fixes + OpenSpec cleanup).
- Lines changed: ~80-120 (mostly workflow YAML and script boilerplate).

## Ready for Proposal
**Yes.** The gaps are clear, the approach is straightforward, and the scope is small enough for a single SDD cycle without chained PRs.
