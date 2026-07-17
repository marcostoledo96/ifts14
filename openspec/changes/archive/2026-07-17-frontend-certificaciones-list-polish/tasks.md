# Tasks: Lista certificaciones — polish honesto

## Review Workload Forecast

| Field | Value |
|-------|-------|
| Estimated changed lines | 180–280 |
| 400-line budget risk | Low |
| Chained PRs recommended | No |
| Suggested split | single PR |
| Delivery strategy | single-pr |
| Chain strategy | size-exception |

Decision needed before apply: No
Chained PRs recommended: No
Chain strategy: size-exception
400-line budget risk: Low

### Suggested Work Units

| Unit | Goal | Likely PR | Focused test command | Runtime harness | Rollback boundary |
|------|------|-----------|----------------------|-----------------|-------------------|
| 1 | List polish + specs | PR 1 | `ng test --include='**/certifications/pages/list/**' --watch=false` | N/A (unit DOM asserts) | Revert `pages/list/*` |

## Phase 1: Labels + badge helpers

- [x] 1.1 Add `ESTADO_LABEL` + `etiquetaEstado()` in `certifications-list-page.ts` (`vigente`→`Válida`)
- [x] 1.2 Expose chip display labels; keep filter value `estado === 'vigente'`

## Phase 2: Template + CSS polish

- [x] 2.1 HTML: validez badge (dot+borde, `data-estado`) in table + cards
- [x] 2.2 HTML: chips show labels; `data-estado` on chip buttons
- [x] 2.3 HTML: loading/error SVG panels; empty Inbox SVG + CTA “Emitir primera certificación”
- [x] 2.4 HTML: sin-coincidencias keeps clear-filters only (no emit-as-only-exit)
- [x] 2.5 CSS: `.validez-badge` variants + `.estado-panel` / `.estado-icon` (mirror courses list)

## Phase 3: Focused tests

- [x] 3.1 Spec: four badges show correct labels; filter chip `vigente` still filters `estado==='vigente'`
- [x] 3.2 Spec: empty-total has Inbox SVG + link to `/admin/certificaciones/nueva`
- [x] 3.3 Spec: loading/error have SVG; no “Entrega”/envio copy; privacy unchanged
- [x] 3.4 Run focused `ng test` green

## Phase 4: Progress artifact

- [x] 4.1 Write `apply-progress.md`; mark all tasks `[x]`
