# Propuesta: P5-03 — Environments

## Intento

El archivo `apps/frontend-angular/src/environments/environment.ts` (entorno por defecto usado en build productivo) declara hoy `useRealApi: false`, lo que fuerza a todos los bundles productivos y a `ng serve` sin configuración a usar fuentes mock. Esto viola el plan vigente `docs/planificacion/IFTS14_PLAN_CORRECCIONES_PREPRODUCCION_SDD_TDD.md`, sección P5-03: `development` debe usar mocks, pero `staging` y `production` deben usar la API real, y un build productivo debe fallar si detecta mocks.

Esta propuesta corrige `environment.ts` a `useRealApi: true`, conserva `environment.development.ts` en `false`, verifica `angular.json` y agrega un test de guarda que rompe CI si el entorno productivo queda configurado con mocks.

## Alcance

### Dentro de alcance
- Cambiar `useRealApi` a `true` en `apps/frontend-angular/src/environments/environment.ts`.
- Mantener `useRealApi: false` en `apps/frontend-angular/src/environments/environment.development.ts`.
- Verificar que `environment.staging.ts` siga en `useRealApi: true`.
- Confirmar que `angular.json` no reemplace accidentalmente `environment.ts` por `environment.development.ts` en la configuración `production`.
- Agregar un test de guarda (`*.spec.ts`) que importe el entorno por defecto y falle si `useRealApi !== true`.
- Actualizar comentarios de `environment.ts` para reflejar que producción siempre usa la API real.

### Fuera de alcance
- Refactor del patrón de providers en `app.routes.ts` o `app.config.ts`.
- Cambios en la configuración de rutas.
- Nuevas implementaciones de servicios (HTTP o mock).
- Crear un runtime switch para alternar mock/API desde el navegador.
- Modificar `proxy.conf.json` o la lógica de sesión mock admin.

## Capacidades

### Nuevas capacidades
- `environment-guard`: validación automática de que el entorno productivo no usa mocks.

### Capacidades modificadas
- Ninguna a nivel de contrato de producto. Solo cambia el valor por defecto de un flag de entorno.

## Enfoque

Opción 1 del análisis de exploración: fix directo. El patrón de conmutación mock/API ya existe y funciona; no se justifica introducir una abstracción nueva.

1. Editar `environment.ts` y poner `useRealApi: true`.
2. Revisar `angular.json` para confirmar que `production` no reemplaza `environment.ts` por `environment.development.ts`.
3. Crear un spec simple (por ejemplo, `src/environments/environment.guard.spec.ts`) que importe `environment.ts` y aserte `environment.useRealApi === true`.
4. Ejecutar el test con `npm run test:ci` para confirmar RED → GREEN después del fix.

## Áreas afectadas

| Área | Impacto | Descripción |
|------|---------|-------------|
| `apps/frontend-angular/src/environments/environment.ts` | Modificado | `useRealApi` pasa a `true` para producción. |
| `apps/frontend-angular/src/environments/environment.development.ts` | Sin cambios | Sigue con `useRealApi: false` para desarrollo local. |
| `apps/frontend-angular/src/environments/environment.guard.spec.ts` | Nuevo | Test que falla si producción queda con mocks. |
| `apps/frontend-angular/angular.json` | Verificado | Confirmar que `production` no reemplaza por desarrollo. |

## Riesgos

| Riesgo | Probabilidad | Mitigación |
|--------|--------------|------------|
| Tests existentes que importen directamente `environment.ts` esperando `useRealApi: false` se rompen. | Media | Buscar specs que importen `environment.ts`; si fallan, proveer `environment.development.ts` explícito en el `TestBed` o mock del import. |
| Alguien vuelva a commitear `environment.ts` con `false` por error. | Baja | El test de guarda bloqueará CI inmediatamente. |
| Build local de demostración sin datos reales falla al exigir API. | Baja | Para demo local se usa `ng serve --configuration development`; staging/productivo usan sus propias configs. |

## Plan de rollback

1. Revertir `environment.ts` a `useRealApi: false`.
2. Eliminar o deshabilitar `environment.guard.spec.ts`.
3. Reconstruir con `ng build --configuration production` y confirmar que CI vuelve a verde.

## Dependencias

- Ninguna externa. Depende del plan `docs/planificacion/IFTS14_PLAN_CORRECCIONES_PREPRODUCCION_SDD_TDD.md` y del análisis previo `sdd/p5-03-environments/explore`.

## Criterios de aceptación

- [ ] `environment.ts` contiene `useRealApi: true` y comentarios actualizados.
- [ ] `environment.development.ts` conserva `useRealApi: false`.
- [ ] `angular.json` configura `production` sin `fileReplacements` hacia `environment.development.ts`.
- [ ] Existe un test que falla cuando `environment.ts` tiene `useRealApi: false`.
- [ ] `npm run test:ci` pasa en verde después del cambio.
- [ ] `ng build --configuration production` compila sin errores.
- [ ] No se modifica `app.routes.ts`, `app.config.ts` ni ningún servicio.
