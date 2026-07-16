# Tasks: P6-03 — Eliminar Estados No Sustentados

**Review Workload Forecast**: ~-80 líneas netas (solo eliminación). PR única.

### T1: Eliminar TipoEnvio del modelo
- [x] `certifications.models.ts`: quitar `TipoEnvio`, quitar `envio` de `Certificacion`, quitar `envio` de `CertificacionesFiltros`
- [x] `in-memory-certifications.service.ts`: quitar valores `envio` del seed
- [x] `http-certifications.service.ts`: quitar default `'pendiente-entrega'`

### T2: Eliminar filtros de envío del listado
- [x] `certifications-list-page.ts`: quitar array `envios`, signal `envio`, filtros, `etiquetaEnvio()`
- [x] `certifications-list-page.html`: quitar chips de filtro, columna "Entrega"

### T3: Suprimir copy no aprobado
- [x] `certification-preview-page.html`: quitar "validez legal", "firma digital verificada"
- [x] `certification-pdf-preview-page.html`: quitar "firma digital verificada"
- [x] `certification-pdf-preview-page.ts`: quitar mensajes de validez legal

### T4: Actualizar tests
- [x] Todos los specs que referencian `envio` o `TipoEnvio`

### T5: Ejecutar tests
- [x] `npm run test:ci`

## Estimación

~-80 líneas netas. Solo eliminación.
