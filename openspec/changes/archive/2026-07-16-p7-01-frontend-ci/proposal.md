# Proposal: P7-01 Frontend CI

## Intent

Extend the existing GitHub Actions frontend job with the missing quality gates required by P7-01: a production-staging build, a strict TypeScript `tsc --noEmit` check, and an explicit CI mock-detection step. The current `frontend-tests` job already runs unit tests and the production build, but the staging build and type-level checks are missing, leaving the staging path unverified in CI.

## Scope

### In Scope
- Add `npm run build -- --configuration production-staging` to the `frontend-tests` job.
- Add `npx tsc --noEmit -p tsconfig.app.json` as a CI step.
- Add a dedicated CI step that fails if `useRealApi !== true` in the production environment file.
- Update `openspec/config.yaml` quality metadata to reflect the new type-checker step.

### Out of Scope
- ESLint setup and configuration (deferred to a separate cycle).
- Renaming or restructuring `.github/workflows/backend-tests.yml` (manual status-check mapping makes this risky).
- Configuring GitHub branch protection rules (must be done in repository settings).

## Capabilities

### New Capabilities
- `frontend-ci-quality-gates`: CI-only quality gates for the Angular frontend covering staging build, strict TypeScript check, and mock detection.

### Modified Capabilities
- `frontend-environments`: REQ-ENV-004 (guarda de build en CI) will be satisfied by both the existing `environment.guard.spec.ts` and a new explicit CI mock-detection step.

## Approach

Extend the existing `frontend-tests` job in `.github/workflows/backend-tests.yml` inline with three new steps after `npm ci`:

1. **TypeScript strict check**: `npx tsc --noEmit -p tsconfig.app.json` before any build.
2. **Unit + guard tests**: keep existing `npm run test:ci`.
3. **Production build**: keep existing `npm run build` (defaults to production).
4. **Staging build**: add `npm run build -- --configuration production-staging`.
5. **Mock detection**: add a small Node script (`scripts/ci-mock-guard.mjs`) that reads `src/environments/environment.ts` and exits with code 1 if `useRealApi` is not `true`.

The mock-detection script is a thin CI clarity layer on top of the existing `environment.guard.spec.ts`, which already runs inside `test:ci`.

## Affected Areas

| Area | Impact | Description |
|------|--------|-------------|
| `.github/workflows/backend-tests.yml` | Modified | Add staging build, `tsc --noEmit`, and mock-detection steps to `frontend-tests`. |
| `apps/frontend-angular/scripts/ci-mock-guard.mjs` | New | Small Node script that asserts `useRealApi === true` in `environment.ts`. |
| `apps/frontend-angular/tsconfig.app.json` | Read-only validation | Confirm strict flags are respected by `tsc --noEmit`. |
| `openspec/config.yaml` | Modified | Update `testing.quality.type_checker` metadata. |

## Risks

| Risk | Likelihood | Mitigation |
|------|------------|------------|
| `tsc --noEmit` surfaces latent type errors not caught by `ng build`. | Medium | Run it first in the job so the failure is isolated and fix type errors before merging. |
| Workflow file name `backend-tests.yml` misleads maintainers. | Low | Document in the proposal that renaming is out of scope for this cycle. |
| `ChromeHeadless` needs `--no-sandbox` in CI runners. | Low | Monitor first runs; add `CHROME_BIN` / Karma flags only if failures appear. |
| Staging build budget or baseHref differs from production. | Low | Use existing `production-staging` configuration already defined in `angular.json`. |
| Mock guard script could produce false positives on minified code. | Low | Script checks source `environment.ts`, not the bundle. |

## Rollback Plan

1. Revert the single commit that modifies `.github/workflows/backend-tests.yml` and removes `apps/frontend-angular/scripts/ci-mock-guard.mjs`.
2. Revert the `openspec/config.yaml` metadata update.
3. Re-run a trivial PR to confirm the previous `frontend-tests` job (tests + production build only) still passes.

## Dependencies

- Existing `angular.json` `production-staging` configuration must remain valid.
- `apps/frontend-angular/package.json` must expose `ng build` and `ng test` as currently configured.

## Success Criteria

- [ ] `frontend-tests` job runs `npx tsc --noEmit -p tsconfig.app.json` and fails on any TypeScript error.
- [ ] `frontend-tests` job builds both `production` and `production-staging` configurations successfully.
- [ ] `frontend-tests` job runs `scripts/ci-mock-guard.mjs` and fails if `useRealApi !== true` in `environment.ts`.
- [ ] `npm run test:ci` still passes and runs `environment.guard.spec.ts`.
- [ ] `openspec/config.yaml` reflects the new type-checker gate.
