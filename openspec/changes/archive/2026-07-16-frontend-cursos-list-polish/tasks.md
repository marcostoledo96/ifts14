# Tasks: Lista de cursos — UI polish

## Review Workload Forecast

| Field | Value |
|-------|-------|
| Estimated changed lines | 250–400 |
| 400-line budget risk | Medium |
| Chained PRs recommended | No |
| Delivery strategy | single-cycle apply (orquestador) |
| Chain strategy | N/A |

Decision needed before apply: No
Chained PRs recommended: No
400-line budget risk: Medium

### Suggested Work Units

| Unit | Goal | Focused test | Rollback |
|------|------|--------------|----------|
| 1 | Chips estado + specs | `courses-list-page.spec.ts` | Revert list page |
| 2 | Badge + acento + estados SVG | idem | idem |
| 3 | apply-progress + tests verdes | idem | idem |

## Phase 1: Chips y filtro (REQ-CLIST-001/002)

- [x] 1.1 **RED** — Specs: chips `data-estado`, sin `<select>` estado; toggle Activos; toggle off; limpiar filtros.
- [x] 1.2 **GREEN** — `onEstado(EstadoCurso)` + template chips con dots; mantener fechas.

## Phase 2: Visual fila/card (REQ-CLIST-003/004/005)

- [x] 2.1 **RED→GREEN** — Badge con dot/borde/etiqueta; acento lateral; Presentes/Certif. `—` + a11y.

## Phase 3: Estados de pantalla (REQ-CLIST-006/007)

- [x] 3.1 **RED→GREEN** — Loading/error/empty/sin-coincidencias con SVG; CTA vacío; sin fetch en in-memory.

## Phase 4: Tracking

- [x] 4.1 `apply-progress.md` + tests focalizados verdes (14 SUCCESS).
