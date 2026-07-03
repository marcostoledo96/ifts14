# Spec — admin-certificate-delivery

## Purpose

Definir la entrega manual administrativa de certificados mediante link público y descarga de PDF, sin email, SMTP, PHPMailer ni reenvío automático. El QR/token es permanente; el token completo no se guarda en texto plano, no se expone como campo JSON separado y se recupera solo desde `token_cifrado` con clave externa.

## Requirements

### Requirement: Reenvío administrativo por email

La API DEBE reemplazar el reenvío automático por email por `GET /certificados/api/admin/certificados/{id}/entrega-manual`, protegido por `X-Admin-Key`. El endpoint DEBE ser de solo lectura respecto del estado de certificado/token, conservar el token vigente, devolver `publicValidationUrl`, `pdfDownloadUrl` y `tokenPrefix`, y NO DEBE enviar email, usar SMTP/PHPMailer, activar `/reenviar`, rotar token ni exponer token completo, DNI completo, secretos, SQL, rutas internas o claves en respuestas operativas, logs, auditoría o errores. `X-Admin-Key` es server-to-server: NO DEBE haber llamadas Angular directas que lo usen, ni estar embebido o expuesto desde bundles de Angular ni almacenamiento del navegador. Si existe UI admin MVP en navegador, DEBE quedar protegida por cPanel Basic Auth o sesión/proxy PHP `HttpOnly`; si este ciclo queda backend-only, el wiring Angular admin queda fuera de alcance pero DEBEN existir checks/documentación que prueben que no se embebió la clave.

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

- DADO un request sin `X-Admin-Key` válido
- CUANDO se solicita la entrega manual
- ENTONCES la API DEBE responder `401 UNAUTHORIZED` con sobre seguro.
- Y NO DEBE devolver link, PDF, token ni DNI completo.

#### Scenario: `X-Admin-Key` no expuesta desde el navegador

- DADO la UI administrativa en navegador Angular consumiendo endpoints admin
- CUANDO se inspecciona el bundle, `localStorage`, `sessionStorage` y cookies del navegador
- ENTONCES NO DEBE aparecer `X-Admin-Key` ni su valor en ningún almacenamiento del navegador ni en el bundle JS.
- Y NO DEBEN existir llamadas Angular directas con `X-Admin-Key`.
- Y la UI admin DEBE usar cPanel Basic Auth o sesión/proxy PHP `HttpOnly` para el MVP; si Angular admin queda fuera de alcance, DEBE documentarse y validarse que no se embebió la clave.

#### Scenario: Respuesta admin sin DNI ni token completo

- DADO una consulta de entrega manual autorizada exitosa o fallida
- CUANDO se inspecciona la respuesta JSON administrativa
- ENTONCES NO DEBE incluir DNI completo ni token completo en ningún campo de la respuesta operativa.

#### Scenario: Certificado inexistente

- DADO un `id` que no corresponde a un certificado existente
- CUANDO se invoca la entrega manual autorizada
- ENTONCES DEBE responder `404 CERTIFICATE_NOT_FOUND` sin revelar detalles internos.

### Requirement: Privacidad del token en el canal de entrega

El sistema DEBE exponer el token completo solo dentro de `publicValidationUrl` devuelto al operador autorizado para copia manual. El endpoint de entrega manual NO DEBE persistir el token completo en texto plano ni escribir cambios de certificado/token; logs, auditoría, errores y campos auxiliares NO DEBEN contener token completo ni DNI completo.

#### Scenario: Token solo en link autorizado

- DADO una consulta de entrega manual exitosa
- CUANDO se inspeccionan logs, auditoría, errores y campos distintos de `publicValidationUrl`
- ENTONCES NO DEBE aparecer el token completo en ninguno de esos canales.
- Y el link DEBE apuntar a `/certificados/validar/{token}`.

#### Scenario: Endpoint sin escritura operativa

- DADO una consulta de entrega manual exitosa o fallida
- CUANDO se procesa el request
- ENTONCES NO DEBE modificarse estado de certificado, token, revocación ni entrega.

### Requirement: Rollback documentado

El cambio DEBE incluir un plan de rollback que retire la ruta de entrega manual y revierta los deltas de docs/specs sin invalidar certificados existentes ni tokens vigentes.

