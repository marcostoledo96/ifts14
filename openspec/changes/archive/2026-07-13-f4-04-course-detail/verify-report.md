```yaml
schema: gentle-ai.verify-result/v1
evidence_revision: sha256:c930cbc3c613bdcd3dee42eaa8015fee6d288fdf721b808ba037a36e15fc2cab
verdict: pass
blockers: 0
critical_findings: 0
requirements: 2/2
scenarios: 9/9
test_command: npm run test:ci
test_exit_code: 0
test_output_hash: sha256:0757ca413ff0f1e4a70f77823460f6ef1390ef35764ee63fd0eae1f044d31ad3
build_command: npm run build
build_exit_code: 0
build_output_hash: sha256:0919bd40f319056fa5a5044d81de88a5a8984790f085919eb6cb8e882f249d12
```

# Verification Report

**Change**: `f4-04-course-detail`  
**Receipt**: `review-02c1aec1ff358baf`  
**Version**: N/A  
**Mode**: Standard

## Completeness

| Metric | Value |
|---|---:|
| Tasks total | 33 |
| Tasks complete after verify | 32 |
| Tasks incomplete | 1 (`6.2 sdd-archive`, intentionally pending) |
| Implementation/apply tasks | 31/31 complete |

The supplied `29/31` status was stale relative to the current task file: the two review-correction tasks are checked, and the file contains 33 checkbox items including verify and archive. Verification completed task 6.1; archive remains pending by phase order and is not a product-completeness blocker.

## Build & Tests Execution

| Check | Result | Output hash |
|---|---|---|
| Focused page | 10/10 SUCCESS, exit 0 | `sha256:0bf9260e00075be13561d7b44013a543eb32453cf08bacea90cf22ff1f8027f5` |
| Focused privacy | 8/8 SUCCESS, exit 0 | `sha256:957cc3877c3292ce74e45a8780decfb5ec15df5012dacbdd15186e08ec9cf535` |
| Focused secrets/network | 2/2 SUCCESS, exit 0 | `sha256:89b64788e00db7ed50019046dff9c0869bc66199546be915eb9223f39e274b60` |
| Full suite | 487/487 SUCCESS, exit 0 | `sha256:0757ca413ff0f1e4a70f77823460f6ef1390ef35764ee63fd0eae1f044d31ad3` |
| Build | exit 0; 314.67 kB initial / 90.39 kB transfer | `sha256:0919bd40f319056fa5a5044d81de88a5a8984790f085919eb6cb8e882f249d12` |
| Diff check | exit 0, empty output | `sha256:e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855` |

Coverage percentage is not configured. Runtime scenario coverage is established by passing focused/component, route integration, privacy, and full-suite tests.

The build retains two pre-existing certification CSS budget warnings: `certification-pdf-preview-page.css` (13.70 kB) and `certification-preview-page.css` (14.31 kB), both below the 16 kB error budget and unrelated to F4-04. No F4-04 build warning was introduced.

## Runtime Evidence

`npm run start -- --host 127.0.0.1 --port 4200` served the real Angular SPA with mock login.

| View / behavior | Observed result |
|---|---|
| Desktop 1280×800, course 4 | Exactly one live region; table visible, cards hidden; 2 rows; `8 presentes` and `7 presentes`; two `Ver` actions. |
| Route reuse/action | `Ver asistencia de la fecha 2025-09-01` navigated through the existing route to `/certificados/admin/cursos/4/fechas/41/asistencias`. Component runtime test also changed input id while an older promise remained pending and proved the stale course was discarded. |
| Mobile 390×844, course 4 | Exactly one live region; table hidden, cards displayed as grid; 2 equivalent cards with `8 presentes`/`7 presentes` and `Ver`. |
| Pending/action, course 1 | Exactly one live region; 3 cards showed `Pendiente` and `Cargar` links to existing attendance routes. |
| Unavailable seam | Focused runtime component tests passed for missing, rejected, and synchronous-throw seams: `No disponible`, no attendance link, remaining dates usable. Production intentionally has no failure toggle. |
| Privacy | Render test injected rows containing DNI-like, email, token and UUID values; only `1 presente`/`Ver` reached the DOM. |

## Spec Compliance Matrix

| Requirement | Scenario | Runtime test/evidence | Result |
|---|---|---|---|
| Rutas protegidas de cursos | Acceso con sesión mock | `app.routes.spec.ts` route-harness cases; full suite | ✅ COMPLIANT |
| Rutas protegidas de cursos | Acceso sin sesión mock | `app.routes.spec.ts` redirects for courses routes; full suite | ✅ COMPLIANT |
| Rutas protegidas de cursos | Detalle válido, inválido y reutilizado | `course-detail-page.spec.ts` stale-load/id case + route harness | ✅ COMPLIANT |
| Detalle enriquecido y seguro | Ficha informativa | Focused page test + SPA runtime | ✅ COMPLIANT |
| Detalle enriquecido y seguro | Fechas equivalentes desktop/mobile | Focused DOM test + computed-style runtime evidence | ✅ COMPLIANT |
| Detalle enriquecido y seguro | Conteo, estado y acción | Focused pending/present/cancelled test + SPA `Cargar`/`Ver` walkthrough | ✅ COMPLIANT |
| Detalle enriquecido y seguro | Seams opcionales y métricas por curso | Focused missing/reject/sync-throw tests; no certifications query | ✅ COMPLIANT |
| Detalle enriquecido y seguro | Carga, error y curso sin fechas | Focused loading/error/empty tests | ✅ COMPLIANT |
| Detalle enriquecido y seguro | Privacidad, paridad y accesibilidad | Focused privacy/secrets tests, one-live-region runtime, stored screenshots/parity notes | ✅ COMPLIANT |

