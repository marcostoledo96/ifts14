# Tasks: audit-u02-perf-fe — Surgical FE performance (U2)

## Review Workload Forecast

| Field | Value |
|-------|-------|
| Estimated changed lines | ~180–320 (hub+mock+firma+PDF+specs+docs) |
| 400-line budget risk | Low |
| Chained PRs recommended | No |
| Suggested split | single PR |
| Delivery strategy | ask-on-risk |
| Chain strategy | size-exception (N/A — under budget) |

Decision needed before apply: No
Chained PRs recommended: No
Chain strategy: size-exception
400-line budget risk: Low

### Suggested Work Units

| Unit | Goal | Likely PR | Focused test command | Runtime harness | Rollback boundary |
|------|------|-----------|----------------------|-----------------|-------------------|
| 1 | Hub coalesce + firma cache + PDF defer + scale docs | single PR | `npx ng test --include='**/http-attendance.service.spec.ts' --include='**/attendance-mock.service.spec.ts' --include='**/institutional-config.service.spec.ts' --include='**/certification-pdf-preview-page.spec.ts' --no-watch --browsers=ChromeHeadless` | N/A — unit coverage of coalesce/cache/download; optional smoke open PDF without download | Revert 4 service/page files + 4 specs + PLAN/docs notes |

**TDD note**: `openspec/config.yaml` has `apply.tdd: false`. Light RED→GREEN for new coalesce/cache behaviors only. Threat matrix: N/A — no threat RED tasks.

**Locks**: Dynamic PDF `import()`; `hubPending` coalesce+invalidate (HTTP+mock); firma/`obtener` session cache+invalidate; PLAN/docs scale note; leave U1 archive; D0; no API/UX; no commit.

## Phase 1: Hub coalesce — HTTP-PERF-01 (TDD light)

- [x] 1.1 RED: `…/attendances/data/http-attendance.service.spec.ts` — parallel `listarHub` → ≤1 GET; after `marcar`/`anular` → fresh GET
- [x] 1.2 GREEN: `…/http-attendance.service.ts` — `private hubPending`; coalesce like `fechasPorCurso`; clear on `marcar`/`anular` (+ existing `asistenciasPorCurso` invalidate)
- [x] 1.3 RED: `…/attendance-mock.service.spec.ts` — same Promise identity until mutate; fresh after `marcar`
- [x] 1.4 GREEN: `…/attendance-mock.service.ts` — parity `hubPending` + invalidate on `marcar`/`anular`

## Phase 2: Firma / obtener session cache — HTTP-PERF-02

- [x] 2.1 RED: `…/institutional-config.service.spec.ts` — second `previewFirma(rol)` / `obtener` no extra GET; after `subirFirma`/`quitarFirma`/`guardar` → refetch
- [x] 2.2 GREEN: `…/http-institutional-config.service.ts` — `firmaPreviewByRole` Map + `obtenerPending`; invalidate on mutate/save; logout clear only if seam is trivial
- [x] 2.3 Confirm URLs/auth/`Cache-Control: no-store` unchanged (HTTP-PERF-02 semantics)

## Phase 3: Deferred PDF deps — CERT-PERF-01

- [x] 3.1 RED/adjust: `…/pdf/certification-pdf-preview-page.spec.ts` — `descargarPdf` / export path still succeeds with async dynamic modules (mock `import()` if needed)
- [x] 3.2 GREEN: `…/pdf/certification-pdf-preview-page.ts` — drop static `html2canvas-pro`/`jspdf`; `await import()` inside `exportarFolioVisibleComoPdf` only; filename/D0/print/`error` UX unchanged

## Phase 4: Scale docs + verify prep

- [x] 4.1 Add client-filter scale note (hundreds OK; thousands → U6/API) to `docs/frontend/03-modulos-admin.md` (or shorter anchor in `00-angular20-port-v0.md` if apply finds better)
- [x] 4.2 Update `docs/qa/PLAN-AUDITORIA-EXHAUSTIVA-STAGING-1.0.md` §U2 checkboxes + scale note at apply/archive
- [x] 4.3 `npx tsc --noEmit -p tsconfig.app.json` clean from `apps/frontend-angular`
- [x] 4.4 Run focused specs from work-unit table; confirm DEFER list untouched (slim hub, server pagination, Cache-Control firmas, dashboard, qrcode worker)
- [x] 4.5 Leave verify-report to **sdd-verify**; **no commit**

## Verify (sdd-verify)

- [x] V.1 Focused `ng test` (hub+mock+firma+PDF specs) + `tsc` → write `openspec/changes/audit-u02-perf-fe/verify-report.md` covering HTTP-PERF-01/02 + CERT-PERF-01 (9 scenarios) + docs scale note; no commit
