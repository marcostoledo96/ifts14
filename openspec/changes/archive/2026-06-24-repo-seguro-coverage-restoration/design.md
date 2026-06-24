# Design: restaurar cobertura de escenarios de repo-seguro

## Technical Approach

Cambio spec-only: reemplazar el requisito `Protección de material sensible antes de versionar` con un bloque completo que conserva el texto y los escenarios audit-focused actuales, y suma los cuatro escenarios perdidos.

## Architecture Decisions

| Decision | Choice | Rationale |
|----------|--------|-----------|
| Tipo de delta | `MODIFIED Requirements` completo | OpenSpec reemplaza requisitos modificados; un bloque parcial volvería a perder escenarios. |
| Alcance | Solo Markdown OpenSpec | El problema es de cobertura documental, no de implementación de producto. |
| Verificación | Inspección textual de frases y paths | La aceptación depende de presencia de escenarios y ausencia de archivos de producto nuevos. |

## Data Flow

No aplica. No hay flujo de datos ni ejecución de producto.

## File Changes

| File | Action | Description |
|------|--------|-------------|
| `openspec/changes/repo-seguro-coverage-restoration/proposal.md` | Create | Define alcance correctivo mínimo. |
| `openspec/changes/repo-seguro-coverage-restoration/specs/repo-seguro/spec.md` | Create | Delta con requisito completo modificado. |
| `openspec/changes/repo-seguro-coverage-restoration/tasks.md` | Create | Plan mínimo y forecast de revisión. |
| `openspec/specs/repo-seguro/spec.md` | Modify | Agrega escenarios restaurados preservando los actuales. |
| `openspec/changes/repo-seguro-coverage-restoration/apply-progress.md` | Create | Evidencia de aplicación. |
| `openspec/changes/repo-seguro-coverage-restoration/verify-report.md` | Create | Evidencia de verificación. |

## Interfaces / Contracts

Contrato afectado: escenarios OpenSpec de `repo-seguro`.

## Testing Strategy

| Layer | What to Test | Approach |
|-------|-------------|----------|
| Spec | Escenarios restaurados y preservados | Buscar frases exactas en `openspec/specs/repo-seguro/spec.md`. |
| Repo safety | Sin producto nuevo | Revisar archivos creados/modificados del ciclo. |

## Migration / Rollout

No requiere migración.

## Open Questions

Ninguna.
