# Spec — API administrativa de datos maestros

## Purpose

Definir la API administrativa mínima para cargar cursos, alumnos, fechas y asistencias que alimentan la emisión de certificados, sin frontend, SMTP ni migraciones nuevas.

## Requirements

### Requirement: Administración de cursos

La API DEBE permitir crear, listar, consultar detalle, actualizar estado y actualizar código/nombre de cursos mediante endpoints admin autorizados según `admin-auth`. `PATCH /admin/cursos/{id}` DEBE aceptar `codigo` y/o `nombre`; cuerpo vacío DEBE responder `400 VALIDATION_ERROR`; código duplicado DEBE responder `409 CONFLICT`.

#### Scenario: Curso creado y consultable

- DADO un request admin autorizado con código y nombre válidos
- CUANDO se crea un curso
- ENTONCES la API DEBE responder `201` con DTO seguro y permitir verlo en listado y detalle.

#### Scenario: Estado de curso actualizado

- DADO un curso existente
- CUANDO se actualiza su estado a un valor permitido
- ENTONCES la API DEBE persistirlo y rechazar estados inválidos con `400 VALIDATION_ERROR`.

#### Scenario: Código y nombre de curso actualizados

- DADO un curso existente
- CUANDO se envía `PATCH /admin/cursos/{id}` con `codigo` y/o `nombre` válidos
- ENTONCES la API DEBE persistir los campos enviados y responder el DTO actualizado.
- Y si el `codigo` ya pertenece a otro curso, DEBE responder `409 CONFLICT`.

### Requirement: Administración de alumnos con DNI seguro

La API DEBE crear alumnos cifrando DNI con `dni_cipher_key`, guardar HMAC-SHA-256 binario de búsqueda usando esa misma clave y responder DTOs administrativos con DNI completo visible en `dniMostrar`/`documentMasked` (todos los dígitos; D0 2026-07-20). El alta DEBE exigir `apellido` y `nombre` separados; el DTO DEBE incluir `apellido`, `nombre` y `apellidoNombre` compuesto. El email DEBE ser opcional (nullable) al crear o editar alumno. La API DEBE permitir actualizar datos personales con `PATCH /admin/alumnos/{id}` (`apellido`, `nombre`, `email`, `estado` y/o `dni`); cambiar `dni` DEBE exigir `dni_cipher_key` válida y rechazar conflictos con `409 CONFLICT`. NO DEBE exponer `dni_hash`, `dni_cifrado`, token completo, SQL ni secretos. Logs, auditoría y errores NO DEBEN incluir DNI completo ni token completo.

#### Scenario: Alumno creado con DNI cifrado

- DADO un request autorizado con DNI válido y `dni_cipher_key` válida
- CUANDO se crea el alumno
- ENTONCES la API DEBE persistir hash/cifrado y responder `dniMostrar`/`documentMasked` con dígitos completos.
- Y el email PUEDE omitirse sin error de validación.

#### Scenario: Alumno creado sin email

- DADO un request autorizado con DNI válido y sin campo `email`
- CUANDO se crea el alumno
- ENTONCES la API DEBE responder `201` con DTO admin que incluye DNI completo y `email` null o ausente.

#### Scenario: Clave DNI ausente falla cerrado

- DADO que falta `dni_cipher_key` o es inválida
- CUANDO se intenta crear un alumno
- ENTONCES la API DEBE responder `500 CONFIGURATION_ERROR` sin persistir ni exponer DNI.

#### Scenario: Estado de alumno no depende de clave DNI

- DADO un alumno existente y configuración sin `dni_cipher_key`
- CUANDO se actualiza su estado a un valor permitido
- ENTONCES la API DEBE responder éxito porque no cifra ni descifra DNI.

#### Scenario: Datos personales editados sin rotar DNI

- DADO un alumno existente
- CUANDO se envía `PATCH /admin/alumnos/{id}` con `apellido` y/o `nombre` y/o `email` (sin `dni`)
- ENTONCES la API DEBE persistir los cambios y responder el DTO admin actualizado (`apellido`, `nombre`, `apellidoNombre` compuesto) sin exigir `dni_cipher_key`.

#### Scenario: Cambio de DNI exige clave

- DADO un alumno existente y configuración sin `dni_cipher_key`
- CUANDO se envía `PATCH /admin/alumnos/{id}` con `dni`
- ENTONCES la API DEBE responder `500 CONFIGURATION_ERROR` sin persistir el cambio de documento.

### Requirement: Hub de asistencias admin

La API DEBE exponer `GET /admin/hub/asistencias` autorizado que devuelva en un solo payload `cursos` (con `cantidadFechas`), `fechas`, `asistencias` activas y `alumnosActivos`, para evitar N+1 de fechas/asistencias por curso en el hub admin.

#### Scenario: Hub consolidado

