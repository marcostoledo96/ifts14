## Exploration: frontend-asistencias-listado-por-curso

### Current State

**Problema UX confirmado (Marcos):** en `/admin/asistencias` el listado aplana hub → filas **curso×fecha**. El mismo nombre de curso se repite por cada fecha y la búsqueda se siente desordenada.

**Angular hoy**

| Pieza | Estado |
|---|---|
| Ruta `/admin/asistencias` | `AttendancesListPage` — carga `ATTENDANCE_SOURCE.listarHub()` |
| Modelo de fila | `FilaAsistencia { curso, fecha, presentes, total }` — una fila por fecha no cancelada |
| Flatten | Loop `hub.fechas` × lookup `hub.cursos`; orden: programada → realizada → fecha ISO |
| CTA fila | `linkMarcado` → `/admin/cursos/:id/fechas/:fechaId/asistencias` (salto directo al marcado) |
| Filtros listado | Texto (nombre/código/fecha) + chips estado de **fecha** (`todas` / `programada` / `realizada`) |
| Contador | «N fechas asistibles» + `presentes/total` por fila (`total` = `hub.alumnosActivos` global) |
| Ruta intermedia bajo asistencias | **No existe** |
| Marcado | Intacta: `/admin/cursos/:id/fechas/:fechaId/asistencias` (`AttendanceMarkingPage`) |
| Certificados por fecha | `/admin/cursos/:id/fechas/:fechaId/asistencias/certificados` |
| Entrada primaria (spec) | Detalle de curso → Abrir fecha / Cargar / Ver y entregar → mismo deep-link de marcado |

**Hub API (sin cambio esperado)**

`GET /admin/hub/asistencias` ya entrega `{ cursos, fechas, asistencias, alumnosActivos }`. El FE hoy **aplana**; no hace falta endpoint nuevo para listar cursos o fechas por curso.

**Detalle de curso (patrón reutilizable)**

`CourseDetailPage` ya lista fechas del curso con métricas de presentes y CTAs Cargar / Ver y entregar hacia el marcado. La pantalla intermedia pedida puede reutilizar ese lenguaje visual **sin** redirigir al detalle completo (Opción A: ruta propia bajo asistencias).

**v0 / `muestra_pagina`**

- No hay listado global equivalente a `/admin/asistencias` (sidebar v0 `href="#"`; docs lo marcan como hub Angular extra).
- Referencia de marcado: `asistencias-editor.tsx` bajo curso, con selector de fechas del **mismo** curso.
- Paridad: mantener sistema visual admin existente (tabla/cards, chips, empty/error), no inventar layout genérico.

**Spec canónica**

`openspec/specs/admin-attendances-frontend/spec.md` — Requirement «Rutas protegidas…»: listado global como acceso secundario que «empuja Cursos → fecha». **No** describe aún listado solo-cursos ni ruta intermedia. Habrá delta MODIFIED (+ ADDED para la nueva ruta).

**Tests que rompen / hay que reescribir**

- `attendances-list-page.spec.ts`: espera **11** filas (fechas seed), links a `…/fechas/…/asistencias`, filtro por chip Programadas, conteo presentes/total por fecha.
- `app.routes.spec.ts`: smoke de `/admin/asistencias` → `AttendancesListPage` (sigue válido; falta caso para la nueva ruta).

### Affected Areas

- `apps/frontend-angular/src/app/features/admin/attendances/pages/list/attendances-list-page.{ts,html,css,spec.ts}` — dejar de aplanar; filas = cursos; CTA → intermedia
- **Nueva página** p.ej. `pages/course-dates/attendance-course-dates-page.*` — elegir fecha del curso
- `apps/frontend-angular/src/app/app.routes.ts` (+ `app.routes.spec.ts`) — registrar `asistencias/curso/:id` **antes** de catch-alls; orden relativo a `asistencias`
- `openspec/specs/admin-attendances-frontend/spec.md` — delta en change folder
- Copy intro del listado («camino habitual Cursos →…») — alinear al nuevo flujo hub asistencias
- **Sin cambio esperado:** `HttpAttendanceService` / backend hub / `AttendanceMarkingPage` (salvo back-link UX opcional)
- **Fuera de alcance:** alterar detalle de curso, emisión/certificados, D0 auth

