# Apply Progress: P7-03 MariaDB CI

**Change**: `p7-03-mariadb-ci`
**Mode**: Standard (strict_tdd: false)
**Status**: all_done

## Work Unit Evidence

| Evidence | Required value |
|---|---|
| Focused test command and exact result | `php -l` on 8 files → 8/8 "No syntax errors detected"; `DatabaseSchemaContractTest.php` vs migrated DB → `OK DatabaseSchemaContractTest` exit 0; negative path (no env) → `FATAL: ...` exit 1 |
| Runtime harness command/scenario and exact result | `bash scripts/test-database-upgrade.sh` → `PASS: Ambos esquemas convergen a la misma estructura exacta.` exit 0; 10/10 migrations apply cleanly via `mariadb` CLI |
| Rollback boundary | Revert `.github/workflows/backend-tests.yml` (workflow steps), delete `apps/backend-php/tests/DatabaseSchemaContractTest.php`, revert 7 test files SKIP→exit(1) edits |

## Phase 1: Database setup step
- [x] 1.1 Agregar paso `database-setup` en `php-tests`. REQ-MDB-001.

## Phase 2: Eliminar SKIP → hard-fail
- [x] 2.1 SnapshotEmissionTest.php
- [x] 2.2 HttpEmissionE2eTest.php
- [x] 2.3 AdminMasterDataHttpTest.php
- [x] 2.4 AdminCertificadosConsultaHttpTest.php
- [x] 2.5 AttendanceRevisionTest.php
- [x] 2.6 CertificateRevisionMigrationTest.php
- [x] 2.7 CourseDateRevisionTest.php
- [x] 2.8 QrImageTest.php — verificado, no tiene skip de DB (solo skip de GD runtime, fuera de alcance)

## Phase 3: Schema contract + upgrade test
- [x] 3.1 DatabaseSchemaContractTest.php creado + cableado en CI. REQ-MDB-003.
- [x] 3.2 Upgrade test cableado como CI step. REQ-MDB-004.

## Phase 4: Verificación
- [x] 4.1 11 tests E2E sin SKIP en CI (wiring completo; CI ejecución pendiente)
- [x] 4.2 Schema contract verificado localmente contra MariaDB migrada
- [x] 4.3 Upgrade test verificado localmente

## Notes
- PHP Docker image (ifts14-php84) NO tiene cliente `mariadb`; el paso `database-setup` instala `mariadb-client` en el runner Ubuntu y aplica migraciones contra el service container en 127.0.0.1:3306.
- Los 4 archivos "also check" (QrImageTest, RegenerarPdfTest, fault-injection-audit, ReadinessTest) NO contenían el patrón SKIP de DB — sin cambios.
- El schema contract valida tablas, columnas, tipos (substring), enums y versiones registradas en cert_schema_migrations (007-010).