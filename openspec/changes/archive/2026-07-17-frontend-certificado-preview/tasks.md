# Tasks: Preview de certificado — Copiar/Compartir y autoridades

## Review Workload Forecast

| Field | Value |
|-------|-------|
| Estimated changed lines | 280–400 |
| 400-line budget risk | Medium |
| Chained PRs recommended | No |
| Suggested split | Single PR (preview page + specs) |
| Delivery strategy | single-cycle apply (orquestador) |
| Chain strategy | single-pr |

Decision needed before apply: No  
Chained PRs recommended: No  
Chain strategy: single-pr  
400-line budget risk: Medium  

### Suggested Work Units

| Unit | Goal | Likely PR | Focused test command | Runtime harness | Rollback boundary |
|------|------|-----------|----------------------|-----------------|-------------------|
| 1 | Preview Copiar/Compartir + autoridades | PR1 | `npx ng test --include='**/certification-preview-page.spec.ts' --watch=false` | N/A unit | Revert `pages/preview/*` |

## Phase 1: Carga paralela y señales (REQ-CPREV-001/005/006)

- [x] 1.1 Inyectar `INSTITUTIONAL_CONFIG_SOURCE`; `Promise.allSettled` de `obtener` + `config.obtener` + `obtenerEntregaManual`; detalle hard / config+entrega soft; signals `entregaUrl`, `configPendiente`, `autoridades`.
- [x] 1.2 Criterio `configPendiente` = GET fail OR ambos nombres vacíos tras trim; `puedeCopiarCompartir` = !revocado && URL canónica.

## Phase 2: Copiar / Compartir (REQ-CPREV-002/003/004)

- [x] 2.1 `copiarLink` usa solo `entregaUrl` (clipboard + `execCommand`); feedback “Link copiado”; quitar handoff F6-03.
- [x] 2.2 `compartir` con `navigator.share`; `AbortError` silencio; sin share / otro error → clipboard.

## Phase 3: UI autoridades y acciones (REQ-CPREV-005/006/007)

- [x] 3.1 HTML: habilitar Copiar + Compartir; autoridades reales o “Configuración institucional pendiente”; sin placeholders demo ni textos F6-03.
- [x] 3.2 CSS mínimo para botones acción / aviso pendiente.

## Phase 4: Tests (REQ-CPREV-001…007)

- [x] 4.1 Actualizar/añadir escenarios en `certification-preview-page.spec.ts` (URL canónica, AbortError, config pendiente no bloquea, sin F6-03).
- [x] 4.2 Tests focalizados verdes.

## Phase 5: Tracking

- [x] 5.1 Crear `apply-progress.md` con checklist.
- [x] 5.2 Persist Engram `sdd/frontend-certificado-preview/apply-progress` + tasks.
