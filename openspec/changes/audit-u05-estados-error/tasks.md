# Tasks: audit-u05-estados-error — Estados loading / empty / error (U5)

## Review Workload Forecast

| Field | Value |
|-------|-------|
| Estimated changed lines | ~150–280 (HTML/TS/specs; sin EmptyState/API) |
| 400-line budget risk | Low |
| Chained PRs recommended | No |
| Suggested split | PR único (`size:exception`) |
| Delivery strategy | exception-ok |
| Chain strategy | size-exception |

Decision needed before apply: No
Chained PRs recommended: No
Chain strategy: size-exception
400-line budget risk: Low

### Suggested Work Units

| Unit | Goal | Likely PR | Focused test command | Runtime harness | Rollback boundary |
|------|------|-----------|----------------------|-----------------|-------------------|
| 1 | Listados CTA + course-editor gated + QA false + 401 regresión + PLAN §U5 | PR único (base=`audit/u05-estados-error`) | `cd apps/frontend-angular && npx ng test --include='**/courses-list-page.spec.ts' --include='**/certifications-list-page.spec.ts' --include='**/course-editor-page.spec.ts' --include='**/students-list-page.spec.ts' --include='**/csrf.interceptor.spec.ts' --no-watch --browsers=ChromeHeadless` | Smoke local `ng serve`: error/empty listados + editor load fail; staging DEFER U9 | Revert FE list/editor + specs + PLAN §U5; delta shell intacto en change |

**TDD**: `openspec/config.yaml` → `apply.tdd: false`. RED→GREEN liviano solo en `course-editor` (comportamiento nuevo). Listados/QA/401: aserciones con el pass. Threat matrix: N/A.

**Locks**: courses Reintentar→`btn-primary`; certs empty→`btn-primary` (header `cta-nueva` fuera); QA solo `isDevMode`+tests token `false`; 401 solo tests/spec; PLAN §U5; U4 archive intacto; **no commit**. Specs SHELL-STATE-01..04 (10 sc).

**Apply delivery**: `size-exception` / single PR (lock orchestrator).

## Phase 1: Listados — SHELL-STATE-01

- [x] 1.1 `…/courses/courses-list-page.html` — Reintentar: `btn-secondary` → `btn-primary`
- [x] 1.2 `…/certifications/pages/list/certifications-list-page.html` — empty-total CTA: `cta-nueva` → `btn-primary` (mismo `routerLink`; header sin tocar)
- [x] 1.3 Specs listados cursos/certs: assert Reintentar/empty CTA `btn-primary`; sin EmptyState [SHELL-STATE-01]

## Phase 2: course-editor — SHELL-STATE-02

- [x] 2.1 RED `…/courses/course-editor-page.spec.ts` — load fail → Reintentar re-llama `obtener`; not-found/submit sin retry [SHELL-STATE-02]
- [x] 2.2 `…/courses/course-editor-page.ts` — `errorRecuperable` signal; set en catch/not-found; `onReintentar()` gated
- [x] 2.3 `…/courses/course-editor-page.html` — en `sinCurso`: Reintentar si recuperable + Volver a Cursos
- [x] 2.4 GREEN — pasar RED 2.1; honesty sin raw HTTP

## Phase 3: QA gate — SHELL-STATE-03

- [x] 3.1 `…/courses/courses-list-page.spec.ts` — token QA `false` oculta barra [SHELL-STATE-03]
- [x] 3.2 `…/students/pages/list/students-list-page.spec.ts` — idem
- [x] 3.3 `…/certifications/pages/list/certifications-list-page.spec.ts` — reforzar QA `false`; sin flag `environment`; asistencias QA DEFER

## Phase 4: 401 regresión — SHELL-STATE-04

- [x] 4.1 `…/core/interceptors/csrf.interceptor.spec.ts` — 401 ≠login → clearSession + `/admin/login` + no propagate; login 401 propaga [SHELL-STATE-04]
- [x] 4.2 **NEVER** editar `csrf.interceptor.ts` salvo bug demostrado

## Phase 5: PLAN + prep verify

- [x] 5.1 Marcar checklist `docs/qa/PLAN-AUDITORIA-EXHAUSTIVA-STAGING-1.0.md` §U5 (4 ítems)
- [x] 5.2 Smoke mental: asistencias/dashboard/config sin cambio salvo regresión
- [x] 5.3 `npx tsc --noEmit -p tsconfig.app.json` limpio (`apps/frontend-angular`)
- [x] 5.4 Focused `ng test` Unit 1; U4 archive intacto; **no commit**
- [x] 5.5 Dejar `verify-report.md` a **sdd-verify**

## Verify (sdd-verify)

- [x] V.1 Focused `ng test` (listados+editor+QA+csrf) + `tsc` → `verify-report.md` (10 sc SHELL-STATE-01..04 + PLAN §U5); **no commit**
