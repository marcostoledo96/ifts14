# Design: audit-u08-docs

## Technical Approach

Docs-only hygiene (Approach 1 locked). Align operator/QA docs with post-U6/U7 reality: honest labels, changelog viñetas, checklist S-04 expect **403** when U7 deny is deployed, one short drift note, optional supersession banner on the historical contrato. No product code, no capability deltas, no rewrite of specs/contracts. Specs may land in parallel (docs-only / no product delta). `apply.tdd: false`. Verify = content assertions / grep. No commit in this cycle.

## Architecture Decisions

| Decision | Options | Choice | Rationale |
|----------|---------|--------|-----------|
| Change type | Product deltas / docs hygiene | **Docs hygiene only** | Proposal Capabilities New/Modified = None; locks docs-only |
| Drift note location | `openspec/specs/README.md` vs PLAN §U8 | **PLAN §U8 «Nota de drift»** | User preference; README is a stub (“specs futuras”); U8 checklist lives in PLAN |
| Contrato banner | Skip / rewrite tables / one banner | **One banner** atop `01-contrato-api-certificados.md` | Still claims `X-Admin-Key` HTTP; banner points to SoT without rewrite |
| Miles label | Keep U6 / DEFER U9 / U8 note | **Honest deferral** (paginación/API futura; not U6 backend) | U6 = session lastSeen/TTL/503≠429 |
| S-04 expectation | Keep 403/404 mixed / force 403 | **MUST 403** for `…/api/src/…` when htaccess U7 deployed | U7 deny before FallbackResource; live Apache still U9 |
| Git + índice | Edit / no-op | **Confirm no-op** | Already staging1.0/main=prod + PLAN link |
| PLAN §U8 close | Design vs apply | **Mark `[x]` in apply** | Process checkboxes + status row at close |

## Data Flow

N/A — no runtime. Doc→reader only:

```
Operator/QA
    │
    ├─→ 03-modulos-admin (honest scale note)
    ├─→ 03-changelog (U6+U7 viñetas)
    ├─→ CHECKLIST (rama staging1.0; S-04 → 403)
    ├─→ PLAN §U8 Nota de drift → SoT pointers
    └─→ 01-contrato-api-certificados (banner → admin-auth / 00-php84-api / API.md)
```

## File Changes

| File | Action | Description |
|------|--------|-------------|
| `docs/frontend/03-modulos-admin.md` | Modify | Replace «miles → U6» with honest paginación/API deferral (not U6 backend) |
| `docs/03-changelog.md` | Modify | Add U6 (lastSeen on session/authorize; TTL 14400/28800 docs; storage→503≠429) + U7 (deny `src\|config`; cookie lifetime=0 D-009); fix U2 FE «miles → U6» wording in same file |
| `docs/qa/CHECKLIST-TESTING-MANUAL.md` | Modify | Header/plantilla rama → `staging1.0` / `audit/*`; S-04 notes: `…/api/src/…` **MUST 403** when U7 htaccess deployed; keep demo creds labeled local-only |
| `docs/qa/PLAN-AUDITORIA-EXHAUSTIVA-STAGING-1.0.md` | Modify | Add short §U8 «Nota de drift»; mark checklist `[x]` + table row in apply |
| `docs/backend/01-contrato-api-certificados.md` | Modify (opt→**in**) | One supersession banner: admin HTTP = sesión+CSRF; `X-Admin-Key` HTTP obsolete → SoT |
| `docs/06-flujo-git-recomendado.md` | Confirm | **No-op** (already correct) |
| `docs/00-indice-general.md` | Confirm | **No-op** (PLAN already linked) |
| `openspec/specs/README.md` | Confirm | **No-op** (drift lives in PLAN; do not inflate stub) |
| `openspec/changes/archive/2026-07-30-audit-u07-seguridad/**` | Forbidden | Intact |

### Drift note contents (PLAN §U8 — single short section)

List known drifts **without rewriting**:

- `01-contrato-api-certificados.md` — Admin HTTP still tabulated with `X-Admin-Key` (banner + SoT)
- `deploy-cpanel-certificados` / guías Marcos·Matías — historical D0 «X-Admin-Key temporal»
- Residual phrase in `00-php84-api.md` vs body D-009
- SoT: `openspec/specs/admin-auth/spec.md`, `docs/backend/00-php84-api.md`, `docs/backend/API.md`

### Banner (contrato) — pattern

Match sibling tone of `API.md` P5-01 (~1–2 lines): sesión PHP + CSRF; `X-Admin-Key` no autoriza HTTP (CLI/smokes only); link `admin-auth` + `00-php84-api.md`. Do **not** edit auth tables in this cycle.

## Interfaces / Contracts

No new APIs/types. Documentary contracts only:

- Auth SoT unchanged (session + CSRF; key CLI-only).
- Deny: `RewriteRule ^(src|config)/ - [F,L]` → HTTP **403** on API paths when deployed.
- TTL docs: idle 14400 / absolute 28800; cookie `lifetime=0` vs absolute app-side (U7 D-009).

## Testing Strategy

| Layer | What | Approach |
|-------|------|----------|
| Unit / TDD | N/A | `apply.tdd: false` |
| Content assert | Labels + viñetas + S-04 + drift + banner | `rg` / file reads |
| Integration / E2E | N/A product | Live 403 staging → **U9** |

### Verify strategy (apply/verify)

1. `rg 'miles → U6|→ U6'` on `03-modulos-admin.md` (+ changelog U2 line) → **0** false U6 pointers.
2. Changelog contains U6 keywords: `lastSeen`, `503`, TTL/`14400`|`28800`; U7: `deny`|`src|config`, `lifetime=0`|cookie.
3. Checklist: plantilla/rama mentions `staging1.0`; S-04 notes assert **403** for `api/src` when deny deployed.
4. PLAN §U8 has «Nota de drift» + checklist items `[x]` (after apply).
5. Contrato file starts with supersession banner mentioning sesión/`X-Admin-Key` no HTTP.
6. `06-flujo-git-recomendado.md` + `00-indice-general.md` unchanged (or typo-only).
7. Archive U7 path untouched; no secrets/dumps introduced.

## Threat Matrix

N/A — no routing, shell, subprocess, VCS/PR automation, executable-file classification, or process-integration boundary. Docs-only.

## Migration / Rollout

No migration. Single docs PR → `staging1.0` (`size:exception`, budget Low). Rollback = revert PR. No commit until human asks.

## Open Questions

- None blocking. Idle TTL proof on live staging deferred to **U9**.
