# Tasks: F5-01 — Listado de certificaciones (mock) con paridad v0

## Review Workload Forecast

| Field | Value |
|---|---|
| 400-line budget risk | Low |
| Chained PRs recommended | No |
| Delivery strategy | single-pr |
| Chain strategy | none |
| review_budget_lines | 4000 |

## Phase 1: Modelo y servicio
- [x] 1.1 RED: contrato de `numero`, `envio`, filtros y privacidad.
- [x] 1.2 Agregar `TipoEnvio`, `PAGINA_TAMANO` y campos del modelo.
- [x] 1.3 Completar seed seguro y filtros locales por entrega/número/documento.
- [x] 1.4 GREEN: tests de servicio.

## Phase 2: Filtros
- [x] 2.1 RED: chips, búsqueda combinada y limpieza.
- [x] 2.2 Signals y handlers de validez, entrega y búsqueda.
- [x] 2.3 Chips accesibles con `aria-pressed`.
- [x] 2.4 Estilos responsive y foco visible.
- [x] 2.5 GREEN: tests de página.

## Phase 3: Vistas y paginación
- [x] 3.1 RED: tabla/cards/paginación.
- [x] 3.2 Computeds de página de cinco y clamp/reset.
- [x] 3.3 Tabla desktop, cards mobile y enlaces de detalle/PDF existentes.
- [x] 3.4 CSS responsive.
- [x] 3.5 GREEN: tests de página.

## Phase 4: Estados y harness QA
- [x] 4.1 RED: carga, error, vacío y sin coincidencias.
- [x] 4.2 Estado QA local no persistente y reintento.
- [x] 4.3 Skeleton, alertas y CTAs diferenciados.
- [x] 4.4 GREEN: tests de página.

## Phase 5: Race guard
- [x] 5.1 RED: respuestas superpuestas resueltas en orden inverso.
- [x] 5.2 Guard local de generación.
- [x] 5.3 GREEN: tests de página.

## Phase 6: Privacy y regresión
- [x] 6.1 Checker de seed y DOM del listado.
- [x] 6.2 Checker de APIs prohibidas.
- [x] 6.3 GREEN: checks enfocados.
- [x] 6.4 Remediación post-verify: filtro de curso, conteos semánticos y evidencia regenerada.

## Phase 7: Evidencia visual (verify)
- [x] 7.1 Capturas desktop/mobile y estados.
- [x] 7.2 Verify report.

## Phase 8: Documentación y archive
- [x] 8.1 Documentación frontend durante archive.
- [x] 8.2 Actualizar índice frontend durante archive.
- [x] 8.3 sdd-archive.
