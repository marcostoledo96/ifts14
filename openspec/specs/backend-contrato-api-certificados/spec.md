# Spec — contrato de API para certificados QR

## Purpose

Definir el contrato de la API de certificados QR bajo `/certificados/api/`, consolidando el contrato público de verificación implementado en PHP 8.4 con prepared statements y lookup seguro por hash con pepper, más el slice administrativo de emisión, revocación, descarga PDF y entrega manual protegido por `X-Admin-Key`. La entrega manual reemplaza al reenvío por email: Bedelía copia el link público y descarga el PDF por canal externo, sin email, SMTP, PHPMailer ni transporte `stub`. El DTO público incluye DNI completo visible por decisión institucional y las fechas asistidas del curso como datos del certificado. El QR/token es permanente durante la vida del certificado; la entrega manual es de solo lectura y nunca rota el token salvo revocación explícita.

## Requirements

### Requirement: Contrato público de verificación

La API MUST exponer un contrato JSON para validar certificados desde QR o enlace con respuesta pública bajo la URL desplegada `/certificados/api/certificados/{token}/verificacion`. El DTO público MUST incluir `data.valid`, estado, código de certificado, curso, fecha de emisión, DNI completo visible por decisión institucional y fechas asistidas del curso; MUST NOT incluir token completo, hashes ni datos internos. La ruta PHP normalizada MAY omitir el prefijo `/certificados/api` si el front controller ya lo resolvió.

#### Scenario: Certificado válido

- **Given** un token público con formato válido y certificado vigente
- **When** se consulta `GET /certificados/api/certificados/{token}/verificacion`
- **Then** la respuesta MUST ser `200` con `data.valid: true`, estado, código de certificado, curso, fecha de emisión, DNI completo visible y fechas asistidas del curso.
- **And** MUST NOT incluir token completo, hashes, pepper, nombres de tablas ni datos internos.

#### Scenario: Token no verificable

- **Given** un token inexistente, revocado, vencido o no actual
- **When** se consulta la verificación pública
- **Then** la respuesta MUST usar `404 CERTIFICATE_NOT_FOUND` sin revelar cuál condición ocurrió.

### Requirement: Consulta alternativa por POST

La API MUST ofrecer `POST /certificados/api/certificados/consulta` con body JSON `{ "token": "..." }` y MUST reutilizar el mismo DTO público de verificación.

#### Scenario: Consulta POST válida

- **Given** un cliente que no puede enviar el token como path param
- **When** envía `POST /certificados/api/certificados/consulta` con token válido
- **Then** la API MUST responder con el mismo contrato que el endpoint `GET` de verificación.

### Requirement: Sobre de errores estable

Toda respuesta de error MUST usar `{ error: { code, message, details }, meta: { requestId } }` y MUST NOT exponer SQL, rutas internas, credenciales, DNI completo ni token completo.

#### Scenario: Token inválido por formato

- **Given** un token ausente o con caracteres no permitidos
- **When** se consulta la API
- **Then** la respuesta MUST ser `400 VALIDATION_ERROR` con mensaje seguro y sin valores sensibles.

#### Scenario: Error interno

- **Given** una falla inesperada del backend
- **When** la API responde al cliente público
- **Then** la respuesta MUST ser `500 INTERNAL_ERROR` sin stack trace ni rutas internas.

### Requirement: Validación y seguridad del token QR

El token público DEBE validarse antes de consultar la base y DEBE buscarse como `SHA-256(token + token_pepper)` con `token_pepper` externo a Git y PDO prepared statements. El hash no reversible (`token_hash`) es suficiente para verificación pública, pero NO para entrega manual: el sistema DEBE poder reconstruir el enlace `/certificados/validar/{token}` desde un artefacto recuperable (`token_cifrado` cifrado con clave externa a Git, o almacenamiento equivalente reversible). Si se usa `token_cifrado`, DEBE usar AES-256-GCM con envelope textual `v1.<iv_b64url>.<tag_b64url>.<ciphertext_b64url>`, IV de 12 bytes, tag de 16 bytes y clave base64/base64url que decodifique exactamente 32 bytes. Hash-only es insuficiente para entrega manual. El token completo NO DEBE persistirse en texto plano ni aparecer en logs, auditoría, errores o respuestas administrativas como campo separado; tampoco DEBEN registrarse clave, IV, tag ni ciphertext.

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

### Requirement: Conceptos de datos existentes sin migración nueva

