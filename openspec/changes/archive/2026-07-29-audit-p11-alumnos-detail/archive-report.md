# Archive Report: audit-p11-alumnos-detail

**Fecha de cierre**: 2026-07-29
**Change archivado**: `audit-p11-alumnos-detail`
**Archived to**: `openspec/changes/archive/2026-07-29-audit-p11-alumnos-detail/`
**Veredicto sdd-verify**: PASS WITH WARNINGS (CRITICAL: none)
**Merge**: PR #96 → `staging1.0` (`11f0675`)
**Mode**: hybrid (OpenSpec filesystem + Engram)

## Resumen

Ciclo de auditoría P11 sobre el detalle `/admin/alumnos/:id`: copy sin «legajo» (kicker Ficha); métricas `cursosConAsistencia` / `certificacionesValidas` / `certificacionesRevocadas` con `0` vs «—»; `errorRecuperable` + Reintentar solo en fallo de `obtener`; id inválido/no encontrado solo Volver (+ `loadGeneration`); DNI completo en UI. HTTP/listado/editor/backend fuera de alcance. Spec canónica `admin-students-frontend` actualizada (1 MODIFIED). Sin commit/push en este archive.

## Task Completion Gate

- `tasks.md`: **16/16** `[x]` — PASS (sin unchecked)
- CRITICAL en verify: **None** — archive permitido (PASS WITH WARNINGS)
- Review receipt Engram: no hallado; archive avanza por instrucción del orquestador + PR #96 MERGED (`11f0675`) + verify PASS WITH WARNINGS

## Engram Observation IDs (traceability)

| Artifact | Observation ID | Topic key |
|----------|----------------|-----------|
| proposal | #7441 | `sdd/audit-p11-alumnos-detail/proposal` |
| spec | #7442 | `sdd/audit-p11-alumnos-detail/spec` |
| design | #7443 | `sdd/audit-p11-alumnos-detail/design` |
| tasks | #7444 | `sdd/audit-p11-alumnos-detail/tasks` |
| verify-report | #7446 | `sdd/audit-p11-alumnos-detail/verify-report` |
| review/transaction | — | no hallado |
| review/ledger | — | no hallado |
| review/receipt | — | no hallado |
| review/gate-context | — | no hallado |
| archive-report | #7447 | `sdd/audit-p11-alumnos-detail/archive-report` |

## Specs Synced

| Domain | Action | Details |
|--------|--------|---------|
| admin-students-frontend | Updated | **0 added**, **1 modified**, 0 removed, 0 renamed |

### MODIFIED → `openspec/specs/admin-students-frontend/spec.md`

1. **Detalle administrativo consistente** — copy sin legajo; métricas null→«—» / 0→0; Reintentar solo recuperable; id inválido/no encontrado solo Volver; 5 escenarios (ficha, cursos, métricas, recuperable, id inválido).

Propósito del spec: mención de copy en detalle, métricas y Reintentar.

Preservados sin tocar: **Fuente administrativa con DNI completo**, **Búsqueda y filtros**, **Alta con email opcional**, **Estados, detalle y QA**, requisitos P9 de listado, requisitos P10 de editor.

**Destructive delta?** No (sin REMOVED).

## Docs updated (rules.archive)

- `docs/03-changelog.md` — viñeta P11 detalle alumnos
- `docs/qa/PLAN-AUDITORIA-EXHAUSTIVA-STAGING-1.0.md` — P11 → hecha #96; sección fase apunta al archive
- `docs/frontend/03-modulos-admin.md` — fila `/admin/alumnos` con detalle Ficha / métricas / Reintentar

## Archive Contents

- explore.md ✅
- proposal.md ✅
- design.md ✅
- tasks.md ✅ (16/16 complete)
- specs/admin-students-frontend/spec.md ✅
- verify-report.md ✅
- archive-report.md ✅ (this file)

## Verify notes carried forward (non-blocking)

1. WARNING: design proponía ternarios en template; post-4R unificó `formatoMetrica` + `tieneRevocadas` (cumple spec; design levemente desactualizado).
2. WARNING: PR #96 también traía archive P10 / specs main (alcance documental más amplio que el change folder solo).
3. SUGGESTION verify: alinear design con `formatoMetrica` / `loadGeneration` — no bloquea; documentado aquí.

## Source of Truth Updated

- `openspec/specs/admin-students-frontend/spec.md`

## SDD Cycle Complete

Planned → implemented → verified (PASS WITH WARNINGS) → PR #96 merged (`11f0675`) → archived.
**No commit / no push** por instrucción explícita del archive (working tree listo para parent / rama `audit/p12-asist-hub`).

## Next recommended

`none` — change closed. Siguiente ciclo de auditoría: P12 (`audit-p12-asist-hub` / `/sdd-new` según orquestador).
