# Design: audit-u01-prolijidad-fe — FE hygiene (dead code)

## Technical Approach

Surgical Angular-only cleanup for PLAN §U1: delete orphaned scaffolds (`LandingPage`, `FolioShell`), remove dead `AttendanceMarkingPage.guardar()` alias, and extract identical pager-window logic into pure `paginasVisiblesWindow` used by the four admin list pages. Keep OnPush; no UX/HTML redesign; no route table edits (`''` already redirects to `/admin/login`). Spec delta: **ADDED** hygiene on `frontend-angular-shell` only. Maps to proposal Approach 1 with pager extract **locked in**.

## Architecture Decisions

| Decision | Options / tradeoff | Choice |
|----------|-------------------|--------|
| Scope of deletes | Docs-only vs delete orphans | **Delete** Landing + FolioShell + specs — zero product consumers (CodeGraph/grep) |
| Marking alias | Keep `guardar()` vs remove | **Remove** — HTML/specs call `guardarYGenerar` only |
| Pager extract | Defer vs include | **Include** — pure `paginasVisiblesWindow(total, actual)` |
| Helper location | `shared/ui/` vs new util | **`shared/util/paginas-visibles-window.ts`** — not a component; avoids polluting `ui/` |
| Formatters / clipboard / `mensajeErrorApi` / ponytails | Mega-extract vs defer | **Defer** (locked) — honesty/P22 risk |
| Change detection | Touch OnPush | **No change** — 32/32 already OnPush |
| Spec target | `ui-cleanup` vs shell | **`frontend-angular-shell` ADDED** — hygiene, not TipoEnvio product |
| Routing | Wire Landing vs leave redirect | **Leave** `app.routes.ts` — Landing never registered |

## Data Flow

Pager (unchanged UX; shared computation only):

```text
list page signals → totalPaginas / paginaSegura
        │
        ▼
paginasVisiblesWindow(total, actual)  ← pure shared util
        │
        ▼
paginasVisibles computed → template pager buttons (HTML unchanged)
```

Deletes have no runtime flow: scaffolds are unreachable; alias is unused.

## File Changes

| File | Action | Description |
|------|--------|-------------|
| `apps/frontend-angular/src/app/features/landing/landing-page.ts` | Delete | Orphan page |
| `apps/frontend-angular/src/app/features/landing/landing-page.spec.ts` | Delete | Spec for orphan |
| `apps/frontend-angular/src/app/shared/ui/folio-shell.ts` | Delete | Unused shared shell |
| `apps/frontend-angular/src/app/shared/ui/folio-shell.html` | Delete | Template |
| `apps/frontend-angular/src/app/shared/ui/folio-shell.css` | Delete | Styles |
| `apps/frontend-angular/src/app/shared/ui/folio-shell.spec.ts` | Delete | Spec |
| `…/marking/attendance-marking-page.ts` | Modify | Drop `guardar()` alias (~L301–304) |
| `apps/frontend-angular/src/app/shared/util/paginas-visibles-window.ts` | Create | Pure helper |
| `…/shared/util/paginas-visibles-window.spec.ts` | Create | Unit cases for window edges |
| `…/students/…/students-list-page.ts` | Modify | Import helper in `paginasVisibles` |
| `…/courses/courses-list-page.ts` | Modify | Same |
| `…/certifications/…/certifications-list-page.ts` | Modify | Same |
| `…/attendances/…/attendances-list-page.ts` | Modify | Same |
| `openspec/changes/…/specs/frontend-angular-shell/spec.md` | Create/Update | ADDED hygiene (sdd-spec) |
| `docs/qa/PLAN-AUDITORIA-…` §U1 | Modify | Checkboxes at apply/archive |

## Interfaces / Contracts

```typescript
/** Numbered pager window (max 5 pages). Identical to prior inline logic. */
export function paginasVisiblesWindow(total: number, actual: number): number[]
```

List pages keep `readonly paginasVisibles = computed(() => paginasVisiblesWindow(this.totalPaginas(), this.paginaSegura()))`.

## Testing Strategy

| Layer | What | Approach |
|-------|------|----------|
| Unit | `paginasVisiblesWindow` | Spec: total≤5; start window; middle; end window |
| Unit | Existing list/marking/route specs | Re-run; expect green (HTML/`guardarYGenerar` unchanged) |
| Unit | Deleted Landing/FolioShell specs | Gone with sources — no dangling imports |
| Typecheck | App compile | `npx tsc --noEmit -p tsconfig.app.json` |
| E2E | — | Out of scope (no UX change) |

## Threat Matrix

N/A — no new routing auth boundary, shell/subprocess, VCS automation, executable-file classification, or process integration. Deletes remove unreachable code; `app.routes.ts` unchanged.

## Migration / Rollout

No migration. Deploy FE bundle only. FolioShell recoverable via git if needed later.

## Open Questions

- None blocking — locks from explore/proposal/user resolve FolioShell delete, pager include, and DEFER list.
