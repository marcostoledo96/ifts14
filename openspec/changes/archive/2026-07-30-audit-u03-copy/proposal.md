# Proposal: U3 — glosario UI + unificación de copy visible

## Intent

Cerrar PLAN §U3: bedelía ve etiquetas inconsistentes (Revocada≠Revocado, «vigentes» vs Válida, «Documento (mascarado)» con DNI completo). Glosario breve + unificar strings visibles; sin lógica, API ni UX redesign.

## Scope

### In Scope
- `docs/frontend/04-glosario-ui.md`: Válida/Revocado, Activo/Inactivo, Programada/Realizada, expediente, entrega manual + tono AR
- Expediente badge «Revocada» → «Revocado»
- Copy visible «vigentes» → «válidas» / **Válida** (estado cert para el usuario)
- Label «Documento (mascarado)» → **Documento** (o **DNI** por paridad); D0 intacto
- Hub Activo/Inactivo **solo si** bajo riesgo; si no → DEFER

### Out of Scope
- U5 error/empty/loading y jerga soft-errors; U4 a11y
- Folio público ceremonial; helpers de etiquetas; API/negocio; archive U2; commits

## Capabilities

### New Capabilities
- None

### Modified Capabilities
- `frontend-angular-shell`: **ADDED** lean — labels visibles DEBEN seguir el glosario; sin lógica
- `admin-certifications-frontend`: **MODIFIED** — badge expediente **Revocado**; label documento sin «mascarado» (D0)

> Hub: delta lean opcional `admin-attendances-frontend` (+ courses si hace falta). Default **DEFER**.

## Approach

Explore Approach 1: glosario canónico + pass quirúrgico en preview/list/delivery/revoke/new. API/DTO siguen `vigente`/`revocado`. Asimetría Válida/Revocado intencional (PLAN).

## Affected Areas

| Area | Impact | Description |
|------|--------|-------------|
| `docs/frontend/04-glosario-ui.md` | New | Glosario breve |
| `certifications/.../preview/` | Modified | Revocado; Documento; válidas |
| `certifications/.../{list,delivery,revoke,new}/` | Modified | Strings «vigente(s)» visibles |
| `attendances/.../list/` | Optional | Badges Activo/Inactivo |
| Specs shell + certs | Delta | ADDED / MODIFIED lean |

## Risks

| Risk | Likelihood | Mitigation |
|------|------------|------------|
| Tests afirman copy viejo | Med | Actualizar aserciones |
| Scope creep a U5 | Med | Solo strings de glosario |
| Hub abre drift 4-estados | Low | Default DEFER hub |

## Rollback Plan

Revert FE + glosario + deltas de spec. Sin DB/API/migraciones.

## Dependencies

Explore locks; D0; base post-U2 (`125f6f8`). No U4/U5.

## Success Criteria

- [ ] Glosario cubre términos PLAN §U3
- [ ] Expediente: **Revocado**; sin «Documento (mascarado)» engañoso
- [ ] Copy admin de estado cert: válidas/Válida (no «vigentes» visible)
- [ ] Sin lógica/API; D0; archive U2 intacto; sin commit en esta fase

## Proposal question round

**Locked**: Approach 1; specs shell+certs; hub DEFER salvo bajo riesgo; pública fuera; U5/U4 diferidos.

1. Label canónico DNI completo: **Documento** o **DNI**?
2. ¿Hub Activo/Inactivo en el primer slice o diferido?
3. ¿El glosario explica VÁLIDO público ≠ Válida admin?
4. ¿Algún «vigente» operativo queda en diálogos de revocación?
