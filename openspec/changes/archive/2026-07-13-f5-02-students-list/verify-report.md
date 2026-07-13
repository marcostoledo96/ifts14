```yaml
schema: gentle-ai.verify-result/v1
evidence_revision: sha256:e17496def6b90d0e780e8c83aef6d36a00cf3c711843d6d57c19b555782f0db2
verdict: pass
blockers: 0
critical_findings: 0
requirements: 6/6
scenarios: 14/14
test_command: npm run test:ci
test_exit_code: 0
test_output_hash: sha256:ad1e28b8f6f4856837f69eab3bce66058bb03d94dfe7645a2fbe76ba918839ae
build_command: npm run build
build_exit_code: 0
build_output_hash: sha256:9df3b5a6d5787b848937b2a89d701c0ea806c9ec920c64b0e54458c519e581b7
```

## Verification Report

**Change**: `f5-02-students-list`  
**Version**: N/A  
**Mode**: Standard (`strict_tdd: false`)  
**Review authority**: `review-d7bd1f6336540418`; `gentle-ai review validate --gate post-apply` permitió el candidate tree `6fabfab5aba20804234a03c00899f4063c9cec80` con store revision `sha256:736d7e2c23bd276feb4d1db16ae06b4f6b5f14f638781a6b6bb88fa64dffbdf0`.

### Completeness

| Métrica | Valor |
|---|---:|
| Tareas totales | 36 |
| Tareas completas tras archive | 36/36 |
| Tareas pendientes | 0 |

Al ejecutar este verify había 35/36 tareas completas y sólo restaba `7.2 sdd-archive`. El archive se completó el 2026-07-13 y la contabilidad final quedó en 36/36.

### Build y tests ejecutados

| Check | Resultado | Evidencia |
|---|---|---|
| Preflight de autoridad | ✅ Permitido | `gentle-ai review validate --cwd "/home/marcos/Escritorio/ifts14" --lineage review-d7bd1f6336540418 --gate post-apply`; exit 0 |
| Focused F5-02 | ✅ 170/170 SUCCESS | `npm test -- --watch=false --browsers=ChromeHeadless --include="**/students.service.spec.ts" --include="**/students-list-page.spec.ts" --include="**/app.routes.spec.ts" --include="**/sidebar-admin.spec.ts" --include="**/admin-dashboard-page.spec.ts" --include="**/no-real-data.spec.ts" --include="**/no-secrets.spec.ts"`; exit 0; `sha256:d0de19d50290f441758ace2c3f7cdc08cccfc9bbbfce81cd1b4f8af5590a2f3f` |
| Suite completa | ✅ 521/521 SUCCESS | `npm run test:ci`; exit 0; hash del envelope |
| Build producción | ✅ Passed | `npm run build`; exit 0; hash del envelope |
| Diff | ✅ Passed | `git diff --check`; exit 0 |
| Dependencias/config visual | ✅ Sin cambios | `git diff --exit-code -- apps/frontend-angular/package.json apps/frontend-angular/package-lock.json apps/frontend-angular/angular.json`; exit 0 |

**Coverage**: ➖ no configurada; la cobertura se prueba por trazabilidad de escenarios y ejecución runtime.

El build conserva dos warnings de budget CSS preexistentes en `certification-preview-page.css` y `certification-pdf-preview-page.css`; F5-02 no modifica esos archivos.

### Evidencia runtime clave actual

Se ejecutó el frontend local y se recorrió login mock → dashboard → `/admin/alumnos`.

| Control | Resultado |
|---|---|
| Búsqueda controlada | Al escribir `Siete`, el resumen cambió a `Mostrando 1 de 1` y apareció el registro esperado. |
| Limpiar filtros | El searchbox quedó con `value=""`, desapareció el botón condicional, el resumen volvió a `Mostrando 5 de 7` y la paginación a `Página 1 de 2`. |
| Desktop | Cinco filas visibles después de limpiar. |
| Mobile 390×844 | Tabla sin caja visible (`0×0`), tarjetas visibles y cinco cards. |
| Red | 0 requests no estáticas para `api|fetch|xhr`. |
| Consola | 0 errores y 0 warnings. |

La evidencia persistida de fase 6 sigue cubriendo los demás estados, producción sin QA, privacidad y paridad visual.

### Matriz de cumplimiento de specs

