# Propuesta: Descarga administrativa de imagen QR

## Intención

Permitir que Bedelía descargue el QR de un certificado como PNG aislado para uso manual en diseños externos, conservando el mismo `publicValidationUrl` permanente y sin cambiar el ciclo de emisión, PDF, validación ni entrega manual.

## Alcance

### Incluido
- `GET /certificados/api/admin/certificados/{id}/qr.png` protegido por `X-Admin-Key`.
- PNG generado on-demand desde el mismo `publicValidationUrl`; sin rotación de token, persistencia, mutación de DB, email, reenvío ni auditoría nueva.
- Headers anti-cache para JSON/PDF/QR si se resuelve con helper común de bajo costo.
- `Content-Disposition` con filename seguro para PDF y QR.
- Soporte/check de `gd` en Docker PHP 8.4 si los tests de PNG lo requieren.

### Fuera de alcance
- Duplicado vigente alumno+curso, política de regeneración, reemplazo de auth, gates de deploy, regla de fechas, race transaccional, `ultimo_uso_en`, rate limiter, body limit y split de `dni_hash_key`.
- Frontend, migraciones, SMTP, recuperación/regeneración de token y material privado.

## Capacidades

### Nuevas capacidades
- Ninguna.

### Capacidades modificadas
- `backend-contrato-api-certificados`: agrega contrato HTTP admin para QR PNG, errores, headers anti-cache y filename seguro.
- `certificate-pdf-qr-generation`: documenta descarga aislada del QR como PNG usando la misma URL pública permanente.
- `admin-certificate-delivery`: amplía la entrega administrativa manual con descarga de QR sin email ni side effects.

## Enfoque

Extraer en `AdminCertificateService` la recuperación común de datos de entrega manual. Agregar `CertificateQrImageService` que reutilice `TCPDF2DBarcode::getBarcodePngData()` sin nueva dependencia Composer. Streamear el PNG desde `index.php` con headers seguros y `Content-Length` real. Mantener PNG on-demand.

## Áreas afectadas

| Área | Impacto | Descripción |
|---|---|---|
| `apps/backend-php/index.php` | Modificado | Ruta `qr.png`, streamer binario, headers y filename. |
| `apps/backend-php/src/AdminCertificateService.php` | Modificado | Helper común para `publicValidationUrl`. |
| `apps/backend-php/src/CertificateQrImageService.php` | Nuevo | Render PNG del QR. |
| `apps/backend-php/src/Response.php` | Modificado | Headers anti-cache compartidos. |
| `apps/backend-php/docker/php84/Dockerfile`, `scripts/php-docker-modules-check.sh` | Modificado | Soporte/verificación de `gd` si aplica. |
| `apps/backend-php/tests/` | Modificado | Contrato HTTP y PNG válido. |

## Riesgos

| Riesgo | Probabilidad | Mitigación |
|---|---|---|
| `gd`/Imagick ausente impide PNG | Media | Agregar `gd` en Docker y check de módulos. |
| Filtrar token en logs/tests | Baja | No loguear URL; asserts sin imprimir token completo. |
| Filename inseguro | Baja | Sanitizar con regex alfanumérica/`_-`. |

## Plan de reversión

Quitar la ruta `qr.png`, el servicio QR y los cambios de headers/filename si generan regresión; conservar certificados, PDF, tokens vigentes y entrega manual existente. Revertir deltas OpenSpec/docs del ciclo.

## Dependencias

- TCPDF existente y extensión `gd` o Imagick disponible para `getBarcodePngData()`.

## Criterios de éxito

- [ ] QR PNG admin devuelve `200 image/png` con magic bytes PNG, `Content-Length` correcto y filename seguro.
- [ ] 401/400/404/405/409 mantienen sobres seguros y `Allow: GET` cuando corresponda.
- [ ] No rota token, no muta DB, no envía email, no activa `/reenviar`.
- [ ] JSON/PDF/QR incluyen anti-cache cuando corresponda.
