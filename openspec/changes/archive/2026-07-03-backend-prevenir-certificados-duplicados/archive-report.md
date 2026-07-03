# Archive Report — backend-prevenir-certificados-duplicados

**Change**: `backend-prevenir-certificados-duplicados`
**Project**: `ifts14`
**Branch**: `backend-prevenir-certificados-duplicados`
**Archived**: 2026-07-03
**Mode**: Standard (`testing.strict_tdd: false`)
**Artifact store**: OpenSpec + Engram (hybrid)
**Verdict**: **ARCHIVED — PASS** (no CRITICAL)
**Re-archive**: this run replaces the premature archive that still recorded the concurrent race as accepted/unresolved. The race is now closed by MariaDB constraint.

## Executive summary

The SDD cycle is closed and corrected. HIGH-02 — preventing a second active certificate for the same `alumno_id + curso_id` — is enforced by MariaDB constraint, not by service-only check:

- Migration `005_prevenir_certificados_duplicados.sql` adds a deterministic generated column `certificado_bloqueo_activo` (1 only when `estado='vigente' AND revocado_en IS NULL`, else NULL) and a unique key `uq_cert_certificados_alumno_curso_activo (alumno_id, curso_id, certificado_bloqueo_activo)`.
- The pre-`ALTER` preflight query (mandatory) is part of the migration file and must return 0 rows before the operator applies it.
- `AdminCertificateService::emitir()` retains the in-transaction early PHP guard (`assertNoActiveCertificateForPair()`) for UX/clarity and maps `PDOException 23000` from the unique index to `AdminCertificateException(409, 'CERTIFICATE_ALREADY_EXISTS', …)`.

The concurrent race is **not** accepted as unresolved. The DB unique index closes it; PHP mapping translates the DB rejection to the same `409` the service-only path already returned. Revocation and `estado='vencido'` free the slot; `vence_en` past with `estado='vigente'` keeps blocking by design.

## Quick path

1. Delta specs synced into `openspec/specs/admin-certificate-emission/spec.md` and `openspec/specs/backend-contrato-api-certificados/spec.md`.
2. Change folder moved to `openspec/changes/archive/2026-07-03-backend-prevenir-certificados-duplicados/`.
3. Source of truth updated for the emission domain and the admin contract.
4. `docs/backend/01-contrato-api-certificados.md` already updated during `sdd-apply` task 4.1 (error `409 CERTIFICATE_ALREADY_EXISTS` documented in POST `/admin/certificados` and the error envelope table).
5. `docs/deploy/00-cpanel-certificados.md` updated during this re-archive to add migration `005` to the "Gates operativos D0 previos al deploy" table with its preflight query.

## Specs synced

| Domain | Action | Details |
|---|---|---|
| `admin-certificate-emission` | Updated | ADDED requirement "Prevención de certificado vigente duplicado" — five scenarios: duplicate rejection, revocation freeing the slot, `estado='vencido'` freeing the slot, `vence_en` past with `estado='vigente'` still blocking, and legacy NULL FKs not blocking. The requirement text references the DB constraint and clarifies that `vence_en` alone does not free the slot. |
| `backend-contrato-api-certificados` | Updated | MODIFIED requirement "Contrato administrativo mínimo de certificados" — body now references `409 CERTIFICATE_ALREADY_EXISTS` for `POST /admin/certificados`; `(Previously: …)` annotation records the prior state. New scenario "Certificado vigente duplicado documentado" inserted after "Emisión desde asistencias documentada". All other scenarios preserved verbatim. |

## Archive contents

| File | Size | Notes |
|---|---|---|
| `proposal.md` | 3.2K | ✅ present — scope confined to HIGH-02; no frontend/email/regeneration/token rotation. |
| `exploration.md` | 13.6K | ✅ present — Approach 1 / Approach 2 analysis; Approach 1 (service-only) was blocked at pre-commit, Approach 2 (DB constraint) is what shipped. |
| `specs/admin-certificate-emission/spec.md` | 0.9K | ✅ delta merged into main |
| `specs/backend-contrato-api-certificados/spec.md` | 1.8K | ✅ delta merged into main |
| `design.md` | 4.5K | ✅ present — MariaDB `STORED` column + `UNIQUE(...)`, deterministic expression, no `CURRENT_DATE`; PHP guard + `23000` mapping. |
| `tasks.md` | 3.9K | ✅ 13/13 tasks checked (task 4.3 `sdd-archive` closed by the first archive run; the 4.3 line was the only checkbox re-stamped at that time, and the remaining work for this re-archive is reporting and doc sync, not implementation). |
| `verify.md` | 5.5K | ✅ present — PASS, no CRITICAL; both DB-backed suites green against MariaDB 10.6.27. |

## Source of truth updated

