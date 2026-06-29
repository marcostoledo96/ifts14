# Tasks: Shell Angular y preparación de validación pública

## Review Workload Forecast

| Estimadas | 700–1000 |
| Riesgo 400 | Alto |
| Encadenados | Sí |
| División | shell · feature mock · adapter HTTP |
| Entrega / Chain | auto-chain / stacked-to-main |

Decision needed before apply: No
Chained PRs recommended: Yes
Chain strategy: stacked-to-main
400-line budget risk: High

**Regla pública (gate):** `404 CERTIFICATE_NOT_FOUND`, revocado, expirado e
inexistente → mismo bloque "no verificable". Mapper conserva `reason` interno
sólo para logs; UI sólo conoce `kind: 'not-verifiable'`. `technical-error`
queda separado.

## Fase 1 — Shell y build base (PR 1, base=main)

- [x] 1.1 `ng new apps/frontend-angular --routing --style=css --ssr=false --skip-git`.
- [x] 1.2 Setear `baseHref: "/certificados/"` en `angular.json` (production y development).
- [x] 1.3 `app.config.ts`: `provideRouter(routes, withComponentInputBinding())` (sin `provideHttpClient`).
- [x] 1.4 `app.routes.ts`: `''` → `validar/demo-valido`; `validar/:tokenCertificacion` carga diferida.
- [x] 1.5 Reemplazar `app.ts` con shell semántico (`header`, `main#contenido`, `footer`, `RouterOutlet`, `skipLink`).
- [x] 1.6 `ng build --configuration production --base-href /certificados/` sin errores ni warnings de presupuesto.

## Fase 2 — Feature pública con mocks (PR 2, base=main)

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

## Fase 3 — Adapter HTTP y build de producción (PR 3, base=main)

- [x] 3.1 `provideHttpClient()` en `app.config.ts` con `environment.useMockApi`.
- [x] 3.2 `shared/certificates/http-validation.source.ts`: `httpResource<ApiEnvelope<CertificateVerificationDto>>` a `/api/certificados/{token}/verificacion`.
- [x] 3.3 Conectar `httpResource` al `ValidationService` cuando `!useMockApi`, pasando por el mismo mapper (cero ramas nuevas en UI).
- [x] 3.4 Test del adapter: `404` con `code: 'CERTIFICATE_NOT_FOUND'` → `kind === 'not-verifiable'`, no `technical-error`.
- [x] 3.5 Test de integración con `HttpTestingController`: URL, método, headers, shape.
- [x] 3.6 `ng build --configuration production --base-href /certificados/`; documentar bundle en `docs/frontend/00-angular20-port-v0.md`.
- [x] 3.7 Verificar que `index.html` resuelva bajo `/certificados/` con assets relativos correctos.

## Fase 4 — Limpieza, auditoría y pre-archive

- [x] 4.1 `grep -r material_privado_no_versionar|muestra_pagina apps/frontend-angular/` → vacío.
- [x] 4.2 Confirmar ausencia de DNI, hash, pepper, token completo o nombres de tabla en código público.
- [x] 4.3 Actualizar `docs/frontend/00-angular20-port-v0.md` con estructura, límites de UI final y comandos.
- [x] 4.4 Actualizar `docs/frontend/INDEX.md` si existe, referenciando la nueva app.
- [x] 4.5 No commit/push/merge: el cierre lo ejecuta `sdd-archive` con aprobación explícita.
