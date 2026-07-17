# Design: Paridad lista alumnos (P-07)

## Approach

In-place `students-list-page.{html,css,spec.ts}`. Sin modelo nuevo.

## UI map

| Zona | Cambio |
|------|--------|
| Subtitle | Trayectoria/credenciales (sin “legajo”) |
| CTA | UserPlus SVG |
| Search | Icon + hint; label/placeholder honestos intactos |
| Chips | Dots + MailWarning en Sin email |
| Summary | In-card; conservar `<output>` live único |
| Table | thead/hover; cert badge; Eye action |
| Cards | Densidad v0 sin legajo/email |
| Nav | Footer style |

## Privacy locks

- No legajo, no email literal, no búsqueda por apellido.
- `formatoMetrica(null) → —`.
