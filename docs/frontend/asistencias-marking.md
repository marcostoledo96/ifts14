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

## Paridad mock de estado de fecha (2026-07-20)

Ciclo `auto-estado-fecha-curso` (ajustado): el mock de `ATTENDANCE_SOURCE` aplica la misma regla que el backend al marcar presentes (`realizada` con ≥1 presente y `fecha <= hoy` AR; si no, `programada`; `cancelada` rechazada). La fuente HTTP hereda `fechaEstado` del API. Archive: `openspec/changes/archive/2026-07-20-auto-estado-fecha-curso/`.

## Referencias

- Archive: `openspec/changes/archive/2026-07-17-frontend-asistencias-marking/`
- Página: `attendance-marking-page.*`
