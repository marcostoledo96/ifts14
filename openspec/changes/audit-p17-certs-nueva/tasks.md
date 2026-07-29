# Tasks: Auditoría P17 — Nueva certificación

## Review Workload Forecast

| Field | Value |
|-------|-------|
| Estimated changed lines | ~120–250 (page + tests + PLAN; HTTP 0) |
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
| 1 | Honesty + copy + tests + PLAN | PR 1 | `npx ng test --include='**/certification-new-page.spec.ts' --no-watch --browsers=ChromeHeadless` | N/A — unit | Revertir `certification-new-page.*` + delta + PLAN |

Base: `apps/frontend-angular/src/app/features/admin/certifications/pages/new/`

**LOCKED**: solo `certification-new-page.*` + delta + PLAN light; flags `errorCatalogosRecuperable` + `errorParRecuperable`; Reintentar **solo** loads; emit else → `mensajeErrorApi` P15-strict (envelope o genérico; **nunca** `Error.message`); copy rol vs Asistencias **sin** «complementario»; **no** HTTP/token; **no** P16 archive; **no** P14/P15/P18–P21; **no commit/push/PR**.

## Phase 1: Honesty TS (loads + emit)

- [x] 1.1 Add `errorCatalogosRecuperable` + `errorParRecuperable`; clear flag+msg at load start.
- [x] 1.2 Catch `cargarCatalogos`: «No se pudieron cargar los catálogos. Reintentá.» + flag; drop `(e as Error).message`.
- [x] 1.3 Catch `cargarPar` (`loadGen`): «No se pudo evaluar la elegibilidad. Reintentá.» + flag; drop raw.
- [x] 1.4 Private `mensajeErrorApi` P15-strict; emit else uses it; never set recuperable on emit; keep 409/400/500.

## Phase 2: Template + CSS + copy

- [x] 2.1 Gate catalog Reintentar with `errorCatalogosRecuperable`; par Reintentar via `errorParRecuperable` → `cargarPar()`.
- [x] 2.2 Subtitle: emisión puntual alumno+curso; habitual = asistencias→generar; strip «complementario» (subtitle, cta-note, hint); no Asistencias link.
- [x] 2.3 CSS: reuse `.btn-retry` on par aside only if needed.

## Phase 3: Tests

- [x] 3.1 Catalog honesty: reject → fixed msg + Reintentar + flag; no raw/DNI/token.
- [x] 3.2 Par honesty: reject → fixed msg + Reintentar → `cargarPar`; no raw.
- [x] 3.3 Emit else: unmapped → `mensajeErrorApi`/generic; no load-Reintentar; no raw.
- [x] 3.4 Copy: rol vs Asistencias; zero «complementario».
- [x] 3.5 Regresión: anti-folio; 409/400; query; DNI completo; anti-token; gates.

## Phase 4: Delta + PLAN + gates

- [x] 4.1 Confirm delta `specs/admin-certifications-frontend/spec.md` (no ampliar; no merge main).
- [x] 4.2 PLAN light: marcar P17 apply listo en `docs/qa/PLAN-AUDITORIA-EXHAUSTIVA-STAGING-1.0.md`.
- [x] 4.3 `tsc --noEmit -p tsconfig.app.json` + focused spec; tasks `[x]`.
- [x] 4.4 Checklist: dual flags; Reintentar solo loads; emit P15-strict; copy OK; hard locks; **sin commit/push/PR**.

## DO NOT TOUCH

HTTP/services; backend; token/QR; P16 archive; P14/P15/P18–P21; main `openspec/specs/`; Asistencias link; deprecate ruta/CTAs.

## Decision needed

No — defaults locked (Low). Threat matrix N/A.

## Verify (sdd-verify)

- [x] Focused `ng test` certification-new-page + `tsc --noEmit`; locks OK → `verify-report.md`.
