# Apply Progress — frontend-angular-shell-public-validation-api-readiness

## Estado general

- Change: `frontend-angular-shell-public-validation-api-readiness`
- Mode: Standard (strict_tdd: false)
- Delivery: stacked-to-main, PR 2 slice (Fase 1 + Fase 2)
- Branch: `frontend/angular-shell-public-validation`
- Batch: Fase 1 + Fase 2 completas (PR 2 = Fase 2 sobre la base de Fase 1)

## Tareas completadas

### Fase 1 — Shell y build base (PR 1, base=main)

- [x] 1.1 `ng new apps/frontend-angular --routing --style=css --ssr=false --skip-git`.
- [x] 1.2 Setear `baseHref: "/certificados/"` en `angular.json` (production y development) y `index.html`.
- [x] 1.3 `app.config.ts`: `provideRouter(routes, withComponentInputBinding())` (sin `provideHttpClient`).
- [x] 1.4 `app.routes.ts`: `''` → `validar/demo-valido`; `validar/:tokenCertificacion` carga diferida; `**` → `validar/demo-valido`.
- [x] 1.5 Reemplazar `app.ts` con shell semántico (`header[role=banner]`, `main#contenido[role=main]`, `footer[role=contentinfo]`, `RouterOutlet`, skip link).
- [x] 1.6 `ng build --configuration production --base-href /certificados/` sin errores ni warnings de presupuesto.

### Fase 2 — Feature pública con mocks (PR 2, base=main)

- [x] 2.1 `shared/certificates/dto.ts`: `ApiEnvelope<T>`, `ApiErrorEnvelope`, `CertificateVerificationDto` (sin DNI/hash/pepper).
- [x] 2.2 `shared/certificates/result-mapper.ts`: `mapResponseToViewState` + `mapErrorToViewState`; colapsar 404, revocado, expirado, inexistente a `{ kind: 'not-verifiable', reason }`; 500/red/JSON inválido → `technical-error`.
- [x] 2.3 `shared/certificates/mock-tokens.ts`: `demo-valido|revocado|expirado|inexistente|error-tecnico` y `delay()` simulado.
- [x] 2.4 `shared/certificates/validation.service.ts`: `verify(token): Promise<ValidationViewState>` con `VALIDATION_SOURCE` token (mock/HTTP).
- [x] 2.5 Tests del mapper: válido, 404 `CERTIFICATE_NOT_FOUND`, revocado, expirado, inexistente, 500, red, JSON malformado; assert `kind === 'not-verifiable'` para los cuatro primeros.
- [x] 2.6 Tests del servicio con la misma matriz.
- [x] 2.7 `features/public-validation/public-validation-page.{ts,html,css}`: `input()` de `:tokenCertificacion` + `resource()` para `idle/loading/resolved/error`.
- [x] 2.8 Renderizar tres bloques: `valid` (curso, fecha, doc enmascarado, código), `not-verifiable` (mensaje único), `technical-error` (genérico, sin stack/paths).
- [x] 2.9 Test de componente: `demo-valido` → válido; `demo-revocado|expirado|inexistente` → mismo bloque "no verificable"; `demo-error-tecnico` → error técnico.
- [x] 2.10 Accesibilidad: `aria-live="polite"`, foco visible, orden de tab coherente, contraste AA.

## Archivos cambiados

### Fase 1 (batch previo)

| Archivo | Acción | Descripción |
|---|---|---|
| `apps/frontend-angular/` (scaffold) | Creado | App Angular 20 standalone generada por CLI. |
| `apps/frontend-angular/angular.json` | Modificado | `baseHref: "/certificados/"` en `production` y `development`. |
| `apps/frontend-angular/src/index.html` | Modificado | `<base href="/certificados/">`. |
| `apps/frontend-angular/src/app/app.config.ts` | Modificado | `provideRouter(routes, withComponentInputBinding())`. |
| `apps/frontend-angular/src/app/app.routes.ts` | Modificado | Rutas públicas lazy + wildcard. |
| `apps/frontend-angular/src/app/app.ts` / `app.html` / `app.css` | Modificado | Shell semántico con skip link. |
| `apps/frontend-angular/src/app/app.spec.ts` | Modificado | 3 tests del shell. |
| `apps/frontend-angular/src/app/features/public-validation/public-validation-page.ts` | Creado | Placeholder OnPush (reemplazado en Fase 2). |

