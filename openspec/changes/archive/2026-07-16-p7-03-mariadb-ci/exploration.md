## Exploration: P7-03 MariaDB CI

### Current State
The `php-tests` CI job (`.github/workflows/backend-tests.yml`) runs a MariaDB 10.6 service container. E2E tests (lines 73-98) execute 11 scripts sequentially. Each test with DB dependency uses an early-exit SKIP pattern (echo + return) when env vars are missing. The job passes env vars (DSN, user, pass, ALLOW_RESET), so in CI they execute; locally without env vars they SKIP silently. The plan P7-03 explicitly says: *"El E2E no puede hacer SKIP en este job."*

### Affected Areas
- `.github/workflows/backend-tests.yml` — needs migration step, schema contract, and removal of SKIP behavior
- `apps/backend-php/tests/*` — tests use SKIP pattern; need hard-fail in CI
- `scripts/test-database-schema-contract.sh` — exists but NOT wired into CI workflow
- `scripts/test-database-upgrade.sh` — exists but NOT wired into CI workflow
- `database/migrations/` — 10 migrations; E2E tests apply them inline individually, no unified step

### Current E2E Coverage mapped to P7-03 requirements
| Test | P7-03 requirement | SKIP pattern? | Real MariaDB? |
|---|---|---|---|
| SnapshotEmissionTest | E2E emision, PDF stale, URL/QR permanente, revocacion | YES (lines 13-15) | YES |
| HttpEmissionE2eTest | E2E emision, modificacion de asistencias, URL/QR permanente, PDF stale, revocacion | YES (lines 12-14) | YES |
| AdminMasterDataHttpTest | master data CRUD via HTTP | YES | YES |
| AdminCertificadosConsultaHttpTest | cert listing/consulta | YES | YES |
| ReadinessTest | readiness checks (no DB needed) | NO (no DB dep) | NO |
| CertificateRevisionMigrationTest | upgrade tests (migrations 007->008->010), schema contract | YES | YES |
| AttendanceRevisionTest | modificacion de asistencias | YES | YES |
| CourseDateRevisionTest | course date revisions | YES | YES |
| QrImageTest | URL/QR permanente | NO (Fake PDO, unit) | NO |
| RegenerarPdfTest | PDF stale/regeneration | NO (Fake PDO, unit) | NO |
| fault-injection-audit | fault injection (needs demo config) | NO (no env SKIP) | YES |

### Migration workflow
- **No unified migration step in CI.** Each E2E test (`SnapshotEmissionTest`, `HttpEmissionE2eTest`, `AdminMasterDataHttpTest`, `AdminCertificadosConsultaHttpTest`, `AttendanceRevisionTest`, `CourseDateRevisionTest`) individually applies migrations via `applySqlFile()` inline. `CertificateRevisionMigrationTest` applies migrations up to 007, inserts legacy data, then applies 008+.
- **Migrations 009 and 010 are applied by some tests but not all.** `SnapshotEmissionTest` applies up to 009; `HttpEmissionE2eTest` applies up to 009; `CertificateRevisionMigrationTest` tests 010 backfill.

### Schema contract
- **Script exists:** `scripts/test-database-schema-contract.sh` (80 lines). Tests 5 schema assertions on a disposable MariaDB container: `archivado` enum, nullable institutional config, nullable description, unique attendance constraint, schema_migrations registry.
- **NOT wired into CI.** The script is local-only (uses docker exec with hardcoded container name). It does not run in `.github/workflows/backend-tests.yml`.
- **No schema contract test in the PHPUnit-like test suite.** `CertificateRevisionMigrationTest` verifies column existence after migration 008 and backfill in 010, which partially covers schema contract but is focused on upgrade, not contract enforcement.

### Gaps vs. P7-03 spec
1. **Migrations in CI:** No step runs all migrations before tests; each test repeats inline application.
2. **Schema contract:** Script exists but not in CI; no PHP test enforces schema contract.
3. **URL/QR permanente:** Covered by `SnapshotEmissionTest` and `HttpEmissionE2eTest` (token snapshot verification). `QrImageTest` is unit with Fake PDO, not E2E MariaDB.
4. **PDF stale:** Covered by `HttpEmissionE2eTest` (409 PDF_OUTDATED after attendance deletion) and `AttendanceRevisionTest` (pdf_estado='desactualizado'). `RegenerarPdfTest` is unit with Fake PDO.
5. **Revocacion:** Covered by `HttpEmissionE2eTest` (POST /revocar, then re-emision) and `SnapshotEmissionTest` (UPDATE estado='revocado').
6. **Upgrade tests:** `CertificateRevisionMigrationTest` covers 007->008->010 migration path and backfill. `test-database-upgrade.sh` exists but is NOT in CI.
7. **SKIP detection:** ALL 8 DB-dependent E2E tests have SKIP. In CI they run because env vars are present, but the SKIP pattern itself violates P7-03 requirement.

### SKIP detection
Tests with SKIP (return instead of failure) when env vars missing:
- `SnapshotEmissionTest` lines 13-15
- `HttpEmissionE2eTest` lines 12-14
- `AdminMasterDataHttpTest` lines 11-13
- `AdminCertificadosConsultaHttpTest` lines 12-14
- `CertificateRevisionMigrationTest` lines 9-11
- `AttendanceRevisionTest` lines 13-15
- `CourseDateRevisionTest` lines 13-15
- `fault-injection-audit.php` has no SKIP; it asserts demo config markers.
- `ReadinessTest` has no SKIP (no DB dependency).
- `QrImageTest`, `RegenerarPdfTest` are unit tests with Fake PDO (no SKIP needed, no env vars).

### Risks
1. **CI silently passes if env vars are accidentally removed** — SKIP returns 0 exit code.
2. **Duplicated migration application** — 6 tests repeat the same migration logic inline; fragile if migration order changes.
3. **Schema contract drift** — script exists locally but not in CI; schema changes can break contract without CI noticing.
4. **Upgrade tests split** — `CertificateRevisionMigrationTest` is in CI, `test-database-upgrade.sh` is not. Need to unify or wire both.

### Recommendation
1. Add a dedicated `database-setup` step in CI before E2E tests that applies all migrations (001-010) once.
2. Refactor E2E tests to remove inline migration application and assume schema is ready (or add a `--reuse-schema` flag).
3. Replace SKIP with `throw new RuntimeException(...)` or `exit(1)` in E2E tests when DB env vars are missing — CI must fail, not skip.
4. Wire `scripts/test-database-schema-contract.sh` into CI (adapt to use service container instead of standalone docker run, or convert to PHP test).
5. Wire `scripts/test-database-upgrade.sh` into CI or create a PHP-based upgrade test.
6. Consider adding a dedicated `test-database-schema-contract.php` that runs in the E2E job against the service container.

### Estimated scope
- Files to touch: `.github/workflows/backend-tests.yml` (1 file, ~30 lines), 8 test files (remove SKIP, ~16 lines), possibly create `tests/DatabaseSchemaContractTest.php` (~80 lines), update `scripts/test-database-schema-contract.sh` or replace with PHP test.
- Lines of change: ~150-250 lines total (mostly deletions of inline migration logic and SKIP blocks, plus new CI step and new contract test).

### Ready for Proposal
YES. The exploration is complete. The orchestrator should tell the user that P7-03 requires:
- CI workflow changes (add migration step, remove SKIP, add schema contract step);
- Test refactoring (remove inline migrations, replace SKIP with hard fail);
- Optionally create a PHP schema contract test to replace the standalone bash script in CI.
