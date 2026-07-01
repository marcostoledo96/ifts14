# Verification Report — deploy-staging-cpanel-ejecucion

**Change**: `deploy-staging-cpanel-ejecucion`  
**Branch**: `deploy/staging-cpanel-ejecucion`  
**Project**: `ifts14`  
**Mode**: Standard verify (`strict_tdd: false`)  
**Date**: 2026-07-01  
**Verdict**: **PASS WITH WARNINGS**

## Scope verified

- Local staging preparation for `/certificados_staging/`.
- No cPanel upload, no `public_html` modification, no DB real, no SMTP real, no secrets.
- Changed code, docs, tests and deploy templates.
- Manual Phase 3 remains gated and was not executed.

## Artifacts read

| Artifact | Status |
|---|---|
| `openspec/changes/deploy-staging-cpanel-ejecucion/proposal.md` | Read |
| `openspec/changes/deploy-staging-cpanel-ejecucion/design.md` | Read |
| `openspec/changes/deploy-staging-cpanel-ejecucion/tasks.md` | Read |
| `openspec/changes/deploy-staging-cpanel-ejecucion/apply-progress.md` | Read |
| `openspec/changes/deploy-staging-cpanel-ejecucion/specs/deploy-cpanel-certificados/spec.md` | Read |
| `apps/backend-php/index.php` | Read |
| `apps/backend-php/tests/NormalizePathTest.php` | Read |
| `apps/frontend-angular/angular.json` | Read |
| `apps/frontend-angular/src/environments/environment.staging.ts` | Read |
| `deploy/staging/*` | Read |
| `docs/deploy/01-staging-cpanel-certificados.md` | Read |

## Completeness

| Area | Expected | Result |
|---|---|---|
| Phase 0 gate | Human gate for local prep and no remote execution | PASS — local prep authorized; real cPanel remains gated |
| Phase 1 local prep | PHP, Angular, deploy templates, runbook | PASS |
| Phase 2 verification | PHP lint/test, Angular test/build, scans, status | PASS |
| Phase 3 cPanel execution | Manual, explicit-approval gated, not agent-owned | GATED / NOT EXECUTED — expected |

## Command evidence

| Command | Result |
|---|---|
| `git rev-parse --show-toplevel && git branch --show-current && git status --short` | PASS — repo `/home/marcos/Escritorio/ifts14`, branch `deploy/staging-cpanel-ejecucion`, expected modified/untracked files only |
| `php -v` | SKIPPED/BLOCKED — local PHP CLI unavailable |
| `docker image inspect ifts14-php84` | PASS — PHP 8.4 Docker image available |
| `docker run ... php -l index.php` | PASS — no syntax errors |
| `docker run ... php -l tests/NormalizePathTest.php` | PASS — no syntax errors |
| `docker run ... php tests/NormalizePathTest.php` | PASS — `OK NormalizePathTest` |
| `docker run ... php tests/HttpContractTest.php` | PASS — `OK HttpContractTest` |
| `docker run ... php tests/AuthGateTest.php && ... AdminCertificateServiceTest.php && ... EmailDeliveryServiceTest.php && ... ResendFlowTest.php && ... PdfResilienceTest.php` | PASS — all OK |
| `npm run test:ci` | PASS — `TOTAL: 70 SUCCESS` |
| `npm run build -- --configuration production-staging` | PASS — build complete, initial 253.42 kB |
| Node assertion over `dist/frontend-angular` | PASS — `index.html` contains `href="/certificados_staging/"`; JS contains `/certificados_staging/api` |
| Python scan of changed paths and deploy templates | PASS — no forbidden changed paths; no real-secret assignment patterns; `CERTIFICADOS_CONFIG_PATH` `SetEnv` remains commented in `.htaccess-api` |
| `git diff --check` | PASS |
| `git diff --cached --name-only` | PASS — nothing staged |
| `openspec validate deploy-staging-cpanel-ejecucion --strict` | SKIPPED/BLOCKED — `openspec` CLI not installed in this environment |

## Spec compliance matrix

