# Tasks: frontend-parity-validacion-publica

Decision needed before apply: No
Chain strategy: single-pr

## Phase 1 — Tests (TDD)

- [x] 1.1 Actualizar `public-validation-page.spec.ts` (ACTA, PieControl, revocada, no-encontrada, error, sin QR)
- [x] 1.2 Ajustar `banda-estado.spec.ts` si cambian clases warning/destructive

## Phase 2 — UI

- [x] 2.1 `banda-estado`: warning vs revoked; iconos SVG
- [x] 2.2 `public-validation-page.html/css/ts`: folio + 3 estados + helpers SEQ/revocada
- [x] 2.3 Ancho `--layout-page-max`

## Phase 3 — Spec canónica + verify

- [x] 3.1 Sync `openspec/specs/frontend-public-validation/spec.md`
- [x] 3.2 `test:ci` + `tsc` + `build`
- [x] 3.3 Archive + `docs/frontend/parity-validacion-publica.md`
