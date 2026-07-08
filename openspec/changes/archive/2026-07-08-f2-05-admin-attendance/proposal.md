# Propuesta: F2-05 — Asistencias admin

## Intento

Preparar la UI administrativa Angular 20 para marcar y revisar presentes por fecha de curso, con datos ficticios en memoria y sin abrir superficie de backend, auth real, storage ni datos sensibles.

## Alcance

### Incluido
- Activar `Asistencias` en sidebar y dashboard, con link y conteo ficticio.
- Agregar rutas `/admin/asistencias` y `/admin/cursos/:id/fechas/:fechaId/asistencias`.
- Crear modelos y servicio mock en memoria para alumnos, asistencias y marcado.
- Crear lista de asistencias y pantalla de marcado con búsqueda, checkboxes, guardar/descartar y resumen de fecha.
- Mostrar solo estudiantes ficticios y `dniMostrar` enmascarado; tests de seguridad, datos, rutas, servicio y componentes.
- Documentar cierre y handoff F2-06 en `sdd-archive`.

### Excluido
- Backend, deploy, material privado, API calls, cookies/storage, auth real y `X-Admin-Key` en Angular.
- Datos reales de estudiantes, DNI completo, email, token, legajo o matrícula.
- Tailwind/dependencias nuevas, copia React/Next, emisión de certificados F2-06.

## Capacidades (Capabilities)

### Nuevas
- `admin-attendances-frontend`: UI admin mock para listar cursos/fechas y marcar presentes por fecha sin red ni datos reales.

### Modificadas
- `admin-foundation`: incorpora `/admin/asistencias*`, sidebar activo y dashboard enlazado para Asistencias.

## Enfoque

Usar Approach C: entrada principal en `/admin/asistencias` y marcado profundo por fecha. D1 queda resuelto con entrada directa a la primera fecha activa/programada/realizada disponible y acción/breadcrumb para cambiar fecha desde la lista. D2 queda resuelto con resumen de fecha en `<dl>` nativo. Reusar `COURSES_SOURCE`, tokens F1-02 y patrón F2-04 `effect()` + guard de carga obsoleta desde el inicio. Mantener `single-pr-default`; si `sdd-tasks` proyecta más de 1500 líneas, dividir.

## Áreas afectadas

| Área | Impacto | Descripción |
|---|---|---|
| `apps/frontend-angular/src/app/app.routes.ts` | Modificado | Dos rutas admin protegidas y providers mock. |
| `features/admin/sidebar-admin.*`, `admin-dashboard-page.*` | Modificado | Asistencias pasa de placeholder a navegación real. |
| `features/admin/courses/course-detail-page.*` | Modificado | Link “Tomar asistencia” por fecha. |
| `features/admin/attendances/*` | Nuevo | Modelos, servicio mock, páginas y checks. |
| `docs/frontend/00-angular20-port-v0.md` | Modificado | Archivo de cierre en `sdd-archive`. |

## Riesgos

| Riesgo | Probabilidad | Mitigación |
|---|---|---|
| Route reuse pisa estado vigente | Media | `effect()` + `loadGen` y test out-of-order. |
| Filtrar dato sensible en mocks | Baja | Checks de secretos/datos y `dniMostrar` enmascarado. |
| Superar 1500 líneas | Media | Forecast en `sdd-tasks`; split si excede. |

## Plan de reversión

Quitar `features/admin/attendances/`, remover las dos rutas, devolver Asistencias a placeholder en sidebar/dashboard y retirar el link de `CourseDetailPage`.

## Dependencias

- F2-04 mergeado: cursos, fechas, sesión mock, `COURSES_SOURCE`.

## Criterios de éxito

- [ ] `/admin/asistencias` y la ruta por fecha navegan con sesión mock y redirigen sin sesión.
- [ ] Marcado en memoria guarda/descarta presentes sin persistencia real.
- [ ] No hay `X-Admin-Key`, HTTP, storage, DNI completo, email, token, legajo ni matrícula.
- [ ] Tests y build Angular pasan dentro de presupuestos.
