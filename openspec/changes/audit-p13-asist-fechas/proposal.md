# Proposal: Auditoría P13 — intermedia de fechas de asistencia

## Intent

Cerrar el gap de honesty P13 en `/admin/asistencias/curso/:id`: **Reintentar** solo ante fallo recuperable de `listarHub`, y título de error distinto para curso no encontrado vs fallo de carga. Checklist funcional (orden, filtros, CTA, empty, ruta) ya OK.

## Scope

### In Scope

- `errorRecuperable` (patrón P08/P11) en `attendance-course-dates-page.*`.
- Reintentar solo en `catch` de `listarHub`; id inválido / curso ausente → solo Volver.
- Título de panel distinto not-found vs carga fallida (copy mínimo, sin PII).
- Tests: Reintentar presente/ausente; conservar orden/filtros/CTA/empty/ruta.
- Delta corto `admin-attendances-frontend` («Página intermedia de fechas del curso»).

### Out of Scope

- Hub P12 (`attendances-list-page`), marcado P14, certificados por fecha.
- HTTP / `listarHub` / backend / contrato del hub.
- Rediseño visual vs `muestra_pagina/`; roster/DNI en esta pantalla (no aplica).

## Capabilities

### New Capabilities

None

### Modified Capabilities

- `admin-attendances-frontend`: «Página intermedia de fechas del curso» — Reintentar solo recuperable; títulos distintos not-found vs carga; id inválido/curso ausente sin Reintentar.

## Approach

Auditoría quirúrgica in-place (explore #1): flag `errorRecuperable`; gate en `onReintentar` y template; copy de título bifurcated; suite focalizada. Sin tocar HTTP ni hub/marcado.

## Affected Areas

| Area | Impact | Description |
|------|--------|-------------|
| `attendance-course-dates-page.ts` | Modified | `errorRecuperable`; flags en id/curso/catch; gate `onReintentar` |
| `attendance-course-dates-page.html` | Modified | Reintentar condicional; título not-found vs carga |
| `attendance-course-dates-page.spec.ts` | Modified | Honesty Reintentar + regresión checklist |
| `admin-attendances-frontend` | Modified | Delta corto intermedia |
| HTTP / hub / marcado | Unchanged | Fuera de alcance |

## Risks

| Risk | Likelihood | Mitigation |
|------|------------|------------|
| Scope creep a hub/marcado | Low | Solo `course-dates` page.* |
| Regresión orden/filtros/CTA | Med | No tocar sort/chips/`linkMarcado`; tests existentes |
| Dejar Reintentar en not-found | Low | Spec + asserts absencia |
| PII en mensajes | Low | Copy fijo sin DNI/token |

## Rollback Plan

Revertir PR de `attendance-course-dates-page.*` y delta de spec; sin migración ni backend.

## Dependencies

- Explore P13 + defaults confirmados; patrón P08/P11 `errorRecuperable`.

## Success Criteria

- [ ] Id inválido / curso ausente: solo Volver; sin Reintentar; título not-found.
- [ ] Catch `listarHub`: Reintentar + Volver; título de carga fallida; `onReintentar` re-llama.
- [ ] Orden cronológico, chips, CTA marcado, empty, ruta intactos; sin PII.
- [ ] Delta `admin-attendances-frontend` OK; sin HTTP/hub/marcado.
