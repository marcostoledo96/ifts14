# Spec — admin-certificate-emission

## Purpose

Definir la emisión administrativa mínima de certificados QR con generación de PDF/QR: el endpoint `POST /certificados/api/admin/certificados` crea un certificado y un token de verificación permanente sobre el esquema `cert_` existente, sin migraciones nuevas, exige autorización administrativa, valida un payload mínimo ficticio/demo, persiste con PDO y prepared statements, genera y persiste el PDF/QR durante la emisión (antes del alta lógico) y responde con un DTO operativo seguro que NO expone el token completo; las respuestas operativas administrativas, logs y auditoría NO DEBEN exponer el DNI completo ni el token completo (salvo DTOs explícitamente públicos cuando la decisión institucional lo requiera), incluyendo `pdfDownloadUrl` para descarga administrativa del PDF. Esta spec separa explícitamente el acto de "token activo persistido + PDF emitido" (cubierto en este ciclo) de la "verificación pública del token recién emitido" (dependiente del mecanismo de entrega/reenvío, fuera de alcance).

## Requirements

### Requirement: Emisión administrativa mínima de certificados

La API MUST exponer `POST /certificados/api/admin/certificados` para emitir un certificado y un token de verificación permanente usando el esquema `cert_` existente, sin migraciones nuevas. El endpoint MUST requerir autorización administrativa, validar un payload mínimo ficticio/demo, persistir con PDO y prepared statements, auditar la acción, generar el PDF/QR durante la emisión (antes de confirmar el alta lógico) y responder con un DTO operativo seguro sin token completo. Las respuestas operativas administrativas, logs y auditoría MUST NOT exponer el DNI completo ni el token completo, salvo DTOs explícitamente públicos cuando la decisión institucional lo requiera. El DTO de emisión exitosa MUST incluir `pdfDownloadUrl` apuntando a `GET /certificados/api/admin/certificados/{id}/pdf` y MUST NOT exponer el token completo. `X-Admin-Key` es un mecanismo de API server-to-server y MUST NOT estar embebido ni expuesto desde bundles de Angular, `localStorage`, `sessionStorage` ni ningún almacenamiento del navegador. La UI administrativa en navegador para el MVP MUST usar cPanel Basic Auth o una sesión PHP simple con cookie `HttpOnly`+`Secure`+`SameSite`; el cliente navegador no DEBE conocer ni transportar `X-Admin-Key`.
(Previously: la emisión devolvía identificadores y datos enmascarados sin generar PDF ni exponer `pdfDownloadUrl`; el token no se declaraba permanente; no se separaba autenticación browser de API key.)

#### Scenario: Emisión exitosa

- **Given** un request autorizado con payload mínimo válido y `public_base_url`/`certificate_storage_path` configurados
- **When** se emite el certificado administrativo
- **Then** la API MUST crear certificado y token activo persistido en el esquema `cert_` existente, generar y persistir el PDF/QR antes de confirmar la operación, y dejar el certificado listo para verificación pública una vez que el token sea entregado al destinatario.
- **And** MUST responder `201` con identificadores, estado, DTO operativo seguro (sin token completo; sin DNI completo en respuesta operativa/logs/auditoría salvo DTO explícitamente público) y `pdfDownloadUrl`.
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

#### Scenario: `X-Admin-Key` no expuesta desde el navegador

- **Given** la UI administrativa en navegador Angular consumiendo el endpoint de emisión
- **When** se inspecciona el bundle, `localStorage`, `sessionStorage` y cookies del navegador
- **Then** MUST NOT aparecer `X-Admin-Key` ni su valor en ningún almacenamiento del navegador ni en el bundle JS.
- **And** la UI admin MUST usar cPanel Basic Auth o sesión PHP `HttpOnly` para el MVP.

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
