# Delta for backend-contrato-api-certificados

## MODIFIED Requirements

### Requirement: Pendientes de capacidad operativa

El endpoint público de verificación MUST aplicar rate limiting mínimo y responder `429 RATE_LIMITED` al exceder el umbral configurado. La falla del INSERT de auditoría MUST NOT romper la respuesta pública: una validación válida conserva `200`, una no verificable conserva `404` y un token inválido conserva `400` si corresponde.
(Previously: el rate limiting no se implementaba y seguía pendiente; la auditoría no bloqueante no estaba probada por fault-injection.)

#### Scenario: Auditoría no rompe respuesta válida

- **Given** un certificado verificable y un fallo del `INSERT` en `cert_eventos_auditoria`
- **When** la API arma la respuesta pública
- **Then** MUST devolver `200` con el DTO público válido sin exponer la falla interna.

#### Scenario: Auditoría no rompe respuesta no verificable

- **Given** un token no verificable y un fallo del `INSERT` de auditoría
- **When** se consulta la verificación pública
- **Then** MUST devolver `404 CERTIFICATE_NOT_FOUND` sin propagar la falla interna.

#### Scenario: Auditoría no rompe token inválido

- **Given** un token ausente o con formato inválido y auditoría no disponible
- **When** se consulta GET o POST
- **Then** MUST devolver `400 VALIDATION_ERROR` si aplica por formato, sin exponer la falla interna.

#### Scenario: Rate limiting aplicado

- **Given** múltiples consultas públicas desde el mismo bucket hasta exceder la ventana configurada
- **When** la API recibe una nueva consulta GET o POST dentro de esa ventana
- **Then** MUST responder `429 RATE_LIMITED` con sobre de error seguro.
