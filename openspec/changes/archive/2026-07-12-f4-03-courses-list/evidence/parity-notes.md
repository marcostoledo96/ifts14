# Parity notes — F4-03 courses list

## Evidence

- `desktop-1280.png`: data state at 1280×800.
- `mobile-390.png`: cards state at 390×844.
- `loading.png`, `error.png`, `empty-total.png`, `no-results.png`: real Angular component state snapshots exercised through Angular development inspection.

## Comparison with v0

| Criterion | Angular F4-03 | v0 reference | Result |
|---|---|---|---|
| Visual hierarchy | Institutional kicker, page heading, primary action, filter panel and results summary use existing ink/card/border tokens. | Equivalent page heading, action and bordered filter hierarchy. | Equal or better. |
| Desktop semantics | Native table with caption, scoped headers and named detail/edit links. | Native table with caption and scoped headers. | Better: text actions remain visible and named without icon-only controls. |
| Mobile | `ul.cards-mobile` retains course identity, status, three metrics and both actions. | Mobile cards with equivalent metrics/actions. | Equal. |
| Filters and focus | Native search/select plus pressed date chips; clear button is conditional; all interactive controls use the global visible focus ring. | Search, state/date controls and clear action. | Equal or better. |
| Metrics | Dates derive from the course seed. Present/certification values display `—` and an accessible “Dato disponible con integración real” explanation. | v0 displays demonstration counts. | Intentional privacy/coupling delta: F4-03 does not read attendance or certification features. |

## Scope handoff

`Ver detalle` and `Editar` only reuse existing course routes. Detail enrichment, date editing changes and any attendance/certification integration remain deferred to F4-04 and later cycles.
