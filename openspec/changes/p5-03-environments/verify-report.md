# Verify Report: P5-03 — Environments

```yaml
schema: gentle-ai.verify-result/v1
verdict: pass
blockers: 0
warnings: 0
```

## Requirements Verification

| REQ | Descripción | Estado | Evidencia |
|---|---|---|---|
| REQ-ENV-001 | Producción usa API real | ✅ PASS | `environment.ts`: `useRealApi: true` |
| REQ-ENV-002 | Desarrollo usa mocks | ✅ PASS | `environment.development.ts`: `useRealApi: false` |
| REQ-ENV-003 | Staging usa API real | ✅ PASS | `environment.staging.ts`: `useRealApi: true` |
| REQ-ENV-004 | Guarda de build en CI | ✅ PASS | `environment.guard.spec.ts` creado, 597/597 tests |
| REQ-ENV-005 | Staging conserva apiBaseUrl | ✅ PASS | `environment.staging.ts`: `/certificados_staging/api` |
| REQ-ENV-006 | angular.json sin reemplazos incorrectos | ✅ PASS | `production` config sin fileReplacements |

## Test Results

```
TOTAL: 597 SUCCESS
```

Comando: `npm run test:ci` (ChromeHeadless)

## Files Changed

| Archivo | Cambio |
|---|---|
| `apps/frontend-angular/src/environments/environment.ts` | `useRealApi: false → true` |
| `apps/frontend-angular/src/environments/environment.guard.spec.ts` | Nuevo: CI guard test |
| `apps/frontend-angular/src/app/app.config.spec.ts` | Test actualizado: `useRealApi: true` |
| `apps/frontend-angular/src/app/app.routes.spec.ts` | `setupHarnessWithSession`: InMemory providers |

## Environment Matrix

| Entorno | `useRealApi` | `apiBaseUrl` | Comando |
|---|---|---|---|
| Production | `true` | `/certificados/api` | `ng build` |
| Staging | `true` | `/certificados_staging/api` | `ng build --configuration production-staging` |
| Development | `false` | `/certificados/api` | `ng serve` |

## Risks

- Sin riesgos de seguridad ni regresión.
- Test de guarda (`environment.guard.spec.ts`) fallará en CI si alguien revierte `useRealApi` a `false`.
