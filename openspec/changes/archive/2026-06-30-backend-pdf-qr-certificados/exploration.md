## Exploration: M4-01 generación PDF/QR de certificados

### Current State

- El backend PHP 8.4.21 en `apps/backend-php/` ya tiene emisión (`POST /admin/certificados`), revocación y validación pública funcionando.
- `AdminCertificateService::emitir()` genera el token completo en memoria, pero solo persiste `SHA-256(token + token_pepper)` en `cert_tokens_verificacion.token_hash` y devuelve `tokenPrefix`. **El token completo no se guarda en texto plano**, por lo que no se puede regenerar el QR después de la emisión.
- El endpoint público `/certificados/{token}/verificacion` ya resuelve validaciones usando `token_pepper` externo a Git.
- Angular tiene la ruta `/certificados/validar/:tokenCertificacion` lista para consumir el QR/link (ciclo `frontend-angular-shell-public-validation-api-readiness` / M3-06).
- No existe `composer.json` ni dependencias PHP versionadas; falta confirmar disponibilidad de Composer y extensiones en cPanel.
- El deploy objetivo es `public_html/certificados/`, con la API bajo `/certificados/api/`.

### Affected Areas

- `apps/backend-php/src/AdminCertificateService.php` — generar el PDF durante `emitir()` y guardar el archivo.
- `apps/backend-php/index.php` — agregar `GET /admin/certificados/{id}/pdf` protegido por `X-Admin-Key`.
- `apps/backend-php/src/Config.php` — leer `public_base_url` y `certificate_storage_path` desde configuración externa.
- `apps/backend-php/config/certificados-config.example.php` — documentar las nuevas claves con valores ficticios.
- `docs/backend/01-contrato-api-certificados.md` — documentar endpoint de descarga PDF y DTO de emisión ampliado.
- `docs/deploy/00-cpanel-certificados.md` — ruta de almacenamiento fuera del webroot y reglas `.htaccess` si aplica.

### Approaches

1. **TCPDF vía Composer (recomendado condicional)**
   - Usar `tecnickcom/tcpdf`, que soporta PDF horizontal (`AddPage('L')`), UTF-8 y códigos QR 2D nativos (`write2DBarcode`).
   - El PDF se genera dentro de `emitir()` y se guarda en el filesystem; el nuevo endpoint admin lo sirve con `Content-Type: application/pdf`.
   - Pros: una sola dependencia, QR sin GD, fuentes Unicode incluidas, control total del layout.
   - Cons: requiere Composer en cPanel y subir `vendor/`; API procedural antigua; aumenta el tamaño del paquete de deploy.
   - Effort: Medium.

2. **Dompdf + BaconQrCode vía Composer**
   - `dompdf/dompdf` convierte HTML/CSS a PDF y `bacon/bacon-qr-code` genera el QR como imagen o SVG.
   - Pros: layout declarativo con HTML, más fácil de adaptar al diseño institucional.
   - Cons: dos dependencias; UTF-8 y fuentes requieren configuración; QR requiere renderizar imagen y embeberla.
   - Effort: Medium.

3. **Librerías livianas sin Composer (fallback manual)**
   - Incluir `tFPDF`/`FPDF` + `phpqrcode` como archivos bajo `apps/backend-php/lib/`.
   - Generar el QR como PNG con GD y embeberlo en el PDF.
   - Pros: no depende de Composer; deploy manual simple en cPanel.
   - Cons: más código de pegamento; UTF-8 requiere fuentes TrueType adicionales; `phpqrcode` depende de GD y está menos mantenida.
   - Effort: Medium-High.

4. **Generar PDF/QR en el cliente (descartado)**
   - El backend devolvería el token completo al admin y Angular generaría el PDF.
   - Pros: descarga el servidor.
   - Cons: rompe el contrato actual de no exponer el token completo, acopla a Matías y sale del alcance backend de Marcos.
   - Effort: Medium.

5. **PDF bajo demanda con token cifrado (descartado)**
   - Guardar el token cifrado en la base para regenerar el PDF cuando se pida.
   - Pros: no persistir archivos PDF.
   - Cons: añade criptografía, gestión de claves y complejidad innecesaria; el token ya no es "no almacenado".
   - Effort: High.

### Recommendation

- Adoptar la **opción 1 (TCPDF)** si Composer está disponible en cPanel; si el diseño del certificado va a iterar fuertemente en HTML/CSS, considerar la **opción 2 (Dompdf + BaconQrCode)**.
- Si Composer no está disponible, caer en la **opción 3 (librerías livianas manuales)**.
- En todos los casos:
  - Generar el PDF **sincrónicamente durante `emitir()`**, dentro de la transacción, y persistirlo en `certificate_storage_path`. Si la generación del PDF falla, debe fallar la emisión completa para no dejar un certificado emitido sin documento entregable.
  - Nombrar el archivo con el `certificateCode` (ej. `CERT-2026-XXXX.pdf`), nunca con el token.
  - El QR debe apuntar a la URL absoluta `{public_base_url}/validar/{token}`, donde `public_base_url` se lee de la config externa (por ejemplo `https://ifts14.com.ar/certificados`).
  - Extender la respuesta de `POST /admin/certificados` con `pdfDownloadUrl` (por ejemplo `/certificados/api/admin/certificados/{id}/pdf`), pero **sin devolver el token completo**.
  - Servir el PDF mediante `GET /admin/certificados/{id}/pdf` con `X-Admin-Key`, retornando `Content-Type: application/pdf` y `Content-Disposition: attachment; filename="CERT-XXXX.pdf"`.
  - Almacenar PDFs fuera del webroot o en carpeta protegida con `.htaccess`; nunca dejarlos accesibles directamente.

### Risks

- **Composer no disponible en cPanel**: obliga al fallback con librerías manuales y fuentes Unicode.
- **Token no persistente**: cualquier error de PDF tras el `INSERT` requiere rollback; no se puede "reimprimir" sin regenerar todo.
- **Almacenamiento**: la carpeta debe quedar fuera del webroot o protegida por `.htaccess`; de lo contrario los PDF quedan expuestos.
- **Datos personales en el PDF**: decidir si incluye DNI completo (entrega privada al estudiante) o solo enmascarado; la validación pública seguirá mostrándolo enmascarado.
- **URL del QR**: si se hardcodea el dominio o el path, el QR se rompe al cambiar de entorno; mitigar con config externa.
- **Compatibilidad con PHP 8.4**: verificar que la librería elegida no emita advertencias/deprecaciones en la imagen Docker del proyecto.

### Ready for Proposal

Sí, previa confirmación de:

1. Si Composer está disponible en cPanel (y qué extensiones como GD/mbstring existen).
2. La ruta absoluta de almacenamiento de PDFs fuera del webroot.
3. Si el certificado PDF mostrará el DNI completo o enmascarado.
