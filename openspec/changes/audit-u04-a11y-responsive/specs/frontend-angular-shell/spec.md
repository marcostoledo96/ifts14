# Delta for frontend-angular-shell

## ADDED Requirements

### Requirement: SHELL-A11Y-01 — Foco visible preservado

El frontend DEBE conservar `:focus-visible` usable en shell/U4. DEBE NOT rediseñar paleta. Contraste/token SOLO si smoke falla; si no DEFER (U9). Hoist `.sr-only` DEFER.

#### Scenario: Foco teclado visible

- **GIVEN** control interactivo shell/U4
- **WHEN** se enfoca con teclado
- **THEN** DEBE mostrarse anillo `:focus-visible` usable

### Requirement: SHELL-A11Y-02 — Drawer mobile con trap y aria-modal

Drawer abierto DEBE atrapar Tab en drawer+overlay, exponer `aria-modal="true"`, preservar Esc/`inert` en `.content`, y foco inicial al patrón vigente.

#### Scenario: Tab no escapa del drawer

- **GIVEN** drawer mobile abierto
- **WHEN** Tab / Shift+Tab
- **THEN** foco DEBE permanecer en drawer+overlay con `aria-modal="true"`

#### Scenario: Esc e inert intactos

- **GIVEN** drawer abierto con `.content` inert
- **WHEN** Escape
- **THEN** drawer DEBE cerrarse y `inert`/foco DEBEN seguir el patrón vigente

### Requirement: SHELL-A11Y-03 — Patrón de trap en diálogos admin

Diálogos U4 (entrega, revocación, error-dialog) DEBEN atrapar Tab c/backdrop (NO focusable fuera). Esc DEBE cerrar si operable. Retorno DEBERÍA ser soft (SPA OK); DEBE NOT restore duro si cambia ruta. `window.confirm` fuera.

#### Scenario: Tab no cae en backdrop suelto

- **GIVEN** diálogo entrega o revocación abierto
- **WHEN** Tab
- **THEN** foco DEBE permanecer en dialog+backdrop atrapados

#### Scenario: Error-dialog atrapa foco

- **GIVEN** error-dialog de entrega abierto
- **WHEN** navegación teclado
- **THEN** DEBE atrapar Tab; Esc DEBE cerrar si operable

#### Scenario: Retorno de foco soft

- **GIVEN** cierre que navega de ruta
- **WHEN** cambia la vista SPA
- **THEN** retorno soft vía nueva ruta ES suficiente (no hard-fail)

### Requirement: SHELL-A11Y-04 — Listados críticos sin rotura mobile

Listados críticos spot-check U4 DEBEN ser usables en angosto (tabla↔cards o scroll-x). DEBE NOT unificar breakpoints ni rediseñar cards. U5 fuera.

#### Scenario: Spot mobile sin overflow bloqueante

- **GIVEN** listado crítico en viewport angosto
- **WHEN** se inspecciona layout
- **THEN** DEBE ser usable sin unificar breakpoints
