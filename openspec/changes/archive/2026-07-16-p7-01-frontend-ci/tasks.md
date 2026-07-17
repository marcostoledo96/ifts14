# Tasks: P7-01 Frontend CI

## Review Workload Forecast

| Field | Value |
|-------|-------|
| Estimated changed lines | ~55 |
| 1000-line budget risk | Low |
| Chained PRs recommended | No |
| Suggested split | Single PR |
| Delivery strategy | single-pr |
| Chain strategy | size-exception |

Decision needed before apply: No
Chained PRs recommended: No
Chain strategy: size-exception
400-line budget risk: Low

### Suggested Work Units

| Unit | Goal | Likely PR | Focused test command | Runtime harness | Rollback boundary |
|------|------|-----------|----------------------|-----------------|-------------------|
| 1 | All gates in one PR | PR 1 | `npx tsc --noEmit -p tsconfig.app.json && npm run test:ci && npm run build && npm run build -- --configuration production-staging && node scripts/ci-mock-guard.mjs` | Trigger `frontend-tests` job via PR against `main` | Revert single commit modifying `.github/workflows/backend-tests.yml` + delete `scripts/ci-mock-guard.mjs` |

## Phase 1: Foundation — Mock Detection Script

- [x] 1.1 Create `apps/frontend-angular/scripts/ci-mock-guard.mjs` — Node script that reads `src/environments/environment.ts`, parses `useRealApi` via regex, exits 0 if `true`, exits 1 with `"CI ERROR: production environment uses mocks (useRealApi !== true)"` otherwise. (REQ-CI-004)

## Phase 2: Core — CI Workflow Steps

- [x] 2.1 Add step `"TypeScript strict check (tsc --noEmit)"` after `npm ci` in `frontend-tests` job: `run: npx tsc --noEmit -p tsconfig.app.json`. (REQ-CI-001)
- [x] 2.2 Rename existing `"Build Angular"` step to `"Build producción"` and add step `"Build staging"` after it: `run: npm run build -- --configuration production-staging`. (REQ-CI-003)
- [x] 2.3 Add step `"Detectar mocks en producción"` after staging build: `run: node scripts/ci-mock-guard.mjs`. (REQ-CI-004)
- [x] 2.4 Verify final step order in `frontend-tests`: `npm ci → test:ci → tsc --noEmit → build prod → build staging → mock guard`. The 3-step contract (test:ci, tsc, build) must all pass for job success. (REQ-CI-006)

## Phase 3: Metadata — Config Update

- [x] 3.1 Update `openspec/config.yaml`: set `testing.quality.type_checker.available: true` and `testing.quality.type_checker.tool: "npx tsc --noEmit -p tsconfig.app.json"`. (Proposal success criterion)

## Phase 4: Local Verification

- [x] 4.1 Run `npx tsc --noEmit -p tsconfig.app.json` from `apps/frontend-angular/` to confirm no type errors. (REQ-CI-001)
- [x] 4.2 Run `node scripts/ci-mock-guard.mjs` from `apps/frontend-angular/` to confirm passes with current `environment.ts` (`useRealApi: true`). (REQ-CI-004)
- [x] 4.3 Run `npm run build -- --configuration production-staging` from `apps/frontend-angular/` to confirm staging build completes. (REQ-CI-003)
