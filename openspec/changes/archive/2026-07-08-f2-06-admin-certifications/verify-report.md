# Reporte de verificación — F2-06 Certificaciones admin

**Change**: `f2-06-admin-certifications`
**Mode**: Standard (`strict_tdd: false`)
**Artifact store**: OpenSpec + Engram
**Branch**: `frontend/admin-certifications`
**Date**: 2026-07-08
**Verdict**: PASS

## Resumen ejecutivo

F2-06 verifica limpio tras las correcciones pre-commit. Las tareas archivadas, las specs canónicas y el working tree actual están alineados: `/admin/certificaciones` y `/admin/certificaciones/:id` siguen siendo rutas admin mock protegidas; la feature es mock-only, usa `CERTIFICATIONS_SOURCE` con un provider en memoria, expone solo campos demo seguros y mantiene emisión/PDF/entrega manual/revocación/listado real como acciones deshabilitadas con handoff.

Las correcciones recientes están contempladas: el conteo de tests ahora es `394 SUCCESS`, el tamaño inicial del build es `313.84 kB` raw / `90.36 kB` transfer, el parsing de id de ruta rechaza valores coercibles como `0x1` y `1e0`, el dashboard cae a `0` cuando `contar()` rechaza, y el check de no-secrets ahora enumera los métodos públicos de clase, getters y fuentes del constructor para la feature de certificaciones.

## Completitud

| Métrica | Valor |
|---|---:|
| Tareas totales | 19 |
| Tareas completas | 19 |
| Tareas incompletas | 0 |

**Estado de tareas**: `tasks.md` tiene 1.1–5.5 marcadas. `archive-report.md` confirma que las specs y docs se sincronizaron y que F2-06 fue archivado bajo `openspec/changes/archive/2026-07-08-f2-06-admin-certifications/`.

## Ejecución de build y tests

| Comando | Directorio de trabajo | Resultado | Evidencia |
|---|---|---|---|
| `npm run test:ci` | `apps/frontend-angular` | PASS | Chrome Headless 149: `TOTAL: 394 SUCCESS`. |
| `npm run build` | `apps/frontend-angular` | PASS | Build completado sin warnings. Initial total `313.84 kB` raw / `90.36 kB` transfer. Los chunks lazy incluyen `certification-preview-page` `8.38 kB` y `certifications-list-page` `7.76 kB`. |
| `git diff --check` | raíz del repo | PASS | Sin salida. |

**Cobertura**: el comando disponible no emite reporte de cobertura.

## Matriz de cumplimiento de specs

| Spec | Requirement | Escenario | Evidencia runtime/fuente | Resultado |
|---|---|---|---|---|
| `admin-certifications-frontend` | Rutas protegidas de certificaciones | Acceso con sesión mock | `app.routes.spec.ts` cubre `/admin/certificaciones` y `/admin/certificaciones/1`; el harness runtime instancia list/preview a través del inyector real de la ruta. | COMPLIANT |
| `admin-certifications-frontend` | Rutas protegidas de certificaciones | Acceso sin sesión mock | `app.routes.spec.ts` verifica que `/admin/certificaciones` redirige a `/admin/login` sin sesión. | COMPLIANT |
| `admin-certifications-frontend` | Listado mock-only con datos seguros | Listado filtrado por estado | `certifications.service.spec.ts` y `certifications-list-page.spec.ts` cubren filtros por estado y empty state. | COMPLIANT |
| `admin-certifications-frontend` | Listado mock-only con datos seguros | Frontera de datos segura | `no-real-data.spec.ts`, `no-secrets.spec.ts` y specs de listado pasaron en la corrida de 394 tests; la implementación usa `documentMasked`/`tokenPrefix` y no usa HTTP/storage/admin key. | COMPLIANT |
| `admin-certifications-frontend` | Previsualización segura y handoff explícito | Previsualización de certificación mock | `certification-preview-page.spec.ts` cubre `<dl>`, documento enmascarado, `tokenPrefix`, URL pública truncada, fechas asistidas, eventos de auditoría y enlace de retorno. | COMPLIANT |
| `admin-certifications-frontend` | Previsualización segura y handoff explícito | Acción fuera de alcance | Las specs de preview assertan CTAs deshabilitados y copy de handoff F4/F5/F6 para PDF/entrega manual/revocación/listado real. | COMPLIANT |
| `admin-certifications-frontend` | Previsualización segura y handoff explícito | Id inexistente o inválido | Las specs de preview cubren `abc`, `999`, rechazo estricto de `0x1` y `1e0`, y normalización válida de ` 1 `. | COMPLIANT |
| `admin-certifications-frontend` | Documentación y archivo del ciclo | Cierre documental | `archive-report.md`, `openspec/specs/admin-certifications-frontend/spec.md` canónica, `openspec/specs/admin-foundation/spec.md` y `docs/frontend/00-angular20-port-v0.md` están presentes en el diff/archivo actual. | COMPLIANT |
| `admin-foundation` | Rutas administrativas aisladas | Navegación admin básica | `app.routes.ts` expone `/admin/certificaciones*`; `app.routes.spec.ts` cubre el orden de rutas, el session guard y el wiring del provider runtime. | COMPLIANT |
| `admin-foundation` | Rutas administrativas aisladas | Rutas públicas preservadas | `app.routes.spec.ts` preserva root, `validar/:tokenCertificacion` y el wildcard público tras agregar certificaciones admin. | COMPLIANT |
| `admin-foundation` | Login y shell simulados | Dashboard con Certificaciones navegable | `admin-dashboard-page.spec.ts` cubre el link, el conteo derivado del servicio, la ausencia de "Próximamente"/"F2-06", la no llamada a `fetch` y el fallback a `0` ante rechazo. | COMPLIANT |
| `admin-foundation` | Shell accesible, responsive y alineado a F1-02 | Navegación accesible | `sidebar-admin.spec.ts` cubre el link Certificaciones, el comportamiento de active por prefijo y la no caída a placeholder. | COMPLIANT |
| `admin-foundation` | Shell accesible, responsive y alineado a F1-02 | Sin dependencias visuales nuevas | Inspección de fuentes y package files sin cambios muestran que no se agregaron Tailwind/shadcn/lucide/CVA; la UI usa los patrones CSS/SVG existentes. | COMPLIANT |
| `admin-foundation` | Documentación y límites de handoff | Límites documentados / handoff | Las specs canónicas y los docs frontend registran los límites mock-only y el handoff a F4-01/F4-02/F5-01/F5-04/F6-01. | COMPLIANT |

