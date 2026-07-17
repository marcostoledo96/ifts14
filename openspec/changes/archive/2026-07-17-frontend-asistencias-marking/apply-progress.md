# Apply Progress: frontend-asistencias-marking

Ciclo single-turn (spec → design → tasks → apply). Ready for verify (sin verify formal ni archive).

## Checklist ejecutado

### 1. Estado y lógica (TS) — `attendance-marking-page.ts`
- [x] 1.1 `Router` inyectado; computeds `agregados`, `quitados`, `cambios`, `dirty`, `fechasOrdenadas`.
- [x] 1.2 `togglePresente(alumnoId)` alterna sin depender de `event` (uso desde botón).
- [x] 1.3 `onFechaSeleccionada(event)` con guardia `dirty` (`window.confirm`); revierte `<select>` si se cancela; navega si procede.
- [x] 1.4 Guardar deshabilitado con `!dirty() || guardando()`.

### 2. Plantilla (HTML) — `attendance-marking-page.html`
- [x] 2.1 Selector «Fecha de la clase» con opciones del curso; `disabled` en `cancelada`.
- [x] 2.2 Botón toggle `aria-pressed` con «✓ Presente» / «+ Marcar» (sin checkbox nativo).
- [x] 2.3 Resumen `<dl class="resumen">`: fecha, presentes, cambios sin guardar (agregados/quitados).
- [x] 2.4 Sin aviso de impacto de certificados (non-goal).

### 3. Estilos (CSS) — `attendance-marking-page.css`
- [x] 3.1 Estilos del selector (`.controles`, `.fecha-select`) + responsive.
- [x] 3.2 Estilos toggle (`.toggle-presente`, `.presente`) y resumen (`.resumen`, `.tiene-cambios`).

### 4. Tests (spec.ts)
- [x] 4.1 Interacciones migradas a toggle (`.toggle-presente` / `aria-pressed`).
- [x] 4.2 Selector: navegar sin dirty; confirm aceptar/cancelar; opción `cancelada` disabled.
- [x] 4.3 Guardar disabled sin cambios / enabled con cambios.
- [x] 4.4 Resumen refleja cambios sin guardar; sin aviso de impacto.
- [x] 4.5 Conservados tests de route-reuse y guardado stale (adaptados al toggle).

### 5. Cierre técnico
- [x] 5.1 Este `apply-progress.md`.
- [x] 5.2 Tests focalizados verdes + `tsc --noEmit`.

## Evidencia

- `npx tsc --noEmit -p tsconfig.app.json` → **No errors found**.
- `ng test --include='**/attendance-marking-page.spec.ts'` → **TOTAL: 26 SUCCESS**.

## Decisiones aplicadas (locks cerrados)

1. Dirty al cambiar fecha → `window.confirm`; si cancela, no navega y el select vuelve a la fecha vigente.
2. Fechas `cancelada` → opción visible pero `disabled`.
3. Toggle copy → «✓ Presente» (pressed) / «+ Marcar» (unpressed).
4. Confirmar cambio = descartar edits (el effect resetea baseline/selección tras navegar).
5. Impacto certificados → omitido (non-goal documentado).

## Privacidad / frontera
Sin cambios: solo `apellidoNombre` + `dniMostrar` enmascarado; sin email, legajo, DNI completo, token, HTTP ni storage. No se portaron columnas email/legajo de las capturas v0.

## Estado
Ready for verify.
