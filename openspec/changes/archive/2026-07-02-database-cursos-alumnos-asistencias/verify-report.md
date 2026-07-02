## Verification Report

**Change**: `database-cursos-alumnos-asistencias`  
**Project**: `ifts14`  
**Branch**: `database-cursos-alumnos-asistencias`  
**Mode**: Standard (`openspec/config.yaml` has `testing.strict_tdd: false`)  
**Artifact store**: OpenSpec + Engram  
**Verdict**: **PASS WITH WARNINGS**

### Executive summary

La migración `003_cursos_alumnos_asistencias.sql` coincide con spec/diseño y fue verificada en MariaDB 10.6 efímero con migraciones `001` + `002` + `003`, seed ficticio y aserciones de integridad. El seed es ficticio y seguro; la documentación refleja el modelo nuevo y declara explícitamente que no modifica PHP, Angular, API, PDF, auth ni datos reales. No hay archivos prohibidos en el diff/status actual.

El resultado queda con advertencias porque las tareas de `sdd-archive` siguen pendientes por diseño, el comando local configurado `php -l` no existe en este entorno y hubo reintentos de harness antes de la corrida MariaDB final exitosa.

### Completeness

| Metric | Value |
|---|---:|
| Tasks total | 17 |
| Tasks complete | 15 |
| Tasks incomplete | 2 |
| Incomplete implementation tasks | 0 |
| Incomplete archive/cleanup tasks | 2 (`5.1`, `5.2`) |

### Build & tests execution

| Check | Command / evidence | Result |
|---|---|---|
| Strict TDD mode | `openspec/config.yaml` → `testing.strict_tdd: false` | ✅ Standard verify |
| Configured local PHP lint | `php -l apps/backend-php/src/*.php` | ⚠️ Not available locally: `php: orden no encontrada` |
| Docker PHP lint, non-vendor target set | `docker run --rm ... ifts14-php84 sh -lc 'php -l ...'` over `src/`, `index.php`, `config/*.php`, `tests/*.php` | ✅ Passed, no syntax errors |
| MariaDB 10.6 DDL + seed | Docker MariaDB 10.6, explicit temp DB, apply `001`, `002`, `003`, then `database/seeds/002_cursos_alumnos_asistencias_demo.sql` | ✅ Passed |
| MariaDB assertions | `tables_cert_count_ok`, `alumnos_dni_secure_ok`, `curso_fecha_fk_ok`, `curso_fecha_order_unique_ok`, `asistencia_model_ok`, `duplicate_active_blocked_ok`, `absence_by_no_row_ok`, `soft_deleted_duplicate_allowed_ok`, `snapshot_stable_ok`, `config_single_row_check_exists_ok`, `seed_counts_ok` | ✅ All returned `1` |
| Docker cleanup | `docker ps -a --filter name=ifts14-m4-02-verify --format '{{.Names}}'` | ✅ No container remained |
| Coverage | No coverage runner configured | ➖ Not available |

#### MariaDB final evidence excerpt

```text
tables_cert_count_ok	1
alumnos_dni_secure_ok	1
curso_fecha_fk_ok	1
curso_fecha_order_unique_ok	1
asistencia_model_ok	1
duplicate_active_blocked_ok	1
absence_by_no_row_ok	1
soft_deleted_duplicate_allowed_ok	1
snapshot_stable_ok	1
config_single_row_check_exists_ok	1
seed_counts_ok	1
```

#### Diagnostic retries, not implementation failures

- A first MariaDB rerun using only `mariadb-admin ping` hit `ERROR 1049 (42000): Unknown database 'ifts14_verify'`; the final harness created the temp DB explicitly before applying migrations.
- A negative CHECK probe with `INSERT IGNORE id=2` failed with `ERROR 4025`, confirming MariaDB enforced `CHECK (id = 1)`; the final assertion records constraint existence without forcing a non-zero command.

### Spec compliance matrix

