# Delta — backend-contrato-api-certificados

## ADDED Requirements

### Requirement: Contrato administrativo mínimo de certificados

La API MUST documentar y sostener endpoints administrativos bajo `/certificados/api/admin/` protegidos por `X-Admin-Key`: `POST /admin/certificados` para emisión y `POST /admin/certificados/{id}/revocar` para revocación. Las respuestas MUST usar envelopes JSON existentes, DTOs seguros y errores sin DNI completo, token completo, secretos, SQL ni rutas internas.

#### Scenario: Admin sin autorización

- **Given** un request a un endpoint administrativo sin `X-Admin-Key` válido
- **When** la API procesa la solicitud
- **Then** MUST responder `401 UNAUTHORIZED` con sobre de error seguro.

#### Scenario: Emisión documentada

- **Given** un request autorizado con payload mínimo válido
- **When** se invoca `POST /certificados/api/admin/certificados`
- **Then** el contrato MUST indicar `201` con certificado emitido y datos sensibles enmascarados.
- **And** MUST NOT devolver DNI completo ni token completo.

#### Scenario: Revocación documentada

- **Given** un request autorizado para un certificado revocable
- **When** se invoca `POST /certificados/api/admin/certificados/{id}/revocar`
- **Then** el contrato MUST indicar revocación del certificado e invalidación de tokens activos.

### Requirement: Reenvío administrativo excluido

El contrato MUST dejar explícitamente fuera de alcance `POST /certificados/api/admin/certificados/{id}/reenviar` hasta definir mecanismo de email/reenvío. La implementación MUST NOT crear endpoint, DTO ni lógica de reenvío en este ciclo.

#### Scenario: Reenvío no disponible

- **Given** este ciclo finalizado
- **When** se inspecciona o invoca una ruta de reenvío administrativo
- **Then** MUST no existir como capacidad implementada/documentada para uso operativo.
- **And** SHOULD quedar registrada como pendiente hasta definir email.
