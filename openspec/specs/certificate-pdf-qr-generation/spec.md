# Spec — certificate-pdf-qr-generation

## Propósito

Definir la generación, persistencia segura y descarga administrativa de certificados en PDF horizontal con un QR de validación pública. El PDF se genera sincrónicamente durante `emitir()`, se persiste como `{certificateCode}.pdf` (nunca con el token) y se ofrece mediante un endpoint administrativo protegido por `X-Admin-Key`. El token completo no se guarda en texto plano: para soportar el reenvío y la regeneración del PDF con el mismo QR, el sistema DEBE persistir un artefacto recuperable del token/URL pública (`token_cifrado` o equivalente, por ejemplo URL pública cifrada) con la clave de cifrado almacenada fuera de Git. El hash del token (`token_hash`) es insuficiente para reconstruir `/validar/{token}`.

## Requisitos

### Requisito: Generación sincrónica de PDF con QR durante la emisión

El sistema DEBE generar el PDF del certificado con QR durante la emisión desde `alumnoId` + `cursoId`, antes de confirmar el alta lógico. El QR DEBE apuntar a `{public_base_url}/validar/{token}` con el mismo token permanente. El sistema NO DEBE guardar el token completo en texto plano ni rotarlo después de emitir salvo revocación o regeneración excepcional auditada. Para entrega manual y regeneración, DEBE persistir artefacto recuperable cifrado con clave fuera de Git.

#### Escenario: Emisión con PDF generado

- DADO una emisión administrativa válida desde alumno y curso
- CUANDO se ejecuta `emitir()`
- ENTONCES el sistema DEBE generar PDF horizontal con QR al link permanente.
- Y DEBE persistirlo junto con token recuperable cifrado y snapshot.

#### Escenario: Falla la generación de PDF

- DADO una emisión válida pero falla generar o persistir PDF
- CUANDO se intenta confirmar la emisión
- ENTONCES el sistema NO DEBE confirmar certificado, token ni snapshot.
- Y DEBE propagar error seguro.

#### Escenario: Regeneración conserva link

- DADO un certificado emitido con token activo cifrado
- CUANDO se regenera el PDF por operación autorizada
- ENTONCES el nuevo PDF DEBE contener QR al mismo `publicValidationUrl`.
- Y NO DEBE crear token nuevo ni invalidar el anterior.

#### Escenario: Token no recuperable

- DADO un certificado anterior sin artefacto cifrado recuperable
- CUANDO se intenta regenerar el PDF con QR
- ENTONCES el sistema DEBE rechazar o limitar la operación con error seguro.
- Y NO DEBE inventar ni exponer token.

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

El PDF DEBE corresponder a un certificado de curso emitido desde alumno, curso y asistencias activas. DEBE incluir las fechas asistidas desde el snapshot `cert_certificado_fechas`, no desde un recálculo de asistencias vivas. El PDF PUEDE mostrar el DNI completo visible por decisión institucional aprobada como contenido público del certificado. Los logs, auditoría, errores y respuestas administrativas NO DEBEN exponer el DNI completo ni el token completo.

#### Escenario: DNI visible en el PDF del certificado

- DADO una emisión que produce un PDF de certificado de curso
- CUANDO se renderiza el documento
- ENTONCES el PDF PUEDE mostrar el DNI completo aprobado, junto con fechas asistidas del snapshot.
- Y NO DEBE exponer el token completo en texto visible ni como dato recuperable.

#### Escenario: PDF conserva snapshot después de cambios

- DADO un certificado emitido con snapshot de fechas
- CUANDO cambian asistencias o fechas vivas del curso
- ENTONCES una descarga o regeneración autorizada del PDF DEBE usar el snapshot original.
- Y NO DEBE recalcular fechas asistidas.
