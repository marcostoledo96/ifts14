# Design: frontend-cursos-list-polish

## Overview

Polish in-place de `CoursesListPage`: mismos signals/servicios; solo template + CSS + handler de chips y etiquetas. Sin seams nuevos.

## Composition

```
CoursesListPage
├── header (Archivo académico / Cursos / Nuevo curso)
├── demo-banner
├── filtros
│   ├── search q
│   ├── chips estado (4 + dots, aria-pressed)
│   └── chips fechas (Con/Sin)
├── results-summary + Limpiar
└── estados | tabla + cards
    ├── loading (SVG + texto; opcional skeleton liviano)
    ├── error (SVG + alert + Reintentar)
    ├── empty-total (SVG + CTA nuevo)
    ├── no-results (SVG + Limpiar)
    └── resultados: tr/card + acento + badge + métricas
```

## Decisions

| Tema | Decisión |
|------|----------|
| Toggle estado | Single (como certs): `onEstado(e)` → mismo valor ⇒ `todos` |
| Labels filtro | Borrador / Activos / Cerrados / Archivados |
| Labels badge | Borrador / Activo / Cerrado / Archivado |
| Presentes/Certif. | Siempre `—` hoy (`null`); helper `formatoMetrica(n)` por si algún día ≠ null |
| Fechas columna | Mostrar `cantidadFechas` (número existente); sin inventar |
| Iconos | SVG inline `aria-hidden` en template |
| QA vista | Fuera de alcance |

## CSS

- Reutilizar tokens (`--color-valid`, `--color-valid-soft`, `--color-border`, `--color-muted*`, `--color-circuit` si existe).
- `.estado-badge` + `.estado-dot` + variantes `.estado-badge--activo|borrador|cerrado|archivado`.
- `.row-accent` / `.card-accent` como barra 4px.
- Chips filtro: `.filter-chips button` + `.chip-dot`.

## Data flow

Sin cambio: `recargar()` → `COURSES_SOURCE.listar(CursosFiltros)` + `loadGeneration`. Solo cambia `onEstado(EstadoCurso)` en lugar de `change` del select.

## Risks / open

- HTTP `cantidadFechas=0` en list puede verse “pobre”; aceptable hasta ciclo de datos.
- Delta `openspec/specs/admin-courses-frontend` en archive (este ciclo deja delta en `sdd/…/spec.md`).
