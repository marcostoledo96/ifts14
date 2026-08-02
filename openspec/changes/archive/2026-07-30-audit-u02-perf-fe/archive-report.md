# Archive Report: audit-u02-perf-fe

**Fecha de cierre**: 2026-07-30
**Change archivado**: `audit-u02-perf-fe`
**Archived to**: `openspec/changes/archive/2026-07-30-audit-u02-perf-fe/`
**Veredicto sdd-verify**: PASS (CRITICAL: none)
**Merge**: PR #110 → `staging1.0` (`125f6f8`)
**Mode**: hybrid (OpenSpec filesystem + Engram)
**Branch de trabajo archive**: `audit/u03-copy`

## Resumen

Ciclo de auditoría U2 sobre performance FE quirúrgica: coalesce in-flight `listarHub` (`hubPending` HTTP+mock, invalidate en marcar/anular); cache de sesión `previewFirma`/`obtener` con invalidate; carga diferida de `html2canvas-pro`/`jspdf` solo al **Descargar PDF**; nota de escala de listados (cientos OK; miles → U6). Specs canónicas actualizadas: `frontend-http-services` (HTTP-PERF-01/02) + `admin-certifications-frontend` (CERT-PERF-01). Sin rediseño API/UX; DEFER slim hub, paginación servidor, `Cache-Control` firmas PHP, dashboard, qrcode worker, CI bundle. Sin commit/push en este archive.

## Task Completion Gate

- `tasks.md`: **15/15** Phase 1–4 `[x]` + **V.1** `[x]`
- CRITICAL en verify: **None** — archive permitido (PASS; 3/3 req, 9/9 escenarios; focused ng test 105 SUCCESS; tsc 0)
- Review receipt Engram: no hallado; archive avanza por **instrucción explícita del orquestador** (override Native Review Receipt Gate, mismo patrón U1) + PR #110 MERGED (`125f6f8`) + verify PASS

## Engram Observation IDs (traceability)

| Artifact | Observation ID | Topic key |
|----------|----------------|-----------|
| proposal | #7563 | `sdd/audit-u02-perf-fe/proposal` |
| spec | #7564 | `sdd/audit-u02-perf-fe/spec` |
| design | #7565 | `sdd/audit-u02-perf-fe/design` |
| tasks | #7566 | `sdd/audit-u02-perf-fe/tasks` |
| verify-report | #7568 | `sdd/audit-u02-perf-fe/verify-report` |
| review/transaction | — | no hallado (override orquestador) |
| review/ledger | — | no hallado (override orquestador) |
| review/receipt | — | no hallado (override orquestador) |
| review/gate-context | — | no hallado (override orquestador) |
| archive-report | #7571 | `sdd/audit-u02-perf-fe/archive-report` |

## Specs Synced

| Domain | Action | Details |
|--------|--------|---------|
| frontend-http-services | Updated | **2 added**, 0 modified, 0 removed, 0 renamed |
| admin-certifications-frontend | Updated | **1 added**, 0 modified, 0 removed, 0 renamed |

### ADDED → `openspec/specs/frontend-http-services/spec.md`

1. **HTTP-PERF-01 — Coalesce in-flight de listarHub** — ≤1 GET in-flight; invalidate tras marcar/anular; semántica HTTP intacta. Escenarios: 3.
2. **HTTP-PERF-02 — Cache de sesión para previewFirma y obtener** — reuso sesión; invalidate tras mutar/guardar; logout SHOULD si seam fácil. Escenarios: 3.

Preservados sin tocar: HttpCourses/Students/Attendance/Certifications/InstitutionalConfig existentes; listarHub HTTP; firmas HTTP; HttpTestingController; DI `useRealApi`; correcciones condicionales P9/P10; etc.

### ADDED → `openspec/specs/admin-certifications-frontend/spec.md`

1. **CERT-PERF-01 — Carga diferida de html2canvas-pro y jspdf** — no cargar al abrir PDF; `import()` solo en Descargar PDF; filename/D0/print/error sin regresión. Escenarios: 3.

Preservados sin tocar: rutas, listado, harness, expediente, paridad/folio, emisión, hub fecha, diálogo revocar (honesty/submit/copy).

**Destructive delta?** No (sin REMOVED / MODIFIED).

## Docs updated (rules.archive)

- `docs/qa/PLAN-AUDITORIA-EXHAUSTIVA-STAGING-1.0.md` — U2 → hecha #110 (`125f6f8`); sección fase apunta al archive; checklist/prompt cerrados
- `docs/03-changelog.md` — ya tenía viñeta U2; sin cambio adicional

## Archive Contents

- explore.md ✅
- proposal.md ✅
- design.md ✅
- tasks.md ✅ (15/15 + V.1)
- specs/frontend-http-services/spec.md ✅
- specs/admin-certifications-frontend/spec.md ✅
- verify-report.md ✅
- archive-report.md ✅ (this file)

## Source of Truth Updated

- `openspec/specs/frontend-http-services/spec.md`
- `openspec/specs/admin-certifications-frontend/spec.md`

## SDD Cycle Complete

Planned → implemented → verified (PASS) → PR #110 merged (`125f6f8`) → archived.

Ready for next change: Bloque C U3 copy (`audit/u03-copy`) o U9 smokes según prioridad.
