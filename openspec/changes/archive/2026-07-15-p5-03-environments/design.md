# Design: P5-03 — Environments

## Enfoque

Fix directo sin refactor. El patrón de providers por environment ya existe y funciona. Solo hay que corregir el valor por defecto y agregar una guarda de CI.

## Decisiones

| Decisión | Elección | Motivo |
|---|---|---|
| Estrategia | Fix directo (Opción 1 del explore) | Mínimo cambio, usa patrón existente |
| Guarda | Test Jasmine en `environment.guard.spec.ts` | Falla en CI sin depender de build Angular |
| Refactor providers | NO | Fuera de scope P5-03 |
| Factory centralizado | NO | YAGNI — el ternario actual es suficiente |

## Archivos a modificar

| Archivo | Cambio |
|---|---|
| `apps/frontend-angular/src/environments/environment.ts` | `useRealApi: false` → `useRealApi: true` |
| `apps/frontend-angular/src/environments/environment.guard.spec.ts` | NUEVO — test que falla si `useRealApi !== true` |

## Archivos a verificar (sin modificar)

| Archivo | Verificación |
|---|---|
| `apps/frontend-angular/src/environments/environment.development.ts` | `useRealApi: false` (correcto) |
| `apps/frontend-angular/src/environments/environment.staging.ts` | `useRealApi: true` (correcto) |
| `apps/frontend-angular/angular.json` | Config `production` sin fileReplacements incorrectos |

## Flujo

```
environment.ts (default → prod)
  └─ useRealApi: true ──→ app.config.ts usa VALIDATION_SOURCE real
                       ──→ app.routes.ts usa HTTP services reales

environment.development.ts (ng serve)
  └─ useRealApi: false ──→ app.config.ts usa MockValidationSource
                        ──→ app.routes.ts usa Mock services

environment.staging.ts (ng build --configuration production-staging)
  └─ useRealApi: true ──→ igual que prod pero apiBaseUrl: /certificados_staging/api
```

## Guarda de CI

```typescript
// environment.guard.spec.ts
import { environment } from './environment';

describe('Environment guard', () => {
  it('production environment MUST use real API', () => {
    expect(environment.useRealApi).toBeTrue();
  });
});
```

Este test importa `environment.ts` directamente. Si alguien cambia `useRealApi` a `false`, el test falla en `npm run test:ci`.

## Riesgos

- Component tests que importen `environment.ts` y mockeen basándose en `useRealApi: false` podrían romper. Si ocurre, esos tests deben usar `environment.development.ts` o mockear el token correspondiente.
