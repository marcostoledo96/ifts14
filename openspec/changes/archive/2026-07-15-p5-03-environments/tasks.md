# Tasks: P5-03 — Environments

**Review Workload Forecast**: ~10 líneas cambiadas, 2 archivos. Bajo riesgo. PR única sin revisión de carga.

## Tasks

### T1: Corregir environment.ts (CRITICAL)
- Archivo: `apps/frontend-angular/src/environments/environment.ts`
- Cambio: `useRealApi: false` → `useRealApi: true`
- Verificación: `grep "useRealApi" apps/frontend-angular/src/environments/environment.ts`

### T2: Crear guarda de CI (CRITICAL)
- Archivo: `apps/frontend-angular/src/environments/environment.guard.spec.ts` (NUEVO)
- Test Jasmine que importa `environment` y espera `useRealApi === true`
- Verificación: `npm run test:ci` debe pasar este test

### T3: Verificar environment.development.ts
- Archivo: `apps/frontend-angular/src/environments/environment.development.ts`
- Sin cambios — confirmar `useRealApi: false`

### T4: Verificar environment.staging.ts
- Archivo: `apps/frontend-angular/src/environments/environment.staging.ts`
- Sin cambios — confirmar `useRealApi: true`, `apiBaseUrl: '/certificados_staging/api'`

### T5: Verificar angular.json
- Archivo: `apps/frontend-angular/angular.json`
- Sin cambios — confirmar que `production` no tiene fileReplacements que apunten a `environment.development.ts`

### T6: Ejecutar tests de regresión
- Comando: `npm run test:ci` (en `apps/frontend-angular/`)
- Todos los tests existentes deben pasar

## Dependencias
T1 y T2 son independientes. T3-T5 son verificaciones. T6 depende de T1+T2.

## Estimación
~10 líneas nuevas/cambiadas. PR única.
