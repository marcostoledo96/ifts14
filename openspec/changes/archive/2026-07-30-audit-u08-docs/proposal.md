# Proposal: audit-u08-docs

## Intent

Cerrar PLAN §U8: docs canónicas honestas post-U6/U7 (operadores/QA), sin producto ni rewrite de specs.

## Scope

### In Scope

- Confirmar Git (`docs/06-flujo-git-recomendado.md`) + índice PLAN (`docs/00-indice-general.md`) — **no-op** si OK.
- Fix `docs/frontend/03-modulos-admin.md`: «miles → U6» incorrecto (paginación ≠ U6).
- Changelog: bullets U6 (lastSeen/TTL/503) + U7 (deny `src|config`, cookie lifetime=0).
- `CHECKLIST-TESTING-MANUAL.md`: cabecera rama `staging1.0`/`audit/*`; S-04 → **403** con deny U7 desplegado.
- Una nota drift (README specs **o** §U8 PLAN): supersedidos vs SoT; **no** rewrite.
- Banner opcional en `docs/backend/01-contrato-api-certificados.md` si aún narra `X-Admin-Key` HTTP.
- Marcar PLAN §U8 al verify/archive.

### Out of Scope

Rewrite specs/guías/contrato; U9 idle staging; código FE/BE; archive U7; rotar key/token; commit.

## Capabilities

### New Capabilities

- None

### Modified Capabilities

- None

(Docs hygiene only — sin deltas de requisito de producto.)

## Approach

**Approach 1 locked — docs quirúrgicos.** ~5–8 archivos, ≪400 LOC. ES-AR; sin secretos/dumps; demo local etiquetada. Contrato real: `01-contrato-api-certificados.md`.

## Affected Areas

| Area | Impact | Description |
|------|--------|-------------|
| `03-modulos-admin.md` | Modified | Quitar «→ U6» |
| `03-changelog.md` | Modified | Viñetas U6/U7 |
| `CHECKLIST-TESTING-MANUAL.md` | Modified | Cabecera + S-04 403 |
| `openspec/specs/README.md` o PLAN §U8 | Modified | Nota drift |
| `01-contrato-api-certificados.md` | Opt | Banner supersession |
| PLAN auditoría | Modified | Checkboxes al cierre |
| `06-flujo-git*`, `00-indice` | Confirm | No-op esperado |

## Risks

| Risk | Likelihood | Mitigation |
|------|------------|------------|
| Inflar PR con rewrite | Med | Banner/nota only |
| Creds staging en checklist | Low | Solo demo local |
| Tocar archive U7 / specs producto | Low | Paths prohibidos |

## Rollback Plan

Revertir PR docs. Sin runtime/migración. Archive U7 intacto.

## Dependencies

Tip staging1.0 = U7 (PR #115). S-04 403 cuando deny desplegado. U9 usa checklist actualizada.

## Success Criteria

- [ ] Etiqueta U6 fixed; changelog U6+U7; checklist + S-04 403.
- [ ] Nota drift en un solo lugar; sin rewrite contracts.
- [ ] Git+índice OK; PLAN §U8 cerrable; sin secretos; archive U7 intacto.

## Delivery / PR strategy

`size:exception` — **single PR** docs → `staging1.0`. Chained: No. Budget risk: Low. Sin commit hasta humano.

## Proposal assumptions (locked)

Audience = operadores/QA. Outcome = docs honestas. Drift location = design elige un sitio. Banner opcional in-scope. Downside mitigado por SoT pointers, no rewrite.
