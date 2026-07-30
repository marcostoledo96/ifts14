# Delta for admin-certificate-delivery-frontend

## MODIFIED Requirements

### REQ-DEL-007: Foco y escape en diálogos

**Prioridad**: MEDIUM

Diálogos de entrega (incl. error-dialog) DEBEN atrapar Tab en dialog+backdrop; backdrop NO DEBE recibir Tab fuera del trap. Escape DEBE cerrar si operable. Retorno de foco DEBERÍA ser soft; si navega de ruta, retorno vía nueva vista ES suficiente — DEBE NOT hard-fail por falta de restore SPA al opener.

(Previously: Esc + retorno duro al opener; sin trap de backdrop ni error-dialog.)

#### Scenario: Escape cierra diálogo

- **GIVEN** diálogo abierto en entrega
- **WHEN** Escape
- **THEN** el diálogo DEBE cerrarse

#### Scenario: Tab no escapa por backdrop

- **GIVEN** diálogo de entrega con backdrop
- **WHEN** Tab
- **THEN** foco DEBE permanecer en dialog+backdrop atrapados

#### Scenario: Error-dialog usable con teclado

- **GIVEN** error-dialog de entrega abierto
- **WHEN** navegación teclado
- **THEN** DEBE atrapar Tab; Esc DEBE cerrar si operable

#### Scenario: Retorno de foco soft

- **GIVEN** cierre que navega al expediente u otra ruta
- **WHEN** termina la navegación SPA
- **THEN** retorno soft vía nueva vista ES suficiente
