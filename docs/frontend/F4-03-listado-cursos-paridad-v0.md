# F4-03 — Listado de cursos con paridad v0

## Resumen

Evolución in-place de `CoursesListPage` para que `/admin/cursos` alcance paridad funcional y visual con la referencia v0, conservando el contrato mock seguro de F2-04. La pantalla agrega tabla accesible desktop, tarjetas con métricas en mobile, filtro por disponibilidad de fechas, limpieza, y diferenciación de loading, error con reintento, vacío total y sin coincidencias. Las métricas de presentes/certificaciones se exponen como `null`/`—` con texto accesible explícito, sin acoplar features.

## Criterios de éxito (verify)

| Criterio | Estado |
|---|---|
| `/admin/cursos` con tabla desktop y tarjetas mobile, paridad v0 igual o mejor | ✅ |
| Búsqueda, estado, con/sin fechas y limpiar funcionan y son accesibles | ✅ |
| Loading, error, vacío total y sin resultados son distinguibles | ✅ |
| Detalle/editar navegan por rutas existentes; sin red, dependencias ni coupling nuevos | ✅ |
| Tests y build Angular pasan; forecast bajo 4000 líneas para PR único | ✅ (485/485, build exit 0) |

## Archivos creados / modificados

### `apps/frontend-angular/src/app/features/admin/courses/`

| Archivo | Acción | Descripción |
|---|---|---|
| `courses.models.ts` | Modificado | `cuatrimestre`, `cantidadFechas`, `alumnosPresentes: number \| null`, `certificaciones: number \| null`, `conFechas?: boolean` en `CursosFiltros`. |
| `in-memory-courses.service.ts` | Modificado | Derivación de cuatrimestre y `cantidadFechas` desde seed; métricas en `null`; soporte `conFechas`; alta crea `cuatrimestre: 'Sin programar'`, `cantidadFechas: 0`. |
| `courses-list-page.ts` | Modificado | Signals `q`, `estado`, `conFechas`; `recargar()` consume `CursosFiltros` completo; handlers `onConFechas`, `onLimpiarFiltros`, `onReintentar`; distinción `vacioTotal` vs `sinCoincidencias`; guard local de generación anti-race. |
| `courses-list-page.html` | Modificado | Filtros con `<button aria-pressed>` para con/sin fechas; `<table>` accesible con `<caption>`, `<th scope="col">`; métricas con `—` + texto accesible; `<ul>` mobile con cards y mismas métricas; banners loading/error/empty con `aria-busy`/`role="alert"`; `<p aria-live="polite">` para resumen; `Limpiar filtros` y `Reintentar` accesibles. |
| `courses-list-page.css` | Modificado | Estilos responsive con tokens existentes; tabla oculta `<md`, cards ocultas `≥md`; chips con `aria-pressed=true` diferenciado. |
| `courses-list-page.spec.ts` | Modificado | Estados runtime, filtros, limpieza, semántica, links y placeholders. |
| `courses.service.spec.ts` | Modificado | Derivación, filtro `conFechas`, placeholders, alta por defecto. |
| `__checks__/no-secrets.spec.ts` | Modificado | `CoursesListPage` añadida al array `sources()`. |
| `__checks__/no-real-data.spec.ts` | Modificado | Validación de cuatrimestres y datos ficticios. |

## Evidencia visual y de paridad

Disponible en `openspec/changes/archive/2026-07-12-f4-03-courses-list/evidence/`:

- `desktop-1280.png` — vista desktop 1280×800 con tabla accesible y filtros.
- `mobile-390.png` — vista mobile 390×844 con cards.
- `loading.png` — estado de carga.
- `error.png` — estado de error con botón "Reintentar".
- `empty-total.png` — vacío inicial sin filtros.
- `no-results.png` — sin coincidencias con filtros activos.
- `parity-notes.md` — tabla comparativa Angular F4-03 vs `muestra_pagina/components/admin/lista-cursos.tsx`.

Comparativa resumida:

| Criterio | Resultado |
|---|---|
| Jerarquía visual | Igual o mejor (tokens ink/card/border existentes). |
| Semántica desktop | Mejor: tabla con `<caption>`, `<th scope>` y acciones con nombre accesible. |
| Mobile | Igual: cards conservan identidad, estado, métricas y acciones. |
| Filtros y foco | Igual o mejor: chips `aria-pressed` + `Limpiar filtros` condicional + foco visible global. |
| Métricas | Delta intencional de privacidad/coupling: `—` + texto accesible en lugar de consultar otros features. |

## Límites explícitos (F4-03)

Sin backend real, HTTP, `X-Admin-Key`, storage/cookies/IndexedDB, sesión real, DNI completo administrativo, token completo, email, legajo, matrícula, UUID, dependencias nuevas, Tailwind, copia literal React/Next, ni datos reales. Las acciones reales (alta persistida, eliminar curso, acoplar con asistencias o certificaciones) quedan como handoff a F4-04 y ciclos posteriores.

## Handoff F4-04

`Ver detalle` y `Editar` solo reusan rutas existentes. La evolución del detalle, los cambios persistentes en fechas y cualquier integración con `Asistencia`/`Certificacion` permanecen diferidos a F4-04 y ciclos posteriores. `parity-notes.md` documenta el seam explícito.

## Verificación (`sdd-verify`)

- `rtk npm run test:ci` → **485/485 SUCCESS** (exit 0).
- `rtk npm run build` → exit 0, dos warnings de presupuesto CSS **preexistentes** ajenos a `courses-list` (`certification-pdf-preview-page.css` 12,41 kB y `certification-preview-page.css` 14,31 kB, ambos < 16 kB error) — carry-forward de F4-01/F4-02, trade-off de paridad visual.
- Focused page 13/13 + focused service 24/24 + suite completa + `git diff --check` exit 0.
- Review terminal `approved` (lineage `review-fc99c946d72cec8e`, receipt v2 físico con `evidence_hash: sha256:a7049ee17ba6ff89f1ec724a07978e98fc03084dcd843ca2128af99719ccd129`).
- Runtime real: desktop 1280×800 mostró tabla con 6 filas y cards ocultas; mobile 390×844 mostró 6 cards y tabla oculta; filtro sin coincidencias mostró mensaje diferenciado y `Limpiar filtros`; privacidad confirmada (sin DNI/email/token/UUID).

## Warnings carry-forward (no bloqueantes)

- Dos warnings de budget CSS preexistentes en preview/PDF de certificaciones (F4-01/F4-02), no introducidos por F4-03.
- `requestAnimationFrame` no cancela su handle al destruir el componente (legado F4-02, sin falla runtime observada; follow-up previamente aprobado).
- `apply-progress` corrigió una condición de carrera por respuestas superpuestas de filtros vía guard local de generación; corrección no introduce dependencias, sin RxJS ni cancelación.

Detalle en `openspec/changes/archive/2026-07-12-f4-03-courses-list/verify-report.md` y archive report del ciclo.
