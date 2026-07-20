# Tasks: Auto-gestión de estado de fecha de curso

## Review Workload Forecast

| Field | Value |
|-------|-------|
| Estimated changed lines | 320–420 |
| 400-line budget risk | Medium |
| Chained PRs recommended | No |
| Suggested split | PR único |
| Delivery strategy | ask-on-risk |
| Chain strategy | pending |

Decision needed before apply: No
Chained PRs recommended: No
Chain strategy: pending
400-line budget risk: Medium

### Suggested Work Units

| Unit | Goal | Likely PR | Focused test command | Runtime harness | Rollback boundary |
|------|------|-----------|----------------------|-----------------|-------------------|
| 1 | BE refresh + tests PHP + mock FE + Jasmine + nota docs | PR único | `php apps/backend-php/tests/AdminMasterDataServiceTest.php` + `npx ng test --include=**/attendance-mock.service.spec.ts` | Hub marcar fecha pasada → emitir (manual/local) | Revert `AdminMasterDataService` + mock + tests |

## Phase 1: RED — tests PHP (admin-master-data-api)

- [x] 1.1 RED: en `AdminMasterDataServiceTest.php` (o HTTP), assert fecha pasada + `recordAttendance` → `estado=realizada` (spec: Fecha pasada con presente).
- [x] 1.2 RED: same-day / futura + presente → `programada`.
- [x] 1.3 RED: void último presente en `realizada` → `programada` + sync (`contenido_revision`/`pdf_estado` si hay vigente).
- [x] 1.4 RED: `cancelada` rechaza registro y estado intacto.

## Phase 2: GREEN — backend

- [x] 2.1 Agregar `refreshCourseDateEstado` privado en `AdminMasterDataService.php` (TZ `America/Argentina/Buenos_Aires`, reglas design).
- [x] 2.2 En `recordAttendance`: mutar → refresh → sync si prev|current `realizada`.
- [x] 2.3 En `voidAttendance`: mutar → refresh → sync si prev|current `realizada`.
- [x] 2.4 GREEN: pasar 1.1–1.4.
- [x] 2.5 Ajustar `AttendanceRevisionTest.php` si asume `programada` con presentes pasados (esperar `realizada` o fechas fijas).

## Phase 3: RED→GREEN — mock FE (admin-attendances-frontend)

- [x] 3.1 RED: en `attendance-mock.service.spec.ts`, fecha `< hoy` + marcar → `fechaEstado` y curso `realizada` (reemplaza expect `programada` actual).
- [x] 3.2 RED: same-day → `programada`; marcar vacío sobre `realizada` → `programada`.
- [x] 3.3 GREEN: en `attendance-mock.service.ts`, regla + `COURSES_SOURCE.guardarFecha` / mutación equivalente; cancelada sigue rechazada.
- [x] 3.4 Verificar `HttpAttendanceService` sin cambios de contrato.

## Phase 4: Docs + verify

- [x] 4.1 Nota breve en `database/docs/003-cursos-alumnos-asistencias.md` (semántica auto; sin migración).
- [x] 4.2 Corrida focal: tests PHP tocados + `attendance-mock.service.spec.ts`.
- [x] 4.3 Smoke opcional: cubierto por `AutoCourseDateEstadoTest` (emitir tras auto→realizada + void sync).
