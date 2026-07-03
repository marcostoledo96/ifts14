# Verification Report — backend-prevenir-certificados-duplicados

## Resultado

| Campo | Valor |
|---|---|
| Cambio | `backend-prevenir-certificados-duplicados` |
| Modo | `both` / verificación estándar |
| Fecha | 2026-07-03 |
| Veredicto | **PASS** |

Verificación formal posterior al corrective apply con constraint DB. La implementación cumple el objetivo funcional: un segundo certificado con `estado='vigente'` y `revocado_en IS NULL` para el mismo `alumno_id + curso_id` responde `409 CERTIFICATE_ALREADY_EXISTS`; revocación y `estado='vencido'` liberan el slot; `vence_en` pasado con estado vigente sigue bloqueando por diseño.

## Artefactos revisados

| Artefacto | Estado |
|---|---|
| `proposal.md` | Leído; alcance acotado a HIGH-02, sin frontend/email/regeneración/token rotation. |
| `design.md` | Leído; constraint MariaDB + guard PHP temprano + mapping de `23000`. |
| `tasks.md` | Leído; 13/13 tareas completas. |
| `specs/admin-certificate-emission/spec.md` | Leído; escenarios de duplicado, revocación, vencido, `vence_en` y legacy NULL. |
| `specs/backend-contrato-api-certificados/spec.md` | Leído; contrato administrativo documenta `409 CERTIFICATE_ALREADY_EXISTS`. |
| `docs/backend/01-contrato-api-certificados.md` | Leído; regla de emisión y tabla de errores actualizadas. |
| `docs/database/00-mariadb.md`, `docs/database/01-modelo-datos-certificados.md`, `database/docs/005-prevenir-certificados-duplicados.md` | Leídos; migración `005` y semántica de slot activo documentadas. |

## Evidencia de ejecución

| Comando | Resultado |
|---|---|
| `docker run --rm -v "$PWD":/app -w /app ifts14-php84 php -l apps/backend-php/src/AdminCertificateService.php` | PASS — sin errores de sintaxis. |
| `docker run --rm -v "$PWD":/app -w /app ifts14-php84 php -l apps/backend-php/tests/SnapshotEmissionTest.php` | PASS — sin errores de sintaxis. |
| `docker run --rm -v "$PWD":/app -w /app ifts14-php84 php -l apps/backend-php/tests/HttpEmissionE2eTest.php` | PASS — sin errores de sintaxis. |
| `docker run --rm ifts14-php84 php -m` | PASS — módulos requeridos presentes, incluyendo `pdo_mysql`, `openssl`, `mbstring`, `curl`, `zip`, `xml`, `gd`. |
| `docker run --rm --volume "$PWD/apps/backend-php:/workspace/apps/backend-php:ro" --workdir /workspace ifts14-php84 find apps/backend-php -type f -name '*.php' -exec php -l '{}' +` | PASS — lint PHP completo del backend y vendor versionado sin errores. |
| MariaDB descartable `mariadb:10.6.27` + `SELECT VERSION()` | PASS — `10.6.27-MariaDB-ubu2204`. |
| `php apps/backend-php/tests/SnapshotEmissionTest.php` con `IFTS14_TEST_DB_DSN`, `IFTS14_TEST_DB_PASS`, `IFTS14_TEST_DB_ALLOW_RESET=1` contra MariaDB 10.6.27 | PASS — `OK SnapshotEmissionTest`; aplica migraciones `001`→`005`. |
| `php apps/backend-php/tests/HttpEmissionE2eTest.php` con `IFTS14_TEST_DB_DSN`, `IFTS14_TEST_DB_PASS`, `IFTS14_TEST_DB_ALLOW_RESET=1` contra MariaDB 10.6.27 | PASS — `OK HttpEmissionE2eTest`; aplica migraciones `001`→`005`. |

Nota operativa: los scripts `scripts/php-docker-modules-check.sh` y `scripts/php-docker-lint.sh` requieren `sudo` y en esta sesión fallaron por falta de TTY para autenticación. Se ejecutó el equivalente directo con `docker` sin `sudo`. La primera corrida DB falló por usar `IFTS14_TEST_DB_PASSWORD`; el contrato real de los tests usa `IFTS14_TEST_DB_PASS`. Repetido con la variable correcta, ambos tests pasaron.

## Matriz de cumplimiento de specs

