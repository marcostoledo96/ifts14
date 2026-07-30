```yaml
schema: gentle-ai.verify-result/v1
evidence_revision: sha256:d0937a1df0e08ffe60e7c2ba58803953488f7bee1017412a488413cc0571407a
verdict: pass
blockers: 0
critical_findings: 0
requirements: 5/5
scenarios: 10/10
test_command: npx ng test --include='**/paginas-visibles-window.spec.ts' --include='**/students-list-page.spec.ts' --include='**/courses-list-page.spec.ts' --include='**/certifications-list-page.spec.ts' --include='**/attendances-list-page.spec.ts' --include='**/attendance-marking-page.spec.ts' --include='**/app.routes.spec.ts' --no-watch --browsers=ChromeHeadless --no-progress
test_exit_code: 0
test_output_hash: sha256:2e46871acddd635e08f1ce124db6cb3063b0f1e2502e2ea6e0386e7a33df0077
build_command: ./node_modules/.bin/tsc --noEmit -p tsconfig.app.json
build_exit_code: 0
build_output_hash: sha256:e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855
```

## Verification Report

**Change**: audit-u01-prolijidad-fe
**Version**: N/A (delta `frontend-angular-shell` — 5 ADDED requirements SHELL-HYG-01..05, 10 scenarios)
**Mode**: Standard (`strict_tdd: false`)
**HEAD**: `e9f693084de54546328f81a2fb36a0256d602fe4`
**Branch**: `audit/u01-prolijidad-fe`

### Completeness

| Metric | Value |
|--------|-------|
| Tasks total (Phase 1–4) | 17 |
| Tasks complete | 17 |
| Tasks incomplete | 0 |
| Verify task V.1 | marked complete after this run |

### Build & Tests Execution

**Build**: ✅ Passed

```text
cwd: apps/frontend-angular
./node_modules/.bin/tsc --noEmit -p tsconfig.app.json
exit 0
stdout: (empty)
output hash sha256:e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855
```

**Tests**: ✅ 231 passed / ❌ 0 failed / ⚠️ 0 skipped (primary focused suite)

```text
cwd: apps/frontend-angular
npx ng test --include='**/paginas-visibles-window.spec.ts' --include='**/students-list-page.spec.ts' --include='**/courses-list-page.spec.ts' --include='**/certifications-list-page.spec.ts' --include='**/attendances-list-page.spec.ts' --include='**/attendance-marking-page.spec.ts' --include='**/app.routes.spec.ts' --no-watch --browsers=ChromeHeadless --no-progress
Chrome Headless 149.0.0.0 (Linux 0.0.0)
TOTAL: 231 SUCCESS
exit 0
output hash sha256:2e46871acddd635e08f1ce124db6cb3063b0f1e2502e2ea6e0386e7a33df0077
```

**Supplemental** (SHELL-HYG-02 folio path): `npx ng test --include='**/public-validation-page.spec.ts' …` → **TOTAL: 18 SUCCESS** (hash `sha256:db6dd296b00fc869ae8977a260c88fa7d0df8769508936f7ed073b9873158c62`).

**Coverage**: ➖ Not available (focused Karma; no coverage threshold in change)

### Spec Compliance Matrix

Source: `openspec/changes/audit-u01-prolijidad-fe/specs/frontend-angular-shell/spec.md` (5 requirements, 10 `#### Scenario` headings).

