# Delta para certificate-pdf-qr-generation

## MODIFIED Requirements

### Requisito: Descarga administrativa de PDF

El sistema DEBE exponer `GET /certificados/api/admin/certificados/{id}/pdf` autorizado según `admin-auth` que devuelva el PDF persistido del certificado. La respuesta DEBE usar `Content-Type: application/pdf` y `Content-Disposition: attachment`. El sistema NO DEBE exponer el token completo en la descarga ni aceptar solicitudes sin autorización.
(Antes: la descarga exigía literalmente `X-Admin-Key`.)

#### Escenario: Descarga autorizada

- DADO un request autorizado según `admin-auth` para un certificado con PDF persistido
- CUANDO se invoca `GET /certificados/api/admin/certificados/{id}/pdf`
- ENTONCES el sistema DEBE responder `200` con el contenido PDF
- Y DEBE incluir `Content-Type: application/pdf` y `Content-Disposition: attachment`.

#### Escenario: Descarga sin autorización

- DADO un request sin autorización válida
- CUANDO se invoca el endpoint de descarga
- ENTONCES el sistema DEBE responder `401 UNAUTHORIZED` sin exponer el PDF ni metadatos sensibles.

#### Escenario: PDF inexistente

- DADO un request autorizado para un certificado sin PDF persistido
- CUANDO se invoca el endpoint de descarga
- ENTONCES el sistema DEBE responder `404 PDF_NOT_FOUND` sin revelar rutas internas.
