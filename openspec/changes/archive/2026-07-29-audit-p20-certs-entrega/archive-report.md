# Archive Report: audit-p20-certs-entrega

**Fecha de cierre**: 2026-07-29
**Change archivado**: `audit-p20-certs-entrega`
**Archived to**: `openspec/changes/archive/2026-07-29-audit-p20-certs-entrega/`
**Veredicto sdd-verify**: PASS (CRITICAL: none)
**Merge**: PR #105 → `staging1.0` (`1cdb9f8`)
**Mode**: hybrid (OpenSpec filesystem + Engram)
**Branch de trabajo archive**: `audit/p21-certs-revocar` (desde `staging1.0` @ `1cdb9f8`)

## Resumen

Ciclo de auditoría P20 sobre `CertificationDeliveryPage` (`/admin/certificaciones/:id/entrega`): carga `Promise.allSettled` (detalle hard / entrega soft); 409/`TOKEN_NOT_RECOVERABLE` soft operable con copy bedelía; `errorRecuperable` + Reintentar solo en load hard recuperable; not-found sin Reintentar; `mensajeErrorApi` P15-strict en QR/PDF/regen; `regenerarPdf` wired + re-fetch (D0: sin rotar token; omitir `publicValidationUrl` completa post-regen); PDF via folio `?descargar=1` + seam `navigate=false`; sin HTTP/backend/P19 rewrite/P21. Spec canónica `admin-certificate-delivery-frontend` actualizada (2 ADDED, 2 MODIFIED). Sin commit/push en este archive.

## Task Completion Gate

- `tasks.md`: **25/25** `[x]` (fases 1.1–5.4 + verify)
- CRITICAL en verify: **None** — archive permitido (PASS)
- Review receipt Engram: no hallado; archive avanza por instrucción del orquestador + PR #105 MERGED (`1cdb9f8`) + verify PASS

## Engram Observation IDs (traceability)

| Artifact | Observation ID | Topic key |
|----------|----------------|-----------|
| proposal | #7520 | `sdd/audit-p20-certs-entrega/proposal` |
| spec | #7521 | `sdd/audit-p20-certs-entrega/spec` |
| design | #7522 | `sdd/audit-p20-certs-entrega/design` |
| tasks | #7523 | `sdd/audit-p20-certs-entrega/tasks` |
| verify-report | #7525 | `sdd/audit-p20-certs-entrega/verify-report` |
| review/transaction | — | no hallado |
| review/ledger | — | no hallado |
| review/receipt | — | no hallado |
| review/gate-context | — | no hallado |
| archive-report | #7527 | `sdd/audit-p20-certs-entrega/archive-report` |

## Specs Synced

| Domain | Action | Details |
|--------|--------|---------|
| admin-certificate-delivery-frontend | Updated | **2 added**, **2 modified**, 0 removed, 0 renamed |

### ADDED → `openspec/specs/admin-certificate-delivery-frontend/spec.md`

1. **REQ-DEL-009: Carga allSettled con honesty load-only** — `Promise.allSettled`; detalle hard + Reintentar gated; not-found sin Reintentar; 409 soft operable (ficha + bedelía; Copiar/QR off). Escenarios: 3.
2. **REQ-DEL-010: Honesty P15-strict en QR, PDF y regeneración** — `mensajeErrorApi`/genérico; sin raw; sin `errorRecuperable` en acciones; D0 anti-token/URL + DNI completo. Escenarios: 3.

### MODIFIED → `openspec/specs/admin-certificate-delivery-frontend/spec.md`

1. **REQ-DEL-005: Botón "Volver a generar"** — Stub MVP reemplazado: MUST `regenerarPdf(id)` + re-fetch; MUST NOT rotar token/QR ni filtrar URL completa; errores `mensajeErrorApi`. Escenarios: Regenerar vía API; Alert y CTA outdated.
2. **REQ-DEL-008: Descargar PDF vía folio institucional** — Reemplaza Blob P-13: MUST navegar folio `?descargar=1`; MUST NOT `CertificationsService.descargarPdf`; seam `navigate=false`; footer Copiar+PDF+Cancelar; QR fuera. Escenarios: PDF folio; navigate=false; Footer y QR layout.

Preservados sin tocar: REQ-DEL-001…004, REQ-DEL-006, REQ-DEL-007.

**Destructive delta?** No (sin REMOVED). Nota: MODIFIED de REQ-DEL-008 elimina el contrato Blob/`descargarPdf(id)` P-13 del canónico — alineado al delta y a la paridad P19 folio.

## Docs updated (rules.archive)

- `docs/03-changelog.md` — viñeta P20 entrega manual
- `docs/qa/PLAN-AUDITORIA-EXHAUSTIVA-STAGING-1.0.md` — P20 → hecha #105 (`1cdb9f8`); sección fase apunta al archive; checklist/prompt cerrados
- `docs/frontend/03-modulos-admin.md` — fila `/admin/certificaciones/:id/entrega` (allSettled + 409 + regen + folio)

## Archive Contents

- explore.md ✅
- proposal.md ✅
- design.md ✅
- tasks.md ✅ (25/25)
- specs/admin-certificate-delivery-frontend/spec.md ✅
- verify-report.md ✅
- archive-report.md ✅ (this file)

## Source of Truth Updated

- `openspec/specs/admin-certificate-delivery-frontend/spec.md`

## SDD Cycle Complete

Planned → implemented → verified (PASS) → PR #105 merged (`1cdb9f8`) → archived.

Ready for next change: P21 revocación (`audit/p21-certs-revocar`).
