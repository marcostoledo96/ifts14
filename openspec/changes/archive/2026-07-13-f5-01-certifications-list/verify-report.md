```yaml
schema: gentle-ai.verify-result/v1
evidence_revision: sha256:6552a6ef73a6fd19a8d13925bd8c2c4327830ea9277f497b05125a2400435711
verdict: pass
blockers: 0
critical_findings: 0
requirements: 2/2
scenarios: 8/8
test_command: npm run test:ci
test_exit_code: 0
test_output_hash: sha256:302cfea05ed5c4f6566d64d937363a17c929d3ab175e7fdaec13d04455757d47
build_command: npm run build
build_exit_code: 0
build_output_hash: sha256:8740da965a1a08af14128783c6b03676609882f37d53c55e5f39517283005ff9
```

## Verification Report

**Change**: f5-01-certifications-list  
**Receipt**: review-ec94f4e582546bed  
**Version**: N/A  
**Mode**: Standard (`strict_tdd: false`)

### Completeness

| Metric | Value |
|---|---:|
| Tasks total | 30 |
| Tasks complete | 27 |
| Tasks incomplete | 3 (archive only) |
| Implementation and verify tasks | 27/27 |

Las tareas 7.1 y 7.2 quedaron completas. Las tareas 8.1–8.3 permanecen pendientes para `sdd-archive`, según la instrucción de esta ejecución.

### Build & Tests Execution

**Focused tests**: ✅ 160/160

```text
npm test -- --watch=false --browsers=ChromeHeadless --include='**/certifications.service.spec.ts' --include='**/certifications-list-page.spec.ts' --include='**/app.routes.spec.ts' --include='**/no-real-data.spec.ts' --include='**/no-secrets.spec.ts'
Exit: 0
Output: sha256:c4f586c2f52643895c53b6ca5cbb8f0673a34d6923903b84c7813fc44bdf50b2
```

**Full tests**: ✅ 498/498

```text
npm run test:ci
Exit: 0
Output: sha256:302cfea05ed5c4f6566d64d937363a17c929d3ab175e7fdaec13d04455757d47
```

**Build**: ✅ Passed

```text
npm run build
Exit: 0
Output: sha256:8740da965a1a08af14128783c6b03676609882f37d53c55e5f39517283005ff9
Warnings preexistentes: budgets CSS de preview y PDF.
```

**Coverage**: ➖ No configurada.

### Runtime Evidence

Evidencia reproducible adicional: [QA runtime de red y privacidad](evidence/network-privacy-check.md).

Playwright sobre `http://127.0.0.1:4200/certificados/admin/certificaciones`, con sesión mock y viewports 1280×800 / 390×844:

- ✅ Estado inicial: `Total: 6 · Coincidencias: 6 · Visibles: 5`; tabla desktop con cinco filas.
- ✅ Página 2: una fila, página actual 2 y botón siguiente deshabilitado.
- ✅ El filtro de curso independiente se combinó con validez `vigente`, entrega `Entregado` y búsqueda `Uno`: una coincidencia, una visible, id 1 y página reiniciada a 1.
- ✅ Limpiar filtros restauró 6/6/5 y página 1. El clamp está implementado en `onPagina()`/`paginaSegura()`; el escenario normativo queda cubierto también por el reset ejecutado.
- ✅ Harness QA: carga con cinco skeletons, error con reintento, vacío total y sin coincidencias 6/0/0.
- ✅ Desktop: tabla visible, cards ocultas, `caption`, siete `th[scope=col]`, selector de siete opciones y resumen `aria-live`.
- ✅ Mobile 390×844: tabla oculta, cinco cards con `dl`, conteo 6/6/5.
- ✅ Navegación real desde cards a `/certificados/admin/certificaciones/1` y `/certificados/admin/certificaciones/1/pdf`.
- ✅ Privacidad: sin DNI completo, email, UUID ni prefijo de token visibles; 1 navegación `document` local permitida y 0 requests de datos/API mediante `fetch`, XHR o paths `/api/`.
- ✅ Consola: 0 errores y 0 warnings durante el flujo enfocado.
- ✅ Paridad: se revisaron las seis capturas vigentes contra la composición de `muestra_pagina/components/admin/lista-certificaciones.tsx`; conservan jerarquía editorial, filtros, tabla/cards, paginación y estados, adaptados a Angular sin portar React/Tailwind.

### Spec Compliance Matrix

| Requirement | Scenario | Test / runtime evidence | Result |
|---|---|---|---|
| Listado mock-only con datos seguros | Listado filtrado por estado | `certifications.service.spec.ts` estados; focused/full | ✅ COMPLIANT |
| Listado mock-only con datos seguros | Frontera de datos segura | `no-real-data.spec.ts`; DOM runtime | ✅ COMPLIANT |
| Listado mock-only con datos seguros | Filtros y búsqueda combinables | tests de servicio/página; curso + validez + entrega + búsqueda runtime | ✅ COMPLIANT |
| Listado mock-only con datos seguros | Paginación y cambio de resultados | test de página; página 2 → filtro → página 1 runtime | ✅ COMPLIANT |
| Listado mock-only con datos seguros | Navegación conservada desde ambas vistas | test de links; navegación mobile real a detalle/PDF | ✅ COMPLIANT |
| Listado mock-only con datos seguros | Estados no exitosos y vacíos | test de harness; cuatro estados runtime | ✅ COMPLIANT |
| Harness y evidencia verificable | QA de estados y responsive | test de tabla/cards/QA; desktop/mobile runtime y capturas | ✅ COMPLIANT |
| Harness y evidencia verificable | QA de privacidad mock-only | checks negativos; runtime sin datos prohibidos ni requests de datos/API | ✅ COMPLIANT |

**Compliance summary**: 8/8 escenarios compliant; 2/2 requisitos completos.

### Correctness (Static Evidence)

| Requirement | Status | Notes |
|---|---|---|
| Listado mock-only con datos seguros | ✅ Implementado | Seed completo cargado una vez; filtros locales por curso/validez/entrega/búsqueda; conteos global/coincidencias/visibles y paginación de cinco. |
| Harness y evidencia verificable | ✅ Implementado | QA local no persistente, vistas responsive, semántica accesible, privacidad y ausencia de red. |

### Coherence (Design)

| Decision | Followed? | Notes |
|---|---|---|
| Evolución in-place y rutas conservadas | ✅ Sí | No se alteraron rutas; detalle y PDF funcionan. |
| Carga completa + signals/computed locales | ✅ Sí | Una carga del seed alimenta filtros, conteos y paginación. |
| Reset/clamp de página | ✅ Sí | Todos los cambios de filtro reinician; `onPagina()` y `paginaSegura()` acotan. |
| QA local no persistente | ✅ Sí | Sin URL, storage, cookies ni requests de datos/API; navegación `document` local y assets SPA permitidos. |
| Tabla desktop y cards mobile compartiendo datos | ✅ Sí | Verificado en ambos viewports y en tests. |
| Paridad v0 sin portar React/Tailwind | ✅ Sí | Capturas vigentes y código Angular propio. |

### Issues Found

**CRITICAL**: None.  
**WARNING**: El build conserva los warnings preexistentes de budget CSS en las vistas preview y PDF, fuera del alcance de F5-01.  
**SUGGESTION**: None.

### Verdict

**PASS**

Los dos blockers del reporte anterior quedaron corregidos y probados en ejecución. Corresponde avanzar a `sdd-archive`; no se archivó en esta fase.
