# Spec — admin-certificate-delivery

## Purpose

Definir la entrega y reenvío administrativo de certificados por email mediante un enlace público de validación. El flujo conserva el token completo fuera de la base, los logs y la respuesta JSON; rota el token en cada reenvío y deja el transporte de email como adaptador configurable, bloqueando el envío real mientras no exista configuración SMTP confirmada.

## Requirements

### Requirement: Reenvío administrativo por email

La API MUST exponer `POST /certificados/api/admin/certificados/{id}/reenviar` protegido por `X-Admin-Key`. El endpoint MUST rotar el token de verificación activo del certificado (revocar el anterior y emitir uno nuevo), enviar por email únicamente el enlace público de validación con el token nuevo y responder `200` con un DTO de entrega que NO contenga el token completo.

#### Scenario: Reenvío exitoso

- **Given** un certificado emitido con token activo, email del destinatario disponible y transporte configurado
- **When** se invoca `POST /certificados/api/admin/certificados/{id}/reenviar` con `X-Admin-Key` válido
- **Then** la API MUST rotar el token activo, enviar el enlace público por email y responder `200` con `{ data: { certificadoId, enviadoEn, destinatarioEnmascarado } }`.
- **And** MUST NOT incluir el token completo en la respuesta JSON, en logs ni en auditoría.

#### Scenario: Rotación revoca token anterior

- **Given** un certificado con un token activo `T_viejo`
- **When** se ejecuta el reenvío
- **Then** la API MUST marcar `T_viejo` como revocado y MUST crear un nuevo token `T_nuevo` activo.
- **And** una verificación posterior con `T_viejo` MUST responder `404 CERTIFICATE_NOT_FOUND`.

#### Scenario: Reenvío sin autorización

- **Given** un request al endpoint de reenvío sin `X-Admin-Key` o con clave inválida
- **When** la API procesa la solicitud
- **Then** MUST responder `401 UNAUTHORIZED` con sobre de error seguro.
- **And** MUST NOT rotar token, enviar email ni auditar reenvío.

#### Scenario: Certificado inexistente

- **Given** un `id` que no corresponde a un certificado existente
- **When** se invoca el reenvío autorizado
- **Then** MUST responder `404 CERTIFICATE_NOT_FOUND` sin revelar detalles internos.

#### Scenario: Transporte no configurado

- **Given** el transporte de email sin configuración SMTP válida
- **When** se invoca el reenvío autorizado
- **Then** la API MUST responder `503 DELIVERY_NOT_CONFIGURED` sin rotar token ni emitir email.
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

El sistema MUST usar un adaptador de transporte de email desacoplado del servicio de entrega, configurable por variable externa a Git. El adaptador MUST ofrecer al menos un modo `stub` que no envíe email real y un modo `smtp` que requiera credenciales externas. El sistema MUST NOT declarar una entrega como exitosa cuando opera en modo `stub`.

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

- **Given** credenciales SMTP válidas en configuración externa
- **When** se invoca el reenvío autorizado
- **Then** la API MAY enviar el email real y responder `200` con `destinatarioEnmascarado`.

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