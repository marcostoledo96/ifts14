# Proposal: P7-02 Backend CI

## Intent

Extender el job `php-tests` del workflow `.github/workflows/backend-tests.yml` con los quality gates que exige P7-02: `composer validate --strict`, `composer audit`, lint `php -l`, e incorporar los 5 archivos de test PHP que actualmente no se ejecutan en CI.

## Scope

### In
- Agregar paso `composer validate --strict` después de `composer install`.
- Agregar paso `composer audit` para detectar vulnerabilidades en dependencias.
- Agregar paso `php -l` para lint de todos los archivos PHP del backend.
- Agregar 2 tests unitarios faltantes: `AdminMasterDataServiceTest.php`, `SessionHttpTest.php`.
- Agregar 3 tests E2E faltantes: `QrImageTest.php`, `RegenerarPdfTest.php`, `fault-injection-audit.php`.
- Actualizar `openspec/config.yaml` con metadata de linter backend.

### Out
- PHPUnit/Pest migration (tests actuales son scripts procedurales con `php` directo).
- Reestructuración del workflow.
- Cobertura de código.

## Approach

Extender el job `php-tests` inline con 3 pasos nuevos y 5 tests. Mismo patrón que P7-01: cambios mínimos, sin reestructurar.

## Risks

| Risk | Mitigation |
|------|------------|
| `composer audit` puede fallar si hay advisories en `tecnickcom/tcpdf` | Revisar resultado; si hay advisory conocido, documentar y evaluar si requiere acción |
| Tests huérfanos pueden estar rotos | Ejecutar primero localmente; si fallan, reportar y decidir si se incluyen |
| `php -l` puede encontrar syntax errors en archivos no testeados | Corregir o excluir archivos con errores conocidos |

## Success Criteria

- [ ] `composer validate --strict` pasa en CI.
- [ ] `composer audit` se ejecuta en CI (warnings no bloquean, errores sí).
- [ ] `php -l` escanea todos los `.php` del backend y pasa.
- [ ] 23/23 test files ejecutados en CI (18 actuales + 5 nuevos).
- [ ] `openspec/config.yaml` refleja el linter backend.
