# Delta — admin-certificate-emission

## ADDED Requirements

### Requirement: Emisión administrativa mínima de certificados

La API MUST exponer `POST /certificados/api/admin/certificados` para emitir un certificado y un token de verificación usando el esquema `cert_` existente, sin migraciones nuevas. El endpoint MUST requerir autorización administrativa, validar un payload mínimo ficticio/demo, persistir con PDO y prepared statements, auditar la acción y responder con un DTO seguro sin DNI completo ni token completo.

#### Scenario: Emisión exitosa

- **Given** un request autorizado con payload mínimo válido
- **When** se emite el certificado administrativo
- **Then** la API MUST crear certificado y token activo persistido en el esquema `cert_` existente, listo para verificación pública una vez que el token sea entregado al destinatario.
- **And** MUST responder `201` con identificadores, estado y datos enmascarados.
- **And** MUST NOT devolver el token completo; la entrega o reenvío del token queda fuera de este ciclo.

#### Scenario: Payload inválido

- **Given** un request autorizado con campos requeridos ausentes o inválidos
- **When** se solicita la emisión
- **Then** la API MUST responder `400 VALIDATION_ERROR` sin persistir certificado ni token.

#### Scenario: Auditoría segura

- **Given** una emisión exitosa o rechazada
- **When** se registra auditoría
- **Then** MUST guardar acción, resultado y `request_id` sin DNI completo, token completo, SQL ni secretos.

#### Scenario: Persistencia segura

- **Given** un payload de emisión aceptado
- **When** la API consulta o escribe datos
- **Then** MUST usar PDO con prepared statements y MUST NOT construir SQL con valores concatenados.
