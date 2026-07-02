# Delta — backend-contrato-api-certificados

## MODIFIED Requirements

### Requirement: Contrato administrativo mínimo de certificados

La API DEBE sostener endpoints administrativos bajo `/certificados/api/admin/` protegidos por `X-Admin-Key`: `POST /admin/certificados` para emisión con generación PDF/QR sincrónica y respuesta `201` con `publicValidationUrl`, `pdfDownloadUrl` y `tokenPrefix`, `POST /admin/certificados/{id}/revocar` para revocación, `GET /admin/certificados/{id}/pdf` para descarga del PDF persistido y `GET /admin/certificados/{id}/entrega-manual` para obtener datos de entrega manual. Entrega manual DEBE ser de solo lectura: NO DEBE rotar token, enviar email, activar SMTP/PHPMailer ni modificar estado de negocio del certificado/token. Las respuestas DEBEN usar envelopes existentes, DTOs seguros y errores sin DNI completo, token completo como campo separado, secretos, SQL ni rutas internas. `X-Admin-Key` es server-to-server: NO DEBE haber llamadas Angular directas que lo usen ni debe aparecer en bundle Angular, storage del navegador ni cookies legibles por JS; una UI admin MVP en navegador DEBE usar cPanel Basic Auth o sesión/proxy PHP `HttpOnly`. Si Angular admin queda fuera de alcance, DEBEN quedar checks/documentación que prueben que no se embebió la clave. El endpoint de descarga DEBE responder `Content-Type: application/pdf` y `Content-Disposition: attachment` ante autorización válida, `401 UNAUTHORIZED` sin autorización y `404 PDF_NOT_FOUND` si el PDF no existe. `POST /admin/certificados/{id}/reenviar` NO DEBE formar parte del contrato MVP.
(Previously: el contrato incluía `/reenviar` por email y emisión con `pdfDownloadUrl` sin link público ni prefijo.)

#### Scenario: Admin sin autorización

- DADO un request a un endpoint administrativo sin `X-Admin-Key` válido
- CUANDO la API procesa la solicitud
- ENTONCES DEBE responder `401 UNAUTHORIZED` con sobre de error seguro.

#### Scenario: Emisión documentada con entrega manual

- DADO un request autorizado con payload válido y configuración completa
- CUANDO se invoca `POST /certificados/api/admin/certificados`
- ENTONCES la API DEBE responder `201` con certificado emitido, PDF/QR generado, `publicValidationUrl`, `pdfDownloadUrl` y `tokenPrefix`.
- Y NO DEBE incluir token completo como campo separado ni DNI completo en la respuesta operativa.

#### Scenario: Descarga PDF documentada

- DADO un request autorizado a `GET /certificados/api/admin/certificados/{id}/pdf` para un certificado con PDF persistido
- CUANDO se invoca el endpoint
- ENTONCES el contrato DEBE indicar `200` con `Content-Type: application/pdf` y `Content-Disposition: attachment`.

#### Scenario: Descarga PDF sin autorización documentada

- DADO un request sin `X-Admin-Key` válido al endpoint de descarga PDF
- CUANDO se invoca el endpoint
- ENTONCES el contrato DEBE indicar `401 UNAUTHORIZED` con sobre de error seguro.

#### Scenario: Descarga PDF inexistente documentada

- DADO un request autorizado a un certificado sin PDF persistido
- CUANDO se invoca el endpoint de descarga
- ENTONCES el contrato DEBE indicar `404 PDF_NOT_FOUND` sin revelar rutas internas.

#### Scenario: Revocación documentada

- DADO un request autorizado para un certificado revocable
- CUANDO se invoca `POST /certificados/api/admin/certificados/{id}/revocar`
- ENTONCES el contrato DEBE indicar revocación del certificado e invalidación de tokens activos.

#### Scenario: Entrega manual documentada

- DADO un certificado existente con token recuperable y PDF persistido
- CUANDO se invoca `GET /certificados/api/admin/certificados/{id}/entrega-manual`
- ENTONCES la API DEBE responder `200` con `publicValidationUrl`, `pdfDownloadUrl` y `tokenPrefix`.
- Y NO DEBE rotar token, enviar email ni modificar el estado de negocio del certificado/token.

#### Scenario: Reenvío removido

- DADO un cliente que invoca `POST /certificados/api/admin/certificados/{id}/reenviar`
- CUANDO el MVP procesa la ruta
- ENTONCES la API DEBE responder ruta inexistente o método no permitido con error seguro.
- Y NO DEBE activar SMTP, PHPMailer ni transporte `stub`.

### Requirement: Validación y seguridad del token QR

El token público DEBE validarse antes de consultar la base y DEBE buscarse como `SHA-256(token + token_pepper)` con `token_pepper` externo a Git y PDO prepared statements. El hash no reversible (`token_hash`) es suficiente para verificación pública, pero NO para entrega manual: el sistema DEBE poder reconstruir el enlace `/certificados/validar/{token}` desde un artefacto recuperable (`token_cifrado` cifrado con clave externa a Git, o almacenamiento equivalente reversible). Si se usa `token_cifrado`, DEBE usar AES-256-GCM con envelope textual `v1.<iv_b64url>.<tag_b64url>.<ciphertext_b64url>`, IV de 12 bytes, tag de 16 bytes y clave base64/base64url que decodifique exactamente 32 bytes. Hash-only es insuficiente para entrega manual. El token completo NO DEBE persistirse en texto plano ni aparecer en logs, auditoría, errores o respuestas administrativas como campo separado; tampoco DEBEN registrarse clave, IV, tag ni ciphertext.
(Previously: el texto asociaba la recuperabilidad al reenvío.)

#### Scenario: Token con formato permitido

- DADO un token de 32 a 128 caracteres alfanuméricos con `_` o `-`
- CUANDO llega a la API
- ENTONCES la API DEBE calcular el hash con pepper externo y consultar con prepared statements.

#### Scenario: Token recuperable sin filtración

- DADO un certificado con token activo cifrado
- CUANDO la API arma `publicValidationUrl`
- ENTONCES DEBE descifrarlo solo en memoria para componer el link permanente.
- Y DEBE devolver únicamente URL pública y `tokenPrefix`, nunca el token como campo separado.

#### Scenario: Logs seguros

- DADO una verificación pública exitosa o fallida
- CUANDO se registran eventos técnicos o de auditoría
- ENTONCES los logs NO DEBEN incluir token completo, DNI completo, credenciales ni SQL con parámetros reales.

#### Scenario: Descifrado falla cerrado

- DADO un `token_cifrado` ausente, mal formado, con IV/tag inválidos, clave inválida o descifrado fallido
- CUANDO la API intenta armar `publicValidationUrl`
- ENTONCES DEBE responder error seguro sin reconstruir ni regenerar token.
- Y NO DEBE exponer token, clave, IV, tag, ciphertext, SQL ni rutas internas en logs, auditoría, errores o respuestas.
