# Verify: frontend-parity-cursos-list (P-04)

**Verdict**: PASS WITH WARNINGS

| Gate | Result |
|------|--------|
| Focused courses-list + students-list | 26/26 SUCCESS |
| `CHROME_BIN=…chrome-wrapper.sh npm run test:ci` | **772/772 SUCCESS** |
| `npx tsc --noEmit -p tsconfig.app.json` | exit 0 |
| `npm run build` | exit 0 |

## Warnings

- `courses-list-page.css` budget 8 kB exceeded (9.05 kB) — trade-off paridad densidad v0; no error budget.
- Otros CSS budget warnings preexistentes (preview/PDF/config/etc.) — carry-forward.

## REQ coverage

- REQ-PCUR-001…004: covered by updated list specs (icons, resumen in-card, `—`, empty SVG).
