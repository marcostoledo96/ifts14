## Verification Report

**Change**: `frontend-angular-shell-public-validation-api-readiness`
**Scope**: Full cycle — PR1 (Fase 1 shell + Fase 2 mock validation) + PR2 (Fase 3 HTTP adapter + Fase 4 docs/archive).
**Mode**: Standard SDD verification (`strict_tdd: false`), hybrid persistence.
**Artifact store**: OpenSpec + Engram.
**Final classification**: **PASS WITH WARNINGS**. 0 CRITICAL. Spec/runtime verification passed; strict review-size accounting exceeds the 800-line budget unless generated/lock/scaffold files are handled separately.

### Completeness

| Metric | Value |
|---|---:|
| Tasks in scope | 28 (1.1–4.5) |
| Tasks marked complete in `tasks.md` | 28/28 `[x]` |
| Tasks implemented | 28/28 |
| Blocking implementation gaps | 0 |
| CRITICAL issues | 0 |

| Task group | Verification evidence | Status |
|---|---|---|
| Fase 1 shell/build (1.1–1.6) | Angular CLI scaffold under `apps/frontend-angular/`; `angular.json` has `baseHref: "/certificados/"` in `production` and `development`; `src/index.html` has `<base href="/certificados/">`; `app.config.ts` provides `provideRouter(routes, withComponentInputBinding())`; `app.routes.ts` redirects `''` and `**` to `validar/demo-valido` and lazy-loads `validar/:tokenCertificacion`; shell has skip link, `header[role=banner]`, `main#contenido`, `footer`, `RouterOutlet`. | ✅ Complete |
| Fase 2 DTO/mapper/source/service/page (2.1–2.10) | `dto.ts`, `validation-source.ts`, `result-mapper.ts`, `mock-tokens.ts`, `validation.service.ts` exist; `VALIDATION_SOURCE` is an `InjectionToken`; mock tokens cover `demo-valido|revocado|expirado|inexistente|error-tecnico`; `ValidationService.verify()` maps source results through the mapper; `PublicValidationPage` uses `input.required<string>()` for `tokenCertificacion` + `resource()` for async loading; renders public blocks for `valid` / `not-verifiable` / `technical-error`; `aria-live="polite"`, `aria-atomic="true"`. | ✅ Complete |
| Fase 3 HTTP adapter + env switch (3.1–3.7) | `provideHttpClient()` present in `app.config.ts`; `HttpValidationSource` at `shared/certificates/http-validation.source.ts` uses `HttpClient` + `firstValueFrom` against `/certificados/api/certificados/{token}/verificacion`; `environments/environment.ts` (`useMockApi: false`) + `environments/environment.development.ts` (`useMockApi: true`); `angular.json` `development.configuration.fileReplacements` swaps the env file; `app.config.ts` selector `useClass: environment.useMockApi ? MockValidationSource : HttpValidationSource` keeps `ValidationService` and the page unchanged; `http-validation.source.spec.ts` covers `404 CERTIFICATE_NOT_FOUND → not-verifiable` and `HttpTestingController` shape. | ✅ Complete |
| Fase 4 docs + audit (4.1–4.5) | `grep` confirmed no `material_privado_no_versionar` / `muestra_pagina` / React/Next references in `src/`; no full DNI / hash / pepper / real API usage; `docs/frontend/00-angular20-port-v0.md` updated with structure, env switch, HTTP endpoint and bundle sizes; `docs/frontend/INDEX.md` (no se modifica — sin entrada nueva aún, fuera de alcance de este ciclo). | ✅ Complete |

### Build & Tests Execution

