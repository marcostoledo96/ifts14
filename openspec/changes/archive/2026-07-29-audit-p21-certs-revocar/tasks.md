# Tasks: Auditoría P21 — Revocar certificación

## Review Workload Forecast

| Field | Value |
|-------|-------|
| Estimated changed lines | ~100–220 |
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
| 1 | Honesty load/submit + MOTIVO_MAX 180 + tests + PLAN light | PR 1 | `npx ng test --include='**/certification-revoke-page.spec.ts' --no-watch --browsers=ChromeHeadless` | N/A — unit | Revert `revoke/certification-revoke-page.*` + delta + PLAN light |

Base: `apps/frontend-angular/src/app/features/admin/certifications/pages/revoke/`

**LOCKED**: `certification-revoke-page.{ts,html,css?,spec.ts}`; load `aplicarErrorCarga` + `errorRecuperable` + Reintentar gated; submit `errorAccion` inline + `mensajeErrorApi` P15-strict; `MOTIVO_MAX` 180; keep confirm/copy/sanitize/Escape/trap; defer flash; no P20/P22/backend; no commit.

**TDD**: Recommended for honesty/anti-raw (config `apply.tdd: false` → implement then extend specs; optional RED-first OK).

## Phase 1: Load honesty (TS)

- [x] 1.1 Add `errorRecuperable` / `errorAccion`; reset both + load `error` at `cargar()` start.
- [x] 1.2 Id null/invalid → *«Certificación no encontrada.»* + `errorRecuperable=false`.
- [x] 1.3 `aplicarErrorCarga`: not-found → controlled msg + `false`; else *«No se pudo cargar la certificación.»* + `true`; never raw.
- [x] 1.4 Wire `obtener` catch → `aplicarErrorCarga`; OK → `detalle` + `errorRecuperable=false`.
- [x] 1.5 Add `onReintentar()` → `cargar()`; import unused until HTML.

## Phase 2: Submit + MOTIVO_MAX (TS)

- [x] 2.1 Local `mensajeErrorApi(err, fallback)` P15-strict (`HttpErrorResponse.error.error.message` only).
- [x] 2.2 `MOTIVO_MAX` → **180**; keep `MOTIVO_MIN` 12; `onMotivoChange` slice + maxlength parity.
- [x] 2.3 `onRevocar` catch → `errorAccion = mensajeErrorApi(..., 'No se pudo revocar la certificación.')`; never set load `error` / `errorRecuperable`.
- [x] 2.4 Success path unchanged: sanitize → `revocar` → navigate `?revocada=1`; keep confirm/sanitize/Escape/trap.

## Phase 3: Template

- [x] 3.1 Hard overlay: fixed `error()` + `@if (errorRecuperable())` Reintentar → `onReintentar`.
- [x] 3.2 Dialog body: `@if (errorAccion())` inline alert; do **not** reuse load overlay for submit.
- [x] 3.3 Motivo input `maxlength` 180; preserve checkbox + consequences copy.
- [x] 3.4 CSS touch-only if Reintentar / inline alert lack classes (`msg-error` reuse OK).

## Phase 4: Tests

- [x] 4.1 Load recuperable: raw `obtener` → fixed msg + Reintentar; spy re-`cargar`.
- [x] 4.2 Not-found / invalid id → controlled msg; no Reintentar; `errorRecuperable` false.
- [x] 4.3 Anti-raw load: panel never shows raw `Error.message` / DNI / token.
- [x] 4.4 Submit fail: `errorAccion` inline + dialog visible; load `error` empty; no Reintentar; no raw.
- [x] 4.5 Envelope path: HttpErrorResponse with `error.error.message` → that msg in `errorAccion`.
- [x] 4.6 `MOTIVO_MAX` 180 (maxlength/validator); keep confirm / sanitize / Escape / no-vigente asserts.

## Phase 5: Delta + PLAN + gates

- [x] 5.1 Confirm delta `openspec/changes/.../specs/admin-certifications-frontend/spec.md` (no merge main).
- [x] 5.2 PLAN light P21 in `docs/qa/PLAN-AUDITORIA-EXHAUSTIVA-STAGING-1.0.md`.
- [x] 5.3 `tsc --noEmit -p tsconfig.app.json` + focused revoke `ng test`; mark `[x]`.
- [x] 5.4 Gates: locks OK; no P20/P22/backend/flash; sin commit.

## DO NOT TOUCH

P20 archive/delivery; P22 public validation; PHP / `admin-certificate-revocation`; preview flash `?revocada=1`; main `openspec/specs/`; commit.

## Decision needed

No — single PR, Low. Threat matrix N/A.

## Verify (sdd-verify)

- [x] Focused revoke `ng test` + `tsc` → `verify-report.md` (PASS 9/9; 17/17 SUCCESS; tsc clean; no commit).
