# Delta para admin-certificate-delivery

## MODIFIED Requirements

### Requirement: Reenvío administrativo por email

La API DEBE reemplazar el reenvío automático por email por `GET /certificados/api/admin/certificados/{id}/entrega-manual`, autorizado según `admin-auth`. El endpoint DEBE ser de solo lectura respecto del estado de certificado/token, conservar el token vigente, devolver `publicValidationUrl`, `pdfDownloadUrl` y `tokenPrefix`, y NO DEBE enviar email, usar SMTP/PHPMailer, activar `/reenviar`, rotar token ni exponer token completo, DNI completo, secretos, SQL, rutas internas o claves en respuestas operativas, logs, auditoría o errores. El navegador DEBE usar sesión `HttpOnly`; `X-Admin-Key` MUST NOT aparecer en bundle o almacenamiento browser ni autorizar HTTP. El wiring Angular queda fuera de alcance.
(Previously: el endpoint exigía `X-Admin-Key` y admitía alternativas browser sin adoptar sesión como contrato.)

#### Scenario: Entrega manual exitosa

- DADO un certificado emitido con token activo recuperable y PDF persistido
- CUANDO se invoca `GET /certificados/api/admin/certificados/{id}/entrega-manual` con autorización válida
- ENTONCES la API DEBE responder `200` con `certificadoId`, `publicValidationUrl`, `pdfDownloadUrl` y `tokenPrefix`.
- Y NO DEBE rotar token, modificar estado de certificado/token ni ejecutar envío automático.

#### Scenario: Token conservado tras entrega manual

- DADO un certificado con un token activo `T_vigente`
- CUANDO se consulta la entrega manual
- ENTONCES la API DEBE mantener `T_vigente` activo para verificaciones posteriores.
- Y una verificación posterior con `T_vigente` DEBE responder `200` con DTO público válido.

#### Scenario: Certificado sin token recuperable

- DADO un certificado existente sin `token_cifrado`, con envelope inválido, clave inválida o descifrado fallido
- CUANDO se solicita la entrega manual
- ENTONCES la API DEBE responder `409 TOKEN_NOT_RECOVERABLE` sin inventar ni regenerar el link público.
- Y DEBE indicar que la regeneración requiere decisión auditada explícita sin exponer token, clave, IV, tag ni ciphertext.

#### Scenario: Entrega manual sin autorización

- DADO un request sin autorización válida según `admin-auth`
- CUANDO se solicita la entrega manual
- ENTONCES la API DEBE responder `401 UNAUTHORIZED` con sobre seguro.
- Y NO DEBE devolver link, PDF, token ni DNI completo.

#### Scenario: `X-Admin-Key` no expuesta desde el navegador

- DADO la UI administrativa en navegador Angular consumiendo endpoints admin
- CUANDO se inspecciona el bundle, `localStorage`, `sessionStorage` y cookies del navegador
- ENTONCES NO DEBE aparecer `X-Admin-Key` ni su valor en ningún almacenamiento del navegador ni en el bundle JS.
- Y NO DEBEN existir llamadas Angular directas con `X-Admin-Key`.
- Y la UI admin DEBE usar la sesión `HttpOnly` definida por `admin-auth`; si Angular admin queda fuera de alcance, DEBE documentarse y validarse que no se embebió la clave.

#### Scenario: Respuesta admin sin DNI ni token completo

- DADO una consulta de entrega manual autorizada exitosa o fallida
- CUANDO se inspecciona la respuesta JSON administrativa
- ENTONCES NO DEBE incluir DNI completo ni token completo en ningún campo de la respuesta operativa.
