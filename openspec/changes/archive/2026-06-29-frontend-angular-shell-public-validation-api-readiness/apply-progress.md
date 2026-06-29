# Apply Progress — frontend-angular-shell-public-validation-api-readiness

## Estado general

- Change: `frontend-angular-shell-public-validation-api-readiness`
- Mode: Standard (strict_tdd: false)
- Delivery: stacked-to-main, PR 1 (Fase 1) + PR 2 (Fase 2 + Fase 3 + Fase 4) en un solo commit por squash de orquestador.
- Branch: `frontend/angular-api-readiness` (HEAD == `frontend/angular-shell-public-validation` por squash; el orquestador modela el split conceptual en este reporte).
- Batch: Ciclo completo, Fases 1–4. PR 1 = Fase 1 + Fase 2. PR 2 = Fase 3 + Fase 4 + fix batch.

## Tareas completadas

### Fase 1 — Shell y build base (PR 1, base=main)

- [x] 1.1 `ng new apps/frontend-angular --routing --style=css --ssr=false --skip-git`.
- [x] 1.2 `baseHref: "/certificados/"` en `angular.json` (production y development) y `<base href="/certificados/">` en `index.html`.
- [x] 1.3 `app.config.ts`: `provideRouter(routes, withComponentInputBinding())`. (`provideHttpClient` se agregó en Fase 3.)
- [x] 1.4 `app.routes.ts`: `''` → `validar/demo-valido`; `validar/:tokenCertificacion` carga diferida; `**` → `validar/demo-valido`.
- [x] 1.5 `app.ts` con shell semántico (`header[role=banner]`, `main#contenido[role=main]`, `footer[role=contentinfo]`, `RouterOutlet`, skip link).
- [x] 1.6 `ng build --configuration production --base-href /certificados/` sin errores ni warnings de presupuesto.

### Fase 2 — Feature pública con mocks (PR 1, slice=main)

- [x] 2.1 `shared/certificates/dto.ts`: `ApiEnvelope<T>`, `ApiErrorEnvelope`, `CertificateVerificationDto` (sin DNI/hash/pepper).
- [x] 2.2 `shared/certificates/result-mapper.ts`: `mapResponseToViewState` + `mapErrorToViewState`; colapsa 404, revocado, expirado, inexistente a `{ kind: 'not-verifiable', reason }`; 500/red/JSON inválido → `technical-error`.
- [x] 2.3 `shared/certificates/mock-tokens.ts`: `demo-valido|revocado|expirado|inexistente|error-tecnico` y `delay()` simulado. Exporta `VALID_VALID_DTO` para reuso en tests del adapter HTTP.
- [x] 2.4 `shared/certificates/validation.service.ts`: `verify(token): Promise<ValidationViewState>` con `VALIDATION_SOURCE` token (mock/HTTP).
- [x] 2.5 Tests del mapper: válido, 404 `CERTIFICATE_NOT_FOUND`, revocado, expirado, inexistente, 500, red, JSON malformado; assert `kind === 'not-verifiable'` para los cuatro primeros.
- [x] 2.6 Tests del servicio con la misma matriz.
- [x] 2.7 `features/public-validation/public-validation-page.{ts,html,css}`: `input()` de `:tokenCertificacion` + `resource()` para `idle/loading/resolved/error`.
- [x] 2.8 Tres bloques: `valid` (curso, fecha, doc enmascarado, código), `not-verifiable` (mensaje único), `technical-error` (genérico, sin stack/paths).
- [x] 2.9 Test de componente: `demo-valido` → válido; `demo-revocado|expirado|inexistente` → mismo bloque "no verificable"; `demo-error-tecnico` → error técnico.
- [x] 2.10 Accesibilidad: `aria-live="polite"`, foco visible, orden de tab coherente, contraste AA.

### Fase 3 — Adapter HTTP y selector por entorno (PR 2, base=main)

