# Design: Paridad lista cursos (P-04)

## Approach

Edición in-place de `courses-list-page.{html,css,spec.ts}`. Sin cambios de servicio/modelo salvo helpers de display ya existentes (`formatoMetrica`).

## UI map

| Zona | Cambio |
|------|--------|
| Header CTA | SVG Plus + flex |
| Search | Wrapper `.search-wrap` + SVG absolute |
| Summary | Dentro `.filtros` con `border-top` |
| Clear | SVG X + clase `.clear-filters` |
| Table | thead bg, mono th, hover, action icon buttons |
| Metrics | Fechas con unidad; null → — |
| Cards | SVG Calendar/Users/BadgeCheck en métricas |

## Risks

- Tests que buscan `button.clear-filters` / title placeholders — preservar selectores.
- Budget CSS — mantener tokens existentes.
