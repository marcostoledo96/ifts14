# Delta — admin-certificate-emission

## MODIFIED Requirements

### Requirement: Emisión administrativa mínima de certificados

La API DEBE exponer `POST /certificados/api/admin/certificados` para emitir un certificado desde `alumnoId` + `cursoId`, usando alumno, curso y asistencias activas existentes. DEBE requerir autorización administrativa, validar existencia/estado del alumno y curso, exigir al menos una asistencia activa, persistir certificado, FKs nullable, token permanente, PDF/QR y snapshot transaccional en `cert_certificado_fechas`. DEBE usar PDO con prepared statements, claves externas a Git para token/DNI, y fallar cerrado si falta configuración. La respuesta `201` DEBE incluir `publicValidationUrl`, `pdfDownloadUrl` y `tokenPrefix`; NO DEBE incluir token completo como campo separado, DNI completo operativo, secretos, SQL ni rutas internas. NO DEBE enviar email, activar SMTP/PHPMailer ni rotar token.
(Previously: la emisión aceptaba payload libre demo con nombre/DNI/curso y no requería alumno, curso ni asistencias reales.)

#### Scenario: Emisión exitosa desde alumno y curso

- DADO un request autorizado con `alumnoId` y `cursoId` válidos
- CUANDO existen asistencias activas para ese alumno en fechas activas del curso
- ENTONCES la API DEBE emitir certificado, token permanente, PDF/QR y snapshot antes de confirmar la operación.
- Y DEBE responder `201` con `publicValidationUrl`, `pdfDownloadUrl` y `tokenPrefix`, sin enviar email.

#### Scenario: Sin asistencias activas certificables

- DADO un alumno y curso válidos sin asistencias activas certificables
- CUANDO se solicita la emisión
- ENTONCES la API DEBE responder `400 VALIDATION_ERROR` sin persistir certificado, token, PDF ni snapshot.

#### Scenario: Falla la generación de PDF durante la emisión

- DADO un payload válido pero falla la generación o persistencia del PDF
- CUANDO se ejecuta `emitir()`
- ENTONCES la API DEBE abortar sin confirmar certificado, token ni snapshot.
- Y DEBE responder con error seguro.

#### Scenario: Emisión sin clave de cifrado

- DADO un payload válido pero falta una clave externa requerida
- CUANDO se intenta emitir el certificado
- ENTONCES la API DEBE abortar sin confirmar certificado, token, PDF ni snapshot.
- Y DEBE responder error seguro sin exponer configuración ni secretos.

#### Scenario: Envelope de token inválido

- DADO un token cifrado con formato, IV, tag, ciphertext o clave inválida
- CUANDO la API intenta emitir o reconstruir el enlace público
- ENTONCES DEBE fallar cerrado sin confirmar emisión ni inventar link público.
- Y NO DEBE registrar token, clave, IV, tag ni ciphertext.

#### Scenario: Payload inválido

- DADO un request autorizado con campos requeridos ausentes o inválidos
- CUANDO se solicita la emisión
- ENTONCES la API DEBE responder `400 VALIDATION_ERROR` sin persistir ni generar PDF.

#### Scenario: Auditoría segura

- DADO una emisión exitosa o rechazada
- CUANDO se registra auditoría
- ENTONCES DEBE guardar acción, resultado y `request_id` sin DNI completo, token completo, SQL ni secretos.

#### Scenario: Persistencia segura

- DADO un payload de emisión aceptado
- CUANDO la API consulta o escribe datos
- ENTONCES DEBE usar PDO con prepared statements y NO DEBE construir SQL con valores concatenados.

#### Scenario: `X-Admin-Key` no expuesta desde el navegador

- DADO la UI administrativa en navegador Angular consumiendo emisión
- CUANDO se inspecciona bundle, storage y cookies legibles por JS
- ENTONCES NO DEBE aparecer `X-Admin-Key` ni su valor.
- Y NO DEBEN existir llamadas Angular directas con `X-Admin-Key`.

## ADDED Requirements

### Requirement: Snapshot de emisión inmutable

El sistema DEBE crear el snapshot en `cert_certificado_fechas` solo con asistencias activas al momento de emitir y DEBE usarlo luego para validación pública y PDF.

#### Scenario: Asistencia anulada después de emitir

- DADO un certificado emitido con snapshot
- CUANDO una asistencia viva se elimina o cambia después
- ENTONCES validación y PDF DEBEN conservar las fechas certificadas originales.
