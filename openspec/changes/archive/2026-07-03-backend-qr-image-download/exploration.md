## Exploration: `backend-qr-image-download` — descarga admin de imagen QR en PNG

### Current State

El backend PHP bajo `/certificados/api/` ya tiene toda la cadena necesaria para reconstruir la URL pública permanente del certificado sin rotar el token:

- `AdminCertificateService::entregaManual(int|string $id): array` (en `apps/backend-php/src/AdminCertificateService.php:256`) es de **solo lectura**: valida el certificado vigente, descifra `token_cifrado` con `TokenCipher::decrypt()` + `token_encryption_key`, verifica el PDF persistido y devuelve `{certificadoId, publicValidationUrl, pdfDownloadUrl, tokenPrefix}`. La URL pública se arma con `buildPublicValidationUrl(string $token)`, que concatena `rtrim($this->publicBaseUrl, '/') . '/validar/' . $token`. El token completo **nunca** se devuelve como campo separado; solo vive dentro de `publicValidationUrl` (verificado por `EntregaManualTest.php:268-272`: `substr_count($dtoJson, $demoToken) !== 1`).
- `CertificatePdfService::generate(...)` (en `apps/backend-php/src/CertificatePdfService.php:74`) ya embebe el QR en el PDF institucional con `$tcpdf->write2DBarcode($validationUrl, 'QRCODE', ...)`. La misma URL pública se reutiliza en el PDF y es la canónica del ciclo de vida del certificado.
- `TokenCipher` (en `apps/backend-php/src/TokenCipher.php`) descifra envelope `v1.<iv_b64url>.<tag_b64url>.<ciphertext_b64url>` con AES-256-GCM y fail-closed ante cualquier rotura (clave != 32 bytes, IV != 12 bytes, tag != 16 bytes, partes != 4, versión != `v1`, descifrado OpenSSL fallido). No loguea token, clave, IV, tag ni ciphertext.
- `streamPdf(...)` (en `apps/backend-php/index.php:594`) ya implementa el patrón de descarga binaria que se va a reutilizar: select por `id`, validación de existencia/legibilidad/tamaño del archivo, headers `X-Content-Type-Options: nosniff`, `X-Frame-Options: SAMEORIGIN`, `Content-Type`, `Content-Disposition: attachment; filename="..."` y `Content-Length`. **Pero omite los headers anti-cache** (`Cache-Control`, `Pragma`, `Expires`).
- `Response::json()` y `Response::error()` (en `apps/backend-php/src/Response.php:8,22`) emiten el sobre JSON con los dos headers de seguridad pero tampoco agregan anti-cache.
- TCPDF `6.11.3` (composer) ya trae `tcpdf_barcodes_2d.php` con la clase `TCPDF2DBarcode` que expone `getBarcodePngData($w=3, $h=3, $color=array(0,0,0))` (línea 193), que **requiere GD** (`function_exists('imagecreate')`) o Imagick. La instancia `write2DBarcode` ya usada en el PDF consume esa misma estructura interna, así que no se introduce una dependencia nueva.
- El `Dockerfile` de `docker/php84/Dockerfile` instala `curl`, `mbstring`, `pdo_mysql`, `xml` y `zip`, pero **no** instala `gd` ni `imagick`. `scripts/php-docker-modules-check.sh` valida `pdo_mysql openssl mbstring curl zip xml` y **no** chequea `gd`/`imagick`. Esto es un gap operativo conocido: el binario `docker run ifts14-php84` actual no puede generar PNG de QR sin un cambio en el Dockerfile.
- `composer.json` solo requiere `php >=8.4` y `tecnickcom/tcpdf ^6.8`; no se necesita agregar `chillerlan/php-qrcode` ni otra dependencia.

El router de `apps/backend-php/index.php` ya normaliza `/certificados/api`, `/certificados_staging/api` y `/index.php` en una sola ruta, así que el endpoint nuevo se publica bajo el mismo prefijo que el resto.

### Affected Areas

