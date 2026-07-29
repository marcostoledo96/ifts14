# Archive Report: audit-p15-asist-certs

**Fecha de cierre**: 2026-07-29
**Change archivado**: `audit-p15-asist-certs`
**Archived to**: `openspec/changes/archive/2026-07-29-audit-p15-asist-certs/`
**Veredicto sdd-verify**: PASS (CRITICAL: none; WARNING: none)
**Merge**: PR #100 → `staging1.0` (`101aff6`)
**Mode**: hybrid (OpenSpec filesystem + Engram)
**Branch de trabajo archive**: `audit/p16-certs-list` (desde `staging1.0` @ `101aff6`)

## Resumen

Ciclo de auditoría P15 sobre `DateCertificatesPage` (`/admin/cursos/:id/fechas/:fechaId/asistencias/certificados`): `errorRecuperable` + Reintentar solo en catch de carga; `mensajeErrorApi` en acciones Copiar/QR/PDF; enlace «Expediente» por fila a `/admin/certificaciones/:id` (fuera de `.cert-acciones`); empty con CTA a marcar; listado por `cursoId`; DNI completo / anti-token; sin HTTP/backend/P14/P16/rotación token. Spec canónica `admin-attendances-frontend` actualizada (1 MODIFIED). Sin commit/push en este archive.

## Task Completion Gate

- `tasks.md`: **18/18** `[x]`
- CRITICAL en verify: **None** — archive permitido (PASS)
- Review receipt Engram: no hallado; archive avanza por instrucción del orquestador + PR #100 MERGED (`101aff6`) + verify PASS

## Engram Observation IDs (traceability)

| Artifact | Observation ID | Topic key |
|----------|----------------|-----------|
| proposal | #7474 | `sdd/audit-p15-asist-certs/proposal` |
| spec | #7475 | `sdd/audit-p15-asist-certs/spec` |
| design | #7476 | `sdd/audit-p15-asist-certs/design` |
| tasks | #7477 | `sdd/audit-p15-asist-certs/tasks` |
| verify-report | #7481 | `sdd/audit-p15-asist-certs/verify-report` |
| review/transaction | — | no hallado |
| review/ledger | — | no hallado |
| review/receipt | — | no hallado |
| review/gate-context | — | no hallado |
| archive-report | #7482 | `sdd/audit-p15-asist-certs/archive-report` |

## Specs Synced

| Domain | Action | Details |
|--------|--------|---------|
| admin-attendances-frontend | Updated | 0 added, **1 modified**, 0 removed, 0 renamed |

### MODIFIED → `openspec/specs/admin-attendances-frontend/spec.md`

1. **Página de certificados del curso (por fecha)** — Listado por `cursoId` (NO `fechaId`); empty+CTA marcar; state post-marcado; Copiar→QR→PDF + enlace Expediente; entrega inline (sin `/entrega`); `errorRecuperable`+Reintentar solo catch de carga; id/not-found sin Reintentar; acciones con `mensajeErrorApi`/genérico sin raw ni Reintentar de página; DNI completo / anti-token; sin exigir HTTP/backend ni rotación token/QR.

Escenarios (7): Entrega desde página dedicada; Link Expediente por fila; Vacío con CTA a asistencias; Fallo recuperable de carga con Reintentar; Id inválido o not-found sin Reintentar; Error de acción sin Reintentar; DNI completo y anti-token.

Preservados sin tocar: hub P12, intermedia P13, marcado/emisión P14, carga vigente, paridad mock, frontera segura, demás requisitos del dominio.

**Destructive delta?** No (sin REMOVED).

## Docs updated (rules.archive)

- `docs/03-changelog.md` — viñeta P15 certificados por fecha
- `docs/qa/PLAN-AUDITORIA-EXHAUSTIVA-STAGING-1.0.md` — P15 → hecha #100 (`101aff6`); sección fase apunta al archive; checklist cerrada
- `docs/frontend/03-modulos-admin.md` — fila ruta certificados-por-fecha (honesty + Expediente + acciones)

## Archive Contents

- explore.md ✅
- proposal.md ✅
- design.md ✅
- tasks.md ✅ (18/18)
- specs/admin-attendances-frontend/spec.md ✅
- verify-report.md ✅
- archive-report.md ✅ (this file)

## Verify notes carried forward (non-blocking)

1. SUGGESTION verify (pre-merge): PLAN local dirty vs remote — resuelto al merge #100 + este archive.
2. SUGGESTION verify: lineage del branch incluía archive P14 — no afecta locks de producto P15.

## Source of Truth Updated

- `openspec/specs/admin-attendances-frontend/spec.md`

## SDD Cycle Complete

Planned → implemented → verified (PASS) → PR #100 merged (`101aff6`) → archived.
**No commit / no push** por instrucción explícita del archive (working tree en `audit/p16-certs-list` listo para parent).

## Next recommended

`none` — change closed. Siguiente ciclo de auditoría: P16 (`audit/p16-certs-list` / `/sdd-new` según orquestador).
