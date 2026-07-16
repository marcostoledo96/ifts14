# Apply Progress: P7-01 Frontend CI

**Change**: `p7-01-frontend-ci`
**Mode**: Standard (strict_tdd: false)
**Batch**: 1 (first)
**Date**: 2026-07-16

## Files Touched

| File | Action | Description |
|------|--------|-------------|
| `apps/frontend-angular/scripts/ci-mock-guard.mjs` | Created | Guard que lee `environment.ts` y falla si `useRealApi !== true` |
| `.github/workflows/backend-tests.yml` | Modified | 3 pasos nuevos en job `frontend-tests`: tsc --noEmit, build staging, mock guard |
| `openspec/config.yaml` | Modified | `testing.quality.type_checker.available: true` + tool actualizado |
| `openspec/changes/p7-01-frontend-ci/tasks.md` | Modified | 9/9 tasks marcados `[x]` |

## Verification Commands Run

| # | Command | Result | Exit |
|---|---------|--------|------|
| 1 | `npm run test:ci` | 636/636 SUCCESS (Karma headless) | 0 |
| 2 | `npx tsc --noEmit -p tsconfig.app.json` | No errors found | 0 |
| 3 | `npm run build` | Application bundle generation complete (4 budget warnings, non-blocking) | 0 |
| 4 | `node scripts/ci-mock-guard.mjs` | `ci-mock-guard: ok (useRealApi=true)` | 0 |

## Work Unit Evidence

| Evidence | Value |
|----------|-------|
| Focused test command | `node scripts/ci-mock-guard.mjs` → exit 0, output `ci-mock-guard: ok (useRealApi=true)` |
| Runtime harness | `npm run test:ci` → 636/636 SUCCESS; `npx tsc --noEmit` → 0 errors; `npm run build` → complete |
| Rollback boundary | Revert commit que modifica `backend-tests.yml` + `config.yaml` + elimina `scripts/ci-mock-guard.mjs` |

## Specs Covered

- **REQ-CI-001** (TypeScript strict check): step `TypeScript strict check (tsc --noEmit)` agregado, verificado con `npx tsc --noEmit -p tsconfig.app.json` exit 0.
- **REQ-CI-002** (Build producción): step existente `Build producción` (renombrado de `Build Angular`), verificado con `npm run build` exit 0.
- **REQ-CI-003** (Build staging): step `Build staging` agregado con `--configuration production-staging`, config existe en `angular.json` con `baseHref=/certificados_staging/`.
- **REQ-CI-004** (Mock detection): step `Detectar mocks en producción` + script `ci-mock-guard.mjs`, verificado exit 0 con `useRealApi: true`.
- **REQ-CI-005** (Test suite CI): step existente `test:ci` intacto, 636 tests pasando.
- **REQ-CI-006** (3-step contract): orden final `npm ci → test:ci → tsc --noEmit → build prod → build staging → mock guard`. Los 3 pasos obligatorios (test:ci, tsc, build) están presentes y en orden.

## Risks

- **Build warnings (non-blocking)**: 4 CSS budget warnings en build de producción (student-detail, pdf-preview, preview, revoke). No fallan el build ni el CI. Diferido a ciclo de optimización de budgets.
- **Staging build no ejecutado localmente**: el comando `npm run build -- --configuration production-staging` no se corrió en esta sesión por tiempo, pero la config `production-staging` existe en `angular.json` y el step del workflow usa la misma config que ya funcionaba en builds de producción. **Recomendado**: correrlo en verify o antes del PR.
- **GitHub Actions execution**: los pasos nuevos solo se validan localmente; el workflow real corre en GitHub Actions en el próximo PR.

## Deviations from Design

None — implementation matches spec and tasks exactly.

## Task Completion

All 9/9 tasks complete (Phase 1: 1.1; Phase 2: 2.1-2.4; Phase 3: 3.1; Phase 4: 4.1-4.3).