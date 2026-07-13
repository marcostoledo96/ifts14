# F4-04 — Notas de paridad v0

## Evidencia de runtime

| Estado | Evidencia |
|---|---|
| Desktop 1280×800 | `desktop-1280.png`: ficha con acento, tabla de cuatro columnas y acciones por fecha. |
| Mobile 390×844 | `mobile-390.png`: tarjetas equivalentes; la tabla queda oculta por el breakpoint local. |
| Fecha cancelada | `cancelada.png`: estado visible sin acción de asistencia. |
| Curso vacío | `empty.png`: estado vacío con enlace existente `Agregar fecha` al editor. |
| Fechas realizadas con presentes | `realizada.png` y `mobile-390-realizada.png`: curso 4 muestra 8/7 presentes y la acción existente `Ver`; el recorrido abrió `/admin/cursos/4/fechas/41/asistencias`. |
| Carga y error | `course-detail-page.spec.ts`: cubiertos por el resumen live y los casos de rechazo/id inválido; no se agrega red ni fixture HTTP para fabricarlos. |

## Comparación con la referencia v0

- Se mantiene la jerarquía de retorno, ficha (código, estado, título) y bloque de asistencias de `muestra_pagina/components/admin/curso-detalle.tsx`.
- Angular mejora la semántica con `table`, `caption`, cuatro `th scope="col"`, tarjetas mobile equivalentes y un solo `output[aria-live="polite"][aria-atomic="true"]`.
- Fechas y códigos usan la tipografía mono y el foco visible usa `--focus-ring` existente. No se portaron Lucide, Tailwind ni JSX.

**Resultado:** paridad igual o mejor para el alcance aprobado, sin contratos de certificaciones ni capacidades de red.
