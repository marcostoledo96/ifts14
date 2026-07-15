# Delta para backend-contrato-api-certificados

## MODIFIED Requirements

### Requirement: Contrato administrativo mínimo de certificados

La API DEBE sostener endpoints administrativos bajo `/certificados/api/admin/` autorizados según `admin-auth`: `POST /admin/certificados` para emisión desde `alumnoId` + `cursoId` con generación PDF secundario (opcional en futuras iteraciones) o QR, snapshot de asistencias activas y respuesta `201` con `publicValidationUrl`, `pdfDownloadUrl` y `tokenPrefix`; `POST /admin/certificados/{id}/revocar`; `GET /admin/certificados/{id}/pdf`; y `GET /admin/certificados/{id}/entrega-manual`. Los POST autenticados por cookie DEBEN cumplir CSRF antes de side effects. Si ya existe un certificado con `estado='vigente'` y `revocado_en IS NULL` para el mismo alumno y curso, `POST /admin/certificados` DEBE responder `409 CERTIFICATE_ALREADY_EXISTS`; revocación o `estado='vencido'` liberan el slot. Entrega manual DEBE ser de solo lectura y usar el 404 unificado si está revocado: NO DEBE rotar token, enviar email, activar SMTP/PHPMailer ni modificar estado (cualquier envío por email queda diferido a procesos externos opcionales). Las respuestas DEBEN usar envelopes existentes, DTOs seguros y errores sin DNI completo, token completo, secretos ni SQL. `X-Admin-Key` solo conserva el alcance CLI/smoke de `admin-auth`. `POST /admin/certificados/{id}/reenviar` queda excluido del MVP.
(Previously: los endpoints HTTP administrativos exigían `X-Admin-Key`.)
(Historial conservado: el contrato administrativo documentaba emisión, revocación, PDF y entrega manual, pero no la obligatoriedad del 404 unificado para revocados en entrega manual ni la delegación de emails.)

#### Scenario: Admin sin autorización

- DADO un request administrativo sin autorización válida según `admin-auth`
- CUANDO la API procesa la solicitud
- ENTONCES DEBE responder `401 UNAUTHORIZED` con sobre seguro.

#### Scenario: Emisión desde asistencias documentada

- DADO un request autorizado con `alumnoId` y `cursoId` válidos
- CUANDO se invoca `POST /certificados/api/admin/certificados`
- ENTONCES la API DEBE responder `201` con certificado emitido, PDF/QR generado, snapshot, `publicValidationUrl`, `pdfDownloadUrl` y `tokenPrefix`.
- Y NO DEBE incluir token completo como campo separado ni DNI completo administrativo.

#### Scenario: Certificado vigente duplicado documentado

- DADO un request autorizado para un `alumnoId` + `cursoId` con certificado vigente existente
- CUANDO se invoca `POST /certificados/api/admin/certificados`
- ENTONCES la API DEBE responder `409 CERTIFICATE_ALREADY_EXISTS` con sobre de error seguro.
- Y NO DEBE exponer DNI completo, token completo, SQL, secretos ni rutas internas.

#### Scenario: Descarga PDF documentada

- DADO un request autorizado para un certificado con PDF persistido
- CUANDO se invoca `GET /certificados/api/admin/certificados/{id}/pdf`
- ENTONCES el contrato DEBE indicar `200` con `Content-Type: application/pdf` y `Content-Disposition: attachment`.

#### Scenario: Descarga PDF sin autorización documentada

- DADO un request sin autorización válida al endpoint de descarga PDF
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

La API DEBE exponer endpoints administrativos bajo `/certificados/api/admin/` para crear, listar, consultar y actualizar estado de cursos y alumnos; crear, listar y actualizar fechas de curso; registrar, listar y anular asistencias. Todos DEBEN requerir autorización según `admin-auth`; `POST` y `PATCH` DEBEN exigir JSON y, si están autenticados por cookie, CSRF válido. Las respuestas administrativas DEBEN usar DTOs seguros: alumnos con `dniMostrar` enmascarado, nunca DNI completo, `dni_hash`, `dni_cifrado`, token completo, SQL, secretos ni rutas internas. La creación de alumno DEBE fallar cerrado con `500 CONFIGURATION_ERROR` antes de persistir si `dni_cipher_key` falta o es inválida. No DEBE agregar frontend, SMTP, email automático ni migraciones nuevas.
(Previously: todos los endpoints requerían literalmente `X-Admin-Key`.)

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

### Requirement: Preservación del contrato administrativo durante PDF institucional

El cambio de contenido del PDF DEBE conservar sin cambios los contratos administrativos existentes de emisión, descarga de PDF y entrega manual, excepto la autorización que queda regida por `admin-auth`. La API NO DEBE agregar SMTP, email, reenvío automático, endpoint de edición de configuración institucional, rotación de token ni cambios en el DTO operativo por este ciclo.
(Previously: la preservación exigía `X-Admin-Key` para la descarga PDF.)

#### Scenario: Emisión conserva DTO administrativo

- DADO un request autorizado a `POST /certificados/api/admin/certificados`
- CUANDO la emisión genera el PDF institucional
- ENTONCES la respuesta DEBE conservar `201`, `publicValidationUrl`, `pdfDownloadUrl` y `tokenPrefix`.
- Y NO DEBE incluir token completo independiente, DNI completo administrativo ni campos nuevos de configuración institucional.

#### Scenario: Descarga PDF conserva contrato

- DADO un certificado emitido con PDF institucional persistido
- CUANDO se invoca `GET /certificados/api/admin/certificados/{id}/pdf` con autorización válida
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

La API DEBE exponer `GET /certificados/api/admin/certificados/{id}/qr.png` con autorización según `admin-auth`. El `200` DEBE entregar PNG del mismo `publicValidationUrl`, con `image/png`, `attachment`, filename seguro, `Content-Length`, `nosniff`, `SAMEORIGIN`, `no-store/private`. NO DEBE rotar token, mutar base, enviar email ni exponer token completo.
(Previously: la descarga QR exigía literalmente `X-Admin-Key`.)

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

### Requirement: Checklist compartido post-merge Angular/API

El contrato backend DEBE registrar el checklist M3-06 final como cierre documental post-merge: DTO público D0, DTO administrativo enmascarado, códigos de error, estados no verificables, privacidad, evidencia CI Docker/MariaDB y restricciones D0. Este checkpoint NO DEBE agregar deploy, cPanel, rotación de token/QR, email, SMTP/PHPMailer ni vendor versionado.
(Previously: el checklist mantenía la autenticación administrativa limitada a `X-Admin-Key`.)

#### Scenario: Privacidad preservada

- **Dado** respuestas públicas y administrativas del contrato de certificados
- **Cuando** se documenta el checkpoint compartido
- **Entonces** DEBE constar que el DNI completo sólo pertenece al DTO/UI pública.
- **Y** las respuestas administrativas DEBEN usar `documentMasked` y no exponer token completo.

#### Scenario: Invariantes D0 preservados

- **Dado** un certificado con QR/token permanente
- **Cuando** se valida, consulta administrativamente o entrega manualmente
- **Entonces** el contrato NO DEBE rotar token/QR ni activar reenvío por email.
- **Y** la autenticación administrativa DEBE seguir las reglas de sesión y compatibilidad CLI de `admin-auth`.