- [x] 3.1 `provideHttpClient()` en `app.config.ts`; `environments/environment{,.development}.ts` con `useMockApi`; `angular.json` `development.configuration.fileReplacements` para swap; selector `useClass: environment.useMockApi ? MockValidationSource : HttpValidationSource`.
- [x] 3.2 `shared/certificates/http-validation.source.ts`: `HttpValidationSource` con `HttpClient` + `firstValueFrom` contra `GET /certificados/api/certificados/{encodeURIComponent(token)}/verificacion`. Si el error HTTP trae `ApiErrorEnvelope`, lo conserva; si no trae envelope válido (red/body inválido), devuelve `{ ok: false, error: null }`.
- [x] 3.3 `app.config.ts` selecciona `MockValidationSource` o `HttpValidationSource` según `environment.useMockApi`. `ValidationService` y la página **no cambian** al swap.
- [x] 3.4 `http-validation.source.spec.ts` cubre `404` con `code: 'CERTIFICATE_NOT_FOUND'` → `kind === 'not-verifiable'` (no `technical-error`).
- [x] 3.5 Spec de integración con `HttpTestingController`: URL completa, método `GET`, headers por defecto, shape del envelope.
- [x] 3.6 `ng build --configuration production --base-href /certificados/` documentado en `docs/frontend/00-angular20-port-v0.md` con tamaños y endpoint.
- [x] 3.7 `index.html` bajo `/certificados/` con assets relativos correctos verificado en `dist/.../browser/index.html`.

### Fase 4 — Limpieza, auditoría y pre-archive (PR 2, slice=main)

- [x] 4.1 `grep -r material_privado_no_versionar|muestra_pagina apps/frontend-angular/` → vacío.
- [x] 4.2 Confirmar ausencia de DNI/hash/pepper/token completo/nombres de tabla en código público.
- [x] 4.3 `docs/frontend/00-angular20-port-v0.md` actualizado con estructura, env switch y endpoint HTTP.
- [x] 4.4 `docs/frontend/INDEX.md` no se modifica en este ciclo (sin entrada nueva — fuera de alcance).
- [x] 4.5 No commit/push/merge: el cierre lo ejecuta `sdd-archive` con aprobación explícita.

## Archivos cambiados

### Fase 1 (PR 1, base=main)

| Archivo | Acción | Descripción |
|---|---|---|
| `apps/frontend-angular/` (scaffold) | Creado | App Angular 20 standalone generada por CLI. |
| `apps/frontend-angular/angular.json` | Modificado | `baseHref: "/certificados/"` en `production` y `development`. |
| `apps/frontend-angular/src/index.html` | Modificado | `<base href="/certificados/">`. |
| `apps/frontend-angular/src/app/app.config.ts` | Modificado | `provideRouter(routes, withComponentInputBinding())` (sin `provideHttpClient` aún). |
| `apps/frontend-angular/src/app/app.routes.ts` | Modificado | Rutas públicas lazy + wildcard. |
| `apps/frontend-angular/src/app/app.{ts,html,css}` | Modificado | Shell semántico con skip link. |
| `apps/frontend-angular/src/app/app.spec.ts` | Modificado | 3 tests del shell. |
| `apps/frontend-angular/src/app/features/public-validation/public-validation-page.ts` | Creado | Placeholder OnPush (reemplazado en Fase 2). |

### Fase 2 (PR 1, mismo commit)

