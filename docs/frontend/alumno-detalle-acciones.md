# Detalle de alumno — acciones habilitadas

## Estado

Cerrado y archivado en `openspec/changes/archive/2026-07-17-frontend-alumno-detalle-acciones/`.  
Verify: PASS WITH WARNINGS — `test:ci` 718/718, `tsc` exit 0, `build` exit 0 (2026-07-17).

## Alcance implementado

- CTA **Nueva certificación** → `/admin/certificaciones/nueva?alumno=ID`.
- **Emitir** por fila pendiente → `?alumno=ID&curso=COURSE_ID` cuando el id es numérico.
- Preselección de query en `CertificationNewPage` (aviso no bloqueante si inválida).
- **Ver asistencias** → sección inline read-only vía `listarAsistenciasPorAlumno` (empty/loading/error cubiertos).
- **Compartir** / **Editar** siguen disabled con motivos honestos (sin handoff F2-05 obsoleto).

## Referencias

- Archive: `openspec/changes/archive/2026-07-17-frontend-alumno-detalle-acciones/`
- Páginas: `student-detail-page.*`, `certification-new-page.*`
- Seam: `AttendanceService.listarAsistenciasPorAlumno`
