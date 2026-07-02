# Delta — admin-certificate-emission

## MODIFIED Requirements

### Requirement: Emisión administrativa mínima de certificados

La API DEBE exponer `POST /certificados/api/admin/certificados` para emitir un certificado y un token de verificación permanente usando el esquema `cert_` existente con la migración controlada necesaria para recuperar el token cifrado. El endpoint DEBE requerir autorización administrativa, validar un payload mínimo ficticio/demo, persistir con PDO y prepared statements, auditar la acción, generar el PDF/QR durante la emisión antes de confirmar el alta lógico y responder con un DTO operativo seguro. La emisión DEBE persistir `token_hash`, `token_prefijo` y `token_cifrado` o equivalente cifrado con clave externa a Git. Si se usa `token_cifrado`, DEBE guardarse como `v1.<iv_b64url>.<tag_b64url>.<ciphertext_b64url>` con IV de 12 bytes, tag GCM de 16 bytes y clave base64/base64url que decodifique exactamente 32 bytes; falta de clave, formato inválido o falla de cifrado/descifrado DEBE fallar cerrado sin confirmar la emisión. La respuesta `201` DEBE incluir `publicValidationUrl`, `pdfDownloadUrl` y `tokenPrefix`; NO DEBE incluir el token completo como campo separado, DNI completo operativo, secretos, SQL ni rutas internas. La emisión NO DEBE enviar email ni depender de SMTP/PHPMailer. `X-Admin-Key` DEBE ser server-to-server: NO DEBE haber llamadas Angular directas que lo usen ni exponerse desde bundles Angular o almacenamiento del navegador. Si existe UI admin MVP, DEBE usar cPanel Basic Auth o sesión/proxy PHP `HttpOnly`; si Angular admin queda fuera de alcance, DEBEN existir checks/documentación que prueben que no se embebió la clave.
(Previously: la emisión devolvía `pdfDownloadUrl` y dejaba la entrega/reenvío del token fuera del ciclo, sin `publicValidationUrl` ni `tokenPrefix`.)

#### Scenario: Emisión exitosa con datos de entrega manual

- DADO un request autorizado con payload válido y configuración completa
- CUANDO se emite el certificado
- ENTONCES la API DEBE generar certificado, token permanente y PDF/QR antes de confirmar la operación.
- Y DEBE responder `201` con `publicValidationUrl`, `pdfDownloadUrl` y `tokenPrefix`, sin enviar email.

#### Scenario: Falla la generación de PDF durante la emisión

- DADO un payload de emisión válido pero la generación o persistencia del PDF falla
- CUANDO se ejecuta `emitir()`
- ENTONCES la API DEBE abortar la emisión sin confirmar el alta lógico del certificado.
- Y DEBE responder con un sobre de error seguro sin dejar un certificado emitido sin PDF.

#### Scenario: Emisión sin clave de cifrado

- DADO un payload válido pero falta la clave externa de cifrado
- CUANDO se intenta emitir el certificado
- ENTONCES la API DEBE abortar sin confirmar certificado ni PDF final.
- Y DEBE responder error seguro sin exponer configuración ni secretos.

#### Scenario: Envelope de token inválido

- DADO un token cifrado con formato, IV, tag, ciphertext o clave inválida
- CUANDO la API intenta emitir o reconstruir el enlace público
- ENTONCES DEBE fallar cerrado sin confirmar emisión ni inventar link público.
- Y NO DEBE registrar token, clave, IV, tag ni ciphertext en logs, auditoría, errores o respuestas.

#### Scenario: Payload inválido

- DADO un request autorizado con campos requeridos ausentes o inválidos
- CUANDO se solicita la emisión
- ENTONCES la API DEBE responder `400 VALIDATION_ERROR` sin persistir certificado ni token ni generar PDF.

#### Scenario: Auditoría segura

- DADO una emisión exitosa o rechazada
- CUANDO se registra auditoría
- ENTONCES DEBE guardar acción, resultado y `request_id` sin DNI completo, token completo, SQL ni secretos.

#### Scenario: Persistencia segura

- DADO un payload de emisión aceptado
- CUANDO la API consulta o escribe datos
- ENTONCES DEBE usar PDO con prepared statements y NO DEBE construir SQL con valores concatenados.

#### Scenario: `X-Admin-Key` no expuesta desde el navegador

- DADO la UI administrativa en navegador Angular consumiendo el endpoint de emisión
- CUANDO se inspecciona el bundle, `localStorage`, `sessionStorage` y cookies del navegador
- ENTONCES NO DEBE aparecer `X-Admin-Key` ni su valor en el navegador ni en el bundle JS.
- Y NO DEBEN existir llamadas Angular directas con `X-Admin-Key`.
- Y la UI admin DEBE usar cPanel Basic Auth o sesión/proxy PHP `HttpOnly` para el MVP; si Angular admin queda fuera de alcance, DEBE documentarse y validarse que no se embebió la clave.

### Requirement: DTO de emisión ampliado con `publicValidationUrl`, `pdfDownloadUrl` y `tokenPrefix`

La respuesta `201` de `POST /certificados/api/admin/certificados` DEBE incluir `publicValidationUrl` para copiar el link permanente, `pdfDownloadUrl` para descargar el PDF administrativo y `tokenPrefix` para soporte seguro. Ningún campo DEBE exponer el token completo como valor separado ni permitir reconstruirlo fuera del link público previsto.
(Previously: el DTO ampliado exigía únicamente `pdfDownloadUrl`.)

#### Scenario: Respuesta operativa segura

- DADO una emisión exitosa
- CUANDO la API arma el DTO
- ENTONCES DEBE incluir `publicValidationUrl`, `pdfDownloadUrl` y `tokenPrefix`.
- Y `pdfDownloadUrl` DEBE apuntar a `GET /certificados/api/admin/certificados/{id}/pdf` sin exponer token completo.
- Y NO DEBE incluir token completo como campo independiente ni DNI completo operativo.

#### Scenario: Respuesta sin token completo independiente

- DADO cualquier respuesta de emisión, de éxito o error
- CUANDO se inspecciona el cuerpo JSON
- ENTONCES NO DEBE aparecer el token completo como campo independiente.
- Y `publicValidationUrl` DEBE ser el único link público previsto para entrega manual.
