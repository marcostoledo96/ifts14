# Tasks: F2-05 — Asistencias admin

## Review Workload Forecast

| Field | Value |
|-------|-------|
| Estimated changed lines | 1.250–1.450 (modelos + servicio + rutas + nav + 2 páginas + tests + checks + docs) |
| 400-line budget risk | High (3× el presupuesto estándar SDD) |
| 1500-line budget risk | Low/Medium (dentro del presupuesto elevado por el equipo) |
| Chained PRs recommended | No (estimado bajo 1.500) |
| Suggested split | No requerida en forecast; aplicar si diff real > 1.500 |
| Delivery strategy | single-pr-default |
| Chain strategy | size-exception |

Decision needed before apply: No
Chained PRs recommended: No
Chain strategy: size-exception
400-line budget risk: High

Notas: el diseño estima 1.250–1.450 líneas. Si `sdd-apply` supera 1.500 en diff real, dividir en PR1 (modelos + servicio + rutas + nav + checks) y PR2 (páginas + tests restantes + docs) y re-correr el forecast.

## Phase 1: Foundation (modelos, servicio mock, providers)

- [x] 1.1 Crear `features/admin/attendances/models/attendance.types.ts` con `EstadoAlumno`, `AsistenciaAlumno`, `Asistencia`, `AsistenciaMarcado` e interface `AttendanceService`.
- [x] 1.2 Crear `features/admin/attendances/data/attendance-mock.service.ts` con seed de 12–15 personas por curso, `dniMostrar` enmascarado `XX****XX` y sin email, DNI completo, token, legajo ni matrícula.
- [x] 1.3 Crear `features/admin/attendances/data/attendance.token.ts` con `ATTENDANCE_SOURCE` (`InjectionToken<AttendanceService>`).
- [x] 1.4 Implementar `AttendanceMockService` en memoria (`listarAlumnos`, `listarAsistencias`, `marcar`, `anular`) con método `__reset()` para tests.

## Phase 2: Rutas y navegación (orden seguro)

- [x] 2.1 Modificar `app.routes.ts`: registrar `ATTENDANCE_SOURCE` en los `providers` del nodo admin y agregar las dos rutas en orden `dashboard, asistencias, cursos/nuevo, cursos/:id/fechas/:fechaId/asistencias, cursos/:id/editar, cursos/:id, cursos`, antes de `pathMatch:'prefix'` y `**`.
- [x] 2.2 Modificar `sidebar-admin.ts/html/spec`: `Asistencias` enlaza `/admin/asistencias`; `isActive()` acepta prefijo; `Certificaciones` queda placeholder.
- [x] 2.3 Modificar `admin-dashboard-page.ts/html/spec`: tarjeta Asistencias pasa a link real; Certificaciones permanece deshabilitada.
- [x] 2.4 Modificar `course-detail-page.ts/html/spec`: agregar link "Tomar asistencia" por fecha con `aria-label` accesible y query limpia.

## Phase 3: Páginas de asistencias

- [x] 3.1 Crear `AttendancesListPage` (`features/admin/attendances/pages/list/`) con listado de cursos/fechas, conteo ficticio y CTA a la primera fecha activa/programada/realizada disponible.
- [x] 3.2 Crear `AttendanceMarkingPage` con `effect()` reactivo sobre `cursoId()`/`fechaId()` y guard `loadGen` que descarta respuestas obsoletas.
- [x] 3.3 Implementar búsqueda por nombre/DNI enmascarado, checkboxes nativos con `<label>` asociado, contador de marcados, botones Guardar/Descartar y resumen de fecha en `<dl>` nativo.
- [x] 3.4 Aplicar `<p role="alert">` para carga/error y `<output aria-live="polite">` no anidado para feedback de guardado.

## Phase 4: Tests

- [x] 4.1 Spec del servicio: altas, bajas, duplicados, ids inválidos, `__reset()` por test contra `ATTENDANCE_SOURCE`.
- [x] 4.2 Spec de `AttendancesListPage`: búsqueda, conteo, link generado, accesibilidad básica.
- [x] 4.3 Spec de `AttendanceMarkingPage`: checkboxes, guardar, descartar restaura baseline, contador, errores, `aria-live` correcto.
- [x] 4.4 Spec determinista de route-reuse out-of-order: la promesa de la carga anterior se resuelve DESPUÉS de la nueva y NO pisa la URL vigente (test crítico anti-F2-04).
- [x] 4.5 Spec de routing (`app.routes.spec.ts`): orden seguro, `adminGuard` aplica, provider `ATTENDANCE_SOURCE` presente, ids inválidos redirigen.
- [x] 4.6 Spec `__checks__` negativos: código, runtime y bundle sin `X-Admin-Key`, sin `HttpClient`/fetch, sin storage/cookies, sin secrets, sin email, DNI completo, token, legajo o matrícula. (Sin `no-network.spec.ts`: el check de red se cubre con specs runtime `no llama fetch`.)
- [x] 4.7 Spec de datos enmascarados: `dniMostrar` cumple `XX****XX`, sin campos reales en seed ni en DOM.

## Phase 5: Documentación, verify y archive

- [x] 5.1 Actualizar `docs/frontend/00-angular20-port-v0.md` con estado F2-05, límites mock y handoff F2-06.
- [x] 5.2 Correr `sdd-verify`: build Angular + tests, reportar escenarios cubiertos y no cubiertos, riesgos abiertos.
- [x] 5.3 Correr `sdd-archive` para sincronizar deltas en `openspec/specs/` y dejar evidencia de cierre.