| Requirement / scenario | Evidence | Status |
|---|---|---|
| Build frontend de staging | `production-staging` build passed; generated base href and API URL asserted from build output | PASS |
| API compatible con staging y producción | `NormalizePathTest` verified `/certificados_staging/api/health`, `/certificados/api/health`, `/index.php/health` and `/health` → 200 | PASS |
| Manifiesto revisable | `deploy/staging/MANIFIESTO.md` read; lists copy/exclusion rules; scan passed | PASS |
| Plantillas de servidor sin secretos | `.htaccess-root` and `.htaccess-api` read; staging routes only; `SetEnv CERTIFICADOS_CONFIG_PATH` is commented; scan passed | PASS |
| Gate previo a implementación | `tasks.md`, `apply-progress.md`, `CHECKLIST.md` and Engram gate record confirm only local prep was authorized | PASS |
| Sin deploy automatizado | No cPanel/public_html/DB/SMTP commands executed; status scan has no forbidden touched paths | PASS |
| Guía documental de staging separada | `docs/deploy/01-staging-cpanel-certificados.md` distinguishes staging from production and points to manual gated execution | PASS |
| Ejecución real gated | Phase 3 remains unchecked/manual in `tasks.md` and `CHECKLIST.md` | PASS |

## Correctness checks

| Check | Result |
|---|---|
| `normalizePath()` handles staging | PASS — runtime test covers `/certificados_staging/api/health` |
| `normalizePath()` keeps production path | PASS — runtime test covers `/certificados/api/health` |
| `normalizePath()` keeps bare/built-in paths | PASS — runtime test covers `/index.php/health` and `/health` |
| Angular staging config | PASS — `baseHref: /certificados_staging/`, file replacement to `environment.staging.ts`, `apiBaseUrl: /certificados_staging/api` |
| Production config not overwritten | PASS — existing `environment.ts` still uses `/certificados/api`; production config still uses `/certificados/` |
| Deploy templates | PASS — templates use `/certificados_staging/`; no secrets; config path remains external/commented |
| Forbidden artifacts | PASS — no tracked/untracked touched paths under `public_html`, `vendor`, `material_privado_no_versionar`, `.env`, dumps, logs or secrets |
| Git safety | PASS — nothing staged; no commit/push attempted |

## Design coherence

| Design decision | Verification | Status |
|---|---|---|
| Single PHP router for production/staging | Prefix list adds `/certificados_staging/api` before `/certificados/api`; runtime test passed | PASS |
| Angular `production-staging` | Configuration and build output match design | PASS |
| Versionable `.htaccess` templates | `deploy/staging/.htaccess-root` and `.htaccess-api` exist, use staging paths, no remote change | PASS |
| No ZIP/deploy automation | No packaging script added; runbook/manual checklist used | PASS |
| Manual rollout only | Phase 3 remains manual and gated | PASS |

## Issues

### CRITICAL

- None.

### WARNING

- `openspec` CLI is not installed, so strict CLI validation could not run. Verification used direct artifact inspection and runtime tests instead.
- Real cPanel smoke, final `CERTIFICADOS_CONFIG_PATH`, DB staging, Composer/vendor hosting decision and SMTP test remain Phase 3/operator work. This is expected and blocks remote execution, not local prep.

### SUGGESTION

- Before future cPanel execution, Marcos should fill the unchecked Phase 0/3 checklist items with real operational values outside Git.

## Risks remaining

- Staging can only be executed safely after the operator confirms external config path, staging DB/schema, backup, Composer/vendor handling and SMTP mode.
- cPanel `.htaccess` behavior is not remotely verified in this cycle by design.
- Ignored local directories exist (`vendor/`, `dist/`, `node_modules/`, `material_privado_no_versionar/`), but none are staged or part of the changed file set.

## Result Contract

**Result**: **PASS WITH WARNINGS**.  
**Commands/results**: PHP Docker lint/tests PASS, Angular tests PASS, Angular staging build PASS, generated build assertions PASS, forbidden path/secret scans PASS, git safety checks PASS.  
**Risks**: only manual Phase 3 operational gates remain; no code/spec blocker found.  
**Next**: archive the SDD change if this warning profile is acceptable; do not execute Phase 3 until Marcos explicitly approves and supplies real operational values outside Git.