**Compliance summary**: 9/9 scenarios compliant; 2/2 requirements complete.

## Correctness

| Requirement | Status | Notes |
|---|---|---|
| Optional attendance availability | ✅ Implemented | Fulfilled empty list is `Pendiente`/`Cargar`; absent/rejected/throw is `No disponible` without action. |
| Route reuse | ✅ Implemented | `effect()` plus `loadGen` prevents stale course/metric publication. |
| Existing routes only | ✅ Implemented | Editor and attendance routes are reused; no route/provider addition in F4-04. |
| Responsive equivalence | ✅ Implemented | Desktop table and mobile cards expose the same date, state, count and action. |
| Privacy/network boundary | ✅ Implemented | No HTTP/storage/secrets; attendance row details do not reach the DOM. |

## Design Coherence

| Decision | Followed? | Notes |
|---|---|---|
| Evolve `CourseDetailPage` in place | ✅ Yes | Existing page and route retained. |
| Optional `ATTENDANCE_SOURCE` with per-date isolation | ✅ Yes | `Promise.resolve().then(...)` normalizes sync throws before `allSettled`. |
| Do not infer certifications by name | ✅ Yes | `CERTIFICATIONS_SOURCE` is neither injected nor queried. |
| One polite live region | ✅ Yes | One `<output aria-live="polite" aria-atomic="true">`; no competing alert role. |
| Table/cards responsive model | ✅ Yes | Runtime computed styles prove the intended desktop/mobile switch. |

## Issues Found

**CRITICAL**: None.  
**WARNING**: Two pre-existing certification CSS budget warnings remain; neither belongs to F4-04.  
**SUGGESTION**: None required for this change.

## Canonical Verification Evidence Preimage

The following bytes are the exact preimage hashed as `evidence_revision`:

```text
receipt=review-02c1aec1ff358baf
head=b3d767524aff20fe8a1505b7fb34e78a00d06c21
tracked_diff_digest=sha256:9a9fe4354afbb837f9dd10bbd414efd78acd4fa65367b7529698c49d2387aee9
artifact_set_digest=sha256:f9cc326a38d3017f55f60130e4816068542deb71148758ee6e06e67bd6f93209
focused_page_command=npx ng test --watch=false --browsers=ChromeHeadless --include=src/app/features/admin/courses/course-detail-page.spec.ts
focused_page_exit_code=0
focused_page_output_hash=sha256:0bf9260e00075be13561d7b44013a543eb32453cf08bacea90cf22ff1f8027f5
focused_privacy_command=npx ng test --watch=false --browsers=ChromeHeadless --include=src/app/features/admin/courses/__checks__/no-real-data.spec.ts
focused_privacy_exit_code=0
focused_privacy_output_hash=sha256:957cc3877c3292ce74e45a8780decfb5ec15df5012dacbdd15186e08ec9cf535
focused_secrets_command=npx ng test --watch=false --browsers=ChromeHeadless --include=src/app/features/admin/courses/__checks__/no-secrets.spec.ts
focused_secrets_exit_code=0
focused_secrets_output_hash=sha256:89b64788e00db7ed50019046dff9c0869bc66199546be915eb9223f39e274b60
test_command=npm run test:ci
test_exit_code=0
test_output_hash=sha256:0757ca413ff0f1e4a70f77823460f6ef1390ef35764ee63fd0eae1f044d31ad3
build_command=npm run build
build_exit_code=0
build_output_hash=sha256:0919bd40f319056fa5a5044d81de88a5a8984790f085919eb6cb8e882f249d12
diff_command=git diff --check
diff_exit_code=0
diff_output_hash=sha256:e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855
runtime_server_command=npm run start -- --host 127.0.0.1 --port 4200
runtime_server_output_hash=sha256:7d702f2cc1407c97cddff8758582f8d7cb6bc5088e551a1f63961c4c6c8199e9
runtime_desktop={"route":"/certificados/admin/cursos/4","liveRegions":1,"tableDisplay":"table","cardsDisplay":"none","rows":2,"presentCounts":["8 presentes","7 presentes"],"action":"Ver","followedRoute":"/certificados/admin/cursos/4/fechas/41/asistencias"}
runtime_mobile={"route":"/certificados/admin/cursos/4","liveRegions":1,"tableDisplay":"none","cardsDisplay":"grid","cards":2,"presentCounts":["8 presentes","7 presentes"],"action":"Ver"}
runtime_pending={"route":"/certificados/admin/cursos/1","liveRegions":1,"cards":3,"state":"Pendiente","action":"Cargar"}
runtime_unavailable=focused component test covers missing, rejected and synchronous-throw seams; production has no failure toggle
warnings=two pre-existing certification CSS budget warnings; no F4-04 warning
```

## Verdict

**PASS WITH WARNINGS** — all 9 spec scenarios have current passing runtime coverage; focused, full, build, privacy, route/action and responsive evidence pass. Only unrelated pre-existing CSS budget warnings remain. Task 6.1 is complete; archive is the sole pending phase.
