# Editor de curso — layout v0 con contrato estricto

## Estado

Cerrado y archivado en `openspec/changes/archive/2026-07-17-frontend-curso-editor-campos/`.
Verify: PASS WITH WARNINGS — `test:ci` 726/726, `tsc` exit 0, `build` exit 0 (2026-07-17).

## Alcance implementado

- Grid main + aside sticky (Guardar/Cancelar + metadata).
- Create: código + nombre; copy “se crea activo” (POST ignora estado).
- Edit: identidad read-only; toggle “Curso activo” → PATCH estado; fechas con índice `#`, date, descripción y estado.
- Aviso de impacto al tocar fechas `realizada`.
- Sin inputs fantasma de curso (descripción/carga/modalidad), sin horario time, sin badges Emitidos, sin checkbox entrega.

## Referencias

- Archive: `openspec/changes/archive/2026-07-17-frontend-curso-editor-campos/`
- Página: `apps/frontend-angular/src/app/features/admin/courses/course-editor-page.*`
