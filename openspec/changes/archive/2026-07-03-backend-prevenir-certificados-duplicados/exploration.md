# Exploración — backend-prevenir-certificados-duplicados

## Cambio

`backend-prevenir-certificados-duplicados` — implementar HIGH-02 del informe `IFTS14_auditoria_backend_y_plan_descarga_qr.md` (lectura local sin stagear). Sólo este hallazgo: impedir que `POST /certificados/api/admin/certificados` emita más de un certificado vigente para el mismo `alumno_id + curso_id`; ante duplicado, responder `409 CERTIFICATE_ALREADY_EXISTS`. Test DB-backed obligatorio.

Diferido explícito: HIGH-03 (regeneración), HIGH-04 (auth real), HIGH-05 (gates deploy), MEDIUM-01..06, LOW-01..02, rate limiter, body size, `dni_hash_key` separado, rotación de token, email, frontend.

## Estado actual

`AdminCertificateService::emitir()` (apps/backend-php/src/AdminCertificateService.php:45) ejecuta la secuencia:

1. `validatePayload` (alumnoId/cursoId/issuedAt/expiresAt).
2. `loadActiveStudent` (alumno `activo`).
3. `loadActiveCourse` (curso `activo`).
4. `loadActiveAttendances` (alumno + curso, no eliminadas, fecha `programada|realizada`).
5. `loadInstitutionalConfig` (id=1).
6. Descifra DNI, calcula hash y máscara.
7. Genera token + hash + prefijo + cifrado + código público.
8. `beginTransaction()`.
9. `INSERT cert_certificados (alumno_id, curso_id, ...)` con `estado='vigente'`.
10. `INSERT cert_tokens_verificacion`.
11. `insertSnapshot` con fechas.
12. `generatePdfWithinTransaction`.
13. `commit()`.

No existe lectura previa que pregunte "¿ya hay un certificado vigente para este alumno+curso?". La migración `004_certificados_alumno_curso.sql` ya dejó `alumno_id` y `curso_id` en `cert_certificados` (nullable) con FKs a `cert_alumnos` y `cert_cursos` y dos índices simples `idx_cert_certificados_alumno` y `idx_cert_certificados_curso`, pero **ninguna restricción única funcional** que impida vigentes duplicados.

Confirmación independiente vía `codegraph_explore` y `grep`:
- 5 llamadores de `AdminCertificateService::emitir` (`apps/backend-php/index.php:332`, `index.php:345`, `tests/SnapshotEmissionTest.php:79`, `SnapshotEmissionTest.php:100`, `SnapshotEmissionTest.php:153`, `SnapshotEmissionTest.php:173`).
- `admin-certificate-emission/spec.md` lista 9 escenarios; ninguno cubre duplicado.
- `docs/backend/01-contrato-api-certificados.md` registra `400 VALIDATION_ERROR` por "sin asistencias activas", pero no menciona `409` por duplicado.
- `HttpEmissionE2eTest` ya ejecuta emisión + reset; el assert de la línea 117–127 acepta 201 sin chequear segundo intento.

Definición de "vigente" que ya usa el proyecto (consistente con `loadManualDeliveryData` en `AdminCertificateService.php:295-309`):

```sql
estado = 'vigente'
AND revocado_en IS NULL
AND revocado_en IS NULL
```

Un certificado revocado (o expirado por `vence_en`) NO bloquea nueva emisión. Un certificado legacy con `alumno_id` y `curso_id` `NULL` no entra en este chequeo — suplantación legítima para ciclo MVP, documentada como riesgo aceptado.

## Áreas afectadas

- `apps/backend-php/src/AdminCertificateService.php` — agregar chequeo pre-INSERT y mapeo de duplicate key del índice único.
- `apps/backend-php/tests/SnapshotEmissionTest.php` — agregar escenario DB-backed "segunda emisión del mismo alumno+curso responde 409". Ajustar línea 100 (fallback institucional) para que el segundo `emitir` no choque con el primero (opciones: revocar antes, cambiar alumnoId, o usar un segundo curso).
- `apps/backend-php/tests/HttpEmissionE2eTest.php` — extender con segundo `POST /admin/certificados` para mismo alumno+curso, assert `409 CERTIFICATE_ALREADY_EXISTS`, luego revocar y reintentar para confirmar que `200/201` vuelve a estar disponible.
- `docs/backend/01-contrato-api-certificados.md` — agregar `409 CERTIFICATE_ALREADY_EXISTS` a la tabla de errores del endpoint `POST /admin/certificados` y a la tabla general de sobre de errores.
- `openspec/specs/admin-certificate-emission/spec.md` — requisito "Prevención de duplicado vigente" con escenarios Given/When/Then para: (a) duplicado 409, (b) tras revocar, nueva emisión 201, (c) `estado='vencido'` libera, (d) `vence_en` pasado con `estado='vigente'` bloquea, (e) certificados legacy con `alumno_id`/`curso_id` nulos no entran en el chequeo.

## Approaches

### 1. Chequeo emit-time dentro de la transacción (recomendado para MVP)

