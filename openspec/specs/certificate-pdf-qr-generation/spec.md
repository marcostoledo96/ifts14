# Spec — certificate-pdf-qr-generation

## Propósito

Definir la generación, persistencia segura y descarga administrativa de certificados en PDF horizontal con un QR de validación pública. El PDF se genera sincrónicamente durante `emitir()`, se persiste como `{certificateCode}.pdf` (nunca con el token) y se ofrece mediante un endpoint administrativo protegido por `X-Admin-Key`. El token completo solo existe durante la emisión; no se guarda en texto plano ni se regenera luego.

## Requisitos

### Requisito: Generación sincrónica de PDF con QR durante la emisión

El sistema DEBE generar el PDF del certificado con su QR de validación durante la operación de emisión, antes de confirmar el alta lógico del certificado. El QR DEBE apuntar a `{public_base_url}/validar/{token}` con `public_base_url` configurable por entorno. El sistema NO DEBE guardar el token completo en el PDF como dato recuperable ni regenerar el token tras la emisión.

#### Escenario: Emisión con PDF generado

- DADO una emisión administrativa válida con `public_base_url` configurado
- CUANDO se ejecuta `emitir()`
- ENTONCES el sistema DEBE generar un PDF horizontal con el QR apuntando a `{public_base_url}/validar/{token}`
- Y DEBE persistirlo como `{certificateCode}.pdf` sin incluir el token en texto plano.

#### Escenario: Falla la generación de PDF

- DADO una emisión con payload válido pero la generación de PDF falla
- CUANDO se intenta generar y persistir el PDF
- ENTONCES el sistema NO DEBE confirmar el certificado como emitido
- Y DEBE propagar el error sin dejar un certificado emitido sin PDF.

### Requisito: Persistencia protegida del PDF

El sistema DEBE persistir los PDF generados en `certificate_storage_path` configurable, preferentemente fuera del webroot público o protegido por `.htaccess`. El sistema NO DEBE servir los PDFs directamente por URL pública ni listar el contenido del storage.

#### Escenario: Storage fuera del webroot

- DADO la configuración de deploy con `certificate_storage_path` fuera de `public_html`
- CUANDO se persiste un PDF emitido
- ENTONCES el archivo DEBE quedar inaccessible por URL pública directa
- Y solo DEBE poder recuperarse vía el endpoint administrativo de descarga.

#### Escenario: Storage protegido por `.htaccess`

- DADO que el storage debe quedar dentro del webroot por restricción del hosting
- CUANDO se configura el almacenamiento
- ENTONCES DEBE existir una regla `.htaccess` que deniegue el acceso directo a los PDFs
- Y el acceso solo DEBE permitirse vía el endpoint administrativo.

### Requisito: Descarga administrativa de PDF

El sistema DEBE exponer `GET /certificados/api/admin/certificados/{id}/pdf` protegido por `X-Admin-Key` que devuelva el PDF persistido del certificado. La respuesta DEBE usar `Content-Type: application/pdf` y `Content-Disposition: attachment`. El sistema NO DEBE exponer el token completo en la descarga ni aceptar solicitudes sin autorización.

#### Escenario: Descarga autorizada

- DADO un request con `X-Admin-Key` válido para un certificado con PDF persistido
- CUANDO se invoca `GET /certificados/api/admin/certificados/{id}/pdf`
- ENTONCES el sistema DEBE responder `200` con el contenido PDF
- Y DEBE incluir `Content-Type: application/pdf` y `Content-Disposition: attachment`.

#### Escenario: Descarga sin autorización

- DADO un request sin `X-Admin-Key` o con valor inválido
- CUANDO se invoca el endpoint de descarga
- ENTONCES el sistema DEBE responder `401 UNAUTHORIZED` sin exponer el PDF ni metadatos sensibles.

#### Escenario: PDF inexistente

- DADO un request autorizado para un certificado sin PDF persistido
- CUANDO se invoca el endpoint de descarga
- ENTONCES el sistema DEBE responder `404 PDF_NOT_FOUND` sin revelar rutas internas.

### Requisito: Configuración externa con placeholders ficticios

El sistema DEBE documentar las claves `public_base_url` y `certificate_storage_path` en un archivo `.example` con valores ficticios. La configuración real NO DEBE versionarse en Git.

#### Escenario: Placeholders documentados

- DADO el archivo `certificados-config.example.php`
- CUANDO un operador revisa la configuración de ejemplo
- ENTONCES DEBE encontrar `public_base_url` y `certificate_storage_path` con valores ficticios
- Y NO DEBE encontrar valores reales ni secretos.

### Requisito: DNI en el PDF del certificado de curso

El PDF DEBE corresponder a un certificado de curso e incluir las fechas asistidas del curso. El PDF PUEDE mostrar el DNI completo visible por decisión institucional aprobada como contenido público del certificado cuando los documentos lo requieran. Los logs, auditoría, errores y respuestas administrativas NO DEBEN exponer el DNI completo ni el token completo.

#### Escenario: DNI visible en el PDF del certificado

- DADO una emisión que produce un PDF de certificado de curso
- CUANDO se renderiza el documento
- ENTONCES el PDF PUEDE mostrar el DNI completo como contenido público aprobado del certificado, junto con las fechas asistidas del curso
- Y NO DEBE exponer el token completo en texto visible ni como dato recuperable.
