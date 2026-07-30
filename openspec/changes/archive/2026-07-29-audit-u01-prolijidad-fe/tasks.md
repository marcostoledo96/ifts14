# Tasks: audit-u01-prolijidad-fe — FE hygiene (dead code)

## Review Workload Forecast

| Field | Value |
|-------|-------|
| Estimated changed lines | ~180–320 (deletes + helper/spec + 4 list wires + alias) |
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
| 1 | U1 FE hygiene (deletes + pager extract + alias) | single PR | `npx ng test --include='**/paginas-visibles-window.spec.ts' --no-watch --browsers=ChromeHeadless` (+ list/marking/route specs) | N/A — no UX/runtime change; `tsc --noEmit` | Restore deleted files + revert helper/list/alias |

**TDD note**: `openspec/config.yaml` has `strict_tdd: false` / `apply.tdd: false`. Use light RED→GREEN only for new pure `paginasVisiblesWindow`. Deletes/alias: verify via existing specs + grep (no RED-first required). Threat matrix: N/A — no threat RED tasks.

**Locks**: Delete Landing + FolioShell + `guardar()`; extract pager to `shared/util/` and wire 4 lists; keep OnPush; DEFER formatters/clipboard/`mensajeErrorApi`/ponytails; no commit.

## Phase 1: Dead-code removal (SHELL-HYG-01..03)

- [x] 1.1 Delete `apps/frontend-angular/src/app/features/landing/landing-page.ts` and `landing-page.spec.ts`
- [x] 1.2 Delete `apps/frontend-angular/src/app/shared/ui/folio-shell.ts`, `.html`, `.css`, `.spec.ts`
- [x] 1.3 Remove `guardar()` alias (~L301–304) from `…/marking/attendance-marking-page.ts`; keep `guardarYGenerar`
- [x] 1.4 Grep: no dangling `LandingPage` / `FolioShell` / `app-folio-shell` / marking `.guardar(` imports

## Phase 2: Pager helper — TDD (SHELL-HYG-05)

- [x] 2.1 RED: create `shared/util/paginas-visibles-window.spec.ts` — cases: total≤5; start; middle; end window
- [x] 2.2 GREEN: create `shared/util/paginas-visibles-window.ts` exporting pure `paginasVisiblesWindow(total, actual): number[]` matching prior inline logic
- [x] 2.3 Run helper unit spec until green

## Phase 3: Wire list pages (SHELL-HYG-05)

- [x] 3.1 `students-list-page.ts`: `paginasVisibles` → `paginasVisiblesWindow(this.totalPaginas(), this.paginaSegura())`
- [x] 3.2 Same wire in `courses-list-page.ts`
- [x] 3.3 Same wire in `certifications-list-page.ts`
- [x] 3.4 Same wire in `attendances-list-page.ts`; HTML unchanged; OnPush untouched

## Phase 4: Verify prep + docs (for sdd-verify)

- [x] 4.1 `npx tsc --noEmit -p tsconfig.app.json` clean
- [x] 4.2 Re-run marking + list pagination + `app.routes` specs (expect green; `guardarYGenerar` / `''`→login)
- [x] 4.3 Spot-check OnPush inventory still complete (SHELL-HYG-04; no new non-OnPush)
- [x] 4.4 Confirm DEFER list untouched (formatters, clipboard, `mensajeErrorApi`, ponytails, P23, honesty)
- [x] 4.5 Update `docs/qa/PLAN-AUDITORIA-EXHAUSTIVA-STAGING-1.0.md` §U1 checkboxes at apply/archive
- [x] 4.6 Leave verify-report to **sdd-verify** (scenarios SHELL-HYG-01..05 + commands above); no commit in apply

## Verify (sdd-verify)

- [x] V.1 Focused helper + list + marking + routes `ng test` (231 SUCCESS) + `tsc` → `openspec/changes/audit-u01-prolijidad-fe/verify-report.md` (PASS: 5/5 req, 10/10 scenarios; deletes + pager wire + alias; OnPush 30/30; no commit).
