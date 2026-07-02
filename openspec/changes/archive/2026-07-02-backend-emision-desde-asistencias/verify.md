# Verification Report — `backend-emision-desde-asistencias`

**Cambio**: `backend-emision-desde-asistencias`  
**Modo**: Standard SDD, Strict TDD no activo  
**Artifact store**: híbrido (`openspec` + Engram)  
**Fecha**: 2026-07-02

## Resumen ejecutivo

La implementación queda **aprobada con advertencias**: los flujos centrales de emisión desde `alumnoId` + `cursoId`, snapshot en `cert_certificado_fechas`, validación pública desde snapshot, DNI fail-closed, PDF/QR sin token visible, entrega manual sin rotación y `/reenviar` removido tienen evidencia runtime en Docker PHP 8.4 y MariaDB 10.6 descartable.

No se declara verde sobre los scripts exactos del repo que siguen bloqueados por entorno: `bash scripts/php-docker-lint.sh` falla por `sudo` sin TTY y `bash scripts/m3-06-smoke.sh` queda bloqueado porque no hay PHP CLI local. Esos puntos quedan como **WARNING** con equivalentes Docker pasados.

## Completeness

| Métrica | Valor |
|---|---:|
| Tasks totales | 24 |
| Tasks completas | 23 |
| Tasks incompletas/parciales | 1 |

Task parcial: `4.5` continúa sin marcar por bloqueo de entorno para los comandos exactos. La verificación formal ejecutó equivalentes Docker y un E2E HTTP DB-backed adicional.

## Evidencia de build, lint y tests

| Comando | Resultado | Evidencia |
|---|---|---|
| `bash scripts/php-docker-lint.sh` | ⚠️ BLOQUEADO | `sudo: A terminal is required to authenticate`, exit `1`. No se cuenta como pass. |
| `bash scripts/m3-06-smoke.sh` | ⚠️ BLOQUEADO | `php CLI no disponible en PATH`, exit `2`. No se cuenta como pass. |
| `php -v` | ⚠️ BLOQUEADO | `/bin/bash: php: orden no encontrada`, exit `127`. |
| `docker run --rm -v "$PWD":/workspace -w /workspace ifts14-php84 sh -lc 'find apps/backend-php -path "apps/backend-php/vendor" -prune -o -type f -name "*.php" -exec php -l {} +'` | ✅ PASS | Sin errores de sintaxis en backend PHP, incluidos `DniCipher.php` y `SnapshotEmissionTest.php`. |
| `docker run --rm -v "$PWD/apps/backend-php":/app -w /app ifts14-php84 sh -lc 'php tests/AdminCertificateServiceTest.php && php tests/HttpContractTest.php && php tests/PdfResilienceTest.php'` | ✅ PASS | `OK` en los tres scripts; `HttpContractTest.php` conserva dos notices benignos por `Content-Type` omitido en escenarios negativos. |
| `docker run --rm -v "$PWD/apps/backend-php":/app -w /app ifts14-php84 sh -lc 'php tests/AuthGateTest.php && php tests/NormalizePathTest.php && php tests/EntregaManualTest.php && php tests/AdminCertificateServiceTest.php && php tests/HttpContractTest.php && php tests/PdfResilienceTest.php'` | ✅ PASS | Cubre auth, normalización, entrega manual sin rotación, TokenCipher fail-closed, contrato HTTP y resiliencia PDF. |
| Docker network + `mariadb:10.6` descartable + `IFTS14_TEST_DB_ALLOW_RESET=1 php apps/backend-php/tests/SnapshotEmissionTest.php` | ✅ PASS | `OK SnapshotEmissionTest`; aplica `001→004`, emite, valida snapshot, legacy fallback, fail-closed DNI, rechazo sin asistencias y rollback/orphan cleanup. |
| Docker PHP 8.4 + MariaDB 10.6 descartable + script temporal `http-e2e.php` | ✅ PASS | `OK HTTP emission E2E`; cubrió `POST /admin/certificados` 201, snapshot/token persistidos, validación pública 200, PDF generado sin token como texto, entrega manual 200 sin rotar token y `/reenviar` 404. |
| Docker PHP 8.4 + script temporal `http-missing-dni.php` | ✅ PASS | `OK missing dni_cipher_key fail-closed`; `POST /admin/certificados` responde `500 CONFIGURATION_ERROR` sin DB cuando falta `dni_cipher_key`. |
| Docker PHP 8.4 + reflexión `validatePayload()` sin `alumnoId` | ✅ PASS | `OK missing alumnoId validation`; responde `400 VALIDATION_ERROR`. |
| `git diff -- database/migrations/003_cursos_alumnos_asistencias.sql` | ✅ PASS | Sin diff: `003` no fue modificado. |

