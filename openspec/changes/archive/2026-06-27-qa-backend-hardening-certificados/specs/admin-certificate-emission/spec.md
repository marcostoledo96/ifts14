# Delta — admin-certificate-emission

## ADDED Requirements

### Requirement: Rechazo de JSON malformado en emisión

El endpoint `POST /certificados/api/admin/certificados` MUST rechazar JSON malformado con `400 VALIDATION_ERROR` antes de emitir certificado, crear token, auditar acción de negocio o ejecutar cualquier persistencia.

#### Scenario: Emisión con JSON malformado

- **Given** un request autorizado a emisión con `Content-Type: application/json`
- **When** el body JSON está malformado
- **Then** la API MUST responder `400 VALIDATION_ERROR`.
- **And** MUST NOT persistir certificado, token ni auditoría de emisión.

#### Scenario: Emisión con JSON parseable

- **Given** un request autorizado con JSON parseable
- **When** el payload tiene campos requeridos ausentes o inválidos
- **Then** la API MUST conservar `400 VALIDATION_ERROR` sin persistir certificado ni token.
