# Archive Report: audit-p22-validacion

**Fecha de cierre**: 2026-07-29
**Change archivado**: `audit-p22-validacion`
**Archived to**: `openspec/changes/archive/2026-07-29-audit-p22-validacion/`
**Veredicto sdd-verify**: PASS (CRITICAL: none)
**Merge**: PR #107 → `staging1.0` (`922ae59`)
**Mode**: hybrid (OpenSpec filesystem + Engram)
**Branch de trabajo archive**: `audit/p23-not-found` (desde `staging1.0` post-merge P22)

## Resumen

Ciclo de auditoría P22 sobre validación pública (`/validar/:token`): fechas de folio `issuedAt` / `attendedDates` en `dd/mm/yyyy` es-AR vía `formatearFechaFolio` en `PublicValidationPage`; contrato staging revocado→404 `CERTIFICATE_NOT_FOUND` documentado como aceptado (REVOCADO solo con código explícito); Reintentar en no-encontrada y técnico; honesty sin raw `Error.message`/stack/`/api`/token; D0 DNI completo en válida. Spec canónica `frontend-public-validation` actualizada (4 ADDED). Sin PHP unlock / `RATE_LIMITED` / P21 / mapper. Sin commit/push en este archive.

## Task Completion Gate

- `tasks.md`: **13/13** `[x]` (fases 1.1–3.4 + V.1)
- CRITICAL en verify: **None** — archive permitido (PASS)
- Review receipt Engram: no hallado; archive avanza por instrucción del orquestador + PR #107 MERGED (`922ae59`) + verify PASS (8/8 escenarios; 18/18 tests)

## Engram Observation IDs (traceability)

| Artifact | Observation ID | Topic key |
|----------|----------------|-----------|
| proposal | #7538 | `sdd/audit-p22-validacion/proposal` |
| spec | #7539 | `sdd/audit-p22-validacion/spec` |
| design | #7540 | `sdd/audit-p22-validacion/design` |
| tasks | #7541 | `sdd/audit-p22-validacion/tasks` |
| verify-report | #7543 | `sdd/audit-p22-validacion/verify-report` |
| review/transaction | — | no hallado |
| review/ledger | — | no hallado |
| review/receipt | — | no hallado |
| review/gate-context | — | no hallado |
| archive-report | #7546 | `sdd/audit-p22-validacion/archive-report` |

## Specs Synced

| Domain | Action | Details |
|--------|--------|---------|
| frontend-public-validation | Updated | **4 added**, 0 modified, 0 removed, 0 renamed |

### ADDED → `openspec/specs/frontend-public-validation/spec.md`

1. **Formato de fechas del folio (es-AR)** — `issuedAt` / `attendedDates` → `dd/mm/yyyy`; sin ISO crudo visible. Escenarios: 2.
2. **Staging revocado ≡ no-encontrada (contrato aceptado)** — 404 unificado OK; REVOCADO solo con `CERTIFICATE_REVOKED`; sin PHP unlock; `RATE_LIMITED` diferido. Escenarios: 2.
3. **Reintentar en no-encontrada y técnico** — recarga verificación del token de ruta; sin patrón admin `errorRecuperable`. Escenarios: 2.
4. **Honesty técnica sin filtración** — copy fijo; sin raw/stack/`/api`/token; D0 DNI completo en válida. Escenarios: 2.

Preservados sin tocar: requisitos previos del canónico (ruta, D0, folio sidebar, membrete, cuerpo editorial, sin QR). Capacidad PHP / mapper no tocada.

**Destructive delta?** No (sin REMOVED / MODIFIED).

## Docs updated (rules.archive)

- `docs/03-changelog.md` — viñeta P22 validación pública
- `docs/qa/PLAN-AUDITORIA-EXHAUSTIVA-STAGING-1.0.md` — P22 → hecha #107 (`922ae59`); sección fase apunta al archive; checklist/prompt cerrados (responsive U9 queda abierto)
- `docs/frontend/03-modulos-admin.md` — fila `/validar/:token`

## Archive Contents

- explore.md ✅
- proposal.md ✅
- design.md ✅
- tasks.md ✅ (13/13)
- specs/frontend-public-validation/spec.md ✅
- verify-report.md ✅
- archive-report.md ✅ (this file)

## Source of Truth Updated

- `openspec/specs/frontend-public-validation/spec.md`

## SDD Cycle Complete

Planned → implemented → verified (PASS) → PR #107 merged (`922ae59`) → archived.

Ready for next change: P23 404 / rutas huérfanas (`audit/p23-not-found`).
