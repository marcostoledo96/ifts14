# Delta para backend-contrato-api-certificados

## MODIFIED Requirements

### Requirement: Contrato administrativo mínimo de certificados

La API MUST documentar y sostener endpoints administrativos bajo `/certificados/api/admin/` protegidos por `X-Admin-Key`: `POST /admin/certificados` para emisión (con generación PDF/QR sincrónica y `pdfDownloadUrl` en la respuesta `201`), `POST /admin/certificados/{id}/revocar` para revocación, `GET /admin/certificados/{id}/pdf` para descarga del PDF persistido y `POST /admin/certificados/{id}/reenviar` para entrega/reenvío por email con rotación de token. Las respuestas MUST usar envelopes JSON existentes, DTOs seguros y errores sin DNI completo, token completo, secretos, SQL ni rutas internas. El endpoint de descarga MUST responder `Content-Type: application/pdf` y `Content-Disposition: attachment` ante autorización válida, `401 UNAUTHORIZED` sin autorización y `404 PDF_NOT_FOUND` si el PDF no existe. El endpoint de reenvío MUST responder `200` con DTO de entrega sin token completo, `401 UNAUTHORIZED` sin autorización, `404 CERTIFICATE_NOT_FOUND` si el certificado no existe y `503 DELIVERY_NOT_CONFIGURED` si el transporte no está configurado.
(Previously: el contrato administrativo cubría emisión, revocación y descarga PDF; el reenvío estaba explícitamente excluido.)

#### Scenario: Admin sin autorización

- **Given** un request a un endpoint administrativo sin `X-Admin-Key` válido
- **When** la API procesa la solicitud
- **Then** MUST responder `401 UNAUTHORIZED` con sobre de error seguro.

#### Scenario: Emisión documentada con PDF

- **Given** un request autorizado con payload mínimo válido y `public_base_url`/`certificate_storage_path` configurados
- **When** se invoca `POST /certificados/api/admin/certificados`
- **Then** el contrato MUST indicar `201` con certificado emitido, PDF/QR generado y `pdfDownloadUrl` presente.
- **And** MUST NOT devolver DNI completo ni token completo.

#### Scenario: Descarga PDF documentada

- **Given** un request autorizado a `GET /certificados/api/admin/certificados/{id}/pdf` para un certificado con PDF persistido
- **When** se invoca el endpoint
- **Then** el contrato MUST indicar `200` con `Content-Type: application/pdf` y `Content-Disposition: attachment`.

#### Scenario: Descarga PDF sin autorización documentada

- **Given** un request sin `X-Admin-Key` válido al endpoint de descarga PDF
- **When** se invoca el endpoint
- **Then** el contrato MUST indicar `401 UNAUTHORIZED` con sobre de error seguro.

#### Scenario: Descarga PDF inexistente documentada

- **Given** un request autorizado a un certificado sin PDF persistido
- **When** se invoca el endpoint de descarga
- **Then** el contrato MUST indicar `404 PDF_NOT_FOUND` sin revelar rutas internas.

#### Scenario: Revocación documentada

- **Given** un request autorizado para un certificado revocable
- **When** se invoca `POST /certificados/api/admin/certificados/{id}/revocar`
- **Then** el contrato MUST indicar revocación del certificado e invalidación de tokens activos.

#### Scenario: Reenvío documentado

- **Given** un request autorizado a `POST /certificados/api/admin/certificados/{id}/reenviar` con transporte configurado
- **When** se invoca el endpoint
- **Then** el contrato MUST indicar `200` con DTO de entrega `{ certificadoId, enviadoEn, destinatarioEnmascarado }`.
- **And** MUST NOT incluir el token completo en la respuesta.

#### Scenario: Reenvío sin transporte configurado

- **Given** un request autorizado al reenvío sin transporte SMTP configurado
- **When** se invoca el endpoint
- **Then** el contrato MUST indicar `503 DELIVERY_NOT_CONFIGURED` sin rotar token ni enviar email.

## REMOVED Requirements

### Requirement: Reenvío administrativo excluido

(Reason: el cambio `admin-certificate-delivery` incorpora el reenvío como capacidad operativa con contrato, DTO y errores definidos.)
(Migration: la exclusión queda reemplazada por el escenario "Reenvío documentado" dentro del contrato administrativo mínimo y por la spec `admin-certificate-delivery`. Tests/docs que afirmaban la exclusión deben actualizarse al contrato nuevo.)