Nota operativa: el primer intento de `SnapshotEmissionTest.php` contra MariaDB descartable falló por readiness TCP insuficiente (`Connection refused`). Se reintentó con espera TCP desde la red Docker y pasó. No es falla de producto.

## Matriz de cumplimiento de specs

| Spec / escenario | Evidencia runtime | Resultado |
|---|---|---|
| Emisión exitosa desde alumno y curso | HTTP E2E 201 + `SnapshotEmissionTest.php` | ✅ COMPLIANT |
| Sin asistencias activas certificables | `SnapshotEmissionTest.php` | ✅ COMPLIANT |
| Falla de PDF/commit durante emisión | `SnapshotEmissionTest.php` con commit fallido post-PDF | ✅ COMPLIANT |
| Emisión sin clave externa requerida | `http-missing-dni.php`; `Config::requireDniCipherKey()` | ✅ COMPLIANT |
| Envelope inválido / clave inválida fail-closed | `EntregaManualTest.php`, `AdminCertificateServiceTest.php`, `TokenCipher` checks | ✅ COMPLIANT |
| Payload inválido | `validatePayload()` sin `alumnoId`; `HttpContractTest.php` JSON inválido | ✅ COMPLIANT |
| Auditoría segura sin DNI/token/SQL | Source inspection `safeAudit()` + tests sin exposición de DTO | ✅ COMPLIANT |
| PDO/prepared statements en flujos tocados | Source inspection `AdminCertificateService`, `CertificateValidator`, `streamPdf` | ✅ COMPLIANT |
| `X-Admin-Key` no expuesta en Angular | Búsqueda focalizada en `apps/frontend-angular/src`: sin matches | ✅ COMPLIANT |
| Migración `004` aditiva compatible | Source `004`, DB runtime `001→004`; `003` sin diff | ✅ COMPLIANT |
| Certificado legacy sin vínculos | `SnapshotEmissionTest.php` legacy fallback | ✅ COMPLIANT |
| Snapshot solo con asistencias activas | `SnapshotEmissionTest.php` excluye cancelada/eliminada | ✅ COMPLIANT |
| Datos vivos cambian luego | `SnapshotEmissionTest.php` mantiene snapshot tras mutar asistencia/fecha viva | ✅ COMPLIANT |
| DNI cifrado recuperable con configuración externa | `DniCipher`, HTTP missing key, public validation no-key | ✅ COMPLIANT |
| DTO público válido desde snapshot | HTTP E2E + `SnapshotEmissionTest.php` | ✅ COMPLIANT |
| Certificado legacy sin snapshot | `SnapshotEmissionTest.php` | ✅ COMPLIANT |
| Descifrado de DNI falla cerrado | `SnapshotEmissionTest.php` sin `dni_cipher_key` | ✅ COMPLIANT |
| Inmutabilidad de validación pública | `SnapshotEmissionTest.php` | ✅ COMPLIANT |
| PDF con DNI y fechas asistidas del snapshot | HTTP E2E + `CertificatePdfService` + `SnapshotEmissionTest.php` | ✅ COMPLIANT |
| PDF/QR sin token completo como texto visible | HTTP E2E busca token en PDF; `CertificatePdfService` solo escribe QR URL | ✅ COMPLIANT |
| Generación sincrónica PDF/QR durante emisión | HTTP E2E 201 + PDF persistido | ✅ COMPLIANT |
| Token recuperable para entrega manual sin rotación | `EntregaManualTest.php` + HTTP E2E entrega manual | ✅ COMPLIANT |
| `/reenviar` removido seguro | `HttpContractTest.php` + HTTP E2E 404 | ✅ COMPLIANT |
| Regeneración conserva link | No hay endpoint de regeneración en el alcance del proposal; token recuperable queda cubierto por entrega manual | ⚠️ PARTIAL / fuera de alcance operativo |

