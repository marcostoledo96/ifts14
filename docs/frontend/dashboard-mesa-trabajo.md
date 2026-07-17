# Dashboard — mesa de trabajo

## Estado

Cerrado y archivado en `openspec/changes/archive/2026-07-16-frontend-dashboard/`.
Verify: PASS WITH WARNINGS — `test:ci` 685/685, `tsc` exit 0, `build` exit 0 (2026-07-16).

## Alcance implementado

- Reescritura del `/admin` (dashboard) como mesa de trabajo v0: **acciones → bandeja → actividad → resumen**.
- Cinco acciones: Nueva certificación, Nuevo curso, Alumnos, Configuración; Carga masiva disabled con tooltip.
- Resumen operativo con conteos derivados de seams existentes (`listar`/`contar`); fallo → "—".
- Bandeja de pendientes y actividad reciente como **placeholders honestos** (sin endpoints inventados ni PII).
- Eliminadas las 4 cards placeholder ficticias.

## Referencias

- Archive: `openspec/changes/archive/2026-07-16-frontend-dashboard/`
- Página: `apps/frontend-angular/src/app/features/admin/admin-dashboard-page.*`
- Spec: `openspec/specs/admin-foundation/spec.md` (delta workbench)
