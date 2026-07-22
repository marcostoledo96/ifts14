# Proposal: Frontend — listado de asistencias por curso

## Intent

`/admin/asistencias` aplana el hub en filas **curso×fecha** (curso repetido, búsqueda confusa). Reorganizar el hub a **curso → fechas → marcado**, sin backend.

## Scope

### In Scope

- Listado solo **cursos**; búsqueda nombre/código; **sin** chips de estado de fecha.
- Métricas honestas: N fechas asistibles (no canceladas) y, si es barato con el hub, N con presentes; **no** `alumnosActivos` como total por fila.
- Cursos sin fechas: **visibles**; empty claro + enlace a agregar fecha / detalle de curso si el patrón lo permite.
- Ruta `/admin/asistencias/curso/:id` (declarar **antes** de conflictivas): fechas no canceladas; filtro/estado programada|realizada; CTA → marcado.
- Navegación listado → intermedia → `/admin/cursos/:id/fechas/:fechaId/asistencias`.
- Delta spec + tests del listado + smoke en `app.routes.spec`.

### Out of Scope

- Backend/API/`listarHub`; marcado; certificados; detalle de curso (salvo enlace empty); D0 auth.
- Back desde marcado a la intermedia.

## Capabilities

### New Capabilities

- None

### Modified Capabilities

- `admin-attendances-frontend`: listado solo-cursos; intermedia; filtros/métricas/empty; wiring al marcado.

## Approach

Opción A. Reusar `listarHub()`; en intermedia filtrar `hub.fechas` por `cursoId`. Nueva página `attendances/pages/course-dates/*`. Visual admin existente (v0 sin listado global). Un CTA primario por fecha al marcado.

## Affected Areas

| Area | Impact | Description |
|------|--------|-------------|
| `attendances/pages/list/*` | Modified | Filas = cursos |
| `attendances/pages/course-dates/*` | New | Elegir fecha |
| `app.routes.ts` + spec | Modified | Orden `asistencias/curso/:id` |
| `admin-attendances-frontend` spec | Modified | Delta |
| Marcado / HTTP / hub BE | Unchanged | Reuso |

## Risks

| Risk | Likelihood | Mitigation |
|------|------------|------------|
| Specs 11 filas-fecha | High | Reescribir a filas-curso + intermedia |
| Orden rutas Angular | Med | Ruta específica primero + assert |
| Label CTA intermedia | Low | Un CTA al marcado (design) |

## Rollback Plan

Revertir commits FE: restaurar flatten, quitar intermedia y delta. Sin migración.

## Dependencies

- Hub asistencias ya disponible.
- Decisiones Marcos 2026-07-22 (Opción A + open questions cerradas).

## Success Criteria

- [ ] Listado solo cursos; búsqueda; sin chips de fecha.
- [ ] Intermedia con fechas asistibles; empty útil; canceladas ausentes.
- [ ] CTA abre marcado existente; back marcado fuera de alcance.
- [ ] Métricas sin `alumnosActivos` engañoso.
- [ ] Specs/tests listado y rutas en verde.
