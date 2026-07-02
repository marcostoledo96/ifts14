# Archive Report — database-cursos-alumnos-asistencias

**Change**: `database-cursos-alumnos-asistencias`
**Project**: `ifts14`
**Branch**: `database-cursos-alumnos-asistencias`
**Archived**: 2026-07-02
**Mode**: Standard (`testing.strict_tdd: false`)
**Artifact store**: OpenSpec + Engram
**Verdict**: **ARCHIVED — PASS WITH WARNINGS (intentional, non-blocking)**

## Executive summary

SDD cycle closed. Delta specs promoted to canonical `openspec/specs/`, change folder moved to `openspec/changes/archive/2026-07-02-database-cursos-alumnos-asistencias/`. Core M4-02 model — `cert_alumnos`, `cert_cursos`, `cert_curso_fechas`, `cert_asistencias`, `cert_certificado_fechas`, `cert_configuracion_institucional` — was verified in MariaDB 10.6 (ephemeral Docker) with all assertions green. The cycle is intentionally archived with warnings, all of which were carried over from the verify report and are non-blocking.

## Quick path

1. Specs synced into `openspec/specs/`.
2. Change folder moved to `openspec/changes/archive/2026-07-02-…/`.
3. Source of truth updated for the data model.

## Specs synced

| Domain | Action | Details |
|---|---|---|
| `backend-modelo-datos-certificados` | Updated | MODIFIED requirement "Exposición pública definida y modelo D0 vs estado migrado" replaced; 4 old scenarios (Certificado vigente, Estado migrado, Tablas futuras, Asistencias diferido) superseded by 5 new scenarios (Certificado vigente, Estado migrado actual vs D0, Tablas migrables, Asistencias/snapshot, No cambios de producto). (Previously: …) annotation removed. All other requirements in the spec preserved verbatim. |
| `database-cursos-alumnos-asistencias` | Created | New full spec with 6 requirements (Alumnos DNI seguro, Cursos controlados, Fechas normalizadas, Asistencias por fila, Snapshot de fechas, Configuración institucional) and 7 scenarios. |

## Archive contents

| File | Size | Notes |
|---|---|---|
| `proposal.md` | 3.2K | ✅ present |
| `exploration.md` | 8.0K | ✅ present |
| `specs/backend-modelo-datos-certificados/spec.md` | — | ✅ delta merged into main |
| `specs/database-cursos-alumnos-asistencias/spec.md` | — | ✅ promoted to main |
| `design.md` | 5.4K | ✅ present |
| `tasks.md` | 3.8K | ✅ 17/17 tasks checked (Phase 5 archive tasks closed by `sdd-archive`) |
| `apply-progress.md` | 4.6K | ✅ present |
| `verify-report.md` | 10.4K | ✅ present |

## Source of truth updated

| Path | Change |
|---|---|
| `openspec/specs/backend-modelo-datos-certificados/spec.md` | MODIFIED — data-model requirement reflects M4-02 migrated state |
| `openspec/specs/database-cursos-alumnos-asistencias/spec.md` | CREATED — new canonical spec for the M4-02 domain |

## MariaDB evidence carried from verify-report

All 11 assertions returned `1` in the final harness:

```text
tables_cert_count_ok                1
alumnos_dni_secure_ok               1
curso_fecha_fk_ok                   1
curso_fecha_order_unique_ok         1
asistencia_model_ok                 1
duplicate_active_blocked_ok         1
absence_by_no_row_ok                1
soft_deleted_duplicate_allowed_ok   1
snapshot_stable_ok                  1
config_single_row_check_exists_ok   1
seed_counts_ok                      1
```

Harness: `docker run --rm --name ifts14-m4-02-verify -e MARIADB_ROOT_PASSWORD=verify_tmp -e MARIADB_DATABASE=ifts14_verify -d mariadb:10.6`. Container removed after assertions; no DB persisted. `001_certificados_qr.sql` + `002_token_cifrado_entrega_manual.sql` + `003_cursos_alumnos_asistencias.sql` + `database/seeds/002_cursos_alumnos_asistencias_demo.sql` applied in order without SQL errors.

## Warnings carried (intentional, non-blocking)

These warnings were explicitly approved by the orchestrator for archive:

| Warning | Status |
|---|---|
| `tasks.md` Phase 5 archive tasks unchecked at handoff | ✅ Closed in this archive run (tasks 5.1 and 5.2 marked complete; source-of-truth reconciliation reason recorded as the archive work itself) |
| Local `php -l` not installed on host (`php: orden no encontrada`) | ✅ Non-blocking: Docker PHP lint fallback passed over `src/`, `index.php`, `config/*.php`, `tests/*.php` |
| Broad exploratory Docker lint command read backend `vendor/` paths before final non-vendor lint | ✅ Non-blocking: no forbidden path was modified, staged, or included in Git status |
| Diagnostic retries during verify (MariaDB `Unknown database`; `CHECK (id = 1)` probe) | ✅ Non-blocking: final harness created the temp DB explicitly; CHECK existence recorded without forcing a non-zero command |

No CRITICAL issues. The verify report's verdict "PASS WITH WARNINGS" was preserved and explicitly approved by the orchestrator before archive.

## Git scope (unchanged from verify-report)

```text
M  docs/database/00-mariadb.md
M  docs/database/01-modelo-datos-certificados.md
M  openspec/specs/backend-modelo-datos-certificados/spec.md
?? database/migrations/003_cursos_alumnos_asistencias.sql
?? database/seeds/002_cursos_alumnos_asistencias_demo.sql
?? openspec/changes/archive/2026-07-02-database-cursos-alumnos-asistencias/
?? openspec/specs/database-cursos-alumnos-asistencias/
```

No `git add` / `commit` / `push` / `merge` / `rebase` performed. No forbidden paths in scope.

## Next steps

1. `backend-emision-desde-asistencias` (M4-04): wire `cert_certificados` ↔ `cert_alumnos` / `cert_cursos` and consume `cert_certificado_fechas` snapshot at emission.
2. `backend-contrato-token-permanente-dni-fechas` (M4-01B): expose DTO público with `attendedDates` and DNI completo (D0), once `token_cifrado` (002) is gate-verified.
3. `backend-pdf-qr-certificados` (M4-05): render snapshot dates into the PDF.
4. Apply `002` and `003` to the approved DB once operative access exists. No DB-side action should happen before that.

## Skill resolution

- `sdd-archive`: applied as the executor; no inline delegation.
- `cognitive-doc-design`: applied; report leads with outcome, uses tables and short sections.
- `karpathy-guidelines`: applied; surgical merge of one requirement, one new file, one mv.
- `ponytail`: applied; no new abstractions, stdlib `mv` instead of custom copy script.

## Return envelope

- `status`: `archived`
- `artifacts`:
  - `openspec/changes/archive/2026-07-02-database-cursos-alumnos-asistencias/`
  - `openspec/specs/database-cursos-alumnos-asistencias/spec.md` (new)
  - `openspec/specs/backend-modelo-datos-certificados/spec.md` (modified)
- `specs_synced`:
  - `database-cursos-alumnos-asistencias` (created)
  - `backend-modelo-datos-certificados` (modified — 1 requirement)
- `docs_updated`: none required by this archive run. `docs/database/00-mariadb.md` and `docs/database/01-modelo-datos-certificados.md` were updated by `sdd-apply` and remained current. `docs/00-indice-general.md` still lists the database area paths correctly; no path or area changes.
- `warnings_carried`: 4 (intentional, non-blocking; see table above)
- `next_steps`: see "Next steps" section.
- `skill_resolution`: see "Skill resolution" section.
