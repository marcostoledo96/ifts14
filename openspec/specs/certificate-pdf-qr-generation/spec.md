# Spec — certificate-pdf-qr-generation

> **Actualización P5-01 (2026-07-15):** Las menciones históricas a `X-Admin-Key` como autorización HTTP están superseded. La autorización vigente usa sesión PHP y CSRF; el header no autoriza requests HTTP.

## Propósito

Definir la generación, persistencia segura y descarga administrativa de certificados en PDF horizontal con un QR de validación pública. El PDF se genera sincrónicamente durante `emitir()`, se persiste como `{certificateCode}.pdf` (nunca con el token) y se ofrece mediante un endpoint administrativo protegido por una sesión PHP administrativa válida. El token completo no se guarda en texto plano: para soportar el reenvío y la regeneración del PDF con el mismo QR, el sistema DEBE persistir un artefacto recuperable del token/URL pública (`token_cifrado` o equivalente, por ejemplo URL pública cifrada) con la clave de cifrado almacenada fuera de Git. El hash del token (`token_hash`) es insuficiente para reconstruir `/validar/{token}`.

## Requisitos

### Requisito: Generación sincrónica de PDF con QR durante la emisión

El sistema DEBE generar durante la emisión un PDF horizontal institucional con QR al link permanente `{public_base_url}/validar/{token}`. El PDF DEBE incluir nombre institucional, texto de certificado configurable, alumno, curso, DNI completo aprobado para el certificado, fechas certificadas del snapshot `cert_certificado_fechas`, rector/a y asesor/a pedagógica con sus cargos. El sistema NO DEBE guardar token completo en texto plano, rotarlo, enviar email ni depender de SMTP.
(Antes: el PDF se generaba con QR y token permanente, pero sin contenido institucional configurable ni firmantes.)

#### Escenario: Emisión con PDF institucional generado

- DADO una emisión administrativa válida con configuración institucional existente
- CUANDO se ejecuta `emitir()`
- ENTONCES el PDF DEBE renderizar institución, texto configurable, firmantes, curso, alumno, DNI aprobado y fechas del snapshot.
- Y DEBE conservar QR al link permanente y token recuperable cifrado.

#### Escenario: Configuración institucional ausente

- DADO una emisión válida sin fila en `cert_configuracion_institucional`
- CUANDO se genera el PDF
- ENTONCES el sistema DEBE emitir PDF con valores institucionales seguros por defecto.
- Y NO DEBE abortar emisión, rotar token ni exponer datos sensibles.

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

El sistema DEBE exponer `GET /certificados/api/admin/certificados/{id}/pdf` autorizado según `admin-auth` que devuelva el PDF persistido del certificado. La respuesta DEBE usar `Content-Type: application/pdf` y `Content-Disposition: attachment`. El sistema NO DEBE exponer el token completo en la descarga ni aceptar solicitudes sin autorización.

#### Escenario: Descarga autorizada

- DADO un request autorizado según `admin-auth` para un certificado con PDF persistido
- CUANDO se invoca `GET /certificados/api/admin/certificados/{id}/pdf`
- ENTONCES el sistema DEBE responder `200` con el contenido PDF
- Y DEBE incluir `Content-Type: application/pdf` y `Content-Disposition: attachment`.

#### Escenario: Descarga sin autorización

- DADO un request sin autorización válida
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

El PDF DEBE corresponder a un certificado de curso emitido desde alumno, curso y asistencias activas. DEBE incluir fechas asistidas desde el snapshot `cert_certificado_fechas`, no desde asistencias vivas. El PDF PUEDE mostrar DNI completo por decisión institucional. Logs, auditoría, errores y respuestas administrativas NO DEBEN exponer DNI completo ni token completo.
(Antes: exigía DNI y fechas snapshot, sin requerir texto institucional ni firmantes.)

#### Escenario: DNI visible en el PDF institucional

- DADO una emisión que produce un PDF de certificado de curso
- CUANDO se renderiza el documento
- ENTONCES el PDF PUEDE mostrar DNI completo aprobado junto con fechas del snapshot, texto institucional y firmantes.
- Y NO DEBE exponer token completo como texto visible ni dato recuperable.

#### Escenario: PDF emitido conserva snapshot después de cambios

- DADO un certificado emitido con snapshot de fechas
- CUANDO cambian asistencias o fechas vivas del curso
- ENTONCES la descarga del PDF ya emitido DEBE conservar el contenido generado con el snapshot original.
- Y NO DEBE recalcular fechas asistidas.

### Requisito: Verificación testable de generación PDF

El sistema DEBE permitir pruebas procedurales que verifiquen emisión institucional y generación del PDF sin depender de parseo frágil del binario ni de dobles de una clase `final`.

#### Escenario: Prueba de emisión con PDF persistido

- DADO una emisión con configuración institucional y fechas snapshot conocidas
- CUANDO la prueba ejecuta la emisión contra storage temporal
- ENTONCES DEBE poder afirmar snapshot persistido, archivo PDF existente, firma `%PDF` y tamaño mayor a cero.

#### Escenario: Prueba de generación binaria mínima

- DADO insumos válidos del certificado institucional
- CUANDO se genera el PDF
- ENTONCES la prueba DEBE verificar que se produce y persiste un PDF descargable.

### Requisito: QR descargable como PNG aislado

El sistema DEBE generar on-demand un PNG desde el mismo `publicValidationUrl` del PDF. NO DEBE agregar Composer si lo existente alcanza, persistir PNG, rotar token ni modificar certificado, PDF, auditoría o base.

#### Escenario: QR PNG usa la URL pública canónica

- DADO un certificado con `publicValidationUrl` recuperable
- CUANDO se genera el QR PNG administrativo
- ENTONCES el QR DEBE codificar la misma URL permanente, sin crear ni invalidar token.

#### Escenario: Generación sin side effects

- DADO una solicitud de QR PNG exitosa o fallida
- CUANDO finaliza la operación
- ENTONCES NO DEBE persistir PNG, reescribir PDF, auditar, mutar filas ni loguear la URL completa.

### Requisito: Dependencia runtime PNG

Docker/test DEBE verificar soporte PNG mediante `gd` o equivalente. Si falta, DEBE fallar cerrado con error seguro.

#### Escenario: Entorno con soporte PNG

- DADO el entorno de tests/backend con soporte PNG disponible
- CUANDO se ejecuta la verificación de módulos
- ENTONCES DEBE declarar `gd` o equivalente y validar magic bytes PNG.

#### Escenario: Entorno sin soporte PNG

- DADO que falta soporte runtime para crear PNG
- CUANDO se intenta renderizar el QR
- ENTONCES DEBE responder error seguro, sin archivo vacío/corrupto ni HTML como PNG.
