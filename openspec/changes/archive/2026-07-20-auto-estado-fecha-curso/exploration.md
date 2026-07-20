## Exploration: auto-estado-fecha-curso

### Current State

**DB** (`database/migrations/003_cursos_alumnos_asistencias.sql`):
- `cert_curso_fechas.estado` ENUM(`programada`, `realizada`, `cancelada`) NOT NULL DEFAULT `programada`.
- Sin triggers ni jobs. El valor es persistido y solo cambia por API.

**Backend** (`AdminMasterDataService`):
- `createCourseDate`: default `programada` si el body no manda `estado`; acepta los tres valores del enum.
- `updateCourseDate`: PATCH manual de `estado`; si el estado actual o nuevo es `realizada` y hay cambios, sincroniza snapshots de certificados vigentes (`syncAllCourseCertificatesSnapshots`).
- `recordAttendance` / `voidAttendance`: permiten fechas `programada` o `realizada` (`ensureEligibleCourseDate`); bloquean `cancelada`. **No auto-transicionan** el estado de la fecha.
- Sync de snapshot al agregar/anular asistencia **solo si** `fechaEstado === 'realizada'`.
- No existe endpoint batch de asistencias: el FE hace N× DELETE + N× POST.

**Emisión / PDF** (`AdminCertificateService`):
- `emitir` → `loadActiveAttendances` filtra `a.eliminado_en IS NULL AND cf.estado = 'realizada'`. Sin fechas `realizada` con presentes → `400 VALIDATION_ERROR`.
- `regenerarPdf` lee el snapshot ya persistido en `cert_certificado_fechas` (no recalcula desde asistencias vivas). El snapshot se actualiza vía sync master-data cuando la fecha es/era `realizada`.
- Zona horaria ya usada en emisión: `America/Argentina/Buenos_Aires` (`validatePayload` / listados).

**Frontend**:
- Modelos: `EstadoFecha = 'programada' | 'realizada' | 'cancelada'`.
- Hub marcado (`attendance-marking-page`): `guardarYGenerar` → `attendance.marcar` → luego `emitir` / `regenerarPdf` por presente. No toca `estado` de fecha.
- `HttpAttendanceService.marcar`: orquesta DELETE existentes + POST presentes; propaga `fechaEstado` del DTO backend sin mutarlo.
- Mock: permite marcar en `programada` y deja `fechaEstado: 'programada'` (tests lo afirman).
- Editor de curso: dropdown manual de estado por fecha (`programada`/`realizada`/`cancelada`); nuevas fechas default `programada`; `reemplazarFechas` persiste el valor elegido.
- Listado asistencias / detalle curso: filtran/etiquetan por estado; `cancelada` no es asistible.

**Hueco de producto (cerrado por decisión)**: marcar presentes en fecha pasada deja la fecha en `programada` → emisión no incluye esa fecha en el snapshot → «Guardar y generar certificados» falla o emite sin esa clase.

### Affected Areas

- `apps/backend-php/src/AdminMasterDataService.php` — punto principal: helper de refresco + llamadas desde `recordAttendance` / `voidAttendance` (y opcionalmente `updateCourseDate` / `emitir`).
- `apps/backend-php/src/AdminCertificateService.php` — impacto indirecto vía filtro `realizada`; posible safety-net al emitir.
- `apps/backend-php/tests/AdminMasterDataServiceTest.php`, `AdminMasterDataHttpTest.php`, `AttendanceRevisionTest.php`, `CourseDateRevisionTest.php`, `SnapshotEmissionTest.php` — escenarios auto-transición / anular último presente.
- `openspec/specs/admin-master-data-api/spec.md` — requisitos de auto-gestión `programada`/`realizada`.
- `openspec/specs/admin-certificate-emission/spec.md` — aclarar «asistencias certificables» = activas en fecha `realizada` (post-auto).
- `apps/frontend-angular/.../attendance-mock.service.ts` (+ specs) — paridad mock con auto-estado.
- `apps/frontend-angular/.../course-editor-page.*` — decisión de UI: mantener override manual vs. limitar a `cancelada` / lectura.
- `database/docs/003-cursos-alumnos-asistencias.md` — documentar semántica auto (sin migración si el ENUM no cambia).

### Approaches

1. **Write-path only (recomendado para ciclo 1)** — Tras cada `recordAttendance` / `voidAttendance`, si la fecha no está `cancelada`, recalcular:
   - `realizada` si hay ≥1 asistencia activa **y** `fecha < hoy` (AR);
   - si no, `programada`.
   - Si el estado cruza/involucra `realizada`, disparar sync de snapshots como hoy.
   - Pros: cierra el hueco del hub antes de emitir; sin cron; reutiliza TZ ya usada; cambio acotado al servicio master-data.
   - Cons: `HttpAttendanceService.marcar` hace muchos writes → varios refresh/sync intermedios; fecha de **hoy** con presentes sigue `programada` (según regla cerrada `< hoy`) y el hub same-day sigue fallando hasta mañana o override manual.
   - Effort: Low–Medium.

