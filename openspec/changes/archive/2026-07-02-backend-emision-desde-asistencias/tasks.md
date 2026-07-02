# Tasks: emisión backend desde asistencias

## Review Workload Forecast

| Field | Value |
|---|---|
| Lines estimadas | ~900-1100 |
| 400-line risk | High |
| Delivery | single-pr-default |
| Chain | size-exception |

Decision needed before apply: Yes
Chained PRs recommended: No
Chain strategy: size-exception
400-line budget risk: High

## Phase 1: Infrastructure

- [x] 1.1 `database/migrations/004_certificados_alumno_curso.sql`: `alumno_id`/`curso_id` nullable, FKs `RESTRICT/CASCADE`, índices; sin tocar `003`.
- [x] 1.2 `Config::requireDniCipherKey()` en `apps/backend-php/src/Config.php` (base64/base64url → 32 bytes, fail-closed).
- [x] 1.3 `apps/backend-php/src/DniCipher.php` reusando envelope AES-256-GCM de `TokenCipher`; exporta `encrypt`, `decrypt`, `envelopeLooksValid`.
- [x] 1.4 Documentar `dni_cipher_key` placeholder en `certificados-config.example.php` (ficticio, sin secretos).
- [x] 1.5 `database/docs/004-certificados-alumno-curso.md` con pre/post, FKs, link a spec.

## Phase 2: Core

- [x] 2.1 Reescribir `validatePayload()`: exigir `alumnoId` (int ≥1), `cursoId` (int ≥1), `issuedAt`, `expiresAt` opcional; quitar campos libres.
- [x] 2.2 `loadActiveAttendances(PDO, int, int): array`: JOIN `cert_asistencias`+`cert_curso_fechas` con `eliminado_en IS NULL` y `cf.estado IN ('programada','realizada')`; 400 si vacío.
- [x] 2.3 Refactorizar `emitir()`: SELECT alumno/curso activos, snapshot, BEGIN tx, INSERT certificado con FKs, INSERT token, INSERTAR snapshot por fila en `cert_certificado_fechas`, PDF, COMMIT.
- [x] 2.4 Cleanup de PDF en `emitir()`: si `commit()` falla tras escribir PDF, `unlink($pdfPath)` + `rollBack()`; nunca PDF huérfano.
- [x] 2.5 Descifrar DNI con `DniCipher` con `envelopeLooksValid` antes de `decrypt`; fail-closed sin clave o envelope inválido.
- [x] 2.6 `CertificatePdfService::generate()`: aceptar `documentNumber` y `attendedDates` (array) en `viewData`; nunca imprimir token.
- [x] 2.7 Actualizar `verify()`: JOIN `cert_alumnos`+`cert_certificado_fechas`; con FKs/snapshot devolver `documentNumber`+`attendedDates`; legacy mantener `documentMasked`, omitir `attendedDates`.

## Phase 3: Wiring

- [x] 3.1 Inyectar `dniCipherKey` en `AdminCertificateService` desde `index.php` POST `/admin/certificados`; `loadDniCipherKey()` antes; fail-closed 500.
- [x] 3.2 Pasar `dniCipherKey` al validador en `respondToValidation()`; fail-closed si falta al requerir descifrado.
- [x] 3.3 `safeAudit()` con `detalle_seguro` sin DNI, token, `dni_cifrado`, SQL ni rutas.
- [x] 3.4 `/admin/certificados/{id}/reenviar` responde 404/405 seguro sin SMTP/PHPMailer/stub.

## Phase 4: Testing

- [x] 4.1 Extender `AdminCertificateServiceTest.php`: payload `alumnoId/cursoId`, DNI ok, envelope inválido → fail-closed, sin clave → fail-closed.
- [x] 4.2 Actualizar `HttpContractTest.php`: 201 con `publicValidationUrl`/`pdfDownloadUrl`/`tokenPrefix`, 400 sin `alumnoId`, 401 sin `X-Admin-Key`, 500 sin `dni_cipher_key`, 404/405 en `/reenviar`.
- [x] 4.3 Extender resiliencia PDF: guardas de archivo en `PdfResilienceTest.php` y rollback/orphan cleanup de `emitir()` cubierto DB-backed en `SnapshotEmissionTest.php`.
- [x] 4.4 Crear `SnapshotEmissionTest.php` con Docker MariaDB 10.6: emisión OK, rechazo sin activas, DNI fail-closed, asistencia/fecha viva modificada no afecta validación, legacy devuelve fallback, `cf.estado='cancelada'` excluida.
- [x] 4.5 Verificar: `bash scripts/php-docker-lint.sh` + cuatro `php apps/backend-php/tests/*.php` + `bash scripts/m3-06-smoke.sh`. Parcial: comandos exactos con `sudo`/PHP CLI local siguen bloqueados; usar evidencia Docker-equivalente puntual. *(Reconciliado en `sdd-archive` por instrucción explícita del orquestador; comandos exactos siguen WARNING, equivalentes Docker + E2E HTTP DB-backed + `SnapshotEmissionTest.php` + `http-missing-dni.php` aprobaron el alcance. Ver `verify-report` y `apply-progress`.)*

## Phase 5: Docs

- [x] 5.1 `docs/backend/API.md`: payload `alumnoId/cursoId`, DTO `documentNumber`+`attendedDates`, errores `CONFIGURATION_ERROR` seguros.
- [x] 5.2 Actualizar `docs/database/` con migración 004 y `cert_certificado_fechas` como fuente histórica.
- [x] 5.3 Listar `dni_cipher_key` como clave externa obligatoria en `docs/opencode/optimizacion-tokens.md`.

## Trazabilidad spec → task → test

| Spec | Tasks | Tests |
|---|---|---|
| `admin-certificate-emission` | 1.2, 1.3, 2.1, 2.3, 2.4, 3.1, 3.3 | 4.1, 4.2, 4.3, 4.4 |
| `backend-contrato-api-certificados` | 3.1, 3.4 | 4.2 |
| `backend-modelo-datos-certificados` | 1.1, 1.5, 2.2, 2.5 | 4.4 |
| `backend-validacion-publica-certificados` | 2.7 | 4.4 |
| `certificate-pdf-qr-generation` | 2.4, 2.6 | 4.3 |
