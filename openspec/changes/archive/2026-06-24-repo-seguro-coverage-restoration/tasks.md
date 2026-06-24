# Tasks: restaurar cobertura de escenarios de repo-seguro

## Review Workload Forecast

| Field | Value |
|-------|-------|
| Estimated changed lines | < 160 |
| 400-line budget risk | Low |
| Chained PRs recommended | Yes |
| Suggested split | PR 1: spec-only restoration |
| Delivery strategy | auto-chain |
| Chain strategy | stacked-to-main |

Decision needed before apply: No
Chained PRs recommended: Yes
Chain strategy: stacked-to-main
400-line budget risk: Low

### Suggested Work Units

| Unit | Goal | Likely PR | Notes |
|------|------|-----------|-------|
| 1 | Restaurar cobertura de escenarios OpenSpec | PR 1 | Base `main`; sin producto. |

## Phase 1: SDD artifacts

- [x] 1.1 Crear `proposal.md`, `design.md`, `tasks.md` y delta spec para `repo-seguro`.

## Phase 2: Apply

- [x] 2.1 Actualizar `openspec/specs/repo-seguro/spec.md` preservando escenarios audit-focused y restaurando los cuatro escenarios faltantes.
- [x] 2.2 Crear `apply-progress.md` con evidencia del cambio aplicado.

## Phase 3: Verify and archive

- [x] 3.1 Crear `verify-report.md` verificando frases restauradas y ausencia de archivos de producto nuevos.
- [x] 3.2 Archivar el cambio en `openspec/changes/archive/2026-06-24-repo-seguro-coverage-restoration/`.
