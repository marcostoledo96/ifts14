# API backend — emisión desde asistencias

Resumen operativo del ciclo `backend-emision-desde-asistencias`. El contrato completo vive en `docs/backend/01-contrato-api-certificados.md`.

## Emisión administrativa

`POST /certificados/api/admin/certificados` ahora emite desde entidades reales:

```json
{
  "alumnoId": 1,
  "cursoId": 2,
  "issuedAt": "2026-07-02",
  "expiresAt": null
}
```

La respuesta administrativa conserva `publicValidationUrl`, `pdfDownloadUrl` y `tokenPrefix`. No devuelve DNI completo ni token completo como campo separado.

## Validación pública

Para certificados nuevos, el DTO público usa:

- `student.documentNumber`: DNI descifrado desde `cert_alumnos.dni_cifrado`.
- `course.attendedDates`: fechas del snapshot `cert_certificado_fechas`.

Los certificados legacy mantienen fallback con `documentMasked` y no inventan `attendedDates`.

## Configuración obligatoria

- `token_encryption_key`: recupera el token permanente para entrega manual/PDF.
- `dni_cipher_key`: descifra DNI para validación pública y PDF.

Ambas claves deben vivir fuera de Git y decodificar a 32 bytes.

## PDF institucional

El PDF de emisión incorpora `cert_configuracion_institucional` (`id = 1`) para nombre institucional, texto certificado y firmantes rector/a + asesor/a pedagógica. Si la fila falta, usa fallback seguro. No cambia endpoints, DTO administrativo, entrega manual ni token/QR permanente.

## Descarga administrativa de QR PNG

Nuevo endpoint `GET /certificados/api/admin/certificados/{id}/qr.png` protegido por `X-Admin-Key`. Devuelve el QR como PNG aislado (`image/png`, `attachment`) generado on-demand desde el mismo `publicValidationUrl` del PDF. No rota token, no persiste el PNG, no muta base, no inserta auditoría y no envía email.

- Headers: `Content-Disposition: attachment; filename="{certificateCode_sanitizado}-qr.png"`, `Content-Length` real, `X-Content-Type-Options: nosniff`, `X-Frame-Options: SAMEORIGIN`, anti-cache (`Cache-Control: no-store, private, max-age=0`, `Pragma: no-cache`, `Expires: 0`) centralizado en `Response::noStoreSecurityHeaders()`.
- Filename sanitizado con `preg_replace('/[^A-Za-z0-9_-]/', '_', $certificateCode)` (mismo regex aplicado a PDF) para impedir CRLF, traversal ni token embebido.
- Errores: `400 VALIDATION_ERROR` (id no numérico), `401 UNAUTHORIZED`, `404 CERTIFICATE_NOT_FOUND`, `405 METHOD_NOT_ALLOWED` con `Allow: GET`, `409 TOKEN_NOT_RECOVERABLE`, `500 CONFIGURATION_ERROR` (falta `gd` o equivalente).

### Dependencia runtime: extensión `gd`

El render del PNG exige la extensión PHP `gd` (o equivalente) en el hosting. La imagen Docker local (`docker/php84/Dockerfile`) instala `libpng-dev` y compila `gd`; `scripts/php-docker-modules-check.sh` declara `gd` como módulo requerido. Antes de deploy a cPanel, confirmar que `gd` está habilitado en el hosting. Si falta, la ruta responde `500 CONFIGURATION_ERROR` y queda como gate pendiente del ciclo.
