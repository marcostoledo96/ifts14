## Verification Report

**Change**: `frontend-angular-shell-public-validation-api-readiness`  
**Scope**: Expanded PR1 — Fase 1 shell + Fase 2 public mock validation. Fase 3 HTTP adapter remains out of scope.  
**Mode**: Standard SDD verification (`strict_tdd: false`), hybrid persistence.  
**Artifact store**: OpenSpec + Engram.  
**Final classification**: WARNING — PASS WITH WARNINGS. Functional/spec verification passed; strict review-size accounting exceeds the updated 800-line budget unless generated/lock/scaffold files are handled separately.

### Completeness

| Metric | Value |
|---|---:|
| Tasks in scope | 16 |
| Tasks 1.1–2.10 marked complete in `tasks.md` | 16 |
| Tasks 1.1–2.10 implemented | 16 |
| Blocking implementation gaps | 0 |
| Fase 3 tasks implemented | 0 — expected |

| Task group | Verification evidence | Status |
|---|---|---|
| Fase 1 shell/build | Angular CLI scaffold exists under `apps/frontend-angular/`; `angular.json` has `baseHref: "/certificados/"` in production and development; `src/index.html` has `<base href="/certificados/">`; `app.config.ts` provides router with `withComponentInputBinding()`; `app.routes.ts` redirects root to `validar/demo-valido` and lazy-loads `validar/:tokenCertificacion`; shell has skip link, `header`, `main#contenido`, `footer`, `RouterOutlet`. | ✅ Complete |
| Fase 2 DTO/mapper/source/service | `dto.ts`, `validation-source.ts`, `result-mapper.ts`, `mock-tokens.ts`, `validation.service.ts` exist; `VALIDATION_SOURCE` is an `InjectionToken`; mock tokens cover valid/revoked/expired/missing/error; `ValidationService.verify()` maps source results through the mapper. | ✅ Complete |
| Fase 2 public page | `PublicValidationPage` uses `input.required<string>()` for `tokenCertificacion`, Angular `resource()` for async loading, and renders public blocks for `valid`, `not-verifiable`, and `technical-error`. | ✅ Complete |
| Fase 2 tests/accessibility | Mapper/service/component tests passed in ChromeHeadless; template includes `aria-live="polite"`, `aria-atomic="true"`, semantic heading/region/article, and no operational reason rendering. | ✅ Complete |
| Fase 3 deferred | Source search found no actual `provideHttpClient`, `HttpClient`, `httpResource`, `HttpTestingController`, `environment.useMockApi`, `HttpValidationSource`, or `http-validation` file. Matches are comments only. | ✅ Deferred as required |

### Build & Tests Execution

| Check | Command / Evidence | Result |
|---|---|---|
| Toolchain + unit/component tests | `export PATH="$HOME/.local/bin:$PATH" && node --version && npm --version && npm test -- --watch=false --browsers=ChromeHeadless` | ✅ Node `v24.18.0`, npm `11.16.0`, `TOTAL: 25 SUCCESS` |
| Production build | `export PATH="$HOME/.local/bin:$PATH" && rtk npm run build -- --configuration production --base-href /certificados/` | ✅ Passed; initial `235.29 kB` raw / `67.25 kB` estimated transfer; lazy chunk `public-validation-page` `3.88 kB`; output `dist/frontend-angular` |
| Built index | Read `apps/frontend-angular/dist/frontend-angular/browser/index.html` after build | ✅ `<html lang="es-AR">`, `<title>Certificados IFTS 14</title>`, `<base href="/certificados/">`, relative asset paths |
| Runtime smoke | `npm start -- --configuration development --host 127.0.0.1 --port 4200 --serve-path /certificados/` + Playwright | ✅ `/certificados/` redirects to `/certificados/validar/demo-valido`; `demo-valido` renders valid certificate; revoked/expired/missing/unknown render the same not-verifiable text; technical error renders the separate safe message; browser warnings/errors: 0 |
| Coverage | Not configured in this Angular slice | ➖ Not available |

### Spec Compliance Matrix

