# Tasks: Auditoría P22 — Validación pública

## Review Workload Forecast

| Field | Value |
|-------|-------|
| Estimated changed lines | ~60–150 |
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
| 1 | Folio dates es-AR + spec asserts + PLAN light | PR 1 | `npx ng test --include='**/public-validation-page.spec.ts' --no-watch --browsers=ChromeHeadless` | N/A — unit | Revert `public-validation-page.{ts,html,spec.ts}` + PLAN light; delta stays in change folder |

Base: `apps/frontend-angular/src/app/features/public-validation/`

**LOCKED**: Lean front-only — `formatearFechaFolio` on page; HTML binds; specs → `dd/mm/yyyy`; PLAN light revoked≡404; preserve honesty. Mapper/PHP/P21 untouched; `RATE_LIMITED` defer. No commit.

**TDD**: Not recommended (`apply.tdd: false`; update existing page specs after helper — not greenfield RED/GREEN).

**Threat matrix**: N/A — no RED-test tasks.

## Phase 1: Date helper + template

- [x] 1.1 In `public-validation-page.ts`, add public `formatearFechaFolio(iso)`: parse local Y-M-D; `Intl.DateTimeFormat('es-AR', {day:'2-digit', month:'2-digit', year:'numeric'})`; invalid → raw passthrough. Mirror delivery `formatearFecha`.
- [x] 1.2 In `public-validation-page.html`, bind emisión + tabla `attendedDates` through `formatearFechaFolio(...)`. Leave `consulta` / `formatConsulta` unchanged.
- [x] 1.3 Do **not** touch `result-mapper.ts`, PHP, or P21 revoke page.

## Phase 2: Page specs (dates + regressions)

- [x] 2.1 Update válida asserts: ISO fixtures stay; expect visible `10/03/2025` / `12/03/2025` (not raw `2025-03-10`).
- [x] 2.2 Keep REVOCADO mock: chrome + no raw code / no invent PII.
- [x] 2.3 Keep 404 / expired → SIN REGISTRO / no-encontrada (staging unified behavior).
- [x] 2.4 Keep técnico honesty: fixed copy; no stack / `/api/` / token; Reintentar on técnico + no-encontrada.
- [x] 2.5 Keep D0: full DNI on válida; token not in body DOM.

## Phase 3: Delta confirm + PLAN + gates

- [x] 3.1 Confirm delta `openspec/changes/audit-p22-validacion/specs/frontend-public-validation/spec.md` (dates + staging unified + Reintentar + honesty); do **not** merge main `openspec/specs/` yet.
- [x] 3.2 PLAN light P22 in `docs/qa/PLAN-AUDITORIA-EXHAUSTIVA-STAGING-1.0.md`: válida OK; REVOCADO on explicit code; staging revoked≡404 documented (not front bug).
- [x] 3.3 `npx tsc --noEmit -p tsconfig.app.json` + focused public-validation `ng test`; mark tasks `[x]`.
- [x] 3.4 Gates: locks OK; mapper/PHP/P21/`RATE_LIMITED` untouched; sin commit.

## DO NOT TOUCH

`result-mapper.ts`; PHP verify / `CERTIFICATE_REVOKED` unlock; P21 archive / revoke page; D0 token/QR rotate; main `openspec/specs/` merge (archive later); commit.

## Decision needed

No — single PR, Low. Threat matrix N/A.

## Verify (sdd-verify)

- [x] V.1 Focused `public-validation-page` `ng test` + `tsc --noEmit` → write `openspec/changes/audit-p22-validacion/verify-report.md` (PASS criteria: dates es-AR; staging note; honesty/D0 green; locks intact; no commit).
