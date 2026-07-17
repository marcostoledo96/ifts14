# Design: Marcado de asistencias — polish UI

## Alcance técnico

Enriquecer `AttendanceMarkingPage` (`attendances/pages/marking/`) sin tocar `AttendanceService`, HTTP ni rutas. Se mantiene el patrón vigente `effect()` + `loadGen` (route reuse anti-stale) y la carga por `:id`/`:fechaId`.

## Decisiones (locks cerrados)

| # | Decisión | Fundamento |
|---|----------|------------|
| 1 | Guardia dirty al cambiar fecha = `window.confirm` simple; si cancela, no navega y el `<select>` vuelve a la fecha vigente | UX honesta, mínimo código, testeable con `spyOn(window,'confirm')` |
| 2 | Fechas `cancelada` en el dropdown = `disabled` (visibles, no seleccionables) | Contexto para el operador sin permitir marcado inválido (el mock ya rechaza `marcar` en canceladas) |
| 3 | Toggle: «✓ Presente» (pressed) / «+ Marcar» (unpressed) con `aria-pressed` | Paridad v0 `asistencias-editor.tsx`; reemplaza checkbox nativo |
| 4 | Confirmar cambio de fecha descarta ediciones (no ofrece Guardar primero) | Simplicidad; el confirm solo pregunta descartar |
| 5 | Impacto certificados: OMITIR (non-goal) | Sin API/flag `certificada` real; inferir sería dato frágil |

## Modelo de estado (signals)

Se reutilizan `baseline` y `seleccion` (Set<number>). Se agregan computeds derivados:

- `agregados` = ids en `seleccion` ausentes en `baseline`.
- `quitados` = ids en `baseline` ausentes en `seleccion`.
- `cambios` = `agregados + quitados`; `dirty` = `cambios > 0`.
- `fechasOrdenadas` = `detalle().fechas` (orden natural del detalle) para el `<select>`.

`Guardar` se deshabilita con `!dirty() || guardando()`. `Descartar` restaura baseline (ya existente).

## Flujo: cambio de fecha con guardia

```
Usuario cambia <select> (onFechaSeleccionada)
   │
   ├─ nuevoId == fechaId actual? ─── sí → no-op
   │
   ├─ dirty()? ── no → router.navigate(nueva ruta)
   │
   └─ sí → window.confirm("descartar cambios")
            ├─ acepta → router.navigate(nueva ruta)  (effect recarga + reset baseline/seleccion)
            └─ cancela → select.value = fechaId actual (revertir); no navega
```

La navegación reusa el componente; el `effect()` existente detecta el nuevo `:fechaId` y `cargar()` resetea estado (incluye baseline/seleccion), por lo que el descarte es implícito tras navegar.

## Toggle de presente

`togglePresente(alumnoId: number)` alterna pertenencia en `seleccion` (sin depender de `event.target.checked`). El botón expone `aria-pressed` y `aria-label` contextual («Marcar…» / «Quitar…»).

## Privacidad y frontera

Sin cambios: solo `apellidoNombre` + `dniMostrar` enmascarado; sin email, legajo, DNI completo, token, HTTP ni storage. No se portan columnas email/legajo de las capturas v0.

## Impacto en tests

`attendance-marking-page.spec.ts`: reemplazar interacciones checkbox por toggle (`button[aria-pressed]`), agregar casos de selector (navegar, confirm aceptar/cancelar, opción cancelada disabled), dirty gating de Guardar y ausencia de aviso de impacto. Se conservan los tests de route-reuse y guardado stale.

## Riesgos y mitigación

- **Churn de tests**: acotado al spec de marking; se reescriben solo interacciones afectadas.
- **CSS sticky/mobile**: se adopta paridad útil (toggle + resumen), no copia literal del layout de dos columnas de v0, para respetar el presupuesto de líneas.
