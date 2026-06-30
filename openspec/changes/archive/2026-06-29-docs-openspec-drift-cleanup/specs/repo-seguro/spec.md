# Delta — repo-seguro

## MODIFIED Requirements

### Requirement: Verificación y mantenimiento SDD

El cambio DEBE dejar evidencia de tareas, aplicación y verificación para que el dispatcher SDD pueda continuar sin blockers de artefactos OpenSpec. Además, un cambio ya archivado DEBE conservarse solo bajo `openspec/changes/archive/` y NO DEBE quedar un directorio activo con el mismo nombre salvo que sea una continuación explícita con artefactos completos. La documentación operativa DEBE alinearse con specs archivadas cuando el archive cierre pendientes previos.
(Previously: exigía reconciliar artefactos faltantes, pero no prohibía stubs activos de cambios archivados ni drift documental posterior.)

#### Scenario: Artefactos OpenSpec reconciliados

- **Given** los artefactos existían en Engram
- **When** se reconcilia el modo híbrido
- **Then** DEBE existir `proposal.md`, `specs/repo-seguro/spec.md`, `design.md`, `tasks.md`, `apply-progress.md` y `verify-report.md` bajo `openspec/changes/reorganizacion-segura-inicial/`.

#### Scenario: Estado de tareas preservado

- **Given** las tareas ya estaban completadas
- **When** se actualizan artefactos faltantes
- **Then** `tasks.md` DEBE conservar sus checkboxes completados.

#### Scenario: Cambio archivado sin stub activo

- **Given** `openspec/changes/archive/YYYY-MM-DD-{change}/` contiene `archive-report.md` y artefactos completos
- **When** se revisan cambios activos
- **Then** NO DEBE existir `openspec/changes/{change}/` con un stub parcial que haga parecer abierto el ciclo archivado.

#### Scenario: Documentación operativa alineada

- **Given** un archive sincronizó specs y cerró un pendiente operativo
- **When** se revisa documentación de deploy o backend relacionada
- **Then** NO DEBE seguir describiendo ese pendiente como ausente o no verificado.
