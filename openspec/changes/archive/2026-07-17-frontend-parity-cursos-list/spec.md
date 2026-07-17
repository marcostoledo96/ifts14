# Spec: Paridad lista cursos (P-04)

## Purpose

Paridad visual/a11y de `/admin/cursos` con v0 en densidad tabla/cards/chips/empty, manteniendo métricas honestas.

### Requirement: REQ-PCUR-001 — Densidad filtros y CTA

Filtros MUST card con search icon, chips estado/fechas, resumen in-card y Limpiar con icono X cuando hay filtros.
CTA Nuevo curso MUST incluir icono Plus Lucide-like.

#### Scenario: Filtros densos

- **Given** listado cargado
- **When** se inspecciona la barra de filtros
- **Then** existe icono search en el input y resumen de conteo dentro de la card
- **And** CTA Nuevo curso incluye SVG Plus

### Requirement: REQ-PCUR-002 — Tabla/cards densas

Tabla desktop MUST thead mono uppercase, hover fila, acento lateral.
Cards mobile MUST franja estado + iconos de métricas Fechas/Presentes/Certif.
Acciones desktop MUST botones icono con `aria-label` Ver detalle / Editar.

#### Scenario: Desktop densificado

- **Given** viewport desktop con datos
- **When** se inspecciona la tabla
- **Then** filas tienen `.row-accent` y acciones con SVG + aria-label

### Requirement: REQ-PCUR-003 — Métricas honestas

`alumnosPresentes` y `certificaciones` MUST mostrar `—` cuando son `null`/`undefined`.
MUST NOT inventar conteos ni N+1 a otros features.
`cantidadFechas` MAY mostrar unidad `fecha(s)`.

#### Scenario: Placeholders sin API

- **Given** cursos del seed/HTTP con métricas null
- **When** se renderiza la lista
- **Then** celdas Presentes y Certificaciones muestran `—`
- **And** title/sr-only indica dato con integración real

### Requirement: REQ-PCUR-004 — Empty/error con SVG

Empty total, sin coincidencias, loading y error MUST conservar paneles con SVG (ciclo polish previo).

#### Scenario: Sin coincidencias

- **Given** filtro sin matches
- **When** se renderiza
- **Then** panel `data-state="no-results"` con icono Search
