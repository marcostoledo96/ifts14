# Delta for frontend-public-validation

## ADDED Requirements

### Requirement: PUB-A11Y-01 — CTAs con foco visible

CTAs públicos (Reintentar, Volver y equivalentes) DEBEN mostrar `:focus-visible` usable (global o refuerzo mínimo). DEBE NOT rediseñar folio/trust (U9).

#### Scenario: Reintentar/Volver con foco teclado

- **GIVEN** estado no-encontrada o técnico con CTAs
- **WHEN** se enfoca Reintentar o Volver con teclado
- **THEN** DEBE mostrarse anillo `:focus-visible` usable

### Requirement: PUB-A11Y-02 — Tabla de fechas usable en angosto

En viewport angosto, la tabla de fechas asistidas DEBE permanecer usable (overflow-x o apilado). DEBE NOT rediseñar el folio.

#### Scenario: Tabla scrolleable o apilada

- **GIVEN** folio vigente con tabla en viewport angosto
- **WHEN** se inspecciona layout
- **THEN** la tabla DEBE ser usable sin rotura bloqueante
