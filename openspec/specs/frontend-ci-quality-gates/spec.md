# Spec — Frontend CI Quality Gates

## Purpose

Definir los quality gates obligatorios que el job `frontend-tests` del workflow `.github/workflows/backend-tests.yml` debe ejecutar en cada cambio frontend, para impedir que un modelo económico o un merge rápido reintroduzca errores conocidos (errores de tipo, mocks en producción, builds de staging rotos).

Este contrato se materializa con el ciclo `p7-01-frontend-ci` (2026-07-16) y queda como spec canónica del repositorio. ESLint se difiere a un ciclo posterior y no forma parte de estos requisitos.

## Requirements

### Requirement: TypeScript strict check en CI

El job de CI MUST ejecutar `npx tsc --noEmit -p tsconfig.app.json` sobre el código de `apps/frontend-angular/` y fallar el job ante cualquier error de tipo. La verificación se realiza con el `tsconfig.app.json` productivo (no el de tests), porque `ng build` (AOT) y Karma (JIT) no cubren todo el espacio de tipos (por ejemplo, un `HostListener` tipado como `KeyboardEvent` en lugar de `Event` compila en JIT pero rompe en AOT).

#### Scenario: TypeScript sin errores

- **Given** el código TypeScript del proyecto en `apps/frontend-angular/`
- **When** se ejecuta `npx tsc --noEmit -p tsconfig.app.json`
- **Then** el comando sale con código `0`
- **And** no se emite ningún error de tipo en stderr

#### Scenario: TypeScript con error de tipo

- **Given** un archivo `.ts` con un error de tipos (ej. `KeyboardEvent` donde se espera `Event`)
- **When** se ejecuta `npx tsc --noEmit -p tsconfig.app.json`
- **Then** el comando sale con código distinto de `0`
- **And** el error de tipo es visible en la salida de CI

---

### Requirement: Build de producción en CI

El job de CI MUST ejecutar `npm run build` (configuración `production` por defecto) y fallar si el build no se completa.

#### Scenario: Build producción exitoso

- **Given** el código fuente Angular sin errores de compilación AOT
- **When** se ejecuta `npm run build` en el job `frontend-tests`
- **Then** el comando sale con código `0`
- **And** los artefactos se generan en el `outputPath` configurado

#### Scenario: Build producción falla por mock

- **Given** que `environment.ts` tiene `useRealApi: false`
- **When** se ejecuta `npm run build`
- **Then** el guarda `environment.guard.spec.ts` (corre dentro de `test:ci`) falla
- **And** el job de CI se marca como fallido

---

### Requirement: Build de staging en CI

El job de CI MUST ejecutar `npm run build -- --configuration production-staging` y fallar si el build no se completa. La configuración `production-staging` debe usar `baseHref=/certificados_staging/` y estar declarada en `angular.json`.

#### Scenario: Build staging exitoso

- **Given** el código fuente Angular sin errores de compilación AOT
- **When** se ejecuta `npm run build -- --configuration production-staging`
- **Then** el comando sale con código `0`
- **And** se usa `baseHref=/certificados_staging/`

#### Scenario: Build staging falla por error de configuración

- **Given** que `angular.json` tiene una configuración `production-staging` inválida
- **When** se ejecuta `npm run build -- --configuration production-staging`
- **Then** el comando sale con código distinto de `0`
- **And** el error es visible en la salida de CI

---

### Requirement: Detección explícita de mocks en CI

Un paso de CI MUST verificar explícitamente que `useRealApi === true` en `src/environments/environment.ts` y fallar de forma clara si la producción usa mocks. La verificación se implementa con el script `apps/frontend-angular/scripts/ci-mock-guard.mjs`, que parsea `useRealApi` por regex y produce un mensaje de error identificable.

#### Scenario: Producción usa API real

- **Given** `environment.ts` contiene `useRealApi: true`
- **When** se ejecuta `node scripts/ci-mock-guard.mjs`
- **Then** el comando sale con código `0`

