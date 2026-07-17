# Apply Progress: frontend-certificado-preview

**Change**: frontend-certificado-preview
**Mode**: Standard (strict_tdd: false)
**Status**: 10/10 tasks complete — Ready for verify
**Date**: 2026-07-17

## Completed Tasks

- [x] 1.1 Carga `Promise.allSettled` + inject config + signals
- [x] 1.2 `configPendiente` / `puedeCopiarCompartir`
- [x] 2.1 `copiarLink` URL canónica + feedback
- [x] 2.2 `compartir` + AbortError silencio
- [x] 3.1 HTML Copiar/Compartir + autoridades
- [x] 3.2 CSS `btn-accion` / `config-pendiente`
- [x] 4.1 Specs REQ-CPREV (sin asserts F6-03 disabled)
- [x] 4.2 Tests focalizados verdes (51/51)
- [x] 5.1 apply-progress.md
- [x] 5.2 Engram persist

## Files Changed

| File | Action | What Was Done |
|------|--------|---------------|
| `…/preview/certification-preview-page.ts` | Modified | allSettled; entregaUrl; copiar/compartir; autoridades |
| `…/preview/certification-preview-page.html` | Modified | CTAs habilitados; Compartir; autoridades reales / pendiente |
| `…/preview/certification-preview-page.css` | Modified | btn-accion; config-pendiente |
| `…/preview/certification-preview-page.spec.ts` | Modified | REQ-CPREV escenarios; sin F6-03 disabled |
| `openspec/changes/…/tasks.md` | Created | Checklist apply |
| `openspec/changes/…/apply-progress.md` | Created | Este archivo |

## Evidence

```text
npx ng test --include='**/certification-preview-page.spec.ts' --watch=false --browsers=ChromeHeadless
TOTAL: 51 SUCCESS
```

## Locks honored

1. URL canónica solo `obtenerEntregaManual().publicValidationUrl`
2. AbortError → silencio (sin clipboard)
3. Config pendiente = GET fail OR ambos nombres vacíos; no bloquea Copiar/Compartir

## Deviations from Design

None — implementation matches design.

## Issues Found

- `tasks.md` no existía al inicio del apply; se creó desde design/spec en este turno.
- Specs canónicos en `openspec/specs/` quedan para archive (delta ya en change).

## Workload / PR Boundary

- Mode: single PR
- Boundary: solo `pages/preview/*` + artifacts del change
- Estimated review budget: Medium (~300–400 LOC)

## Next

`sdd-verify`
