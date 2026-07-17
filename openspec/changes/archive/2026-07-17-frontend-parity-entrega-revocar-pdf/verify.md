# Verify: frontend-parity-entrega-revocar-pdf (P-13)

**Date:** 2026-07-17
**Result:** PASS WITH WARNINGS

## Gates

| Gate | Result |
|------|--------|
| `CHROME_BIN=…/chrome-wrapper.sh npm run test:ci` | PASS — **772 SUCCESS** |
| `npx tsc --noEmit -p tsconfig.app.json` | PASS — 0 errors |
| `npm run build` | PASS — exit 0; CSS budget warnings preexistentes (pdf/revoke/delivery entre otros) |

## Spec coverage

| REQ | Evidence |
|-----|----------|
| REQ-PAR-PDF-001 | `certification-pdf-preview-page.spec.ts` Descargar PDF + Blob; `descargarPdf` HTTP/in-memory |
| REQ-PAR-DEL-001 | delivery footer Copiar+PDF+Cancelar; QR fuera del footer; Blob PDF |
| REQ-PAR-REV-001 | Escape → expediente; error panel `role=alert` |

## Honesty

Seam real: `GET /admin/certificados/{id}/pdf`. No blob inventado en UI sin servicio.