| Check | Command / Evidence | Result |
|---|---|---|
| Toolchain + unit/component tests | `export PATH="$HOME/.local/bin:$PATH" && node --version && npm --version && npm test -- --watch=false --browsers=ChromeHeadless` | ✅ Node `v24.18.0`, npm `11.16.0`, `TOTAL: 35 SUCCESS` |
| Production build | `export PATH="$HOME/.local/bin:$PATH" && rtk npm run build -- --configuration production --base-href /certificados/` | ✅ Passed; `252.98 kB` initial / `71.88 kB` estimated transfer; lazy chunk `public-validation-page` `3.88 kB`; output `dist/frontend-angular` |
| Development build | `rtk npm run build -- --configuration development --base-href /certificados/` | ✅ Passed; env switch swaps `environment.development.ts` (mock) — adapter imported but no HTTP call. |
| Built index | Read `apps/frontend-angular/dist/frontend-angular/browser/index.html` | ✅ `<html lang="es-AR">`, `<title>Certificados IFTS 14</title>`, `<base href="/certificados/">`, relative asset paths |
| Runtime smoke | `npm start -- --configuration development --host 127.0.0.1 --port 4200 --serve-path /certificados/` + Playwright | ✅ `/certificados/` redirects to `/certificados/validar/demo-valido`; `demo-valido` renders valid certificate; `revocado|expirado|inexistente` render the same not-verifiable text; `error-tecnico` renders the separate safe message; browser warnings/errors: 0 |
| Coverage | Not configured in this Angular slice | ➖ Not available |
| Static audit | `grep -rin material_privado_no_versionar\|muestra_pagina\|react\|nextjs apps/frontend-angular/src` | ✅ Vacío. Comentarios solo confirman ausencia. |
| Data leakage | `grep -rin dni\|hash\|pepper\|12345678 apps/frontend-angular/src/app` | ✅ Solo comentarios que afirman ausencia y referencia al contrato futuro. Sin datos reales. |

### Spec Compliance Matrix

| Requirement | Scenario | Runtime / test evidence | Result |
|---|---|---|---|
| Shell Angular bajo `/certificados/` | Entrada al módulo público | Playwright opened `/certificados/`; app redirected to `validar/demo-valido` and rendered shell without real data. | ✅ COMPLIANT |
| Shell Angular bajo `/certificados/` | Ruta profunda refrescada | Playwright opened `/certificados/validar/demo-valido` and other deep validation URLs directly; lazy route rendered the feature page. | ✅ COMPLIANT |
| Estructura mínima y reemplazable | Layout no final | Minimal semantic shell and public validation page; no admin, final visual system, Tailwind tokens, or v0 component port. | ✅ COMPLIANT |
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
| Servicio reemplazable de validación | Cambio futuro a API PHP | `ValidationService` depends on `VALIDATION_SOURCE`; service tests inject a stub source, proving provider swap without UI rewrite; `app.config.ts` selector switches `MockValidationSource` ↔ `HttpValidationSource` per `environment.useMockApi`. | ✅ COMPLIANT |
| Mapeo seguro de errores HTTP futuros | HTTP 404 no verificable | Mapper and service tests cover `CERTIFICATE_NOT_FOUND → not-verifiable`; `http-validation.source.spec.ts` exercises `HttpTestingController` with a `404` envelope and asserts the same `not-verifiable` outcome; component and Playwright confirm public message only. | ✅ COMPLIANT |
| Mapeo seguro de errores HTTP futuros | Falla técnica | Mapper/service/component tests cover null/network/unknown errors as `technical-error`; `http-validation.source.spec.ts` covers `500` / null body / network failure; Playwright confirms safe public text. | ✅ COMPLIANT |

**Compliance summary**: 16/16 scenarios compliant with passing runtime test or browser evidence.

### Correctness (Static Evidence)

| Check | Evidence | Status |
|---|---|---|
| Tasks 1.1–4.5 implemented and marked | `tasks.md` marks all 1.1–4.5 as `[x]`; source files and tests match each task. | ✅ Correct |
| PR1 + PR2 both implemented | `provideHttpClient`, `HttpValidationSource`, `environments/*`, `fileReplacements`, `mock-tokens.ts` re-export of `VALID_VALID_DTO`, `http-validation.source.spec.ts` all present. | ✅ Correct |
| Public states only | `ValidationViewState` has `valid`, `not-verifiable`, `technical-error`; template switches only on those states plus loading. | ✅ Correct |
| Collapse rule | Mapper collapses `CERTIFICATE_NOT_FOUND`, `CERTIFICATE_REVOKED`, `CERTIFICATE_EXPIRED`, `CERTIFICATE_MISSING` to `not-verifiable`; runtime UI renders the same not-verifiable text for revoked/expired/missing/unknown. | ✅ Correct |
| Technical error separated | Null/network/unknown failures map to `technical-error`; UI renders generic technical text only. | ✅ Correct |
| HTTP adapter uses documented endpoint | `HttpValidationSource.fetch()` targets `/certificados/api/certificados/{encodeURIComponent(token)}/verificacion` — same-origin under cPanel, aligned to `docs/backend/01-contrato-api-certificados.md`. | ✅ Correct |
| Endpoint-path fix batch | First apply pointed to `/api/...`; fix batch aligned to `/certificados/api/...` and added `fileReplacements` in `angular.json`. Verified in current source. | ✅ Correct |
| No private folder / real data / React copy | Grep/glob checks found no `material_privado_no_versionar` references in app source, no JSX/TSX files, no React/Next imports, and no sensitive fields beyond negative-test comments. | ✅ Correct |