| Archivo | Acción | Descripción |
|---|---|---|
| `src/app/shared/certificates/dto.ts` | Creado | DTOs del contrato PHP: `ApiEnvelope<T>`, `ApiErrorEnvelope`, `CertificateVerificationDto`, `ValidationViewState`. Sin DNI/hash/pepper. |
| `src/app/shared/certificates/validation-source.ts` | Creado | `ValidationSource` interfaz + `VALIDATION_SOURCE` InjectionToken + `ValidationSourceResult`. |
| `src/app/shared/certificates/result-mapper.ts` | Creado | `mapResponseToViewState` + `mapErrorToViewState`. |
| `src/app/shared/certificates/mock-tokens.ts` | Creado | `MockValidationSource`, `isMockToken`, `delay()`. En fix batch se renombra `VALID_DTO` → `VALID_VALID_DTO` (export) para reuso en tests del adapter HTTP. |
| `src/app/shared/certificates/validation.service.ts` | Creado | `ValidationService.verify(token, signal)` usando `VALIDATION_SOURCE` inyectable. |
| `src/app/shared/certificates/result-mapper.spec.ts` | Creado | 10 tests del mapper. |
| `src/app/shared/certificates/validation.service.spec.ts` | Creado | 6 tests del servicio con StubSource. |
| `src/app/features/public-validation/public-validation-page.ts` | Modificado | `resource()` con `params`/`loader` async. |
| `src/app/features/public-validation/public-validation-page.html` | Creado | Tres bloques `valid` / `not-verifiable` / `technical-error` + loading. |
| `src/app/features/public-validation/public-validation-page.css` | Creado | Estilos de estado con bordes AA. |
| `src/app/features/public-validation/public-validation-page.spec.ts` | Creado | 7 tests del componente. |
| `src/app/app.config.ts` | Modificado | Proveedor `{ provide: VALIDATION_SOURCE, useClass: MockValidationSource }`. |

### Fase 3 (PR 2, mismo commit + fix batch)

| Archivo | Acción | Descripción |
|---|---|---|
| `src/app/shared/certificates/http-validation.source.ts` | Creado | `HttpValidationSource` con `HttpClient` + `firstValueFrom`. URL `/certificados/api/certificados/{encodeURIComponent(token)}/verificacion`. Error HTTP con `ApiErrorEnvelope` válido → `{ ok: false, error }`; sin envelope válido → `{ ok: false, error: null }`. |
| `src/app/shared/certificates/http-validation.source.spec.ts` | Creado | Spec del adapter: `HttpTestingController` cubre URL/método/headers, `404 CERTIFICATE_NOT_FOUND → not-verifiable`, `5xx` y `null body` → `technical-error`. |
| `src/environments/environment.ts` | Creado | Prod: `useMockApi: false`. |
| `src/environments/environment.development.ts` | Creado | Dev: `useMockApi: true`. |
| `src/app/app.config.ts` | Modificado (PR 2) | `provideHttpClient()`; import `HttpValidationSource` + `environment`; selector `useClass: environment.useMockApi ? MockValidationSource : HttpValidationSource`. |
| `apps/frontend-angular/angular.json` | Modificado (fix batch) | `development.configuration.fileReplacements` swap `environment.ts` ↔ `environment.development.ts`. |
| `src/app/shared/certificates/mock-tokens.ts` | Modificado (fix batch) | `VALID_DTO` → `VALID_VALID_DTO` (export) para reuso en tests del adapter. |

### Fase 4 (PR 2, mismo commit)

| Archivo | Acción | Descripción |
|---|---|---|
| `docs/frontend/00-angular20-port-v0.md` | Modificado | Sección "Estado de la app Angular 20" con estructura, env switch, endpoint HTTP, tamaños de bundle. |
| `openspec/changes/archive/2026-06-29-frontend-angular-shell-public-validation-api-readiness/` | Movido | proposal/explore/design/tasks/apply-progress/verify-report + 3 specs + archive-report. |
| Engram `sdd/frontend-angular-shell-public-validation-api-readiness/archive-report` | Persistido | topic_key, `capture_prompt: false`, `type: architecture`. |

## Comandos ejecutados y resultados

