# Apply progress: frontend-login-polish

**Mode**: Standard (`strict_tdd: false`)  
**Status**: 9/9 tasks complete — Ready for verify

## Completed

- [x] 1.1–1.3 Form UI (iconos, toggle, auditoría, loader, CTA Ingresar)
- [x] 2.1–2.3 Page (loading signal, aside institucional, footer, mobile brand bar)
- [x] 3.1 admin-foundation: escenario auditoría (sin «Acceso simulado»)
- [x] 3.2 Tests: `login-*.spec.ts` → **23 SUCCESS**
- [x] 3.3 Este archivo

## Files changed

| File | Action |
|------|--------|
| `login-form.ts/html/css/spec.ts` | Modified |
| `login-page.ts/html/css/spec.ts` | Modified |
| `openspec/specs/admin-foundation/spec.md` | Modified |
| `sdd/frontend-login-polish/{proposal,spec,design,tasks,apply-progress}.md` | Created |

## Deviations from design

None — SVG inline, loading en page, auth intacta.

## Issues

None. Chrome necesita wrapper `--no-sandbox` en este entorno (`.verify-tmp/chrome-wrapper.sh`).

## Auth contract

No se modificó `admin-auth.service.ts`. Payload sigue `{ username, password }`. Sin demos React.

## Evidence

```
CHROME_BIN=.../chrome-wrapper.sh ng test --no-watch --browsers=ChromeHeadless --include='**/login-*.spec.ts'
TOTAL: 23 SUCCESS
```

## Workload / PR Boundary

- Mode: single PR
- Boundary: solo UI login + delta foundation
- Ready for verify (formal verify/archive NO ejecutados en este ciclo)
