# Apply progress: frontend-alumnos-list-polish

## Status

`ready_for_verify` — ciclo apply completo (size-exception). Sin verify formal ni archive en este turno.

## Checklist

- [x] Phase 1 — Modelo nullables + `AlumnoDraft` + `StudentsService.crear` (HTTP/in-memory)
- [x] Phase 2 — Lista polish (CTA, badges honestos, SVG estados, filtros null)
- [x] Phase 3 — `student-editor-page` + ruta `alumnos/nuevo` antes de `:id`
- [x] Phase 4 — Tests focalizados verdes + este progress

## Evidence

```
CHROME_BIN=.verify-tmp/chrome-wrapper.sh npx ng test --watch=false --browsers=ChromeHeadless \
  --include='**/students/**/*.spec.ts' --include='**/app.routes.spec.ts'
→ TOTAL: 141 SUCCESS

npx tsc --noEmit -p tsconfig.app.json → OK
```

## Delivered

- CTA “Nuevo alumno” → `/admin/alumnos/nuevo`
- Editor mínimo `apellidoNombre` + `dni`; POST body exacto; `201` → detalle
- HTTP placeholders `null` para email/cursos/certs; warning/Shield solo con dato real
- Privacy: DNI completo solo en input create; errores sin eco de DNI

## Next

`sdd-verify` → luego `sdd-archive` (actualizar `openspec/specs/` + `docs/frontend/`).
