# Archive Report — F2-05 Asistencias admin

**Change**: `f2-05-admin-attendance`
**Rama**: `frontend/admin-attendance`
**Fecha de archive**: 2026-07-08
**Artifact store**: OpenSpec + Engram (hybrid)
**Veredicto verify**: PASS WITH WARNINGS
**Mode**: Standard, Strict TDD desactivado
**Líneas diff estimadas (sin `.atl`)**: ~2.870 (2.841 altas / 29 bajas)
**Decisión de tamaño**: `size:exception` aprobada por Matías antes de apply (Engram: `Accepted F2-05 size exception before apply`)

## Resumen ejecutivo

El ciclo F2-05 cierra la UI administrativa Angular 20 para Asistencias mock-only: rutas protegidas (`/admin/asistencias` y `/admin/cursos/:id/fechas/:fechaId/asistencias`), lista de fechas asistibles con conteos demostrativos, pantalla de marcado con búsqueda, checkboxes nativos, guardar/descartar, resumen de fecha en `<dl>` y `effect()` + `loadGen` anti-stale. Datos ficticios en memoria (`dniMostrar` enmascarado `XX****XX`, sin email/DNI completo/token/legajo/matrícula). Sin HTTP, sin `X-Admin-Key`, sin storage/cookies/IndexedDB, sin backend, sin auth real y sin dependencias nuevas. Handoff a F2-06 (Certificaciones) queda documentado.

## Specs sincronizadas

| Dominio | Acción | Detalle |
|---|---|---|
| `admin-attendances-frontend` | **Creada** | Spec nueva, 4 requirements con escenarios Given/When/Then. |
| `admin-foundation` | **Modificada** | 4 requirements actualizados: Rutas administrativas aisladas (incluye `/admin/asistencias*`), Login y shell explícitamente simulados (Asistencias activa, Certificaciones handoff F2-06), Shell accesible y alineado a F1-02 (estado activo para `/admin/cursos*` y `/admin/asistencias*`), Documentación y límites de handoff (F2-05 → F2-06). Requirement `Sesión mock solo en memoria` preservado sin cambios. |
| `admin-courses-frontend` | **Ampliada** | 1 requirement añadido: `Enlace de toma de asistencia por fecha` (link `Tomar asistencia` en detalle de curso). Los 4 requirements previos preservados. |

## Source of truth actualizado

Las siguientes specs reflejan el nuevo comportamiento tras el merge:

- `openspec/specs/admin-attendances-frontend/spec.md` (nueva, 72 líneas)
- `openspec/specs/admin-foundation/spec.md` (4 requirements modificados, 1 preservado, 98 líneas)
- `openspec/specs/admin-courses-frontend/spec.md` (1 requirement añadido, 80 líneas)

## Delta specs archivados (referencia)

- `openspec/changes/archive/2026-07-08-f2-05-admin-attendance/specs/admin-attendances-frontend/spec.md`
- `openspec/changes/archive/2026-07-08-f2-05-admin-attendance/specs/admin-foundation/spec.md` (4 MODIFIED)
- `openspec/changes/archive/2026-07-08-f2-05-admin-attendance/specs/admin-courses-frontend/spec.md` (1 ADDED)

## Tareas

- Total: 22
- Completadas: 22 (5.1, 5.2, 5.3 marcadas `[x]` durante este archive)
- Pendientes: 0
- Tareas 5.1 (`docs/frontend/00-angular20-port-v0.md`) y 5.3 (`sdd-archive`) marcadas como completadas en este archive: el orquestador instruyó su ejecución como parte de las archive requirements y el `verify-report` las registra como pendientes de cierre documental/archive (no son tareas de implementación rezagadas). `sdd-apply` no debía marcarlas porque son tareas de fase de cierre. `sdd-archive` ejecuta el cierre mecánico con autorización explícita del orquestador y prueba (`verify-report` PASS WITH WARNINGS) de que toda la implementación core está completa.

## Evidencia de verify (resumen)

- **Tests**: `npm run test:ci` → TOTAL 315 SUCCESS (incluye orden de rutas, provider `ATTENDANCE_SOURCE`, lista, marcado, route reuse out-of-order, checks negativos).
- **Build**: `npm run build` → verde, 310.43 kB initial raw / 89.66 kB transfer; lazy `attendance-marking-page` 11.44 kB; `attendances-list-page` 7.48 kB.
- **Compliance**: 9/10 grupos compliant; 1/10 partial por cierre documental (`docs/frontend/00-angular20-port-v0.md` + `sdd-archive`) — ambos cerrados en este archive.
- **Negative checks**: 0 matches de `X-Admin-Key`/headers admin exactos, storage/cookies/IndexedDB, HTTP/fetch/HttpClient, DNI completo, email, token, legajo o matrícula (scan Python sobre 9 archivos fuente no-spec + chunks dist `attendance-marking-page` y `attendances-list-page` + specs `__checks__/no-secrets.spec.ts` y `no-real-data.spec.ts` en `test:ci`).

