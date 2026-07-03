# Tasks: Descarga administrativa de imagen QR

## Review Workload Forecast

Líneas estimadas: 250–350. Budget 400: bajo. Chained PRs: no. Split: PR único.

Decision needed before apply: No
Chained PRs recommended: No
Chain strategy: single-pr
400-line budget risk: Low

## Fase 1 — Headers compartidos

- [x] 1.1 Agregar `Response::noStoreSecurityHeaders()` en `Response.php` con `Cache-Control: no-store, private, max-age=0`, `Pragma: no-cache`, `Expires: 0`.
- [x] 1.2 Invocar `noStoreSecurityHeaders()` desde `Response::json()` y `Response::error()` (cierra HIGH-01).

## Fase 2 — Refactor de dominio

- [x] 2.1 Extraer `loadManualDeliveryData(int): array` (privado) en `AdminCertificateService` con `{certificateId, certificateCode, publicValidationUrl, tokenPrefix}`. Centraliza JOIN + `recoverToken()` + checks de estado. `entregaManual()` queda como adapter que suma `pdfDownloadUrl`.
- [x] 2.2 Exponer `deliveryTokenData(int): array` (público) reusando el helper; mismo shape, sin `pdfDownloadUrl` ni `ensurePdfExists`.
- [x] 2.3 Crear `CertificateQrImageService.php` con `render(string $publicValidationUrl): string`. Lazy load de `tcpdf_barcodes_2d.php`; usa `TCPDF2DBarcode($url, 'QRCODE,M')->getBarcodePngData(8, 8, [0,0,0])`. Lanza `\RuntimeException` si devuelve `false` o string vacío. No loguea URL ni persiste bytes.

## Fase 3 — Wiring HTTP

- [x] 3.1 Agregar ruta `GET /admin/certificados/(\d+)/qr.png` en `index.php` antes del 404 final. Gate 405 + `Allow: GET`, `filter_var` int>=1 (400), `adminConfig()` (401), `loadPdfDependencies()` + `Config::requirePdfConfig()` (500), `loadTokenCipherKey()` (500). `try/catch` final → 500 `CONFIGURATION_ERROR`.
- [x] 3.2 Implementar `streamQrPng(array $config, int $certificateId, string $requestId)` en `index.php`: invoca `deliveryTokenData($id)`, sanitiza filename con `preg_replace('/[^A-Za-z0-9_-]/', '_', $code) . '-qr.png'`, llama `render($publicValidationUrl)`, emite `image/png` + `Content-Length` + `Content-Disposition` + `X-Content-Type-Options: nosniff` + `X-Frame-Options: SAMEORIGIN` + anti-cache. 404/409 del servicio → `Response::error()`.
- [x] 3.3 Sanitizar filename en `streamPdf()` con la misma regex. Cierra LOW-01 para PDF.

## Fase 4 — Runtime GD

- [x] 4.1 Editar `docker/php84/Dockerfile`: agregar `libpng-dev` a `apt-get install` y `gd` a `docker-php-ext-install`; sumar `libjpeg-dev` y `libfreetype6-dev` si TCPDF lo requiere en PHP 8.4.
- [x] 4.2 Editar `scripts/php-docker-modules-check.sh`: sumar `gd` al array `required=(...)`.
- [x] 4.3 Documentar en `apps/backend-php/AGENTS.md` que `qr.png` requiere `gd` y que `php-docker-build.sh` + `php-docker-modules-check.sh` lo verifican.

## Fase 5 — Tests

- [x] 5.1 Extender `HttpContractTest.php` con casos pre-DB para `/qr.png`: 401 sin `X-Admin-Key`, 405 método no GET + `Allow: GET`, 400 id no numérico; cada caso con `assertError` + `assertSecurityHeaders` + nuevo `assertAntiCacheHeaders` que valide `Cache-Control`, `Pragma`, `Expires`.
- [x] 5.2 Crear `QrImageTest.php` reusando `FakePdoForManual` + `buildManualService`: 200 con magic bytes `\x89PNG\r\n\x1a\n` y `strlen($png) > 0`, filename sanitizado con `;`/`\n` → `_`, 409 `TOKEN_NOT_RECOVERABLE` (clave inválida/envelope ausente), 404 `CERTIFICATE_NOT_FOUND` (id inexistente, certificado revocado). Assert `is_file($path) === false` tras la operación.
- [x] 5.3 En `QrImageTest.php`, asserts de no-side-effect: `count($pdo->audits) === 0` y snapshot del array `tokens` antes/después confirma no rotación, no mutación, no inserción. Cubre el escenario "no rota token, no muta DB, no envía email, no activa `/reenviar`".
- [x] 5.4 Test unitario de `CertificateQrImageService`: si `gd` está disponible (`function_exists('imagecreate')`), assert magic bytes PNG; si no, `markTestSkipped` controlado. Cubrir el caso `getBarcodePngData() === false` con `RuntimeException` end-to-end.

## Reglas del ciclo

- Sin composer, migraciones, esquema; sin tocar entrega manual/PDF/revocación/reenvío/email/auth.
- Sincronizar `docs/backend/01-contrato-api-certificados.md`, `docs/backend/API.md` y `openspec/specs/*/spec.md` durante `sdd-archive`.
- Rebuild Docker local + `php-docker-modules-check.sh` antes de `sdd-verify`.

## Correctivo post apply-gate

- [x] C1 Agregar smoke HTTP DB-backed para `GET /admin/certificados/{id}/qr.png` después de emisión real en `HttpEmissionE2eTest.php`: verifica `200`, `image/png`, `attachment`, `Cache-Control: no-store, private, max-age=0`, `Content-Length` correcto, magic bytes PNG y snapshot de token sin mutación.
