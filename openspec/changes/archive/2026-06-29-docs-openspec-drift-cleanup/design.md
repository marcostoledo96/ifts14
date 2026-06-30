# Design: limpieza de drift OpenSpec y documentación de deploy

## Technical Approach

Cambio documental y de metadatos SDD. No toca producto. La implementación futura borra el stub activo obsoleto y ajusta solo la sección stale del deploy doc, usando el archive y las specs como fuente de verdad.

## Architecture Decisions

| Decision | Choice | Alternatives considered | Rationale |
|---|---|---|---|
| Stub activo | Borrar `openspec/changes/backend-public-endpoint-hardening/` | Reemplazar por pointer | Un directorio activo seguiría confundiendo al dispatcher; el archive ya conserva evidencia. |
| Deploy doc | Editar solo `Pendientes de capacidad pública` | Reescribir la guía completa | Menor diff, preserva advertencias cPanel y reduce riesgo documental. |
| Spec afectada | Modificar `repo-seguro` | Crear spec nueva | Ya contiene mantenimiento SDD; evita una capacidad nueva para una regla operativa chica. |

## Data Flow

No hay flujo runtime.

```txt
archive-report/specs backend ──→ deploy doc actualizado
archive-report completo ───────→ eliminación del stub activo
```

## File Changes

| File | Action | Description |
|---|---|---|
| `openspec/changes/backend-public-endpoint-hardening/exploration.md` | Delete | Stub activo obsoleto de ciclo archivado. |
| `openspec/changes/backend-public-endpoint-hardening/` | Delete | Directorio activo vacío luego de borrar el stub. |
| `docs/deploy/00-cpanel-certificados.md` | Modify | Reemplazar pendientes cerrados por estado vigente y pendientes reales. |
| `openspec/specs/repo-seguro/spec.md` | Modify via archive | Incorporar regla contra stubs activos de ciclos archivados. |

## Interfaces / Contracts

No cambia API, UI, base de datos, configuración ni contratos HTTP. El contrato nuevo es documental: un ciclo archivado no debe permanecer como cambio activo parcial.

## Testing Strategy

| Layer | What to Test | Approach |
|---|---|---|
| Repo | No queda stub activo | Verificar ausencia de `openspec/changes/backend-public-endpoint-hardening/`. |
| Docs | No queda texto stale | Revisar que deploy doc no diga que rate limiting/fault-injection siguen pendientes. |
| Safety | Scope acotado | `git diff --name-only` debe limitarse a OpenSpec/docs del ciclo. |

## Migration / Rollout

No requiere migración. Rollout por PR único documental. Rollback: revertir el PR.

## Open Questions

- Ninguna bloqueante.
