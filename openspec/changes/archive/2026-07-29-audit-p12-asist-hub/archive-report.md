# Archive Report: audit-p12-asist-hub

**Fecha de cierre**: 2026-07-29
**Change archivado**: `audit-p12-asist-hub`
**Archived to**: `openspec/changes/archive/2026-07-29-audit-p12-asist-hub/`
**Veredicto sdd-verify**: PASS (CRITICAL: none)
**Merge**: PR #97 → `staging1.0` (`dae9026`)
**Mode**: hybrid (OpenSpec filesystem + Engram)

## Resumen

Ciclo de auditoría P12 sobre el hub `/admin/asistencias`: agregación lineal de métricas N/M en `AttendancesListPage.cargar` (índices Set/Map; sin `hub.fechas.some` anidado; `cancelada` excluida; sin `alumnosActivos` como total); HTTP one-pass en `HttpAttendanceService.listarHub`; mock intacto; sin P13/P14/backend. Specs canónicas `admin-attendances-frontend` (1 ADDED) y `frontend-http-services` (1 ADDED, condicional HTTP resuelto como aplicado) actualizadas. Sin commit/push en este archive.

## Task Completion Gate

- `tasks.md`: **13/13** `[x]` — PASS (sin unchecked; HTTP 3.1–3.2 aplicados, no N/A)
- CRITICAL en verify: **None** — archive permitido (PASS)
- Review receipt Engram: no hallado; archive avanza por instrucción del orquestador + PR #97 MERGED (`dae9026`) + verify PASS

## Engram Observation IDs (traceability)

| Artifact | Observation ID | Topic key |
|----------|----------------|-----------|
| proposal | #7449 | `sdd/audit-p12-asist-hub/proposal` |
| spec | #7450 | `sdd/audit-p12-asist-hub/spec` |
| design | #7451 | `sdd/audit-p12-asist-hub/design` |
| tasks | #7452 | `sdd/audit-p12-asist-hub/tasks` |
| verify-report | #7454 | `sdd/audit-p12-asist-hub/verify-report` |
| review/transaction | — | no hallado |
| review/ledger | — | no hallado |
| review/receipt | — | no hallado |
| review/gate-context | — | no hallado |
| archive-report | #7455 | `sdd/audit-p12-asist-hub/archive-report` |

## Specs Synced

| Domain | Action | Details |
|--------|--------|---------|
| admin-attendances-frontend | Updated | **1 added**, 0 modified, 0 removed, 0 renamed |
| frontend-http-services | Updated | **1 added**, 0 modified, 0 removed, 0 renamed |

### ADDED → `openspec/specs/admin-attendances-frontend/spec.md`

1. **Agregación lineal de métricas del hub** — tiempo lineal; cancelada excluida; sin `alumnosActivos` como total; 3 escenarios. Insertado tras «Listado global solo por curso».

### ADDED → `openspec/specs/frontend-http-services/spec.md`

1. **listarHub HTTP** — `GET /admin/hub/asistencias`; mapeo DTO al contrato; one-pass permitido. Condicional del delta resuelto: apply sí editó HTTP; escenario «HTTP omitido — N/A» no fusionado. Insertado tras el bloque `HttpAttendanceService`.

Preservados sin tocar: resto de requisitos de ambas specs (incl. listado global, intermedia, marcado, mocks, DI, etc.).

**Destructive delta?** No (sin REMOVED).

## Docs updated (rules.archive)

- `docs/03-changelog.md` — viñeta P12 hub asistencias
- `docs/qa/PLAN-AUDITORIA-EXHAUSTIVA-STAGING-1.0.md` — P12 → hecha #97 (`dae9026`); sección fase apunta al archive
- `docs/frontend/03-modulos-admin.md` — fila `/admin/asistencias` con hub métricas lineales; resto de rutas asistencias

## Archive Contents

- explore.md ✅
- proposal.md ✅
- design.md ✅
- tasks.md ✅ (13/13 complete)
- specs/admin-attendances-frontend/spec.md ✅
- specs/frontend-http-services/spec.md ✅
- verify-report.md ✅
- archive-report.md ✅ (this file)

## Verify notes carried forward (non-blocking)

1. SUGGESTION verify: escenario «Agregación en tiempo lineal» verificado por ausencia de barridos anidados + tests semánticos (sin microbenchmark big-O) — aceptable por design.

## Source of Truth Updated

- `openspec/specs/admin-attendances-frontend/spec.md`
- `openspec/specs/frontend-http-services/spec.md`

## SDD Cycle Complete

Planned → implemented → verified (PASS) → PR #97 merged (`dae9026`) → archived.
**No commit / no push** por instrucción explícita del archive (working tree listo para parent / rama `audit/p13-asist-fechas`).

## Next recommended

`none` — change closed. Siguiente ciclo de auditoría: P13 (`audit/p13-asist-fechas` / `/sdd-new` según orquestador).
