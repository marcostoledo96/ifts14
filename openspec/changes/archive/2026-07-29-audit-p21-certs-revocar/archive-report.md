# Archive Report: audit-p21-certs-revocar

**Fecha de cierre**: 2026-07-29
**Change archivado**: `audit-p21-certs-revocar`
**Archived to**: `openspec/changes/archive/2026-07-29-audit-p21-certs-revocar/`
**Veredicto sdd-verify**: PASS (CRITICAL: none)
**Merge**: PR #106 → `staging1.0` (`992201d`)
**Mode**: hybrid (OpenSpec filesystem + Engram)
**Branch de trabajo archive**: `audit/p22-validacion` (desde `staging1.0` post-merge P21)

## Resumen

Ciclo de auditoría P21 sobre `CertificationRevokePage` (`/admin/certificaciones/:id/revocar`): honesty de carga con mensajes fijos es-AR, `errorRecuperable` + Reintentar solo en fallos hard recuperables, not-found sin Reintentar; split de submit a `errorAccion` inline vía `mensajeErrorApi` P15-strict (fallback *«No se pudo revocar la certificación.»*); `MOTIVO_MAX` 180; confirmación explícita, copy de consecuencias y sanitize de motivo (DNI/token/email → placeholders); flash UI `?revocada=1` diferido (re-fetch de estado basta; P22 valida pública). Spec canónica `admin-certifications-frontend` actualizada (3 ADDED). Sin P20 rewrite / P22 / backend `admin-certificate-revocation`. Sin commit/push en este archive.

## Task Completion Gate

- `tasks.md`: **24/24** `[x]` (fases 1.1–5.4 + verify)
- CRITICAL en verify: **None** — archive permitido (PASS)
- Review receipt Engram: no hallado; archive avanza por instrucción del orquestador + PR #106 MERGED (`992201d`) + verify PASS

## Engram Observation IDs (traceability)

| Artifact | Observation ID | Topic key |
|----------|----------------|-----------|
| proposal | #7529 | `sdd/audit-p21-certs-revocar/proposal` |
| spec | #7530 | `sdd/audit-p21-certs-revocar/spec` |
| design | #7531 | `sdd/audit-p21-certs-revocar/design` |
| tasks | #7532 | `sdd/audit-p21-certs-revocar/tasks` |
| verify-report | #7534 | `sdd/audit-p21-certs-revocar/verify-report` |
| review/transaction | — | no hallado |
| review/ledger | — | no hallado |
| review/receipt | — | no hallado |
| review/gate-context | — | no hallado |
| archive-report | #7536 | `sdd/audit-p21-certs-revocar/archive-report` |

## Specs Synced

| Domain | Action | Details |
|--------|--------|---------|
| admin-certifications-frontend | Updated | **3 added**, 0 modified, 0 removed, 0 renamed |

### ADDED → `openspec/specs/admin-certifications-frontend/spec.md`

1. **Diálogo revocar — honesty de carga** — `obtener(id)`; mensaje fijo recuperable + Reintentar gated; not-found sin Reintentar; sin raw `Error.message`; señales load separadas de submit. Escenarios: 3.
2. **Diálogo revocar — submit P15-strict y MOTIVO_MAX** — `revocar` con motivo sanitizado; error inline `mensajeErrorApi`/fallback; sin overlay/`errorRecuperable` de load; éxito → expediente `?revocada=1` (flash diferido); `MOTIVO_MAX` 180. Escenarios: 3.
3. **Diálogo revocar — confirmación, copy y sanitize** — checkbox + consecuencias; sanitize DNI/token/email; no-vigente bloquea form; Escape al expediente. Escenarios: 3.

Preservados sin tocar: requisitos previos del canónico (rutas, listado, expediente, emisión, etc.). Capacidad API `admin-certificate-revocation` no tocada.

**Destructive delta?** No (sin REMOVED / MODIFIED).

## Docs updated (rules.archive)

- `docs/03-changelog.md` — viñeta P21 revocación
- `docs/qa/PLAN-AUDITORIA-EXHAUSTIVA-STAGING-1.0.md` — P21 → hecha #106 (`992201d`); sección fase apunta al archive; checklist/prompt cerrados (flash diferido queda abierto hacia P22)
- `docs/frontend/03-modulos-admin.md` — fila `/admin/certificaciones/:id/revocar`

## Archive Contents

- explore.md ✅
- proposal.md ✅
- design.md ✅
- tasks.md ✅ (24/24)
- specs/admin-certifications-frontend/spec.md ✅
- verify-report.md ✅
- archive-report.md ✅ (this file)

## Source of Truth Updated

- `openspec/specs/admin-certifications-frontend/spec.md`

## SDD Cycle Complete

Planned → implemented → verified (PASS) → PR #106 merged (`992201d`) → archived.

Ready for next change: P22 validación pública (`audit/p22-validacion`).
