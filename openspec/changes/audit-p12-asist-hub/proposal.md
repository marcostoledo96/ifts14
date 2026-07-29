# Proposal: Auditoría P12 — hub de asistencias

## Intent

Cerrar el gap PERF P12 en `/admin/asistencias`: agregación de `fechasConPresentes` con `hub.fechas.some` anidado (O(n²)). Checklist funcional ya OK (filas=cursos, métricas N/M, búsqueda, pager 20, vacíos, Reintentar/`loadGen`, sin PII). Misma semántica; índice lineal.

## Scope

### In Scope

- Refactor `AttendancesListPage.cargar`: Set/Map O(n); excluir `cancelada`; no usar `alumnosActivos`.
- Tests de métricas post-refactor (cancelada + presentes no cuentan).
- Design/tasks del algoritmo lineal.
- Delta mínimo `admin-attendances-frontend`: escenario agregación lineal / semántica.
- Opcional: un solo `toAsistencia` en `HttpAttendanceService.listarHub`.
- Si se toca HTTP: documentar `listarHub` en `frontend-http-services`.

### Out of Scope

- P13 intermedia, P14 marcado, backend, rediseño vs `muestra_pagina/`.
- `AttendanceMockService.listarHub` (intacto).
- Cambios de copy/UI salvo regresión.

## Capabilities

### New Capabilities

None

### Modified Capabilities

- `admin-attendances-frontend`: ADDED bajo «Listado global solo por curso» — agregación lineal; `cancelada` excluida; sin `alumnosActivos` como total.
- `frontend-http-services`: **condicional** si se edita HTTP — escenario `listarHub` (GET hub, mapeo DTO; mismo contrato).

## Approach

Auditoría quirúrgica (explore #1): índice O(1) de fechas asistibles y conteo lineal; UI intacta. HTTP double-map solo si cabe; mock omitido. Tests + design llevan PERF; ADDED fija aceptación.

## Affected Areas

| Area | Impact | Description |
|------|--------|-------------|
| `attendances-list-page.ts` | Modified | Agregación lineal en `cargar` |
| `attendances-list-page.spec.ts` | Modified | Semántica métricas |
| `attendances-list-page.html` | Unchanged | Hoy OK |
| `http-attendance.service.ts` | Optional | Un `toAsistencia` en `listarHub` |
| `attendance-mock.service.ts` | Unchanged | Fuera |
| `admin-attendances-frontend` | Modified | Delta ADDED lineal |
| `frontend-http-services` | Conditional | Solo si HTTP editado |

## Risks

| Risk | Likelihood | Mitigation |
|------|------------|------------|
| Semántica métricas al refactor | Med | Tests cancelada; mismos N/M |
| Scope creep P13/P14/backend | Low | Solo list (+ HTTP opcional) |
| Spec `listarHub` sin tocar HTTP | Low | Condicional al edit HTTP |
| Presupuesto 400 LOC | Low | Diff quirúrgico |

## Rollback Plan

Revertir PR de `attendances-list-page.*` (+ HTTP/deltas si entraron); sin migración ni backend.

## Dependencies

- Explore P12 + defaults (PERF página; HTTP opcional; mock fuera; ADDED lineal).
- Spec «Listado global solo por curso».

## Success Criteria

- [ ] `cargar` en O(n); mismos N/M; cancelada excluida.
- [ ] Suite hub verde; caso cancelada/presentes.
- [ ] Checklist P12 OK; sin PII/DNI en hub.
- [ ] Delta ADDED; `frontend-http-services` solo si HTTP tocado.
- [ ] Sin P13/P14/mock/backend.