### Approaches

1. **Opción A — Ruta intermedia bajo asistencias (confirmada)**  
   Flujo: `/admin/asistencias` (cursos) → `/admin/asistencias/curso/:id` (solo fechas) → `/admin/cursos/:id/fechas/:fechaId/asistencias` (marcado existente).
   - Pros: cumple pedido Marcos; un click menos de “curso repetido”; reusa hub; marcado intacto; URL deep-linkeable; separa concerns del detalle de curso
   - Cons: una pantalla nueva + ruta + specs; hay que redefinir filtros del listado (hoy son de estado de fecha)
   - Effort: **Medium** (FE + delta spec + tests; sin backend)

2. **Opción B — Reusar `/admin/cursos/:id` como intermedia**  
   Listado de asistencias solo cursos → navegar al detalle de curso.
   - Pros: cero pantalla nueva; fechas ya listadas en detalle
   - Cons: mezcla ficha de curso (edición, estado, etc.) con “solo elegir fecha”; no es lo pedido; sensación de salir del flujo Asistencias
   - Effort: Low — **rechazada** (Marcos eligió A)

3. **Opción C — Acordeón / expand en el mismo listado**  
   Una fila por curso; al expandir, fechas inline.
   - Pros: una sola URL
   - Cons: peor deep-link; listado sigue denso; no es Opción A
   - Effort: Medium — **no elegida**

### Recommendation

Implementar **Opción A** en el ciclo SDD:

1. Listado `/admin/asistencias`: una fila/card por **curso** (hub.cursos), con métricas útiles derivadas del hub (p.ej. cantidad de fechas no canceladas, pendientes programadas, o resumen compacto) — **sin** repetir el nombre por fecha.
2. Nueva ruta `/admin/asistencias/curso/:id`: listar fechas del curso (excluir `cancelada`), CTA a marcado existente; empty/error/curso no encontrado.
3. Datos: seguir con `listarHub()` en listado; en intermedia, filtrar `hub.fechas` por `cursoId` **o** `COURSES_SOURCE.obtener(id)` / `listarFechas` + conteos de asistencia — preferir hub o un solo GET de curso+asistencias para no reintroducir N+1.
4. Actualizar spec + tests del listado; smoke de la nueva ruta.
5. Mantener detalle de curso como entrada primaria alternativa (sin romper CTAs actuales).

### Risks

- **Filtros del listado:** chips «Programadas/Realizadas» dejan de aplicar a filas-curso; hay que decidir: moverlos a la intermedia, reemplazar por filtro de estado de **curso**, o simplificar a búsqueda por nombre/código.
- **Cursos sin fechas (o solo canceladas):** ¿ocultar del listado o mostrar vacío al abrir? Abrir pregunta.
- **Métrica `presentes/total`:** `total = alumnosActivos` global es engañoso por fila; al pasar a cursos hay que no mentir en UI (métrica por curso o solo conteo de fechas).
- **Orden de rutas Angular:** `asistencias/curso/:id` debe declararse sin ser capturada por otra ruta; verificar specs de navegación.
- **Back desde marcado:** hoy vuelve al detalle de curso en v0/marking; decidir si el breadcrumb/volver del marcado apunta a la intermedia cuando se entró desde Asistencias (opcional; puede quedar fuera de ciclo).
- **Paridad v0:** no hay mock de listado global; criterio = sistema visual admin + claridad UX, no pixel-match de una página inexistente en v0.

### Open questions (para propose / design)

1. ¿Incluir en el listado cursos con 0 fechas asistibles?
2. ¿Qué columnas/métricas mínimas en la fila de curso (código, estado curso, N fechas, N programadas)?
3. ¿Filtros del listado: solo búsqueda, o también estado de curso?
4. ¿La intermedia muestra las mismas acciones que el detalle (Cargar / Ver y entregar) o un único «Tomar asistencia»?
5. ¿Alcance de back-navigation desde marcado en este ciclo?

### Ready for Proposal

**Yes** — decisión de producto (Opción A) confirmada; alcance FE claro; backend no bloquea; open questions son de detalle UX/copy resolubles en `sdd-propose` / `sdd-design` sin reabrir el approach.

Próximo paso recomendado: **`sdd-propose`** para `frontend-asistencias-listado-por-curso`.
