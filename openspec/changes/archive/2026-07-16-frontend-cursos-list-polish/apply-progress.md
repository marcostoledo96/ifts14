# Apply progress: frontend-cursos-list-polish

## Status

**Apply complete** — ready for `sdd-verify` (no verify/archive in this turn).

## Checklist

- [x] 1.1 RED — Specs chips / sin select / toggle / placeholders / SVG states
- [x] 1.2 GREEN — `onEstado` toggle single + template chips con dots
- [x] 2.1 Badge + acento lateral + Presentes/Certif. `—`
- [x] 3.1 Loading/error/empty/sin-coincidencias con SVG + CTA vacío
- [x] 4.1 Delta `admin-courses-frontend` + tasks marcados
- [x] Tests focalizados verdes

## Evidence

```bash
CHROME_BIN=apps/frontend-angular/.verify-tmp/chrome-wrapper.sh \
  npx ng test --include='**/courses-list-page.spec.ts' --watch=false --browsers=ChromeHeadless
# TOTAL: 14 SUCCESS
```

## Files touched

- `courses-list-page.{ts,html,css,spec.ts}`
- `openspec/specs/admin-courses-frontend/spec.md` (delta chips/estados)
- `sdd/frontend-cursos-list-polish/{proposal,spec,design,tasks,apply-progress}.md`

## Locks honored

1. Presentes/Certificaciones → `—` (null); sin N+1 / sin inventar
2. Chips Borrador/Activos/Cerrados/Archivados con dots
3. Badge dot + borde semántico
4. Acento lateral fila / franja card
5. SVG inline en estados
6. Con/Sin fechas mantenido
7. Sin backend; sin port React literal
