# Tasks: Detalle de alumno — habilitar acciones

## Review Workload Forecast

| Field | Value |
|-------|-------|
| Estimated changed lines | 280–420 |
| 400-line budget risk | Medium |
| Chained PRs recommended | No |
| Suggested split | single cycle |
| Delivery strategy | exception-ok |
| Chain strategy | size-exception |

Decision needed before apply: No
Chained PRs recommended: No
Chain strategy: size-exception
400-line budget risk: Medium

### Suggested Work Units

| Unit | Goal | Likely PR | Focused test command | Runtime harness | Rollback boundary |
|------|------|-----------|----------------------|-----------------|-------------------|
| 1 | Emisión CTAs + query preselect + asistencias seam/UI | single | `ng test --include='**/student-detail-page.spec.ts' --include='**/certification-new-page.spec.ts' --include='**/http-attendance.service.spec.ts' --include='**/attendance-mock.service.spec.ts'` | N/A (Karma unit; no E2E gate this cycle) | detail + new-page + attendance seam |

## Phase 1: Seam asistencias

- [x] 1.1 RED: tests `listarAsistenciasPorAlumno` en HTTP + mock
- [x] 1.2 GREEN: método en `attendance.types.ts`, HTTP (`?alumnoId=`), mock filter
- [x] 1.3 Actualizar stubs de `AttendanceService` en specs afectados (marking, courses, no-real-data)

## Phase 2: Preselect emisión (TDD)

- [x] 2.1 RED: `certification-new-page.spec` — query válida preselect + inválida aviso
- [x] 2.2 GREEN: leer `queryParamMap` post-catálogos; set ids; aviso no bloqueante; `cargarPar` si ambos

## Phase 3: Detalle CTAs + asistencias UI

- [x] 3.1 RED: invertir asserts disabled; CTAs query; motivos sin F2-05; sección asistencias
- [x] 3.2 GREEN: links Nueva/Emitir; toggle Ver asistencias + estados; Compartir/Editar copy
- [x] 3.3 CSS mínimo para sección asistencias (alineado al detalle)

## Phase 4: Cierre apply

- [x] 4.1 Correr tests focalizados verdes
- [x] 4.2 Marcar tasks `[x]` + `apply-progress.md`
- [x] 4.3 Persist Engram `apply-progress` (ready for verify, no archive)
