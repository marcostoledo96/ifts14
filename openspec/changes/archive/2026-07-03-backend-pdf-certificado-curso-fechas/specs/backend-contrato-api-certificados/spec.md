# Delta — backend-contrato-api-certificados

## ADDED Requirements

### Requirement: Preservación del contrato administrativo durante PDF institucional

El cambio de contenido del PDF DEBE conservar sin cambios los contratos administrativos existentes de emisión, descarga de PDF y entrega manual. La API NO DEBE agregar SMTP, email, reenvío automático, endpoint de edición de configuración institucional, rotación de token ni cambios en el DTO operativo por este ciclo.

#### Scenario: Emisión conserva DTO administrativo

- DADO un request autorizado a `POST /certificados/api/admin/certificados`
- CUANDO la emisión genera el PDF institucional
- ENTONCES la respuesta DEBE conservar `201`, `publicValidationUrl`, `pdfDownloadUrl` y `tokenPrefix`.
- Y NO DEBE incluir token completo independiente, DNI completo administrativo ni campos nuevos de configuración institucional.

#### Scenario: Descarga PDF conserva contrato

- DADO un certificado emitido con PDF institucional persistido
- CUANDO se invoca `GET /certificados/api/admin/certificados/{id}/pdf` con `X-Admin-Key` válido
- ENTONCES la API DEBE responder `200` con `Content-Type: application/pdf` y `Content-Disposition: attachment`.
- Y NO DEBE exponer rutas internas, token completo ni configuración sensible.

#### Scenario: Entrega manual no rota ni envía email

- DADO un certificado emitido con token recuperable y PDF institucional
- CUANDO se invoca `GET /certificados/api/admin/certificados/{id}/entrega-manual`
- ENTONCES la API DEBE responder con `publicValidationUrl`, `pdfDownloadUrl` y `tokenPrefix` existentes.
- Y NO DEBE rotar token, enviar email, activar SMTP/PHPMailer ni modificar estado de negocio.

#### Scenario: Reenvío automático sigue fuera de alcance

- DADO un cliente que intenta usar reenvío automático o edición de configuración institucional
- CUANDO consulta rutas no incluidas en el MVP
- ENTONCES la API DEBE responder ruta inexistente o método no permitido con error seguro.
- Y NO DEBE crear comportamiento nuevo de SMTP, reenvío ni configuración editable.