- `apps/backend-php/index.php` — agregar la rama del router para `GET /admin/certificados/(\d+)/qr.png` antes del 404 final. Reusar el mismo patrón que la rama de `/admin/certificados/(\d+)/entrega-manual` (línea 415): `filter_var` con `min_range:1`, `adminConfig()`, `Config::requirePdfConfig()`, `loadTokenCipherKey()`. Cargar perezosamente `tcpdf_barcodes_2d.php` (mismo lazy load que `loadPdfDependencies()` ya hace para TCPDF y `CertificatePdfService`). Devolver 405 con `Allow: GET` si el método no es GET.
- `apps/backend-php/src/AdminCertificateService.php` — extraer un helper privado `loadManualDeliveryData(int $certificateId): array` que devuelva `{certificateId, certificateCode, publicValidationUrl, tokenPrefix}`. `entregaManual()` queda como wrapper de una línea que agrega `pdfDownloadUrl`; la nueva ruta `qr.png` consume el mismo helper sin reescribir el JOIN ni el descifrado. No abrir transacción; no insertar auditoría; el endpoint es de solo lectura como `entregaManual()`.
- `apps/backend-php/src/CertificateQrImageService.php` (nuevo) — única responsabilidad: recibir `publicValidationUrl`, instanciar `TCPDF2DBarcode($url, 'QRCODE,M')`, llamar `getBarcodePngData(8, 8, [0,0,0])` y devolver `string|false`. Falla cerrado con `RuntimeException` si `getBarcodePngData()` devuelve `false` (extensión GD/Imagick ausente) o string vacío; el llamador mapea a `500 CONFIGURATION_ERROR`. No loguea la URL (contiene el token). No persiste el PNG en disco; el archivo se genera on-demand en cada request.
- `apps/backend-php/src/Response.php` — agregar helper estático `Response::noStoreSecurityHeaders()` o una variante de `securityHeaders()` que sume `Cache-Control: no-store, private, max-age=0`, `Pragma: no-cache`, `Expires: 0`. Mantener los dos headers actuales. El cambio aplica a JSON, PDF y PNG por una sola vía. Headers de seguridad de la rama de `qr.png` se setean inline después de los anti-cache (mismo patrón que `streamPdf`).
- `apps/backend-php/docker/php84/Dockerfile` — agregar `libgd-dev` (o el paquete que provea GD para PHP 8.4) y `docker-php-ext-install gd`. Sin esto, `imagecreate()` no existe y `getBarcodePngData()` devuelve `false`. `php-docker-modules-check.sh` debe sumar `gd` a la lista de módulos requeridos.
- `apps/backend-php/tests/HttpContractTest.php` — extender con escenarios pre-DB para `qr.png`: 401 sin `X-Admin-Key`, 405 con método distinto + `Allow: GET`, 400 con id no numérico, 404 con `reenviar` que sigue respondiendo 404. Reusar `assertError`, `assertStatus` y `assertSecurityHeaders` ya existentes; agregar `assertAntiCacheHeaders` para `Cache-Control: no-store, private, max-age=0`, `Pragma: no-cache`, `Expires: 0`.
- `apps/backend-php/tests/EntregaManualTest.php` o un nuevo `QrImageTest.php` — agregar test de servicio que use `FakePdoForManual` ya existente, cifre un token con `TokenCipher::encrypt()`, llame al helper extraído y verifique que el PNG comienza con la magic bytes `\x89PNG\r\n\x1a\n`, que no está vacío y que contiene la URL canónica. Cubrir 409 `TOKEN_NOT_RECOVERABLE` y 404 `CERTIFICATE_NOT_FOUND` para la ruta `qr.png`.
- `docs/backend/01-contrato-api-certificados.md` — agregar fila en la tabla de endpoints y nueva sección "`GET /admin/certificados/{id}/qr.png`" con la regla de no mutar DB, no rotar token, no loguear URL, headers anti-cache y la forma del `Content-Disposition`.
- `docs/backend/API.md` — nota breve de que la descarga QR conserva el token permanente.
- `openspec/specs/backend-contrato-api-certificados/spec.md` — agregar requirement de "Descarga admin de imagen QR" con escenarios Given/When/Then para: 200 con PNG válido, 401 sin auth, 405 método incorrecto, 400 id no numérico, 409 token no recuperable, 404 certificado no encontrado/vigente, no DB mutation, no token rotation, anti-cache headers, filename sanitizado.
- `openspec/specs/certificate-pdf-qr-generation/spec.md` — agregar requirement que indique que la imagen QR se puede descargar aisladamente como PNG binario admin, con la misma URL pública.
- `apps/backend-php/AGENTS.md` y `docs/AGENTS.md` — no requieren cambios; el patrón es consistente con el resto.

No se tocan `apps/backend-php/src/AuthGate.php`, `apps/backend-php/src/Config.php`, `apps/backend-php/src/AdminMasterDataService.php`, ni la base de datos: el endpoint es read-only, sin contrato nuevo, sin migraciones, sin Composer lock.

### Approaches

