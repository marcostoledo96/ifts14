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

El modelo MUST sostener el DTO público del contrato de API con DNI completo visible por decisión institucional y fechas asistidas del curso, sin exponer token completo, hashes, pepper, nombres de tablas ni datos internos. La migración `001_certificados_qr.sql` define el modelo base (`documento_hash` + `documento_enmascarado`, sin `documento_completo`). La migración `003_cursos_alumnos_asistencias.sql` MUST mover el modelo de cursos/asistencias desde planificación a contrato migrable mediante `cert_alumnos`, `cert_cursos`, `cert_curso_fechas`, `cert_asistencias`, `cert_certificado_fechas` y `cert_configuracion_institucional`. `cert_alumnos` MUST usar DNI seguro (`dni_hash` + `dni_cifrado` + `dni_mostrar` nullable), y `cert_certificado_fechas` MUST conservar snapshot con FK a `cert_curso_fechas` y campos materializados. Este cambio MUST NOT modificar runtime PHP, Angular, API, PDF, auth ni datos reales.

#### Scenario: Certificado vigente

- DADO un certificado `vigente` con token `activo`
- CUANDO se resuelva una verificación pública futura
- ENTONCES la respuesta SHOULD usar código, estado, curso, fecha, DNI completo y fechas asistidas del curso.
- Y MUST NOT exponer `documento_hash`, `token_hash`, pepper ni datos internos.

#### Scenario: Estado migrado actual vs modelo D0 futuro

- DADO las migraciones `001` y `003`
- CUANDO se inspecciona el modelo
- ENTONCES `001` MUST conservar el certificado base con `documento_hash` + `documento_enmascarado`.
- Y `003` MUST aportar alumnos/cursos/asistencias/snapshot sin cambiar el comportamiento PHP existente.

#### Scenario: Tablas de cursos y asistencias migrables

- DADO la planificación de cursos, alumnos, asistencias y configuración institucional
- CUANDO se aplique el contrato de M4-02
- ENTONCES esas tablas MUST quedar definidas con prefijo `cert_`, FKs e índices compatibles con MariaDB 10.6.

#### Scenario: Asistencias por fila y snapshot de fechas

- DADO el modelo de asistencias y fechas de curso
- CUANDO se registre presencia
- ENTONCES la presencia MUST representarse por existencia de fila en `cert_asistencias`, sin booleano de ausente/presente.
- Y las fechas certificadas MUST representarse como snapshot materializado, no como rango recalculado en runtime.

#### Scenario: No cambios de producto ni datos reales

- DADO este ciclo SDD
- CUANDO se inspecciona el alcance
- ENTONCES MUST limitarse a modelo SQL, specs y documentación.
- Y MUST NOT incluir PHP, Angular, API, PDF, auth, deploy ni datos reales.

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

### Requirement: Migración `002` verificada para token recuperable

El modelo de datos DEBE tratar `database/migrations/002_token_cifrado_entrega_manual.sql` como gate operativo de deploy-readiness: aplicada y verificada contra DB aprobada, o documentada como pendiente exacto. La tabla `cert_tokens_verificacion` DEBE exponer la columna esperada `token_cifrado` para entrega manual recuperable.

#### Scenario: Migración aplicada y verificada

- DADO acceso aprobado a la DB destino
- CUANDO se verifica la migración `002`
- ENTONCES `cert_tokens_verificacion` DEBE contener `token_cifrado`
- Y la evidencia DEBE provenir de la DB real/staging aprobada, no de supuestos.

#### Scenario: Migración pendiente por falta de acceso

- DADO que no hay acceso DB aprobado
- CUANDO se cierre la fase
- ENTONCES se DEBE documentar el gate exacto para aplicar/verificar `002`
- Y NO SE DEBEN leer ni versionar secretos, dumps o configuraciones reales.

#### Scenario: Rollback seguro de datos

- DADO que `002` fue aplicada en entorno aprobado
- CUANDO se requiera rollback del ciclo documental
- ENTONCES NO SE DEBE borrar `token_cifrado` sin backup y aprobación operativa
- Y el rollback DEBE preferir revertir documentación/OpenSpec dejando la columna sin uso si corresponde.
