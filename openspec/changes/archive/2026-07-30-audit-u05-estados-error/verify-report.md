```yaml
schema: gentle-ai.verify-result/v1
evidence_revision: sha256:cd1d8d587f2c576d6e742b4c20c4b4fec65b2aaff59872d16c301363b0ffe5a1
verdict: pass_with_warnings
blockers: 0
critical_findings: 0
requirements: 4/4
scenarios: 10/10
test_command: cd apps/frontend-angular && CHROME_BIN=.tmp/chrome-wrapper.sh npx ng test --include='**/courses-list-page.spec.ts' --include='**/certifications-list-page.spec.ts' --include='**/course-editor-page.spec.ts' --include='**/students-list-page.spec.ts' --include='**/csrf.interceptor.spec.ts' --no-watch --browsers=ChromeHeadless --no-progress
test_exit_code: 0
test_output_hash: sha256:cd1d8d587f2c576d6e742b4c20c4b4fec65b2aaff59872d16c301363b0ffe5a1
build_command: cd apps/frontend-angular && node node_modules/typescript/lib/tsc.js --noEmit -p tsconfig.app.json
build_exit_code: 0
build_output_hash: sha256:e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855
```

## Verification Report

**Change**: audit-u05-estados-error
**Version**: delta ADDED (`frontend-angular-shell` SHELL-STATE-01..04) — 4 requirements / 10 scenarios (Engram `sdd/audit-u05-estados-error/spec` #7592)
**Mode**: Standard (`strict_tdd: false` / `apply.tdd: false`)
**HEAD (pre-commit base)**: `7b7d3dbd3ec1e3e2406a4060be9c794510abe309` (merge #112 / U4)
**Branch**: `audit/u05-estados-error`

### Completeness

| Metric | Value |
|--------|-------|
| Tasks total (Phase 1–5 + V.1) | 16 |
| Tasks complete | 16 |
| Tasks incomplete | 0 |
| Verify task V.1 | marked complete after this run |

Apply phases 1–5 were already `[x]`. V.1 was open pending this verify run.

### Build & Tests Execution

**Build**: ✅ Passed

```text
cwd: apps/frontend-angular
node node_modules/typescript/lib/tsc.js --noEmit -p tsconfig.app.json
exit 0
stdout: (empty)
output hash sha256:e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855
```

**Tests**: ✅ 103 passed / ❌ 0 failed

```text
cwd: apps/frontend-angular
CHROME_BIN=.tmp/chrome-wrapper.sh (no-sandbox headless; user-data under .tmp/chrome-home)
npx ng test --include='**/courses-list-page.spec.ts' --include='**/certifications-list-page.spec.ts' --include='**/course-editor-page.spec.ts' --include='**/students-list-page.spec.ts' --include='**/csrf.interceptor.spec.ts' --no-watch --browsers=ChromeHeadless --no-progress
Chrome Headless 149.0.0.0 (Linux 0.0.0)
TOTAL: 103 SUCCESS (1.108 secs / 1.037 secs)
exit 0
output hash sha256:cd1d8d587f2c576d6e742b4c20c4b4fec65b2aaff59872d16c301363b0ffe5a1
```

**Coverage**: ➖ Not available (focused Karma; no coverage threshold in change)

**Whitespace (`git diff --check`)**: ✅ clean on touched U5 paths + `openspec/changes/audit-u05-estados-error/` (exit 0). `.tmp/` excluded from commit.

**Docs / PLAN evidence**:
- PLAN §U5 checklist all `[x]` (patrones error+reintentar; 401 interceptor regresión; empty CTA útil; QA solo-dev)
- Authored U5 FE+PLAN diff ≈ **254** lines (233+/21−) — under 400-line review budget (`size-exception` still OK)

### Spec Compliance Matrix

Source: Engram `sdd/audit-u05-estados-error/spec` (SHELL-STATE-01..04; 10 `#### Scenario` headings). Change-folder delta path referenced by Engram (`openspec/changes/audit-u05-estados-error/specs/frontend-angular-shell/spec.md`) is **missing on disk**; main `openspec/specs/frontend-angular-shell/spec.md` has **no** SHELL-STATE yet (WARNING below).

| Requirement | Scenario | Test | Result |
|-------------|----------|------|--------|
| SHELL-STATE-01 | Error recuperable con Reintentar primary | `courses-list-page.spec.ts` Reintentar `btn-primary` + `certifications-list-page.spec.ts` alert Reintentar `btn-primary` | ✅ COMPLIANT |
| SHELL-STATE-01 | Empty-total con CTA útil | courses/certs empty CTA `btn-primary`; `app-empty-state` null | ✅ COMPLIANT |
| SHELL-STATE-01 | No-results limpia filtros | courses/certs/students «Limpiar filtros» specs + HTML | ✅ COMPLIANT |
| SHELL-STATE-02 | Course-editor carga recuperable | `course-editor-page.spec.ts` > fallo recuperable → Reintentar re-llama `obtener` | ✅ COMPLIANT |
| SHELL-STATE-02 | Not-found sin Reintentar | `course-editor-page.spec.ts` > id inválido / in-memory not-found sin Reintentar | ✅ COMPLIANT |
| SHELL-STATE-02 | Acción fallida sin retry de load | `course-editor-page.spec.ts` > error de submit no activa Reintentar | ✅ COMPLIANT |
| SHELL-STATE-03 | QA oculto fuera de dev | courses/students/certs `token QA false` oculta barra | ✅ COMPLIANT |
| SHELL-STATE-03 | QA usable en dev | courses/certs/students harness Vista QA fuerza skeleton/vacío/error | ✅ COMPLIANT |
| SHELL-STATE-04 | 401 no-login redirige sin panel | `csrf.interceptor.spec.ts` > 401 API → `clearSession` + `/admin/login` + no propagate | ✅ COMPLIANT |
| SHELL-STATE-04 | Login 401 no redirige en loop | `csrf.interceptor.spec.ts` > 401 login propaga (sin latch) | ✅ COMPLIANT |

**Compliance summary**: 10/10 scenarios compliant

### Correctness (Static Evidence)

| Requirement | Status | Notes |
|------------|--------|-------|
| SHELL-STATE-01 | ✅ Implemented | courses Reintentar→`btn-primary`; certs empty→`btn-primary` (header `cta-nueva` intact) |
| SHELL-STATE-02 | ✅ Implemented | `errorRecuperable` + gated `onReintentar`; honesty messages |
| SHELL-STATE-03 | ✅ Implemented | QA tokens factory=`isDevMode`; tests inject `false` |
| SHELL-STATE-04 | ✅ Implemented | Regresión tests only; `csrf.interceptor.ts` untouched in this change |

### Coherence (Design)

| Decision | Followed? | Notes |
|----------|-----------|-------|
| Approach 1 quirúrgico / sin EmptyState | ✅ Yes | Asserts `app-empty-state` null |
| Reintentar listados = `btn-primary` | ✅ Yes | courses + certs |
| Empty certs body CTA `btn-primary`; header fuera | ✅ Yes | header `cta-nueva` preserved |
| course-editor load-only Reintentar | ✅ Yes | submit/not-found gated off |
| QA solo isDevMode + tests false | ✅ Yes | |
| 401 solo tests/spec; NEVER prod interceptor | ✅ Yes | `git diff` on `.ts` interceptor empty for this change |
| PR único ≤~400 | ✅ Yes | ~254 authored lines U5 FE+PLAN |

### Issues Found

**CRITICAL**: None

**WARNING**:
1. **Delta SHELL-STATE ausente en filesystem** — Engram/spec phase cites `openspec/changes/audit-u05-estados-error/specs/frontend-angular-shell/spec.md`, but that path does not exist; main `openspec/specs/frontend-angular-shell/spec.md` also lacks SHELL-STATE-01..04. Archive must materialize/promote the delta from Engram before merge to staging.
2. **Working tree noise** — branch also has U4 archive move + unrelated modified `openspec/specs/{admin-certificate-delivery-frontend,frontend-public-validation,frontend-angular-shell}` (A11Y leftovers vs HEAD). Scope the U5 PR carefully; do not mix unrelated diffs.

**SUGGESTION**:
1. Before `sdd-archive`, write the change-folder delta from Engram #7592, then promote into `openspec/specs/frontend-angular-shell/spec.md`.
2. Exclude `apps/frontend-angular/.tmp/` from any stage/commit.

### Verdict

**PASS WITH WARNINGS**

10/10 SHELL-STATE scenarios compliant with green focused Karma (103) + clean `tsc`; PLAN §U5 checked. Archive must still land the SHELL-STATE delta onto disk/`openspec/specs/` before the PR is fully contract-complete.

### Ready for PR?

**Conditionally yes** — implementation + tests + PLAN are ready for a single PR to `staging1.0` (~254 lines), **after**:
1. Materializing SHELL-STATE delta (archive step), and
2. Staging only U5 paths (+ archive artifacts as intended); no `.tmp/`; no accidental unrelated openspec drift.

**No commit** performed in this verify run.
