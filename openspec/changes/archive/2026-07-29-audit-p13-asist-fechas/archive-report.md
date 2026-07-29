# Archive Report: audit-p13-asist-fechas

**Fecha de cierre**: 2026-07-29
**Change archivado**: `audit-p13-asist-fechas`
**Archived to**: `openspec/changes/archive/2026-07-29-audit-p13-asist-fechas/`
**Veredicto sdd-verify**: PASS WITH WARNINGS (CRITICAL: none)
**Merge**: PR #98 → `staging1.0` (`dca5690`)
**Mode**: hybrid (OpenSpec filesystem + Engram)

## Resumen

Ciclo de auditoría P13 sobre la intermedia `/admin/asistencias/curso/:id`: `errorRecuperable` (true solo en catch de `listarHub`); títulos distintos not-found vs carga; Reintentar solo recuperable; Volver siempre; tests honesty + regresión; sin HTTP/hub/marcado. Spec canónica `admin-attendances-frontend` actualizada (1 MODIFIED). Sin commit/push en este archive.

## Task Completion Gate

- `tasks.md`: **15/15** `[x]` — PASS (sin unchecked)
- CRITICAL en verify: **None** — archive permitido (PASS WITH WARNINGS)
- Review receipt Engram: no hallado; archive avanza por instrucción del orquestador + PR #98 MERGED (`dca5690`) + verify PASS WITH WARNINGS

## Engram Observation IDs (traceability)

| Artifact | Observation ID | Topic key |
|----------|----------------|-----------|
| proposal | #7457 | `sdd/audit-p13-asist-fechas/proposal` |
| spec | #7458 | `sdd/audit-p13-asist-fechas/spec` |
| design | #7459 | `sdd/audit-p13-asist-fechas/design` |
| tasks | #7460 | `sdd/audit-p13-asist-fechas/tasks` |
| verify-report | #7462 | `sdd/audit-p13-asist-fechas/verify-report` |
| review/transaction | — | no hallado |
| review/ledger | — | no hallado |
| review/receipt | — | no hallado |
| review/gate-context | — | no hallado |
| archive-report | #7463 | `sdd/audit-p13-asist-fechas/archive-report` |

## Specs Synced

| Domain | Action | Details |
|--------|--------|---------|
| admin-attendances-frontend | Updated | 0 added, **1 modified**, 0 removed, 0 renamed |

### MODIFIED → `openspec/specs/admin-attendances-frontend/spec.md`

1. **Página intermedia de fechas del curso** — honesty: id inválido/curso ausente → not-found sin Reintentar; fallo recuperable `listarHub` → título de carga + Reintentar + Volver; sin DNI/token; escenarios «Curso inexistente o id inválido sin Reintentar» y «Fallo recuperable con Reintentar» (reemplazan «Curso inexistente»). Preservados: fechas asistibles, CTA marcado, empty, orden de ruta.

Preservados sin tocar: resto de requisitos (rutas, listado global, agregación lineal P12, marcado, certificados, frontera segura, etc.).

**Destructive delta?** No (sin REMOVED).

## Docs updated (rules.archive)

- `docs/03-changelog.md` — viñeta P13 intermedia de fechas
- `docs/qa/PLAN-AUDITORIA-EXHAUSTIVA-STAGING-1.0.md` — P13 → hecha #98 (`dca5690`); sección fase apunta al archive
- `docs/frontend/03-modulos-admin.md` — fila `/admin/asistencias/curso/:id` con honesty; marcado separado

## Archive Contents

- explore.md ✅
- proposal.md ✅
- design.md ✅
- tasks.md ✅ (15/15 complete)
- specs/admin-attendances-frontend/spec.md ✅
- verify-report.md ✅
- archive-report.md ✅ (this file)

## Verify notes carried forward (non-blocking)

1. WARNING verify: escenario «Orden de ruta» PARTIAL — tests en `app.routes.spec.ts` no re-ejecutados en suite focalizada P13; ruta no modificada; riesgo residual bajo.

## Source of Truth Updated

- `openspec/specs/admin-attendances-frontend/spec.md`

## SDD Cycle Complete

Planned → implemented → verified (PASS WITH WARNINGS) → PR #98 merged (`dca5690`) → archived.
**No commit / no push** por instrucción explícita del archive (working tree listo para parent / rama `audit/p14-asist-marcado`).

## Next recommended

`none` — change closed. Siguiente ciclo de auditoría: P14 (`audit/p14-asist-marcado` / `/sdd-new` según orquestador).
