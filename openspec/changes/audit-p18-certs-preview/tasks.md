# Tasks: Auditoría P18 — Preview certificación

## Review Workload Forecast

| Field | Value |
|-------|-------|
| Estimated changed lines | ~120–260 (preview ts/html + tests + PLAN light; CSS 0–few; HTTP 0) |
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
| 1 | Honesty + Reintentar + omit post-regen URL + tests + PLAN | PR 1 | `npx ng test --include='**/certification-preview-page.spec.ts' --no-watch --browsers=ChromeHeadless` | N/A — unit; smoke opcional en verify | Revertir `certification-preview-page.*` + delta + PLAN light |

Base: `apps/frontend-angular/src/app/features/admin/certifications/pages/preview/`

**Constraints (LOCKED)**: solo `certification-preview-page.{ts,html,css?,spec.ts}` + delta + PLAN light; `errorRecuperable` **load-only**; Reintentar gated; `mensajeErrorApi` P15-strict QR/regen; **omit** `publicValidationUrl` from regeneracion UI; leave P17 archive alone; **no** HTTP/backend/token rotation; **no** P19–P21; **no commit/push/PR**.

## Phase 1: Load honesty + API helper (TS)

- [x] 1.1 `certification-preview-page.ts`: add `readonly errorRecuperable = signal(false)`; reset false at start of `cargar()`.
- [x] 1.2 Id null / not-found: fixed *«Certificación no encontrada.»* + `errorRecuperable=false` (no Reintentar).
- [x] 1.3 Hard `obtener` fail (else): *«No se pudo cargar la certificación.»* + `errorRecuperable=true`; never `(e as Error).message`.
- [x] 1.4 Add private `mensajeErrorApi(err, fallback)` P15-strict (`HttpErrorResponse` → `error.error.message` trim only; else fallback).
- [x] 1.5 Wire `descargarQr` / `regenerarPdf` catches via `mensajeErrorApi` + generics; **never** set `errorRecuperable` in action catches.
- [x] 1.6 Soft config/entrega paths unchanged; no service/HTTP edits.

## Phase 2: Template (omit URL + Reintentar)

- [x] 2.1 HTML: `@if (errorRecuperable())` show Reintentar → `cargar()` / `onReintentar`.
- [x] 2.2 Regeneracion ok block: omit `r.publicValidationUrl`; keep success + permanencia QR note.
- [x] 2.3 Keep `truncarUrl` on validation panel / `entregaUrl`; clipboard canónica intact.
- [x] 2.4 CSS: only if Reintentar needs sibling class reuse; else leave `certification-preview-page.css` untouched.

## Phase 3: Tests (spec scenarios)

- [x] 3.1 Honesty load: reject `obtener` with `Error('leak…')` → UI shows fixed load msg; DOM **without** raw substring; Reintentar present.
- [x] 3.2 Not-found / invalid id: fixed not-found msg; **sin** Reintentar.
- [x] 3.3 QR fail: reject with raw `Error` → generic / P15-strict only; no raw; no load-Reintentar.
- [x] 3.4 Regen fail: same anti-raw as 3.3 with regen fallback.
- [x] 3.5 Anti-leak post-regen: fixture full `publicValidationUrl` → DOM sin URL canónica completa; nota permanencia sí.
- [x] 3.6 Regressions: DNI completo; no token completo/legajo/matrícula; firmas/acciones/Descargar→`/pdf`/Regenerar=API verdes.

## Phase 4: Delta + PLAN + gates

- [x] 4.1 Confirm delta `specs/admin-certifications-frontend/spec.md` (already written; no rewrite; no merge main spec).
- [x] 4.2 PLAN light: mark P18 progress in `docs/qa/PLAN-AUDITORIA-EXHAUSTIVA-STAGING-1.0.md` (checklist/status only).
- [x] 4.3 `npx tsc --noEmit -p tsconfig.app.json` + focused preview spec; mark tasks `[x]`.
- [x] 4.4 Checklist: honesty/Reintentar/omit-URL OK; no HTTP/P17 archive/P19–P21; **sin commit/push/PR**.

## DO NOT TOUCH

`http-certifications.service.ts`; backend; token/QR rotation; soft rewrite; P17 archive uncommitted; P19–P21; main `openspec/specs/` (archive later); render `publicValidationUrl` in regeneracion UI.

## Decision needed

No — defaults locked (single PR, Low). Threat matrix N/A.

## Verify (sdd-verify)

- [ ] Focused `ng test` certification-preview-page + `tsc --noEmit`; hard locks OK; verdict → `verify-report.md`.
