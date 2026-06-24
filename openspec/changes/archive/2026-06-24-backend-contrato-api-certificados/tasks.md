# Tasks: Contrato de API para certificados QR

## Review Workload Forecast

| Field | Value |
|---|---|
| Estimated changed lines | ~450-700 documental |
| 400-line budget risk | Medium |
| Chained PRs recommended | Yes |
| Suggested split | PR 1 contrato backend → PR 2 referencias docs/OpenSpec |
| Delivery strategy | force-chained |
| Chain strategy | stacked-to-main |

Decision needed before apply: No
Chained PRs recommended: Yes
Chain strategy: stacked-to-main
400-line budget risk: Medium

### Suggested Work Units

| Unit | Goal | Likely PR | Notes |
|---|---|---|---|
| 1 | Contrato backend documental | PR 1 | Base `main`; docs y spec. |
| 2 | Archivo y verificación | PR 2 | Base PR 1; evidencias SDD. |

## Phase 1: Planificación SDD

- [x] 1.1 Crear proposal, spec, design y tasks del cambio `backend-contrato-api-certificados`.
- [x] 1.2 Definir capability OpenSpec nueva `backend-contrato-api-certificados`.

## Phase 2: Contrato documental

- [x] 2.1 Crear `docs/backend/01-contrato-api-certificados.md` con endpoints, DTOs, errores, validaciones y token QR.
- [x] 2.2 Actualizar `docs/backend/00-php84-api.md` con referencia al contrato.
- [x] 2.3 Actualizar `docs/database/00-mariadb.md` con conceptos futuros `cert_` sin migraciones.
- [x] 2.4 Actualizar `docs/frontend/00-angular20-port-v0.md` con expectativas de integración API.
- [x] 2.5 Actualizar `docs/00-indice-general.md` con rutas nuevas.

## Phase 3: Verificación

- [x] 3.1 Verificar que no se creó código PHP, Angular, migraciones ni dependencias.
- [x] 3.2 Verificar que no se expuso material privado, filas SQL, logs, DNI completo ni token completo real.
- [x] 3.3 Verificar que la spec promovida existe en `openspec/specs/`.

## Phase 4: Archive

- [x] 4.1 Promover la spec a `openspec/specs/backend-contrato-api-certificados/spec.md`.
- [x] 4.2 Archivar el cambio en `openspec/changes/archive/2026-06-24-backend-contrato-api-certificados/`.
- [x] 4.3 Persistir artefactos SDD en Engram.
