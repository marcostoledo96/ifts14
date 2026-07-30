# Design: audit-p23-not-found

## Technical Approach

Lean front-only polish of public `NotFoundPage` to close P23 / PUB-02: clearer ES-AR copy, one `RouterLink` CTA → `/admin/login`, minimal CSS using shell tokens, and `title` on the `**` route. Keep the admin prefix catch-all untouched (order and redirect). Maps to proposal approach and `frontend-angular-shell` ADDED (spec phase). No P22 / public-validation / backend touch.

## Architecture Decisions

| Decision | Options | Tradeoff | Choice |
|----------|---------|----------|--------|
| Scope | Document-only / AdminNotFound+public / **NotFound polish** | Doc leaves gap; AdminNotFound expands blast | **Polish only** (locked) |
| CTA destinations | Login only / Login+validar hint / UiBackLink | Extra links invite dead `/validar/…`; UiBackLink = admin ink | **Single `RouterLink` → `/admin/login`** |
| Template layout | Keep inline / **split html+css** | Inline ok for scaffold; split matches feature pages | **`templateUrl` + `styleUrl`** |
| Route title | Skip / **add on `**`** | Trivial; matches admin `title` pattern | **`title: 'Página no encontrada — IFTS 14'`** |
| Admin orphans | AdminNotFound / **prefix→dashboard** | Silent redirect vs honesty | **Keep catch-all** (locked) |
| Spec target | `frontend-public-validation` / **`frontend-angular-shell` ADDED** | Validation rewrite forbidden | **Shell ADDED only** |

## Data Flow

```
Unknown non-admin URL
       │
       ▼
  routes `**` ──loadComponent──► NotFoundPage (fixed copy + CTA)
       │
       │  CTA RouterLink
       ▼
  /admin/login

Unknown /admin/* (after named admin routes)
       │
       ▼
  path: 'admin', pathMatch: 'prefix' ──redirectTo──► /admin/dashboard
       │
       ▼
  adminGuard ──session?──► dashboard | /admin/login
  (never PublicValidationPage, never public `**`)
```

## File Changes

| File | Action | Description |
|------|--------|-------------|
| `apps/frontend-angular/src/app/features/not-found/not-found-page.ts` | Modify | `RouterLink` import; `templateUrl`/`styleUrl`; keep OnPush |
| `apps/frontend-angular/src/app/features/not-found/not-found-page.html` | Create | `section[aria-labelledby]`, h1, body copy, one link |
| `apps/frontend-angular/src/app/features/not-found/not-found-page.css` | Create | Minimal spacing/typography via `--color-*` tokens |
| `apps/frontend-angular/src/app/features/not-found/not-found-page.spec.ts` | Modify | CTA `/admin/login`; anti `/validar`; keep anti-demo |
| `apps/frontend-angular/src/app/app.routes.ts` | Modify | Add `title` on `**` only; **do not** reorder catch-all |
| `apps/frontend-angular/src/app/app.routes.spec.ts` | Modify | Assert `**` title; keep `/admin/typo` isolation suite |
| `openspec/changes/audit-p23-not-found/specs/frontend-angular-shell/spec.md` | Create (sdd-spec) | ADDED: wildcard→NotFound; isolation; CTA |
| `docs/qa/PLAN-AUDITORIA-EXHAUSTIVA-STAGING-1.0.md` | Modify (apply/archive) | P23 checkboxes |

**Do not touch**: `public-validation-page.*`, P22 archive, result-mapper, backend, `UiBackLink`, admin catch-all body.

## Interfaces / Contracts

No new TS interfaces. CTA contract (DOM):

- Exactly one navigational CTA: `a[routerLink="/admin/login"]` (or equivalent `RouterLink` binding).
- Label ES-AR: «Ir al acceso administrativo».
- Template text MUST NOT contain `/validar`, `demo-valido`, stack/Error.message, tokens, or DNI.

## Testing Strategy

| Layer | What | Approach |
|-------|------|----------|
| Unit (`not-found-page.spec`) | Copy + CTA href + anti-leak | TestBed render; query link; text negatives |
| Route unit (`app.routes.spec`) | `**` has title; loadComponent = NotFound | Inspect `routes` array |
| Route nav | `/admin/typo` isolation; public unknown stays on URL + NotFound | Existing harness; keep RED regressions |
| E2E | — | Out of scope |

**RED outline (apply):**

1. NotFound CTA `routerLink` === `/admin/login`.
2. NotFound DOM/text has no `/validar` / `demo-valido` / `Certificado verificable`.
3. `routes` `**` exposes expected `title`.
4. Existing: `/admin/typo` unauth → `/admin/login`; auth → `/admin/dashboard`; public unknown ≠ `/admin/` and ≠ `/validar/`.

## Threat Matrix

SPA route isolation applies; generic agent threat rows do **not**.

| Boundary | Applicability | Design response | Planned RED tests |
|----------|---------------|-----------------|-------------------|
| Documentation-like paths | N/A — no executable-path classification | — | — |
| Git repository selection | N/A — no git automation | — | — |
| Commit state | N/A — no commit in this change | — | — |
| Push state | N/A | — | — |
| PR commands | N/A | — | — |

**SPA invariant (propagate to tasks):** admin prefix catch-all MUST stay before `**`; public `**` MUST NOT load validation; NotFound MUST NOT link `/validar/…`.

## Migration / Rollout

No migration. Front-only; revert component + optional title + shell delta.

## Open Questions

- None — locked by explore/propose/orchestrator (single login CTA; no AdminNotFound; no `/validar` link).