El contrato MUST usar las tablas `cert_` ya definidas en la migración `001_certificados_qr.sql`, MUST mantener `token_pepper` en configuración externa y MUST alinear los seeds demo con `SHA-256(token + token_pepper)` sin crear migraciones nuevas en este ciclo.

#### Scenario: Conceptos documentados

- **Given** este ciclo finalizado
- **When** se lee la documentación de backend y base
- **Then** SHOULD figurar `cert_certificados`, `cert_tokens_verificacion` y `cert_eventos_auditoria` como tablas existentes del modelo.
- **And** MUST NOT existir migración SQL nueva por este cambio.

### Requirement: Integración futura Angular y cPanel

El contrato MUST indicar que Angular leerá `/certificados/validar/:tokenCertificacion`, consultará la API bajo `/certificados/api/` y que `.htaccess` no debe capturar `/api/`.

#### Scenario: Ruta pública frontend

- **Given** un QR emitido en el futuro
- **When** una persona lo escanea
- **Then** SHOULD abrir `/certificados/validar/{token}` y el frontend SHOULD consultar el endpoint de verificación.

#### Scenario: Deploy compatible con cPanel

- **Given** el despliegue en `public_html/certificados/`
- **When** se configuren rutas profundas
- **Then** `.htaccess` MUST permitir Angular y excluir `/api/` del fallback.

### Requirement: Pendientes de capacidad operativa

El endpoint público de verificación MUST aplicar rate limiting mínimo y responder `429 RATE_LIMITED` al exceder el umbral configurado. La falla del INSERT de auditoría MUST NOT romper la respuesta pública: una validación válida conserva `200`, una no verificable conserva `404` y un token inválido conserva `400` si corresponde.

#### Scenario: Auditoría no rompe respuesta válida

- **Given** un certificado verificable y un fallo del `INSERT` en `cert_eventos_auditoria`
- **When** la API arma la respuesta pública
- **Then** MUST devolver `200` con el DTO público válido sin exponer la falla interna.

#### Scenario: Auditoría no rompe respuesta no verificable

- **Given** un token no verificable y un fallo del `INSERT` de auditoría
- **When** se consulta la verificación pública
- **Then** MUST devolver `404 CERTIFICATE_NOT_FOUND` sin propagar la falla interna.

#### Scenario: Auditoría no rompe token inválido

- **Given** un token ausente o con formato inválido y auditoría no disponible
- **When** se consulta GET o POST
- **Then** MUST devolver `400 VALIDATION_ERROR` si aplica por formato, sin exponer la falla interna.

#### Scenario: Rate limiting aplicado

- **Given** múltiples consultas públicas desde el mismo bucket hasta exceder la ventana configurada
- **When** la API recibe una nueva consulta GET o POST dentro de esa ventana
- **Then** MUST responder `429 RATE_LIMITED` con sobre de error seguro.

### Requirement: Contrato administrativo mínimo de certificados

La API DEBE sostener endpoints administrativos bajo `/certificados/api/admin/` protegidos por `X-Admin-Key`: `POST /admin/certificados` para emisión desde `alumnoId` + `cursoId` con generación PDF/QR, snapshot de asistencias activas y respuesta `201` con `publicValidationUrl`, `pdfDownloadUrl` y `tokenPrefix`; `POST /admin/certificados/{id}/revocar`; `GET /admin/certificados/{id}/pdf`; y `GET /admin/certificados/{id}/entrega-manual`. Entrega manual DEBE ser de solo lectura: NO DEBE rotar token, enviar email, activar SMTP/PHPMailer ni modificar estado de negocio. Las respuestas DEBEN usar envelopes existentes, DTOs seguros y errores sin DNI completo, token completo como campo separado, secretos, SQL ni rutas internas. `X-Admin-Key` es server-to-server y NO DEBE exponerse en Angular. `POST /admin/certificados/{id}/reenviar` NO DEBE formar parte del contrato MVP.

#### Scenario: Admin sin autorización

- DADO un request administrativo sin `X-Admin-Key` válido
- CUANDO la API procesa la solicitud
- ENTONCES DEBE responder `401 UNAUTHORIZED` con sobre seguro.

#### Scenario: Emisión desde asistencias documentada

- DADO un request autorizado con `alumnoId` y `cursoId` válidos
- CUANDO se invoca `POST /certificados/api/admin/certificados`
- ENTONCES la API DEBE responder `201` con certificado emitido, PDF/QR generado, snapshot, `publicValidationUrl`, `pdfDownloadUrl` y `tokenPrefix`.
- Y NO DEBE incluir token completo como campo separado ni DNI completo administrativo.

