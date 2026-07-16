# Tasks: P6-05 — CSS y Accesibilidad

**Review Workload Forecast**: ~50 líneas, ~10 archivos. Bajo cuota.

### T1: Custom properties en :root
- [x] `styles.css`: agregar `--color-secondary`, `--color-accent`, `--color-primary-foreground`, `--radius-xl`

### T2: Fix reduced-motion
- [x] `certification-delivery-page.css`: `prefers-reduced-motion` → `prefers-reduced-motion: reduce`

### T3: Fix focus ring duplicado
- [x] `certification-delivery-page.css`: eliminar box-shadow duplicado en `.btn:focus-visible`

### T4: Fix z-index en revoke
- [x] `certification-revoke-page.html`: mover `z-index: 60` a clase CSS
- [x] `certification-revoke-page.css`: ajustar `.dialog-card` z-index

### T5: Focus trap en diálogos
- [x] `certification-revoke-page.ts`: agregar keydown listener Tab/Shift+Tab
- [x] `certification-delivery-page.ts`: verificar/agregar focus trap

### T6: inert en drawer mobile
- [x] `admin-shell.html`: `inert` en `.content` cuando `menuAbierto()`

### T7: Overflow-x en tabla validación
- [x] `public-validation-page.css`: `overflow-x: auto` en tabla

### T8: Formatear CSS minificado
- [x] `certifications-list-page.css`: reformatear con saltos de línea

### T9: Reduced-motion global refinado
- [x] `styles.css`: excluir `.focus-visible` del reset de animaciones

### T10: Ejecutar tests
- [x] `npm run test:ci` → 626/626 SUCCESS

## Estimación

~50 líneas. 10 archivos. Solo CSS/HTML/TS fixes.
