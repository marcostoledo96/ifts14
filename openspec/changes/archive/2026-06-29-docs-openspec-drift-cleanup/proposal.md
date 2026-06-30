# Proposal: limpieza de drift OpenSpec y documentación de deploy

## Intent

Eliminar dos señales contradictorias que pueden desviar a futuros agentes SDD: un stub activo de un ciclo ya archivado y una guía de deploy que aún marca como pendientes capacidades ya cerradas.

## Scope

### In Scope
- Quitar el stub activo `openspec/changes/backend-public-endpoint-hardening/` porque la evidencia completa vive en `archive/2026-06-26-backend-public-endpoint-hardening/`.
- Actualizar solo la sección obsoleta de `docs/deploy/00-cpanel-certificados.md` sobre rate limiting y fault-injection.
- Registrar una regla mínima de mantenimiento SDD para evitar stubs activos de cambios archivados.

### Out of Scope
- Cambios de producto, backend, frontend, base de datos o deploy real.
- Reabrir o revalidar `backend-public-endpoint-hardening`.
- Modificar material privado, dumps, logs, configs reales o cPanel.

## Capabilities

### New Capabilities
- Ninguna.

### Modified Capabilities
- `repo-seguro`: precisa mantenimiento OpenSpec/documental para que cambios archivados no queden como activos ni documenten pendientes ya resueltos.

## Approach

Aplicar la corrección más chica: borrar el directorio activo stale, conservar intacto el archivo histórico y ajustar solo las líneas stale del deploy doc usando como fuente `archive-report.md`, `api-rate-limiting` y `docs/backend/01-contrato-api-certificados.md`.

## Affected Areas

| Area | Impact | Description |
|---|---|---|
| `openspec/changes/backend-public-endpoint-hardening/` | Removed | Stub activo obsoleto; la evidencia está archivada. |
| `docs/deploy/00-cpanel-certificados.md` | Modified | Estado de rate limiting/fault-injection alineado con backend/specs. |
| `openspec/specs/repo-seguro/spec.md` | Modified | Regla de mantenimiento SDD al archivar ciclos. |

## Risks

| Risk | Likelihood | Mitigation |
|---|---|---|
| Borrar evidencia útil | Low | Confirmar que el archive contiene artefactos completos antes de borrar el stub. |
| Sobre-editar deploy doc | Medium | Tocar solo la sección obsoleta y preservar advertencias cPanel. |

## Rollback Plan

Revertir el commit del ciclo o restaurar el stub desde `openspec/changes/archive/2026-06-26-backend-public-endpoint-hardening/exploration.md` si hiciera falta diagnosticar el intento histórico.

## Dependencies

- Rama limpia `docs/openspec-drift-cleanup` creada desde `main` post PR #10.
- Archive report y specs sincronizadas del ciclo backend hardening.

## Success Criteria

- [ ] `openspec/changes/backend-public-endpoint-hardening/` ya no existe como cambio activo.
- [ ] Deploy doc no marca rate limiting ni fault-injection como pendientes ya resueltos.
- [ ] No se modifican producto, datos reales, cPanel ni material privado.
