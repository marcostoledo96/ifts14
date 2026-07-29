# Archive Report: audit-p16-certs-list

**Fecha de cierre**: 2026-07-29
**Change archivado**: `audit-p16-certs-list`
**Archived to**: `openspec/changes/archive/2026-07-29-audit-p16-certs-list/`
**Veredicto sdd-verify**: PASS (CRITICAL: none; WARNING: none)
**Merge**: PR #101 → `staging1.0` (`7450a97`)
**Mode**: hybrid (OpenSpec filesystem + Engram)
**Branch de trabajo archive**: `audit/p17-certs-nueva` (desde `staging1.0` @ `7450a97`)

## Resumen

Ciclo de auditoría P16 sobre `CertificationsListPage` (`/admin/certificaciones`): `paginasVisibles` (≤5 + elipsis); `mostrarResumen` gated (`vistaQA==='datos' && !cargando && !error`); grammar coincide/coinciden con filtros activos; filtros `vigente`|`revocado` + curso + texto; labels Válida/Revocado; DNI completo / anti-token; honesty con mensaje fijo + Reintentar (sin `errorRecuperable`); sin HTTP service/backend/token/P17–P21. Spec canónica `admin-certifications-frontend` actualizada (RENAMED + MODIFIED). Sin commit/push en este archive.

## Task Completion Gate

- `tasks.md`: **15/15** `[x]`
- CRITICAL en verify: **None** — archive permitido (PASS)
- Review receipt Engram: no hallado; archive avanza por instrucción del orquestador + PR #101 MERGED (`7450a97`) + verify PASS

## Engram Observation IDs (traceability)

| Artifact | Observation ID | Topic key |
|----------|----------------|-----------|
| proposal | #7484 | `sdd/audit-p16-certs-list/proposal` |
| spec | #7485 | `sdd/audit-p16-certs-list/spec` |
| design | #7486 | `sdd/audit-p16-certs-list/design` |
| tasks | #7487 | `sdd/audit-p16-certs-list/tasks` |
| verify-report | #7490 | `sdd/audit-p16-certs-list/verify-report` |
| review/transaction | — | no hallado |
| review/ledger | — | no hallado |
| review/receipt | — | no hallado |
| review/gate-context | — | no hallado |
| archive-report | #7491 | `sdd/audit-p16-certs-list/archive-report` |

## Specs Synced

| Domain | Action | Details |
|--------|--------|---------|
| admin-certifications-frontend | Updated | 0 added, **1 modified**, 0 removed, **1 renamed** |

### RENAMED + MODIFIED → `openspec/specs/admin-certifications-frontend/spec.md`

1. **Listado mock-only con datos seguros** → **Listado admin de certificaciones** — Carga vía `CERTIFICATIONS_SOURCE.listar()`; filtros `vigente`|`revocado` + curso + texto (sin entrega/borrador/vencido/pendiente); labels Válida/Revocado; DNI completo; `paginasVisibles` + elipsis; `mostrarResumen` gated; grammar coincide/coinciden; vacíos; honesty mensaje fijo+Reintentar (sin `errorRecuperable`); anti-token; CTA nueva + enlaces detalle/PDF; harness QA solo fuera de prod/staging.

Escenarios (9): Carga vía seam listar; Filtro vigente/revocado; Filtros combinables sin entrega; DNI completo y anti-token; Paginación con paginasVisibles; Resumen gated y grammar; Vacíos y fallo recuperable de listado; Navegación a detalle y PDF; QA de vistas opcional fuera de prod.

Preservados sin tocar: rutas protegidas, harness dedicado del listado, previsualización, paridad/folio, documentación F4-02, emisión nueva, emisión desde hub de fecha.

**Destructive delta?** No (sin REMOVED; rename+replace de un requisito).

## Docs updated (rules.archive)

- `docs/03-changelog.md` — viñeta P16 listado de certificaciones
- `docs/qa/PLAN-AUDITORIA-EXHAUSTIVA-STAGING-1.0.md` — P16 → hecha #101 (`7450a97`); sección fase apunta al archive; checklist cerrada
- `docs/frontend/03-modulos-admin.md` — fila `/admin/certificaciones` (seam listar + pager/resumen/grammar/honesty)

## Archive Contents

- explore.md ✅
- proposal.md ✅
- design.md ✅
- tasks.md ✅ (15/15)
- specs/admin-certifications-frontend/spec.md ✅
- verify-report.md ✅
- archive-report.md ✅ (this file)

## Verify notes carried forward (non-blocking)

1. SUGGESTION verify: CSS residual `.chip-dot--borrador` / `.validez-badge--borrador|vencido` (sin chips/filtros expuestos) — limpieza cosmética fuera de P16.
2. SUGGESTION verify: ChromeHeadless en entorno agent necesita `--no-sandbox` (no es defecto de producto).

## Source of Truth Updated

- `openspec/specs/admin-certifications-frontend/spec.md`

## SDD Cycle Complete

Planned → implemented → verified (PASS) → PR #101 merged (`7450a97`) → archived.
**No commit / no push** por instrucción explícita del archive (working tree en `audit/p17-certs-nueva` listo para parent).

## Next recommended

`none` — change closed. Siguiente ciclo de auditoría: P17 (`audit/p17-certs-nueva` / `/sdd-new` según orquestador).