#### Scenario: Rollback ejecutable

- DADO el cambio aplicado
- CUANDO se ejecuta el rollback
- ENTONCES DEBE quedar removida la ruta `GET /admin/certificados/{id}/entrega-manual`.
- Y DEBEN conservarse los certificados y tokens vigentes.

### Requirement: Adaptador de transporte configurable

(Reason: SMTP, PHPMailer, transporte `stub|smtp` y factory quedan fuera del MVP.)
(Migration: eliminar configuración y dependencias activas de email; reintroducirlas solo con nuevo ciclo SDD.)

### Requirement: Contenido del email limitado a enlace

(Reason: el MVP no construye ni envía emails desde el sistema.)
(Migration: la Bedelía copia manualmente `publicValidationUrl` y descarga el PDF por `pdfDownloadUrl`.)

### Requirement: Bloqueo de envío real sin configuración confirmada

(Reason: no existe envío real ni configuración SMTP activa en este ciclo.)
(Migration: mantener `/reenviar`, SMTP y PHPMailer inactivos hasta nuevo ciclo SDD.)

### Requirement: Validación operativa DB-backed de entrega manual

El endpoint `GET /certificados/api/admin/certificados/{id}/entrega-manual` DEBE tener cierre de deploy-readiness mediante smoke DB-backed para casos `200` recuperable y `409 TOKEN_NOT_RECOVERABLE`, o gate exacto documentado si falta acceso aprobado. Este cambio NO DEBE reintroducir email, SMTP, PHPMailer, `/reenviar` ni rotación de token.

#### Scenario: Smoke recuperable 200

- DADO un certificado emitido con `token_cifrado` recuperable y PDF disponible en una DB aprobada
- CUANDO se ejecuta el smoke autorizado de entrega manual
- ENTONCES la API DEBE responder `200` con link público y datos operativos seguros
- Y NO DEBE enviar email, rotar token ni escribir cambios de entrega.

#### Scenario: Smoke legacy 409

- DADO un certificado legacy sin token recuperable en una DB aprobada
- CUANDO se ejecuta el smoke autorizado de entrega manual
- ENTONCES la API DEBE responder `409 TOKEN_NOT_RECOVERABLE`
- Y NO DEBE inventar, regenerar ni completar evidencia faltante.

#### Scenario: Gate sin DB/config

- DADO que no hay DB o configuración externa aprobada
- CUANDO se verifica readiness del endpoint
- ENTONCES se DEBE registrar el gate pendiente con precondiciones y comando esperado
- Y NO SE DEBEN leer secretos reales ni simular respuestas HTTP como evidencia.

#### Scenario: Sin reintroducción de email

- DADO el cierre operacional de entrega manual
- CUANDO se revisa el alcance del cambio
- ENTONCES NO DEBEN reaparecer SMTP, PHPMailer, `/reenviar` ni envío automático
- Y el gate DEBE limitarse a readiness operacional, no a funcionalidad nueva.

### Requirement: Entrega manual con descarga de QR

La entrega manual DEBE permitir QR PNG vía `GET /certificados/api/admin/certificados/{id}/qr.png`, sin reemplazar `entrega-manual`, email, SMTP/PHPMailer, `/reenviar`, regeneración ni rotación. DEBE requerir admin auth y reutilizar `publicValidationUrl`.

#### Scenario: Bedelía descarga QR para canal externo

- DADO un certificado con token recuperable y PDF disponible
- CUANDO Bedelía solicita el QR PNG con autorización válida
- ENTONCES recibe PNG adjunto con el mismo link público que entrega manual/PDF.

#### Scenario: QR no cambia el flujo de entrega

- DADO una descarga QR exitosa
- CUANDO se revisa el estado posterior del certificado y token
- ENTONCES NO DEBE haber rotación, reenvío, email, regeneración ni mutación; el token vigente DEBE seguir validando.

#### Scenario: Fallas seguras de entrega QR

- DADO un request sin autorización, certificado inexistente o token no recuperable
- CUANDO se solicita el QR PNG
- ENTONCES DEBE responder `401`, `404` o `409`, sin DNI admin, token separado ni detalles internos.
