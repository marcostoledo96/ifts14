# Lista de alumnos — polish + alta mínima

## Estado

Cerrado y archivado en `openspec/changes/archive/2026-07-16-frontend-alumnos-list-polish/`.  
Verify: PASS WITH WARNINGS — `test:ci` 710/710, `tsc` exit 0, `build` exit 0 (2026-07-16).

## Alcance implementado

- CTA **Nuevo alumno** → `/admin/alumnos/nuevo` (ruta estática antes de `:id`).
- Editor mínimo: `apellidoNombre` + `dni` → `POST /admin/alumnos` → detalle en `201`.
- Badges honestos: “Sin email” solo si `tieneEmail === false`; ShieldCheck solo con métrica real; HTTP usa placeholders.
- Estados loading/error/empty con SVG.
- Privacy: lista con `dniMostrar`; DNI completo solo en el input de alta, no en errores/logs.

## Referencias

- Archive: `openspec/changes/archive/2026-07-16-frontend-alumnos-list-polish/`
- Páginas: `students-list-page.*`, `student-editor-page` / `pages/new` según apply
- Spec: `openspec/specs/admin-students-frontend/spec.md` (si se sincronizó en apply)