| Requirement | Scenario | Test/evidencia ejecutada | Resultado |
|---|---|---|---|
| Rutas administrativas aisladas | Navegación admin básica | `app.routes.spec.ts` — redirects, guard, route injector y `/admin/alumnos` | ✅ COMPLIANT |
| Rutas administrativas aisladas | Rutas públicas preservadas | `app.routes.spec.ts` — raíz, validar y wildcard público | ✅ COMPLIANT |
| Login y shell simulados | Mensaje visible de simulación | Suite completa y runtime login | ✅ COMPLIANT |
| Login y shell simulados | Dashboard con Alumnos navegable | `admin-dashboard-page.spec.ts` y runtime dashboard | ✅ COMPLIANT |
| Shell accesible/responsive | Navegación accesible | `sidebar-admin.spec.ts`, suite completa y runtime desktop/mobile | ✅ COMPLIANT |
| Shell accesible/responsive | Sin dependencias visuales nuevas | Check Git de package/lock/angular, build y paridad persistida | ✅ COMPLIANT |
| Fuente privada | DTO y seed seguros | `students.service.spec.ts`, `no-real-data.spec.ts` | ✅ COMPLIANT |
| Fuente privada | Sin red | `no-secrets.spec.ts` y network runtime actual | ✅ COMPLIANT |
| Búsqueda y filtros privados | Búsqueda y filtro de contacto seguro | `students-list-page.spec.ts` y runtime de búsqueda actual | ✅ COMPLIANT |
| Búsqueda y filtros privados | Entrada de búsqueda prohibida | `students-list-page.spec.ts` | ✅ COMPLIANT |
| Búsqueda y filtros privados | Filtros y paginación | `students-list-page.spec.ts`; runtime actual confirmó reset visual, cinco resultados y página 1 | ✅ COMPLIANT |
| Búsqueda y filtros privados | Vistas accesibles | `students-list-page.spec.ts` y runtime desktop/mobile actual | ✅ COMPLIANT |
| Estados y QA | Estados distinguibles | `students-list-page.spec.ts` y evidencia persistida de cuatro estados | ✅ COMPLIANT |
| Estados y QA | QA y detalle diferido | `students-list-page.spec.ts`, rutas y evidencia production persistida | ✅ COMPLIANT |

**Resumen**: 14/14 escenarios compliant.

### Correctness (evidencia estática)

| Requirement | Estado | Notas |
|---|---|---|
| Rutas administrativas aisladas | ✅ Implementado | Ruta lazy protegida, provider obligatorio y rutas públicas preservadas. |
| Login y shell simulados | ✅ Implementado | Dashboard enlaza los cuatro módulos y mantiene sesión mock. |
| Shell accesible/responsive | ✅ Implementado | Landmarks, foco/tokens F1-02, estado activo y vistas responsive. |
| Fuente privada | ✅ Implementado | Seed independiente con siete máscaras únicas y sin datos prohibidos. |
| Búsqueda y filtros privados | ✅ Implementado | Búsqueda solo por `nombre`/`dniMostrar`, contacto booleano, paginación y searchbox controlado. |
| Estados y QA | ✅ Implementado | Estados exclusivos, QA por `isDevMode` y detalle bloqueado. |

### Coherencia con el diseño

| Decisión | ¿Seguida? | Notas |
|---|---|---|
| Seam `STUDENTS_SOURCE` con source local | ✅ Sí | Provider en árbol admin; no HTTP/storage. |
| Signals/computed y guard por generación | ✅ Sí | Cubre búsqueda, filtros, clamp, reset y carrera stale. |
| Página única sin abstracciones nuevas | ✅ Sí | TS/HTML/CSS locales; sin dependencias. |
| Tabla desktop + cards mobile | ✅ Sí | Breakpoints y semántica verificados en runtime. |
| Detalle diferido a F5-03 | ✅ Sí | Botones deshabilitados y ruta ausente. |

### Issues encontrados

**CRITICAL**: None.  
**WARNING**: None.  
**SUGGESTION**: Los dos budgets CSS heredados pueden tratarse en un ciclo separado; no pertenecen a F5-02.

### Verdict

**PASS**

Los 6 requisitos y 14 escenarios tienen cobertura ejecutada. El fix del searchbox controlado pasó focused, suite completa, build y runtime clave; no quedan blockers ni findings del cambio. `sdd-archive` se completó el 2026-07-13.
