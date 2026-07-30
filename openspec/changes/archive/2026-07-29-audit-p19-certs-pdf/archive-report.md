# Archive Report: audit-p19-certs-pdf

**Fecha de cierre**: 2026-07-29
**Change archivado**: `audit-p19-certs-pdf`
**Archived to**: `openspec/changes/archive/2026-07-29-audit-p19-certs-pdf/`
**Veredicto sdd-verify**: PASS WITH WARNINGS (CRITICAL: none; 4 escenarios PARTIAL no bloqueantes)
**Merge**: PR #104 → `staging1.0` (`4938024`)
**Mode**: hybrid (OpenSpec filesystem + Engram)
**Branch de trabajo archive**: `audit/p20-certs-entrega` (desde `staging1.0` @ `4938024`)

## Resumen

Ciclo de auditoría P19 sobre `CertificationPdfPreviewPage` (`/admin/certificaciones/:id/pdf`): honesty load hard con Reintentar gated (`errorRecuperable` load-only); descarga vía `mensajeErrorApi` P15-strict (fallback *«No se pudo generar el PDF.»*); Descargar=html2canvas+jsPDF del folio visible (**NO** `CertificationsService.descargarPdf` / blob API); filename prefer `detalle.numero`; print A4 1 pág + firmas 3:2; QR canónico sin rotar; pie sin disclaimers; DNI completo / anti-token; sin HTTP/backend/token rotation/P20–P21. Spec canónica `admin-certifications-frontend` actualizada (1 MODIFIED). Sin commit/push en este archive.

## Task Completion Gate

- `tasks.md`: **21/21** `[x]` (fases 1.1–4.4 + verify)
- CRITICAL en verify: **None** — archive permitido (PASS WITH WARNINGS)
- Review receipt Engram: no hallado; archive avanza por instrucción del orquestador + PR #104 MERGED (`4938024`) + verify PASS WITH WARNINGS

## Engram Observation IDs (traceability)

| Artifact | Observation ID | Topic key |
|----------|----------------|-----------|
| proposal | #7511 | `sdd/audit-p19-certs-pdf/proposal` |
| spec | #7512 | `sdd/audit-p19-certs-pdf/spec` |
| design | #7513 | `sdd/audit-p19-certs-pdf/design` |
| tasks | #7514 | `sdd/audit-p19-certs-pdf/tasks` |
| verify-report | #7516 | `sdd/audit-p19-certs-pdf/verify-report` |
| review/transaction | — | no hallado |
| review/ledger | — | no hallado |
| review/receipt | — | no hallado |
| review/gate-context | — | no hallado |
| archive-report | #7518 | `sdd/audit-p19-certs-pdf/archive-report` |

## Specs Synced

| Domain | Action | Details |
|--------|--------|---------|
| admin-certifications-frontend | Updated | 0 added, **1 modified**, 0 removed, 0 renamed |

### MODIFIED → `openspec/specs/admin-certifications-frontend/spec.md`

1. **Paridad visual, folio imprimible y evidencia de verificación** — Conserva paridad v0, fechas ISO, estados no vigentes, print A4, QR canónico, checker, evidencia verify. Cambia: **Descargar PDF** = captura folio (html2canvas+jsPDF), **NO** seam API P-13; filename prefer `detalle.numero`; honesty load hard + Reintentar gated; not-found/id inválido sin Reintentar; fallo descarga sin Reintentar/raw; pie sin disclaimers; escenarios renombrados/ampliados (13).

Escenarios (13): Paridad visual; Fechas asistidas; Estados no vigentes; Impresión nativa A4 una página; Descargar PDF por captura del folio visible; Filename semántico; QR canónico sin rotación; Pie sin disclaimers; Fallo hard recuperable con Reintentar; Id inválido o not-found sin Reintentar; Fallo de descarga sin Reintentar ni raw; Checker por estado; Evidencia de checks en verify.

Preservados sin tocar: rutas protegidas, listado admin, harness QA, previsualización/expediente (P18), documentación F4-02, emisión directa (P17), emisión desde hub de fecha.

**Destructive delta?** No (sin REMOVED; replace de un requisito). Nota: se eliminó el escenario canónico previo «Descargar PDF con seam API (P-13)» al reemplazar el requisito completo — alineado al delta MODIFIED y a `REQ-PAR-PDF-001` en código.

## Docs updated (rules.archive)

- `docs/03-changelog.md` — viñeta P19 folio PDF
- `docs/qa/PLAN-AUDITORIA-EXHAUSTIVA-STAGING-1.0.md` — P19 → hecha #104 (`4938024`); sección fase apunta al archive; checklist/prompt cerrados
- `docs/frontend/03-modulos-admin.md` — fila `/admin/certificaciones/:id/pdf` (honesty + html2canvas + filename)

## Archive Contents

- explore.md ✅
- proposal.md ✅
- design.md ✅
- tasks.md ✅ (21/21)
- specs/admin-certifications-frontend/spec.md ✅
- verify-report.md ✅
- archive-report.md ✅ (this file)

## Verify notes carried forward (non-blocking)

1. WARNING: 4 escenarios PARTIAL — paridad visual vs v0 (sin screenshots), `borrador`/`vencido` no en `estadoPresentacion` (solo `revocado`), pie sin unit dedicada, checker live staging ids `1,3,4,5` no corrido.
2. WARNING verify: main spec “premature merge” en apply — al archive el canónico aún tenía P-13; **merged aquí** (html2canvas + honesty).
3. SUGGESTION: assert footer sin `certificateText`; opcional smoke visual desktop/print.

## Source of Truth Updated

- `openspec/specs/admin-certifications-frontend/spec.md`

## SDD Cycle Complete

Planned → implemented → verified (PASS WITH WARNINGS) → PR #104 merged (`4938024`) → archived.
**No commit / no push** por instrucción explícita del archive (working tree en `audit/p20-certs-entrega` listo para parent). Ignorado: `apps/frontend-angular/.tmp/`.

## Next recommended

`none` — change closed. Siguiente ciclo de auditoría: P20 (`audit/p20-certs-entrega` / `/sdd-new` según orquestador).
