# Proposal: audit-p23-not-found

## Intent

Close P23 / PUB-02: clear public `NotFoundPage` (ES-AR copy, one «volver» CTA, minimal styles, route title if easy) while keeping admin orphan isolation (`/admin/typo` → prefix catch-all → dashboard → guard). Add the 404/isolation contract missing from `frontend-angular-shell`.

## Scope

### In Scope
- Front-only polish: `features/not-found/not-found-page` (+ spec; optional CSS)
- ES-AR copy; single CTA → `/admin/login` only (e.g. «Ir al acceso administrativo»)
- Minimal public-shell styles; optional `title` on `**`
- Keep admin catch-all `pathMatch: 'prefix'` → `/admin/dashboard` (verify only)
- Tests: CTA + anti-leak (no `/validar/…`, no demo/token/stack); isolation regression
- `frontend-angular-shell` **ADDED**: wildcard→NotFound; admin orphan ≠ public validation; back links
- PLAN P23 checkboxes at apply/archive

### Out of Scope (locked non-goals)
- AdminNotFound / dedicated admin 404
- Link to `/validar/…` or public-validation rewrite
- Primary-target `frontend-public-validation` / `admin-shell-chrome`
- P22 archive / `public-validation-page.*` / result-mapper / backend verify
- D0 token/QR rotation; stacks / raw Error / PII on NotFound
- Root chrome rewrite; commit

## Capabilities

### New Capabilities
- None

### Modified Capabilities
- `frontend-angular-shell`: **ADDED** — `**` → `NotFoundPage` (clear ES-AR, CTA → `/admin/login`, no `/validar/…`); admin orphans MUST NOT hit public validation or public wildcard (prefix→dashboard stays). Fixed copy only; no stacks/tokens/demo.

## Approach

1. Polish NotFound: copy + one public `RouterLink` to `/admin/login` (not `UiBackLink`); optional CSS/`title`.
2. Do not reorder admin catch-all; only add `title` on `**` if trivial.
3. Harden not-found + routes specs (CTA, isolation, anti-leak).
4. Spec delta only on `frontend-angular-shell` (ADDED).

## Affected Areas

| Area | Impact | Description |
|------|--------|-------------|
| `features/not-found/not-found-page.*` | Modified | copy, CTA, styles |
| `app.routes.ts` | Minimal | optional `title` on `**` |
| route / not-found specs | Modified | CTA + isolation |
| `frontend-angular-shell` | Modified | ADDED 404 + isolation |

## Risks

| Risk | Likelihood | Mitigation |
|------|------------|------------|
| Footer chrome confuses 404 | Med | Page-local copy only |
| Mis-edit breaks catch-all order | Med | No reorder; keep `/admin/typo` tests |
| Harness URL-only today | Low | Add DOM/CTA asserts |

## Rollback Plan

Revert not-found + optional route title + shell delta; no schema/deploy/backend.

## Dependencies

Explore defaults 1–9 locked; admin 404 deferred; existing isolation suite; P15–P22 honesty.

## Success Criteria

- [ ] NotFound ES-AR + one CTA → `/admin/login`; no `/validar/…`
- [ ] `/admin/typo` still isolated
- [ ] No stack/token/demo/PII; D0 untouched
- [ ] Spec ADDED on `frontend-angular-shell` only
- [ ] P22 / validation / backend untouched; no commit

## Proposal question round

LOCK accepted from explore + orchestrator. Assumed: single login CTA; simple public link; AdminNotFound deferred.