### Fase 2 (este batch)

| Archivo | Acción | Descripción |
|---|---|---|
| `src/app/shared/certificates/dto.ts` | Creado | DTOs del contrato PHP: `ApiEnvelope<T>`, `ApiErrorEnvelope`, `CertificateVerificationDto`, `ValidationViewState`. Sin DNI/hash/pepper. |
| `src/app/shared/certificates/validation-source.ts` | Creado | `ValidationSource` interfaz + `VALIDATION_SOURCE` InjectionToken + `ValidationSourceResult`. |
| `src/app/shared/certificates/result-mapper.ts` | Creado | `mapResponseToViewState` + `mapErrorToViewState`. Colapso público 404/revocado/expirado/inexistente → `not-verifiable`; `technical-error` separado. |
| `src/app/shared/certificates/mock-tokens.ts` | Creado | `MockValidationSource`, `isMockToken`, `delay()`. Tokens demo y matriz de respuestas. |
| `src/app/shared/certificates/validation.service.ts` | Creado | `ValidationService.verify(token, signal)` usando `VALIDATION_SOURCE` inyectable. |
| `src/app/shared/certificates/result-mapper.spec.ts` | Creado | 10 tests mapper: válido, valid:false, 404, revocado, expirado, missing, reason conservado, código desconocido, error null. |
| `src/app/shared/certificates/validation.service.spec.ts` | Creado | 6 tests servicio con StubSource: mismo mapa que el mapper. |
| `src/app/features/public-validation/public-validation-page.ts` | Modificado | `resource()` con `params`/`loader` async; `view`, `isLoading`, `hasError` computados. |
| `src/app/features/public-validation/public-validation-page.html` | Creado | Tres bloques `valid` / `not-verifiable` / `technical-error` + loading. `@switch`/`@if` nativos. |
| `src/app/features/public-validation/public-validation-page.css` | Creado | Estilos de estado (valid/not-verifiable/error/loading) con bordes de color AA. |
| `src/app/features/public-validation/public-validation-page.spec.ts` | Creado | 7 tests: demo-valido, revocado, expirado, inexistente, error-tecnico, aria-live, smoke MockValidationSource. |
| `src/app/app.config.ts` | Modificado | Proveedor `{ provide: VALIDATION_SOURCE, useClass: MockValidationSource }`. |

## Comandos ejecutados y resultados

| Comando | Resultado |
|---|---|
| `ng test --watch=false --browsers=ChromeHeadless` (post-Fase 2) | OK — 25/25 SUCCESS. |
| `ng build --configuration production --base-href /certificados/` (post-Fase 2) | OK — 235.29 kB initial / 67.25 kB transfer; lazy chunk public-validation-page 3.88 kB. Sin warnings de presupuesto. |
| `grep -r material_privado_no_versionar\|muestra_pagina apps/frontend-angular/src` | Vacío. |
| `grep -rin dni\|hash\|pepper\|12345678\|/api/certificados apps/frontend-angular/src/app` | Solo comentarios que afirman ausencia y referencia al contrato futuro en comentario del DTO. Sin datos reales. |
| `grep -rin react\|next\.\|nextjs apps/frontend-angular/src` | Vacío. |
| `dist/.../browser/index.html` | `base href="/certificados/"`, assets relativos correctos. |

## Decisiones de implementación

