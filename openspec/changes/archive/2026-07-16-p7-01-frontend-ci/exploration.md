## Exploration: P7-01 Frontend CI

### Current State

The repository has a single GitHub Actions workflow: `.github/workflows/backend-tests.yml`.
It defines two jobs:

1. `php-tests` — backend unit tests, MariaDB E2E, privacy headers.
2. `frontend-tests` — Node 20, `npm ci`, `npm run test:ci`, `npm run build`.

Key observations on the existing `frontend-tests` job:
- It runs in the repo root workflow file (misleading name `backend-tests.yml`).
- Uses Node 20 with npm cache keyed to `apps/frontend-angular/package-lock.json`.
- `npm run test:ci` already includes: Node test for `no-focused-tests`, custom `no-focused-tests.mjs` scan, and Karma headless (`--watch=false --browsers=ChromeHeadless`).
- `npm run build` runs with the default configuration (`production` per `angular.json`).
- **No** `production-staging` build is executed in CI.
- **No** `tsc --noEmit` step exists.
- **No** ESLint step exists.
- **No** mock-detection gate beyond the existing `environment.guard.spec.ts`.
- **No** branch protection settings are visible in code (must be checked in GitHub UI/settings).

### Affected Areas

- `.github/workflows/backend-tests.yml` — extend `frontend-tests` job
- `apps/frontend-angular/package.json` — add `lint` script (if ESLint is introduced)
- `apps/frontend-angular/tsconfig.app.json` — confirm strict flags are respected by `tsc --noEmit`
- `apps/frontend-angular/angular.json` — build configurations inspected
- `apps/frontend-angular/src/environments/environment.ts` — mock detection target
- `openspec/config.yaml` — update testing/quality metadata when CI changes land

### Approaches

1. **Extend existing workflow inline**
   - Add `npm run build -- --configuration production-staging`
   - Add `npx tsc --noEmit -p tsconfig.app.json`
   - Add mock-detection check (grep `useRealApi` in bundle or verify `environment.ts`)
   - Add ESLint step if configured
   - Pros: simplest, single file change, reuses existing job structure
   - Cons: workflow name remains misleading (`backend-tests.yml`), mixed concerns
   - Effort: Low

2. **Split into dedicated `frontend-ci.yml`**
   - Extract `frontend-tests` into its own workflow file
   - Rename backend workflow to `backend-ci.yml` (breaking change for bookmarks/links)
   - Pros: cleaner separation, clearer status checks, easier to extend
   - Cons: requires updating any references to the old file name; may require repo-admin settings update
   - Effort: Medium

### Recommendation

Use Approach 1 (extend inline) for this cycle to minimize scope and risk. Rename/restructure workflows can be deferred to a later cleanup cycle (P7-04 or P9). The change must:

1. Add `npm run build -- --configuration production-staging` to `frontend-tests`.
2. Add `npx tsc --noEmit -p tsconfig.app.json` before builds.
3. Add a mock-detection step that fails if `useRealApi !== true` in the production environment file or bundle output.
4. Optionally add ESLint if it can be installed/configured within scope; otherwise document as follow-up.
5. Document branch protection requirement (block merge on `frontend-tests` status check).

### Gaps vs. P7-01 Spec

| Requirement | Current | Gap |
|---|---|---|
| `npm ci` | Present | None |
| `npm run test:ci` (Karma headless) | Present | None |
| `npm run build -- --configuration production` | Present (default) | None |
| `npm run build -- --configuration production-staging` | **Missing** | Must add |
| Mock detection gate | Partial (`environment.guard.spec.ts` exists but no CI bundle inspection) | Add CI step |
| ESLint | **Missing entirely** | Decide: in-cycle or separate |
| Block merge if build/tests fail | Not visible in code; relies on GitHub branch protection | Document + configure in repo settings |

### Gaps vs. User's 3-Step Verification

| Step | Current CI | Gap |
|---|---|---|
| 1. `npm run test:ci` | Present | None |
| 2. `npx tsc --noEmit -p tsconfig.app.json` | **Missing** | Must add |
| 3. `npm run build` (AOT production) | Present | None |

### Mock Detection Approach

The production environment is controlled by `src/environments/environment.ts`:

```ts
export const environment = {
  useRealApi: true,
  apiBaseUrl: '/certificados/api',
};
```

There is already an `environment.guard.spec.ts` test that asserts `useRealApi === true` and `apiBaseUrl === '/certificados/api'`. This runs during `npm run test:ci` and will fail CI if someone commits `useRealApi: false`.

For an additional CI gate, options:
- **Option A**: Post-build grep in `dist/frontend-angular/` for `useRealApi\s*:\s*false`. Fragile but fast.
- **Option B**: Run `environment.guard.spec.ts` explicitly as a separate CI step. Already covered by `test:ci`.
- **Option C**: Add a small Node script that reads `src/environments/environment.ts` and asserts `useRealApi === true` with an AST-level check (safer than regex).

Recommendation: rely on `environment.guard.spec.ts` as the primary gate (it already runs in `test:ci`), and add a small Node verification script as a dedicated CI step for clarity and to produce a clear error message.

### ESLint Status

- **No ESLint config exists** in `apps/frontend-angular/`.
- No `.eslintrc*`, no `eslint.config.*`, no `eslint` in `package.json` dependencies.
- Angular 20 projects typically use `@angular-eslint` packages.
- Installing and configuring ESLint requires adding devDependencies and possibly a config file. The user explicitly noted it can be a separate cycle if the diff grows.

**Decision**: defer ESLint to a follow-up cycle (e.g., P7-01b or P9). Document in tasks.

### Branch Protection

- Branch protection rules are **not stored in Git**; they live in GitHub repository settings.
- The orchestrator (or repo admin) must configure `frontend-tests` as a required status check in the branch protection for `main`.
- The current workflow file does not define `required` status checks.

### Risks

- `backend-tests.yml` name is misleading; extending it further increases confusion.
- `npm run build` default configuration is `production`, which is correct, but explicit `--configuration production` is safer.
- `tsc --noEmit` may surface errors not caught by `ng build` because Angular CLI's type checking path can differ from raw `tsc`.
- Node version in `package-lock.json` metadata says `>= 14.0.0`, but CI pins Node 20. Angular 20 requires Node 18+. No risk here, but worth noting.
- No `karma.conf.js` exists; Karma options come from `angular.json` defaults. If headless Chrome needs args (e.g., `--no-sandbox`), the job may fail in CI. Current `test:ci` has not been observed failing in this environment, but it is a latent risk.

### Estimated Scope

Files to touch:
- `.github/workflows/backend-tests.yml` — add 3–6 lines (staging build, tsc, mock check)
- `apps/frontend-angular/package.json` — optionally add `lint` script and `@angular-eslint/*` devDeps (if ESLint is in-scope)
- New file: `apps/frontend-angular/scripts/ci-mock-guard.mjs` — ~15 lines (optional but recommended)

Total lines of change (without ESLint): ~10–20 lines.
Total lines of change (with ESLint): ~50–100 lines + new config file.

### Ready for Proposal

Yes. The exploration confirms the gaps are small and well-defined. The orchestrator should tell the user:

- ESLint is not configured; recommend deferring it to a separate cycle.
- The mock guard (`environment.guard.spec.ts`) already runs in `test:ci`, but a dedicated CI step is cheap and improves clarity.
- Branch protection must be enabled manually in GitHub settings.
