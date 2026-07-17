# Paridad lista de cursos (P-04)

## Estado

Cerrado y archivado en `openspec/changes/archive/2026-07-17-frontend-parity-cursos-list/`.  
Verify: PASS WITH WARNINGS — `test:ci` 772/772, `tsc` 0, `build` 0 (CSS budget warn 9.05 kB).

## Alcance

Capa de paridad visual sobre el polish 2026-07-16:

- Search icon, Plus en CTA, resumen dentro de la card de filtros, Limpiar con X.
- Tabla densificada (thead mono, hover, acento, acciones icon Eye/Pencil).
- Cards mobile con iconos de métricas.
- Presentes/Certificaciones siguen en `—` sin inventar API.
- Fechas con unidad `fecha(s)`.

## Referencias

- Archive: `openspec/changes/archive/2026-07-17-frontend-parity-cursos-list/`
- v0: `muestra_pagina/components/admin/lista-cursos.tsx`
- Página: `apps/frontend-angular/.../courses/courses-list-page.*`