| Requirement | Scenario | Runtime / test evidence | Result |
|---|---|---|---|
| Shell Angular bajo `/certificados/` | Entrada al módulo público | Playwright opened `/certificados/` through `ng serve --serve-path /certificados/`; app redirected to `validar/demo-valido` and rendered shell without real data. | ✅ COMPLIANT |
| Shell Angular bajo `/certificados/` | Ruta profunda refrescada | Playwright opened `/certificados/validar/demo-valido` and other deep validation URLs directly; lazy route rendered the feature page. | ✅ COMPLIANT |
| Estructura mínima y reemplazable | Layout no final | Source is a minimal semantic shell and public validation page; no admin, final visual system, Tailwind setup, or v0 component port. | ✅ COMPLIANT |
| Estructura mínima y reemplazable | Accesibilidad básica | `app.spec.ts` covers landmarks and skip link; component test covers `aria-live`; runtime snapshot shows coherent banner/main/contentinfo structure. | ✅ COMPLIANT |
| Límites de seguridad y origen | Sin datos reales ni copia literal | Source searches found no private-folder access, JSX/TSX, React/Next imports, full DNI, hash, pepper, table names, or real API usage. | ✅ COMPLIANT |
| Ruta pública de validación | Certificado válido ficticio | `public-validation-page.spec.ts` verifies valid block with course/date/masked document and no token/full DNI; Playwright rendered `demo-valido` with masked document. | ✅ COMPLIANT |
| Ruta pública de validación | Certificado revocado no verificable | Component test and Playwright verify `demo-revocado` renders only `El certificado no es verificable.` and does not reveal `revocado` or error code. | ✅ COMPLIANT |
| Ruta pública de validación | Certificado no encontrado no verificable | Component test and Playwright verify `demo-inexistente`/unknown token render the same not-verifiable message and do not reveal `404` or `CERTIFICATE_NOT_FOUND`. | ✅ COMPLIANT |
| Ruta pública de validación | Error técnico distinguible | Component test and Playwright verify `demo-error-tecnico` renders `No se pudo completar la verificación. Intente nuevamente.` with no stack/path/API detail. | ✅ COMPLIANT |
| Flujo público sin credenciales ni datos adicionales | Consulta pública mínima | Route input binding supplies `tokenCertificacion`; template has no form fields, login, DNI prompt, or admin credential dependency. | ✅ COMPLIANT |
| Modelos TypeScript del DTO público | DTO válido público | `dto.ts` models `valid`, `status`, `certificateCode`, `student.documentMasked`, `course`, `verifiedAt`; mapper test covers successful envelope. | ✅ COMPLIANT |
| Modelos TypeScript del DTO público | Datos internos excluidos | DTO and source search exclude full DNI, token, hash, pepper, and table names; tests assert no full DNI/token text in valid render. | ✅ COMPLIANT |
| Servicio reemplazable de validación | Mocks ficticios durante el desbloqueo | `MockValidationSource` plus service/component tests run the mock matrix without HTTP. | ✅ COMPLIANT |
| Servicio reemplazable de validación | Cambio futuro a API PHP | `ValidationService` depends on `VALIDATION_SOURCE`; service tests inject a stub source, proving provider swap without UI rewrite. | ✅ COMPLIANT |
| Mapeo seguro de errores HTTP futuros | HTTP 404 no verificable | Mapper and service tests cover `CERTIFICATE_NOT_FOUND → not-verifiable`; component and Playwright confirm public message only. | ✅ COMPLIANT |
| Mapeo seguro de errores HTTP futuros | Falla técnica | Mapper/service/component tests cover null/network/unknown errors as `technical-error`; Playwright confirms safe public text. | ✅ COMPLIANT |

**Compliance summary**: 16/16 scenarios compliant with passing runtime test or browser evidence.

### Correctness (Static Evidence)

| Check | Evidence | Status |
|---|---|---|
| Tasks 1.1–2.10 implemented and marked | `tasks.md` marks all 1.1–2.10 as `[x]`; source files and tests match each task. | ✅ Correct |
| Fase 3 not implemented | No environment files, no HTTP adapter file, no actual `provideHttpClient`, no `HttpClient`, no `httpResource`, no real network `fetch()` usage. | ✅ Correct |
| Public states only | `ValidationViewState` has `valid`, `not-verifiable`, `technical-error`; template switches only on those states plus loading. | ✅ Correct |
| Collapse rule | Mapper collapses `CERTIFICATE_NOT_FOUND`, `CERTIFICATE_REVOKED`, `CERTIFICATE_EXPIRED`, `CERTIFICATE_MISSING` to `not-verifiable`; runtime UI renders the same not-verifiable text for revoked/expired/missing/unknown. | ✅ Correct |
| Technical error separated | Null/network/unknown failures map to `technical-error`; UI renders generic technical text only. | ✅ Correct |
| No private folder / real data / React copy | Grep/glob checks found no `material_privado_no_versionar` references in app source, no JSX/TSX files, no React/Next imports, and no sensitive fields beyond negative-test comments. | ✅ Correct |

### Design Coherence

| Design decision | Followed? | Notes |
|---|---|---|
| Angular CLI 20 standalone with routing | ✅ Yes | CLI scaffold builds and tests with Angular 20. |
| `resource()` over async mock service | ✅ Yes | `PublicValidationPage` uses `resource()` from `@angular/core`; no `HttpClient` yet. |
| Route input binding | ✅ Yes | `provideRouter(routes, withComponentInputBinding())` and `tokenCertificacion = input.required<string>()`. |
| Shell semantic, replaceable, not final UI | ✅ Yes | Minimal shell and public validation states only. |
| API/HTTP integration deferred to Fase 3 | ✅ Yes | Provider boundary exists; real HTTP adapter is absent. |
| Design's `not-found` state | ✅ Intentional deviation | The design listed `not-found`; the task gate explicitly requires 404/revoked/expired/missing collapse to `not-verifiable`, so the implementation follows the stricter public gate. |

### Review Workload vs 800-Line Budget

| Count scope | Added lines estimate | Budget status |
|---|---:|---|
| All untracked app + OpenSpec files including `package-lock.json` | 11,559 | ❌ Over |
| Excluding `package-lock.json` | 1,888 | ❌ Over |
| App only, excluding `package-lock.json` | 1,242 | ❌ Over |
| `apps/frontend-angular/src/app` only | 754 | ✅ Within |

**Blocking flag**: WARNING. Functionality is not blocked. PR readiness is blocked only if the 800-line budget is enforced against all added files/config/docs. If reviewers treat `package-lock.json` and Angular scaffold/config as generated/setup and focus review on `src/app`, the effective product-code slice is within budget.

### Issues Found

**CRITICAL**: None.

**WARNING**:
- Review-size accounting exceeds the updated 800-line budget under strict all-files or app-all-files counting. Requires explicit reviewer handling: split further, exclude/generated-file review policy, or accepted exception for scaffold/lockfile.

**SUGGESTION**:
- If PR review must stay strictly below 800 changed lines including config/docs, split shell scaffold/config from public validation feature or keep lockfile/scaffold as a separate generated-files commit/PR.

### Verdict

PASS WITH WARNINGS. Expanded PR1 (Fase 1 + Fase 2) is implemented, marked complete, covered by passing Angular tests and runtime browser smoke checks, builds for `/certificados/`, keeps Fase 3 real HTTP integration deferred, and respects the public privacy/security gate. The only open risk is review workload sizing.
