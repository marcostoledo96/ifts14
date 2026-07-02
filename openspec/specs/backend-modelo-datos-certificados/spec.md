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

### Requirement: Token QR sin texto plano y recuperable para reenvío

El sistema DEBE almacenar tokens públicos como `token_hash` no reversible con pepper externo a Git y DEBE mantener un artefacto recuperable cifrado (`token_cifrado` o equivalente reversible) con clave externa a Git para reconstruir el link permanente en emisión, entrega manual y regeneración de PDF. El token completo NO DEBE guardarse en texto plano ni aparecer en logs, auditoría, errores o respuestas administrativas. `token_prefijo` DEBE usarse solo como ayuda operativa segura.

#### Scenario: Token verificable y recuperable

- DADO un certificado emitido con token activo
- CUANDO se persiste el token
- ENTONCES el sistema DEBE guardar `token_hash`, `token_prefijo` y `token_cifrado` o equivalente cifrado.
- Y NO DEBE guardar el token completo en texto plano.

#### Scenario: Clave externa obligatoria

- DADO la configuración de entorno del backend
- CUANDO se emite o consulta entrega manual
- ENTONCES la clave de cifrado DEBE provenir de configuración externa a Git.
- Y su ausencia DEBE producir error seguro sin exponer secretos ni tokens.

### Requirement: Exposición pública definida y modelo D0 vs estado migrado

El modelo MUST sostener el DTO público del contrato de API con DNI completo visible por decisión institucional y fechas asistidas del curso, sin exponer token completo, hashes, pepper, nombres de tablas ni datos internos. La migración actual `001_certificados_qr.sql` define el modelo verificado hoy (`documento_hash` + `documento_enmascarado`, sin `documento_completo`); el modelo D0 futuro agrega DNI completo visible en DTO público de validación y requiere almacenamiento seguro de DNI (`dni_hash` + `dni_cifrado` con clave externa a Git, más campo de visualización opcional o atajo MVP con riesgo aceptado). El modelo D0 es target, no estado migrado. Las tablas futuras para cursos, alumnos, asistencias y configuración institucional SHOULD usar prefijo `cert_` y migraciones controladas; la creación de esas tablas queda fuera del ciclo documental actual.

#### Scenario: Certificado vigente

- **Given** un certificado `vigente` con token `activo`
- **When** se resuelva una verificación pública
- **Then** la respuesta futura SHOULD usar código, estado, curso, fecha, DNI completo y fechas asistidas del curso.
- **And** MUST NOT exponer `documento_hash`, `token_hash`, pepper ni datos internos.

#### Scenario: Estado migrado actual vs modelo D0 futuro

- **Given** la migración `001_certificados_qr.sql` vigente
- **When** se inspecciona el modelo actual
- **Then** MUST distinguir que el modelo migrado usa `documento_hash` + `documento_enmascarado` (sin `documento_completo`).
- **And** el modelo D0 futuro (no migrado) agrega DNI completo visible en DTO público con almacenamiento seguro (`dni_hash` + `dni_cifrado` o atajo MVP con riesgo aceptado).

#### Scenario: Tablas futuras documentadas

- **Given** la planificación de cursos, alumnos, asistencias y configuración institucional
- **When** se documenten tablas futuras
- **Then** SHOULD declararse como futuras, con prefijo `cert_` y sin migración en este ciclo.

#### Scenario: Asistencias por fila y snapshot de fechas diferido a M4-01A/M4-02

- **Given** la planificación de tablas futuras de asistencias y fechas de curso
- **When** se documente el modelo de asistencias
- **Then** la presencia MUST representarse por existencia de fila (una fila por asistencia), sin booleano de presencia, con `UNIQUE` por alumno/fecha/curso.
- **And** las fechas asistidas del curso MUST representarse como snapshot de fechas (no rango calculado en runtime).
- **And** el diseño detallado de estas tablas queda explícitamente diferido a M4-01A (contrato) / M4-02.

### Requirement: Persistencia de entrega con reutilización de tablas `cert_`

El endpoint de entrega manual DEBE reutilizar `cert_tokens_verificacion` para leer el token permanente recuperable y DEBE ser de solo lectura respecto de certificado, token y entrega: NO DEBE rotar, revocar, crear token, insertar evento operativo ni crear tabla nueva. La auditoría de copia de link queda fuera de alcance/futura salvo decisión explícita de diseño; si se implementa en otro ciclo, DEBE omitir DNI completo, token completo, link completo si se considera sensible, credenciales y SQL.

#### Scenario: Entrega manual conserva token sobre tabla existente

- DADO un certificado con token activo en `cert_tokens_verificacion`
- CUANDO se consulta la entrega manual
- ENTONCES el sistema DEBE conservar el token activo sin rotar.
- Y NO DEBE crear un nuevo token, revocar el previo ni almacenar el token completo en texto plano.

#### Scenario: Sin auditoría operativa en este endpoint

- DADO una consulta de entrega manual exitosa o fallida
- CUANDO se procesa el endpoint
- ENTONCES NO DEBE insertarse evento obligatorio en `cert_eventos_auditoria` ni modificarse estado de entrega.
- Y cualquier auditoría futura DEBE definirse en otro ciclo sin datos sensibles.

#### Scenario: Certificados anteriores sin token cifrado

- DADO un certificado emitido antes de existir `token_cifrado`
- CUANDO se solicita reconstruir el link
- ENTONCES el sistema NO DEBE regenerar token automáticamente.
- Y DEBE requerir regeneración excepcional auditada o limitarse al PDF existente.

#### Scenario: Tabla `cert_entregas` diferida

- DADO el diseño técnico finalizado para este MVP
- CUANDO se evalúa persistencia adicional de entrega manual
- ENTONCES el sistema NO DEBE crear `cert_entregas` para el endpoint de solo lectura.
- Y una tabla futura DEBE requerir nuevo ciclo SDD y migración `cert_` compatible con MariaDB 10.6.

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
