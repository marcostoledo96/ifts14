# Archive Report: audit-u06-backend

**Fecha de cierre**: 2026-07-30
**Change archivado**: `audit-u06-backend`
**Archived to**: `openspec/changes/archive/2026-07-30-audit-u06-backend/`
**Veredicto sdd-verify**: PASS (CRITICAL: none; 2/2 requirements, 5/5 scenarios COMPLIANT)
**Merge**: PR #114 → `staging1.0` (`613b305`)
**Mode**: hybrid (OpenSpec filesystem + Engram)
**Branch de trabajo archive**: `audit/u07-seguridad`

## Resumen

Ciclo de auditoría U6 sobre backend contrato + sesión admin: `AdminSessionAuth::state()` renueva `lastSeen` + `session_write_close` (paridad `authorize`); TTL docs/spec alineados a **14400** idle / **28800** absolute (no 30 min); D-004 storage rate-limit de login → `503 SERVICE_UNAVAILABLE` ≠ `429 RATE_LIMITED` (sin fail-open, sin PII). Spec canónica actualizada: `admin-auth` (1 MODIFIED vigencia/TTL+lastSeen; 1 ADDED fallo storage rate-limit). Envelope/400/409 DEFER; cookies/política absoluta → U7; sin rotación token/QR/keys. Sin commit/push en este archive.

## Task Completion Gate

- `tasks.md`: **14/14** Phase 1–4 `[x]` + **V.1** `[x]` (15 ítems checklist)
- CRITICAL en verify: **None** — archive permitido (PASS 5/5; focused PHP `AdminSessionAuthTest` + `AdminAuthHttpTest` OK; `php -l` clean)
- Review receipt Engram: no hallado; archive avanza por **instrucción explícita del orquestador** (override Native Review Receipt Gate, mismo patrón U1–U5) + evidencia: verify PASS (sin CRITICAL) + PR #114 MERGED (`613b305`)

## Engram Observation IDs (traceability)

| Artifact | Observation ID | Topic key |
|----------|----------------|-----------|
| proposal | #7600 | `sdd/audit-u06-backend/proposal` |
| spec | #7601 | `sdd/audit-u06-backend/spec` |
| design | #7602 | `sdd/audit-u06-backend/design` |
| tasks | #7603 | `sdd/audit-u06-backend/tasks` |
| verify-report | #7605 | `sdd/audit-u06-backend/verify-report` |
| review/transaction | — | no hallado (override orquestador) |
| review/ledger | — | no hallado (override orquestador) |
| review/receipt | — | no hallado (override orquestador) |
| review/gate-context | — | no hallado (override orquestador) |
| archive-report | #7607 | `sdd/audit-u06-backend/archive-report` |

## Specs Synced

| Domain | Action | Details |
|--------|--------|---------|
| admin-auth | Updated | **1 added**, **1 modified**, 0 removed, 0 renamed |

### MODIFIED → `openspec/specs/admin-auth/spec.md`

1. **Protección y vigencia de sesión** — idle exacto **14400** s / absolute exacto **28800** s; `GET /admin/auth/session` y GETs autorizados renuevan `lastSeen` + liberan write lock; cookies/política absoluta no rediseñadas (U7). Escenarios: Idle y absoluto exactos; Poll de session renueva idle; GET autorizado renueva idle; Configuración temporal inválida.

### ADDED → `openspec/specs/admin-auth/spec.md`

1. **Fallo de almacenamiento en rate-limit de login** — storage fail → `503` ≠ `429 RATE_LIMITED`; no fail-open; sin PII. Escenario: Storage rate-limit no escribible.

Preservados sin tocar: Autorización sesión/CLI; Ciclo de sesión nativa; CSRF mutaciones; Retiro legacy.

**Destructive delta?** No. Solo MODIFIED (reemplazo del bloque de vigencia) + ADDED. Sin REMOVED/RENAMED. Metadata `(Previously: …)` del delta no se promovió al SoT.

## Docs updated (rules.archive)

- `docs/qa/PLAN-AUDITORIA-EXHAUSTIVA-STAGING-1.0.md` — U6 → hecha #114 (`613b305`); sección fase CERRADA; prompt apunta al archive; Siguiente U7
- `docs/backend/00-php84-api.md` — TTL ya alineado en apply (sin retouch en archive)
- `docs/03-changelog.md` — sin cambio adicional en este archive

## Archive Contents

- explore.md ✅
- proposal.md ✅
- design.md ✅
- tasks.md ✅ (14/14 Phase 1–4 + V.1)
- specs/admin-auth/spec.md ✅
- verify-report.md ✅
- archive-report.md ✅ (this file)

## Source of Truth Updated

- `openspec/specs/admin-auth/spec.md`

## Intentional Override — Native Review Receipt Gate

Orquestador instruyó proceder pese a receipts Engram ausentes (patrón U1–U5). Evidencia aceptada: verify PASS (CRITICAL: none) + PR #114 MERGED → `staging1.0` (`613b305`). Override registrado.

## SDD Cycle Complete

Planned → implemented → verified (PASS) → PR #114 merged (`613b305`) → archived.

Ready for next change: Bloque C U7 seguridad (`audit/u07-seguridad`) o U9 smokes según prioridad.
