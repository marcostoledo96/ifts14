# Propuesta: F5-02 — Listado administrativo de alumnos

## Intención

Activar Alumnos con una página Angular 20 accesible y fiel a v0. El listado será mock-only, con datos ficticios y `dniMostrar` enmascarado. Preparará F5-03 sin incorporar detalle, backend ni DNI completo.

## Alcance

### Incluido
- Modelo `Alumno`, seam `STUDENTS_SOURCE` y seed local seguro, sin red ni storage; el DTO de UI no contiene email literal/real ni legajo.
- Búsqueda solo por nombre y `dniMostrar` enmascarado; filtro de contacto `con-email`/`sin-email` mediante booleano seguro, filtros combinables, paginación de 5, tabla desktop, tarjetas mobile y resumen accesible.
- Estados de carga, error, vacío y sin coincidencias; harness QA habilitado solo en desarrollo/tests desde el inicio.
- Ruta protegida `/admin/alumnos`, sidebar y tarjeta de dashboard, activados después de completar la página.
- Acción de detalle deshabilitada con handoff explícito a F5-03; sin registrar `/admin/alumnos/:id`.
- Tests de componente, rutas, privacidad, responsive y paridad visual.

### Fuera de alcance
- Detalle, alta o edición; HTTP, backend, base, auth real o persistencia browser.
- DNI completo administrativo, datos reales, tokens, emails literales o reales, legajos, UUID y matrículas.
- Dependencias nuevas, copia literal React/Next y cambios en `muestra_pagina/`.

## Capacidades

### Capacidades nuevas
- `admin-students-frontend`: listado administrativo mock-only, seguro, responsive, filtrable, paginado y verificable.

### Capacidades modificadas
- `admin-foundation`: incorpora `/admin/alumnos`, su estado activo en sidebar y la tarjeta navegable del dashboard.

## Enfoque

Crear `features/admin/students/` con los patrones `*_SOURCE`, signals/computed, guard anti-stale y QA de F5-01. Reutilizar tokens F1-02 y HTML semántico. Implementar modelo, seed, página y pruebas antes de integrar ruta, sidebar y dashboard. Mantener métricas ficticias en el seed, sin acoplar features. Entregar en un PR de hasta 4000 líneas.

## Áreas afectadas

| Área | Impacto | Descripción |
|---|---|---|
| `apps/frontend-angular/src/app/features/admin/students/` | Nueva | Feature, mocks, página y checks |
| `app.routes.ts`, `features/admin/{sidebar-admin,admin-dashboard-page}*` | Modificada | Navegación e integración |
| `openspec/specs/admin-{students-frontend,foundation}/` | Nueva/Modificada | Contratos funcionales |
| `docs/frontend/` | Modificada | Paridad y handoff F5-03 |

## Riesgos

| Riesgo | Probabilidad | Mitigación |
|---|---|---|
| Exposición de datos personales | Media | DTO/seed sin email literal ni legajo; DNI solo enmascarado y checks negativos |
| Link roto por activación temprana | Baja | Integrar navegación al final |
| Regresión responsive | Media | Tests runtime y evidencia desktop/mobile |

## Plan de reversión

Revertir el PR único: eliminar el feature y restaurar Alumnos como placeholder deshabilitado, sin migraciones ni datos persistidos.

## Dependencias

- Base admin y tokens F1-02 existentes; sin dependencias externas nuevas.

## Criterios de éxito

- [ ] `/admin/alumnos` busca solo por nombre y DNI enmascarado; el contacto se filtra solo con `con-email`/`sin-email` seguro, sin email literal ni legajo.
- [ ] QA no aparece ni muta estado en producción; no existen requests de datos.
- [ ] Sidebar/dashboard funcionan y F5-03 permanece explícitamente diferido.
- [ ] Tests, build, privacidad y paridad visual resultan conformes.
