# Delta para backend-modelo-datos-certificados

## ADDED Requirements

### Requirement: Persistencia de entrega con reutilización de tablas `cert_`

El sistema MUST registrar la entrega/reenvío reutilizando `cert_tokens_verificacion` (rotación: token anterior revocado, token nuevo activo) y `cert_eventos_auditoria` (evento `reenvio`). El sistema MUST NOT crear migraciones nuevas salvo que el diseño justifique una tabla `cert_entregas` mínima y versionada; en ese caso la migración MUST usar prefijo `cert_` y ser compatible con MariaDB 10.6.

#### Scenario: Rotación sobre tabla existente

- **Given** un certificado con token activo en `cert_tokens_verificacion`
- **When** se ejecuta un reenvío
- **Then** el sistema MUST marcar el token anterior como `revocado` y crear un nuevo registro activo.
- **And** MUST NOT almacenar el token completo en texto plano.

#### Scenario: Auditoría de reenvío sobre tabla existente

- **Given** un reenvío exitoso o fallido
- **When** se registra el evento
- **Then** MUST insertarse en `cert_eventos_auditoria` con tipo `reenvio`, resultado y `request_id`.
- **And** MUST NOT guardar token completo, DNI completo ni credenciales.

#### Scenario: Tabla `cert_entregas` solo si el diseño lo justifica

- **Given** el diseño técnico finalizado
- **When** se evalúa la necesidad de persistencia adicional
- **Then** el sistema MAY crear `cert_entregas` solo si la reutilización de `cert_eventos_auditoria` resulta insuficiente.
- **And** la migración MUST usar prefijo `cert_` y ser compatible con MariaDB 10.6.

## MODIFIED Requirements

### Requirement: Auditoría sin datos sensibles

El sistema MUST registrar eventos de emisión, verificación, revocación, reenvío o error sin DNI completo, token completo, SQL ni credenciales. El evento de reenvío MUST guardar `certificado_id`, tipo, resultado y `request_id`, y MAY guardar el `destinatario_enmascarado` sin exponer el email completo.
(Previously: la auditoría cubría emisión, verificación, revocación y error; no mencionaba explícitamente el reenvío ni el destinatario enmascarado.)

#### Scenario: Verificación fallida

- **Given** una verificación pública rechazada
- **When** se registre auditoría
- **Then** MUST guardar tipo, resultado, `request_id` y huellas truncadas no reversibles si aplican.
- **And** MUST NOT guardar valores sensibles completos.

#### Scenario: Reenvío auditable

- **Given** un reenvío ejecutado
- **When** se registra auditoría
- **Then** MUST guardar tipo `reenvio`, resultado, `request_id` y `destinatario_enmascarado`.
- **And** MUST NOT guardar token completo, DNI completo ni credenciales SMTP.