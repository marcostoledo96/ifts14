# Delta — backend-modelo-datos-certificados

## MODIFIED Requirements

### Requirement: Exposición pública definida y modelo D0 vs estado migrado

El modelo MUST sostener el DTO público del contrato de API con DNI completo visible por decisión institucional y fechas asistidas del curso, sin exponer token completo, hashes, pepper, nombres de tablas ni datos internos. La migración `001_certificados_qr.sql` define el modelo base (`documento_hash` + `documento_enmascarado`, sin `documento_completo`). La migración `003_cursos_alumnos_asistencias.sql` MUST mover el modelo de cursos/asistencias desde planificación a contrato migrable mediante `cert_alumnos`, `cert_cursos`, `cert_curso_fechas`, `cert_asistencias`, `cert_certificado_fechas` y `cert_configuracion_institucional`. `cert_alumnos` MUST usar DNI seguro (`dni_hash` + `dni_cifrado` + `dni_mostrar` nullable), y `cert_certificado_fechas` MUST conservar snapshot con FK a `cert_curso_fechas` y campos materializados. Este cambio MUST NOT modificar runtime PHP, Angular, API, PDF, auth ni datos reales.
(Previously: el requisito describía cursos, alumnos, asistencias y configuración institucional como tablas futuras no migradas y difería su diseño detallado a M4-01A/M4-02.)

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
