# Archive Report: audit-p14-asist-marcado

**Fecha de cierre**: 2026-07-29
**Change archivado**: `audit-p14-asist-marcado`
**Archived to**: `openspec/changes/archive/2026-07-29-audit-p14-asist-marcado/`
**Veredicto sdd-verify**: PASS WITH WARNINGS (CRITICAL: none)
**Merge**: PR #99 → `staging1.0` (`7e6ff10`)
**Mode**: hybrid (OpenSpec filesystem + Engram)
**Clasificación**: intentional-with-warnings

## Resumen

Ciclo de auditoría P14 sobre `AttendanceMarkingPage` (`/admin/cursos/:id/fechas/:fechaId/asistencias`): `errorRecuperable` + Reintentar solo en catch de carga; `mensajeErrorApi` en catch de `marcar`; bucle serial emit/regen intacto; tests fecha futura, orden serial y tokenPrefix; sin HTTP `marcar`/backend/P15/rotación token. Spec canónica `admin-attendances-frontend` actualizada (2 MODIFIED). Sin commit/push en este archive.

## Task Completion Gate

- `tasks.md`: **16/17** `[x]`; tarea **4.4** permanece `[ ]` (smoke staging multi-PDF/multi-presentes sin 401)
- CRITICAL en verify: **None** — archive permitido (PASS WITH WARNINGS)
- **Reconciliación**: no se marca 4.4 como completa; archive **intentional-with-warnings** por instrucción explícita del orquestador («smoke staging 4.4 pending — non-blocking») + verify PASS WITH WARNINGS + PR #99 MERGED (`7e6ff10`)
- Review receipt Engram: no hallado; archive avanza por instrucción del orquestador + PR #99 MERGED + verify PASS WITH WARNINGS

## Engram Observation IDs (traceability)

| Artifact | Observation ID | Topic key |
|----------|----------------|-----------|
| proposal | #7465 | `sdd/audit-p14-asist-marcado/proposal` |
| design | #7466 | `sdd/audit-p14-asist-marcado/design` |
| spec | #7467 | `sdd/audit-p14-asist-marcado/spec` |
| tasks | #7468 | `sdd/audit-p14-asist-marcado/tasks` |
| verify-report | #7471 | `sdd/audit-p14-asist-marcado/verify-report` |
| review/transaction | — | no hallado |
| review/ledger | — | no hallado |
| review/receipt | — | no hallado |
| review/gate-context | — | no hallado |
| archive-report | #7472 | `sdd/audit-p14-asist-marcado/archive-report` |

## Specs Synced

| Domain | Action | Details |
|--------|--------|---------|
| admin-attendances-frontend | Updated | 0 added, **2 modified**, 0 removed, 0 renamed |

### MODIFIED → `openspec/specs/admin-attendances-frontend/spec.md`

1. **Hub de fecha — asistencias** — Reintentar solo fallo recuperable de carga; id/fecha inválidos o not-found sin Reintentar; `mensajeErrorApi` en catch de `marcar` (incl. 400); sin DNI/token; sin exigir cambios a `HttpAttendanceService.marcar` ni backend. Escenarios nuevos: Fallo recuperable…, Id o fecha inválidos…, Envelope 400… (preservados: marcado, CTA certificados, búsqueda).

2. **Guardar y generar certificados** — emit/regen **en serie** (no `Promise.all`); fecha futura/programada → persistir sin emitir, `fallidos` + copy; sin presentes deshabilitado o 400; `regenerado:false` as-is; invariante token/QR permanente (documentado). Escenarios nuevos: Emisión y regeneración en serie; Fecha futura o programada; Token permanente al regenerar (preservados: emisión/redirección, sin presentes).

Preservados sin tocar: rutas, listado global, agregación lineal P12, intermedia P13, página certificados por fecha, carga vigente, paridad mock, frontera segura.

**Destructive delta?** No (sin REMOVED).

## Docs updated (rules.archive)

- `docs/03-changelog.md` — viñeta P14 marcado + emisión
- `docs/qa/PLAN-AUDITORIA-EXHAUSTIVA-STAGING-1.0.md` — P14 → hecha #99 (`7e6ff10`); sección fase apunta al archive; WARNING smoke 4.4
- `docs/frontend/03-modulos-admin.md` — fila marcado con Reintentar/serial/token

## Archive Contents

- explore.md ✅
- proposal.md ✅
- design.md ✅
- tasks.md ✅ (16/17; 4.4 pendiente documentado)
- specs/admin-attendances-frontend/spec.md ✅
- verify-report.md ✅
- archive-report.md ✅ (this file)

## Verify notes carried forward (non-blocking)

1. WARNING verify: tarea 4.4 — smoke staging multi-PDF/multi-presentes sin 401 session lock no ejecutado; mitigado por bucle serial + tests unitarios de no-solapamiento.
2. SUGGESTION verify: assert explícito de búsqueda por `dniMostrar` (trazabilidad; no bloquea).

## Source of Truth Updated

- `openspec/specs/admin-attendances-frontend/spec.md`

## SDD Cycle Complete

Planned → implemented → verified (PASS WITH WARNINGS) → PR #99 merged (`7e6ff10`) → archived (intentional-with-warnings).
**No commit / no push** por instrucción explícita del archive (working tree listo para parent / rama `audit/p15-asist-certs`).

## Next recommended

`none` — change closed. Siguiente ciclo de auditoría: P15 (`audit/p15-asist-certs` / `/sdd-new` según orquestador).