2. **Write-path + safety-net en `emitir`** — Igual que (1) + al inicio de `emitir`, refrescar estados de fechas del curso (o de las asistencias del alumno) antes de `loadActiveAttendances`.
   - Pros: resiliente si alguien marcó ayer y nadie reabrió asistencias después de medianoche AR; barato.
   - Cons: acopla emisión a reglas de fecha; un poco más de superficie de test.
   - Effort: Medium.

3. **Read-time derivado (no persistir)** — Tratar como certificable `programada` con presentes y fecha pasada solo en SQL de emisión, sin UPDATE.
   - Pros: no pelea con overrides manuales.
   - Cons: chips/listados siguen mostrando `programada`; sync de snapshot / revision no se dispara; regenerar y UI inconsistentes; contradice decisión de persistir auto-estado.
   - Effort: Medium (engañosamente “simple”, alto costo de consistencia). **Descartado.**

4. **Ciclo amplio (BE + FE editor + cron)** — Auto en writes + quitar/limitar dropdown `realizada`/`programada` en editor + cron nocturno.
   - Pros: UX alineada; estados “atrasados” se corrigen sin write.
   - Cons: supera presupuesto de un ciclo; cron no justificado si (1)+(2) cubren el hub.
   - Effort: High.

### Trade-offs de momento de transición

| Momento | Pros | Cons |
|---------|------|------|
| Guardar asistencias (POST/DELETE) | Preferido; alinea estado antes del loop emitir/regenerar del hub | Same-day (`fecha == hoy`) no pasa a `realizada` |
| Al emitir / regenerar (safety-net) | Cubre “pasó la medianoche sin nuevo write” | Regenerar PDF no relee asistencias vivas; el safety-net útil es sobre **estado persistido + sync**, no solo en `regenerarPdf` |
| Read-time | Sin writes | UI/sync/regenerar desalineados |
| Cron nocturno | Limpia estados viejos | Infra/ops; innecesario si write + safety-net en emitir |

### Recommendation

**Ciclo pequeño (opción 1, con safety-net liviano de opción 2 opcional en el mismo ciclo si entra en presupuesto).**

Nombre de change: `auto-estado-fecha-curso`.

Alcance ciclo 1:
1. Helper backend `refreshCourseDateEstado(cursoId, fechaId)` (no tocar `cancelada`).
2. Invocar tras `recordAttendance` y `voidAttendance` (orden: mutar asistencia → refrescar estado → sync si corresponde).
3. Tests PHP: fecha pasada + 1 presente → `realizada`; anular último presente → `programada`; fecha futura con presentes → `programada`; `cancelada` intacta; TZ `America/Argentina/Buenos_Aires`.
4. Paridad mínima mock FE (opcional pero recomendable para no mentir en tests unitarios del mock).
5. Spec delta en `admin-master-data-api` (+ nota en emission).

Fuera / diferido:
- Cron.
- Rediseño completo del editor (solo documentar precedencia: auto puede sobrescribir `programada`↔`realizada` en el próximo write de asistencia; `cancelada` solo manual).
- Endpoint batch de asistencias (nice-to-have para menos syncs).

**Aclaración a cerrar en propose (no reabre la regla `< hoy`, la expone):** el hub «Guardar y generar» el **mismo día** de la clase seguirá sin auto-`realizada`. Opciones de producto para propose: (a) aceptar + override manual `realizada` en editor; (b) cambiar regla a `fecha <= hoy` en un ciclo/decisión explícita.

### Candidate requirements (para propose/spec)

1. `cancelada` SOLO por PATCH/editor manual; nunca auto-inferida; sigue bloqueando asistencia y nunca entra al snapshot.
2. Fecha nueva → `programada` (ya default).
3. Tras escritura de asistencia (alta o anulación), si no está `cancelada`:
   - si hay ≥1 asistencia activa y `fecha < hoy` AR → `realizada`;
   - en caso contrario → `programada`.
4. Transiciones que involucren `realizada` DEBEN mantener el sync de snapshots / `pdf_estado=desactualizado` existente.
5. Emisión DEBE seguir exigiendo asistencias activas en fechas `realizada` (post-auto).
6. Logs/auditoría sin DNI/token completos (sin cambio de política).

### Risks

- **Fecha futura con asistencia**: queda `programada`; no certifica hasta que pase el día — correcto según decisión; UX debe no sorprender.
- **Anular último presente**: debe volver a `programada` y sync debe sacar la fecha del snapshot de certificados vigentes.
- **Edición manual a `realizada`/`programada`**: el próximo write de asistencia puede sobrescribir; conviene documentar (y luego acotar UI).
- **Zona horaria AR**: usar la misma `DateTimeZone` que emisión; comparar solo `Y-m-d` (no hora de clase).
- **Same-day emit**: con regla `fecha < hoy`, marcar hoy + generar hoy falla salvo override manual.
- **Marcar HTTP no atómico**: muchos DELETE/POST → refreshes intermedios; aceptable; batch futuro lo suaviza.
- **Regenerar PDF**: no relee asistencias; depende de que el sync haya corrido al pasar a `realizada` — por eso el write-path es obligatorio, no solo emitir.

### Ready for Proposal

Yes — product decision is closed enough. Orchestrator should run **`sdd-propose`** for `auto-estado-fecha-curso` (ciclo pequeño write-path; aclarar same-day vs override en proposal).