## Advertencias preservadas (intentional-with-warnings)

- **Tamaño de revisión overrun**: ~2.870 líneas contra presupuesto 1.500. `size:exception` aprobada por Matías antes de apply; registrada en Engram. No se aplica split porque la excepción se aprobó de forma previa.
- **Drift `.atl/skill-registry.md`**: tooling fuera de alcance. Marcado por incidente como no stageable; no se incluye en archive.

## Post-PR review fixes

Correcciones aplicadas tras el pre-PR review sobre la rama `frontend/admin-attendance`:

- **CRITICAL — fecha inexistente no dejaba body en blanco**: `AttendanceMarkingPage` ahora detecta `fechaId` numérico no presente en `detalle.fechas` y muestra un estado controlado `role="alert"` con enlace de retorno. No hay body en blanco para `/admin/cursos/1/fechas/999/asistencias`.
- **CRITICAL — servicio normalizaba fecha imposible**: `AttendanceMockService.marcar()` rechaza fechaId desconocido con error controlado en vez de asignar `2026-01-01/programada`. `fechaMetaFor()` retorna `null` para IDs inexistentes.
- **Docs truthfulness**: corregidas menciones falsas en `docs/frontend/00-angular20-port-v0.md` y artefactos del archive (`proposal.md`, `design.md`, `tasks.md`) sobre `appCampoDato`/`BandaEstado` (los templates usan `<dl>`, `<p role>`, `<output>` nativos), `data/attendance-mock.ts` (el archivo real es `data/attendance-mock.service.ts`) y `__checks__/no-network.spec.ts` (no existe; el check de red vive en specs runtime `no llama fetch`).
- **Cleanup**: removido el `void marcados` residual en `AttendanceMarkingPage.guardar()`. El contrato real queda documentado: `marcar()` recibe el set completo de alumnos (presente/ausente por fila), no deltas.
- **Tests nuevos**: service spec cubre rechazo de fechaId desconocido; page spec cubre estado controlado para `999` sin excepción y sin body en blanco.

## Límites de handoff a F2-06 (Certificaciones)

Quedan excluidos de F2-05 y se delegan a F2-06 o ciclos posteriores: emisión real de certificados, PDF, email, configuración institucional, permisos, backend, deploy, base de datos, `.htaccess`, material privado, auth real, `X-Admin-Key`, cookies/`localStorage`/`sessionStorage`/IndexedDB, HTTP/HttpClient/fetch/XMLHttpRequest desde el browser, datos reales, DNI completo administrativo, tokens, matrículas, emails, credenciales demo de `muestra_pagina/`, Tailwind/shadcn/lucide/CVA, copia literal React/Next, dependencias nuevas (`package.json`/lockfiles sin cambios).

## Artefactos archiveados

- `proposal.md` (3.4K)
- `specs/admin-attendances-frontend/spec.md` (3.1K)
- `specs/admin-courses-frontend/spec.md` (621B)
- `specs/admin-foundation/spec.md` (3.7K)
- `design.md` (5.2K)
- `tasks.md` (4.4K, 22/22 tareas marcadas `[x]`)
- `verify-report.md` (7.4K)
- `archive-report.md` (este archivo)
- `exploration.md` (35.9K, referencia histórica)

## Out of scope (no se tocaron)

- Runtime product: app Angular, servicios, componentes, build, bundle.
- Backend, deploy, base de datos, material privado, `package.json`, lockfiles.
- `.atl/skill-registry.md` y `openspec/changes/f2-05-admin-attendance/.atl/skill-registry.md` (drift tooling, incidente auditado PASS).
- Operaciones git (commit, push, branch, checkout).

## Cierre del ciclo SDD

El ciclo F2-05 ha sido planificado, implementado, verificado y archivado en su totalidad. Las specs de source of truth (`openspec/specs/`) reflejan el comportamiento vigente. La documentación frontend (`docs/frontend/00-angular20-port-v0.md`) registra el estado F2-05, sus límites y el handoff a F2-06. Listo para el próximo ciclo.
