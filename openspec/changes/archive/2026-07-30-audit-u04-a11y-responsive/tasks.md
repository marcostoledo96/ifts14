# Tasks: audit-u04-a11y-responsive — A11y + responsive quirúrgico (U4)

## Review Workload Forecast

| Field | Value |
|-------|-------|
| Estimated changed lines | ~220–380 (helper+specs + shell + delivery/revoke + spot/PLAN) |
| 400-line budget risk | Medium |
| Chained PRs recommended | Yes |
| Suggested split | PR1 helper+drawer+smoke → PR2 diálogos+PLAN |
| Delivery strategy | ask-on-risk |
| Chain strategy | pending |

Decision needed before apply: Yes
Chained PRs recommended: Yes
Chain strategy: pending
400-line budget risk: Medium

### Suggested Work Units

| Unit | Goal | Likely PR | Focused test command | Runtime harness | Rollback boundary |
|------|------|-----------|----------------------|-----------------|-------------------|
| 1 | `trapTabKey` + drawer `aria-modal` + smoke login/público/listados si deuda | PR 1 (base=`audit/u04-a11y-responsive`) | `cd apps/frontend-angular && npx ng test --include='**/trap-tab.spec.ts' --include='**/admin-shell.spec.ts' --no-watch --browsers=ChromeHeadless` | Smoke teclado login + CTAs públicos + listado angosto | Revert `shared/util/trap-tab*` + `admin-shell.*` + CSS spot |
| 2 | Diálogos delivery/revoke/error: backdrop fuera de tab; PLAN §U4 | PR 2 (base=PR1) | `cd apps/frontend-angular && npx ng test --include='**/certification-delivery-page.spec.ts' --include='**/certification-revoke-page.spec.ts' --no-watch --browsers=ChromeHeadless` | Smoke Tab/Esc entrega+revocar | Revert `certification-{delivery,revoke}-page.*` + PLAN §U4 |

**TDD**: `apply.tdd: false` — specs con el pass. Threat matrix: N/A.

**Locks**: contraste/`.sr-only` DEFER; foco soft; error MUST; sin API/rediseño; U3 archive intacto; **no commit**. Specs: SHELL-A11Y-01..04, PUB-A11Y-01..02, REQ-DEL-007 (13 sc).

**Apply delivery (orchestrator lock)**: `size-exception` / single PR (cadencia U1–U3). Ambos work units en un apply.

## Phase 1: Foundation — `trapTabKey`

- [x] 1.1 Crear `apps/frontend-angular/src/app/shared/util/trap-tab.ts` — `FOCUSABLE_SEL` + `trapTabKey(e, root)`
- [x] 1.2 Crear `…/shared/util/trap-tab.spec.ts` — wrap first↔last; no-op si root vacío

## Phase 2: Drawer — SHELL-A11Y-02

- [x] 2.1 `…/admin/admin-shell.ts` — `onTab` vía helper; root overlay+aside; soft foco `.menu-btn`
- [x] 2.2 `…/admin/admin-shell.html` — `aria-modal="true"`; wrapper de capa si no rompe CSS
- [x] 2.3 `…/admin/admin-shell.spec.ts` — Tab no escapa; `aria-modal`; Esc/`inert` OK [SHELL-A11Y-02]

## Phase 3: Diálogos — SHELL-A11Y-03 / REQ-DEL-007

- [x] 3.1 `…/delivery/certification-delivery-page.html` — backdrop sin tab; error `#dialog`+attrs
- [x] 3.2 `…/delivery/certification-delivery-page.ts` — helper; foco error-dialog; Esc soft OK
- [x] 3.3 `…/delivery/certification-delivery-page.spec.ts` — Tab≠backdrop; error atrapa; Esc [REQ-DEL-007]
- [x] 3.4 `…/revoke/certification-revoke-page.html` — backdrop no tabulable (click/Esc/X OK)
- [x] 3.5 `…/revoke/certification-revoke-page.ts` — usar `trapTabKey`
- [x] 3.6 `…/revoke/certification-revoke-page.spec.ts` — Tab no alcanza backdrop [SHELL-A11Y-03]

## Phase 4: Smoke spot — SHELL-A11Y-01/04, PUB-A11Y-01/02

- [x] 4.1 Smoke login teclado; tocar `login-*` **solo si falla** — global `:focus-visible` OK; sin cambio login
- [x] 4.2 Smoke CTAs públicos; CSS mínimo en `public-validation-page.css` **solo si falta** [PUB-A11Y-01] — refuerzo `:focus-visible` en `.btn-primario/.btn-secundario`
- [x] 4.3 Spot tabla pública + listados angostos; CSS **solo rotura** [PUB-A11Y-02 / SHELL-A11Y-04] — ya `overflow-x` + cards-mobile; sin cambio listados
- [x] 4.4 Confirmar DEFER contraste/`.sr-only` [SHELL-A11Y-01]

## Phase 5: PLAN + prep verify

- [x] 5.1 Marcar checkboxes `docs/qa/PLAN-AUDITORIA-EXHAUSTIVA-STAGING-1.0.md` §U4
- [x] 5.2 `npx tsc --noEmit -p tsconfig.app.json` limpio (`apps/frontend-angular`)
- [x] 5.3 Focused specs Units 1–2; U3 archive intacto; **no commit**
- [x] 5.4 Dejar `verify-report.md` a **sdd-verify**

## Verify (sdd-verify)

- [x] V.1 Focused `ng test` (trap-tab+shell+delivery+revoke) + `tsc` → `verify-report.md` (13 sc + PLAN §U4); **no commit**
