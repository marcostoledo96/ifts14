# Spec — modelo de datos para certificados QR

## Purpose

Definir el modelo MariaDB 10.6 para la verificación futura de certificados QR, con migraciones controladas, seeds ficticios y sin implementar PHP ni Angular.

## Requirements

### Requirement: Esquema controlado con prefijo `cert_`

El sistema MUST definir tablas nuevas con prefijo `cert_` para certificados, tokens de verificación y auditoría segura.

#### Scenario: Migración versionable

- **Given** el ciclo archivado
- **When** se inspecciona `database/migrations/001_certificados_qr.sql`
- **Then** MUST crear `cert_certificados`, `cert_tokens_verificacion` y `cert_eventos_auditoria`.
- **And** MUST ser compatible con MariaDB 10.6.

### Requirement: Token QR sin texto plano

El sistema MUST almacenar tokens públicos como hash no reversible y MUST NOT guardar el token completo en texto plano.

#### Scenario: Token verificable por hash

- **Given** un token público futuro
- **When** el backend lo consulte
- **Then** MUST calcular hash con pepper externo a Git y comparar contra `cert_tokens_verificacion.token_hash`.
- **And** MAY conservar solo `token_prefijo` para soporte seguro.

### Requirement: Exposición pública definida

El modelo MUST sostener el DTO público del contrato de API con DNI completo visible por decisión institucional y fechas asistidas del curso, sin exponer token completo, hashes, pepper, nombres de tablas ni datos internos. Las tablas futuras para cursos, alumnos, asistencias y configuración institucional SHOULD usar prefijo `cert_` y migraciones controladas; la creación de esas tablas queda fuera del ciclo documental actual.

#### Scenario: Certificado vigente

- **Given** un certificado `vigente` con token `activo`
- **When** se resuelva una verificación pública
- **Then** la respuesta futura SHOULD usar código, estado, curso, fecha, DNI completo y fechas asistidas del curso.
- **And** MUST NOT exponer `documento_hash`, `token_hash`, pepper ni datos internos.

#### Scenario: Tablas futuras documentadas

- **Given** la planificación de cursos, alumnos, asistencias y configuración institucional
- **When** se documenten tablas futuras
- **Then** SHOULD declararse como futuras, con prefijo `cert_` y sin migración en este ciclo.

### Requirement: Persistencia de entrega con reutilización de tablas `cert_`

El sistema MUST registrar la entrega/reenvío reutilizando `cert_tokens_verificacion` (token permanente: el reenvío normal conserva el token activo y NO rota; solo la revocación explícita invalida el token, y la regeneración es excepcional y auditada) y `cert_eventos_auditoria` (evento `reenvio`). El sistema MUST NOT crear migraciones nuevas salvo que el diseño justifique una tabla `cert_entregas` mínima y versionada; en ese caso la migración MUST usar prefijo `cert_` y ser compatible con MariaDB 10.6.

#### Scenario: Reenvío conserva token sobre tabla existente

- **Given** un certificado con token activo en `cert_tokens_verificacion`
- **When** se ejecuta un reenvío normal
- **Then** el sistema MUST conservar el token activo sin rotar.
- **And** MUST NOT crear un nuevo token ni revocar el previo salvo revocación explícita.
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

### Requirement: Fixtures ficticios solamente

Los seeds versionables MAY existir solo con datos ficticios explícitos.

#### Scenario: Seed demo seguro

- **Given** `database/seeds/001_certificados_qr_demo.sql`
- **When** se inspecciona su contenido
- **Then** MUST contener datos demo no reales.
- **And** MUST declarar que no se usa en producción.

### Requirement: Sin implementación de producto

Este ciclo MUST NOT crear código PHP, Angular, dependencias, commits, pushes ni merges.

#### Scenario: Cierre documental y SQL controlado

- **Given** el ciclo completado
- **When** se inspeccionan rutas de producto
- **Then** MUST existir solo documentación, OpenSpec y SQL bajo `database/migrations/` o `database/seeds/`.