| Comando | Resultado |
|---|---|
| `npm test --watch=false --browsers=ChromeHeadless` (post-Fase 4) | OK — `TOTAL: 35 SUCCESS` (mapper 10, service 6, component 7, shell 3, adapter 9). |
| `npm run build -- --configuration production --base-href /certificados/` | OK — `252.98 kB` initial / `71.88 kB` transfer; lazy chunk `public-validation-page` `3.88 kB`. Sin warnings de presupuesto. |
| `npm run build -- --configuration development --base-href /certificados/` | OK — usa `fileReplacements`; env `useMockApi: true`; no se realiza HTTP real. |
| `npm start -- --configuration development --serve-path /certificados/` + Playwright | OK — `/certificados/` → `validar/demo-valido`; los cinco tokens demo renderizan los bloques correctos; `console errors: 0`. |
| `grep -r material_privado_no_versionar\|muestra_pagina apps/frontend-angular/src` | Vacío. |
| `grep -rin dni\|hash\|pepper\|12345678 apps/frontend-angular/src/app` | Solo comentarios que afirman ausencia y referencia al contrato futuro. Sin datos reales. |
| `grep -rin react\|next\.\|nextjs apps/frontend-angular/src` | Vacío. |
| `dist/.../browser/index.html` | `base href="/certificados/"`, assets relativos correctos. |
| `git show 286ddfc -- apps/frontend-angular/src/app/app.config.ts` | Confirma `provideHttpClient()` + selector por entorno en el HEAD. |

## Decisiones de implementación

- **`ValidationViewState`**: el diseño listaba `kind: 'not-verifiable' | 'not-found' | 'technical-error'`, pero el gate público de `tasks.md` colapsa 404/revocado/expirado/inexistente al mismo `not-verifiable`. Implementé la regla del gate (la más explícita y restrictiva) y registré la desviación respecto del diseño. `reason` queda como campo interno para logs; la UI no lo muestra.
- **`InjectionToken`**: `VALIDATION_SOURCE` es un `InjectionToken<ValidationSource>` (no un string) porque `inject()` exige `ProviderToken`. Habilita el swap mock→HTTP con un solo cambio de provider en `app.config.ts`, sin tocar `ValidationService` ni la UI.
- **Selector por entorno en `app.config.ts`**: `useClass: environment.useMockApi ? MockValidationSource : HttpValidationSource`. Único punto de cambio entre dev (mock) y prod (HTTP real). `ValidationService` y la página permanecen intactos.
- **`fileReplacements` en `angular.json`**: el CLI de Angular reemplaza `src/environments/environment.ts` por `environment.development.ts` en `development`. En `production` queda el archivo real (`useMockApi: false`). El selector en `app.config.ts` lee `useMockApi` del archivo resuelto.
- **`HttpClient` + `firstValueFrom` (no `httpResource`)**: `ValidationSource.fetch(): Promise<…>` se fijó en Fase 2. `httpResource()` exige reescribir `ValidationService` y la página. Se eligió `HttpClient` + `firstValueFrom` para preservar la frontera y el gate público (`404 → not-verifiable`). Aceptable per design.
- **`HttpValidationSource.fetch()`**: URL `/certificados/api/certificados/{encodeURIComponent(token)}/verificacion` (same-origin bajo cPanel; alineado a `docs/backend/01-contrato-api-certificados.md`). `toErrorEnvelope` parsea sólo el body que ya es `ApiErrorEnvelope`; cualquier otra cosa → `null` (→ `technical-error`).
- **Fix batch del endpoint**: el primer apply apuntó a `/api/...`; el fix batch alineó a `/certificados/api/...` y agregó `fileReplacements` en `angular.json`. Verificado en source actual.
- **MockValidationSource**: clase concreta con un `switch` por token. Token desconocido → `CERTIFICATE_NOT_FOUND` (no verificable), no error técnico. En fix batch se renombra `VALID_DTO` → `VALID_VALID_DTO` (export) para reuso en tests del adapter.
- **Accesibilidad**: `aria-live="polite"` + `aria-atomic="true"` en el contenedor de estado; `aria-labelledby` en el título y en el bloque válido; `dl` semántica para los datos del certificado. Contraste AA por colores de borde/fondo de los estados.

## Desviaciones del diseño

