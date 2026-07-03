## Exploration: PDF institucional de certificado de curso con fechas y firmantes (M4-05)

### Current State

El backend ya genera un PDF horizontal durante `POST /admin/certificados`:

- Usa `CertificatePdfService` con TCPDF.
- Incluye QR apuntando a `{public_base_url}/validar/{token}` (token permanente).
- Muestra DNI completo, nombre del alumno, nombre del curso, fecha de emisión y vencimiento opcional.
- Lista las fechas asistidas desde el snapshot `cert_certificado_fechas` (no recalcula asistencias vivas).
- El token se persiste cifrado (`token_cifrado`), la entrega manual funciona y no rota el QR.

Sin embargo, el PDF actual es genérico: título "Certificado de Aprobación", tipografía Helvetica, sin firmantes ni texto institucional configurable.

La tabla `cert_configuracion_institucional` ya existe en el esquema (migración `003`) con campos para `institucion_nombre`, `rector_nombre`, `rector_cargo`, `asesor_nombre`, `asesor_cargo` y `texto_certificado`. El seed `002` carga valores ficticios, pero:

- Ningún servicio PHP la lee.
- No hay endpoint para consultarla ni actualizarla.
- No hay assets de logo/escudo en `apps/backend-php/` (solo mocks en `muestra_pagina/`).

### Affected Areas

- `apps/backend-php/src/CertificatePdfService.php` — renderizado del PDF: agregar firmantes, texto institucional y mejorar layout.
- `apps/backend-php/src/AdminCertificateService.php` — emisión: leer `cert_configuracion_institucional` y pasar los datos al servicio de PDF.
- `apps/backend-php/src/AdminMasterDataService.php` e `index.php` — **solo si** se incluye API de gestión de configuración institucional.
- `apps/backend-php/tests/SnapshotEmissionTest.php` y `HttpEmissionE2eTest.php` — validar que el PDF siga generándose y que la emisión/validación/entrega manual no se rompan.
- `docs/backend/01-contrato-api-certificados.md`, `docs/backend/00-php84-api.md` y `openspec/specs/certificate-pdf-qr-generation/spec.md` — documentar el nuevo contenido del PDF.
- `database/seeds/002_cursos_alumnos_asistencias_demo.sql` — ya contiene configuración institucional ficticia; no requiere cambios.

### Approaches

1. **Solo renderizado PDF con lectura de configuración institucional (mínimo viable)**
   - `AdminCertificateService::emitir()` lee la fila `cert_configuracion_institucional` (con fallback seguro si no existe).
   - Pasa texto institucional y firmantes a `CertificatePdfService::generate()`.
   - Se rediseña el layout del PDF: título "Certificado de Curso", cuerpo con nombre del alumno, curso, DNI, fechas asistidas, firmantes al pie y QR.
   - No se agrega endpoint de gestión; los firmantes se cargan directamente en DB o mediante seed/demo.
   - Pros: no cambia el contrato HTTP, no toca `index.php`, es el scope más chico, aprovecha la tabla existente.
   - Cons: la configuración institucional no es editable por API en este ciclo.
   - Effort: Medium

2. **Renderizado PDF + API de configuración institucional**
   - Además del cambio de PDF, se agregan endpoints `GET /admin/configuracion-institucional` y `PATCH /admin/configuracion-institucional` para consultar/actualizar la fila única.
   - Pros: entrega operativa completa; Bedelía puede editar firmantes sin tocar DB.
   - Cons: amplía el contrato admin, requiere más tests HTTP y documentación. Puede exceder el presupuesto de revisión si se combina con el rediseño PDF en un solo PR.
   - Effort: Medium-High

### Recommendation

**Opción 1 como núcleo de M4-05**: centrar el ciclo en hacer el PDF verdaderamente institucional (texto + firmantes + layout) leyendo `cert_configuracion_institucional` existente. No se requieren migraciones ni cambios en `config.php`. La edición de firmantes por API puede dejarse como ciclo posterior o incluirse solo si el presupuesto de líneas del PR lo permite.

Si Marcos aprueba incluir la API de gestión, se recomienda hacerlo como un slice separado dentro del mismo branch o como PR encadenado, para no mezclar renderizado visual con contrato administrativo.

### Risks

- `vendor/` no está versionado y TCPDF se instala por Composer; el entorno de cPanel debe tenerlo disponible (gate conocido desde M4-04).
- El rediseño del PDF no debe alterar rutas, nombres de archivo ni el contrato de `emitir()`, `entregaManual()` ni descarga PDF.
- Tests que validen contenido textual del PDF binario son frágiles; conviene testear a nivel de servicio (que `generate()` no falle y que el DTO de emisión se mantenga) o parsear el PDF con TCPDF si es viable.
- Si `cert_configuracion_institucional` no tiene fila, el PDF debe seguir generándose con valores por defecto seguros (sin romper la emisión).
- No exponer DNI completo ni token completo en logs ni en textos de prueba.

### Ready for Proposal

**Sí.** El scope puede reducirse a:

1. Leer `cert_configuracion_institucional` en `AdminCertificateService::emitir()`.
2. Ampliar `CertificatePdfService::generate()` con firmantes y texto institucional.
3. Actualizar tests existentes para cubrir el nuevo renderizado.
4. Sincronizar docs/specs afectados durante `sdd-archive`.

No se requieren migraciones de base ni cambios en configuración PHP. La entrega manual, el QR permanente y la validación pública se preservan sin cambios funcionales.
