# Verify: frontend-parity-validacion-publica (P-15)

**Result**: PASS WITH WARNINGS

| Gate | Result |
|------|--------|
| `CHROME_BIN=... npm run test:ci` | 772 SUCCESS |
| `npx tsc --noEmit -p tsconfig.app.json` | 0 errors |
| `npm run build` | exit 0; warning CSS budget `public-validation-page.css` 10.20 kB > 8.00 kB (y otros módulos previos) |

## REQ check

- REQ-PAR-VAL-001 folio vigente: covered by page specs (ACTA, D0, PieControl, sin QR)
- REQ-PAR-VAL-002 no encontrada: covered
- REQ-PAR-VAL-003 revocada (`CERTIFICATE_REVOKED`): covered; sin alumno inventado
- REQ-PAR-VAL-004 error técnico: covered; sin stack/`/api/`
- REQ-PAR-VAL-005 mobile: CSS stack + N.° mobile en membrete

## Warnings

CSS component budget exceeded on validation page (expected denser folio chrome). No error budget failure.
