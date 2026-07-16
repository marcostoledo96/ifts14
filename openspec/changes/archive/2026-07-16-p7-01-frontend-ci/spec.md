# Spec: P7-01 Frontend CI

**Change**: `p7-01-frontend-ci`
**Phase**: P7-01
**Date**: 2026-07-16
**Status**: draft
**Depends on**: proposal `p7-01-frontend-ci`

## Delta Summary

Seis requisitos nuevos para extender el job `frontend-tests` del workflow `.github/workflows/backend-tests.yml` con los quality gates que exige P7-01: chequeo estricto de TypeScript, build de staging, detección explícita de mocks y la verificación de 3 pasos obligatoria.

---

## Added Requirements

### REQ-CI-001 — TypeScript strict check en CI

El job de CI debe ejecutar `npx tsc --noEmit -p tsconfig.app.json` y fallar ante cualquier error de tipo.

**Rationale**: `ng build` (AOT) y Karma (JIT) no detectan todos los errores de tipo. Un `HostListener` tipado como `KeyboardEvent` en lugar de `Event`, por ejemplo, compila en JIT pero rompe en AOT. `tsc --noEmit` con el `tsconfig.app.json` productivo es la única verificación que cubre este gap.

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

### REQ-CI-002 — Build de producción en CI

El job de CI debe ejecutar `npm run build` (configuración `production` por defecto) y fallar si el build no se completa.

#### Scenario: Build producción exitoso

- **Given** el código fuente Angular sin errores de compilación AOT
- **When** se ejecuta `npm run build` en el job `frontend-tests`
- **Then** el comando sale con código `0`
- **And** los artefactos se generan en el outputPath configurado

#### Scenario: Build producción falla por mock

- **Given** que `environment.ts` tiene `useRealApi: false`
- **When** se ejecuta `npm run build`
- **Then** el guarda `environment.guard.spec.ts` (corre dentro de `test:ci`) falla
- **And** el job de CI se marca como fallido

---

### REQ-CI-003 — Build de staging en CI

El job de CI debe ejecutar `npm run build -- --configuration production-staging` y fallar si el build no se completa.

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

### REQ-CI-004 — Detección explícita de mocks en CI

Un paso de CI debe verificar explícitamente que `useRealApi === true` en `src/environments/environment.ts` y fallar de forma clara si la producción usa mocks.

#### Scenario: Producción usa API real

- **Given** `environment.ts` contiene `useRealApi: true`
- **When** se ejecuta `node scripts/ci-mock-guard.mjs`
- **Then** el comando sale con código `0`

#### Scenario: Producción usa mocks

- **Given** `environment.ts` contiene `useRealApi: false`
- **When** se ejecuta `node scripts/ci-mock-guard.mjs`
- **Then** el comando sale con código `1`
- **And** se imprime un mensaje claro: `"CI ERROR: production environment uses mocks (useRealApi !== true)"`

---

### REQ-CI-005 — Suite de tests en CI

El job de CI debe ejecutar `npm run test:ci` (Karma headless + guarda de tests enfocados) y fallar si algún test no pasa.

#### Scenario: Todos los tests pasan

- **Given** los 626+ tests unitarios del frontend
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

### REQ-CI-006 — Contrato de verificación de 3 pasos

El job `frontend-tests` debe ejecutar los 3 pasos de verificación en orden y solo declararse exitoso si los 3 pasan:

1. `npm run test:ci` — tests unitarios (Karma headless)
2. `npx tsc --noEmit -p tsconfig.app.json` — TypeScript estricto
3. `npm run build` — build AOT de producción

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
- **Then** no es aceptable que solo `test:ci` pase si `tsc --noEmit` o `build` fallan
- **And** no es aceptable que solo `build` pase si `test:ci` falla
- **And** los 3 pasos deben ejecutarse en cada run de CI

---

## Non-Goals (explicit)

- ESLint no se configura en este ciclo (diferido a ciclo separado).
- No se renombra ni reestructura `.github/workflows/backend-tests.yml`.
- Las reglas de branch protection se configuran manualmente en GitHub Settings, no en código.

## Test Verification

Todos los requisitos se verifican mediante ejecución real del workflow en GitHub Actions. No hay tests unitarios adicionales porque el cambio es exclusivamente de configuración CI.
