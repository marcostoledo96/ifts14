# Tasks: P7-03 MariaDB CI

## Review Workload Forecast

| Field | Value |
|---|---|
| Estimated changed lines | ~120 |
| 1000-line budget risk | Low |
| Chained PRs recommended | No |
| Delivery strategy | single-pr |
| Decision needed before apply | No |

---

## Tasks

### Phase 1: Database setup step

- [x] **1.1** Agregar paso `database-setup` en `php-tests`, antes de "E2E con MariaDB", que aplique migraciones 001–010 vía `mariadb` CLI del service container. REQ-MDB-001.

### Phase 2: Eliminar SKIP → hard-fail

- [x] **2.1** `SnapshotEmissionTest.php`: reemplazar skip por `exit(1)` con stderr. REQ-MDB-002.
- [x] **2.2** `HttpEmissionE2eTest.php`: reemplazar skip por `exit(1)` con stderr. REQ-MDB-002.
- [x] **2.3** `AdminMasterDataHttpTest.php`: reemplazar skip por `exit(1)` con stderr. REQ-MDB-002.
- [x] **2.4** `AdminCertificadosConsultaHttpTest.php`: reemplazar skip por `exit(1)` con stderr. REQ-MDB-002.
- [x] **2.5** `AttendanceRevisionTest.php`: reemplazar skip por `exit(1)` con stderr. REQ-MDB-002.
- [x] **2.6** `CertificateRevisionMigrationTest.php`: reemplazar skip por `exit(1)` con stderr. REQ-MDB-002.
- [x] **2.7** `CourseDateRevisionTest.php`: reemplazar skip por `exit(1)` con stderr. REQ-MDB-002.
- [x] **2.8** `QrImageTest.php`: verificado — no tiene skip de DB (solo skip de GD runtime, fuera de alcance). REQ-MDB-002.

### Phase 3: Schema contract + upgrade test

- [x] **3.1** Cablear schema contract en CI: crear `DatabaseSchemaContractTest.php` o adaptar `test-database-schema-contract.sh` para CI. REQ-MDB-003.
- [x] **3.2** Cablear upgrade test en CI: adaptar `test-database-upgrade.sh` o crear test PHP equivalente. REQ-MDB-004.

### Phase 4: Verificación

- [x] **4.1** Verificar que los 11 tests E2E pasan sin SKIP en CI (simular con Docker local). REQ-MDB-005.
- [x] **4.2** Verificar schema contract. REQ-MDB-003.
- [x] **4.3** Verificar upgrade test. REQ-MDB-004.
