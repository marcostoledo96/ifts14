# Delta para admin-certificate-emission

## MODIFIED Requirements

### Requirement: Emisión administrativa mínima de certificados

La API MUST exponer `POST /certificados/api/admin/certificados` para emitir un certificado y un token de verificación usando el esquema `cert_` existente, sin migraciones nuevas. El endpoint MUST requerir autorización administrativa, validar un payload mínimo ficticio/demo, persistir con PDO y prepared statements, auditar la acción, generar el PDF/QR durante la emisión (antes de confirmar el alta lógico) y responder con un DTO seguro sin DNI completo ni token completo. El DTO de emisión exitosa MUST incluir `pdfDownloadUrl` apuntando a `GET /certificados/api/admin/certificados/{id}/pdf` y MUST NOT exponer el token completo.
(Previously: la emisión devolvía identificadores y datos enmascarados sin generar PDF ni exponer `pdfDownloadUrl`.)

#### Scenario: Emisión exitosa

- **Given** un request autorizado con payload mínimo válido y `public_base_url`/`certificate_storage_path` configurados
- **When** se emite el certificado administrativo
- **Then** la API MUST crear certificado y token activo persistido en el esquema `cert_` existente, generar y persistir el PDF/QR antes de confirmar la operación, y dejar el certificado listo para verificación pública una vez que el token sea entregado al destinatario.
- **And** MUST responder `201` con identificadores, estado, datos enmascarados y `pdfDownloadUrl`.
- **And** MUST NOT devolver el token completo; la entrega o reenvío del token queda fuera de este ciclo.

#### Scenario: Falla la generación de PDF durante la emisión

- **Given** un payload de emisión válido pero la generación o persistencia del PDF falla
- **When** se ejecuta `emitir()`
- **Then** la API MUST abortar la emisión sin confirmar el alta lógico del certificado
- **And** MUST responder con un sobre de error seguro sin dejar un certificado emitido sin PDF.

#### Scenario: Payload inválido

- **Given** un request autorizado con campos requeridos ausentes o inválidos
- **When** se solicita la emisión
- **Then** la API MUST responder `400 VALIDATION_ERROR` sin persistir certificado ni token ni generar PDF.

#### Scenario: Auditoría segura

- **Given** una emisión exitosa o rechazada
- **When** se registra auditoría
- **Then** MUST guardar acción, resultado y `request_id` sin DNI completo, token completo, SQL ni secretos.

#### Scenario: Persistencia segura

- **Given** un payload de emisión aceptado
- **When** la API consulta o escribe datos
- **Then** MUST usar PDO con prepared statements y MUST NOT construir SQL con valores concatenados.

## ADDED Requirements

### Requirement: DTO de emisión ampliado con `pdfDownloadUrl`

La respuesta `201` de `POST /certificados/api/admin/certificados` MUST incluir el campo `pdfDownloadUrl` con la URL absoluta del endpoint de descarga PDF del certificado emitido. El campo MUST NOT contener el token completo ni parámetros que lo expongan.

#### Scenario: Respuesta con `pdfDownloadUrl`

- **Given** una emisión exitosa con PDF generado y persistido
- **When** la API arma la respuesta `201`
- **Then** MUST incluir `pdfDownloadUrl` apuntando a `GET /certificados/api/admin/certificados/{id}/pdf`
- **And** MUST NOT incluir el token completo en la URL ni en el cuerpo de la respuesta.

#### Scenario: Respuesta sin token completo

- **Given** cualquier respuesta de emisión (éxito o error)
- **When** se inspecciona el cuerpo JSON
- **Then** MUST NOT aparecer el token completo de verificación en ningún campo.