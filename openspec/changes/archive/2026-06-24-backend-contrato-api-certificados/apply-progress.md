# Apply Progress: Contrato de API para certificados QR

## Mode

Standard documentation-only. Strict TDD not applicable because no product implementation was created.

## Completed Tasks

- [x] 1.1 Crear proposal, spec, design y tasks del cambio.
- [x] 1.2 Definir capability OpenSpec nueva.
- [x] 2.1 Crear contrato backend completo.
- [x] 2.2 Actualizar resumen backend.
- [x] 2.3 Actualizar conceptos futuros de base.
- [x] 2.4 Actualizar expectativas frontend.
- [x] 2.5 Actualizar índice general.
- [x] 3.1 Verificar ausencia de código de producto, migraciones y dependencias.
- [x] 3.2 Verificar ausencia de material privado expuesto.
- [x] 3.3 Verificar spec promovida.
- [x] 4.1 Promover spec.
- [x] 4.2 Archivar cambio.
- [x] 4.3 Persistir Engram.

## Files Changed

| File | Action | What Was Done |
|---|---|---|
| `docs/backend/01-contrato-api-certificados.md` | Created | Contrato de endpoints, DTOs, errores, validación y seguridad. |
| `docs/backend/00-php84-api.md` | Modified | Referencia al contrato vigente. |
| `docs/database/00-mariadb.md` | Modified | Conceptos futuros de tablas `cert_`. |
| `docs/frontend/00-angular20-port-v0.md` | Modified | Expectativas de integración futura. |
| `docs/00-indice-general.md` | Modified | Índice actualizado. |
| `openspec/specs/backend-contrato-api-certificados/spec.md` | Created | Capability promovida. |
| `openspec/changes/archive/2026-06-24-backend-contrato-api-certificados/` | Created | Auditoría SDD archivada. |

## Deviations from Design

None — implementation matches design. El cambio fue documental.

## Issues Found

- `openspec/config.yaml` no existe; se aplicaron reglas de `AGENTS.md` y skills SDD.

## Workload / PR Boundary

- Mode: stacked PR slice.
- Current work unit: contrato documental backend + archivo SDD.
- Boundary: docs públicas y OpenSpec; sin runtime.
- Estimated review budget impact: dentro del presupuesto solicitado de 800 líneas.
