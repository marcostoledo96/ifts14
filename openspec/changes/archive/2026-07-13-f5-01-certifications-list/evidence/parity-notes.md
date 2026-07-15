# Paridad local — F5-01

- La composición conserva el encabezado editorial, chips de validez y entrega, selector de curso basado en el seed seguro, tabla de siete columnas y tarjetas equivalentes de la referencia v0.
- Angular usa HTML semántico propio: `table`/`caption`/`th scope`, `dl`, botones nativos y enlaces `RouterLink`; no porta JSX, Tailwind ni iconos de v0.
- Los chips usan `aria-pressed`, el selector de curso tiene etiqueta accesible, la paginación usa `aria-current`, y el contador `aria-live` separa total global, coincidencias y elementos visibles.
- La acción «Nueva certificación» de v0 queda fuera de alcance (handoff F5-04/F6); detalle y PDF reutilizan rutas existentes.
- Privacidad: el listado solo muestra `documentMasked`; no renderiza token, DNI completo, email, legajo, matrícula ni UUID.
- Evidencia regenerada en la revisión posterior al verify fallido: `f5-01-desktop-1280.png`, `f5-01-mobile-390.png`, `f5-01-loading-desktop.png`, `f5-01-error-desktop.png`, `f5-01-no-results-desktop.png` y `f5-01-empty-desktop.png`.
