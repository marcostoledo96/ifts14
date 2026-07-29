# Archive Report: audit-p09-alumnos-list

**Fecha de cierre**: 2026-07-28
**Change archivado**: `audit-p09-alumnos-list`
**Archived to**: `openspec/changes/archive/2026-07-28-audit-p09-alumnos-list/`
**Veredicto sdd-verify**: PASS WITH WARNINGS (CRITICAL: none)
**Merge**: PR #94 → `staging1.0` (`f1a9ec9`)
**Mode**: hybrid (OpenSpec filesystem + Engram)

## Resumen

Ciclo de auditoría P9 sobre el listado `/admin/alumnos`: copy sin «legajo»; badges de contacto sin email literal ni chip «Con email»; métricas `0` vs «—»; DNI completo; filtros/paginación/estados/QA conservados. HTTP omitido (Fase 4 N/A: `optionalCount` preserva `0`). Spec canónica `admin-students-frontend` actualizada (3 ADDED + 3 MODIFIED). Política condicional de mapeo HTTP fusionada en `frontend-http-services` con nota de omitido. Sin commit/push en este archive.

## Task Completion Gate

- `tasks.md`: **15/15** `[x]` — PASS (sin unchecked; Fase 4 marcada N/A explícita)
- CRITICAL en verify: **None** — archive permitido
- Review receipt Engram: no hallado; archive avanza por instrucción del orquestador + PR #94 MERGED + verify PASS WITH WARNINGS

## Engram Observation IDs (traceability)

| Artifact | Observation ID | Topic key |
|----------|----------------|-----------|
| proposal | #7425 | `sdd/audit-p09-alumnos-list/proposal` |
| design | #7426 | `sdd/audit-p09-alumnos-list/design` |
| spec | #7427 | `sdd/audit-p09-alumnos-list/spec` |
| tasks | #7428 | `sdd/audit-p09-alumnos-list/tasks` |
| verify-report | #7430 | `sdd/audit-p09-alumnos-list/verify-report` |
| archive-report | #7431 | `sdd/audit-p09-alumnos-list/archive-report` |

## Specs Synced

| Domain | Action | Details |
|--------|--------|---------|
| admin-students-frontend | Updated | **3 added**, **3 modified**, 0 removed, 0 renamed |
| frontend-http-services | Updated | **1 added** (política condicional; HTTP no parcheado en P9) |

### ADDED → `openspec/specs/admin-students-frontend/spec.md`

1. **Copy del listado sin legajo inventado**
2. **Contacto por badge sin email literal**
3. **Métricas numéricas en listado**

### MODIFIED → `openspec/specs/admin-students-frontend/spec.md`

1. **Fuente administrativa con DNI completo** — `STUDENTS_SOURCE` HTTP/mock; sin «Sin red» absoluto.
2. **Búsqueda y filtros** — chips v0 cert + Sin email; sin chip «Con email»; null-safe; 20/página.
3. **Estados, detalle y QA** — Reintentar; QA `isDevMode`; sin email literal.

Preservados sin tocar: **Alta con email opcional**, **Detalle administrativo consistente**.

### ADDED → `openspec/specs/frontend-http-services/spec.md`

1. **Corrección condicional del mapeo de métricas de alumnos** — no tocar HTTP por defecto; parche mínimo solo con evidencia. Nota archive: P9 omitió el parche (mapeo OK).

**Destructive delta?** No (sin REMOVED).

## Docs updated (rules.archive)

- `docs/03-changelog.md` — viñeta P9 listado alumnos
- `docs/qa/PLAN-AUDITORIA-EXHAUSTIVA-STAGING-1.0.md` — P9 → hecha #94; sección fase apunta al archive
- `docs/frontend/03-modulos-admin.md` — fila `/admin/alumnos` con copy/badges/métricas

## Archive Contents

- explore.md ✅
- proposal.md ✅
- design.md ✅
- tasks.md ✅ (15/15 complete)
- specs/admin-students-frontend/spec.md ✅
- specs/frontend-http-services/spec.md ✅
- verify-report.md ✅
- archive-report.md ✅ (this file)

## Verify warnings carried forward (non-blocking)

1. Escenario «Fuente según entorno»: wiring presente; assert ternario no re-ejecutado en verify focused (PARTIAL).
2. Escenario «Alta con DNI duplicado»: preservado; covered por specs sibling no re-run (PARTIAL).
3. Design pedía smoke staging para HTTP; apply usó code review de `optionalCount` (WARNING menor documentado).

## Source of Truth Updated

- `openspec/specs/admin-students-frontend/spec.md`
- `openspec/specs/frontend-http-services/spec.md`

## SDD Cycle Complete

Planned → implemented → verified (PASS WITH WARNINGS) → PR #94 merged → archived.
**No commit / no push** por instrucción explícita del archive (working tree listo para parent / rama P10).

## Next recommended

`none` — change closed. Siguiente ciclo de auditoría: P10 (`audit-p10-alumnos-editor` / `/sdd-new` según orquestador).
