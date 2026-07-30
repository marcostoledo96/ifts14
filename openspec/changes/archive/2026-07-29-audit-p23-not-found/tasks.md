# Tasks: Auditoría P23 — NotFound

## Review Workload Forecast

| Field | Value |
|-------|-------|
| Estimated changed lines | ~120–220 |
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
| 1 | NotFound split + CTA login + `**` title + CTA/isolation specs + PLAN | PR 1 | `npx ng test --include='**/not-found-page.spec.ts' --include='**/app.routes.spec.ts' --no-watch --browsers=ChromeHeadless` | N/A — unit + existing routes harness | Revert `features/not-found/*`, `app.routes.ts` title, both specs, PLAN light |

Base: `apps/frontend-angular/src/app/features/not-found/` + `app.routes.ts` / `app.routes.spec.ts`

**LOCKED**: Lean front-only — html/css split; CTA → `/admin/login`; `title` on `**`; tests CTA+isolation. Keep admin catch-all; leave P22 alone. No commit.

**TDD**: SPA RED-first (CTA / anti-leak / title / isolation) despite `apply.tdd: false` — regression invariants, not greenfield.

**Threat matrix**: Generic rows N/A. SPA RED in Phase 1.

## Phase 1: RED — CTA, anti-leak, title

- [x] 1.1 `not-found-page.spec.ts` RED: one CTA `routerLink` `/admin/login`, label «Ir al acceso administrativo».
- [x] 1.2 Same file RED: no `/validar`, `demo-valido`, «Certificado verificable», stack/`Error`, token, DNI; keep anti-demo.
- [x] 1.3 `app.routes.spec.ts` RED: `**` has `title: 'Página no encontrada — IFTS 14'`; keep `/admin/typo` isolation suite.

## Phase 2: GREEN — NotFound polish

- [x] 2.1 Create `not-found-page.html`: `section[aria-labelledby]`, h1 ES-AR, body, single `RouterLink` → `/admin/login`.
- [x] 2.2 Create `not-found-page.css`: minimal spacing/type via `--color-*` tokens.
- [x] 2.3 Update `not-found-page.ts`: `RouterLink`; `templateUrl`/`styleUrl`; OnPush; no `UiBackLink`.
- [x] 2.4 Confirm Phase 1 not-found specs GREEN.

## Phase 3: Route title + isolation keep

- [x] 3.1 `app.routes.ts`: add title on `**` only; **do not** reorder admin `pathMatch: 'prefix'` catch-all.
- [x] 3.2 Title assert GREEN; re-run `/admin/typo` unauth→login, auth→dashboard; public unknown ≠ `/admin/`/`/validar/`.

## Phase 4: PLAN + gates

- [x] 4.1 Confirm delta `specs/frontend-angular-shell/spec.md`; do **not** merge main `openspec/specs/` yet.
- [x] 4.2 PLAN light P23 in `docs/qa/PLAN-AUDITORIA-EXHAUSTIVA-STAGING-1.0.md`: NotFound+CTA; typo isolated; no AdminNotFound.
- [x] 4.3 `tsc --noEmit -p tsconfig.app.json` + focused not-found/routes `ng test`; mark `[x]`.
- [x] 4.4 Gates: P22/validation/backend/`UiBackLink`/catch-all/D0 untouched; sin commit.

## DO NOT TOUCH

`public-validation-page.*`; P22 archive; result-mapper; backend; `UiBackLink`; admin catch-all; AdminNotFound; main specs merge; commit.

## Decision needed

No — single PR, Low.

## Verify (sdd-verify)

- [x] V.1 Focused not-found + routes `ng test` + `tsc` → `openspec/changes/audit-p23-not-found/verify-report.md` (PASS: CTA→login; no `/validar`/demo; `**` title; typo isolation; locks; no commit).