| Requirement | Scenario | Test | Result |
|-------------|----------|------|--------|
| SHELL-HYG-01 | Features sin página sin ruta | `app.routes.spec.ts` > `raíz redirige a /admin/login` + `raíz no carga PublicValidationPage` + Landing files absent / no `LandingPage` refs | ✅ COMPLIANT |
| SHELL-HYG-01 | Raíz no carga landing huérfana | `app.routes.spec.ts` > `navegación real: raíz termina en /admin/login sin validar ni demo` (+ static redirect; no `loadComponent` on `''`) | ✅ COMPLIANT |
| SHELL-HYG-02 | Shared UI con consumidor | FolioShell sources deleted; zero `FolioShell`/`app-folio-shell` refs under `src/`; suite green without orphan | ✅ COMPLIANT |
| SHELL-HYG-02 | Folio público sin shell huérfano | `public-validation-page.spec.ts` TOTAL 18 SUCCESS (no FolioShell dependency) | ✅ COMPLIANT |
| SHELL-HYG-03 | Marking usa solo el canónico | `attendance-marking-page.spec.ts` > `guardarYGenerar emite nuevos…`; HTML `(click)="guardarYGenerar()"`; no `guardar()` alias in marking `.ts` | ✅ COMPLIANT |
| SHELL-HYG-03 | Quitar alias no cambia UX | Same marking specs exercise primary CTA path / copy unchanged; HTML still `data-testid="cta-guardar-generar"` | ✅ COMPLIANT |
| SHELL-HYG-04 | Inventario OnPush completo | Verify-time inventory: **30/30** `@Component` under `src/app` declare `ChangeDetectionStrategy.OnPush` | ✅ COMPLIANT |
| SHELL-HYG-04 | Cleanup no rompe OnPush | Same inventory after Landing/FolioShell deletes (−2); remaining 30 OnPush; focused suite green | ✅ COMPLIANT |
| SHELL-HYG-05 | Extract mantiene UX de listados | `paginas-visibles-window.spec.ts` (4/4 edges) + list specs assert `paginasVisibles().length ≤ 5` / contain edge pages (certs) + 4 pages wire helper | ✅ COMPLIANT |
| SHELL-HYG-05 | Diff ajustado permite defer | N/A path — extract **included** this cycle; defer clause unused; HYG-01..04 still hold | ✅ COMPLIANT |

**Compliance summary**: 10/10 scenarios compliant

### Correctness (Static Evidence)

| Requirement | Status | Notes |
|------------|--------|-------|
| SHELL-HYG-01 orphans | ✅ Implemented | `landing-page.ts/.spec.ts` gone; `''` → `/admin/login` |
| SHELL-HYG-02 FolioShell | ✅ Implemented | `folio-shell.*` gone; public validation independent |
| SHELL-HYG-03 alias | ✅ Implemented | Only `guardarYGenerar` on marking page |
| SHELL-HYG-04 OnPush | ✅ Implemented | 30/30 OnPush (post-delete; was 32/32) |
| SHELL-HYG-05 pager | ✅ Implemented | `shared/util/paginas-visibles-window.ts` wired in 4 list pages |

### Coherence (Design)

| Decision | Followed? | Notes |
|----------|-----------|-------|
| Delete Landing + FolioShell + specs | ✅ Yes | Confirmed absent |
| Remove marking `guardar()` | ✅ Yes | Alias gone |
| Extract pager to `shared/util/` | ✅ Yes | Not under `ui/` |
| Wire 4 list pages | ✅ Yes | students/courses/certs/attendances |
| Leave `app.routes.ts` | ✅ Yes | No Landing registration |
| Keep OnPush / no UX redesign | ✅ Yes | 30/30; HTML CTA unchanged |
| DEFER formatters/clipboard/`mensajeErrorApi`/ponytails | ✅ Yes | Outside this change |
| No commit | ✅ Yes | Verify writes report + tasks mark only |

### Issues Found

**CRITICAL**: None

**WARNING**:
- Spec prose still mentions OnPush «32/32»; live count after deletes is **30/30**. Allowed by «salvo altas/bajas»; refresh wording at archive.

**SUGGESTION**:
- Optional: add a tiny inventory unit/script under CI for OnPush so HYG-04 is not verify-script-only.
- Early in this session OS `EAGAIN` blocked spawn; recovered — prefer direct `./node_modules/.bin/tsc` if `npx` flakes under pressure.

### Verdict

**PASS**

5/5 requirements / 10/10 scenarios compliant with runtime evidence; `tsc` exit 0; focused `ng test` 231 SUCCESS (+ 18 public-validation supplemental); design locks held; V.1 complete. Next: `sdd-archive`. No commit.