#### Scenario: Descarga PDF documentada

- DADO un request autorizado para un certificado con PDF persistido
- CUANDO se invoca `GET /certificados/api/admin/certificados/{id}/pdf`
- ENTONCES el contrato DEBE indicar `200` con `Content-Type: application/pdf` y `Content-Disposition: attachment`.

#### Scenario: Descarga PDF sin autorización documentada

- DADO un request sin `X-Admin-Key` válido al endpoint de descarga PDF
- CUANDO se invoca el endpoint
- ENTONCES el contrato DEBE indicar `401 UNAUTHORIZED` con sobre seguro.

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
- Y NO DEBE rotar token, enviar email ni modificar estado.

#### Scenario: Reenvío removido

- DADO un cliente que invoca `POST /certificados/api/admin/certificados/{id}/reenviar`
- CUANDO el MVP procesa la ruta
- ENTONCES la API DEBE responder ruta inexistente o método no permitido con error seguro.
- Y NO DEBE activar SMTP, PHPMailer ni transporte `stub`.

### Requirement: Contrato administrativo de datos maestros

La API DEBE exponer endpoints administrativos bajo `/certificados/api/admin/` para crear, listar, consultar y actualizar estado de cursos y alumnos; crear, listar y actualizar fechas de curso; registrar, listar y anular asistencias. Todos DEBEN requerir `X-Admin-Key`; `POST` y `PATCH` DEBEN exigir JSON. Las respuestas administrativas DEBEN usar DTOs seguros: alumnos con `dniMostrar` enmascarado, nunca DNI completo, `dni_hash`, `dni_cifrado`, token completo, SQL, secretos ni rutas internas. La creación de alumno DEBE fallar cerrado con `500 CONFIGURATION_ERROR` antes de persistir si `dni_cipher_key` falta o es inválida. No DEBE agregar frontend, SMTP, email automático ni migraciones nuevas.

#### Scenario: CRUD mínimo de cursos

- DADO un request admin autorizado con código y nombre válidos
- CUANDO crea, lista, consulta y actualiza estado de un curso
- ENTONCES la API DEBE responder con DTO `{id, codigo, nombre, estado, createdAt, updatedAt}`.
- Y DEBE responder `409 CONFLICT` si el código de curso duplica un recurso activo o histórico existente.

#### Scenario: Alumno con DNI cifrado y DTO seguro

- DADO un request admin autorizado con `dni_cipher_key` válida
- CUANDO crea un alumno con DNI válido
- ENTONCES la API DEBE persistir `dni_hash` binario y `dni_cifrado`.
- Y DEBE responder solo `{id, apellidoNombre, dniMostrar, estado}` sin DNI completo ni columnas internas.

#### Scenario: Clave DNI ausente falla cerrado

- DADO que falta `dni_cipher_key` o no decodifica a 32 bytes
- CUANDO se invoca `POST /certificados/api/admin/alumnos`
- ENTONCES la API DEBE responder `500 CONFIGURATION_ERROR`.
- Y NO DEBE insertar filas en `cert_alumnos` ni exponer el DNI recibido.

#### Scenario: Fechas de curso ordenadas

- DADO un curso con fechas cargadas
- CUANDO se consulta `GET /certificados/api/admin/cursos/{cursoId}/fechas`
- ENTONCES la API DEBE devolver fechas ordenadas por `orden ASC, fecha ASC`.
- Y DEBE rechazar estados fuera de `programada|realizada|cancelada` con `400 VALIDATION_ERROR`.

#### Scenario: Asistencia activa y duplicado conflictivo

- DADO alumno `activo`, curso `activo` y fecha del curso en estado `programada` o `realizada`
- CUANDO se registra asistencia
- ENTONCES la API DEBE crear una fila activa en `cert_asistencias`.
- Y si ya existe una asistencia activa equivalente DEBE responder `409 CONFLICT` sin crear duplicado.

#### Scenario: Anulación lógica de asistencia

- DADO una asistencia activa existente
- CUANDO se invoca `DELETE /certificados/api/admin/asistencias/{id}`
- ENTONCES la API DEBE completar `eliminado_en`.
- Y las listas de asistencias activas DEBEN excluirla sin ejecutar `DELETE` físico.

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

### Requirement: DTO público desde snapshot certificado