| Requisito / escenario | Evidencia de implementación | Evidencia runtime | Estado |
|---|---|---|---|
| Migraciones `001`→`005` aplican limpiamente en MariaDB 10.6 | `SnapshotEmissionTest.php` y `HttpEmissionE2eTest.php` llaman `applySqlFile()` para `001`, `002`, `003`, `004`, `005`. | Ambos tests pasaron contra `mariadb:10.6.27`. | PASS |
| Duplicado vigente rechazado con `409 CERTIFICATE_ALREADY_EXISTS` | `AdminCertificateService::emitir()` llama a `assertNoActiveCertificateForPair()` dentro de la transacción antes del `INSERT`; migración `005` agrega `uq_cert_certificados_alumno_curso_activo`; `PDOException 23000` del índice se mapea al mismo 409. | `SnapshotEmissionTest.php` prueba duplicado directo por DB y duplicado vía servicio; `HttpEmissionE2eTest.php` prueba segundo `POST` con 409. | PASS |
| Rechazo no crea certificado, token, PDF ni snapshot nuevos | `SnapshotEmissionTest.php` compara `tableCounts()` antes/después del duplicado. | `OK SnapshotEmissionTest`. | PASS |
| Revocación libera slot | Tests marcan/revocan certificado previo y vuelven a emitir. | `OK SnapshotEmissionTest`; `OK HttpEmissionE2eTest`. | PASS |
| `estado='vencido'` libera slot | Tests fuerzan estado vencido y reemiten. | `OK SnapshotEmissionTest`; `OK HttpEmissionE2eTest`. | PASS |
| `vence_en` pasado con estado vigente bloquea | Test fuerza `vence_en = CURRENT_DATE - INTERVAL 1 DAY` y conserva `estado='vigente'`; la nueva emisión responde 409. | `OK SnapshotEmissionTest`. | PASS |
| Legacy con `alumno_id`/`curso_id` nulos no bloquea | Test inserta certificado vigente legacy sin FKs y reemite para el par actual. | `OK SnapshotEmissionTest`. | PASS |
| Error/auditoría sin DNI completo, token completo, SQL, secretos ni rutas internas | Error genérico `AdminCertificateException(409, 'CERTIFICATE_ALREADY_EXISTS', ...)`; `Response::error()` conserva `details: []`; `safeAudit()` registra detalle genérico. | Flujo HTTP de duplicado pasó por envelope seguro 409; inspección de fuente confirma no inclusión de DNI/token/SQL/secrets/rutas. | PASS |

## Coherencia con diseño

| Decisión de diseño | Verificación | Estado |
|---|---|---|
| Constraint DB para cerrar carrera concurrente | `005_prevenir_certificados_duplicados.sql` agrega generated column `STORED` e índice único sobre `(alumno_id, curso_id, certificado_bloqueo_activo)`. | PASS |
| Columna generada determinística, sin `CURRENT_DATE` | La expresión usa solo `estado='vigente'` y `revocado_en IS NULL`; `vence_en` no participa. | PASS |
| Guard PHP temprano como UX, no garantía única | `assertNoActiveCertificateForPair()` está dentro de la transacción; la garantía final queda en el índice único. | PASS |
| Mapping seguro de constraint DB a HTTP 409 | `throwDuplicateCertificateIfActivePairConstraint()` detecta SQLSTATE `23000` y el nombre del índice. | PASS |
| Legacy nullable aceptado | FKs nullable en el índice conservan múltiples `NULL` y los tests cubren legacy sin FKs. | PASS |

## Correctitud y alcance

| Foco | Resultado |
|---|---|
| MariaDB 10.6 migraciones `001`→`005` | Cumplido. |
| Unique constraint previene duplicado activo mismo alumno+curso | Cumplido por insert directo y flujo de servicio/HTTP. |
| PHP mapea duplicado DB/servicio a 409 | Cumplido. |
| Revocación/estado vencido liberan slot | Cumplido. |
| Vencimiento por fecha sola no libera slot | Cumplido/intencional. |
| Tests/docs/specs/archive accurate | Cumplido para el scope verificado. |
| No stage/commit/push/material privado | Cumplido. |

## Issues

### CRITICAL

- Ninguno.

### WARNING

- Ninguno.

### SUGGESTION

- Mantener como ciclo separado cualquier job de transición automática a `estado='vencido'`; no mezclarlo con el índice único.

## Veredicto final

**PASS** — constraint DB, mapping PHP, tests DB-backed, documentación y specs verificados con MariaDB 10.6.27.
