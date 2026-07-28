# Archive Report: audit-p08-cursos-detail

**Fecha de cierre**: 2026-07-28
**Change archivado**: `audit-p08-cursos-detail`
**Archived to**: `openspec/changes/archive/2026-07-28-audit-p08-cursos-detail/`
**Veredicto sdd-verify**: PASS WITH WARNINGS (CRITICAL: none)
**Mode**: hybrid (OpenSpec filesystem + Engram)

## Resumen

Ciclo de auditoría P8 sobre el detalle de curso admin: not-found amigable en página, Reintentar en fallos recuperables, CTA «Ver fechas del curso» → `/admin/asistencias/curso/:id`, labels humanas, fechas es-AR, ocultar cuatrimestre «Sin programar», sin «—» junto a Pendiente. Alcance product solo `course-detail-page.*`. Spec canónica `admin-courses-frontend` actualizada con 2 requirements MODIFIED. Sin commit/push en este archive.

## Task Completion Gate

- `tasks.md`: **12/12** `[x]` — PASS (sin unchecked)
- Proposal success criteria: 5/5 (per verify-report)
- CRITICAL en verify: **None** — archive permitido

## Engram Observation IDs (traceability)

| Artifact | Observation ID | Topic key |
|----------|----------------|-----------|
| proposal | #7416 | `sdd/audit-p08-cursos-detail/proposal` |
| spec | #7417 | `sdd/audit-p08-cursos-detail/spec` |
| design | #7418 | `sdd/audit-p08-cursos-detail/design` |
| tasks | #7419 | `sdd/audit-p08-cursos-detail/tasks` |
| verify-report | #7422 | `sdd/audit-p08-cursos-detail/verify-report` |
| archive-report | (this save) | `sdd/audit-p08-cursos-detail/archive-report` |

## Specs Synced

| Domain | Action | Details |
|--------|--------|---------|
| admin-courses-frontend | Updated | 0 added, **2 modified**, 0 removed, 0 renamed |

### MODIFIED (merged into `openspec/specs/admin-courses-frontend/spec.md`)

1. **Enlace de toma de asistencia por fecha** — conserva «Cargar» / «Ver y entregar»; deep-link al marcado; D0.
2. **Detalle de curso enriquecido y seguro** — not-found en página; Reintentar; CTA hub; labels; es-AR; ocultar «Sin programar»; 8 escenarios (antes 6), incl. Not-found y CTA hub.

Requirements no tocados por el delta se preservaron (rutas protegidas, UI contract-ready, frontera, documentación, paridad listado F4-03).

**Destructive delta?** No (solo MODIFIED; sin REMOVED).

## Docs updated (rules.archive)

- `docs/03-changelog.md` — viñeta P8 detalle de curso
- `docs/frontend/03-modulos-admin.md` — ruta `/admin/cursos/:id` en mapa

## Archive Contents

- explore.md ✅
- proposal.md ✅
- design.md ✅
- tasks.md ✅ (12/12 complete)
- specs/admin-courses-frontend/spec.md ✅
- apply-progress.md ✅
- verify-report.md ✅
- archive-report.md ✅ (this file)

## Verify warnings carried forward (non-blocking)

1. Escenario Privacidad/a11y: viewports 1280/390 sin prueba automatizada (PARTIAL).
2. Design no documentaba 401/403 no-reintentables (Gate 4R); comportamiento testeado.
3. Diff residual `docs/qa/PLAN-AUDITORIA-EXHAUSTIVA-STAGING-1.0.md` fuera del alcance product — queda a decisión de PR humano.
4. `apply-progress.md` puede citar 17/17 tests; verify confirmó **19/19**.

## Source of Truth Updated

- `openspec/specs/admin-courses-frontend/spec.md`

## SDD Cycle Complete

Planned → implemented → verified (PASS WITH WARNINGS) → archived.
**No commit / no push** por instrucción explícita del archive.

## Next recommended

`none` — change closed. Follow-ups opcionales fuera de este ciclo: viewport a11y automatizado; nota 401/403 en design histórico; checklist PLAN §P8 en PR documental si aplica.
