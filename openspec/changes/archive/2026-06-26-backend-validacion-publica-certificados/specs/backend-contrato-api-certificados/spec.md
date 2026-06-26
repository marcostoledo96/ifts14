# Delta — contrato de API para certificados QR

## MODIFIED Requirements

### Requirement: Contrato público de verificación

La API MUST exponer un contrato JSON para validar certificados desde QR o enlace con respuesta pública mínima bajo la URL desplegada `/certificados/api/certificados/{token}/verificacion`; la ruta PHP normalizada MAY omitir el prefijo `/certificados/api` si el front controller ya lo resolvió.
(Previously: definía el contrato futuro sin distinguir URL pública desplegada y ruta PHP normalizada.)

#### Scenario: Certificado válido

- **Given** un token público con formato válido y certificado vigente
- **When** se consulta `GET /certificados/api/certificados/{token}/verificacion`
- **Then** la respuesta MUST ser `200` con `data.valid: true`, estado, código de certificado, curso, fecha de emisión y documento enmascarado.
- **And** MUST NOT incluir DNI completo, token completo ni datos internos.

#### Scenario: Token no verificable

- **Given** un token inexistente, revocado, vencido o no actual
- **When** se consulta la verificación pública
- **Then** la respuesta MUST usar `404 CERTIFICATE_NOT_FOUND` sin revelar cuál condición ocurrió.

### Requirement: Consulta alternativa por POST

La API MUST ofrecer `POST /certificados/api/certificados/consulta` con body JSON `{ "token": "..." }` y MUST reutilizar el mismo DTO público de verificación.
(Previously: el POST era opcional.)

#### Scenario: Consulta POST válida

- **Given** un cliente que no puede enviar el token como path param
- **When** envía `POST /certificados/api/certificados/consulta` con token válido
- **Then** la API MUST responder con el mismo contrato que el endpoint `GET` de verificación.

### Requirement: Validación y seguridad del token QR

El token público MUST validarse antes de consultar la base y MUST buscarse como `SHA-256(token + token_pepper)` con `token_pepper` externo a Git y PDO prepared statements.
(Previously: permitía hash o estrategia equivalente.)

#### Scenario: Token con formato permitido

- **Given** un token de 32 a 128 caracteres alfanuméricos con `_` o `-`
- **When** llega a la API
- **Then** la API MUST calcular el hash con pepper externo y MUST consultarlo con prepared statements.

#### Scenario: Logs seguros

- **Given** una verificación pública exitosa o fallida
- **When** se registran eventos técnicos o de auditoría
- **Then** los logs MUST NOT incluir token completo, DNI completo, credenciales ni SQL con parámetros reales.

### Requirement: Conceptos de datos futuros sin migración

El contrato MUST usar las tablas `cert_` ya definidas, MUST mantener `token_pepper` en configuración externa y MUST alinear los seeds demo con `SHA-256(token + token_pepper)` sin crear migraciones nuevas en este ciclo.
(Previously: documentaba conceptos futuros y prohibía migraciones nuevas.)

#### Scenario: Conceptos documentados

- **Given** este ciclo finalizado
- **When** se lee la documentación de backend y base
- **Then** SHOULD figurar `cert_certificados`, `cert_tokens_verificacion` y `cert_eventos_auditoria` como tablas existentes del modelo.
- **And** MUST NOT existir migración SQL nueva por este cambio.
