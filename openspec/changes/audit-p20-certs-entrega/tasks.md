# Tasks: Auditoría P20 — Entrega manual

## Review Workload Forecast

| Field | Value |
|-------|-------|
| Estimated changed lines | ~140–280 |
| 400-line budget risk | Low |
| Chained PRs recommended | No |
| Suggested split | Single PR |
| Delivery strategy | ask-on-risk |
| Chain strategy | pending |

Decision needed before apply: No
Chained PRs recommended: No
Chain strategy: pending
400-line budget risk: Low

### Suggested Work Units

| Unit | Goal | Likely PR | Focused test command | Runtime harness | Rollback boundary |
|------|------|-----------|----------------------|-----------------|-------------------|
| 1 | 409 + honesty + regen + folio + tests + PLAN | PR 1 | `npx ng test --include='**/certification-delivery-page.spec.ts' --no-watch --browsers=ChromeHeadless` | N/A — unit | Revert delivery-page.* + delta + PLAN light |

Base: `apps/frontend-angular/src/app/features/admin/certifications/pages/delivery/`

**LOCKED**: `certification-delivery-page.{ts,html,css?,spec.ts}` + delta `admin-certificate-delivery-frontend` + PLAN light; `allSettled`; 409 operable; `errorRecuperable` load-only; `mensajeErrorApi`; `regenerarPdf`; folio `?descargar=1` + `navigate=false`; leave P19; no HTTP; no commit.

## Phase 1: Load + 409 (TS)

- [x] 1.1 Add `errorRecuperable` / `entregaError`; reset at `cargar()` start.
- [x] 1.2 Id null/invalid → *«Certificación no encontrada.»* + `errorRecuperable=false`.
- [x] 1.3 `Promise.allSettled([obtener, obtenerEntregaManual])`.
- [x] 1.4 Detalle fail → `aplicarErrorCarga`: not-found/`false`; else fixed load msg + `true`; never raw.
- [x] 1.5 Detalle OK → `aplicarEntrega`: 409/`TOKEN_NOT_RECOVERABLE` soft bedelía copy (Q2); Copiar/QR off; no Reintentar.
- [x] 1.6 `mensajeErrorApi` P15-strict + `HttpErrorResponse` (`error.error.message` only).

## Phase 2: Regen + PDF (TS)

- [x] 2.1 `volverARegenerarPdf` → `regenerarPdf(cid)` → re-fetch entrega; no URL leak; no token rotate.
- [x] 2.2 Regen/QR/PDF catch → `mensajeErrorApi`/fallback; never `errorRecuperable`.
- [x] 2.3 `descargarPdf({navigate?})` default → folio `…/pdf?descargar=1`; no Blob service.
- [x] 2.4 `navigate=false` → `createUrlTree`+`serializeUrl` only.

## Phase 3: Template

- [x] 3.1 Hard error + `@if (errorRecuperable())` Reintentar → `cargar()`.
- [x] 3.2 Soft `entregaError` panel; disable Copiar/QR if `!validarUrl()`.
- [x] 3.3 Footer Copiar+PDF+Cancelar; QR outside; outdated alert + regen CTA.
- [x] 3.4 CSS only if panel/Reintentar need classes.

## Phase 4: Tests

- [x] 4.1 409 soft: ficha + bedelía copy; Copiar/QR off; no Reintentar.
- [x] 4.2 Honesty: raw obtener → fixed msg + Reintentar; not-found sin Reintentar.
- [x] 4.3 Anti-raw QR/PDF fail → generic only; no `errorRecuperable`.
- [x] 4.4 Regen spy + re-fetch; no URL/token leak; drop stub expects.
- [x] 4.5 `navigate=false`: folio `?descargar=1`; no location; no Blob call.
- [x] 4.6 Anti-token D0 + DNI completo if shown.

## Phase 5: Delta + PLAN + gates

- [x] 5.1 Confirm delta `specs/admin-certificate-delivery-frontend/spec.md` (no merge main).
- [x] 5.2 PLAN light P20 in `docs/qa/PLAN-AUDITORIA-EXHAUSTIVA-STAGING-1.0.md`.
- [x] 5.3 `tsc --noEmit -p tsconfig.app.json` + focused delivery `ng test`; mark `[x]`.
- [x] 5.4 Gates: locks OK; no HTTP/P19 archive; sin commit.

## DO NOT TOUCH

HTTP; backend; token/QR rotate; P19 archive; pdf-preview; P21; main `openspec/specs/`.

## Decision needed

No — single PR, Low. Threat matrix N/A.

## Verify (sdd-verify)

- [ ] Focused delivery `ng test` + `tsc` → `verify-report.md`.
