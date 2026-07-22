# Listado de asistencias por curso

## Estado

Cerrado y archivado en `openspec/changes/archive/2026-07-22-frontend-asistencias-listado-por-curso/`.
Verify: **PASS WITH WARNINGS** — suite focal 123 SUCCESS; `tsc` limpio; delta 14/14 COMPLIANT (2026-07-22).

## Alcance implementado

- `/admin/asistencias`: una fila por curso (no curso×fecha); búsqueda por nombre/código; sin chips de estado de fecha; métricas N fechas asistibles (+ M con presentes).
- CTA del listado «Ver fechas» → `/admin/asistencias/curso/:id`.
- Página intermedia: fechas ≠ `cancelada`, chips `programada`|`realizada`, CTA «Tomar asistencia» al marcado existente.
- Ruta `asistencias/curso/:id` declarada antes de `asistencias`. Sin cambios de backend ni de `listarHub`/marcado.

## QA pendiente (staging)

Tras deploy FE: smoke browser listado → intermedia → marcado; empty CUR-005 / 0 fechas; id inexistente (p. ej. 9999).

## Referencias

- Archive: `openspec/changes/archive/2026-07-22-frontend-asistencias-listado-por-curso/`
- Spec canónica: `openspec/specs/admin-attendances-frontend/spec.md`
- Páginas: `attendances-list-page.*`, `attendance-course-dates-page.*`
