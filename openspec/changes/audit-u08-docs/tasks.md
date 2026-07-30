# Tasks: audit-u08-docs — Documentación y drift (U8)

## Review Workload Forecast

| Field | Value |
|-------|-------|
| Estimated changed lines | ~80–200 (docs only) |
| 400-line budget risk | Low |
| Chained PRs recommended | No |
| Suggested split | PR único (`size:exception`) |
| Delivery strategy | exception-ok |
| Chain strategy | size-exception |

Decision needed before apply: No
Chained PRs recommended: No
Chain strategy: size-exception
400-line budget risk: Low

### Suggested Work Units

| Unit | Goal | Likely PR | Focused test command | Runtime harness | Rollback boundary |
|------|------|-----------|----------------------|-----------------|-------------------|
| 1 | Docs U8: módulos + changelog + checklist + banner + PLAN drift/§U8 | PR único (`audit/u08-docs`) | Ver «Verify grep/assert» abajo | N/A — docs-only; live 403 staging → U9 | Revert docs tocados; archive U7 intacto |

**TDD**: `apply.tdd: false`. Threat matrix N/A. Verify = content grep/assert.

**Locks**: Docs-only; no producto FE/BE; no rewrite specs/contrato tables; archive `openspec/changes/archive/2026-07-30-audit-u07-seguridad/` intacto; sin secretos/dumps; demo local etiquetada; **no commit**.

**Apply**: `size-exception` / single PR → `staging1.0`. Ready for **sdd-apply**.

## Phase 1: Mapa admin + changelog U6/U7

- [x] 1.1 `docs/frontend/03-modulos-admin.md` — reemplazar «miles → U6» por deferral honesto (paginación/API futura; no U6 sesión/TTL) [spec: sin etiqueta U6]
- [x] 1.2 `docs/03-changelog.md` — si hay wording U2 FE «miles → U6», corregir al mismo criterio (0 false pointers) [design verify #1]
- [x] 1.3 `docs/03-changelog.md` — viñeta U6: lastSeen en session/authorize; TTL 14400/28800; storage→503≠429 [spec: changelog U6]
- [x] 1.4 `docs/03-changelog.md` — viñeta U7: deny `src|config`; cookie lifetime=0 (D-009) [spec: changelog U7]

## Phase 2: Checklist QA + banner + PLAN §U8

- [x] 2.1 `docs/qa/CHECKLIST-TESTING-MANUAL.md` — cabecera/plantilla rama → `staging1.0` / `audit/*`; demo creds = solo local [spec: checklist]
- [x] 2.2 Checklist S-04 — `…/api/src/…` **MUST 403** cuando deny U7 htaccess desplegado (idle live → U9) [spec: S-04]
- [x] 2.3 `docs/backend/01-contrato-api-certificados.md` — banner supersession (~1–2 líneas, tono API.md P5-01): sesión+CSRF; `X-Admin-Key` no HTTP; links `admin-auth` + `00-php84-api.md`; **no** editar tablas auth [design]
- [x] 2.4 `docs/qa/PLAN-AUDITORIA-EXHAUSTIVA-STAGING-1.0.md` §U8 — añadir «Nota de drift» corta (contrato X-Admin-Key tabulado; deploy/guías D0 histórico; residual `00-php84-api`; SoT: admin-auth / 00-php84-api / API.md); **un solo lugar**; no tocar `openspec/specs/README.md` [spec: drift]
- [x] 2.5 PLAN §U8 — marcar checklist `[x]` + fila tabla fase al cierre apply [design]

## Phase 3: No-ops + locks + content assert

- [x] 3.1 Confirmar no-op `docs/06-flujo-git-recomendado.md` (`main`=prod, `staging1.0`=integración) [spec: Git]
- [x] 3.2 Confirmar no-op `docs/00-indice-general.md` (enlace PLAN) [spec: índice]
- [x] 3.3 Confirmar `git status` sin cambios bajo archive U7; `openspec/specs/README.md` no-op [spec: archive]
- [x] 3.4 Grep anti-secretos en docs tocados: sin dumps SQL / tokens / DNI / creds staging [spec: secretos]
- [x] 3.5 Ejecutar bloque «Verify grep/assert»; prep → **sdd-verify**

## Verify (sdd-verify)

- [x] V.1 Content asserts → `verify-report.md` (6 escenarios `audit-remediation-planning`); live 403 DEFER U9; **no commit**

### Verify grep/assert (focused)

```bash
# 1 — 0 false U6 pagination pointers
rg -n 'miles → U6|→ U6' docs/frontend/03-modulos-admin.md docs/03-changelog.md
# expect: no hits tying list scale/pagination to U6

# 2 — changelog U6 + U7 keywords
rg -n 'lastSeen|14400|28800|503' docs/03-changelog.md
rg -n 'src\|config|lifetime=0|deny' docs/03-changelog.md

# 3 — checklist rama + S-04 403
rg -n 'staging1\.0|audit/' docs/qa/CHECKLIST-TESTING-MANUAL.md
rg -n 'S-04|403|api/src' docs/qa/CHECKLIST-TESTING-MANUAL.md

# 4 — PLAN drift + §U8 closed
rg -n 'Nota de drift|U8' docs/qa/PLAN-AUDITORIA-EXHAUSTIVA-STAGING-1.0.md
rg -n '^\s*- \[x\].*U8|U8.*\[x\]' docs/qa/PLAN-AUDITORIA-EXHAUSTIVA-STAGING-1.0.md || true
# also: visual confirm §U8 checkboxes [x]

# 5 — contrato banner (sesión / X-Admin-Key no HTTP)
rg -n 'sesión|CSRF|X-Admin-Key|admin-auth|00-php84-api' docs/backend/01-contrato-api-certificados.md | head

# 6 — Git + índice still aligned (no-op confirm)
rg -n 'staging1\.0|PRODUCCIÓN|producción' docs/06-flujo-git-recomendado.md
rg -n 'PLAN-AUDITORIA-EXHAUSTIVA-STAGING-1.0' docs/00-indice-general.md

# 7 — archive U7 untouched + no secrets in touched docs
git status --short openspec/changes/archive/2026-07-30-audit-u07-seguridad/
rg -n 'BEGIN RSA|mysql dump|password-staging|token=[A-Za-z0-9]{20,}' \
  docs/frontend/03-modulos-admin.md docs/03-changelog.md \
  docs/qa/CHECKLIST-TESTING-MANUAL.md \
  docs/qa/PLAN-AUDITORIA-EXHAUSTIVA-STAGING-1.0.md \
  docs/backend/01-contrato-api-certificados.md || true
# expect: archive clean; no secret hits (demo-local labels OK)
```