1. **Servicio nuevo `CertificateQrImageService` + helper extraído en `AdminCertificateService`** *(recomendada, MVP mínimo)*
   - Pros: una sola fuente de verdad para recuperación de `publicValidationUrl`; tests existentes de `EntregaManualTest` siguen pasando sin tocarlos (se conserva `entregaManual()` con misma firma); el servicio nuevo es unit-testeable con un FakePdoForManual parecido; respeta SRP (PDF = render binario, QR image = bytes PNG, entrega manual = DTO JSON).
   - Cons: dos servicios nuevos en `src/` solo para este cambio; requiere reusar `tcpdf_barcodes_2d.php` que ya está disponible vía `loadPdfDependencies()`.
   - Effort: **Low** (200–280 líneas: servicio nuevo + helper + ruta + tests + docs).

2. **Renderizar QR dentro de `CertificatePdfService` agregando un método `renderQrPng(string $url): string`**
   - Pros: cero archivos nuevos en `src/`; reutiliza el autoload existente de `CertificatePdfService`.
   - Cons: `CertificatePdfService` está acoplado a TCPDF y a la persistencia del PDF (`generate()` muta el storage); agregarle un método de bytes rompe SRP; el constructor exige `storagePath` escribible y `@mkdir` con permisos 0700, que es ruido inútil para generar bytes en memoria.
   - Effort: Low–Medium (similar al Approach 1) pero con peor calidad de diseño.

3. **Renderizar QR embebido en el PDF existente y devolverlo como respuesta** *(descartada por el audit)*
   - Pros: cero código nuevo; el QR ya está en el PDF.
   - Cons: el PDF contiene el QR pero también DNI completo, fechas snapshot, cuerpo del certificado, etc. El requerimiento explícito del audit es una **imagen aislada** que Bedelía pueda pegar en Canva sin abrir un PDF.
   - Effort: n/a — no resuelve el problema.

4. **Usar `chillerlan/php-qrcode` como dependencia Composer** *(descartada por ponytail: ya hay una dependencia que cubre el caso)*
   - Pros: API más limpia, sin acoplamiento a TCPDF.
   - Cons: agrega una dependencia Composer que duplica lo que `tecnickcom/tcpdf` ya provee vía `tcpdf_barcodes_2d.php`. Edita `composer.json` y `composer.lock` cuando el audit recomienda evitarlo (HIGH-05). El budget de revisión se infla.
   - Effort: Low pero con deuda innecesaria.

### Recommendation

**Approach 1**: una sola fuente de verdad en `AdminCertificateService::loadManualDeliveryData(int $certificateId): array` que reutiliza el JOIN actual de `entregaManual()` y el descifrado via `recoverToken()`. `entregaManual()` queda como adapter de una línea que suma `pdfDownloadUrl`. La nueva ruta `GET /admin/certificados/{id}/qr.png` consume el mismo helper, instancia `CertificateQrImageService` con la URL pública, llama a `render()` y streamea el PNG con headers `Cache-Control: no-store, private, max-age=0`, `Pragma: no-cache`, `Expires: 0`, `X-Content-Type-Options: nosniff`, `X-Frame-Options: SAMEORIGIN`, `Content-Type: image/png`, `Content-Disposition: attachment; filename="<certificateCode>-qr.png"` (filename sanitizado con `preg_replace('/[^A-Za-z0-9_-]/', '_', $code)` para cerrar LOW-01 del audit) y `Content-Length: <bytes>`.

El cambio en `Response::securityHeaders()` cubre **HIGH-01** del audit (anti-cache en JSON/PDF/QR) sin costo extra: una sola edición, mismo helper para las tres rutas. El filename sanitizado cierra **LOW-01** con un `preg_replace` idéntico al que ya usa `CertificatePdfService::pathForCode()` y `AdminCertificateService::pathForCertificateCode()` (línea 364 de `AdminCertificateService.php`).

Se difieren a ciclos futuros: deduplicación de `dni_hash_key` (MEDIUM-06), `ultimo_uso_en` (MEDIUM-03), rate limiter fail-closed (MEDIUM-04), body size limit (MEDIUM-05), transacción para snapshot (MEDIUM-02), fechas `programada` vs `realizada` (MEDIUM-01), regeneración PDF (HIGH-03), duplicado vigente (HIGH-02), auth real (HIGH-04) y gates MariaDB/Composer (HIGH-05). Esto coincide literalmente con el "Explicitly defer to later cycles" del prompt.

### Risks

