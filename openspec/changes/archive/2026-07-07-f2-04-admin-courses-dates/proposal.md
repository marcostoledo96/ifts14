# Propuesta: F2-04 — Cursos y fechas admin

## Intento

Preparar una UI administrativa Angular 20 para cursos y fechas, navegable y testeable, lista para contrato futuro, sin exponer auth real, `X-Admin-Key`, storage ni HTTP desde el browser.

## Alcance

### Incluido
- Activar el ítem `Cursos` y marcarlo activo con prefijo `/admin/cursos*`.
- Migrar `AdminShell` a patrón de rutas hijas con `<router-outlet />`.
- Agregar rutas protegidas: `/admin/cursos`, `/admin/cursos/nuevo`, `/admin/cursos/:id`, `/admin/cursos/:id/editar`.
- Crear modelos tipados e `InMemoryCoursesService` con seed ficticio no sensible.
- Crear listado, detalle y editor de cursos/fechas; enlazar tarjeta del dashboard a Cursos.
- Actualizar tests, build, documentación y cierre por `sdd-archive`.

### Excluido
- Backend, deploy, base de datos, material privado, datos reales.
- Auth real, `X-Admin-Key` en Angular, cookies/storage/API calls.
- Tailwind/deps nuevas, copia React/Next, F2-05 asistencias y F2-06 certificaciones.

## Capacidades

### Nuevas capacidades
- `admin-courses-frontend`: UI admin contract-ready para cursos y fechas con modelos, servicio mock, rutas, estados, accesibilidad y límites de seguridad.

### Capacidades modificadas
- `admin-foundation`: el shell admin deja de renderizar dashboard inline, usa rutas hijas; `Cursos` pasa de placeholder a enlace real y el dashboard enlaza a la nueva sección.

## Enfoque

Usar el alcance seguro de la exploración: standalone Angular, CSS/tokens existentes, datos en memoria y rutas protegidas por `adminGuard`. No crear `HttpCoursesService`; la sustitución real queda para un ciclo con sesión segura aprobada.

## Áreas afectadas

| Área | Impacto | Descripción |
|---|---|---|
| `apps/frontend-angular/src/app/app.routes.ts` | Modificado | Rutas admin hijas y lazy pages. |
| `apps/frontend-angular/src/app/features/admin/` | Modificado | Shell, sidebar y dashboard. |
| `apps/frontend-angular/src/app/features/admin/courses/` | Nuevo | Modelos, servicio mock, páginas y tests. |
| `docs/frontend/00-angular20-port-v0.md` | Modificado | Estado F2-04 y límites. |
| `openspec/changes/f2-04-admin-courses-dates/` | Nuevo | Specs, diseño, tareas, verify y archive. |

## Riesgos

| Riesgo | Probabilidad | Mitigación |
|---|---|---|
| Superar 1500 líneas | Media | `sdd-tasks` debe recomendar split antes de apply si el forecast excede presupuesto. |
| Filtrar auth/datos sensibles | Baja | Tests negativos: sin `X-Admin-Key`, DNI, token, storage ni HTTP. |
| Romper shell F2-03 | Baja | Migración mínima y tests de rutas/sidebar. |

## Plan de reversión

Revertir el cambio activo: quitar `features/admin/courses/`, restaurar dashboard inline en `AdminShell`, devolver `Cursos` a placeholder y retirar rutas nuevas/docs del ciclo.

## Dependencias

- F2-03 `admin-foundation` mergeado.
- Specs `admin-foundation` y `admin-master-data-api` como contrato de referencia.

## Criterios de éxito

- [ ] Las rutas de cursos cargan bajo `adminGuard` sin romper rutas públicas/admin existentes.
- [ ] La UI muestra datos ficticios en memoria y advierte que no persiste al recargar.
- [ ] Tests/build pasan y verifican ausencia de HTTP, storage, secretos, DNI y tokens.
- [ ] Documentación y `sdd-archive` reflejan límites y handoff a F2-05/F2-06.
