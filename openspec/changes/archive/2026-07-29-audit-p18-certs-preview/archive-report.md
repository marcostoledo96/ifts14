# Archive Report: audit-p18-certs-preview

**Fecha de cierre**: 2026-07-29
**Change archivado**: `audit-p18-certs-preview`
**Archived to**: `openspec/changes/archive/2026-07-29-audit-p18-certs-preview/`
**Veredicto sdd-verify**: PASS WITH WARNINGS (CRITICAL: none; WARNING: main Regenerar→`/pdf` drift — cerrado en este archive)
**Merge**: PR #103 → `staging1.0` (`dc3ac99`)
**Mode**: hybrid (OpenSpec filesystem + Engram)
**Branch de trabajo archive**: `audit/p19-certs-pdf` (desde `staging1.0` @ `dc3ac99`)

## Resumen

Ciclo de auditoría P18 sobre `CertificationPreviewPage` (`/admin/certificaciones/:id`): honesty load hard con Reintentar gated (`errorRecuperable` load-only); `mensajeErrorApi` P15-strict en QR/regen (sin raw `Error.message`); Regenerar=API (`regenerarPdf`, no navegar a `/pdf`); Descargar PDF→`/pdf`; post-regen omite `publicValidationUrl` canónica completa; soft config/entrega intactos; DNI completo / anti-token; sin HTTP/backend/token rotation/P19–P21. Spec canónica `admin-certifications-frontend` actualizada (1 MODIFIED). Sin commit/push en este archive.

## Task Completion Gate

- `tasks.md`: **17/17** `[x]` (fases 1.1–4.4 + verify)
- CRITICAL en verify: **None** — archive permitido (PASS WITH WARNINGS)
- Review receipt Engram: no hallado; archive avanza por instrucción del orquestador + PR #103 MERGED (`dc3ac99`) + verify PASS WITH WARNINGS

## Engram Observation IDs (traceability)

| Artifact | Observation ID | Topic key |
|----------|----------------|-----------|
| proposal | #7502 | `sdd/audit-p18-certs-preview/proposal` |
| spec | #7503 | `sdd/audit-p18-certs-preview/spec` |
| design | #7504 | `sdd/audit-p18-certs-preview/design` |
| tasks | #7505 | `sdd/audit-p18-certs-preview/tasks` |
| verify-report | #7507 | `sdd/audit-p18-certs-preview/verify-report` |
| review/transaction | — | no hallado |
| review/ledger | — | no hallado |
| review/receipt | — | no hallado |
| review/gate-context | — | no hallado |
| archive-report | #7509 | `sdd/audit-p18-certs-preview/archive-report` |

## Specs Synced

| Domain | Action | Details |
|--------|--------|---------|
| admin-certifications-frontend | Updated | 0 added, **1 modified**, 0 removed, 0 renamed |

### MODIFIED → `openspec/specs/admin-certifications-frontend/spec.md`

1. **Previsualización segura y handoff explícito** — Conserva expediente seguro, Descargar PDF→`/pdf`, revocar, Copiar/QR, soft config/entrega, anti-token, DNI completo. Cambia: Regenerar=API (`regenerarPdf`, NO navegar a `/pdf`); honesty load hard + Reintentar gated; QR/regen vía `mensajeErrorApi` P15-strict; post-regen sin URL canónica completa; id inválido/not-found sin Reintentar; firmas reales si hay imagen.

Escenarios (8): Expediente; Acciones PDF/regen/revocar/copy/QR; Post-regen sin URL canónica completa; Fallo hard recuperable con Reintentar; Id inválido o not-found sin Reintentar; Fallo QR o regeneración sin raw; Soft config y entrega no bloqueantes; Frontera de datos administrativa.

Preservados sin tocar: rutas protegidas, listado admin, harness QA, paridad/folio, documentación F4-02, emisión directa (P17), emisión desde hub de fecha.

**Destructive delta?** No (sin REMOVED; replace de un requisito).

## Docs updated (rules.archive)

- `docs/03-changelog.md` — viñeta P18 expediente preview
- `docs/qa/PLAN-AUDITORIA-EXHAUSTIVA-STAGING-1.0.md` — P18 → hecha #103 (`dc3ac99`); sección fase apunta al archive; checklist/prompt cerrados
- `docs/frontend/03-modulos-admin.md` — fila `/admin/certificaciones/:id` (honesty + Regenerar=API + omit URL)

## Archive Contents

- explore.md ✅
- proposal.md ✅
- design.md ✅
- tasks.md ✅ (17/17)
- specs/admin-certifications-frontend/spec.md ✅
- verify-report.md ✅
- archive-report.md ✅ (this file)

## Verify notes carried forward (non-blocking)

1. WARNING verify: Main Regenerar+Descargar→`/pdf` — **merged** en este archive (Regenerar=API).
2. SUGGESTION verify: Tracker PLAN / checklist — cerrados en este archive (`hecha` #103 / `dc3ac99`).

## Source of Truth Updated

- `openspec/specs/admin-certifications-frontend/spec.md`

## SDD Cycle Complete

Planned → implemented → verified (PASS WITH WARNINGS) → PR #103 merged (`dc3ac99`) → archived.
**No commit / no push** por instrucción explícita del archive (working tree en `audit/p19-certs-pdf` listo para parent). Ignorado: `apps/frontend-angular/.tmp/`.

## Next recommended

`none` — change closed. Siguiente ciclo de auditoría: P19 (`audit/p19-certs-pdf` / `/sdd-new` según orquestador).
