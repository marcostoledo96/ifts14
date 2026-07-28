# Apply Progress: audit-p08-cursos-detail

**Mode**: Standard (strict_tdd: false)
**Branch**: audit/p08-cursos-detail
**Status**: 12/12 tasks complete — Ready for verify
**Workload**: single PR · Low budget · Decision needed: No

## Completed Tasks

### Phase 1 — Fundación
- [x] 1.1 `mapearErrorCarga`: HTTP 404 **o** `Error.message` prefijo `Curso no encontrado` → «Curso no encontrado.»; resto → recuperable
- [x] 1.2 `errorRecuperable` + `onReintentar()` → `cargar()`; id inválido/≤0 sin Reintentar
- [x] 1.3 `etiquetaEstadoCurso` (Activo/Inactivo), `etiquetaEstadoFecha` (Programada/Realizada/Cancelada), `formatFecha` (Intl es-AR)

### Phase 2 — UI
- [x] 2.1 Error not-found vs recuperable + Reintentar; un solo `aria-live` (`resumen`)
- [x] 2.2 CTA «Ver fechas del curso» → `/admin/asistencias/curso/:id` (`data-testid=cta-ver-fechas-curso`); conserva Abrir primera fecha / Ver y entregar
- [x] 2.3 Labels humanas; `formatFecha`; oculta cuatrimestre «Sin programar»; sin «—» junto a Pendiente
- [x] 2.4 CSS mínimo `.estado-error-block`

### Phase 3 — Tests
- [x] 3.1 Not-found limpio: id inválido, in-memory, HTTP 404
- [x] 3.2 Reintentar vuelve a llamar `obtener`
- [x] 3.3 CTA hub, labels, fecha humana, sin «—», «Ver y entregar»
- [x] 3.4 Suite 17/17 SUCCESS; `tsc --noEmit` OK; no se tocaron http-courses / list / editor / backend

### Phase 4 — Cierre
- [x] 4.1 Delta spec alineado (sin editar fuera de alcance)
- [x] 4.2 Criterios de éxito de proposal marcados; sin commit

## Files Changed

| File | Action |
|------|--------|
| `apps/frontend-angular/.../course-detail-page.ts` | Modified |
| `apps/frontend-angular/.../course-detail-page.html` | Modified |
| `apps/frontend-angular/.../course-detail-page.css` | Modified |
| `apps/frontend-angular/.../course-detail-page.spec.ts` | Modified |
| `openspec/changes/audit-p08-cursos-detail/tasks.md` | Updated `[x]` |
| `openspec/changes/audit-p08-cursos-detail/proposal.md` | Success criteria `[x]` |
| `openspec/changes/audit-p08-cursos-detail/apply-progress.md` | Created/updated |

## Tests

```
ng test --include='**/course-detail-page.spec.ts' --browsers=ChromeHeadless --watch=false
→ 17 SUCCESS

npx tsc --noEmit -p tsconfig.app.json
→ No errors found (exit 0)
```

## Deviations from Design

None — implementación matches design (mapeo en página; CTA hub; labels listado/hub; fechas Intl; sin tocar servicio HTTP).

## Issues Found

None.

## Next

`sdd-verify`
