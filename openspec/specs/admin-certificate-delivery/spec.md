# Spec — admin-certificate-delivery

## Purpose

Definir la entrega y reenvío administrativo de certificados por email mediante un enlace público de validación. El flujo conserva el token completo fuera de la base, los logs y la respuesta JSON; el QR/token se trata como permanente durante la vida del certificado y se conserva en un reenvío normal (no rota en flujo normal). El transporte de email queda como adaptador configurable con modo `stub` o `smtp`, y SMTP real queda bloqueado por gate humano mientras Composer/vendor y credenciales externas no estén confirmadas.

## Requirements

### Requirement: Reenvío administrativo por email

La API MUST exponer `POST /certificados/api/admin/certificados/{id}/reenviar` protegido por `X-Admin-Key`. El endpoint MUST conservar el token de verificación activo del certificado en un reenvío normal, enviar o simular por email el enlace público de validación y responder `200` con un DTO de entrega que NO contenga el token completo. La revocación explícita es la única vía válida para invalidar el token; el reenvío normal NO rota token. `X-Admin-Key` es un mecanismo de API server-to-server y MUST NOT estar embebido ni expuesto desde bundles de Angular, `localStorage`, `sessionStorage` ni ningún almacenamiento del navegador. La UI administrativa en navegador para el MVP MUST usar cPanel Basic Auth o una sesión PHP simple con cookie `HttpOnly`+`Secure`+`SameSite`; el cliente navegador no DEBE conocer ni transportar `X-Admin-Key`.

#### Scenario: Reenvío exitoso

- **Given** un certificado emitido con token activo, email del destinatario disponible y transporte configurado
- **When** se invoca `POST /certificados/api/admin/certificados/{id}/reenviar` con `X-Admin-Key` válido
- **Then** la API MUST conservar el token activo, enviar o simular el enlace público y responder `200` con `{ data: { certificadoId, enviadoEn, destinatarioEnmascarado } }`.
- **And** MUST NOT incluir el token completo en la respuesta JSON, en logs ni en auditoría.
- **And** MUST NOT rotar token ni revocar el token previo en flujo normal.

#### Scenario: Token conservado tras reenvío

- **Given** un certificado con un token activo `T_vigente`
- **When** se ejecuta el reenvío
- **Then** la API MUST mantener `T_vigente` activo para verificaciones posteriores.
- **And** una verificación posterior con `T_vigente` MUST responder `200` con DTO público válido.

#### Scenario: Reenvío sin autorización

- **Given** un request al endpoint de reenvío sin `X-Admin-Key` o con clave inválida
- **When** la API procesa la solicitud
- **Then** MUST responder `401 UNAUTHORIZED` con sobre de error seguro.
- **And** MUST NOT rotar token, enviar email ni auditar reenvío.

#### Scenario: `X-Admin-Key` no expuesta desde el navegador

- **Given** la UI administrativa en navegador Angular consumiendo endpoints admin
- **When** se inspecciona el bundle, `localStorage`, `sessionStorage` y cookies del navegador
- **Then** MUST NOT aparecer `X-Admin-Key` ni su valor en ningún almacenamiento del navegador ni en el bundle JS.
- **And** la UI admin MUST usar cPanel Basic Auth o sesión PHP `HttpOnly` para el MVP.

#### Scenario: Respuesta admin sin DNI ni token completo

- **Given** un reenvío autorizado exitoso o fallido
- **When** se inspecciona la respuesta JSON administrativa
- **Then** MUST NOT incluir DNI completo ni token completo en ningún campo de la respuesta operativa.

#### Scenario: Certificado inexistente

- **Given** un `id` que no corresponde a un certificado existente
- **When** se invoca el reenvío autorizado
- **Then** MUST responder `404 CERTIFICATE_NOT_FOUND` sin revelar detalles internos.

#### Scenario: Transporte no configurado

- **Given** el transporte de email en modo `stub` o SMTP no confirmado
- **When** se invoca el reenvío autorizado
- **Then** la API MUST responder `503 DELIVERY_NOT_CONFIGURED` o un DTO con `canal: stub` sin rotar token ni emitir email real.
- **And** el mensaje MUST indicar explícitamente que el envío real está deshabilitado.

### Requirement: Privacidad del token en el canal de entrega

El sistema MUST transportar el token completo únicamente dentro del email del destinatario y MUST NOT persistirlo en texto plano en base, logs, auditoría ni respuesta JSON. El enlace enviado MUST apuntar a la ruta pública de validación.

#### Scenario: Token solo en email