La validación pública DEBE devolver `documentNumber` y `attendedDates` desde alumno/snapshot cuando existan FKs y snapshot; para certificados legacy DEBE mantener fallback seguro sin romper el contrato disponible.

#### Scenario: Certificado nuevo con snapshot

- DADO un certificado emitido desde alumno, curso y asistencias
- CUANDO se valida públicamente
- ENTONCES el DTO DEBE incluir DNI completo aprobado y `attendedDates` del snapshot.

#### Scenario: Certificado legacy sin snapshot

- DADO un certificado anterior sin FKs ni `cert_certificado_fechas`
- CUANDO se valida públicamente
- ENTONCES la API DEBE responder con datos heredados disponibles o error seguro según estado.
- Y NO DEBE recalcular ni inventar fechas asistidas.

### Requirement: Headers de seguridad en respuestas JSON

Toda respuesta JSON de la API MUST incluir `X-Content-Type-Options: nosniff` y `X-Frame-Options: SAMEORIGIN`. La respuesta MUST NOT exponer secretos, DNI completo, tokens completos, SQL ni rutas internas.

#### Scenario: Respuesta JSON con headers mínimos

- **Given** cualquier endpoint JSON de `/certificados/api/`
- **When** la API responde éxito o error
- **Then** MUST incluir `X-Content-Type-Options: nosniff`.
- **And** MUST incluir `X-Frame-Options: SAMEORIGIN`.

### Requirement: Validación de Content-Type en POST JSON

Los endpoints POST que esperan JSON MUST exigir `Content-Type: application/json` compatible. Si falta o no corresponde, MUST responder `415 UNSUPPORTED_MEDIA_TYPE` antes de validar payload o ejecutar side effects.

#### Scenario: Content-Type inválido

- **Given** un POST JSON público o administrativo sin `application/json`
- **When** llega a la API
- **Then** MUST responder `415 UNSUPPORTED_MEDIA_TYPE` con sobre de error seguro.
- **And** MUST NOT persistir, auditar acción de negocio ni revocar certificados.

#### Scenario: Content-Type válido

- **Given** un POST con `Content-Type: application/json`
- **When** el body es procesable
- **Then** la API MAY continuar con la validación del payload.

### Requirement: JSON malformado en POST JSON

Los endpoints `POST /certificados/api/certificados/consulta`, `POST /certificados/api/admin/certificados` y `POST /certificados/api/admin/certificados/{id}/revocar` MUST responder `400 VALIDATION_ERROR` ante JSON malformado antes de cualquier side effect.

#### Scenario: Body JSON malformado

- **Given** un POST JSON con body sintácticamente inválido
- **When** la API intenta leerlo
- **Then** MUST responder `400 VALIDATION_ERROR` con mensaje seguro.
- **And** MUST NOT consultar por token completo, emitir, revocar ni persistir cambios.

### Requirement: Pendientes de hardening documentados

La documentación backend SHOULD registrar como diferidos: límite de tamaño de body, rate limiting distribuido, observabilidad real y `ultimo_uso_en` en verificación pública. CORS/preflight queda resuelto de forma acotada para el smoke local de este checkpoint y DEBE registrarse como excepción local, no como hardening productivo.

#### Scenario: Gaps explícitos restantes

- **Given** este ciclo archivado
- **When** se revisa la documentación backend
- **Then** SHOULD listar límite de tamaño de body, rate limiting distribuido, observabilidad real y `ultimo_uso_en` como fuera de alcance.
- **And** DEBE registrar CORS/preflight local como excepción resuelta del checkpoint, no como hardening productivo.

### Requirement: Soporte de consumo browser local seguro

La API DEBE permitir el consumo desde `ng serve` en local para el smoke de integración. Cuando se requiera CORS/preflight, la API PUEDE responder `Access-Control-Allow-Origin` acotado al origen local de Angular y DEBE limitar los headers/methods expuestos a los del contrato público. El soporte DEBE quedar restringido a configuración local y NO DEBE habilitar CORS abierto en producción.

#### Scenario: Preflight local exitoso

- **Given** Angular en `ng serve` sobre `http://localhost:4200` y API PHP local configurada para aceptar ese origen
- **When** el navegador envía `OPTIONS /certificados/api/certificados/{token}/verificacion`
- **Then** la API DEBE responder preflight exitoso con `Access-Control-Allow-Origin: http://localhost:4200`.
- **And** DEBE NO exponer headers administrativos ni `X-Admin-Key` en el preflight público.

#### Scenario: CORS abierto prohibido en producción

