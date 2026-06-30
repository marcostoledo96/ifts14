# Tasks: limpieza de drift OpenSpec y documentación de deploy

## Review Workload Forecast

| Field | Value |
|---|---|
| Estimated changed lines | 80–160 |
| 400-line budget risk | Low |
| Chained PRs recommended | No |
| Suggested split | Single PR |
| Delivery strategy | single-pr-default |
| Chain strategy | pending |

Decision needed before apply: No
Chained PRs recommended: No
Chain strategy: pending
400-line budget risk: Low

### Suggested Work Units

| Unit | Goal | Likely PR | Notes |
|---|---|---|---|
| 1 | Corregir drift OpenSpec/docs | PR único | Sin producto ni deploy real. |

## Phase 1: OpenSpec cleanup

- [x] 1.1 Confirmar que `openspec/changes/archive/2026-06-26-backend-public-endpoint-hardening/` conserva artefactos completos.
- [x] 1.2 Eliminar `openspec/changes/backend-public-endpoint-hardening/exploration.md` y el directorio activo si queda vacío.

## Phase 2: Deploy documentation

- [x] 2.1 Editar solo `docs/deploy/00-cpanel-certificados.md` para quitar rate limiting/fault-injection como pendientes.
- [x] 2.2 Preservar advertencias de cPanel, no deploy real, datos ficticios, backup y rollback.

## Phase 3: Spec delta and archive readiness

- [x] 3.1 Mantener el delta `openspec/changes/docs-openspec-drift-cleanup/specs/repo-seguro/spec.md` alineado con la decisión de borrar stubs activos.
- [x] 3.2 Preparar `sdd-archive` para fusionar solo la regla de mantenimiento SDD en `openspec/specs/repo-seguro/spec.md`.

## Phase 4: Verification

- [x] 4.1 Verificar que no exista `openspec/changes/backend-public-endpoint-hardening/` como cambio activo.
- [x] 4.2 Verificar que el deploy doc no afirme que `429 RATE_LIMITED` ni fault-injection siguen ausentes.
- [x] 4.3 Revisar `git diff --name-only` y confirmar que no se tocó producto, cPanel, material privado, dumps ni logs.
