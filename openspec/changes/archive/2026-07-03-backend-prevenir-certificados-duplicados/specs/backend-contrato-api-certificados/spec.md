# Delta for backend-contrato-api-certificados

## MODIFIED Requirements

### Requirement: Contrato administrativo mínimo de certificados

La API DEBE sostener endpoints administrativos bajo `/certificados/api/admin/` protegidos por `X-Admin-Key`: `POST /admin/certificados` para emisión desde `alumnoId` + `cursoId` con generación PDF/QR, snapshot de asistencias activas y respuesta `201` con `publicValidationUrl`, `pdfDownloadUrl` y `tokenPrefix`; `POST /admin/certificados/{id}/revocar`; `GET /admin/certificados/{id}/pdf`; y `GET /admin/certificados/{id}/entrega-manual`. Si ya existe un certificado con `estado='vigente'` y `revocado_en IS NULL` para el mismo alumno y curso, `POST /admin/certificados` DEBE responder `409 CERTIFICATE_ALREADY_EXISTS`; revocación o `estado='vencido'` liberan el slot, pero `vence_en` pasado no lo libera mientras el estado siga `vigente`. Entrega manual DEBE ser de solo lectura: NO DEBE rotar token, enviar email, activar SMTP/PHPMailer ni modificar estado. Las respuestas DEBEN usar envelopes existentes, DTOs seguros y errores sin DNI completo, token completo como campo separado, secretos, SQL ni rutas internas. `X-Admin-Key` es server-to-server y NO DEBE exponerse en Angular. `POST /admin/certificados/{id}/reenviar` NO DEBE formar parte del contrato MVP.
(Previously: el contrato administrativo documentaba emisión, revocación, PDF y entrega manual, pero no el `409 CERTIFICATE_ALREADY_EXISTS` por duplicado vigente.)

#### Scenario: Admin sin autorización

- DADO un request administrativo sin `X-Admin-Key` válido
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
