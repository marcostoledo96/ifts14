# Archive report — frontend-asistencias-listado-por-curso

**Fecha**: 2026-07-22
**Veredicto verify**: PASS WITH WARNINGS (autoriza archive)
**Destino**: `openspec/changes/archive/2026-07-22-frontend-asistencias-listado-por-curso/`
**Modo**: hybrid (OpenSpec + Engram)

## Gate de cierre

- Tasks: 13/13 `[x]` (sin pendientes)
- CRITICAL en verify: ninguno
- Warnings no bloqueantes: smoke browser staging diferido; drift apply-progress (reconciliado en archive)

## Specs sincronizadas

| Dominio | Acción | Detalle |
|---|---|---|
| `admin-attendances-frontend` | Updated | +2 ADDED (Listado global solo por curso; Página intermedia de fechas); 1 MODIFIED (Rutas protegidas + escenario Camino hub); propósito actualizado |

## Documentación actualizada en archive

- `docs/frontend/asistencias-listado-por-curso.md` — nota de cierre operativa
- `docs/frontend/00-angular20-port-v0.md` — puntero de cierre 2026-07-22

## Entregado (ciclo)

- FE: listado `/admin/asistencias` = 1 fila/curso; intermedia `/admin/asistencias/curso/:id`; CTA al marcado existente
- Rutas: `asistencias/curso/:id` antes de `asistencias`
- Tests focales: 123 SUCCESS; tsc limpio
- Sin BE / sin tocar HTTP-mock hub / marking

## Observaciones Engram (trazabilidad)

| Fase | topic_key | id |
|---|---|---|
| explore | `sdd/frontend-asistencias-listado-por-curso/explore` | #7150 |
| proposal | `sdd/frontend-asistencias-listado-por-curso/proposal` | #7151 |
| spec | `sdd/frontend-asistencias-listado-por-curso/spec` | #7154 |
| design | `sdd/frontend-asistencias-listado-por-curso/design` | #7155 |
| tasks | `sdd/frontend-asistencias-listado-por-curso/tasks` | #7157 |
| apply | `sdd/frontend-asistencias-listado-por-curso/apply-progress` | #7158 |
| verify | `sdd/frontend-asistencias-listado-por-curso/verify-report` | #7159 |
| archive | `sdd/frontend-asistencias-listado-por-curso/archive-report` | (este save) |

## Contenido del archive

- proposal.md ✅
- exploration.md ✅
- design.md ✅
- specs/ ✅
- tasks.md ✅ (13/13)
- apply-progress.md ✅ (reconciliado 13/13)
- verify.md ✅ (evidencia PASS WITH WARNINGS)
- archive-report.md ✅

## Siguiente

Ciclo SDD cerrado. QA staging post-deploy FE: listado → intermedia → marcado; empty 0 fechas; id inexistente. Commit/PR a cargo de Marcos (sin ejecutar en archive).
