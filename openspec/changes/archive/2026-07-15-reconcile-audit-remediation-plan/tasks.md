# Tareas: Reconciliar el plan de remediación de auditoría

## Review Workload Forecast

| Campo | Valor |
|---|---|
| Líneas modificadas estimadas | 120–220 |
| Presupuesto de revisión del cambio | 2000 líneas |
| 400-line budget risk | Low |
| Chained PRs recommended | No |
| Suggested split | Un único PR documental |
| Delivery strategy | single-pr-default |
| Chain strategy | pending |
| Size exception required | No |

Decision needed before apply: No
Chained PRs recommended: No
Chain strategy: pending
400-line budget risk: Low

### Suggested Work Units

| Unidad | Objetivo | PR | Comando focal | Runtime harness | Rollback boundary |
|---|---|---|---|---|---|
| 1 | Reconciliar el plan, validar enlaces y dejar trazabilidad cerrada | PR único | `git diff --check` + validador determinista Python/grep | N/A: cambio documental, sin runtime de producto | Revertir solo los ocho paths: `docs/planificacion/IFTS14_PLAN_CORRECCIONES_PREPRODUCCION_SDD_TDD.md`, `openspec/changes/archive/2026-07-15-reconcile-audit-remediation-plan/exploration.md`, `openspec/changes/archive/2026-07-15-reconcile-audit-remediation-plan/proposal.md`, `openspec/changes/archive/2026-07-15-reconcile-audit-remediation-plan/design.md`, `openspec/changes/archive/2026-07-15-reconcile-audit-remediation-plan/specs/audit-remediation-planning/spec.md`, `openspec/changes/archive/2026-07-15-reconcile-audit-remediation-plan/tasks.md`, `openspec/changes/archive/2026-07-15-reconcile-audit-remediation-plan/verify-report.md` y `openspec/specs/audit-remediation-planning/spec.md`; conservar archives |

## Fase 1: Preparación y alcance

- [x] 1.1 Confirmar el alcance limitado a los ocho paths: `docs/planificacion/IFTS14_PLAN_CORRECCIONES_PREPRODUCCION_SDD_TDD.md`, `openspec/changes/archive/2026-07-15-reconcile-audit-remediation-plan/exploration.md`, `openspec/changes/archive/2026-07-15-reconcile-audit-remediation-plan/proposal.md`, `openspec/changes/archive/2026-07-15-reconcile-audit-remediation-plan/design.md`, `openspec/changes/archive/2026-07-15-reconcile-audit-remediation-plan/specs/audit-remediation-planning/spec.md`, `openspec/changes/archive/2026-07-15-reconcile-audit-remediation-plan/tasks.md`, `openspec/changes/archive/2026-07-15-reconcile-audit-remediation-plan/verify-report.md` y `openspec/specs/audit-remediation-planning/spec.md`; no editar producto, CI, infraestructura, deploy, DB ni specs funcionales activos de negocio.
- [x] 1.2 Aplicar la matriz de evidencia: P0/P0-01 `PARTIAL`, P3/P4 `DONE`, P5-01 `DONE WITH WARNINGS`, P1/P2/P5/P6/P7/P8 `PARTIAL` y P9 `PENDING` no bloqueante.

## Fase 2: Actualización documental quirúrgica

- [x] 2.1 Actualizar frontmatter y secciones 4.1/4.2 con estado global `PARTIAL`, precedencia de fuentes y estados derivados; conservar historia separada del tablero.
- [x] 2.2 Actualizar registro/checklists (4.3, 7, 10, 11, 13), incorporar PR #63/#65 y commits, y declarar P5-02 como próximo ciclo independiente sin marcarlo `DONE`.
- [x] 2.3 Añadir en cada cierre la doble trazabilidad: PR o commit mergeado + archive/verify aplicable con veredicto exacto; etiquetar evidencia `[local]`, `[CI]`, `[staging]` o `[documental]`.
- [x] 2.4 Limpiar claims stale sin reescribir auditorías: mantener producción `/certificados/` como no validada, distinguir staging, conservar P9 no bloqueante y documentar warnings vigentes.
- [x] 2.5 Revisar índice/configuración solo si el diff demuestra una referencia necesaria y directamente afectada; no cambiar `openspec/config.yaml` por iniciativa propia.

## Fase 3: Verificación determinista

- [x] 3.1 Ejecutar `git diff --check` y validar que solo se modifiquen los ocho paths mencionados; confirmar ausencia de cambios en producto/CI/infra/DB.
- [x] 3.2 Ejecutar el chequeo de enlaces del diseño y un script Python/grep que falle ante estado inválido, falta de entorno, trazabilidad incompleta, `DONE` con brecha o P5-02/P9 incorrectos.
- [x] 3.3 Validar existencia de commits `1a6a1cf`/`27b34c6`, PR #63/#65 y paths de archives; registrar resultados, links no resolubles y límites de evidencia.

TDD: no aplica; la prueba será comportamiento-like documental mediante assertions deterministas. Threat Matrix: N/A según diseño.
