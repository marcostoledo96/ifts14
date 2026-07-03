# Delta — backend-contrato-api-certificados

## ADDED Requirements

### Requisito: Descarga administrativa de QR PNG

La API DEBE exponer `GET /certificados/api/admin/certificados/{id}/qr.png` con `X-Admin-Key`. El `200` DEBE entregar PNG del mismo `publicValidationUrl`, con `image/png`, `attachment`, filename seguro, `Content-Length`, `nosniff`, `SAMEORIGIN`, `no-store/private`. NO DEBE rotar token, mutar base, enviar email ni exponer token completo.

#### Escenario: Descarga QR autorizada

- DADO un certificado existente con token recuperable y admin autorizado
- CUANDO invoca `GET /certificados/api/admin/certificados/{id}/qr.png`
- ENTONCES DEBE responder `200` con PNG, length correcto y attachment `*-qr.png` seguro.

#### Escenario: Errores de contrato seguros

- DADO un request sin auth, método no GET, id inválido o certificado inexistente
- CUANDO se invoca la ruta de QR
- ENTONCES DEBE responder `401`, `405` con `Allow: GET`, `400` o `404`, con anti-cache y sobre seguro si es JSON.

#### Escenario: Token no recuperable

- DADO un certificado con token ausente, inválido o no descifrable
- CUANDO se solicita el QR PNG
- ENTONCES DEBE responder `409 TOKEN_NOT_RECOVERABLE`, sin regenerar ni exponer token, claves, SQL o rutas.

### Requisito: Anti-cache y filenames seguros

Las respuestas JSON sensibles y descargas PDF/QR DEBEN usar anti-cache; PDF/QR DEBEN usar filename sanitizado sin CRLF, traversal ni token.

#### Escenario: PDF y QR no cacheables

- DADO una respuesta JSON sensible o descarga administrativa de PDF/QR
- CUANDO la API responde el binario
- ENTONCES DEBE incluir `Cache-Control: no-store, private, max-age=0`, `Pragma: no-cache` y `Expires: 0`.
- Y PDF/QR DEBEN conservar headers binarios seguros.
