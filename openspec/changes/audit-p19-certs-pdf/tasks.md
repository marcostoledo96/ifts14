# Tasks: Auditoría P19 — Folio PDF

## Review Workload Forecast

| Field | Value |
|-------|-------|
| Estimated changed lines | ~100–220 (pdf ts/html + tests + PLAN light; CSS 0–few) |
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
| 1 | Honesty + Reintentar + filename + download P15-strict + tests + PLAN | PR 1 | `npx ng test --include='**/certification-pdf-preview-page.spec.ts' --no-watch --browsers=ChromeHeadless` | N/A — unit; print smoke in verify | Revert `certification-pdf-preview-page.*` + delta + PLAN light |

Base: `apps/frontend-angular/src/app/features/admin/certifications/pages/pdf/`

**LOCKED**: solo `certification-pdf-preview-page.{ts,html,css?,spec.ts}` + delta + PLAN light; `errorRecuperable` load-only; descarga `mensajeErrorApi` P15-strict; filename prefer `detalle.numero`; leave P18 archive; keep html2canvas+print A4+firmas 3:2; no HTTP; no commit.

## Phase 1: Load honesty + download helper (TS)

- [x] 1.1 Add `errorRecuperable = signal(false)`; reset false at start of `load()`.
- [x] 1.2 Id null / not-found → *«Certificación no encontrada.»* + `errorRecuperable=false`.
- [x] 1.3 Hard `obtener` else → *«No se pudo cargar la certificación.»* + `errorRecuperable=true`; never raw `Error.message`.
- [x] 1.4 Add `mensajeErrorApi` P15-strict + `HttpErrorResponse` import.
- [x] 1.5 `descargarPdf` catch → `mensajeErrorApi(e, 'No se pudo generar el PDF.')`; never `errorRecuperable`; no seam API `descargarPdf`.
- [x] 1.6 `numeroExpediente` prefer `detalle.numero.trim()` else padded id; keep `pdfFilename` shape.
- [x] 1.7 Soft config/QR/export/print intact; CSS only if verify proves overflow/ratio.

## Phase 2: Template (Reintentar load-only)

- [x] 2.1 HTML: `@if (errorRecuperable())` Reintentar → `load()` / `onReintentar`.
- [x] 2.2 No Reintentar on `downloadFeedback`; keep Descargar/Imprimir.
- [x] 2.3 CSS untouched unless Reintentar needs sibling class.

## Phase 3: Tests

- [x] 3.1 Load honesty: `Error('leak…')` → fixed msg, no raw, Reintentar → `load`.
- [x] 3.2 Not-found / invalid id: fixed msg; sin Reintentar.
- [x] 3.3 Download fail raw Error → generic/`mensajeErrorApi` only; no Reintentar.
- [x] 3.4 Fixture `numero` → `cert-{numero-safe}.pdf`.
- [x] 3.5 Keep `REQ-PAR-PDF-001`: html2canvas+jsPDF; MUST NOT call service `descargarPdf`.
- [x] 3.6 Regressions if present: anti-token/matrícula/legajo; DNI UI; A4/print/firmas 3:2; QR; revocado.

## Phase 4: Delta + PLAN + gates

- [x] 4.1 Confirm delta `specs/admin-certifications-frontend/spec.md` (no rewrite; no merge main).
- [x] 4.2 PLAN light: P19 status in `docs/qa/PLAN-AUDITORIA-EXHAUSTIVA-STAGING-1.0.md`.
- [x] 4.3 `tsc --noEmit -p tsconfig.app.json` + focused pdf spec; mark `[x]`.
- [x] 4.4 Gates: honesty/Reintentar/download/filename OK; no HTTP/P18 archive; sin commit.

## DO NOT TOUCH

HTTP service; backend; token/QR rotation; P18 archive; preview/delivery/P20–P21; main `openspec/specs/`; blind `scale`/html2canvas rewrite.

## Decision needed

No — single PR, Low. Threat matrix N/A.

## Verify (sdd-verify)

- [ ] Focused pdf `ng test` + `tsc`; locks OK; print/firmas smoke → `verify-report.md`.
