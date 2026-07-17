# Tasks: P7-02 Backend CI

## Review Workload Forecast

| Field | Value |
|---|---|
| Estimated changed lines | ~25 |
| 1000-line budget risk | Low |
| Chained PRs recommended | No |
| Delivery strategy | single-pr |
| Decision needed before apply | No |

---

## Tasks

### Phase 1: Composer gates

- [x] **1.1** Agregar paso `composer validate --strict` después de `composer install` en `php-tests`. REQ-BE-001. Verificar: CI log muestra "is valid".
- [x] **1.2** Agregar paso `composer audit` después de validate. REQ-BE-002. Verificar: CI log muestra "no security advisories" o similar.

### Phase 2: PHP lint

- [x] **2.1** Agregar paso `php -l` sobre todos los `.php` del backend. REQ-BE-003. Verificar: `find apps/backend-php -name '*.php' -exec php -l {} \;` sale 0.

### Phase 3: Tests huérfanos

- [x] **3.1** Agregar `AdminMasterDataServiceTest.php` y `SessionHttpTest.php` al paso "Unit tests". REQ-BE-004.
- [x] **3.2** Agregar `QrImageTest.php`, `RegenerarPdfTest.php` y `fault-injection-audit.php` al paso "E2E con MariaDB". REQ-BE-005.

### Phase 4: Metadata

- [x] **4.1** Actualizar `openspec/config.yaml` — `testing.linter.backend` con `php -l`.

### Phase 5: Verificación local

- [x] **5.1** Ejecutar `composer validate --strict` localmente.
- [x] **5.2** Ejecutar `composer audit` localmente.
- [x] **5.3** Ejecutar `php -l` sobre los 5 tests huérfanos para confirmar que no tienen errores de sintaxis.
