# Tareas: M4-01 generación PDF/QR de certificados

## Pronóstico de carga de revisión

- Líneas estimadas modificadas: ~420 (rango 380-460)
- Riesgo presupuesto 400 líneas: Bajo
- PRs encadenados recomendados: No
- División sugerida: PR único (`backend/pdf-qr-certificados` → `main`)
- Estrategia de entrega: `single-pr-default`
- Estrategia de cadena: pendiente

Decision needed before apply: No
Chained PRs recommended: No
Chain strategy: pending
400-line budget risk: Low

### Unidades de trabajo sugeridas

| Unidad | Objetivo | PR | Notas |
|--------|----------|----|-------|
| 1 | Cimiento + emisión PDF + descarga + tests + docs | PR único | Base `backend/pdf-qr-certificados`; verificación por scripts PHP existentes. |

## Fase 1: Cimiento (Composer + Config)

- [x] 1.1 Crear `apps/backend-php/composer.json` declarando `tecnickcom/tcpdf` como única dependencia de producción, sin scripts ni autoload extra.
- [x] 1.2 Ejecutar `composer install --no-dev` en `apps/backend-php/` para generar `vendor/`; el `.gitignore` raíz ya excluye `vendor/` y `composer.lock`.
- [x] 1.3 Extender `Config::load()` para exigir `public_base_url` y `certificate_storage_path` como strings no vacíos; lanzar `RuntimeException('Configuration invalid.')` si faltan.
- [x] 1.4 Agregar placeholders ficticios a `config/certificados-config.example.php` (`public_base_url` y `certificate_storage_path`); sin valores reales ni secretos.

## Fase 2: Servicio PDF + integración transaccional

- [x] 2.1 Crear `src/CertificatePdfService.php` con `generate(string $code, array $viewData, string $validationUrl): string` y `pathForCode(string $code): string`; TCPDF `AddPage('L')` + `write2DBarcode` para QR, escribir a archivo temporal y `rename()` al destino final.
- [x] 2.2 Inyectar `CertificatePdfService` + `publicBaseUrl` en el constructor de `AdminCertificateService`; generar PDF dentro de la transacción antes del `commit`, rollback + `unlink()` del temporal en caso de fallo.
- [x] 2.3 Agregar `pdfDownloadUrl` al DTO de emisión con `publicBaseUrl` + endpoint admin; nunca incluir el token completo en URL ni en cuerpo.

## Fase 3: HTTP / cableado de descarga

- [x] 3.1 Cargar `apps/backend-php/vendor/autoload.php` en `index.php` antes de los `require_once` de `src/`.
- [x] 3.2 Registrar ruta `GET /admin/certificados/{id}/pdf` con `requireAdmin` + `X-Admin-Key`; método estricto `GET`.
- [x] 3.3 Implementar helper `streamPdf(string $absolutePath, string $filename)` con `Content-Type: application/pdf`, `Content-Disposition: attachment` y `Content-Length`; resolver `404 PDF_NOT_FOUND` cuando el archivo no exista.
- [x] 3.4 Manejar `405 METHOD_NOT_ALLOWED` con `Allow: GET` y `400 VALIDATION_ERROR` para id no numérico en la misma ruta.

## Fase 4: Pruebas

- [x] 4.1 Extender `tests/AdminCertificateServiceTest.php` con chequeos por `Reflection` del armado de `pdfDownloadUrl` y stub de fallo del servicio PDF para validar rollback.
- [x] 4.2 Extender `tests/HttpContractTest.php` con contrato pre-DB del endpoint PDF: `401` sin `X-Admin-Key`, `405` método no permitido, `400` id no numérico. Los casos `200` y `404 PDF_NOT_FOUND` requieren MariaDB real y quedan como verificación de integración diferida para `sdd-verify`.

## Fase 5: Documentación y verificación

- [x] 5.1 Actualizar `docs/backend/01-contrato-api-certificados.md`: agregar `pdfDownloadUrl` al DTO de emisión y documentar `GET /admin/certificados/{id}/pdf` con códigos `200`/`401`/`404 PDF_NOT_FOUND`.
- [x] 5.2 Actualizar `docs/deploy/00-cpanel-certificados.md`: documentar `certificate_storage_path` fuera del webroot, alternativa `.htaccess` dentro de `public_html` y rollback de PDFs de prueba.
- [x] 5.3 Correr `php -l` sobre `index.php`, `src/CertificatePdfService.php`, `src/AdminCertificateService.php`, `src/Config.php` y `config/certificados-config.example.php`.
- [x] 5.4 Ejecutar `php apps/backend-php/tests/AdminCertificateServiceTest.php` y `php apps/backend-php/tests/HttpContractTest.php`; registrar resultados reales en el reporte de verify.
