# Diseño: Descarga administrativa de imagen QR

## Enfoque técnico

Implementar el endpoint `GET /certificados/api/admin/certificados/{id}/qr.png` como descarga binaria on-demand, protegida por `X-Admin-Key`, reutilizando la recuperación actual del token cifrado y la URL pública permanente. El cambio no agrega Composer, no persiste PNG, no rota token, no muta base y no reemplaza entrega manual ni PDF.

## Decisiones de arquitectura

| Decisión | Alternativas | Rationale |
|---|---|---|
| Extraer datos comunes de entrega en `AdminCertificateService` | Duplicar JOIN/descifrado en `index.php` | Una sola fuente de verdad para `publicValidationUrl`, estado vigente y `TOKEN_NOT_RECOVERABLE`; menor superficie para filtrar tokens. |
| Crear `CertificateQrImageService` mínimo | Agregar método a `CertificatePdfService` o nueva dependencia QR | TCPDF ya está instalado y expone `TCPDF2DBarcode::getBarcodePngData($w,$h,$color)`; evita mezclar storage PDF con PNG en memoria. |
| PNG on-demand | Guardar PNG al emitir | No requiere migración, invalidación ni limpieza; el uso admin esperado es bajo. |
| Anti-cache centralizado en `Response` | Headers repetidos por ruta | Cubre JSON, errores, PDF y QR con una edición simple y consistente. |

## Flujo de datos

```txt
GET /admin/certificados/{id}/qr.png
  -> adminConfig() + X-Admin-Key
  -> requirePdfConfig() + loadTokenCipherKey()
  -> AdminCertificateService::datosEntregaManual($id)
       -> cert_certificados + token activo
       -> TokenCipher::decrypt(token_cifrado)
       -> publicBaseUrl + /validar/{token}
  -> CertificateQrImageService::render(publicValidationUrl)
       -> TCPDF2DBarcode(..., 'QRCODE,M')->getBarcodePngData(8, 8, [0,0,0])
  -> stream PNG con headers seguros
```

## Cambios de archivos

| Archivo | Acción | Descripción |
|---|---|---|
| `apps/backend-php/index.php` | Modificar | Agregar ruta `qr.png`, `streamQrPng()`, lazy load de `tcpdf_barcodes_2d.php`, mapeo seguro de errores. |
| `apps/backend-php/src/AdminCertificateService.php` | Modificar | Extraer helper público/interno para `{certificateId, certificateCode, publicValidationUrl, tokenPrefix}`; `entregaManual()` suma `pdfDownloadUrl`. |
| `apps/backend-php/src/CertificateQrImageService.php` | Crear | Renderiza PNG en memoria con `TCPDF2DBarcode::getBarcodePngData()`, falla cerrado si devuelve `false`, `Imagick` o string vacío. |
| `apps/backend-php/src/Response.php` | Modificar | `securityHeaders()` suma `Cache-Control: no-store, private, max-age=0`, `Pragma: no-cache`, `Expires: 0`. |
| `docker/php84/Dockerfile` | Modificar | Instalar soporte `gd` (`libpng-dev`, `libjpeg-dev` si lo requiere la imagen, `docker-php-ext-install gd`). |
| `scripts/php-docker-modules-check.sh` | Modificar | Sumar `gd` a módulos requeridos. |
| `apps/backend-php/tests/HttpContractTest.php` | Modificar | Cubrir 401, 405+`Allow`, 400, 404 `/reenviar` y anti-cache. |
| `apps/backend-php/tests/EntregaManualTest.php` o `QrImageTest.php` | Modificar/Crear | Cubrir PNG válido por magic bytes, `Content-Length`, 404/409 y ausencia de escrituras. |

## Interfaces / contratos

```php
final class CertificateQrImageService
{
    public function render(string $publicValidationUrl): string;
}
```

`AdminCertificateService` debe exponer un método reutilizable, por ejemplo `deliveryTokenData(int|string $id): array`, con `certificateCode` incluido. El filename binario se arma con `preg_replace('/[^A-Za-z0-9_-]/', '_', $certificateCode) . '-qr.png'`; PDF debe aplicar la misma sanitización para `Content-Disposition`.

Headers `200` QR: `Content-Type: image/png`, `Content-Disposition: attachment; filename="<safe>-qr.png"`, `Content-Length`, `X-Content-Type-Options`, `X-Frame-Options`, anti-cache.

## Estrategia de pruebas

| Capa | Qué probar | Enfoque |
|---|---|---|
| Unit | Render QR, token no recuperable, filename seguro | Fake PDO actual + assert de magic bytes `\x89PNG\r\n\x1a\n`; mensajes sin token completo. |
| HTTP | Auth, método, id inválido, headers, `/reenviar` removido | Extender servidor embebido en `HttpContractTest`. |
| Runtime | Soporte PNG | `scripts/php-docker-modules-check.sh` exige `gd`; test falla cerrado si TCPDF no genera PNG. |

## Migración / rollout

No requiere migración. Requiere rebuild de imagen Docker local y verificación operativa de `gd` o equivalente en cPanel antes del deploy.

## Preguntas abiertas

- [ ] Confirmar en hosting/cPanel que `gd` está habilitado; si no, la ruta debe quedar bloqueada por `CONFIGURATION_ERROR` hasta resolver runtime.
