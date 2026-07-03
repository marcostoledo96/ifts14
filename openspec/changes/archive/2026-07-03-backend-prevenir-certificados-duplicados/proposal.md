# Propuesta: Prevenir certificados vigentes duplicados

## Intención

Resolver HIGH-02: impedir que Bedelía emita un segundo certificado vigente para el mismo `alumno_id + curso_id`. El sistema debe responder `409 CERTIFICATE_ALREADY_EXISTS` sin exponer datos sensibles y sin rotar token/QR.

## Alcance

### Incluido
- Chequeo de duplicado activo dentro de la transacción de emisión, antes del `INSERT`.
- Migración `005` con columna generada e índice único para cerrar la carrera concurrente.
- Error administrativo seguro `409 CERTIFICATE_ALREADY_EXISTS`.
- Tests DB-backed: duplicado rechaza, revocación libera slot, `estado='vencido'` libera slot, `vence_en` pasado con `estado='vigente'` bloquea.
- Actualización de spec y contrato backend afectados.

### Excluido
- Política de regeneración, reemplazo de auth, frontend, email/reenvío, rotación de token y otros hallazgos de auditoría.

## Capacidades

### Nuevas capacidades
- Ninguna.

### Capacidades modificadas
- `admin-certificate-emission`: agrega prevención de certificado vigente duplicado por alumno y curso.
- `backend-contrato-api-certificados`: documenta `409 CERTIFICATE_ALREADY_EXISTS` para emisión administrativa.

## Enfoque

Agregar `database/migrations/005_prevenir_certificados_duplicados.sql` con `certificado_bloqueo_activo` generado y `UNIQUE(alumno_id, curso_id, certificado_bloqueo_activo)`. Mantener en `AdminCertificateService::emitir()` el chequeo temprano por `alumno_id`, `curso_id`, `estado='vigente'` y `revocado_en IS NULL`; mapear el `PDOException 23000` del índice a `AdminCertificateException(409, 'CERTIFICATE_ALREADY_EXISTS', ...)`.

## Áreas afectadas

| Área | Impacto | Descripción |
|------|---------|-------------|
| `database/migrations/005_prevenir_certificados_duplicados.sql` | Creado | Columna generada e índice único para bloqueo DB. |
| `apps/backend-php/src/AdminCertificateService.php` | Modificado | Chequeo pre-INSERT y mapeo del índice único a 409. |
| `apps/backend-php/tests/SnapshotEmissionTest.php` | Modificado | Escenarios DB-backed de duplicado y revocación. |
| `apps/backend-php/tests/HttpEmissionE2eTest.php` | Modificado | Segundo POST debe responder 409; revocar habilita nueva emisión. |
| `docs/backend/01-contrato-api-certificados.md` | Modificado | Error 409 documentado. |
| `openspec/specs/admin-certificate-emission/spec.md` | Modificado | Nuevo requisito y escenarios. |

## Riesgos

| Riesgo | Probabilidad | Mitigación |
|--------|--------------|------------|
| Duplicados activos existentes antes de migrar | Baja | Preflight obligatorio: resolver filas duplicadas antes del ALTER. |
| Test existente que reusa alumno+curso | Baja | Revocar certificado previo o usar otro par en el test. |
| Certificados legacy con FKs nulas | Baja | No entran en el chequeo; documentado como alcance aceptado. |

## Plan de reversión

Revertir la llamada/mapeo PHP, quitar escenarios agregados y remover la documentación/spec del 409. Para base, solo con backup aprobado: dropear `uq_cert_certificados_alumno_curso_activo` y `certificado_bloqueo_activo`.

## Dependencias

- MariaDB descartable para tests DB-backed (`IFTS14_TEST_DB_DSN` y reset habilitado).

## Criterios de éxito

- [ ] Segundo certificado vigente para mismo alumno+curso responde `409 CERTIFICATE_ALREADY_EXISTS`.
- [ ] Certificado revocado libera el slot para nueva emisión.
- [ ] `estado='vencido'` libera el slot para nueva emisión.
- [ ] `vence_en` pasado con `estado='vigente'` sigue bloqueando.
- [ ] Respuestas, logs y auditoría no exponen DNI completo, token completo, SQL ni secretos.
