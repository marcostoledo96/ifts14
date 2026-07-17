# Tasks: Marcado de asistencias — polish UI

## Review Workload Forecast

- Decision needed before apply: No
- Chained PRs recommended: No
- 400-line budget risk: Low

Cambio acotado a un componente (`attendance-marking-page.{ts,html,css,spec.ts}`) + delta spec. Estimado < 250 líneas netas.

## 1. Estado y lógica (TS)

- [x] 1.1 Inyectar `Router`; agregar computeds `agregados`, `quitados`, `cambios`, `dirty`.
- [x] 1.2 Reescribir `togglePresente(alumnoId)` para alternar sin `event` (uso desde botón).
- [x] 1.3 Agregar `onFechaSeleccionada(event)` con guardia `dirty` (`window.confirm`), revertir `<select>` si se cancela, navegar si procede.
- [x] 1.4 Deshabilitar Guardar con `!dirty() || guardando()`.

## 2. Plantilla (HTML)

- [x] 2.1 Reemplazar `<dl>` de fecha por selector «Fecha de la clase» con opciones del curso; `disabled` en `cancelada`.
- [x] 2.2 Reemplazar checkbox por botón toggle `aria-pressed` con texto «✓ Presente» / «+ Marcar».
- [x] 2.3 Agregar resumen: fecha seleccionada, presentes, cambios sin guardar (agregados/quitados).
- [x] 2.4 No agregar aviso de impacto de certificados (non-goal).

## 3. Estilos (CSS)

- [x] 3.1 Estilos del selector de fecha.
- [x] 3.2 Estilos del botón toggle (estado pressed/unpressed) y del resumen dirty.

## 4. Tests (spec.ts)

- [x] 4.1 Migrar interacciones checkbox → toggle (`button[aria-pressed]`).
- [x] 4.2 Selector: navegar sin dirty; confirm aceptar/cancelar; opción cancelada disabled.
- [x] 4.3 Guardar deshabilitado sin cambios; habilitado con cambios.
- [x] 4.4 Resumen refleja cambios sin guardar.
- [x] 4.5 Conservar tests de route-reuse y guardado stale.

## 5. Cierre técnico

- [x] 5.1 `apply-progress.md` con checklist.
- [x] 5.2 Tests focalizados de marking verdes + `tsc --noEmit`.
