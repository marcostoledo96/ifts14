# Proposal: Auditoría P11 — detalle de alumnos

## Intent

Cerrar gaps de honesty en `/admin/alumnos/:id`: copy sin «legajo», métrica revocadas null → «—» (paridad listado) y Reintentar solo ante fallos recuperables. Trayectoria, links expediente/emitir, DNI completo UI y mensajes sin PII ya OK; P11 endurece contrato y tests.

## Scope

### In Scope

- Quitar «legajo»/«Legajo» del detalle (kicker, errores, CSS mínima) y tests que lo afirman.
- `certificacionesRevocadas`: null → «—»; `0` → `0`.
- Id inválido: solo «Volver a Alumnos»; Reintentar solo si `obtener` falla de forma recuperable.
- Conservar checklist P11 OK + DNI UI / errores sin DNI·token.
- Tests: sin Legajo; métricas null vs 0; carga + Reintentar; id inválido sin Reintentar.
- Delta `admin-students-frontend` (detalle: copy, métricas, Reintentar).

### Out of Scope

- Listado, editor (P10), asistencias P12, backend, token/QR, rediseño vs `muestra_pagina/`.
- Mapear `ingreso` (sigue `''`; celda vacía OK).
- Cambiar fallback `estadoCert` unknown → `pendiente` salvo UX claramente errónea (diferido).

## Capabilities

### New Capabilities

None

### Modified Capabilities

- `admin-students-frontend`: «Detalle administrativo consistente» — copy sin legajo, métricas 0 vs «—» en revocadas, Reintentar solo recuperable.

## Approach

Auditoría quirúrgica in-place (explore #1): solo `student-detail-page.{ts,html,css,spec.ts}`. Copy «Ficha»/`#id`; null → «—» en revocadas; panel error bifurcado. Sin HTTP/`frontend-http-services`.

## Affected Areas

| Area | Impact | Description |
|------|--------|-------------|
| `student-detail-page.ts` | Modified | Revocadas; error recuperable vs id inválido |
| `student-detail-page.html` | Modified | Copy; panel error condicional |
| `student-detail-page.css` | Modified | Rename `kicker-legajo` si aplica |
| `student-detail-page.spec.ts` | Modified | Honesty + métricas + Reintentar |
| `admin-students-frontend` | Modified | Delta requisitos detalle |
| `http-students.service.ts` | Unchanged | `ingreso` fuera de P11 |

## Risks

| Risk | Likelihood | Mitigation |
|------|------------|------------|
| Asserts «Legajo» → CI rojo | Med | Actualizar tests en el mismo PR |
| Scope creep listado/HTTP | Low | Solo detail page |
| `estadoCert` unknown → Emitir indebido | Low | Diferido; fix solo si UX clara |
| LEG-* o DNI enmascarado | Low | Spec + tests D0 |

## Rollback Plan

Revertir PR de `student-detail-page.*` y delta de spec; sin migración ni backend.

## Dependencies

- Explore P11 + defaults confirmados; specs post-P9/P10 (`ingreso: ''`).

## Success Criteria

- [ ] UI/tests sin «legajo»/«Legajo»/«legajos».
- [ ] Revocadas null → «—», 0 → `0`; sin regressión en otras métricas.
- [ ] Id inválido: solo Volver; recuperable: Reintentar + Volver.
- [ ] DNI completo; mensajes sin DNI/token; trayectoria/links intactos.
- [ ] Delta spec OK; sin listado/editor/backend/HTTP.
