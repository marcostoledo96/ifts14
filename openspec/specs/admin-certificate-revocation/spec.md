# Spec — admin-certificate-revocation

## Purpose

Definir la revocación administrativa de certificados QR: el endpoint `POST /certificados/api/admin/certificados/{id}/revocar` revoca un certificado existente, invalida sus tokens activos, audita la acción y responde con errores seguros. La revocación opera sobre el esquema `cert_` existente sin migraciones nuevas, exige autorización administrativa y se integra con la verificación pública de modo que un token revocado deja de ser verificable como vigente.

## Requirements

### Requirement: Revocación administrativa de certificados

La API MUST exponer `POST /certificados/api/admin/certificados/{id}/revocar` para revocar un certificado existente, invalidar sus tokens activos, auditar la acción y responder con errores seguros. El endpoint MUST requerir autorización administrativa y MUST usar el esquema `cert_` existente sin migraciones nuevas.

#### Scenario: Revocación exitosa

- **Given** un request autorizado y un certificado revocable
- **When** se solicita su revocación
- **Then** la API MUST marcar el certificado como revocado e invalidar sus tokens activos.
- **And** MUST responder `200` con DTO seguro sin DNI completo ni token completo.

#### Scenario: Certificado inexistente o no revocable

- **Given** un id inexistente o un certificado que no puede revocarse
- **When** se solicita la revocación
- **Then** la API MUST responder un error seguro sin exponer SQL, datos internos ni valores sensibles.

#### Scenario: Token revocado no verifica públicamente

- **Given** un certificado revocado por endpoint administrativo
- **When** se consulta su token por la API pública de verificación
- **Then** el token invalidado MUST NOT verificarse como certificado vigente.

#### Scenario: Auditoría de revocación

- **Given** una revocación exitosa o rechazada
- **When** se registra auditoría
- **Then** MUST guardar acción, resultado y `request_id` sin DNI completo, token completo, SQL ni secretos.
