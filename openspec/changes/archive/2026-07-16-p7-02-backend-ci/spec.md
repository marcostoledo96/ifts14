# Spec: P7-02 Backend CI

**Change**: `p7-02-backend-ci`
**Phase**: P7-02
**Status**: draft

## Delta Summary

Cinco requisitos nuevos para extender el job `php-tests` con quality gates de backend: validación estricta de composer, auditoría de dependencias, lint de sintaxis PHP e incorporación de tests huérfanos.

---

## Added Requirements

### REQ-BE-001 — Composer validate strict

El job debe ejecutar `composer validate --strict` y fallar si `composer.json` o `composer.lock` no son válidos.

#### Scenario: composer.json válido
- **Given** `composer.json` y `composer.lock` sincronizados
- **When** se ejecuta `composer validate --strict`
- **Then** sale con código `0`

#### Scenario: composer.json inválido
- **Given** `composer.json` con error de sintaxis
- **When** se ejecuta `composer validate --strict`
- **Then** sale con código distinto de `0`

---

### REQ-BE-002 — Composer audit

El job debe ejecutar `composer audit` para detectar vulnerabilidades conocidas en dependencias.

#### Scenario: Sin advisories
- **Given** dependencias sin vulnerabilidades reportadas
- **When** se ejecuta `composer audit`
- **Then** sale con código `0`

#### Scenario: Con advisory conocido
- **Given** una dependencia con CVE reportado
- **When** se ejecuta `composer audit`
- **Then** reporta el advisory y sale con código distinto de `0`

---

### REQ-BE-003 — PHP lint

El job debe ejecutar `php -l` sobre todos los archivos `.php` del backend y fallar ante cualquier error de sintaxis.

#### Scenario: Sin errores de sintaxis
- **Given** todos los archivos PHP sin errores
- **When** se ejecuta `find . -name '*.php' -exec php -l {} \;`
- **Then** ningún archivo reporta errores y el paso sale con código `0`

#### Scenario: Error de sintaxis
- **Given** un archivo PHP con error de sintaxis
- **When** se ejecuta el lint
- **Then** el paso falla y el error es visible en CI

---

### REQ-BE-004 — Tests unitarios completos

Todos los tests PHP que no requieren MariaDB deben ejecutarse en el paso de unit tests. Actualmente 10/12 tests unitarios están en CI. Deben agregarse `AdminMasterDataServiceTest.php` y `SessionHttpTest.php`.

#### Scenario: 12/12 tests unitarios
- **Given** los 12 tests unitarios del backend
- **When** se ejecuta el paso "Unit tests"
- **Then** los 12 tests pasan y el paso sale con código `0`

---

### REQ-BE-005 — Tests E2E completos

Todos los tests PHP que requieren MariaDB deben ejecutarse en el paso de E2E. Actualmente 8/11 tests E2E están en CI. Deben agregarse `QrImageTest.php`, `RegenerarPdfTest.php` y `fault-injection-audit.php`.

#### Scenario: 11/11 tests E2E
- **Given** los 11 tests E2E del backend con MariaDB disponible
- **When** se ejecuta el paso "E2E con MariaDB"
- **Then** los 11 tests pasan y el paso sale con código `0`

---

## Non-Goals

- No se migra a PHPUnit/Pest.
- No se agrega cobertura de código.
- No se modifica la estructura del workflow.