**Resumen de cumplimiento**: 14/14 escenarios compliant, 0 partial, 0 needs-verify.

## Corrección

| Área | Estado | Notas |
|---|---|---|
| Rutas y provider | Implementado | `CERTIFICATIONS_SOURCE` se provee en la ruta `admin` y está cubierto por tests runtime del inyector de ruta. |
| Listado mock-only | Implementado | El seed es ficticio; los filtros y el empty state están cubiertos por tests de servicio/componente. |
| Preview segura | Implementado | Muestra `documentMasked`, `tokenPrefix`, URL truncada, fechas asistidas y eventos de auditoría; los ids inválidos están controlados. |
| Strict id parsing | Implementado | La regex acepta solo enteros decimales positivos; los tests rechazan `0x1` y `1e0`. |
| Dashboard/sidebar | Implementado | Certificaciones es navegable; el estado activo del sidebar usa prefijo; el conteo del dashboard viene del seam y cae a `0` ante rechazo. |
| Frontera segura | Implementado | Los checks pasaron para: sin admin key, sin HTTP/fetch/HttpClient/XMLHttpRequest, sin storage/cookies/IndexedDB, sin DNI/token/email/legajo/matrícula completos. |
| CTAs fuera de alcance | Implementado | Las acciones productivas siguen deshabilitadas con handoff explícito a F4-F6. |

## Coherencia (Diseño)

| Decisión | ¿Seguida? | Notas |
|---|---|---|
| Feature bajo `features/admin/certifications/` | Sí | Los modelos, token de servicio, servicio in-memory, páginas list/preview y checks viven en la feature. |
| `InjectionToken` + provider in-memory | Sí | `CERTIFICATIONS_SOURCE` e `InMemoryCertificationsService` matchean el seam establecido en Cursos/Asistencias. |
| Rutas admin protegidas y provider en la ruta admin | Sí | `adminGuard` protege el shell; el provider se adjunta al inyector de la ruta admin. |
| Mock-only y handoff a F4-F6 | Sí | No se agregaron backend, HTTP, storage, auth real, implementación de PDF/QR/revocación/entrega ni dependencias nuevas. |
| Tests runtime/componente/seguridad | Sí | `npm run test:ci` ejecutó 394 specs en verde. |

## Problemas detectados

### CRITICAL

Ninguno.

### WARNING

Ninguno.

### SUGGESTION

Ninguno.

## Riesgos / Fuera de alcance

- Backend real, emisión, generación de PDF/QR, entrega manual, revocación, `X-Admin-Key`, auth real, storage y deploy siguen fuera de alcance de F2-06 y deben permanecer bloqueados a ciclos posteriores.
- El comportamiento de `HeaderInstitucional` en `/admin/*` sigue siendo tech debt histórico de ciclos anteriores, no modificado por F2-06.

## Veredicto final

**PASS**

El working tree actual satisface las specs/diseño/tareas/archive de F2-06 con evidencia runtime de tests, build y checks de whitespace.
