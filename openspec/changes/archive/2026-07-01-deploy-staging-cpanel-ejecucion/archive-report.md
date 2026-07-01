# Archive Report — deploy-staging-cpanel-ejecucion

**Status**: success (intentional-with-warnings)
**Change**: `deploy-staging-cpanel-ejecucion`
**Project**: `ifts14`
**Branch**: `deploy/staging-cpanel-ejecucion`
**Archive folder**: `openspec/changes/archive/2026-07-01-deploy-staging-cpanel-ejecucion/`
**Archived on**: 2026-07-01
**Archive mode**: openspec
**Verify verdict carried forward**: PASS WITH WARNINGS
**SDD cycle**: closed

## Result

The SDD cycle for `deploy-staging-cpanel-ejecucion` is closed. Local staging preparation for `/certificados_staging/` is executable and verified; Phase 3 (real cPanel execution) remains manual, explicit-approval gated, and intentionally not executed.

## Spec merge summary

Delta spec: `openspec/changes/archive/2026-07-01-deploy-staging-cpanel-ejecucion/specs/deploy-cpanel-certificados/spec.md`
Main spec updated: `openspec/specs/deploy-cpanel-certificados/spec.md`

| Operation | Requirement | Scenarios |
|-----------|-------------|-----------|
| MODIFIED | Guía documental de staging separada | 2 (Preparación local de staging, Ejecución real gated) |
| ADDED | Preparación local ejecutable para staging | 2 (Build frontend de staging, API compatible con staging y producción) |
| ADDED | Paquete versionable de staging | 2 (Manifiesto revisable, Plantillas de servidor sin secretos) |
| ADDED | Gates humanos para ejecución real | 2 (Gate previo a implementación, Sin deploy automatizado) |

| Totals | Count |
|--------|-------|
| Requirements in main spec after merge | 23 |
| Requirements modified in place | 1 |
| Requirements added (appended) | 3 |
| Requirements removed | 0 |
| Requirements renamed | 0 |
| Existing requirements preserved | 19 |

The 19 unchanged requirements (11 base + 8 staging-related already in main spec) were preserved verbatim. The MODIFIED requirement body and scenarios were replaced; the previous "(Anteriormente: ...)" note was carried forward inside the new requirement body per the delta.

## Archive contents

| Artifact | Status |
|----------|--------|
| `proposal.md` | archived (3.1K) |
| `exploration.md` | archived (8.7K) |
| `design.md` | archived (5.7K) |
| `tasks.md` | archived (4.0K) — see Phase 3 note below |
| `apply-progress.md` | archived (8.1K) |
| `verify-report.md` | archived (7.7K) |
| `specs/deploy-cpanel-certificados/spec.md` | archived as delta |
| `archive-report.md` | this file (created at archive time) |

## Phase 3 preservation (intentional-with-warnings)

`tasks.md` keeps Phase 3 items `3.1`–`3.10` unchecked by design:

- These are **manual, explicit-approval gated** operator steps, not agent-owned.
- The orchestrator explicitly authorized archive with this profile.
- `apply-progress.md` and `verify-report.md` document that the agent did not and must not execute Phase 3.
- No stale-checkbox reconciliation was performed: the unchecked state is the *expected* final state for this cycle.

Per the sdd-archive policy, this archive is recorded as `intentional-with-warnings`. The reason is recorded in this report and in `verify-report.md` (WARNING section).

## Verification evidence carried forward

| Check | Result |
|-------|--------|
| PHP `index.php` lint (docker) | no syntax errors |
| `NormalizePathTest` | `OK NormalizePathTest` (4 prefixes → 200, unknown → 404) |
| `HttpContractTest` | `OK` (regression) |
| Other backend test suite (`AuthGateTest`, `AdminCertificateServiceTest`, `EmailDeliveryServiceTest`, `ResendFlowTest`, `PdfResilienceTest`) | all `OK` |
| `npm run test:ci` | TOTAL 70 SUCCESS |
| `npm run build -- --configuration production-staging` | build complete, 253.42 kB initial |
| Build output assertions | `baseHref /certificados_staging/` in `index.html`, `/certificados_staging/api` in `main-*.js` |
| Secret/forbidden-path scan on `deploy/staging/` | 0 matches |
| `git status --short` | no `dist/`, `vendor/`, `public_html/`, `.env*` |
| `git diff --check` | clean |
| `openspec validate ... --strict` | SKIPPED — `openspec` CLI not installed in this environment (warning, not blocker) |

## Files changed by this archive operation

| Path | Action |
|------|--------|
| `openspec/specs/deploy-cpanel-certificados/spec.md` | edited in place (1 MODIFIED, 3 ADDED) |
| `openspec/changes/archive/2026-07-01-deploy-staging-cpanel-ejecucion/` | created via `mv` (untracked content, no `git add`/`commit`/`push`) |
| `openspec/changes/archive/2026-07-01-deploy-staging-cpanel-ejecucion/archive-report.md` | created (this file) |
| Engram `sdd/deploy-staging-cpanel-ejecucion/archive-report` | saved with `topic_key` and `capture_prompt: false` |

No `git add`, `git commit`, or `git push` was performed. No real cPanel, `public_html`, DB, SMTP, secrets, `vendor/`, or `material_privado_no_versionar/` was touched.

## Safety and security

- No `.env`, dumps, logs, `vendor/`, `public_html/`, real-secret assignment patterns, or private material was copied, written, or referenced.
- `SetEnv CERTIFICADOS_CONFIG_PATH` remains commented in the archived `.htaccess-api` template; the operator fills it outside Git when ready.
- All staged files use staging paths only (`/certificados_staging/`, `/certificados_staging/api`); production paths (`/certificados/`, `/certificados/api`) are intentionally kept in the router for the existing production deployment.

## Next step

The SDD cycle is closed. The next change can be proposed in a new `openspec/changes/{new-change}/` folder. Phase 3 of this change remains a manual, gated operator task outside the agent's scope.
