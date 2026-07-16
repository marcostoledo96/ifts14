# Spec — MariaDB CI Quality Gates

## Purpose

Definir los quality gates obligatorios que el job `php-tests` de `.github/workflows/backend-tests.yml` debe ejecutar contra el servicio MariaDB 10.6 en cada PR contra código backend que toque migraciones, esquema, tests E2E o el propio workflow, para impedir que un test huérfano, un `SKIP` silencioso, un esquema sin contrato o una migración sin aplicar reintroduzcan errores conocidos en CI.

Este contrato se materializa con el ciclo `p7-03-mariadb-ci` (2026-07-16) y queda como spec canónica del repositorio. Cobertura de código, refactor de los tests a PHPUnit/Pest y endurecimiento de los fixtures históricos se difieren a ciclos posteriores y no forman parte de estos requisitos.

## Requirements

### Requirement: Paso de migraciones en CI

El job `php-tests` MUST ejecutar un paso `database-setup` que aplique todas las migraciones (`001.sql` a `010.sql`) en orden numérico sobre el servicio MariaDB **antes** de ejecutar cualquier test E2E. La aplicación MUST usar la CLI `mariadb` (cliente oficial de MariaDB 10.6) contra el service container del workflow, y el paso MUST fallar con código distinto de `0` ante cualquier error de SQL o de conexión.

#### Scenario: Migraciones aplicadas exitosamente

- **Given** el servicio MariaDB 10.6 corriendo en CI
- **When** se ejecuta el paso `database-setup`
- **Then** las 10 migraciones se aplican en orden numérico
- **And** el paso sale con código `0`

#### Scenario: Migración falla

- **Given** una migración con error de sintaxis
- **When** se ejecuta el paso `database-setup`
- **Then** el paso falla con código distinto de `0`
- **And** el error es visible en el log de CI

---

### Requirement: No SKIP en tests E2E

Ningún test E2E que requiera MariaDB MUST hacer SKIP silencioso cuando faltan variables de entorno de base de datos. El patrón `echo "SKIP..."; return;` queda prohibido y MUST reemplazarse por hard-fail (`exit(1)` con mensaje en `STDERR`). La guarda MUST ejecutarse al inicio del test, antes de cualquier lógica de negocio.

#### Scenario: Test E2E sin DB → hard fail

- **Given** un test E2E que requiere MariaDB
- **When** `IFTS14_TEST_DB_DSN` no está definida
- **Then** el test imprime un error en stderr y sale con `exit(1)`
- **And** el job de CI falla

#### Scenario: Test E2E con DB → ejecuta normalmente

- **Given** `IFTS14_TEST_DB_DSN` configurada correctamente
- **When** el test E2E se ejecuta
- **Then** el test corre su lógica normalmente
- **And** sale con `0` si todo OK

---

### Requirement: Schema contract en CI

El schema contract (`DatabaseSchemaContractTest.php` o `test-database-schema-contract.sh`) MUST ejecutarse en CI como paso del job `php-tests`, verificando que el esquema aplicado coincida con lo esperado: tablas, columnas, enums, índices y FKs. La verificación MUST ejecutarse después de `database-setup` y antes de la suite E2E.

#### Scenario: Schema contract pasa

- **Given** las migraciones 001–010 aplicadas
- **When** se ejecuta el schema contract
- **Then** verifica: tablas esperadas, columnas, enums, índices, FKs
- **And** sale con código `0`

#### Scenario: Schema contract falla

- **Given** una migración no aplicada o columna faltante
- **When** se ejecuta el schema contract
- **Then** reporta la discrepancia y sale con código distinto de `0`

---

### Requirement: Upgrade test en CI

El upgrade test MUST ejecutarse en CI, demostrando que fixtures de esquemas históricos convergen al mismo esquema final tras aplicar las migraciones 006–010. El test SHOULD usar contenedores MariaDB descartables para no contaminar el service container del job principal.

#### Scenario: Upgrade desde variantes históricas

- **Given** fixtures de esquema de variantes históricas de `003`
- **When** se ejecuta el upgrade test
- **Then** ambas variantes llegan al mismo esquema tras 006–010
- **And** sale con código `0`

---

### Requirement: Suite E2E completa

Los 11 tests E2E que requieren MariaDB MUST ejecutarse completos en CI, sin SKIP, cubriendo: emisión, modificación de asistencias, URL/QR permanente, PDF stale, revocación, regeneración, fault injection y auditoría. El paso MUST encadenar los 11 scripts con `&&` para que el primer fallo aborte la suite.

#### Scenario: 11/11 tests E2E pasan

- **Given** MariaDB con migraciones aplicadas
- **When** se ejecuta el paso "E2E con MariaDB"
- **Then** los 11 tests se ejecutan (sin SKIP)
- **And** todos salen con código `0`

---

## Non-Goals (explicit)

- No se migra a PHPUnit/Pest; los tests son scripts procedurales ejecutados con `php` directo.
- No se agrega cobertura de código en este ciclo.
- No se modifica la estructura del workflow; solo se agregan pasos al job existente.
- No se automatiza la creación de fixtures históricos nuevos; el upgrade test usa los ya disponibles en el repo.
- ESLint no aplica (es frontend).

## Notes operativas

- El runner de CI instala `mariadb-client` en Ubuntu antes del paso `database-setup` porque la imagen PHP 8.4 (`ifts14-php84`) no incluye el cliente. La instalación es reproducible y no introduce dependencia nueva en el código versionado.
- El schema contract valida tablas, columnas (vía substring sobre `INFORMATION_SCHEMA.COLUMNS`), enums (post-006/009) y versiones registradas en `cert_schema_migrations` (007-010).
- El upgrade test (`scripts/test-database-upgrade.sh`) crea dos contenedores MariaDB, aplica variantes históricas (`schema_003_historical.sql`) y actuales (`schema_003_current.sql`), converge a través de 006-010, y compara con `diff`. Usa contenedores Docker efímeros y no depende del service container del job principal.
- `openspec/config.yaml` declara la sección `testing.quality.linter.backend` con `tool: php -l`, comando de invocación y referencia al step CI.
