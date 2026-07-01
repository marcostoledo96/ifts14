# Spec — contrato de API para certificados QR

## Purpose

Definir el contrato de la API de certificados QR bajo `/certificados/api/`, consolidando el contrato público de verificación implementado en PHP 8.4 con prepared statements y lookup seguro por hash con pepper, más el slice administrativo de emisión, revocación, descarga PDF y reenvío por email protegido por `X-Admin-Key`. El DTO público incluye DNI completo visible por decisión institucional y las fechas asistidas del curso como datos del certificado. El QR/token es permanente durante la vida del certificado; el reenvío normal conserva el token salvo revocación explícita.

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

El token público MUST validarse antes de consultar la base y MUST buscarse como `SHA-256(token + token_pepper)` con `token_pepper` externo a Git y PDO prepared statements. El hash no reversible (`token_hash`) es suficiente para verificación pública, pero NO para reenvío: el reenvío normal conserva el token permanente y MUST poder reconstruir el enlace `/certificados/validar/{token}`, lo que requiere un artefacto recuperable (`token_cifrado` cifrado con clave externa a Git, o almacenamiento equivalente reversible). Hash-only es insuficiente para reenvío permanente.

#### Scenario: Token con formato permitido

- **Given** un token de 32 a 128 caracteres alfanuméricos con `_` o `-`
- **When** llega a la API
- **Then** la API MUST calcular el hash con pepper externo y MUST consultarlo con prepared statements.

#### Scenario: Token recuperable para reenvío

- **Given** un certificado con token activo y un reenvío administrativo solicitado
- **When** el backend reconstruye el enlace público de validación
- **Then** MUST recuperar el token desde un artefacto cifrado (`token_cifrado` con clave externa a Git) usando lookup por `token_hash` + `token_prefijo`.
- **And** MUST NOT requerir regeneración de token ni revocación en reenvío normal.

#### Scenario: Logs seguros

- **Given** una verificación pública exitosa o fallida
- **When** se registran eventos técnicos o de auditoría
- **Then** los logs MUST NOT incluir token completo, DNI completo, credenciales ni SQL con parámetros reales.

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

La API MUST documentar y sostener endpoints administrativos bajo `/certificados/api/admin/` protegidos por `X-Admin-Key`: `POST /admin/certificados` para emisión (con generación PDF/QR sincrónica y `pdfDownloadUrl` en la respuesta `201`), `POST /admin/certificados/{id}/revocar` para revocación, `GET /admin/certificados/{id}/pdf` para descarga del PDF persistido y `POST /admin/certificados/{id}/reenviar` para entrega/reenvío por email conservando el token/QR permanente. Las respuestas MUST usar envelopes JSON existentes, DTOs seguros y errores sin DNI completo, token completo, secretos, SQL ni rutas internas. El endpoint de descarga MUST responder `Content-Type: application/pdf` y `Content-Disposition: attachment` ante autorización válida, `401 UNAUTHORIZED` sin autorización y `404 PDF_NOT_FOUND` si el PDF no existe. El endpoint de reenvío MUST responder `200` con DTO de entrega sin token completo (preservando el QR/token permanente salvo revocación explícita), `401 UNAUTHORIZED` sin autorización, `404 CERTIFICATE_NOT_FOUND` si el certificado no existe y `503 DELIVERY_NOT_CONFIGURED` si el transporte no está configurado.
(Previously: el contrato administrativo cubría emisión, revocación y descarga PDF; el reenvío estaba explícitamente excluido.)

#### Scenario: Admin sin autorización

- **Given** un request a un endpoint administrativo sin `X-Admin-Key` válido
- **When** la API procesa la solicitud
- **Then** MUST responder `401 UNAUTHORIZED` con sobre de error seguro.

#### Scenario: Emisión documentada con PDF

- **Given** un request autorizado con payload mínimo válido y `public_base_url`/`certificate_storage_path` configurados
- **When** se invoca `POST /certificados/api/admin/certificados`
- **Then** el contrato MUST indicar `201` con certificado emitido, PDF/QR generado y `pdfDownloadUrl` presente.
- **And** MUST NOT devolver DNI completo ni token completo en la respuesta operativa administrativa, logs ni auditoría. El DNI completo solo es visible en el DTO público de validación aprobado por decisión institucional.

#### Scenario: Descarga PDF documentada

- **Given** un request autorizado a `GET /certificados/api/admin/certificados/{id}/pdf` para un certificado con PDF persistido
- **When** se invoca el endpoint
- **Then** el contrato MUST indicar `200` con `Content-Type: application/pdf` y `Content-Disposition: attachment`.

#### Scenario: Descarga PDF sin autorización documentada

- **Given** un request sin `X-Admin-Key` válido al endpoint de descarga PDF
- **When** se invoca el endpoint
- **Then** el contrato MUST indicar `401 UNAUTHORIZED` con sobre de error seguro.

#### Scenario: Descarga PDF inexistente documentada

- **Given** un request autorizado a un certificado sin PDF persistido
- **When** se invoca el endpoint de descarga
- **Then** el contrato MUST indicar `404 PDF_NOT_FOUND` sin revelar rutas internas.

#### Scenario: Revocación documentada

- **Given** un request autorizado para un certificado revocable
- **When** se invoca `POST /certificados/api/admin/certificados/{id}/revocar`
- **Then** el contrato MUST indicar revocación del certificado e invalidación de tokens activos.

#### Scenario: Reenvío documentado

- **Given** un request autorizado a `POST /certificados/api/admin/certificados/{id}/reenviar` con transporte configurado
- **When** se invoca el endpoint
- **Then** el contrato MUST indicar `200` con DTO de entrega `{ certificadoId, enviadoEn, destinatarioEnmascarado }`.
- **And** MUST NOT incluir el token completo en la respuesta.

#### Scenario: Reenvío sin transporte configurado

- **Given** un request autorizado al reenvío sin transporte SMTP configurado
- **When** se invoca el endpoint
- **Then** el contrato MUST indicar `503 DELIVERY_NOT_CONFIGURED` sin rotar token ni enviar email.

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