- DADO un admin autorizado
- CUANDO consulta `GET /admin/hub/asistencias`
- ENTONCES la API DEBE responder `200` con las cuatro claves y DTOs seguros (sin DNI/token completos fuera de los campos admin previstos).

### Requirement: Administración de fechas de curso

La API DEBE crear, listar y actualizar fechas por curso con orden estable, estado permitido y sin depender del orden accidental de carga. El orden DEBE estar en el rango `1..65535` por compatibilidad con `SMALLINT UNSIGNED`.

#### Scenario: Fechas listadas en orden estable

- DADO un curso con varias fechas
- CUANDO se consultan sus fechas
- ENTONCES la API DEBE devolverlas ordenadas por `orden` y fecha.

#### Scenario: Fecha inactiva o estado inválido

- DADO una fecha existente
- CUANDO se actualiza con estado no permitido
- ENTONCES la API DEBE rechazar el cambio con `400 VALIDATION_ERROR`.

#### Scenario: Orden de fecha fuera de rango

- DADO una creación o actualización de fecha de curso
- CUANDO `orden` es menor a 1, mayor a 65535 o el próximo orden automático supera 65535
- ENTONCES la API DEBE responder `400 VALIDATION_ERROR` sin delegar el error a MariaDB.

### Requirement: Registro y anulación lógica de asistencias

La API DEBE registrar presencia por existencia de fila activa, listar asistencias por curso/alumno y anular mediante eliminación lógica (`eliminado_en`), sin `DELETE` físico.

#### Scenario: Asistencia activa registrada

- DADO alumno, curso y fecha elegibles
- CUANDO se registra asistencia
- ENTONCES la API DEBE responder éxito y listarla como activa.

#### Scenario: Duplicado activo conflictivo

- DADO una asistencia activa para alumno y fecha
- CUANDO se registra otra igual
- ENTONCES la API DEBE responder `409 CONFLICT` sin crear duplicado.

#### Scenario: Anulación lógica

- DADO una asistencia activa
- CUANDO se anula
- ENTONCES la API DEBE marcar `eliminado_en` y excluirla de asistencias activas.

#### Scenario: Filtros de asistencias inválidos

- DADO un request autorizado a listar asistencias
- CUANDO `cursoId` o `alumnoId` no son enteros positivos
- ENTONCES la API DEBE responder `400 VALIDATION_ERROR` sin ampliar el listado.

### Requirement: Auto-gestión de estado de fecha tras escritura de asistencias

Tras registrar o anular lógicamente una asistencia, si la fecha no está `cancelada`, la API DEBE recalcular y persistir su `estado` con día local `America/Argentina/Buenos_Aires` (`Y-m-d`): `realizada` solo si hay ≥1 asistencia activa y `fecha < hoy`; si no, `programada`. NO DEBE inferir ni modificar `cancelada`. Si el estado entra o sale de `realizada`, DEBE conservar el sync de snapshots / `pdf_estado=desactualizado` vigente. NO DEBE agregar cron ni refresh en `emitir` en este ciclo. Un write de asistencia posterior DEBE reaplicar la regla (p. ej. same-day vuelve a `programada` tras override manual).

#### Scenario: Fecha pasada con presente → realizada

- DADO fecha no cancelada con `fecha < hoy` AR
- CUANDO se registra ≥1 asistencia activa
- ENTONCES el estado DEBE ser `realizada` y DEBE correr sync si hay certificados vigentes afectados

#### Scenario: Same-day o futura → programada

- DADO fecha no cancelada con `fecha >= hoy` AR
- CUANDO se registra ≥1 asistencia activa
- ENTONCES el estado DEBE ser `programada`

#### Scenario: Anular todos → programada

- DADO fecha `realizada` con una asistencia activa
- CUANDO se anula esa asistencia
- ENTONCES el estado DEBE ser `programada` y DEBE correr sync de snapshots afectados

#### Scenario: Cancelada intacta

- DADO fecha `cancelada`
- CUANDO se intenta registrar asistencia
- ENTONCES DEBE rechazarse y el estado DEBE permanecer `cancelada`

### Requirement: Seguridad, envelopes y auditoría

Todos los endpoints DEBEN exigir autorización según `admin-auth`; los POST/PATCH autenticados por cookie DEBEN exigir CSRF y `Content-Type: application/json`; errores DEBEN usar el sobre estable y auditoría/logs NO DEBEN incluir DNI completo, token completo, SQL ni secretos.

#### Scenario: Request admin no autorizado

- DADO un request sin autorización válida según `admin-auth`
- CUANDO accede a datos maestros
- ENTONCES la API DEBE responder `401 UNAUTHORIZED` con sobre seguro.

#### Scenario: JSON inválido o media type incorrecto

- DADO un POST/PATCH sin JSON válido
- CUANDO llega al endpoint
- ENTONCES la API DEBE responder `415` o `400` antes de side effects.
