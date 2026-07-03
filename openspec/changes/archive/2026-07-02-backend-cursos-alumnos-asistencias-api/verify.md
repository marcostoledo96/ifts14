## Verification Report

**Change**: `backend-cursos-alumnos-asistencias-api`
**Version**: N/A
**Mode**: Standard; Strict TDD no activo.
**Artifact store**: OpenSpec + Engram

### Resumen ejecutivo

La implementación cumple funcionalmente el ciclo M4-03: expone 14 combinaciones método/ruta para cursos, alumnos, fechas y asistencias; conserva `X-Admin-Key`, `Content-Type`, envelopes y privacidad administrativa; falla cerrado con `dni_cipher_key`; usa eliminación lógica para asistencias; y la emisión existente sigue funcionando con datos cargados por API.

El veredicto es **PASS WITH WARNINGS** porque la evidencia Docker PHP 8.4/MariaDB 10.6 pasó, pero el PHP nativo y el script sudo exacto siguen bloqueados en esta sesión, y quedó una deriva documental menor en specs/prompts que todavía mencionan reenvío por email.

### Completeness

| Metric | Value |
|--------|-------|
| Tasks total | 18 |
| Tasks complete | 18 |
| Tasks incomplete | 0 |
| Admin method-route combinations | 14 |

### Build & Tests Execution

| Command | Outcome | Notes |
|---|---|---|
| `php -v` | ⚠️ BLOCKED | `/bin/bash: línea 1: php: orden no encontrada`. |
| `bash scripts/php-docker-lint.sh` | ⚠️ BLOCKED | `sudo: A terminal is required to authenticate`. |
| `rtk git diff --check` | ✅ PASS | Sin salida; no hay whitespace errors en el diff versionado. |
| `rtk docker run --rm ifts14-php84 php -v` | ✅ PASS | PHP 8.4.22 CLI. Compatible con `composer.json` (`php >=8.4`) y stack objetivo PHP 8.4.21. |
| `rtk docker run --rm -v "$PWD":/repo -w /repo ifts14-php84 php -r '...'` | ✅ PASS | Verificó extensiones `pdo_mysql`, `openssl`, `mbstring`, `curl`, `zip`, `xml`. |
| `rtk docker run --rm -v "$PWD":/repo -w /repo ifts14-php84 sh -lc 'php -l apps/backend-php/index.php && php -l apps/backend-php/src/AdminMasterDataService.php && php -l apps/backend-php/tests/AdminMasterDataServiceTest.php && php -l apps/backend-php/tests/AdminMasterDataHttpTest.php && php -l apps/backend-php/tests/HttpEmissionE2eTest.php'` | ✅ PASS | Sin errores de sintaxis en archivos PHP nuevos/modificados centrales. |
| `rtk docker run --rm -v "$PWD":/repo -w /repo ifts14-php84 sh -lc 'php apps/backend-php/tests/AdminMasterDataServiceTest.php && php apps/backend-php/tests/AdminCertificateServiceTest.php && php apps/backend-php/tests/AuthGateTest.php && php apps/backend-php/tests/NormalizePathTest.php && php apps/backend-php/tests/HttpContractTest.php && php apps/backend-php/tests/EntregaManualTest.php && php apps/backend-php/tests/PdfResilienceTest.php'` | ✅ PASS | Tests procedurales OK. `HttpContractTest` emite notices preexistentes por request sin `Content-Type`, pero finaliza OK. |
| Docker MariaDB 10.6 descartable + `ifts14-php84`: `php apps/backend-php/tests/AdminMasterDataHttpTest.php && php apps/backend-php/tests/HttpEmissionE2eTest.php && php apps/backend-php/tests/SnapshotEmissionTest.php` | ✅ PASS | `OK AdminMasterDataHttpTest`, `OK HttpEmissionE2eTest`, `OK SnapshotEmissionTest`. Cubre endpoints HTTP nuevos, emisión desde datos cargados por API, validación pública desde snapshot, entrega manual y rollback/no persistencia parcial. |

**Coverage**: ➖ No disponible. El proyecto usa scripts procedurales, no PHPUnit/Pest con coverage formal.

### Spec Compliance Matrix

