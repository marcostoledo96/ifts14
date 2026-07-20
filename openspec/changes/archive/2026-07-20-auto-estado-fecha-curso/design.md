# Design: Auto-gestión de estado de fecha de curso

## Technical Approach

Implementar en `AdminMasterDataService` un helper privado `refreshCourseDateEstado` invocado al final de `recordAttendance` y `voidAttendance` (misma transacción). Recalcula `programada`/`realizada` sin tocar `cancelada`; si el estado entra o sale de `realizada`, reutiliza `syncCertificateSnapshot` / sync masivo existente. El hub FE (N× DELETE + N× POST) no cambia: cada write refresca. Mock Angular replica la regla. Sin migración DB ni cambios en `emitir`.

## Architecture Decisions

| Decisión | Opciones | Elección | Rationale |
|----------|----------|----------|-----------|
| Ubicación | Service vs trigger/cron | Private en `AdminMasterDataService` | Write-path ya dueño de asistencia + sync |
| Sync scope | Solo alumno del write vs todos del curso | Mantener sync por alumno en record/void; `syncAll…` solo si hace falta por transición de fecha con varios vigentes en la misma fecha | Menor churn; alinear con código actual |
| Hub N writes | Batch BE vs aceptar N refresh | Aceptar N | Sin endpoint batch este ciclo |
| Safety-net emitir | Incluir / diferir | Diferir | Proposal |
| Mock curso | Solo `fechaEstado` en Asistencia vs mutar `COURSES_SOURCE` | Ambos | Spec exige fecha del curso en memoria |

## Reglas exactas

```
si estado actual == cancelada → no-op (return)
hoy = now(America/Argentina/Buenos_Aires) como Y-m-d
activas = COUNT asistencias WHERE curso_fecha_id AND eliminado_en IS NULL
nuevo =
  (activas >= 1 AND fecha < hoy) ? realizada : programada
UPDATE estado si nuevo != actual
```

- Same-day (`fecha == hoy`) → `programada`.
- Override manual vía `updateCourseDate` permanece; el próximo write reaplica la regla.

## Data Flow

```
Hub marcar (FE)
  ├─ N× DELETE /admin/asistencias/:id  → voidAttendance
  └─ N× POST  /admin/asistencias       → recordAttendance
         │
         ├─ 1) mutar fila asistencia
         ├─ 2) refreshCourseDateEstado(cursoId, fechaId)
         └─ 3) si prev o nuevo == realizada → syncCertificateSnapshot(alumno, curso)
                (void: sync alumno anulado; record: sync alumno agregado)
         │
Hub emitir/regenerar (después)
  └─ loadActiveAttendances exige cf.estado=realizada  → incluye fecha si auto corrió
```

## Helper (contrato interno)

```php
/** @return array{previous:string, current:string, changed:bool} */
private function refreshCourseDateEstado(int $courseId, int $dateId): array
```

Orden dentro de la TX existente:

1. Mutar asistencia (INSERT / soft-void).
2. Capturar `previous` desde fila fecha (o DTO pre-void).
3. `refreshCourseDateEstado`.
4. Si `previous === 'realizada' || current === 'realizada'` → sync del alumno afectado (misma razón de auditoría que hoy, textos existentes).

Idempotente: re-ejecutar sin cambio de conteo/fecha no escribe ni synca de más si `changed=false` y no hay mutación de asistencia que ya dispare sync… En la práctica: sync si `previous|current === realizada` **y** (asistencia mutó en este request), igual que hoy cuando ya era `realizada`.

## Impacto hub FE (N writes)

| Paso hub | Efecto típico (fecha pasada) |
|----------|------------------------------|
| DELETE intermedio | Sigue `realizada` si quedan activos |
| Último DELETE | → `programada` + sync quita fecha del snapshot del alumno |
| Primer POST | → `realizada` + sync incluye fecha |
| POST siguientes | Ya `realizada`; sync incremental por alumno |

Aceptable; batch diferido. Same-day: queda `programada` → emitir puede fallar (override manual).

## Paridad mock Angular

En `AttendanceMockService.marcar`, tras reemplazar presentes:

1. Calcular `hoy` con `Intl.DateTimeFormat('en-CA', { timeZone: 'America/Argentina/Buenos_Aires' })` (mismo patrón que `attendance-marking-page.hoyIso`).
2. Si no `cancelada`: `nuevoEstado` según regla.
3. Persistir en curso vía `COURSES_SOURCE.guardarFecha` (draft con `id` existente + nuevo `estado`) o mutación interna equivalente del in-memory.
4. Devolver asistencias con `fechaEstado: nuevoEstado`.

`HttpAttendanceService`: sin cambios.

## File Changes

| File | Action | Description |
|------|--------|-------------|
| `apps/backend-php/src/AdminMasterDataService.php` | Modify | helper + llamadas en record/void |
| `apps/backend-php/tests/AdminMasterDataServiceTest.php` y/o `AdminMasterDataHttpTest.php` | Modify | escenarios auto |
| `apps/backend-php/tests/AttendanceRevisionTest.php` | Adjust | fechas programadas que ganan presentes pasados → `realizada` (o fijar fechas pasadas + esperar sync) |
| `apps/frontend-angular/.../attendance-mock.service.ts` | Modify | regla + update curso |
| `apps/frontend-angular/.../attendance-mock.service.spec.ts` | Modify | expectations (hoy: “marcar deja programada”) |
| `database/docs/003-cursos-alumnos-asistencias.md` | Modify | semántica en archive |

## Testing Strategy

| Layer | What | Approach |
|-------|------|----------|
| PHP service/HTTP | pasada+1→realizada; same-day→programada; void último→programada; cancelada intacta | scripts existentes + asserts `estado` |
| PHP revision | sync al entrar/salir `realizada` | ajustar `AttendanceRevisionTest` / `CourseDateRevisionTest` si asumen estado fijo |
| Angular unit | mock regla + curso en memoria | Jasmine en `attendance-mock.service.spec.ts` |
| E2E | fuera de ciclo | — |

## Migration / Rollout

No migration required (ENUM intacto). Deploy código; fechas históricas se corrigen en el próximo write de asistencia o PATCH manual.

## Open Questions

- None bloqueantes. (Opcional futuro: syncAll al pasar a `realizada` si varios vigentes ya tienen asistencia en esa fecha — no requerido para el hub actual.)
