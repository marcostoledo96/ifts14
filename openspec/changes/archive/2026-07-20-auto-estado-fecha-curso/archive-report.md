# Archive report — auto-estado-fecha-curso

**Fecha**: 2026-07-20
**Veredicto verify**: PASS WITH WARNINGS (autoriza archive)
**Destino**: `openspec/changes/archive/2026-07-20-auto-estado-fecha-curso/`
**Modo**: hybrid (OpenSpec + Engram)

## Gate de cierre

- Tasks: 16/16 `[x]` (sin pendientes)
- CRITICAL en verify: ninguno
- Warnings no bloqueantes: fixture emit solo-`programada`; wording snapshot vs sync-on-void

## Specs sincronizadas

| Dominio | Acción | Detalle |
|---|---|---|
| `admin-master-data-api` | Updated | +1 ADDED: Auto-gestión de estado de fecha tras escritura de asistencias |
| `admin-attendances-frontend` | Updated | +1 ADDED: Paridad de estado de fecha en fuente mock |
| `admin-certificate-emission` | Updated | +1 ADDED: Definición de asistencias certificables; 1 MODIFIED: Snapshot inmutable (solo certificables/`realizada`) |

## Documentación actualizada en archive

- `docs/backend/01-contrato-api-certificados.md` — auto-estado post-asistencia; emisión solo certificables (`realizada`)
- `docs/backend/00-php84-api.md` — filas de asistencias y emisión
- `docs/frontend/asistencias-marking.md` — nota de paridad mock
- `database/docs/003-cursos-alumnos-asistencias.md` — ya documentado en apply (sin migración ENUM)

## Entregado (ciclo)

- Backend: `refreshCourseDateEstado` en write-path de asistencias (`record`/`void`); TZ `America/Argentina/Buenos_Aires`; `cancelada` intacta
- Tests PHP: `AutoCourseDateEstadoTest` + ajustes `AttendanceRevisionTest`; CI workflow
- Frontend mock: misma regla en `ATTENDANCE_SOURCE`; HTTP hereda DTO
- Emisión: snapshot solo fechas `realizada`; refresh en `emitir` diferido

## Observaciones Engram (trazabilidad)

| Fase | topic_key | id |
|---|---|---|
| explore | `sdd/auto-estado-fecha-curso/explore` | #7068 |
| proposal | `sdd/auto-estado-fecha-curso/proposal` | #7069 |
| spec | `sdd/auto-estado-fecha-curso/spec` | #7070 |
| decision | ciclo | #7071 |
| design | `sdd/auto-estado-fecha-curso/design` | #7072 |
| tasks | `sdd/auto-estado-fecha-curso/tasks` | #7073 |
| apply | `sdd/auto-estado-fecha-curso/apply-progress` | #7074 |
| verify | `sdd/auto-estado-fecha-curso/verify` | #7075 |

## Contenido del archive

- proposal.md ✅
- exploration.md ✅
- design.md ✅
- specs/ ✅
- tasks.md ✅ (16/16)
- verify-report.md ✅
- archive-report.md ✅

## Siguiente

Ciclo SDD cerrado. Seguimiento opcional: fixture emit solo-`programada`; safety-net de refresh en `emitir` (diferido a propósito).
