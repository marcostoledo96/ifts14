# Delta for backend-validacion-publica-certificados

## MODIFIED Requirements

### Requirement: Configuración, seed y rate limiting

El ejemplo versionable MUST incluir `token_pepper`; la configuración real MUST permanecer externa. El seed demo MUST alinear `token_hash` con el pepper de ejemplo. El sistema MUST aplicar rate limiting mínimo a GET y POST con umbral/ventana configurables, sin dependencia nueva ni migración SQL.
(Previously: el rate limiting quedaba documentado como pendiente y no debía implementarse en ese ciclo.)

#### Scenario: Seed demo coherente

- **Given** el token demo ficticio y el pepper de ejemplo
- **When** se calcula el hash esperado
- **Then** MUST coincidir con el valor del seed demo.

#### Scenario: Rate limiting en endpoints públicos

- **Given** un bucket público que excedió el umbral configurado
- **When** se invoca GET o POST dentro de la ventana
- **Then** la API MUST responder `429 RATE_LIMITED` sin consultar ni devolver datos del certificado.

#### Scenario: Estado local sin datos sensibles

- **Given** actividad pública de validación con IP, token y posible DNI asociado al certificado
- **When** se guarda el estado del rate limiter
- **Then** MUST NOT persistirse IP cruda, token completo ni DNI.