- **ValidationViewState**: el diseño listaba `kind: 'not-verifiable' | 'not-found' | 'technical-error'`, pero el gate público de `tasks.md` colapsa 404/revocado/expirado/inexistente al mismo `not-verifiable`. Implementé la regla del gate (la más explícita y restrictiva) y registré la desviación respecto del diseño. `reason` queda como campo interno para logs; la UI no lo muestra.
- **InjectionToken**: `VALIDATION_SOURCE` es un `InjectionToken<ValidationSource>` (no un string) porque `inject()` exige `ProviderToken`. Esto habilita el swap mock→HTTP de Fase 3 con un solo cambio de provider en `app.config.ts`, sin tocar `ValidationService` ni la UI.
- **resource() sin HttpClient**: `resource()` de `@angular/core` cubre `idle/loading/resolved/error` con un loader async que llama al servicio. No requiere `provideHttpClient` (diferido a Fase 3). `abortSignal` se propaga al servicio y a la fuente.
- **MockValidationSource**: clase concreta con un `switch` por token. El token desconocido se trata como `CERTIFICATE_NOT_FOUND` (no verificable), no como error técnico.
- **Accesibilidad**: `aria-live="polite"` + `aria-atomic="true"` en el contenedor de estado; `aria-labelledby` en el título y en el bloque válido; `dl` semántica para los datos del certificado. Foco visible heredado del shell. Contraste AA por colores de borde/fondo de los estados.

## Desviaciones del diseño

- **`ValidationViewState`**: diseño incluía `kind: 'not-found'` separado; el gate público de `tasks.md` lo colapsa a `not-verifiable`. Implementé el gate. Desviación registrada y justificada por la regla explícita del task.
- **Ruta wildcard `**`** (Fase 1): se mantiene del batch previo; no está en tasks.md pero cubre rutas profundas refrescadas.
- **`VALIDATION_SOURCE` como InjectionToken**: el diseño menciona "frontera de servicio" pero no el mecanismo DI. Es la forma idiomática Angular 20 para el swap mock→HTTP.

## Tareas NO realizadas (pertenecen a PR 3 / Fase 3-4)

### Fase 3 — Adapter HTTP y build de producción (PR 3, base=main)

- 3.1 `provideHttpClient()` con `environment.useMockApi`
- 3.2 `http-validation.source.ts`
- 3.3 Conectar `httpResource` al `ValidationService`
- 3.4 Test adapter 404
- 3.5 Test integración `HttpTestingController`
- 3.6 Build + documentar bundle en `docs/frontend/00-angular20-port-v0.md`
- 3.7 Verificar `index.html` bajo `/certificados/`

### Fase 4 — Limpieza, auditoría y pre-archive

- 4.1 `grep -r material_privado_no_versionar|muestra_pagina apps/frontend-angular/` (parcial: hecho en este batch sobre `src/`)
- 4.2 Confirmar ausencia de DNI/hash/pepper/token completo (parcial: hecho en este batch)
- 4.3 Actualizar `docs/frontend/00-angular20-port-v0.md`
- 4.4 Actualizar `docs/frontend/INDEX.md`
- 4.5 No commit/push/merge

## Riesgos

- **Node local**: `~/.local/bin` no es estándar del proyecto. Próximos agentes/CI deben `export PATH="$HOME/.local/bin:$PATH"`.
- **`reason` interno en `ValidationViewState`**: se conserva en el tipo para logs; la UI no lo renderiza. Si en Fase 3 se loguea en backend, asegurarse de no filtrarlo al cliente en el envelope de error.
- **`resource()` API**: es estable en Angular 20 (`@angular/core`). No usar `httpResource()` aún (Fase 3).
- **Build budget**: 235 kB initial sigue holgado vs 500kB warning / 1MB error.
- **Tests de componente async**: usan `fixture.whenStable()` para esperar el loader del `resource()`. Si Angular cambia el ciclo de estabilidad, revisar.

## PR Boundary (este batch — Fase 2)

- Inicio: app Angular 20 con shell + rutas + placeholder page (Fase 1 completa, sin commit).
- Fin: feature pública completa con DTOs, mapper, fuente mock, servicio, página con `resource()` y tres bloques accesibles; 25 tests verdes; build producción verde.
- Líneas cambiadas (estimado Fase 2): ~450 líneas (código + tests + estilos), dentro del presupuesto de PR 2.
- Rollback: eliminar `shared/certificates/` y reemplazar `public-validation-page.*` + revertir `app.config.ts` a la versión Fase 1.

## Próximo recomendado

- `sdd-verify` sobre Fase 2 (PR 2 slice), o
- Continuar con Fase 3 (PR 3) si el orquestador lo decide.