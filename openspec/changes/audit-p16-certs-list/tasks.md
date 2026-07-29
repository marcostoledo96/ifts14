# Tasks: Auditoría P16 — listado de certificaciones admin

## Review Workload Forecast

| Field | Value |
|-------|-------|
| Estimated changed lines | ~80–180 (page + tests + PLAN light; HTTP 0) |
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
| 1 | Pager + resumen + grammar + tests + PLAN | PR 1 | `npx ng test --include='**/certifications-list-page.spec.ts' --no-watch --browsers=ChromeHeadless` | N/A — unit; smoke opcional en verify | Revertir `certifications-list-page.*` + delta + PLAN |

Base: `apps/frontend-angular/src/app/features/admin/certifications/pages/list/`

**Constraints (LOCKED)**: solo `certifications-list-page.*` + delta confirm + PLAN light; `paginasVisibles`, `mostrarResumen` (`vistaQA==='datos'`), grammar `coincide`/`coinciden`; **no** `errorRecuperable`; **no** filtros entrega/v0; **no** HTTP/backend/token; **no** tocar P15 archive; **no** P17–P21; CSS solo `.pager-ellipsis`; **no commit/push/PR**.

## Phase 1: Computeds TS

- [x] 1.1 `certifications-list-page.ts`: add `paginasVisibles` computed (copy siblings: total≤5 | head | tail | window±2).
- [x] 1.2 Add `mostrarResumen` = `vistaQA()==='datos' && !cargando() && !error()`.
- [x] 1.3 Keep client-side filters, `error` string + Reintentar, DNI/`documentMasked`, anti-token; no HTTP/service edits.

## Phase 2: Template + CSS

- [x] 2.1 HTML: gate resumen with `@if (mostrarResumen())`.
- [x] 2.2 Grammar (solo con `hayFiltrosActivos`): `n===1 ? 'coincide con el filtro' : 'coinciden con el filtro'`; sin filtros → «en el archivo».
- [x] 2.3 Both pagers: `@for (page of paginasVisibles())`; elipsis si `totalPaginas()>5 && paginaSegura()<totalPaginas()-2`.
- [x] 2.4 CSS: minimal `.pager-ellipsis` under `.paginacion` (no rename to `.pager`).

## Phase 3: Tests

- [x] 3.1 Fix grammar assert → `1 certificación coincide…`; add N→`coinciden` (esc. Resumen gated y grammar).
- [x] 3.2 `mostrarResumen` oculto en carga/error: force `cargando`/stub lento; `.results-summary` absent.
- [x] 3.3 Pager >5: seed `PAGINA_TAMANO*5+1`; `onPagina(6)`; page 6 reachable / ≤5 page buttons + elipsis.
- [x] 3.4 Regresión: anti-token/DNI; «sin Estado de entrega»; catch fijo + Reintentar; no `errorRecuperable`.

## Phase 4: Delta + PLAN + gates

- [x] 4.1 Confirm delta `specs/admin-certifications-frontend/spec.md` (ya escrito; no ampliar; no merge main spec).
- [x] 4.2 PLAN light: marcar P16 apply listo en `docs/qa/PLAN-AUDITORIA-EXHAUSTIVA-STAGING-1.0.md`.
- [x] 4.3 `npx tsc --noEmit -p tsconfig.app.json` + focused spec; tasks `[x]`; sin trailing whitespace.
- [x] 4.4 Checklist: pager/resumen/grammar OK; sin HTTP/`errorRecuperable`/entrega/P15/P17–P21; **sin commit/push/PR**.

## DO NOT TOUCH

`http-certifications.service.ts`; backend; token/QR; P15 archive uncommitted; P17–P21; entrega/borrador/vencido filters; main `openspec/specs/` (archive later); `errorRecuperable`.

## Decision needed

No — defaults locked (single PR, Low). Threat matrix N/A.