**Resumen de cumplimiento**: los escenarios ejecutables del cambio están cubiertos y pasaron. Queda parcial solo la regeneración porque el propio proposal la dejó fuera de alcance operativo.

## Correctness estática

| Foco | Estado | Evidencia |
|---|---|---|
| `004` aditiva; `003` intacta | ✅ | `004` agrega `alumno_id`/`curso_id` nullable con FKs; `git diff` sobre `003` vacío. |
| Emisión desde alumno/curso/asistencias | ✅ | `AdminCertificateService::emitir()` valida payload, carga alumno/curso activos, asistencias activas y snapshot. |
| Snapshot `cert_certificado_fechas` | ✅ | `insertSnapshot()` persiste `curso_fecha_id`, `fecha`, `descripcion`, `orden`. |
| DNI fail-closed | ✅ | `Config::requireDniCipherKey()`, `DniCipher`, `decryptDocumentNumber()` y validator devuelven error seguro. |
| Validación pública desde snapshot + fallback legacy | ✅ | `CertificateValidator::verify()` usa `cert_certificado_fechas` para nuevos y fallback sin `attendedDates` para legacy. |
| Respuesta admin segura | ✅ | DTO admin devuelve `documentMasked`, `tokenPrefix`, URLs; no devuelve DNI completo ni token como campo separado. |
| PDF/QR | ✅ | `CertificatePdfService` recibe `documentNumber`/`attendedDates`; no imprime token como texto, solo QR. |
| Entrega manual | ✅ | `entregaManual()` recupera token cifrado y no abre transacción ni rota token. |
| `/reenviar` | ✅ | No hay ruta implementada; responde `404 NOT_FOUND` seguro. |
| Secrets | ✅ | Config example usa placeholders; búsquedas focalizadas muestran solo valores ficticios en tests/docs. |

## Coherencia con diseño

| Decisión de diseño | Estado | Nota |
|---|---|---|
| FKs nullable vía `004`, sin tocar `003` | ✅ | Cumplido. |
| Reusar `AdminCertificateService::emitir()` | ✅ | Cumplido sin servicio/framework nuevo. |
| Snapshot transaccional | ✅ | Cumplido; rollback/orphan cleanup probado. |
| `dni_cipher_key` externa y fail-closed | ✅ | Cumplido. |
| Fallback legacy sin inventar fechas | ✅ | Cumplido. |
| Sin SMTP/email ni rotación normal | ✅ | Cumplido. |

## Findings

### CRITICAL

Ninguno.

### WARNING

- Los comandos exactos `bash scripts/php-docker-lint.sh` y `bash scripts/m3-06-smoke.sh` siguen bloqueados por entorno local (`sudo` sin TTY y PHP CLI ausente). No se declaran como pass; se cubrieron con equivalentes Docker y E2E HTTP descartables.
- `tasks.md` conserva `4.5` sin marcar por esos bloqueos de entorno. La evidencia de verificación existe, pero el checklist exacto sigue parcial.
- `fault-injection-audit.php` no se ejecutó en esta verificación porque requiere una config demo/test explícita y fixtures esperados; no es bloqueo del cambio principal.

### SUGGESTION

- Convertir el E2E HTTP DB-backed usado en esta verificación en un test versionado para evitar scripts temporales durante próximos `sdd-verify`.
- Ajustar scripts locales para modo no interactivo: evitar `sudo` hardcodeado o proveer variante Docker sin sudo; documentar fallback cuando no hay PHP CLI local.

## Riesgos remanentes

- Producción/staging deben definir `token_encryption_key` y `dni_cipher_key` reales, externas a Git, base64/base64url de 32 bytes. Si faltan, emisión y validación nueva fallan cerrado.
- Aplicar `004` requiere backup y base con `001`, `002`, `003` ya aplicadas.
- cPanel debe tener Composer/vendor y permisos correctos para `certificate_storage_path`; si no, PDF falla cerrado.
- La regeneración excepcional de PDF/token sigue fuera de alcance operativo de este ciclo.

## Veredicto

**PASS WITH WARNINGS**

La implementación cumple los specs ejecutables y el diseño con evidencia runtime suficiente. Las advertencias son de entorno/script exacto y un escenario de regeneración fuera de alcance, no de la lógica principal de emisión desde asistencias.
