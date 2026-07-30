```yaml
schema: gentle-ai.verify-result/v1
evidence_revision: sha256:83d7cfbc45afd8bf4f9a3b57541a5bbf17a2d6260806d90df084812f4044cc7c
verdict: pass
blockers: 0
critical_findings: 0
requirements: 4/4
scenarios: 7/7
test_command: npx ng test --include='**/not-found-page.spec.ts' --include='**/app.routes.spec.ts' --no-watch --browsers=ChromeHeadless --no-progress
test_exit_code: 0
test_output_hash: sha256:bb60312888b62210a3ee9bac677a216b354e551a85e264ebd53d763b11271b94
build_command: npx tsc --noEmit -p tsconfig.app.json
build_exit_code: 0
build_output_hash: sha256:ff63851439f41c4bd0169f582040e068eea30757f1f0e32317dee7f0f14672eb
```

## Verification Report

**Change**: audit-p23-not-found
**Version**: N/A (delta `frontend-angular-shell` — 4 ADDED requirements, 7 scenarios)
**Mode**: Standard
**HEAD**: `922ae59484d6960125ce0749a745028622215c10` (uncommitted P23 apply work present)
**Branch**: `audit/p23-not-found`

### Completeness

| Metric | Value |
|--------|-------|
| Tasks total (Phase 1–4 + Verify) | 14 |
| Tasks complete | 14 |
| Tasks incomplete | 0 |
| Apply tasks (Phase 1–4) | 13/13 |
| Verify task V.1 | marked complete after this run |

### Build & Tests Execution

**Build**: ✅ Passed (`tsc --noEmit -p tsconfig.app.json`, cwd `apps/frontend-angular`)

```text
exit 0
output: TypeScript: No errors found
output hash sha256:ff63851439f41c4bd0169f582040e068eea30757f1f0e32317dee7f0f14672eb
```

**Tests**: ✅ 113 passed / ❌ 0 failed / ⚠️ 0 skipped

```text
cwd: apps/frontend-angular
npx ng test --include='**/not-found-page.spec.ts' --include='**/app.routes.spec.ts' --no-watch --browsers=ChromeHeadless --no-progress
Chrome Headless 149.0.0.0 (Linux 0.0.0)
TOTAL: 113 SUCCESS
exit 0
output hash sha256:bb60312888b62210a3ee9bac677a216b354e551a85e264ebd53d763b11271b94
Note: ChromeHeadless connected without custom --no-sandbox wrapper this run.
```

**Coverage**: ➖ Not available (focused Karma run; no coverage threshold in change)

### Spec Compliance Matrix

Source: `openspec/changes/audit-p23-not-found/specs/frontend-angular-shell/spec.md` (4 requirements, 7 scenarios counted from `#### Scenario` headings).

| Requirement | Scenario | Test | Result |
|-------------|----------|------|--------|
| Wildcard público a NotFound clara | URL pública desconocida muestra NotFound | `app.routes.spec.ts` > `wildcard carga NotFoundPage…` + `wildcard público sigue capturando…` + `not-found-page.spec.ts` > `renderiza mensaje de no encontrada` | ✅ COMPLIANT |
| Wildcard público a NotFound clara | Wildcard no valida ni usa demo | `app.routes.spec.ts` > `wildcard NO redirige a demo-valido ni a validar` + `navegación real: wildcard no termina en demo-valido` + `not-found-page.spec.ts` > `no menciona validación ni tokens de demo` | ✅ COMPLIANT |
| CTA único hacia acceso administrativo | CTA a login admin | `not-found-page.spec.ts` > `ofrece un único CTA a /admin/login con etiqueta ES-AR` | ✅ COMPLIANT |
| CTA único hacia acceso administrativo | Sin CTA a validar | `not-found-page.spec.ts` > `ofrece un único CTA…` + `no menciona validación…` (no `/validar` in text/html) | ✅ COMPLIANT |
| Aislamiento de huérfanas admin | Typo admin sin sesión | `app.routes.spec.ts` > `navegación real /admin/typo sin sesión termina en /admin/login (no en NotFound)` | ✅ COMPLIANT |
| Aislamiento de huérfanas admin | Typo admin con sesión | `app.routes.spec.ts` > `navegación real /admin/typo con sesión termina en /admin/dashboard` | ✅ COMPLIANT |
| Honesty de NotFound sin filtración | Copy fijo sin stack ni secretos | `not-found-page.spec.ts` > `no menciona validación ni tokens de demo` (no Error/token/DNI/stack/`demo-valido`) | ✅ COMPLIANT |

**Compliance summary**: 7/7 scenarios compliant

### Correctness (Static Evidence)

| Requirement | Status | Notes |
|------------|--------|-------|
| Wildcard público → NotFound | ✅ Implemented | `path: '**'` → `NotFoundPage`; `title: 'Página no encontrada — IFTS 14'`; ES-AR h1/body |
| CTA único → `/admin/login` | ✅ Implemented | Single `RouterLink` «Ir al acceso administrativo»; no `UiBackLink` |
| Aislamiento huérfanas admin | ✅ Implemented | `path: 'admin', pathMatch: 'prefix'` → `/admin/dashboard` before `**`; no AdminNotFound |
| Honesty sin filtración | ✅ Implemented | Fixed copy only; specs assert no stack/token/DNI/demo/`/validar` |

### Coherence (Design)

| Decision | Followed? | Notes |
|----------|-----------|-------|
| Polish only (no AdminNotFound) | ✅ Yes | Catch-all kept; no new admin 404 page |
| Single RouterLink → `/admin/login` | ✅ Yes | HTML + CTA test |
| Split `templateUrl`/`styleUrl` | ✅ Yes | `not-found-page.{html,css,ts}` |
| Title on `**` only | ✅ Yes | No catch-all reorder |
| Shell ADDED only (no main merge) | ✅ Yes | Delta under change; main specs merge deferred to archive |
| Leave P22 / validation / backend | ✅ Yes | No touch to validation/backend/`UiBackLink` |
| No commit | ✅ Yes | Verify writes report only |

### Issues Found

**CRITICAL**: None

**WARNING**: None

**SUGGESTION**:
- Engram `sdd/audit-p23-not-found/spec` preview said «8 scenarios»; delta file has **7** `#### Scenario` blocks — treat 7 as authoritative at archive.
- PLAN still says «verify pendiente» / «en curso» — refresh wording at archive.

### Verdict

**PASS**

All 4 requirements / 7 scenarios compliant with runtime evidence; `tsc` exit 0; focused `ng test` 113 SUCCESS; design locks held; V.1 complete. Next: `sdd-archive`.
