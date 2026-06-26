# Spec — contrato de API para certificados QR

## Purpose

Definir el contrato público de la API de certificados QR bajo `/certificados/api/`, consolidando el contrato público de verificación implementado en PHP 8.4 con prepared statements y lookup seguro por hash con pepper. Esta spec reemplaza la versión anterior que describía solo el contrato futuro: tras el ciclo `backend-validacion-publica-certificados` los endpoints `GET .../verificacion` y `POST .../consulta` están implementados y verificados en DB local ficticia, mientras que los endpoints administrativos de emisión, revocación y reenvío siguen fuera de alcance para ciclos posteriores.

## Requirements

### Requirement: Contrato público de verificación

La API MUST exponer un contrato JSON para validar certificados desde QR o enlace con respuesta pública mínima bajo la URL desplegada `/certificados/api/certificados/{token}/verificacion`; la ruta PHP normalizada MAY omitir el prefijo `/certificados/api` si el front controller ya lo resolvió.

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

#### Scenario: Consulta POST válida

- **Given** un cliente que no puede enviar el token como path param
- **When** envía `POST /certificados/api/certificados/consulta` con token válido
- **Then** la API MUST responder con el mismo contrato que el endpoint `GET` de verificación.

### Requirement: Sobre de errores estable

Toda respuesta de error MUST usar `{ error: { code, message, details }, meta: { requestId } }` y MUST NOT exponer SQL, rutas internas, credenciales, DNI completo ni token completo.

#### Scenario: Token inválido por formato

- **Given** un token ausente o con caracteres no permitidos
- **When** se consulta la API
- **Then** la respuesta MUST ser `400 VALIDATION_ERROR` con mensaje seguro y sin valores sensibles.

#### Scenario: Error interno

- **Given** una falla inesperada del backend
- **When** la API responde al cliente público
- **Then** la respuesta MUST ser `500 INTERNAL_ERROR` sin stack trace ni rutas internas.

### Requirement: Validación y seguridad del token QR

El token público MUST validarse antes de consultar la base y MUST buscarse como `SHA-256(token + token_pepper)` con `token_pepper` externo a Git y PDO prepared statements.

#### Scenario: Token con formato permitido

- **Given** un token de 32 a 128 caracteres alfanuméricos con `_` o `-`
- **When** llega a la API
- **Then** la API MUST calcular el hash con pepper externo y MUST consultarlo con prepared statements.

#### Scenario: Logs seguros

- **Given** una verificación pública exitosa o fallida
- **When** se registran eventos técnicos o de auditoría
- **Then** los logs MUST NOT incluir token completo, DNI completo, credenciales ni SQL con parámetros reales.

### Requirement: Conceptos de datos existentes sin migración nueva

El contrato MUST usar las tablas `cert_` ya definidas en la migración `001_certificados_qr.sql`, MUST mantener `token_pepper` en configuración externa y MUST alinear los seeds demo con `SHA-256(token + token_pepper)` sin crear migraciones nuevas en este ciclo.

#### Scenario: Conceptos documentados

- **Given** este ciclo finalizado
- **When** se lee la documentación de backend y base
- **Then** SHOULD figurar `cert_certificados`, `cert_tokens_verificacion` y `cert_eventos_auditoria` como tablas existentes del modelo.
- **And** MUST NOT existir migración SQL nueva por este cambio.

### Requirement: Integración futura Angular y cPanel

El contrato MUST indicar que Angular leerá `/certificados/validar/:tokenCertificacion`, consultará la API bajo `/certificados/api/` y que `.htaccess` no debe capturar `/api/`.

#### Scenario: Ruta pública frontend

- **Given** un QR emitido en el futuro
- **When** una persona lo escanea
- **Then** SHOULD abrir `/certificados/validar/{token}` y el frontend SHOULD consultar el endpoint de verificación.

#### Scenario: Deploy compatible con cPanel

- **Given** el despliegue en `public_html/certificados/`
- **When** se configuren rutas profundas
- **Then** `.htaccess` MUST permitir Angular y excluir `/api/` del fallback.

### Requirement: Pendientes de capacidad operativa

El endpoint público de verificación NO implementa rate limiting en este ciclo; esa capacidad queda documentada como pendiente. La falla del INSERT de auditoría MUST NOT romper la respuesta pública. Las pruebas fault-injection de la ruta de auditoría no fueron ejecutadas en runtime y quedan registradas como warning de verificación.

#### Scenario: Auditoría no rompe la respuesta

- **Given** una verificación pública en curso y un fallo del `INSERT` en `cert_eventos_auditoria`
- **When** la API arma la respuesta pública
- **Then** MUST devolver el resultado de validación (200 o 404) sin propagar la falla interna.

#### Scenario: Rate limiting ausente

- **Given** múltiples consultas públicas desde el mismo origen
- **When** la API recibe la segunda y sucesivas dentro de la ventana de tráfico
- **Then** la API responde según el contrato normal (200/404) sin aplicar `429 RATE_LIMITED` todavía; esa respuesta queda pendiente para un ciclo posterior.
