# Marcado de asistencias — polish UI

## Estado

Cerrado y archivado en `openspec/changes/archive/2026-07-17-frontend-asistencias-marking/`.
Verify: PASS WITH WARNINGS — `test:ci` 734/734, `tsc` exit 0, `build` exit 0 (2026-07-17).

## Alcance implementado

- Dropdown de fechas del curso con `Router.navigate`; fechas `cancelada` visibles pero disabled.
- Confirm `window.confirm` si hay cambios dirty al cambiar fecha.
- Toggle accesible «✓ Presente» / «+ Marcar» (sin checkbox nativo).
- Resumen: fecha, presentes, cambios sin guardar; Guardar solo si dirty.
- Aviso de impacto de certificados **omitido** (sin endpoint/flag FE).

## Referencias

- Archive: `openspec/changes/archive/2026-07-17-frontend-asistencias-marking/`
- Página: `attendance-marking-page.*`