### Design Coherence

| Design decision | Followed? | Notes |
|---|---|---|
| Angular CLI 20 standalone with routing | ✅ Yes | CLI scaffold builds and tests with Angular 20. |
| `resource()` over async mock service | ✅ Yes | `PublicValidationPage` uses `resource()` from `@angular/core`. |
| Route input binding | ✅ Yes | `provideRouter(routes, withComponentInputBinding())` and `tokenCertificacion = input.required<string>()`. |
| Shell semantic, replaceable, not final UI | ✅ Yes | Minimal shell and public validation states only. |
| HTTP integration via `HttpValidationSource` (Fase 3) | ✅ Yes | `HttpClient` + `firstValueFrom` consume `GET /certificados/api/certificados/{token}/verificacion`; UI/servicio intactos. |
| Environment-based mock/HTTP switch | ✅ Yes | `environments/environment{,.development}.ts` + `fileReplacements` + selector en `app.config.ts`. |
| Design's `not-found` state | ⚠️ Intentional deviation | The design listed `not-found`; the task gate explicitly requires 404/revoked/expired/missing collapse to `not-verifiable`, so the implementation follows the stricter public gate. |
| `httpResource()` API | ⚠️ Acceptable warning | `ValidationSource.fetch(): Promise<…>` set in Fase 2 does not admit `httpResource()` without rewriting the service and page. PR2 used `HttpClient` + `firstValueFrom`, which preserves the boundary and the `not-verifiable` collapse. Approved by verify. |

### Review Workload vs 800-Line Budget

| Count scope | Added lines estimate | Budget status |
|---|---:|---|
| All untracked app + OpenSpec files including `package-lock.json` | 11,512 | ❌ Over |
| Excluding `package-lock.json` | 1,841 | ❌ Over |
| App only, excluding `package-lock.json` | 1,195 | ❌ Over |
| `apps/frontend-angular/src/app` only | 754 | ✅ Within |
| PR2 slice (HTTP + env + docs only, ex-archive) | ~256 | ✅ Within |
| PR2 slice (HTTP + env + docs + archive MD) | ~851 | ❌ Marginal over by ~50 |

**Blocking flag**: WARNING. Functionality is not blocked. PR readiness is blocked only if the 800-line budget is enforced against all added files/config/docs. If reviewers treat `package-lock.json` and Angular scaffold/config as generated/setup and focus review on `src/app`, the effective product-code slice is within budget. PR2's HTTP+env+docs slice is well within budget; only the combined PR2+archive report set approaches 800.

### Issues Found

**CRITICAL**: None.

**WARNING**:
- Review-size accounting exceeds the 800-line budget under strict all-files or app-all-files counting. Requires explicit reviewer handling: split further, exclude/generated-file review policy, or accepted exception for scaffold/lockfile.
- `httpResource()` not used: `HttpClient` + `firstValueFrom` keeps the `ValidationSource`/`ValidationService` boundary; UI/servicio intactos; comportamiento público equivalente. Acceptable per design.

**SUGGESTION**:
- If PR review must stay strictly below 800 changed lines including config/docs, split shell scaffold/config from public validation feature or keep lockfile/scaffold as a separate generated-files commit/PR.
- Add an integration spec end-to-end (Playwright stub) that exercises `HttpValidationSource` against a stubbed `HttpTestingController` flow for the future PHP API.

### Verdict

**PASS WITH WARNINGS.** Full cycle implemented: shell + mock validation (PR1) and HTTP adapter + environment switch + docs + archive (PR2). 28/28 tasks, 35/35 tests, builds prod/dev verdes, `provideHttpClient` + `HttpValidationSource` + `environments/` + `fileReplacements` presentes, sin datos privados, sin React/Next, sin DNI/hash/pepper en código público. El único riesgo abierto es el tamaño de revisión bajo conteo estricto.
