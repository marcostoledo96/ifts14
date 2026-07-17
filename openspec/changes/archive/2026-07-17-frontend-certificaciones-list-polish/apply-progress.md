# Apply progress: frontend-certificaciones-list-polish

**Mode**: Standard (strict_tdd: false)
**Status**: 11/11 tasks complete — Ready for verify
**Workload**: single PR · 400-line risk Low · no chain decision needed

## Completed

- [x] 1.1–1.2 `ESTADO_LABEL` / `etiquetaEstado()`; chips show Válida; filter `estado === 'vigente'`
- [x] 2.1–2.5 Template + CSS: validez badges (dot+borde), chip dots, SVG loading/error, Inbox empty + CTA, sin-coincidencias clear-only
- [x] 3.1–3.4 Specs + focused `ng test` — **23 SUCCESS**
- [x] 4.1 This progress file

## Files changed

| File | Action |
|------|--------|
| `certifications-list-page.ts` | Modify — labels |
| `certifications-list-page.html` | Modify — badges, chips, SVG states |
| `certifications-list-page.css` | Modify — validez-badge + estado-panel |
| `certifications-list-page.spec.ts` | Modify — REQ coverage |
| `openspec/.../design.md` | Create |
| `openspec/.../tasks.md` | Create / marked done |
| `openspec/.../apply-progress.md` | Create |

## Evidence

```text
ng test --include='**/certifications/pages/list/certifications-list-page.spec.ts' --watch=false --browsers=ChromeHeadless
TOTAL: 23 SUCCESS
```

## Deviations from design

None.

## Issues

None. No Entrega/`envio` UI. Services untouched.

## Next

Ready for `sdd-verify` (not run this turn).
