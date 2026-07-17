## Exploration: p7-02-backend-ci

### Current State
The `php-tests` job in `.github/workflows/backend-tests.yml` (lines 9–81) currently runs on `ubuntu-latest` with a MariaDB 10.6 service and performs three steps:

1. **Build PHP image** (`docker/php84/Dockerfile`) — uses `php:8.4-cli` with extensions: curl, gd, mbstring, pdo_mysql, xml, zip.
2. **Composer install** — runs `composer:2` container with `--no-dev --no-interaction --prefer-dist`.
3. **Unit tests (no DB)** — runs 10 procedural PHP test files sequentially via `php <file>` inside the Docker image:
   - `AuthGateTest.php`
   - `AdminSessionAuthTest.php`
   - `AdminAuthHttpTest.php`
   - `AdminAuthorizationMatrixTest.php`
   - `AuthPrivacyTest.php`
   - `NormalizePathTest.php`
   - `EntregaManualTest.php`
   - `AdminCertificateServiceTest.php`
   - `HttpContractTest.php`
   - `PdfResilienceTest.php`
4. **E2E with MariaDB** — runs 8 procedural PHP test files requiring the DB service:
   - `SnapshotEmissionTest.php`
   - `HttpEmissionE2eTest.php`
   - `AdminMasterDataHttpTest.php`
   - `AdminCertificadosConsultaHttpTest.php`
   - `ReadinessTest.php`
   - `CertificateRevisionMigrationTest.php`
   - `AttendanceRevisionTest.php`
   - `CourseDateRevisionTest.php`
5. **Privacy headers** — runs `scripts/test-privacy-headers.sh`.

### Gaps vs. P7-02 Spec
| Requirement | Currently in CI? | Notes |
|---|---|---|
| `composer validate --strict` | **NO** | Not run at all. |
| `composer audit` | **NO** | Not run at all. |
| `php -l` (syntax lint) | **NO** | `scripts/php-docker-lint.sh` exists locally but is not invoked in CI. |
| All unit/procedural tests | **PARTIAL** | 18/24 test files included; 6 missing. |

### PHP Test Inventory
24 files in `apps/backend-php/tests/`:

**In CI — Unit (no DB):**
- `AuthGateTest.php`
- `AdminSessionAuthTest.php`
- `AdminAuthHttpTest.php`
- `AdminAuthorizationMatrixTest.php`
- `AuthPrivacyTest.php`
- `NormalizePathTest.php`
- `EntregaManualTest.php`
- `AdminCertificateServiceTest.php`
- `HttpContractTest.php`
- `PdfResilienceTest.php`

**In CI — E2E (with MariaDB):**
- `SnapshotEmissionTest.php`
- `HttpEmissionE2eTest.php`
- `AdminMasterDataHttpTest.php`
- `AdminCertificadosConsultaHttpTest.php`
- `ReadinessTest.php`
- `CertificateRevisionMigrationTest.php`
- `AttendanceRevisionTest.php`
- `CourseDateRevisionTest.php`

**NOT in CI (6 files):**
- `QrImageTest.php` — unit/procedural; tests QR image generation and delivery logic; may SKIP when GD unavailable.
- `RegenerarPdfTest.php` — unit/procedural; tests PDF regeneration service with fake PDO.
- `AdminMasterDataServiceTest.php` — unit/procedural; tests DNI masking, hashing, cipher, and course date order validation.
- `SessionHttpTest.php` — shared helper (included by E2E tests that `require_once` it); not a standalone runner.
- `fault-injection-audit.php` — requires live DB and `CERTIFICADOS_CONFIG_PATH`; not suitable for CI in current form.

### Docker Image
`docker/php84/Dockerfile` installs:
- `curl`, `gd`, `mbstring`, `pdo_mysql`, `xml`, `zip`

This matches the required module list in `scripts/php-docker-modules-check.sh`:
`pdo_mysql openssl mbstring curl zip xml gd`

`openssl` is available by default in `php:8.4-cli`, so the image is complete.

### MariaDB Service Configuration
- Image: `mariadb:10.6`
- Env: `MARIADB_ROOT_PASSWORD=test_root_only`, `MARIADB_DATABASE=ifts14_test`
- Ports: `3306:3306`
- Health check: `mariadb-admin ping` with 5s interval/timeout and 10 retries — correctly configured.

### Risks and Recommendations
- **Risk**: `composer audit` on `tecnickcom/tcpdf` 6.11.3 (deprecated/legacy) may emit deprecation warnings or advisories. Decide beforehand whether to fail CI on advisories or treat them as warnings.
- **Risk**: `QrImageTest.php` may SKIP if GD is unavailable in CI Docker image. The Dockerfile *does* install GD, so it should pass; verify at runtime.
- **Risk**: `RegenerarPdfTest.php` and `AdminMasterDataServiceTest.php` are unit tests with fake PDOs and should run fast and reliably.
- **Risk**: `fault-injection-audit.php` is not suitable for CI (requires external config path and live DB with destructive rename). Exclude from CI or refactor into a non-destructive E2E test.
- **Recommendation**: Add `composer validate --strict`, `composer audit`, and `php -l` as explicit steps before unit tests. Lint all `.php` files under `apps/backend-php/` (including `src/`, `tests/`, `bin/`, `index.php`).
- **Recommendation**: Add the 3 missing unit tests (`QrImageTest.php`, `RegenerarPdfTest.php`, `AdminMasterDataServiceTest.php`) to the unit-test step. Verify `SessionHttpTest.php` is intentionally a helper, not a runner.

### Estimated Scope
| File | Change | Lines |
|---|---|---|
| `.github/workflows/backend-tests.yml` | Add 3–4 new steps (`composer validate`, `composer audit`, `php -l`, include missing tests) | ~20–30 lines |
| `openspec/config.yaml` | Update `quality.linter` and `test_runner` notes if desired | ~3–5 lines |

No product code changes required. No new files needed (unless creating a `php-lint-all.sh` wrapper script for CI).

### Ready for Proposal
**Yes.**

The orchestrator should tell the user:
- P7-02 is a **small, mechanical CI enhancement** with no product-code risk.
- We need to add `composer validate --strict`, `composer audit`, and `php -l` to the workflow.
- We need to include 3 missing procedural unit tests in CI (and confirm 1 helper + 1 fault-injection script are intentionally excluded).
- The Dockerfile and MariaDB service are already correctly configured.
- Next step is `sdd-propose` for `p7-02-backend-ci`.
