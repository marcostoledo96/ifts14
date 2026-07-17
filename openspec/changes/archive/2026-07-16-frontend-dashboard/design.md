# Design: frontend-dashboard

## Overview

Reescritura in-place de `AdminDashboardPage` hacia composición v0 (acciones → pendientes → actividad → resumen), reutilizando seams admin ya proveídos en la ruta. Sin servicios nuevos ni HTTP ad hoc.

## Composition

```
AdminDashboardPage
├── header (título + subtítulo)
├── section Acciones (5 tiles: 4× <a routerLink>, 1× button disabled)
├── section Bandeja (lista estática honest placeholders)
├── section Actividad (empty state)
└── section Resumen (4 métricas desde signals)
```

Subcomponentes presentacionales opcionales bajo `features/admin/dashboard/` solo si el HTML de la página supera ~120 líneas; default: **todo en la página** para minimizar blast radius y líneas tocadas.

## Data flow (resumen)

```
ngOnInit / constructor
  Promise.allSettled([
    courses.listar(),           // → cursosCargados
    students.contar(),          // → alumnosRegistrados
    certs.listar(),             // → emitidas + revocadas (client filter)
  ])
  → signals MetricValue = number | null
  null → template muestra "—"
  any rejected → errorMetricas = true + mensaje status
```

### Definiciones de conteo

| Métrica | Derivación |
|---------|------------|
| Cursos cargados | `listar().length` |
| Alumnos registrados | `contar()` |
| Certificaciones emitidas | `listar().filter(c => c.estado === 'vigente' \|\| c.estado === 'vencido').length` |
| Certificaciones revocadas | `listar().filter(c => c.estado === 'revocado').length` |

**Anti N+1:** no llamar `listarFechas` ni `listar({ conFechas: false })` en el dashboard. No inyectar `ATTENDANCE_SOURCE`.

**optional inject:** `inject(X, { optional: true })` como hoy; si falta provider, métricas en `null` + error suave.

## Acciones (rutas)

| Tile | Control | Destino |
|------|---------|---------|
| Nueva certificación | `a` primary | `/admin/certificaciones/nueva` |
| Nuevo curso | `a` | `/admin/cursos/nuevo` |
| Alumnos | `a` | `/admin/alumnos` |
| Configuración | `a` | `/admin/configuracion` |
| Carga masiva | `button` disabled | `title` + `aria-disabled` + texto sr-only |

## Placeholders

- **Bandeja:** 4 filas con labels alineados a v0; badge “—”; detalle “Dato no disponible: falta fuente en API.”; sin total inventado (usar “Sin totales” o omitir número).
- **Actividad:** un `output`/`p` con “Sin registro de actividad disponible.”; sin tabla de eventos seed.

## CSS

Tokens globales (`--color-ink`, `--color-valid`, `--color-destructive`, `--font-mono`, spaces). Grid acciones: 2 cols mobile → 3 → 5 desktop. Sin Tailwind. Sin portar React.

## Testing

- Specs de página: presencia de secciones, links `href`, carga masiva disabled, métricas tras resolve de fakes, "—" + status tras reject, ausencia de `.cards` placeholder y de PII seed.
- Proveer los tres seams en TestBed (in-memory o fakes).

## Threat / honesty matrix

| Caso | Tratamiento |
|------|-------------|
| API métricas inexistente | Derivación listados |
| Pendientes / actividad | Placeholder |
| Email / entrega | No medir |
| PII en actividad | Prohibido en UI |

## File plan

| Path | Change |
|------|--------|
| `admin-dashboard-page.ts/html/css/spec.ts` | Rewrite |
| `app.routes.ts` | Título sin “(mock)” si aplica |
| `openspec/specs/admin-foundation/spec.md` | Delta menor al cerrar/verify (opcional en apply; mínimo comentario en apply-progress) |