#### Scenario: Producción usa mocks

- **Given** `environment.ts` contiene `useRealApi: false`
- **When** se ejecuta `node scripts/ci-mock-guard.mjs`
- **Then** el comando sale con código `1`
- **And** se imprime el mensaje: `"CI ERROR: production environment uses mocks (useRealApi !== true)"`

---

### Requirement: Suite de tests en CI

El job de CI MUST ejecutar `npm run test:ci` (Karma headless + guarda de tests enfocados) y fallar si algún test no pasa. El step incluye la guarda `no-focused-tests.mjs`, que detecta `fdescribe`/`fit` antes de delegar a Karma.

#### Scenario: Todos los tests pasan

- **Given** los tests unitarios del frontend (636 al cierre de P7-01)
- **When** se ejecuta `npm run test:ci`
- **Then** Karma reporta `SUCCESS`
- **And** el comando sale con código `0`

#### Scenario: Un test falla

- **Given** un test que espera un valor incorrecto
- **When** se ejecuta `npm run test:ci`
- **Then** Karma reporta `FAILED`
- **And** el comando sale con código distinto de `0`

#### Scenario: Test enfocado (fdescribe/fit) detectado

- **Given** un archivo `.spec.ts` con `fdescribe` o `fit`
- **When** se ejecuta `npm run test:ci` (que incluye `no-focused-tests.mjs`)
- **Then** el script de guarda detecta el test enfocado
- **And** el comando sale con código distinto de `0` antes de llegar a Karma

---

### Requirement: Contrato de verificación de 3 pasos

El job `frontend-tests` MUST ejecutar los 3 pasos de verificación en orden y solo declararse exitoso si los 3 pasan:

1. `npm run test:ci` — tests unitarios (Karma headless).
2. `npx tsc --noEmit -p tsconfig.app.json` — TypeScript estricto.
3. `npm run build` — build AOT de producción.

El orden completo del job es: `npm ci → test:ci → tsc --noEmit → build prod → build staging → mock guard`. Los 3 pasos núcleo no pueden saltearse ni siquiera cuando un PR introduce cambios mínimos, y un fallo en cualquiera de ellos debe impedir el merge.

#### Scenario: Los 3 pasos pasan

- **Given** código sin errores de tipo, tests pasando y build exitoso
- **When** el job `frontend-tests` se ejecuta completo
- **Then** los 3 pasos reportan éxito
- **And** el job se marca como `success`

#### Scenario: Un paso falla — el job falla

- **Given** un error de tipo que `tsc --noEmit` detecta
- **When** el job `frontend-tests` se ejecuta
- **Then** el paso 2 (`tsc --noEmit`) falla
- **And** el job se marca como `failure`
- **And** los pasos siguientes no se ejecutan (fail-fast implícito de GitHub Actions)

#### Scenario: Verificación sin atajos

- **Given** un PR que modifica código frontend
- **When** el job `frontend-tests` se ejecuta
- **Then** MUST NOT aceptarse que solo `test:ci` pase si `tsc --noEmit` o `build` fallan
- **And** MUST NOT aceptarse que solo `build` pase si `test:ci` falla
- **And** los 3 pasos deben ejecutarse en cada run de CI

---

## Non-Goals (explicit)

- ESLint no se configura en este ciclo (diferido a ciclo separado).
- No se renombra ni reestructura `.github/workflows/backend-tests.yml`; solo se agregan pasos al job existente.
- Las reglas de branch protection se configuran manualmente en GitHub Settings, no en código.

## Notes operativas

- Branch protection con `Require status checks to pass before merging` debe configurarse manualmente en GitHub (Settings → Branches → Branch protection rules). El nombre del check en este repo es `frontend-tests` (job key del workflow).
- Los warnings de CSS budget (4 archivos: certification-pdf-preview, certification-preview, certification-revoke, student-detail) son no-bloqueantes y se difieren al ciclo de optimización de budgets.
