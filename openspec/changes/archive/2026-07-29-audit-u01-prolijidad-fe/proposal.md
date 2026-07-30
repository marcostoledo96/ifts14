# Proposal: audit-u01-prolijidad-fe — FE hygiene (dead code)

## Intent

Close PLAN §U1 (prolijidad FE) with a surgical, reviewable cleanup: remove orphaned page/shared scaffolds and one dead method alias that inflate the tree and confuse audits, without UX redesign or honesty rewrites.

## Scope

### In Scope
- Delete unused `LandingPage` (`features/landing/*` + specs); routing already redirects `''` → `/admin/login`
- Delete unused `FolioShell` (`shared/ui/folio-shell.*` + specs); zero product consumers
- Remove dead `guardar()` alias on `attendance-marking-page` (UI/specs use `guardarYGenerar` only)
- Optional: extract pure `paginasVisiblesWindow` if diff stays small (~4 list pages; HTML unchanged)
- Spec: **ADDED** on `frontend-angular-shell` (hygiene / no dead routed pages; optional OnPush invariant already true)
- PLAN §U1 checkboxes at apply/archive

### Out of Scope (locked non-goals)
- Unify date formatters (admin/public); clipboard helpers; `mensajeErrorApi` unifiers
- Mass `// ponytail:` purge; UX/copy; U2 performance/lazy/bundles
- Honesty rewrites P15–P23; touch P23 archive / `NotFound`
- `formatearFechaAsistida` → es-AR (presentation/U3)
- Backend; D0 token/QR; public-validation rewrite; commit

## Capabilities

### New Capabilities
- None

### Modified Capabilities
- `frontend-angular-shell`: **ADDED** — product hygiene: no page scaffolds without canonical `loadComponent`/route; no shared UI components versioned without product consumers; app `@Component`s keep `OnPush` (document existing invariant). Optional note if pager helper is extracted.

## Approach

1. Delete Landing + FolioShell trees and their specs; confirm no route/import references remain.
2. Drop `guardar()` alias on marking page; keep `guardarYGenerar`.
3. Optionally extract identical `paginasVisibles` into a pure shared helper used by 4 list pages.
4. Add lightweight ADDED requirements/scenarios on `frontend-angular-shell` only (not `ui-cleanup`).
5. Verify with existing route/list/marking specs + `tsc --noEmit`.

## Affected Areas

| Area | Impact | Description |
|------|--------|-------------|
| `features/landing/*` | Removed | Dead scaffold + specs |
| `shared/ui/folio-shell.*` | Removed | Dead shared shell + specs |
| `…/marking/attendance-marking-page.ts` | Modified | Remove `guardar()` alias |
| 4 list `*-list-page.ts` (± shared helper) | Optional | Pager window extract |
| `frontend-angular-shell` | Modified | ADDED hygiene |
| PLAN §U1 | Docs | Checkboxes at apply/archive |

## Risks

| Risk | Likelihood | Mitigation |
|------|------------|------------|
| FolioShell wanted soon | Low | Restore from git; note in changelog |
| Pager extract breaks 4 lists | Low | Pure fn + existing pagination specs |
| Scope creep past ~400 lines | Med | Stick to locked DEFER list |

## Rollback Plan

`git restore` / revert the delete + alias + optional helper + shell delta. No schema, deploy, or backend.

## Dependencies

- Explore `openspec/changes/audit-u01-prolijidad-fe/explore.md` (Approach 1 locked)
- Branch `audit/u01-prolijidad-fe`; no commit in propose

## Success Criteria

- [ ] Landing, FolioShell, and `guardar()` alias gone; no dangling imports/routes
- [ ] Optional pager extract only if net diff stays small and list UX unchanged
- [ ] `frontend-angular-shell` ADDED hygiene requirements present
- [ ] `tsc --noEmit` clean; relevant unit specs green
- [ ] DEFER items untouched; D0 / P23 archive / honesty P15–P23 intact

## Proposal question round

Assumptions locked from explore + user prompt (Approach 1). Optional confirmations before spec/design:

1. Is deleting FolioShell acceptable even if a future folio layout might reuse it (git restore OK)?
2. Should the optional `paginasVisiblesWindow` extract be **in** this slice or deferred if review budget is tight?
3. Any remaining consumer of Landing (bookmarks/docs) we must document before delete?

Answer, skip, correct framing, or request a second round; otherwise proceed with these assumptions.
