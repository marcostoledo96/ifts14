# Propuesta: F4-03 — Listado de cursos con paridad v0

## Intención

Evolucionar `CoursesListPage` in-place para que `/admin/cursos` alcance paridad funcional y visual con la referencia v0, preservando el contrato mock seguro de F2-04. La pantalla actual carece de tabla desktop, métricas, filtro por fechas y estados de carga/error/vacío diferenciados.

## Alcance

### Incluido
- Agregar `cuatrimestre` al seed y exponer cantidad derivada de fechas.
- Renderizar tabla accesible en desktop y tarjetas con métricas en mobile.
- Mantener búsqueda y selector de los cuatro estados; agregar filtro con/sin fechas y limpieza.
- Diferenciar loading, error con reintento, vacío inicial y filtros sin resultados.
- Ofrecer acciones accesibles hacia detalle y edición existentes.
- Mostrar métricas de presentes/certificaciones como placeholders explícitos con handoff futuro.

### Fuera de alcance
- Rutas, componentes, dependencias, backend, HTTP o persistencia nuevos.
- F4-04, cambios en detalle/editor y acoplamiento con asistencias o certificaciones.
- Eliminar cursos, portar React/Tailwind/lucide o incorporar datos reales.

## Capacidades

### Capacidades nuevas

Ninguna.

### Capacidades modificadas
- `admin-courses-frontend`: ampliar el contrato del listado con paridad responsive v0, filtros, métricas seguras, acciones y estados de pantalla.

## Enfoque

Reutilizar `CoursesListPage`, `COURSES_SOURCE` e `InMemoryCoursesService`. Extender el modelo/filtros dentro de courses; calcular fechas desde el seed. Presentes y certificaciones usarán `—`/`0` con texto “Dato disponible con integración real”, sin consultar otros features. Conservar el `<select>` de estado y sumar controles con/sin fechas.

## Áreas afectadas

| Área | Impacto | Descripción |
|---|---|---|
| `apps/frontend-angular/src/app/features/admin/courses/courses.models.ts` | Modificado | Cuatrimestre, métricas y filtro por fechas. |
| `apps/frontend-angular/src/app/features/admin/courses/in-memory-courses.service.ts` | Modificado | Seed, conteo y filtrado. |
| `apps/frontend-angular/src/app/features/admin/courses/courses-list-page.*` | Modificado | UI responsive, estados, acciones y pruebas. |
| `apps/frontend-angular/src/app/features/admin/courses/__checks__/` | Modificado | Controles de datos ficticios y secretos. |
| `openspec/specs/admin-courses-frontend/spec.md` | Delta | Requisitos del listado. |

## Riesgos

| Riesgo | Probabilidad | Mitigación |
|---|---|---|
| Métricas aparentan datos reales | Media | Placeholder rotulado y handoff documentado. |
| Regresión responsive/accesible | Media | Tests de componente y evidencia desktop/mobile contra v0. |
| Scope creep hacia F4-04 | Baja | Limitar cambios al listado y seams existentes. |

## Plan de reversión

Revertir el commit de F4-03 restaura la página, modelo y seed F2-04; no hay migraciones, rutas ni datos persistidos que deshacer.

## Dependencias

- Implementación F2-04 y tokens visuales existentes.
- Referencia `muestra_pagina/components/admin/lista-cursos.tsx`.

## Criterios de éxito

- [ ] `/admin/cursos` presenta tabla desktop y tarjetas mobile con paridad v0 igual o mejor.
- [ ] Búsqueda, estado, con/sin fechas y limpiar funcionan y son accesibles.
- [ ] Loading, error, vacío y sin resultados son distinguibles.
- [ ] Detalle/editar navegan por rutas existentes; no hay red, dependencias ni coupling nuevos.
- [ ] Tests y build Angular pasan; forecast permanece bajo 4000 líneas para PR único.
