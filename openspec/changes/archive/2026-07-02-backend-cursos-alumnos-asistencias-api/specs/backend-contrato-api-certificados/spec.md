# Delta — contrato de API para certificados QR

## ADDED Requirements

### Requirement: Contrato administrativo de datos maestros

La API DEBE agregar endpoints bajo `/certificados/api/admin/` para cursos, alumnos, fechas y asistencias, protegidos por `X-Admin-Key`, con DTOs administrativos seguros. El contrato DEBE cubrir crear/listar/detallar/actualizar estado de cursos y alumnos; crear/listar/actualizar estado u orden de fechas; registrar/listar/anular asistencias; y DEBE mantener envelopes existentes de éxito/error. No DEBE incluir frontend, SMTP, email, reenvío automático ni migraciones nuevas.

#### Scenario: CRUD mínimo disponible

- DADO un cliente administrativo autorizado
- CUANDO opera cursos, alumnos, fechas y asistencias
- ENTONCES la API DEBE responder con DTOs JSON seguros y códigos HTTP documentados.
- Y NO DEBE exponer DNI completo, tokens, SQL, rutas internas ni secretos.

#### Scenario: Validaciones de transporte

- DADO un POST/PATCH admin sin `Content-Type: application/json` o con JSON malformado
- CUANDO llega al endpoint
- ENTONCES DEBE responder `415 UNSUPPORTED_MEDIA_TYPE` o `400 VALIDATION_ERROR`.
- Y NO DEBE persistir cambios ni auditar acciones de negocio.

#### Scenario: Privacidad administrativa

- DADO un alumno creado con DNI cifrado
- CUANDO se lista o consulta desde admin
- ENTONCES el DTO DEBE incluir solo DNI enmascarado (`dniMostrar` o equivalente).
- Y DEBE reservar el DNI completo solo para validación pública/PDF aprobados por D0.

### Requirement: Compatibilidad de emisión desde datos existentes

La emisión administrativa existente DEBE poder consumir alumnos, cursos, fechas y asistencias activas creadas por la API nueva sin cambiar el contrato de emisión, PDF, entrega manual ni token permanente. La ausencia de asistencias activas o datos inactivos DEBE fallar con error seguro y testable.

#### Scenario: Emisión smoke con datos cargados por API

- DADO un curso activo, alumno activo, fechas elegibles y asistencias activas cargadas por API
- CUANDO se invoca `POST /certificados/api/admin/certificados`
- ENTONCES DEBE conservar el contrato actual con snapshot, PDF/QR, `publicValidationUrl`, `pdfDownloadUrl` y `tokenPrefix`.
- Y NO DEBE rotar token ni enviar email.

#### Scenario: Datos no elegibles para emisión

- DADO curso/alumno inactivo, fecha no elegible o sin asistencias activas
- CUANDO se intenta emitir
- ENTONCES la API DEBE responder error seguro (`400 VALIDATION_ERROR` o `404`) sin crear certificado parcial.

### Requirement: Auditoría y errores sin datos sensibles

Las operaciones administrativas de datos maestros DEBEN registrar eventos seguros cuando corresponda y todos los errores DEBEN usar `{ error: { code, message, details }, meta: { requestId } }` sin DNI completo, token completo, SQL, secretos ni valores de configuración.

#### Scenario: Error seguro de configuración DNI

- DADO que `dni_cipher_key` falta o no decodifica a clave válida
- CUANDO se crea un alumno
- ENTONCES la API DEBE responder `500 CONFIGURATION_ERROR` sin persistir cambios.
- Y logs/auditoría NO DEBEN incluir DNI completo ni clave.

#### Scenario: Conflicto de asistencia duplicada

- DADO una asistencia activa ya registrada para alumno y fecha
- CUANDO se intenta registrar otra activa equivalente
- ENTONCES la API DEBE responder `409 CONFLICT` con sobre seguro.
- Y NO DEBE borrar ni modificar la asistencia previa.