- **GD/Imagick ausente en `docker/php84/Dockerfile`**: `TCPDF2DBarcode::getBarcodePngData()` requiere `imagecreate()` o `extension_loaded('imagick')`. Sin esto, devuelve `false` y la ruta cae a 500 `CONFIGURATION_ERROR`. Mitigación: agregar `libgd-dev` + `docker-php-ext-install gd` al Dockerfile en el mismo ciclo, y sumar `gd` a la lista de módulos requeridos en `php-docker-modules-check.sh`. Sin esa edición, el endpoint existe pero siempre falla en entorno Docker local; en cPanel el operador debe validar que `gd` esté habilitado.
- **No persistir el PNG en disco evita invalidación pero regenera en cada request**: aceptable porque el QR se computa en pocos ms y la frecuencia esperada de descarga admin es baja. Si el audit futuro exige cache, se puede agregar un ETAG o `If-Modified-Since` después, no ahora.
- **URL pública en memoria con token dentro**: el PNG bytes contiene la URL del QR que incluye el token. `streamPdf()` actual no loguea el cuerpo, pero hay que ser explícitos en los tests para no imprimir la URL en errores ni en aserciones que caigan en logs de CI.
- **El filename del `Content-Disposition` debe sanitizarse**: el audit ya marcó LOW-01 en `streamPdf` y se cierra en este mismo ciclo con la misma regex `preg_replace('/[^A-Za-z0-9_-]/', '_', $code)`. No aplicar la sanitización deja el header abierto a CRLF injection si alguien inserta un código raro en DB.
- **Composer no debe tocarse**: el audit marca HIGH-05 y el Approach 1 no requiere `composer.json` ni `composer.lock`. Mantener esa promesa es crítico para que el ciclo no active el gate de Composer/vendor.
- **`token_cifrado` legacy sin envelope válido**: el endpoint debe responder `409 TOKEN_NOT_RECOVERABLE` (mismo código que entrega manual) sin regenerar token. El helper extraído ya implementa el fail-closed; basta con propagar la excepción.
- **El `Content-Length` debe ser el `strlen()` real**: si se calcula mal y los bytes del QR no cierran, el navegador reporta download corrupto. Mitigación: assert en test que el header coincide con `strlen($pngBytes)`.
- **Anti-cache `Cache-Control: no-store, private, max-age=0` debe ir antes de `Content-Type`**: el orden de headers PHP no es semántico, pero la convención del proyecto es anti-cache primero, después tipo, después disposition, después length. Si se invierte, no rompe pero confunde la lectura.
- **Tests con runtime DB**: `QrImageTest` puede correr con `FakePdoForManual` ya existente y el `CertificateQrImageService` en memoria; no necesita MariaDB real. Cubrir el `200 image/png` con magic bytes `\x89PNG` y la presencia de la URL pública basta para MVP.

### Ready for Proposal

**Sí**. El scope es chico y aislado:

1. Refactor mínimo: extraer `loadManualDeliveryData(int): array` en `AdminCertificateService`; `entregaManual()` pasa a ser un adapter.
2. Crear `CertificateQrImageService` que use `TCPDF2DBarcode::getBarcodePngData(8, 8, [0,0,0])`.
3. Extender `Response::securityHeaders()` con anti-cache (cubre JSON, PDF, QR).
4. Agregar `GD` al Dockerfile PHP 8.4 y al check de módulos.
5. Agregar la rama del router `GET /admin/certificados/(\d+)/qr.png` en `index.php` con 401/405/400/404/409 consistentes.
6. Sanitizar filename del `Content-Disposition` con la regex existente (cierra LOW-01).
7. Tests: `HttpContractTest` extendido con pre-DB 401/405/400 + assert anti-cache; `QrImageTest` o `EntregaManualTest` extendido con 200 PNG magic bytes + 409 token no recuperable + 404 certificado no encontrado.
8. Sincronizar `docs/backend/01-contrato-api-certificados.md`, `docs/backend/API.md`, `openspec/specs/backend-contrato-api-certificados/spec.md`, `openspec/specs/certificate-pdf-qr-generation/spec.md` durante `sdd-archive`.

Decisiones que el orquestador debería confirmar antes de `sdd-apply`:

- ¿Aceptar la edición del `Dockerfile` para sumar `gd`? Sin esto, el endpoint falla 500 en Docker local. Si la respuesta es no, el endpoint queda documentado como "requiere gd en hosting de producción" y el deploy checklist se actualiza en su lugar.
- ¿Mantener el PNG on-demand (recomendado) o precomputar al emitir? El audit recomienda on-demand; el Approach 1 respeta esa decisión.
- ¿Auditar cada descarga de QR? El audit lo marca como decisión opcional no bloqueante; recomendación: no auditar en MVP para mantener read-only y sin side effects. Si se decide auditar, agregar a un requirement nuevo en el spec y un task en el plan.