| Path | Change |
|---|---|
| `openspec/specs/admin-certificate-emission/spec.md` | ADDED — requirement "Prevención de certificado vigente duplicado" with five scenarios; `(Cambio: …)` annotation records the DB-constraint correction. |
| `openspec/specs/backend-contrato-api-certificados/spec.md` | MODIFIED — "Contrato administrativo mínimo de certificados" now documents `409 CERTIFICATE_ALREADY_EXISTS`; new scenario added. |
| `database/migrations/005_prevenir_certificados_duplicados.sql` | ADDED — preflight query + `certificado_bloqueo_activo STORED` + `uq_cert_certificados_alumno_curso_activo` + safe-rollback comment. |
| `database/docs/005-prevenir-certificados-duplicados.md` | ADDED — rule, preflight, rollback. |
| `docs/database/00-mariadb.md` | UPDATED — migration `005` listed in the migrations table with integrity rationale. |
| `docs/database/01-modelo-datos-certificados.md` | UPDATED — section explaining how migration `005` blocks the second active row. |
| `docs/backend/01-contrato-api-certificados.md` | UPDATED during `sdd-apply` 4.1 — `409 CERTIFICATE_ALREADY_EXISTS` row in error table; rule added in `POST /admin/certificados` description. |
| `docs/deploy/00-cpanel-certificados.md` | UPDATED during this re-archive — migration `005` row added to the "Gates operativos D0 previos al deploy" table with the mandatory preflight and verification SQL. |

## MariaDB evidence carried from verify-report

Migration `001`→`005` and both DB-backed test suites passed against MariaDB 10.6.27:

| Suite | Result |
|---|---|
| `database/migrations/001`→`005` | PASS — includes `005_prevenir_certificados_duplicados.sql` |
| `php apps/backend-php/tests/SnapshotEmissionTest.php` | `OK SnapshotEmissionTest` — constraint directly rejects duplicate; service returns 409; revoke and `estado='vencido'` free the slot; `vence_en` past with `estado='vigente'` keeps blocking; legacy with NULL FKs does not block. |
| `php apps/backend-php/tests/HttpEmissionE2eTest.php` | `OK HttpEmissionE2eTest` — second `POST` returns `409 CERTIFICATE_ALREADY_EXISTS`; revoke and `estado='vencido'` enable new emissions. |

`php -l` lint over `apps/backend-php/src/AdminCertificateService.php`, `tests/SnapshotEmissionTest.php`, `tests/HttpEmissionE2eTest.php` passed (Docker `ifts14-php84`). Full backend lint over `apps/backend-php/` also passed.

## Warnings carried (true warnings, not blockers)

1. **cPanel deploy gate — migration `005` + preflight is operator work, not automated**. The migration is committed and lint/tests pass locally, but production cPanel still requires: (a) backup approved, (b) preflight query returning 0 rows, (c) `ALTER TABLE` applied, (d) `SHOW INDEX FROM cert_certificados WHERE Key_name = 'uq_cert_certificados_alumno_curso_activo';` confirming the unique key. The cycle did not touch cPanel, `public_html`, the production DB, or any real configuration. The `docs/deploy/00-cpanel-certificados.md` "Gates operativos D0 previos al deploy" table now lists migration `005` alongside migration `002`. If duplicates are already present in production, the preflight will surface them and the migration MUST be paused until they are resolved — that is by design, not a defect.
2. **`openspec` CLI unavailable in this session; `gentle-ai 1.43.2` was the SDD dispatcher**. The archive was performed manually against the OpenSpec convention (`skills/_shared/openspec-convention.md`) and the shared status contract. No native `gentle-ai sdd-archive` invocation was used. Native status (`sdd-status` / `sdd-continue`) is not available for this change until the openspec CLI is restored in PATH.

## Legacy semantics (intentional, not a warning)

- `alumno_id` and `curso_id` are nullable in the unique index, so MariaDB allows multiple `NULL` rows. Legacy certificates without FKs do not block. The `admin-certificate-emission` spec scenario "Legacy sin alumno o curso no bloquea" pins this behaviour.
- `vence_en` is not part of the index. Date-only expiration does not free the slot. Freeing requires explicit `estado='vencido'` materialization or revocation. A separate SDD cycle would be required to add a state-maintenance job for automatic `vencido` transition; that is intentionally out of scope here.

## Out of scope (carried forward, not deferred from this cycle)

Per `proposal.md` and `design.md`:

- HIGH-03 (regeneración), HIGH-04 (auth real), HIGH-05 (gates deploy automation)
- MEDIUM-01..06, LOW-01..02
- Rate limiter, body size, `dni_hash_key` separado, rotación de token
- Email / SMTP / PHPMailer / reenvío
- Frontend Angular changes
- Job/mantenimiento automático de certificados vencidos por fecha

## Engram traceability

The Engram `sdd/backend-prevenir-certificados-duplicados/archive-report` observation has been overwritten by this re-archive with `topic_key` upsert, removing the stale "race accepted as unresolved" language and reflecting the DB constraint as the closure mechanism. Observation IDs for cross-referencing:

- proposal: `#4974`
- spec: `#4976`
- corrected design: `#4977`
- tasks: `#4981`
- apply-progress: `#4982`
- verify-report: `#4987`
- archive-report: `#4988` (overwritten by this run)

## SDD Cycle Complete

The change has been fully planned, implemented, verified, and archived. The HIGH-02 race is closed by MariaDB constraint. Ready for the next change.
