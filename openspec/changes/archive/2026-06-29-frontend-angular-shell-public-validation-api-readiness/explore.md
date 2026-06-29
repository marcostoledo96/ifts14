## Exploración: frontend-angular-shell-public-validation-api-readiness

### Estado actual

- `apps/frontend-angular/` solo contiene `AGENTS.md`; no hay scaffold Angular todavía.
- El backend PHP tiene contrato estable (`docs/backend/01-contrato-api-certificados.md`) y endpoints de validación pública, emisión y revocación implementados.
- El modelo MariaDB está documentado en `docs/database/01-modelo-datos-certificados.md` y alineado con el seed ficticio.
- `muestra_pagina/` tiene 7 pantallas v0 (prompts 4-10), incluyendo validación pública y estados no exitosos, pero es solo referencia visual; no se copia código React/Next.
- Matías es responsable del diseño visual final, sistema visual, admin y QA; Marcos puede desbloquear la base técnica Angular, la validación pública con mocks y la frontera con la API.
- Tailwind aparece en la referencia v0 (v4) y en documentación de planificación, pero aún no hay un `DESIGN-SYSTEM.md` aprobado para Angular.

### Áreas afectadas

- `apps/frontend-angular/` — se creará el scaffold de Angular 20.
- `apps/frontend-angular/src/app/` — estructura por features: `shell`, `public-validation`, `api-readiness`.
- `docs/frontend/00-angular20-port-v0.md` — se sincronizará durante `sdd-archive` con el avance técnico.
- `docs/backend/01-contrato-api-certificados.md` — fuente de verdad para los modelos TypeScript.
- `openspec/changes/frontend-angular-shell-public-validation-api-readiness/` — artefactos SDD del ciclo.
- `muestra_pagina/` — solo lectura de referencia; no se modifica.

### Enfoques

1. **Scaffold Angular 20 standalone + routing + signals + `httpResource()`**
   - Descripción: crear la app con `ng new` en modo standalone con routing; organizar por features; componentes con `input()`, `output()` y `ChangeDetectionStrategy.OnPush`; usar `httpResource()` para la carga de datos y `withComponentInputBinding()` para leer el token de ruta como señal.
   - Pros: alineado con Angular 20, menos boilerplate, reactividad nativa, patrón idéntico al que se usará con la API real.
   - Contras: genera muchos archivos iniciales; un solo PR puede superar el presupuesto de 400 líneas.
   - Esfuerzo: Medio.

2. **Scaffold manual mínimo sin Angular CLI**
   - Descripción: escribir `package.json`, `angular.json`, `tsconfig` y entry points a mano.
   - Pros: control total sobre los archivos generados.
   - Contras: alto mantenimiento, propenso a errores de configuración, no aprovecha la estandarización del equipo.
   - Esfuerzo: Alto.

3. **Servicio mock síncrono vs. `httpResource()` con retardo simulado**
   - Descripción: opción A, un servicio que devuelve datos ficticios de inmediato; opción B, un mock que devuelve una `Promise` con retardo para simular red.
   - Pros de A: simple, no requiere manejar estados de carga. Pros de B: ejercita los estados `loading`, `error` y `resolved` con el mismo patrón que la API real.
   - Contras de A: no valida la UI de estados asíncronos; contras de B: un poco más de código, pero reusable.
   - Esfuerzo: Bajo / Medio.

### Recomendación

- Usar el **enfoque 1** (Angular CLI standalone + signals + `httpResource()`) porque es el estándar del proyecto y minimiza la deuda técnica.
- Para los mocks, usar la **opción B** (`httpResource()` con mock async) para validar los estados `loading`, `error` y `resolved` desde el inicio.
- **Tailwind**: dado que la referencia v0 ya lo usa y la planificación lo contempla, instalar Tailwind CSS en el scaffold como habilitador técnico, pero sin aplicar tokens finales ni componentes visuales; Matías define el sistema visual definitivo.
- Dividir la implementación en **tres unidades revisables** para respetar el presupuesto de 400 líneas:
  1. `frontend/angular-shell`: scaffold, routing, layout semántico mínimo.
  2. `frontend/public-validation-flow`: ruta `/validar/:token`, componente de estados, servicio mock.
  3. `frontend/api-readiness`: modelos TypeScript, servicio mock con frontera hacia el backend PHP, build con `base-href /certificados/`.

### Riesgos

- El scaffold generado por CLI puede exceder el presupuesto de 400 líneas si no se divide en PRs encadenados.
- Tailwind no está formalizado en un `DESIGN-SYSTEM.md`; instalarlo ahora puede requerir ajustes cuando Matías defina tokens.
- Riesgo de copiar accidentalmente código de `muestra_pagina/` (Next.js/shadcn) en lugar de portar la intención visual.
- El contrato backend ya mapea `404` como "certificado no verificable"; hay que evitar mostrarlo como error técnico genérico en la UI.

### Listo para propuesta

Sí. Se recomienda avanzar a `sdd-propose` con el alcance dividido en tres unidades revisables y con la decisión de Tailwind como punto a confirmar con Matías.
