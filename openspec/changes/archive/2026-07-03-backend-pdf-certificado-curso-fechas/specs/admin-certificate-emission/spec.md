# Delta — admin-certificate-emission

## MODIFIED Requirements

### Requirement: Emisión administrativa mínima de certificados

La API DEBE exponer `POST /certificados/api/admin/certificados` para emitir un certificado desde `alumnoId` + `cursoId`, usando alumno, curso y asistencias activas existentes. DEBE requerir autorización administrativa, validar existencia/estado, exigir al menos una asistencia activa, leer `cert_configuracion_institucional` si existe, aplicar fallback seguro si falta, y persistir certificado, FKs nullable, token permanente, PDF/QR institucional y snapshot transaccional en `cert_certificado_fechas`. DEBE usar PDO con prepared statements y claves externas a Git. La respuesta `201` DEBE conservar `publicValidationUrl`, `pdfDownloadUrl` y `tokenPrefix`; NO DEBE incluir token completo como campo separado, DNI completo operativo, secretos, SQL ni rutas internas. NO DEBE enviar email, activar SMTP/PHPMailer ni rotar token.
(Antes: la emisión generaba PDF/QR y snapshot, pero no alimentaba el PDF con configuración institucional.)

#### Scenario: Emisión exitosa desde alumno y curso

- DADO un request autorizado con `alumnoId` y `cursoId` válidos y configuración institucional existente
- CUANDO existen asistencias activas certificables
- ENTONCES la API DEBE emitir certificado, token permanente, PDF/QR institucional y snapshot antes de confirmar.
- Y DEBE responder `201` con `publicValidationUrl`, `pdfDownloadUrl` y `tokenPrefix`, sin enviar email.

#### Scenario: Emisión con configuración institucional ausente

- DADO un request autorizado válido sin fila en `cert_configuracion_institucional`
- CUANDO se ejecuta `emitir()`
- ENTONCES la API DEBE emitir con PDF generado usando fallback seguro.
- Y DEBE conservar DTO, snapshot, descarga PDF y token permanente.

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

### Requirement: Snapshot de emisión inmutable

El sistema DEBE crear el snapshot en `cert_certificado_fechas` solo con asistencias activas al momento de emitir y DEBE usarlo luego para validación pública y PDF institucional.
(Antes: el snapshot debía alimentar validación pública y PDF, sin mencionar el PDF institucional.)

#### Scenario: Asistencia anulada después de emitir

- DADO un certificado emitido con snapshot
- CUANDO una asistencia viva se elimina o cambia después
- ENTONCES validación y PDF institucional DEBEN conservar las fechas certificadas originales.

### Requirement: DTO de emisión ampliado con `publicValidationUrl`, `pdfDownloadUrl` y `tokenPrefix`

La respuesta `201` de `POST /certificados/api/admin/certificados` DEBE conservar `publicValidationUrl`, `pdfDownloadUrl` y `tokenPrefix` sin cambios por el contenido institucional del PDF. Ningún campo DEBE exponer token completo como valor separado ni permitir reconstruirlo fuera del link público previsto.
(Antes: definía el DTO seguro; este cambio explicita que permanece estable.)

#### Scenario: Respuesta operativa segura

- DADO una emisión exitosa con PDF institucional
- CUANDO la API arma el DTO
- ENTONCES DEBE incluir `publicValidationUrl`, `pdfDownloadUrl` y `tokenPrefix` igual que antes.
- Y NO DEBE incluir token completo como campo independiente ni DNI completo operativo.

#### Scenario: Respuesta sin token completo independiente

- DADO cualquier respuesta de emisión, de éxito o error
- CUANDO se inspecciona el cuerpo JSON
- ENTONCES NO DEBE aparecer el token completo como campo independiente.
- Y `publicValidationUrl` DEBE ser el único link público previsto para entrega manual.