- **Given** un reenvío exitoso
- **When** se inspeccionan logs, auditoría y respuesta JSON
- **Then** MUST NOT aparecer el token completo en ninguno de esos canales.
- **And** el email MUST contener exclusivamente el enlace `/certificados/validar/{token}`.

#### Scenario: Auditoría de entrega sin token

- **Given** un reenvío exitoso o fallido
- **When** se registra el evento en `cert_eventos_auditoria`
- **Then** MUST guardar `certificado_id`, tipo `reenvio`, resultado y `request_id`.
- **And** MUST NOT guardar el token completo, DNI completo ni credenciales SMTP.

### Requirement: Adaptador de transporte configurable

El sistema MUST usar un adaptador de transporte de email desacoplado del servicio de entrega, configurable por variable externa a Git. El adaptador MUST ofrecer al menos un modo `stub` que no envíe email real y un modo `smtp` que requiera credenciales externas. El sistema MUST NOT declarar una entrega como exitosa cuando opera en modo `stub`. El sistema MUST bloquear el envío real por gate humano mientras Composer/vendor y credenciales SMTP no estén confirmadas; este ciclo documental NO agrega dependencias ni habilita SMTP real.

#### Scenario: Modo stub explícito

- **Given** la configuración de transporte en modo `stub`
- **When** se invoca el reenvío
- **Then** la API MUST responder `503 DELIVERY_NOT_CONFIGURED` o un DTO que indique `canal: stub` sin rotar token ni enviar email.
- **And** MUST NOT registrar el intento como entrega real exitosa.

#### Scenario: Modo SMTP sin credenciales

- **Given** el modo `smtp` seleccionado pero sin credenciales configuradas
- **When** se invoca el reenvío
- **Then** MUST responder `503 DELIVERY_NOT_CONFIGURED` sin rotar token.

#### Scenario: Modo SMTP con credenciales

- **Given** credenciales SMTP válidas en configuración externa y Composer/vendor confirmado en hosting
- **When** se invoca el reenvío autorizado
- **Then** la API MAY enviar el email real y responder `200` con `destinatarioEnmascarado`.

#### Scenario: Gate Composer/SMTP

- **Given** que Composer/vendor o SMTP real no están confirmados en hosting
- **When** se documenta entrega por email
- **Then** el envío real MUST quedar bloqueado por gate humano.
- **And** el modo de prueba MUST usar datos ficticios.

### Requirement: Contenido del email limitado a enlace

El email de entrega MUST contener el enlace público de validación y datos institucionales mínimos. El sistema MUST NOT adjuntar el PDF ni incluir el token completo fuera del enlace hasta que una decisión explícita habilite el adjunto.

#### Scenario: Email solo con enlace

- **Given** una entrega exitosa en modo SMTP
- **When** se construye el cuerpo del email
- **Then** MUST incluir el enlace `/certificados/validar/{token}` y MUST NOT adjuntar el PDF.

#### Scenario: Adjunto de PDF diferido

- **Given** una decisión pendiente sobre adjuntar el PDF
- **When** se inspecciona la spec/contrato
- **Then** el adjunto MUST quedar registrado como fuera de alcance hasta decisión explícita.

### Requirement: Bloqueo de envío real sin configuración confirmada

El sistema MUST impedir cualquier envío de email real mientras no exista configuración SMTP/cPanel confirmada por Marcos. La ausencia de configuración MUST traducirse en una respuesta de error segura, no en un envío silencioso ni en un log con datos sensibles.

#### Scenario: Sin decisión Composer/SMTP

- **Given** `composer.lock` sin PHPMailer y transporte en modo `stub`
- **When** se invoca el reenvío
- **Then** MUST responder `503 DELIVERY_NOT_CONFIGURED` y MUST NOT agregar dependencias automáticamente.

#### Scenario: Decisión SMTP confirmada

- **Given** Marcos confirma SMTP y reproducibilidad Composer
- **When** se configura el transporte en modo `smtp` con credenciales externas
- **Then** el sistema MAY habilitar el envío real sin cambiar este contrato.

### Requirement: Rollback documentado

El cambio MUST incluir un plan de rollback que retire la ruta de reenvío, desactive el transporte en configuración externa y revierta los deltas de docs/specs sin invalidar certificados existentes.

#### Scenario: Rollback ejecutable

- **Given** el cambio aplicado
- **When** se ejecuta el rollback
- **Then** MUST quedar removida la ruta `POST /admin/certificados/{id}/reenviar`, desactivado el transporte y conservados los certificados y tokens vigentes.