- **Descripción**: agregar un método privado `assertNoActiveCertificateForPair(int $alumnoId, int $cursoId): void` en `AdminCertificateService` que ejecute `SELECT id FROM cert_certificados WHERE alumno_id = ? AND curso_id = ? AND estado = 'vigente' AND revocado_en IS NULL LIMIT 1` y lance `AdminCertificateException(409, 'CERTIFICATE_ALREADY_EXISTS', '...')` si encuentra fila. Invocarlo como primera línea dentro del bloque `try` de `emitir()`, justo después de `beginTransaction()` y antes del `INSERT cert_certificados`.
- **Pros**:
  - 0 cambios de esquema. 0 migraciones nuevas.
  - Cierra la mayoría de los casos (doble click de Bedelía, doble submit del front, reintento de script).
  - Lectura barata contra índice `idx_cert_certificados_alumno` (selectividad alta por par).
  - Mismo predicado que ya usa `loadManualDeliveryData` (mismo significado de "vigente").
  - `respondToAdmin` (index.php:578) ya mapea `AdminCertificateException` a `Response::error($status, $errorCode, ...)`, así que el sobre seguro `error.code = CERTIFICATE_ALREADY_EXISTS` sale automático.
- **Contras**:
  - No es atómico bajo concurrencia: dos requests concurrentes podrían pasar el SELECT a la vez. Riesgo real: bajo (cPanel mono-nodo, Bedelía operativa, sin automatización). Detectado, el segundo `INSERT` insertaría fila `vigente` redundante hasta el próximo reintento que sí lo detectaría.
  - Si en el futuro se introduce concurrencia real, hay que volver a tocar.
- **Esfuerzo**: Bajo. ~15 líneas PHP (método + invocación + comentario ponytail). 1 método nuevo, 1 llamada, 0 dependencias.

### 2. Restricción única vía columna generada `vigente_activo` (belt-and-suspenders)

- **Descripción**: nueva migración `005` con `ALTER TABLE cert_certificados ADD COLUMN certificado_bloqueo_activo TINYINT AS (CASE WHEN estado = 'vigente' AND revocado_en IS NULL THEN 1 ELSE NULL END) STORED, ADD UNIQUE KEY uq_cert_certificados_alumno_curso_activo (alumno_id, curso_id, certificado_bloqueo_activo)`. En `emitir()`, capturar `PDOException` con SQLSTATE 23000 sobre esa constraint y mapear a `409 CERTIFICATE_ALREADY_EXISTS`. El check emit-time puede quedar como mensaje de error legible antes del INSERT.
- **Pros**:
  - Cierre de carrera real incluso bajo concurrencia (la DB rechaza el segundo INSERT).
  - Mismo patrón que ya usa `cert_asistencias.asistencia_activa` + `UNIQUE(alumno_id, curso_fecha_id, asistencia_activa)` (migración 003) — MariaDB permite múltiples `NULL`, así que un certificado revocado/expirado libera el slot sin violar la unicidad.
  - Documenta la regla en el modelo, no sólo en el servicio.
- **Contras**:
  - Migración nueva: requiere backup aprobado, gate de deploy, ventana de aplicación. `004` ya tiene gate de deploy abierto (HIGH-05). Acumular más migraciones sin cerrar gates previos.
  - Toca el modelo de datos (`backend-modelo-datos-certificados/spec.md`) con un requirement nuevo, lo que arrastra `sdd-archive` con delta en esa spec.
  - Mensaje SQLSTATE 23000 es genérico: hay que mapear a `CERTIFICATE_ALREADY_EXISTS` desde el catch.
  - El chequeo emit-time sigue siendo deseable para devolver error claro sin esperar al INSERT (mejor UX: 409 limpio sin rollback forzado por SQLSTATE).
- **Esfuerzo**: Medio. ~30 líneas PHP + ~30 líneas SQL + doc por spec.

### 3. Híbrido (emisión + DB)

- **Descripción**: el chequeo emit-time del Approach 1 + migración `005` con la unique. Defensiva en profundidad.
- **Pros**: lo mejor de ambos.
- **Contras**: doble implementación, doble superficie a mantener, doble prueba. YAGNI para MVP.
- **Esfuerzo**: Alto.

## Recomendación

**Approach 1**. Es el MVP mínimo seguro para el escenario real (cPanel mono-nodo, Bedelía operativa, sin reintento concurrente automatizado). Cumple el requirement del audit sin tocar esquema, sin nueva migración y sin arrastrar cambios a `backend-modelo-datos-certificados/spec.md`. Approach 2 queda como upgrade explícito en un ciclo futuro si se observa concurrencia real; se documenta en el follow-up del `tasks.md` del ciclo para que no se olvide. La regla es: ante la duda entre mínimo y completo, dejar el completo para cuando haga falta evidencia, no para cuando se imagine.

Detalles de implementación mínimos:

- `AdminCertificateService::emitir()` línea 65 actual (`$this->pdo->beginTransaction();`): insertar el chequeo inmediatamente después, con comentario `// ponytail: validar unicidad vigente antes de INSERT; mismo predicado que loadManualDeliveryData`. Lanzar `AdminCertificateException(409, 'CERTIFICATE_ALREADY_EXISTS', 'Ya existe un certificado vigente para este alumno y curso.')` si la SELECT devuelve fila.
- `auditoría`: registrar el rechazo en `safeAudit('emision', 'rechazado', ['certificado_id' => null])` — ya cubierto por el `catch (AdminCertificateException)` del bloque try (línea 119). Sólo hay que confirmar que el detalle no expone alumno/curso/IDs; usar `detalle_seguro` genérico "Operación administrativa rechazada." (ruta actual del método).
- `tests/SnapshotEmissionTest.php`: agregar escenario "DADO un certificado vigente para alumno+curso, CUANDO se reintenta `emitir` con el mismo par, ENTONCES debe lanzar `AdminCertificateException(409, 'CERTIFICATE_ALREADY_EXISTS')` y `tableCounts` no debe crecer". Línea 100 (fallback institucional) requiere ajuste: el segundo `emitir` actual chocaría con el primero. Solución de un solo cambio: revocar el primero (`UPDATE cert_certificados SET estado='revocado', revocado_en=NOW() WHERE id = ?`) antes del segundo, o cambiar a un segundo par alumno/curso. Recomiendo revocar el primero porque (a) testea que revocar libera el slot, (b) mantiene el escenario de fallback con el mismo par.
- `tests/HttpEmissionE2eTest.php`: agregar segundo `POST /admin/certificados` con mismo alumno/curso, `assertError($second, 409, 'CERTIFICATE_ALREADY_EXISTS', ...)`. Luego `POST /admin/certificados/{id}/revocar` y un tercer `POST /admin/certificados` que ahora debe ser 201 (libera el slot).
- `docs/backend/01-contrato-api-certificados.md`: agregar `409 CERTIFICATE_ALREADY_EXISTS` en la sección "Sobre de errores" (después de `CONFLICT` en línea 391) y en la sección específica de `POST /admin/certificados` después de "Sin asistencias activas". El mensaje del error debe ser genérico y no incluir IDs de filas.
- `openspec/specs/admin-certificate-emission/spec.md`: nuevo requisito "Prevención de duplicado vigente" con los cuatro escenarios mencionados arriba. Conserva español argentino formal. Mantener RFC 2119 (`MUST`/`DEBE`).

Concurrencia: el diseño correctivo aplica Approach 2 con migración `005`, columna generada determinística e índice único. Las lecturas previas (`loadActiveStudent`, `loadActiveCourse`, `loadActiveAttendances`, `loadInstitutionalConfig`, `decryptDocumentNumber`) siguen fuera de la transacción y pertenecen a una deuda separada; el índice cierra específicamente la duplicación activa por `alumno_id + curso_id`.

## Riesgos

- **Carrera concurrente (Bajo / aceptado)**: dos `POST` simultáneos pueden emitir dos certificados. Probabilidad operativa mínima; el siguiente `POST` detectará el segundo duplicado. Subir a Approach 2 si se observa concurrencia real.
- **Certificados legacy con `alumno_id` y `curso_id` NULL (Bajo / aceptado)**: el chequeo emit-time por par no los considera. Si dos legacy futuros llegasen a tener los mismos datos denormalizados, no se bloquean. Aceptable porque (a) legacy es histórico, (b) el modelo actual no permite nuevos sin FKs desde `004`.
- **Cambio de `SnapshotEmissionTest` línea 100 (Bajo)**: el escenario de "fallback institucional ausente" reusa el mismo alumno+curso y actualmente espera un segundo 201. Requiere revocar antes o usar otro par. Documentado en tasks.md.
- **`SnapshotEmissionTest` con `IFTS14_TEST_DB_DSN`** (existente, no introducido por este ciclo): requiere DB MariaDB descartable con `IFTS14_TEST_DB_ALLOW_RESET=1`. Mismo gate que los otros tests DB-backed.
- **Gates de deploy previos (existente, no introducido)**: HIGH-05 (migraciones 001–004 sin aplicar, `vendor/` stale) sigue abierto. Approach 1 no agrega migraciones, por lo que este ciclo **no empeora** HIGH-05.
- **`X-Admin-Key` temporal (HIGH-04)**: fuera de alcance. El nuevo 409 respeta el sobre seguro existente.

## Listo para proposal

**Sí**. El approach 1 está acotado, sin migración nueva, con tests DB-backed ya preparados en el repositorio (mismo patrón que `SnapshotEmissionTest`/`HttpEmissionE2eTest`). El orquestador puede proceder con `propose → spec → design → tasks → apply → verify → archive`. Recomendación: agrupar las tareas por archivo (servicio, test unit, test HTTP, doc, spec) y mantener el plan de reversión en `proposal.md` (rollback = quitar método y llamada, no hay migración que revertir). El follow-up sobre Approach 2 queda como item explícito en el `tasks.md` bajo "Defer" con la condición de upgrade (concurrencia observada).
