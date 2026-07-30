# Archive Report: audit-u01-prolijidad-fe

**Fecha de cierre**: 2026-07-29
**Change archivado**: `audit-u01-prolijidad-fe`
**Archived to**: `openspec/changes/archive/2026-07-29-audit-u01-prolijidad-fe/`
**Veredicto sdd-verify**: PASS (CRITICAL: none)
**Merge**: PR #109 → `staging1.0` (`511ce7b`)
**Mode**: hybrid (OpenSpec filesystem + Engram)
**Branch de trabajo archive**: `audit/u02-perf-fe`

## Resumen

Ciclo de auditoría U1 sobre prolijidad FE: delete `LandingPage` + `FolioShell` (huérfanos); remove alias muerto `guardar()` en marcado (canónico `guardarYGenerar`); extract puro `paginasVisiblesWindow` wired a 4 listados; OnPush preservado 30/30. Spec canónica `frontend-angular-shell` actualizada (5 ADDED SHELL-HYG-01..05, 10 escenarios). Sin UX redesign; DEFER formatters/clipboard/`mensajeErrorApi`/ponytails. Sin commit/push en este archive.

## Task Completion Gate

- `tasks.md`: **17/17** Phase 1–4 `[x]` + **V.1** `[x]`
- CRITICAL en verify: **None** — archive permitido (PASS; 5/5 req, 10/10 escenarios)
- Review receipt Engram: no hallado; archive avanza por instrucción del orquestador + PR #109 MERGED (`511ce7b`) + verify PASS (focused ng test 231 SUCCESS + 18 public-validation)

## Engram Observation IDs (traceability)

| Artifact | Observation ID | Topic key |
|----------|----------------|-----------|
| proposal | #7555 | `sdd/audit-u01-prolijidad-fe/proposal` |
| spec | #7556 | `sdd/audit-u01-prolijidad-fe/spec` |
| design | #7557 | `sdd/audit-u01-prolijidad-fe/design` |
| tasks | #7558 | `sdd/audit-u01-prolijidad-fe/tasks` |
| verify-report | #7560 | `sdd/audit-u01-prolijidad-fe/verify-report` |
| review/transaction | — | no hallado |
| review/ledger | — | no hallado |
| review/receipt | — | no hallado |
| review/gate-context | — | no hallado |
| archive-report | #7561 | `sdd/audit-u01-prolijidad-fe/archive-report` |

## Specs Synced

| Domain | Action | Details |
|--------|--------|---------|
| frontend-angular-shell | Updated | **5 added**, 0 modified, 0 removed, 0 renamed |

### ADDED → `openspec/specs/frontend-angular-shell/spec.md`

1. **SHELL-HYG-01 — Sin scaffolds de página huérfanos** — sin `LandingPage` sin ruta; `''` → `/admin/login`. Escenarios: 2.
2. **SHELL-HYG-02 — Sin UI compartida sin consumidores** — shared huérfanos (p. ej. `FolioShell`) eliminados; folio público sin shell. Escenarios: 2.
3. **SHELL-HYG-03 — Sin alias muertos de acciones primarias** — marcado usa solo `guardarYGenerar`. Escenarios: 2.
4. **SHELL-HYG-04 — OnPush en todos los @Component de app** — baseline post-U1 30/30. Escenarios: 2.
5. **SHELL-HYG-05 — Helper opcional de ventana de paginación** — `paginasVisiblesWindow` en 4 listados (incluido este ciclo). Escenarios: 2.

Preservados sin tocar: Shell Angular bajo `/certificados/`; Estructura mínima; Límites de seguridad; Wildcard NotFound; CTA admin; Aislamiento huérfanas admin; Honesty NotFound.

**Destructive delta?** No (sin REMOVED / MODIFIED).

## Docs updated (rules.archive)

- `docs/03-changelog.md` — viñeta U1 prolijidad FE
- `docs/qa/PLAN-AUDITORIA-EXHAUSTIVA-STAGING-1.0.md` — U1 → hecha #109 (`511ce7b`); sección fase apunta al archive; checklist/prompt cerrados
- `docs/frontend/02-sistema-visual-v0-f1-02.md` — `FolioShell` marcado eliminado (U1)
- `docs/frontend/00-angular20-port-v0.md` — primitivos vigentes sin `FolioShell`

## Archive Contents

- explore.md ✅
- proposal.md ✅
- design.md ✅
- tasks.md ✅ (17/17 + V.1)
- specs/frontend-angular-shell/spec.md ✅
- verify-report.md ✅
- archive-report.md ✅ (this file)

## Source of Truth Updated

- `openspec/specs/frontend-angular-shell/spec.md`

## SDD Cycle Complete

Planned → implemented → verified (PASS) → PR #109 merged (`511ce7b`) → archived.

Ready for next change: Bloque C U2 performance FE (`audit/u02-perf-fe`) o U9 smokes según prioridad.
