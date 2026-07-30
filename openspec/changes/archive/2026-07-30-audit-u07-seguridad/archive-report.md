# Archive Report: audit-u07-seguridad

**Fecha de cierre**: 2026-07-30
**Change archivado**: `audit-u07-seguridad`
**Archived to**: `openspec/changes/archive/2026-07-30-audit-u07-seguridad/`
**Veredicto sdd-verify**: PASS WITH WARNINGS (CRITICAL: none; 2/2 requirements, 7/8 scenarios COMPLIANT, 1/8 PARTIAL — live HTTP 403 DEFER U9)
**Merge**: PR #115 → `staging1.0` (`f1fa2f5`)
**Mode**: hybrid (OpenSpec filesystem + Engram)
**Branch de trabajo archive**: `audit/u08-docs`

## Resumen

Ciclo de auditoría U7 (Seguridad + PII): alinear `apps/backend-php/.htaccess` con deny `RewriteRule` `src|config` (+ vendor/composer) **antes** de `FallbackResource`; profundidad cookie D-009 (`lifetime=0` session cookie vs absoluto app-side **28800**; attrs fijos Secure/HttpOnly/SameSite=Strict; **MUST NOT** aflojar TTL 14400/28800); gate `test-privacy-headers.sh`; docs backend D-009. Specs canónicas actualizadas: `admin-auth` (1 MODIFIED vigencia/cookie) + `deploy-cpanel-certificados` (1 ADDED deny src|config). Live Apache 403 DEFER U9; U8 docs fuera; sin rotación token/QR/keys; archive U6 intacto. Sin commit/push en este archive.

## Task Completion Gate

- `tasks.md`: Phase 1–4 `[x]` + **V.1** `[x]` (todos los ítems de implementación + verify)
- CRITICAL en verify: **None** — archive permitido (PASS WITH WARNINGS; privacy + PHP auth suite + FE `__checks__` 51 SUCCESS exit 0)
- WARNING verify: live HTTP 403 `src/` DEFER U9 (estático `[F,L]` aceptado como evidencia de cobertura)
- Review receipt Engram: no hallado; archive avanza por **instrucción explícita del orquestador** (override Native Review Receipt Gate, mismo patrón U1–U6) + evidencia: verify PASS WITH WARNINGS (sin CRITICAL) + PR #115 MERGED (`f1fa2f5`)

## Engram Observation IDs (traceability)

| Artifact | Observation ID | Topic key |
|----------|----------------|-----------|
| proposal | #7609 | `sdd/audit-u07-seguridad/proposal` |
| spec | #7610 | `sdd/audit-u07-seguridad/spec` |
| design | #7611 | `sdd/audit-u07-seguridad/design` |
| tasks | #7612 | `sdd/audit-u07-seguridad/tasks` |
| verify-report | #7614 | `sdd/audit-u07-seguridad/verify-report` |
| review/transaction | — | no hallado (override orquestador) |
| review/ledger | — | no hallado (override orquestador) |
| review/receipt | — | no hallado (override orquestador) |
| review/gate-context | — | no hallado (override orquestador) |
| archive-report | #7616 | `sdd/audit-u07-seguridad/archive-report` |

## Specs Synced

| Domain | Action | Details |
|--------|--------|---------|
| admin-auth | Updated | **0 added**, **1 modified**, 0 removed, 0 renamed |
| deploy-cpanel-certificados | Updated | **1 added**, 0 modified, 0 removed, 0 renamed |

### MODIFIED → `openspec/specs/admin-auth/spec.md`

1. **Protección y vigencia de sesión** — cookie attrs fijos (`HttpOnly`/`Secure`/`SameSite=Strict`); path por entorno; `lifetime=0` (sesión de navegador); absolute app-side **28800** / idle **14400**; MUST NOT aflojar TTL; lastSeen U6 preservado (`GET /admin/auth/session` + GETs autorizados). Escenarios: Idle y absoluto exactos; Poll de session renueva idle; GET autorizado renueva idle; Configuración temporal inválida; **Atributos fijos de cookie en login**; **Cookie de sesión vs absoluto app-side**.

### ADDED → `openspec/specs/deploy-cpanel-certificados/spec.md`

1. **Deny de src|config en `.htaccess` de API** — `RewriteRule` `[F,L]` antes de `FallbackResource`; no servir código/config bajo esas rutas. Escenarios: Deny declarado antes del fallback; Acceso directo a src denegado.

Preservados sin tocar (admin-auth): Autorización sesión/CLI; Ciclo de sesión nativa; Fallo storage rate-limit; CSRF mutaciones; Retiro legacy.

**Destructive delta?** No. Solo MODIFIED (reemplazo del bloque de vigencia/cookie) + ADDED deny. Sin REMOVED/RENAMED. Metadata `(Previously: …)` del delta no se promovió al SoT. Archive U6 no modificado.

## Docs updated (rules.archive)

- `docs/qa/PLAN-AUDITORIA-EXHAUSTIVA-STAGING-1.0.md` — U7 → hecha #115 (`f1fa2f5`); sección fase CERRADA; prompt apunta al archive; Siguiente U8
- `docs/backend/00-php84-api.md` — D-009 ya alineado en apply (sin retouch en archive)
- `docs/03-changelog.md` — sin cambio adicional en este archive (sin feature visible nueva post-merge)

## Archive Contents

- explore.md ✅
- proposal.md ✅
- design.md ✅
- tasks.md ✅ (Phase 1–4 + V.1)
- specs/admin-auth/spec.md ✅
- specs/deploy-cpanel-certificados/spec.md ✅
- verify-report.md ✅
- archive-report.md ✅ (this file)

## Source of Truth Updated

- `openspec/specs/admin-auth/spec.md`
- `openspec/specs/deploy-cpanel-certificados/spec.md`

## Intentional Override — Native Review Receipt Gate

Orquestador instruyó proceder pese a receipts Engram ausentes (patrón U1–U6). Evidencia aceptada: verify PASS WITH WARNINGS (CRITICAL: none) + PR #115 MERGED → `staging1.0` (`f1fa2f5`). Override registrado. Intentional-with-warnings: escenario live 403 PARTIAL/DEFER U9.

## SDD Cycle Complete

Planned → implemented → verified (PASS WITH WARNINGS) → PR #115 merged (`f1fa2f5`) → archived.

Ready for next change: Bloque C U8 docs (`audit/u08-docs`).
