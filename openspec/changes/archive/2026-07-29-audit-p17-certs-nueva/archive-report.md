# Archive Report: audit-p17-certs-nueva

**Fecha de cierre**: 2026-07-29
**Change archivado**: `audit-p17-certs-nueva`
**Archived to**: `openspec/changes/archive/2026-07-29-audit-p17-certs-nueva/`
**Veredicto sdd-verify**: PASS (CRITICAL: none; WARNING: none)
**Merge**: PR #102 → `staging1.0` (`c371e2a`)
**Mode**: hybrid (OpenSpec filesystem + Engram)
**Branch de trabajo archive**: `audit/p18-certs-preview` (desde `staging1.0` @ `c371e2a`)

## Resumen

Ciclo de auditoría P17 sobre `CertificationNewPage` (`/admin/certificaciones/nueva`): honesty P15-like con flags `errorCatalogosRecuperable` + `errorParRecuperable` y Reintentar solo en loads; emit else vía `mensajeErrorApi` P15-strict (sin Reintentar de load ni raw `Error.message`); copy de rol edge vs Asistencias sin «complementario»; ruta/CTAs/body/navigate intactos; DNI completo / anti-token; sin HTTP/backend/token/P14–P16/P18–P21. Spec canónica `admin-certifications-frontend` actualizada (1 MODIFIED). Sin commit/push en este archive.

## Task Completion Gate

- `tasks.md`: **17/17** `[x]` (fases 1.1–4.4 + verify)
- CRITICAL en verify: **None** — archive permitido (PASS)
- Review receipt Engram: no hallado; archive avanza por instrucción del orquestador + PR #102 MERGED (`c371e2a`) + verify PASS

## Engram Observation IDs (traceability)

| Artifact | Observation ID | Topic key |
|----------|----------------|-----------|
| proposal | #7493 | `sdd/audit-p17-certs-nueva/proposal` |
| spec | #7494 | `sdd/audit-p17-certs-nueva/spec` |
| design | #7495 | `sdd/audit-p17-certs-nueva/design` |
| tasks | #7496 | `sdd/audit-p17-certs-nueva/tasks` |
| verify-report | #7499 | `sdd/audit-p17-certs-nueva/verify-report` |
| review/transaction | — | no hallado |
| review/ledger | — | no hallado |
| review/receipt | — | no hallado |
| review/gate-context | — | no hallado |
| archive-report | #7500 | `sdd/audit-p17-certs-nueva/archive-report` |

## Specs Synced

| Domain | Action | Details |
|--------|--------|---------|
| admin-certifications-frontend | Updated | 0 added, **1 modified**, 0 removed, 0 renamed |

### MODIFIED → `openspec/specs/admin-certifications-frontend/spec.md`

1. **Emisión directa de certificación (pantalla nueva)** — Conserva ruta estática antes de `:id`, body `{ alumnoId, cursoId, issuedAt, expiresAt }`, navigate post-201, anti-folio. Agrega: no deprecar ruta/CTAs; copy rol edge vs Asistencias (sin «complementario»); honesty loads con `errorRecuperable`+Reintentar; emit else `mensajeErrorApi` sin Reintentar/raw; DNI completo + anti-token; sin HTTP/backend ni rotación token/QR.

Escenarios (7): Ruta estática precede a :id; Emitir con éxito; Copy de rol edge vs Asistencias; Fallo recuperable de catálogos con Reintentar; Fallo recuperable de par con Reintentar; Emit else sin Reintentar ni raw Error.message; DNI completo y anti-token.

Preservados sin tocar: rutas protegidas, listado admin, harness QA, previsualización, paridad/folio, documentación F4-02, emisión desde hub de fecha.

**Destructive delta?** No (sin REMOVED; replace de un requisito).

## Docs updated (rules.archive)

- `docs/03-changelog.md` — viñeta P17 nueva certificación
- `docs/qa/PLAN-AUDITORIA-EXHAUSTIVA-STAGING-1.0.md` — P17 → hecha #102 (`c371e2a`); sección fase apunta al archive; checklist cerrada
- `docs/frontend/03-modulos-admin.md` — fila `/admin/certificaciones/nueva` (honesty + copy rol + HTTP intacto)

## Archive Contents

- explore.md ✅
- proposal.md ✅
- design.md ✅
- tasks.md ✅ (17/17)
- specs/admin-certifications-frontend/spec.md ✅
- verify-report.md ✅
- archive-report.md ✅ (this file)

## Verify notes carried forward (non-blocking)

1. SUGGESTION verify: Tracker PLAN / checklist humana — cerrados en este archive.
2. SUGGESTION verify: Main Emisión pre-honesty — merged en este archive.

## Source of Truth Updated

- `openspec/specs/admin-certifications-frontend/spec.md`

## SDD Cycle Complete

Planned → implemented → verified (PASS) → PR #102 merged (`c371e2a`) → archived.
**No commit / no push** por instrucción explícita del archive (working tree en `audit/p18-certs-preview` listo para parent).

## Next recommended

`none` — change closed. Siguiente ciclo de auditoría: P18 (`audit/p18-certs-preview` / `/sdd-new` según orquestador).