| Spec | Requirement / scenario | Runtime evidence | Result |
|---|---|---|---|
| `database-cursos-alumnos-asistencias` | Alumnos con DNI seguro / Persistencia sin DNI plano obligatorio | `alumnos_dni_secure_ok=1`; no `dni` plain column; seed inserts fictitious `dni_hash` + `dni_cifrado` | ✅ COMPLIANT |
| `database-cursos-alumnos-asistencias` | Cursos controlados / Curso disponible para fechas | `curso_fecha_fk_ok=1`; seed creates one course and two FK-backed dates | ✅ COMPLIANT |
| `database-cursos-alumnos-asistencias` | Fechas normalizadas / Orden estable de fechas | `curso_fecha_order_unique_ok=1`; unique `(curso_id, orden)` exists | ✅ COMPLIANT |
| `database-cursos-alumnos-asistencias` | Asistencias por fila / Presencia registrada | Seed creates three active `cert_asistencias`; `asistencia_model_ok=1` | ✅ COMPLIANT |
| `database-cursos-alumnos-asistencias` | Asistencias por fila / Ausencia sin fila | `absence_by_no_row_ok=1`; possible alumno-fecha pairs exceed active attendance rows | ✅ COMPLIANT |
| `database-cursos-alumnos-asistencias` | Asistencias por fila / Duplicado activo bloqueado | `duplicate_active_blocked_ok=1`; active count remains 3 | ✅ COMPLIANT |
| `database-cursos-alumnos-asistencias` | Corrección con soft-delete | `soft_deleted_duplicate_allowed_ok=1`; deleted duplicate allowed while active count remains 3 | ✅ COMPLIANT |
| `database-cursos-alumnos-asistencias` | Snapshot de fechas certificadas / Fecha viva cambia después de emitir | `snapshot_stable_ok=1`; live date changed, materialized snapshot stayed at original value | ✅ COMPLIANT |
| `database-cursos-alumnos-asistencias` | Configuración institucional / Ficticia y single-row | `config_single_row_check_exists_ok=1`; seed uses demo placeholders | ✅ COMPLIANT |
| `backend-modelo-datos-certificados` delta | Estado migrado actual vs modelo D0 futuro | `001` + `003` applied together; no PHP/API runtime diff in Git status | ✅ COMPLIANT |
| `backend-modelo-datos-certificados` delta | Tablas de cursos y asistencias migrables | `tables_cert_count_ok=1`; all new tables use `cert_`, InnoDB, utf8mb4, FKs/indices verified | ✅ COMPLIANT |
| `backend-modelo-datos-certificados` delta | No cambios de producto ni datos reales | Git status limited to docs, SQL, OpenSpec; static sensitive scans over DB SQL returned no DNI/IP/secret matches | ✅ COMPLIANT |
| `backend-modelo-datos-certificados` delta | Certificado vigente future DTO | Existing future API scenario was not implemented in this cycle; docs keep it as future/contract context and do not claim new runtime API behavior | ➖ OUT OF SCOPE, scope verified |

### Correctness: migration 003 vs design

| Design decision | Evidence | Status |
|---|---|---|
| Additive SQL-only migration over `001` + `002` | `003` creates only new `cert_` tables; no PHP/Angular/API/PDF files changed | ✅ Followed |
| `cert_alumnos` secure DNI model | `dni_hash BINARY(32)`, `dni_cifrado VARBINARY(512)`, `dni_mostrar VARCHAR(20) NULL`, unique `dni_hash` | ✅ Followed |
| Presence by row, no boolean `presente` | `cert_asistencias` has no `presente`; row existence and seed counts verify presence | ✅ Followed |
| One active attendance, deleted history allowed | Generated `asistencia_activa` + unique index; duplicate active blocked and soft-deleted duplicate allowed | ✅ Followed |
| Snapshot materialized dates | `cert_certificado_fechas` stores FK + `fecha`, `descripcion`, `orden`; snapshot stability verified after live update | ✅ Followed |
| Single-row institutional config | `CHECK (id = 1)` exists in MariaDB 10.6 | ✅ Followed |
| Rollback manual in inverse FK order | Header/footer in `003` documents prerequisite and inverse drops | ✅ Followed |

