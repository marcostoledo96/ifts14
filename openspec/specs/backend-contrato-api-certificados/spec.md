# Spec — contrato de API para certificados QR

## Purpose

Definir el contrato público de la API futura de certificados QR bajo `/certificados/api/`, sin implementar PHP, Angular, migraciones ni dependencias.

## Requirements

### Requirement: Contrato público de verificación

La API futura MUST exponer un contrato JSON para validar certificados desde QR o enlace con respuesta pública mínima.

#### Scenario: Certificado válido

- **Given** un token público con formato válido y certificado vigente
- **When** se consulta `GET /certificados/api/certificados/{token}/verificacion`
- **Then** la respuesta MUST ser `200` con `data.valid: true`, estado, código de certificado, curso, fecha de emisión y documento enmascarado.
- **And** MUST NOT incluir DNI completo, token completo ni datos internos.

#### Scenario: Token no verificable

- **Given** un token inexistente, revocado o vencido
- **When** se consulta la verificación pública
- **Then** la respuesta MUST usar un error `404 CERTIFICATE_NOT_FOUND` sin revelar cuál condición ocurrió.

### Requirement: Consulta alternativa por POST

La API futura MAY ofrecer `POST /certificados/api/certificados/consulta` con body JSON `{ "token": "..." }` y MUST reutilizar el mismo DTO público de verificación.

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

- **Given** una falla inesperada del backend futuro
- **When** la API responde al cliente público
- **Then** la respuesta MUST ser `500 INTERNAL_ERROR` sin stack trace ni rutas internas.

### Requirement: Validación y seguridad del token QR

El token público MUST validarse antes de consultar la base y SHOULD persistirse como hash o estrategia equivalente cuando exista persistencia real.

#### Scenario: Token con formato permitido

- **Given** un token de 32 a 128 caracteres alfanuméricos con `_` o `-`
- **When** llega a la API
- **Then** la API MAY procesarlo y MUST consultarlo con prepared statements.

#### Scenario: Logs seguros

- **Given** una verificación pública exitosa o fallida
- **When** se registran eventos técnicos o de auditoría
- **Then** los logs MUST NOT incluir token completo, DNI completo, credenciales ni SQL con parámetros reales.

### Requirement: Conceptos de datos futuros sin migración

El contrato MUST documentar conceptos de datos de alto nivel con prefijo `cert_`, sin crear migraciones ni esquema real en este ciclo.

#### Scenario: Conceptos documentados

- **Given** este ciclo documental finalizado
- **When** se lee la documentación de backend y base
- **Then** SHOULD figurar `cert_certificados`, `cert_tokens_verificacion` y `cert_eventos_auditoria` como conceptos futuros.
- **And** MUST NOT existir migración SQL creada por este ciclo.

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

### Requirement: Restricciones de producto siguen vigentes

Este ciclo MUST NOT crear código PHP, Angular, migraciones, dependencias, commits, pushes ni merges.

#### Scenario: Cierre documental

- **Given** el ciclo archivado
- **When** se inspeccionan rutas de producto y manifiestos
- **Then** MUST NOT existir archivos nuevos de producto, migraciones nuevas, `package.json` ni `composer.json` creados por este cambio.
