# Spec — admin-certificate-emission

## Purpose

Definir la emisión administrativa mínima de certificados QR con generación de PDF/QR: el endpoint `POST /certificados/api/admin/certificados` crea un certificado y un token de verificación permanente sobre el esquema `cert_` existente, sin migraciones nuevas, exige autorización administrativa, valida un payload mínimo ficticio/demo, persiste con PDO y prepared statements, genera y persiste el PDF/QR durante la emisión (antes del alta lógico) y responde con un DTO operativo seguro que NO expone el token completo; logs y auditoría NO DEBEN exponer DNI completo ni token completo (D0: DNI completo visible en DTO/UI admin y validación pública), incluyendo `pdfDownloadUrl` para descarga administrativa del PDF. Esta spec separa explícitamente el acto de "token activo persistido + PDF emitido" (cubierto en este ciclo) de la "verificación pública del token recién emitido" (dependiente del mecanismo de entrega/reenvío, fuera de alcance).

## Requirements

### Requirement: Emisión administrativa mínima de certificados

La API DEBE exponer `POST /certificados/api/admin/certificados` para emitir un certificado desde `alumnoId` + `cursoId`, usando alumno, curso y asistencias activas existentes. DEBE requerir autorización administrativa, validar existencia/estado, exigir al menos una asistencia activa, leer `cert_configuracion_institucional` si existe, aplicar fallback seguro si falta, y persistir certificado, FKs nullable, token permanente, PDF/QR institucional y snapshot transaccional en `cert_certificado_fechas`. DEBE usar PDO con prepared statements y claves externas a Git. La respuesta `201` DEBE conservar `publicValidationUrl`, `pdfDownloadUrl` y `tokenPrefix`; NO DEBE incluir token completo como campo separado, secretos, SQL ni rutas internas. Los DTOs admin PUEDEN incluir DNI completo en `documentMasked`/`dniMostrar` (D0); logs y auditoría NO DEBEN registrar DNI completo ni token completo. NO DEBE enviar email, activar SMTP/PHPMailer ni rotar token.
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

### Requirement: Definición de asistencias certificables

«Asistencias activas certificables» DEBEN ser filas con `eliminado_en` NULL en fechas con estado `realizada`. Fechas `programada`/`cancelada` NO DEBEN entrar al snapshot. NO DEBE haber refresh de estado de fecha en `emitir` en este ciclo (diferido).

#### Scenario: Solo realizadas en el snapshot

- DADO asistencias activas en una fecha `realizada` y otra `programada`
- CUANDO se emite
- ENTONCES el snapshot DEBE incluir solo la `realizada` y responder `201`

#### Scenario: Solo programada no certifica

- DADO asistencias activas solo en fechas `programada`
- CUANDO se emite
- ENTONCES DEBE responder `400 VALIDATION_ERROR` sin persistir

### Requirement: Snapshot de emisión inmutable

El sistema DEBE crear el snapshot en `cert_certificado_fechas` solo con asistencias activas certificables (fecha `realizada`, `eliminado_en` NULL) al emitir y DEBE usarlo luego para validación pública y PDF institucional.
(Antes: «asistencias activas» sin exigir estado `realizada` de la fecha.)

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

### Requirement: Rechazo de JSON malformado en emisión

El endpoint `POST /certificados/api/admin/certificados` MUST rechazar JSON malformado con `400 VALIDATION_ERROR` antes de emitir certificado, crear token, auditar acción de negocio o ejecutar cualquier persistencia.

#### Scenario: Emisión con JSON malformado

- **Given** un request autorizado a emisión con `Content-Type: application/json`
- **When** el body JSON está malformado
- **Then** la API MUST responder `400 VALIDATION_ERROR`.
- **And** MUST NOT persistir certificado, token ni auditoría de emisión.

#### Scenario: Emisión con JSON parseable

- **Given** un request autorizado con JSON parseable
- **When** el payload tiene campos requeridos ausentes o inválidos
- **Then** la API MUST conservar `400 VALIDATION_ERROR` sin persistir certificado ni token.

### Requirement: Prevención de certificado vigente duplicado

La emisión administrativa DEBE rechazar un segundo certificado con `estado='vigente'` y `revocado_en IS NULL` para el mismo `alumnoId` + `cursoId` con `409 CERTIFICATE_ALREADY_EXISTS`. Un certificado revocado o con `estado='vencido'` NO DEBE bloquear una nueva emisión. Un certificado con `vence_en < CURRENT_DATE` pero `estado='vigente'` DEBE seguir bloqueando hasta una transición explícita de estado o revocación. Certificados legacy sin `alumno_id` o `curso_id` NO DEBEN entrar en el chequeo de duplicado. La respuesta y auditoría del rechazo NO DEBEN exponer DNI completo, token completo, SQL, secretos ni rutas internas.
(Cambio: este requisito fue corregido para cerrar la carrera concurrente con restricción de base de datos. La expiración por fecha no libera el slot mientras el estado siga `vigente`.)

#### Scenario: Duplicado vigente rechazado

- DADO un certificado vigente existente para un alumno y curso
- CUANDO Bedelía solicita otra emisión para el mismo par
- ENTONCES la API DEBE responder `409 CERTIFICATE_ALREADY_EXISTS`.
- Y NO DEBE crear certificado, token, PDF ni snapshot nuevos.

#### Scenario: Revocación libera nueva emisión

- DADO un certificado del mismo alumno y curso marcado como revocado
- CUANDO Bedelía solicita una nueva emisión para ese par
- ENTONCES la API DEBE permitir la emisión si el resto del payload es válido.

#### Scenario: Estado vencido libera nueva emisión

- DADO un certificado del mismo alumno y curso con `estado='vencido'`
- CUANDO Bedelía solicita una nueva emisión para ese par
- ENTONCES la API DEBE permitir la emisión si el resto del payload es válido.

#### Scenario: Vence_en pasado con estado vigente bloquea

- DADO un certificado del mismo alumno y curso con `vence_en < CURRENT_DATE` y `estado='vigente'`
- CUANDO Bedelía solicita una nueva emisión para ese par
- ENTONCES la API DEBE responder `409 CERTIFICATE_ALREADY_EXISTS`.
- Y NO DEBE crear certificado, token, PDF ni snapshot nuevos.

#### Scenario: Legacy sin alumno o curso no bloquea

- DADO un certificado legacy con `alumno_id` o `curso_id` nulo
- CUANDO Bedelía emite para un alumno y curso actuales
- ENTONCES ese certificado legacy NO DEBE considerarse duplicado.
