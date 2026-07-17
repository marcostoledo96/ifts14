# Verify: frontend-parity-alumnos-list (P-07)

**Verdict**: PASS WITH WARNINGS

| Gate | Result |
|------|--------|
| Focused courses-list + students-list | 26/26 SUCCESS |
| `CHROME_BIN=…chrome-wrapper.sh npm run test:ci` | **772/772 SUCCESS** |
| `npx tsc --noEmit -p tsconfig.app.json` | exit 0 |
| `npm run build` | exit 0 |

## Warnings

- `students-list-page.css` budget 8 kB exceeded (8.23 kB) — trade-off paridad; no error.
- Carry-forward CSS budgets ajenos.

## REQ coverage

- REQ-PALU-001…004: densidad, sin legajo/email literal, tabla/cards, empty SVG.