- **Given** la configuración de producción de la API
- **When** llega un request con `Origin` no autorizado
- **Then** la API DEBE NO devolver `Access-Control-Allow-Origin: *` para endpoints públicos.

#### Scenario: Preflight no requerido

- **Given** que el smoke local se resuelve vía proxy/base URL sin CORS
- **When** Angular consume la API PHP local
- **Then** la API PUEDE no agregar headers CORS y el smoke DEBE completarse sin preflight.

### Requirement: Preservación del contrato administrativo durante PDF institucional

El cambio de contenido del PDF DEBE conservar sin cambios los contratos administrativos existentes de emisión, descarga de PDF y entrega manual. La API NO DEBE agregar SMTP, email, reenvío automático, endpoint de edición de configuración institucional, rotación de token ni cambios en el DTO operativo por este ciclo.

#### Scenario: Emisión conserva DTO administrativo

- DADO un request autorizado a `POST /certificados/api/admin/certificados`
- CUANDO la emisión genera el PDF institucional
- ENTONCES la respuesta DEBE conservar `201`, `publicValidationUrl`, `pdfDownloadUrl` y `tokenPrefix`.
- Y NO DEBE incluir token completo independiente, DNI completo administrativo ni campos nuevos de configuración institucional.

#### Scenario: Descarga PDF conserva contrato

- DADO un certificado emitido con PDF institucional persistido
- CUANDO se invoca `GET /certificados/api/admin/certificados/{id}/pdf` con `X-Admin-Key` válido
- ENTONCES la API DEBE responder `200` con `Content-Type: application/pdf` y `Content-Disposition: attachment`.
- Y NO DEBE exponer rutas internas, token completo ni configuración sensible.

#### Scenario: Entrega manual no rota ni envía email

- DADO un certificado emitido con token recuperable y PDF institucional
- CUANDO se invoca `GET /certificados/api/admin/certificados/{id}/entrega-manual`
- ENTONCES la API DEBE responder con `publicValidationUrl`, `pdfDownloadUrl` y `tokenPrefix` existentes.
- Y NO DEBE rotar token, enviar email, activar SMTP/PHPMailer ni modificar estado de negocio.

#### Scenario: Reenvío automático sigue fuera de alcance

- DADO un cliente que intenta usar reenvío automático o edición de configuración institucional
- CUANDO consulta rutas no incluidas en el MVP
- ENTONCES la API DEBE responder ruta inexistente o método no permitido con error seguro.
- Y NO DEBE crear comportamiento nuevo de SMTP, reenvío ni configuración editable.

### Requirement: Descarga administrativa de QR PNG

La API DEBE exponer `GET /certificados/api/admin/certificados/{id}/qr.png` con `X-Admin-Key`. El `200` DEBE entregar PNG del mismo `publicValidationUrl`, con `image/png`, `attachment`, filename seguro, `Content-Length`, `nosniff`, `SAMEORIGIN`, `no-store/private`. NO DEBE rotar token, mutar base, enviar email ni exponer token completo.

#### Scenario: Descarga QR autorizada

- DADO un certificado existente con token recuperable y admin autorizado
- CUANDO invoca `GET /certificados/api/admin/certificados/{id}/qr.png`
- ENTONCES DEBE responder `200` con PNG, length correcto y attachment `*-qr.png` seguro.

#### Scenario: Errores de contrato seguros

- DADO un request sin auth, método no GET, id inválido o certificado inexistente
- CUANDO se invoca la ruta de QR
- ENTONCES DEBE responder `401`, `405` con `Allow: GET`, `400` o `404`, con anti-cache y sobre seguro si es JSON.

#### Scenario: Token no recuperable

- DADO un certificado con token ausente, inválido o no descifrable
- CUANDO se solicita el QR PNG
- ENTONCES DEBE responder `409 TOKEN_NOT_RECOVERABLE`, sin regenerar ni exponer token, claves, SQL o rutas.

### Requirement: Anti-cache y filenames seguros

Las respuestas JSON sensibles y descargas PDF/QR DEBEN usar anti-cache; PDF/QR DEBEN usar filename sanitizado sin CRLF, traversal ni token.

#### Scenario: PDF y QR no cacheables

- DADO una respuesta JSON sensible o descarga administrativa de PDF/QR
- CUANDO la API responde el binario
- ENTONCES DEBE incluir `Cache-Control: no-store, private, max-age=0`, `Pragma: no-cache` y `Expires: 0`.
- Y PDF/QR DEBEN conservar headers binarios seguros.