- **`ValidationViewState`**: diseño incluía `kind: 'not-found'` separado; el gate público de `tasks.md` lo colapsa a `not-verifiable`. Implementé el gate.
- **`httpResource()`**: no se usa en PR 2. `HttpClient` + `firstValueFrom` preserva la frontera y el comportamiento público. Aprobado por verify (warning no bloqueante).
- **Ruta wildcard `**`** (Fase 1): se mantiene; cubre rutas profundas refrescadas.
- **`VALIDATION_SOURCE` como InjectionToken**: el diseño menciona "frontera de servicio" pero no el mecanismo DI. Es la forma idiomática Angular 20 para el swap mock→HTTP.
- **`docs/frontend/INDEX.md`**: no se modifica en este ciclo. Queda como sugerencia para un ciclo posterior (no es requisito de las tasks 4.1–4.5).

## Tareas NO realizadas (pertenecen a otros ciclos)

- `docs/frontend/INDEX.md` (entrada nueva para la app Angular) — fuera de alcance de las tareas 4.1–4.5; sugerido en `verify-report.md` como ciclo posterior.
- Sistema visual final (Matías, F1-01/F1-02) — fuera de alcance.
- Tests de integración end-to-end con PHP real — depende de que la API esté operativa.
- `httpResource()` migration — mejora futura opcional; preserva el comportamiento actual.

## Riesgos

- **Node local**: `~/.local/bin` no es estándar del proyecto. Próximos agentes/CI deben `export PATH="$HOME/.local/bin:$PATH"`.
- **`reason` interno en `ValidationViewState`**: se conserva en el tipo para logs; la UI no lo renderiza. Si en backend se loguea, asegurarse de no filtrarlo al cliente en el envelope de error.
- **CORS / preflight**: el adapter asume same-origin (`/certificados/api/...`). API PHP futura debe servir headers CORS. Heredado de `docs/backend/01-contrato-api-certificados.md`.
- **Build budget**: 253 kB initial sigue holgado vs 500 kB warning / 1 MB error.
- **Tests de componente async**: usan `fixture.whenStable()` para esperar el loader del `resource()`. Si Angular cambia el ciclo de estabilidad, revisar.
- **PR2 sobre 800 líneas bajo conteo estricto**: las cuentas se reportan en `verify-report.md` ("Review Workload vs 800-Line Budget"). `apps/frontend-angular/src/app` solo queda en 754 líneas.

## PR Boundary

### PR 1 (Fase 1 + Fase 2)
- Inicio: app Angular 20 con shell + rutas + placeholder page (Fase 1).
- Fin: feature pública completa con DTOs, mapper, fuente mock, servicio, página con `resource()` y tres bloques accesibles.

### PR 2 (Fase 3 + Fase 4 + fix batch)
- Inicio: feature pública con mocks verde sobre Fase 1 + Fase 2.
- Fin: `HttpValidationSource` con `HttpClient` + `firstValueFrom`; selector por `environment.useMockApi`; `provideHttpClient()`; `environments/environment{,.development}.ts`; `fileReplacements` en `angular.json`; 9 tests adicionales del adapter; `docs/frontend/00-angular20-port-v0.md` actualizado; archive folder creado.
- Líneas cambiadas (estimado PR 2 — código de app + docs, ex-archive MD): ~256. Incluye archive MD: ~851. Dentro o marginal del presupuesto de 800 dependiendo de si se cuentan los reportes archivados como parte de PR 2 o como artefactos de cierre.
- Rollback: revertir `provideHttpClient`, `HttpValidationSource`, `environments/`, `fileReplacements` y el export `VALID_VALID_DTO`. `ValidationService` y la página no cambian.

## Próximo recomendado

- `sdd-archive` ya ejecutado en este cambio (este reporte es la versión de archive).
- Próximo ciclo sugerido: F1-01/F1-02 de Matías (sistema visual) o implementación operativa del PHP API consumida por `HttpValidationSource`.
