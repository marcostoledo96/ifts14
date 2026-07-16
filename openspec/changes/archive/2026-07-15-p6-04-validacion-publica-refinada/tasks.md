# Tasks: P6-04 — Validación Pública Refinada

**Review Workload Forecast**: ~200 líneas netas, ~4 archivos. Bajo cuota.

### T1: Refactor template (CRITICAL)
- [x] `public-validation-page.html`: layout grid folio + sidebar, membrete, secciones de datos, tabla de fechas, sidebar con trazabilidad + sello, estados error con cuerpo editorial

### T2: Refactor CSS (HIGH)
- [x] `public-validation-page.css`: grid layout, sidebar, responsive (mobile stack), tipografía, colores

### T3: Ajustes TS (MEDIUM)
- [x] `public-validation-page.ts`: timestamp de consulta, adaptar bindings al nuevo template

### T4: Tests (HIGH)
- [x] `public-validation-page.spec.ts`: actualizar assertions DOM para nueva estructura

### T5: Ejecutar tests
- [x] `npm run test:ci`

## Dependencias

```
T1 → T3 → T4 → T5
T2 paralelo a T1
```

## Estimación

~200 líneas. Frontend-only. 4 archivos.