# Verify: frontend-parity-nueva-certificacion (P-11)

**Date**: 2026-07-17  
**Result**: PASS WITH WARNINGS

## Gates

| Gate | Result |
|------|--------|
| Focused `certification-new-page.spec.ts` | **15/15 SUCCESS** |
| CHROME_BIN | `.verify-tmp/chrome-wrapper.sh` |
| Wizard 3 pasos | Ausente (assert en spec) |
| Folio / email en claro | Ausentes (assert en spec) |

## Warnings

- Suite completa `test:ci` / `tsc` / `build` no re-ejecutada en este ciclo (verify focalizado a la página).
- Fix colateral mínimo en `login-form.spec.ts` (TS2532 `tagName?.toLowerCase`) para desbloquear el bundle de tests.

## REQ coverage

| REQ | Evidence |
|-----|----------|
| P11-001 sin wizard | spec “no es wizard…” |
| P11-002 selección | combobox + curso + ciclo en DOM/tests |
| P11-003 preview | banda, I/II, presentes, firmas, “Se asigna al emitir” |
| P11-004 loading/vacíos | skeleton + bloqueos sin fechas/sin presentes |
| P11-005 CTA | emitir body + navigate |
| P11-006 honest firmas/QR | “Representación tipográfica” + QR decorativo |
