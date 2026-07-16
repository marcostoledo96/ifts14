# Spec: P7-03 MariaDB CI

**Change**: `p7-03-mariadb-ci`
**Phase**: P7-03
**Status**: draft

## Delta Summary

Cinco requisitos para reforzar el job de MariaDB CI: paso explícito de migraciones, eliminación del patrón SKIP, cableado del schema contract y upgrade tests, y suite E2E completa sin atajos.

---

## Added Requirements

### REQ-MDB-001 — Paso de migraciones en CI

El job `php-tests` debe tener un paso explícito `database-setup` que aplique todas las migraciones (`001.sql` a `010.sql`) en orden sobre el servicio MariaDB **antes** de ejecutar cualquier test E2E.

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

### REQ-MDB-002 — No SKIP en tests E2E

Ningún test E2E debe hacer SKIP silencioso cuando faltan variables de entorno de base de datos. El patrón actual (`echo "SKIP"; return;`) debe reemplazarse por hard-fail (`exit(1)` con mensaje en stderr).

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

### REQ-MDB-003 — Schema contract en CI

El schema contract (`DatabaseSchemaContractTest.php` o `test-database-schema-contract.sh`) debe ejecutarse en CI como paso del job `php-tests`, verificando que el esquema aplicado coincida con lo esperado.

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

### REQ-MDB-004 — Upgrade test en CI

El upgrade test debe ejecutarse en CI, demostrando que fixtures de esquemas históricos convergen al mismo esquema final tras aplicar migraciones.

#### Scenario: Upgrade desde variantes históricas
- **Given** fixtures de esquema de variantes históricas de `003`
- **When** se ejecuta el upgrade test
- **Then** ambas variantes llegan al mismo esquema tras 006–010
- **And** sale con código `0`

---

### REQ-MDB-005 — Suite E2E completa

Los 11 tests E2E deben ejecutarse completos en CI, cubriendo: emisión, modificación de asistencias, URL/QR permanente, PDF stale, revocación, regeneración, fault injection y auditoría.

#### Scenario: 11/11 tests E2E pasan
- **Given** MariaDB con migraciones aplicadas
- **When** se ejecuta el paso "E2E con MariaDB"
- **Then** los 11 tests se ejecutan (sin SKIP)
- **And** todos salen con código `0`

---

## Non-Goals

- No se modifica la lógica de negocio de los tests.
- No se agregan nuevos tests funcionales (solo CI wiring).
- No se migra a PHPUnit.
