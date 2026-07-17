# Spec — Backend CI Quality Gates

## Purpose

Definir los quality gates obligatorios que el job `php-tests` del workflow `.github/workflows/backend-tests.yml` debe ejecutar en cada cambio backend, para impedir que una `composer.json` rota, una dependencia vulnerable o un test huérfano reintroduzcan errores conocidos en CI.

Este contrato se materializa con el ciclo `p7-02-backend-ci` (2026-07-16) y queda como spec canónica del repositorio. PHPUnit/Pest, cobertura de código y reestructuración del workflow se difieren a ciclos posteriores y no forman parte de estos requisitos.

## Requirements

### Requirement: Composer validate --strict en CI

El job `php-tests` MUST ejecutar `composer validate --strict` y fallar si `composer.json` o `composer.lock` no son válidos. La verificación se hace después de `composer install` para asegurar que el lockfile consumido por CI es el que valida la build.

#### Scenario: composer.json válido

- **Given** `composer.json` y `composer.lock` sincronizados
- **When** se ejecuta `composer validate --strict`
- **Then** el comando sale con código `0`
- **And** CI registra el mensaje `./composer.json is valid`

#### Scenario: composer.json inválido

- **Given** `composer.json` con un error de sintaxis o inconsistencia con `composer.lock`
- **When** se ejecuta `composer validate --strict`
- **Then** el comando sale con código distinto de `0`
- **And** el error es visible en la salida de CI

---

### Requirement: Composer audit en CI

El job `php-tests` MUST ejecutar `composer audit` para detectar vulnerabilidades conocidas en las dependencias declaradas en `composer.lock`. La ejecución se hace después de `composer validate` para mantener el orden validar-auditar.

#### Scenario: Sin advisories

- **Given** dependencias sin vulnerabilidades reportadas
- **When** se ejecuta `composer audit`
- **Then** el comando sale con código `0`
- **And** CI registra `No security vulnerability advisories found` (o equivalente)

#### Scenario: Con advisory conocido

- **Given** una dependencia con CVE reportado en el `composer.lock`
- **When** se ejecuta `composer audit`
- **Then** el comando reporta el advisory
- **And** el comando sale con código distinto de `0`

---

### Requirement: PHP lint (php -l) en CI

El job `php-tests` MUST ejecutar `php -l` sobre todos los archivos `.php` del backend y fallar ante cualquier error de sintaxis. El alcance cubre `apps/backend-php/` excluyendo `vendor/`, e incluye código de producto y tests.

#### Scenario: Sin errores de sintaxis

- **Given** todos los archivos PHP del backend sin errores de sintaxis
- **When** se ejecuta `find apps/backend-php -name '*.php' -not -path '*/vendor/*' -exec php -l {} \;`
- **Then** ningún archivo reporta errores
- **And** el paso CI sale con código `0`

#### Scenario: Error de sintaxis detectado

- **Given** un archivo PHP con un error de sintaxis
- **When** se ejecuta el paso de lint
- **Then** el paso falla
- **And** el archivo y la línea del error son visibles en la salida de CI

---

### Requirement: Tests unitarios completos en CI

El job `php-tests` MUST ejecutar todos los tests PHP que no requieren MariaDB. Al cierre de P7-02 son 12/12 tests unitarios. Los archivos `AdminMasterDataServiceTest.php` y `SessionHttpTest.php` (anteriormente huérfanos) MUST estar incluidos en el paso "Unit tests".

#### Scenario: 12/12 tests unitarios

- **Given** los 12 tests unitarios del backend en `apps/backend-php/tests/`
- **When** se ejecuta el paso "Unit tests" del workflow
- **Then** los 12 tests pasan
- **And** el paso sale con código `0`

---

### Requirement: Tests E2E completos en CI

El job `php-tests` MUST ejecutar todos los tests PHP que requieren MariaDB. Al cierre de P7-02 son 11/11 tests E2E. Los archivos `QrImageTest.php`, `RegenerarPdfTest.php` y `fault-injection-audit.php` (anteriormente huérfanos) MUST estar incluidos en el paso "E2E con MariaDB".

#### Scenario: 11/11 tests E2E

- **Given** los 11 tests E2E del backend con el servicio MariaDB 10.6 disponible
- **When** se ejecuta el paso "E2E con MariaDB" del workflow
- **Then** los 11 tests pasan
- **And** el paso sale con código `0`

---

## Non-Goals (explicit)

- No se migra a PHPUnit/Pest; los tests son scripts procedurales ejecutados con `php` directo.
- No se agrega cobertura de código en este ciclo.
- No se modifica la estructura del workflow; solo se agregan pasos al job existente.
- ESLint no aplica (es frontend).

## Notes operativas

- `composer audit` se ejecuta con `composer:2`; los warnings de git `dubious ownership` son locales y no bloquean CI.
- El paso de `php -l` se ubica al final del job `php-tests` para detectar sintaxis después de los demás gates.
- `openspec/config.yaml` declara la sección `testing.quality.linter.backend` con `tool: php -l`, comando de invocación y referencia al step CI.