### Seed safety

| Check | Evidence | Status |
|---|---|---|
| Fictitious-only seed | Names are `Alumno Demo`, `Institución Demo`, placeholders like `DNI-FICTICIO-01` | ✅ Safe |
| No real DNI-like numbers in DB SQL | Grep `\b[0-9]{7,8}\b` under `database/*.sql` returned no matches | ✅ Safe |
| No IPv4-like values in DB SQL | Grep IPv4 pattern under `database/*.sql` returned no matches | ✅ Safe |
| No secret/private-key markers in DB SQL | Grep for password/API key/private-key/token-like secret markers under `database/*.sql` returned no matches | ✅ Safe |
| Existing seed 001 intact | `database/seeds/001_certificados_qr_demo.sql` remains tracked and unmodified | ✅ Safe |

### Documentation verification

| File | Verification | Status |
|---|---|---|
| `docs/database/00-mariadb.md` | Moves M4-02 tables into migrated model and lists `003` as additive migration | ✅ OK |
| `docs/database/01-modelo-datos-certificados.md` | Documents DNI secure model, row-presence attendance, generated active uniqueness, snapshot, `CHECK id=1`, seed and rollback | ✅ OK |
| Runtime/API claims | New docs explicitly say `003` does not modify PHP, Angular, API, PDF, auth or real data | ✅ OK |

### Forbidden paths and Git scope

Current status is limited to allowed paths:

```text
M  docs/database/00-mariadb.md
M  docs/database/01-modelo-datos-certificados.md
?? database/migrations/003_cursos_alumnos_asistencias.sql
?? database/seeds/002_cursos_alumnos_asistencias_demo.sql
?? openspec/changes/database-cursos-alumnos-asistencias/**
```

No staged files, commits, pushes, merges or rebases were performed. No forbidden paths are present in the current diff/status.

### Issues found

**CRITICAL**: None.

**WARNING**:
- `tasks.md` keeps Phase 5 archive tasks unchecked; this is expected before `sdd-archive` and should be closed in the next phase.
- The configured local build command cannot run because `php` is not installed on the host; Docker PHP lint passed as fallback.
- A broad exploratory Docker lint command read backend `vendor/` paths through the existing lint pattern before the final non-vendor lint was run. No forbidden path was modified, staged or included in Git status.

**SUGGESTION**:
- During `sdd-archive`, clarify the old wording in `docs/database/00-mariadb.md` that says `cert_certificados` has “referencia al alumno/curso”; today it stores display fields and `cert_certificado_fechas` links snapshots, while direct alumno/curso linkage remains a future cycle.

### Final verdict

**PASS WITH WARNINGS** — Core SQL/model/docs requirements are verified with runtime MariaDB evidence. Proceed to `sdd-archive` to promote specs and close the archive tasks.

### Return envelope fields

- `status`: `partial`
- `executive_summary`: Migration 003, fictitious seed and database docs satisfy the M4-02 specs/design with MariaDB 10.6 runtime evidence; warnings are limited to expected archive tasks and local tooling/process notes.
- `validations_run`: OpenSpec artifact review; Git status/diff scope; static sensitive scans over database SQL; Docker MariaDB 10.6 DDL+seed+assertions; Docker PHP lint fallback over non-vendor backend files.
- `requirements_verification`: All M4-02 database scenarios are compliant; future public DTO scenario remains out of implementation scope and was verified only as no-new-runtime-claim.
- `warnings_or_failures`: No critical failures; warnings listed above.
- `next_recommended`: `sdd-archive`.
- `skill_resolution`: `paths-injected` — loaded/used `sdd-verify`, `karpathy-guidelines`, `mariadb-features`, `systematic-debugging`; `strict-tdd-verify` not loaded because strict TDD is false.