| Requirement | Scenario | Runtime evidence | Result |
|---|---|---|---|
| Administración de cursos | Curso creado y consultable | `AdminMasterDataHttpTest.php` crea, lista y consulta `/admin/cursos`. | ✅ COMPLIANT |
| Administración de cursos | Estado de curso actualizado | `AdminMasterDataHttpTest.php` prueba estado válido y `400 VALIDATION_ERROR` inválido. | ✅ COMPLIANT |
| Alumnos con DNI seguro | Alumno creado con DNI cifrado | `AdminMasterDataHttpTest.php` + `AdminMasterDataServiceTest.php`; DTO usa `dniMostrar`, no DNI completo ni columnas internas. | ✅ COMPLIANT |
| Alumnos con DNI seguro | `dni_cipher_key` ausente falla cerrado | `AdminMasterDataHttpTest.php` verifica `500 CONFIGURATION_ERROR` y contador de `cert_alumnos` sin cambios. | ✅ COMPLIANT |
| Fechas de curso | Fechas listadas en orden estable | `AdminMasterDataHttpTest.php` ejecuta listado; inspección de fuente confirma `ORDER BY orden ASC, fecha ASC`. | ✅ COMPLIANT |
| Fechas de curso | Estado inválido | `AdminMasterDataHttpTest.php` verifica `400 VALIDATION_ERROR` en PATCH. | ✅ COMPLIANT |
| Asistencias | Asistencia activa registrada | `AdminMasterDataHttpTest.php` registra y lista asistencia activa. | ✅ COMPLIANT |
| Asistencias | Duplicado activo conflictivo | `AdminMasterDataHttpTest.php` verifica `409 CONFLICT`. | ✅ COMPLIANT |
| Asistencias | Anulación lógica | `AdminMasterDataHttpTest.php` verifica `DELETE`, exclusión del listado activo y nueva alta posterior. | ✅ COMPLIANT |
| Seguridad/envelopes | Admin no autorizado | `AdminMasterDataHttpTest.php` verifica `401 UNAUTHORIZED`. | ✅ COMPLIANT |
| Seguridad/envelopes | JSON inválido o media type incorrecto | `AdminMasterDataHttpTest.php` verifica `415` y `400`. | ✅ COMPLIANT |
| Contrato de datos maestros | CRUD mínimo disponible y privacidad | `AdminMasterDataHttpTest.php` cubre cursos, alumnos, fechas y asistencias con DTOs seguros. | ✅ COMPLIANT |
| Compatibilidad de emisión | Emisión smoke con datos cargados por API | `HttpEmissionE2eTest.php` carga curso/alumno/fechas/asistencias por API y emite certificado. | ✅ COMPLIANT |
| Compatibilidad de emisión | Datos no elegibles | `SnapshotEmissionTest.php` verifica emisión sin asistencias activas rechazada sin persistir filas; `AdminMasterDataHttpTest.php` rechaza fecha cancelada para asistencia. | ✅ COMPLIANT |
| Auditoría/errores seguros | Configuración DNI segura | `AdminMasterDataHttpTest.php` verifica respuesta segura sin persistencia; inspección confirma no se devuelve DNI/hash/cipher. | ✅ COMPLIANT |

**Compliance summary**: 15/15 escenarios del cambio verificados con evidencia runtime y/o runtime + inspección de fuente puntual.

### Correctness (Static Evidence)

| Requirement | Status | Notes |
|---|---|---|
| 14 rutas admin de datos maestros | ✅ Implemented | `apps/backend-php/index.php` registra POST/GET/PATCH/DELETE para cursos, alumnos, fechas y asistencias. |
| Auth admin | ✅ Implemented | Todas las rutas nuevas cargan config y llaman `requireAdmin()` antes de ejecutar el servicio. |
| `Content-Type` JSON | ✅ Implemented | POST/PATCH nuevas llaman `requireJsonContentType()` antes de leer body. |
| Envelope de errores | ✅ Implemented | `respondToAdmin()` captura `AdminCertificateException` y responde con `Response::error()`. |
| DNI admin enmascarado | ✅ Implemented | `studentDto()` expone `dniMostrar`; no selecciona ni devuelve `dni_hash`/`dni_cifrado` ni DNI completo. |
| `dni_cipher_key` fail-closed | ✅ Implemented | `loadDniCipherKey()` y `validDniKey()` fallan antes de `INSERT` de alumno. |
| Duplicado de asistencia | ✅ Implemented | Captura SQLSTATE `23000` sobre `uq_cert_asistencias_activa` y responde `409 CONFLICT`. |
| Anulación lógica | ✅ Implemented | `voidAttendance()` ejecuta `UPDATE ... SET eliminado_en = CURRENT_TIMESTAMP`; no hay `DELETE` físico. |
| Emisión existente | ✅ Implemented | `HttpEmissionE2eTest.php` demuestra emisión, validación pública, entrega manual y `/reenviar` 404 con datos cargados por API. |

### Coherence (Design)

| Decision | Followed? | Notes |
|---|---|---|
| Servicio único `AdminMasterDataService` | ✅ Yes | Se creó un servicio único con métodos pequeños; sin abstracciones especulativas. |
| Extender `index.php` | ✅ Yes | Las rutas se agregaron al front controller existente. |
| DNI admin cifrado + máscara | ✅ Yes | Persistencia con `dni_hash`/`dni_cifrado`; DTO admin solo `dniMostrar`. |
| Asistencias con eliminación lógica | ✅ Yes | `eliminado_en` y listado de activas excluyen anuladas. |
| Sin frontend, SMTP, email ni migraciones nuevas | ✅ Yes | No hay cambios Angular, no se activó email/SMTP/PHPMailer, no se agregaron migraciones. |

### Issues Found

**CRITICAL**: None.

**WARNING**:
- El PHP nativo local y el script `scripts/php-docker-lint.sh` siguen bloqueados (`php` no instalado; `sudo` requiere terminal interactiva). La verificación equivalente con Docker directo pasó, por lo que no bloquea funcionalidad, pero el veredicto no es PASS limpio.
- Deriva documental: `openspec/specs/backend-contrato-api-certificados/spec.md:5` todavía menciona “reenvío por email” y “reenvío normal”, aunque el contrato detallado y la implementación actual son de entrega manual sin SMTP/email. El prompt raíz de Marcos también conserva M4-06 como ciclo de email/reenvío. Requiere limpieza documental en `sdd-archive` o ciclo documental breve.

**SUGGESTION**:
- Agregar en un próximo ajuste una aserción explícita de orden en `AdminMasterDataHttpTest.php` para que el escenario “fechas ordenadas” no dependa de inspección de fuente complementaria.

### Verdict

**PASS WITH WARNINGS**

La implementación y los escenarios funcionales pasan con evidencia Docker PHP 8.4 + MariaDB 10.6 descartable. No queda blocker de código; las advertencias son entorno local/sudo y limpieza documental pendiente.
