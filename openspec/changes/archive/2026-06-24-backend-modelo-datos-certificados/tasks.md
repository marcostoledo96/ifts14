# Tareas: modelo de datos para certificados QR

## Review Workload Forecast

| Field | Value |
|---|---|
| Estimated changed lines | 500-800 |
| 400-line budget risk | High |
| Chained PRs recommended | Yes |
| Suggested split | PR 1: spec/docs DB → PR 2: migración/seed → PR 3: archive |
| Delivery strategy | force-chained |
| Chain strategy | stacked-to-main |

Decision needed before apply: No
Chained PRs recommended: Yes
Chain strategy: stacked-to-main
400-line budget risk: High

### Suggested Work Units

| Unit | Goal | Likely PR | Notes |
|---|---|---|---|
| 1 | Contrato documental del modelo | PR 1 | base `main` |
| 2 | SQL controlado y seed ficticio | PR 2 | base PR 1 |
| 3 | Verificación y archive SDD | PR 3 | base PR 2 |

## Phase 1: Planificación OpenSpec

- [x] 1.1 Crear propuesta para `backend-modelo-datos-certificados`.
- [x] 1.2 Crear spec de modelo de datos y escenarios de seguridad.
- [x] 1.3 Crear diseño técnico con tablas, token hash y auditoría.

## Phase 2: Documentación y SQL

- [x] 2.1 Crear `docs/database/01-modelo-datos-certificados.md`.
- [x] 2.2 Actualizar `docs/database/00-mariadb.md`, `docs/backend/01-contrato-api-certificados.md` y `docs/00-indice-general.md`.
- [x] 2.3 Crear `database/migrations/001_certificados_qr.sql` con tablas `cert_`, claves e índices.
- [x] 2.4 Crear `database/seeds/001_certificados_qr_demo.sql` con datos ficticios.

## Phase 3: Verificación

- [x] 3.1 Verificar que SQL versionable esté solo en `database/migrations/` y `database/seeds/`.
- [x] 3.2 Verificar que no se creó PHP, Angular ni dependencias.
- [x] 3.3 Verificar ausencia de tokens públicos completos, DNI reales y material privado copiado.

## Phase 4: Archivo

- [x] 4.1 Promover spec a `openspec/specs/backend-modelo-datos-certificados/spec.md`.
- [x] 4.2 Archivar el cambio en `openspec/changes/archive/2026-06-24-backend-modelo-datos-certificados/`.
