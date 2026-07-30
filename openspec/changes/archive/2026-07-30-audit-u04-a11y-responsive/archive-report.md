# Archive Report: audit-u04-a11y-responsive

**Fecha de cierre**: 2026-07-30
**Change archivado**: `audit-u04-a11y-responsive`
**Archived to**: `openspec/changes/archive/2026-07-30-audit-u04-a11y-responsive/`
**Veredicto sdd-verify**: PASS (CRITICAL: none)
**Merge**: PR #112 → `staging1.0` (`7b7d3db`)
**Mode**: hybrid (OpenSpec filesystem + Engram)
**Branch de trabajo archive**: `audit/u05-estados-error`

## Resumen

Ciclo de auditoría U4 sobre a11y/responsive quirúrgico FE: helper compartido `trapTabKey`; drawer admin con trap + `aria-modal`; diálogos entrega/revocar sin Tab al backdrop; error-dialog con trap; CTAs públicos con `:focus-visible`; spot listados/tabla pública sin rediseño. Specs canónicas actualizadas: `frontend-angular-shell` (SHELL-A11Y-01..04), `frontend-public-validation` (PUB-A11Y-01..02), `admin-certificate-delivery-frontend` (REQ-DEL-007 MODIFIED — foco soft + trap). Contraste/`.sr-only` DEFER (U9); U5 fuera; sin API/rediseño; D0. Sin rotación token/QR. Sin commit/push en este archive.

## Task Completion Gate

- `tasks.md`: **20/20** Phase 1–5 `[x]` + **V.1** `[x]`
- CRITICAL en verify: **None** — archive permitido (PASS; 7/7 req, 13/13 escenarios; focused ng test 70 SUCCESS; tsc 0)
- Review receipt Engram: no hallado; archive avanza por **instrucción explícita del orquestador** (override Native Review Receipt Gate, mismo patrón U1–U3) + evidencia: verify PASS + PR #112 MERGED (`7b7d3db`)

## Engram Observation IDs (traceability)

| Artifact | Observation ID | Topic key |
|----------|----------------|-----------|
| proposal | #7582 | `sdd/audit-u04-a11y-responsive/proposal` |
| spec | #7584 | `sdd/audit-u04-a11y-responsive/spec` |
| design | #7583 | `sdd/audit-u04-a11y-responsive/design` |
| tasks | #7585 | `sdd/audit-u04-a11y-responsive/tasks` |
| verify-report | #7587 | `sdd/audit-u04-a11y-responsive/verify-report` |
| review/transaction | — | no hallado (override orquestador) |
| review/ledger | — | no hallado (override orquestador) |
| review/receipt | — | no hallado (override orquestador) |
| review/gate-context | — | no hallado (override orquestador) |
| archive-report | #7589 | `sdd/audit-u04-a11y-responsive/archive-report` |

## Specs Synced

| Domain | Action | Details |
|--------|--------|---------|
| frontend-angular-shell | Updated | **4 added**, 0 modified, 0 removed, 0 renamed |
| frontend-public-validation | Updated | **2 added**, 0 modified, 0 removed, 0 renamed |
| admin-certificate-delivery-frontend | Updated | 0 added, **1 modified** (REQ-DEL-007), 0 removed, 0 renamed |

### ADDED → `openspec/specs/frontend-angular-shell/spec.md`

1. **SHELL-A11Y-01 — Foco visible preservado** — `:focus-visible` usable; contraste/`.sr-only` DEFER. Escenarios: 1.
2. **SHELL-A11Y-02 — Drawer mobile con trap y aria-modal** — Tab trap overlay+aside; Esc/`inert`. Escenarios: 2.
3. **SHELL-A11Y-03 — Patrón de trap en diálogos admin** — entrega/revoke/error-dialog; retorno soft. Escenarios: 3.
4. **SHELL-A11Y-04 — Listados críticos sin rotura mobile** — spot angosto; sin unificar breakpoints. Escenarios: 1.

Preservados sin tocar: SHELL-HYG-01..05; SHELL-COPY-01; rutas/404; OnPush; etc.

### ADDED → `openspec/specs/frontend-public-validation/spec.md`

1. **PUB-A11Y-01 — CTAs con foco visible** — Reintentar/Volver `:focus-visible`. Escenarios: 1.
2. **PUB-A11Y-02 — Tabla de fechas usable en angosto** — overflow-x o apilado; sin rediseñar folio. Escenarios: 1.

Preservados sin tocar: ruta pública, D0, folio, estados no válidos, honesty técnica, etc.

### MODIFIED → `openspec/specs/admin-certificate-delivery-frontend/spec.md`

1. **REQ-DEL-007 — Foco y escape en diálogos** — trap Tab dialog+backdrop; error-dialog; Escape operable; retorno soft vía SPA (reemplaza retorno duro al opener). Escenarios: 4.

Preservados sin tocar: REQ-DEL-001..006, 008..010.

**Destructive delta?** No REMOVED. MODIFIED acota el contrato de foco (soft > hard) sin borrar el requisito.

## Docs updated (rules.archive)

- `docs/qa/PLAN-AUDITORIA-EXHAUSTIVA-STAGING-1.0.md` — U4 → hecha #112 (`7b7d3db`); sección fase apunta al archive; checklist/prompt cerrados
- `docs/03-changelog.md` — ya tenía viñeta U4; sin cambio adicional

## Archive Contents

- explore.md ✅
- proposal.md ✅
- design.md ✅
- tasks.md ✅ (20/20 + V.1)
- specs/frontend-angular-shell/spec.md ✅
- specs/frontend-public-validation/spec.md ✅
- specs/admin-certificate-delivery-frontend/spec.md ✅
- verify-report.md ✅
- archive-report.md ✅ (this file)

## Source of Truth Updated

- `openspec/specs/frontend-angular-shell/spec.md`
- `openspec/specs/frontend-public-validation/spec.md`
- `openspec/specs/admin-certificate-delivery-frontend/spec.md`

## SDD Cycle Complete

Planned → implemented → verified (PASS) → PR #112 merged (`7b7d3db`) → archived.

Ready for next change: Bloque C U5 estados error/vacío (`audit/u05-estados-error`) o U9 smokes según prioridad.
