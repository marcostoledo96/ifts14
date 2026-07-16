## Exploration: P6-01 — Entrega Manual Funcional

### Estado Actual

El flujo de entrega manual ya existe en Angular como **mock** (`CertificationDeliveryPage`). La página `/admin/certificaciones/:id/entrega` está registrada en `app.routes.ts` y se accede desde el preview (`certification-preview-page`). El backend PHP tiene el endpoint real `GET /admin/certificados/{id}/entrega-manual` con el método `AdminCertificateService::entregaManual()` que devuelve un DTO completo.

**Frontend mock actual (`CertificationDeliveryPage`):**
- Carga el detalle vía `CertificationsService.obtener(id)` → solo trae `CertificacionDetalle`.
- Construye la URL de validación manualmente con host hardcodeado (`ifts14.edu.ar/certificados`) y el campo `publicValidationUrl` del DTO.
- No consume el endpoint real de entrega manual del backend.
- Botones: Copiar link (clipboard sin fallback) y Descargar PDF (abre `/admin/certificaciones/:id/pdf` en pestaña nueva).
- No detecta PDF desactualizado.
- No hay botón "Volver a generar".
- El QR mostrado es decorativo (patrón estático de 64 celdas); no descarga QR real.

**Backend actual (`index.php` + `AdminCertificateService`):**
- Existe `GET /admin/certificados/{id}/entrega-manual` → devuelve:
  ```
  {
    certificadoId,
    publicValidationUrl,
    pdfDownloadUrl,
    tokenPrefix,
    pdfAvailable: bool,
    pdfStatus: 'outdated' | 'valid' | 'missing'
  }
  ```
- Existe `GET /admin/certificados/{id}/qr.png` → devuelve PNG real generado con `CertificateQrImageService::render(publicValidationUrl)`.
- Existe `GET /admin/certificados/{id}/pdf` → stream del PDF; devuelve 409 si `pdf_estado !== 'vigente'` o revisiones desalineadas (`pdfGeneradoRevision !== contenidoRevision`).
- La URL canónica de validación se construye en `buildPublicValidationUrl(token)` como `{publicBaseUrl}/validar/{token}`.

### Áreas Afectadas

| Archivo | Razón |
|---|---|
| `apps/frontend-angular/src/app/features/admin/certifications/pages/delivery/certification-delivery-page.ts` | Consumir endpoint real de entrega manual; añadir estados de PDF outdated, regenerar, descarga QR con Blob, clipboard fallback. |
| `apps/frontend-angular/src/app/features/admin/certifications/pages/delivery/certification-delivery-page.html` | Añadir UI de "PDF desactualizado", botón "Volver a generar", descarga QR, mejorar semántica de diálogo. |
| `apps/frontend-angular/src/app/features/admin/certifications/pages/delivery/certification-delivery-page.css` | Estilos para estados de alerta, spinner de regeneración, layout de descarga QR. |
| `apps/frontend-angular/src/app/features/admin/certifications/pages/preview/certification-preview-page.html` | Habilitar el botón "Entrega manual" (actualmente disabled con handoff `F5-04`). Navegar a `/admin/certificaciones/:id/entrega`. |
| `apps/frontend-angular/src/app/features/admin/certifications/certifications.service.ts` | Añadir método `obtenerEntregaManual(id)` al contrato. |
| `apps/frontend-angular/src/app/features/admin/certifications/in-memory-certifications.service.ts` | Implementar mock de `obtenerEntregaManual(id)` con pdfStatus sample. |
| `apps/frontend-angular/src/app/features/admin/certifications/http-certifications.service.ts` | Implementar HTTP real de `GET /admin/certificados/{id}/entrega-manual`. |
| `apps/frontend-angular/src/app/features/admin/certifications/certifications.models.ts` | Añadir modelo `EntregaManualDto` (publicValidationUrl, pdfDownloadUrl, tokenPrefix, pdfAvailable, pdfStatus). |
| `apps/frontend-angular/src/app/features/admin/certifications/pages/delivery/certification-delivery-page.spec.ts` | Tests de clipboard fallback, descarga QR, estado outdated, regenerar. |
| `apps/frontend-angular/src/app/features/admin/certifications/pages/preview/certification-preview-page.spec.ts` | Verificar que el botón "Entrega manual" navega a la ruta correcta. |
| `apps/backend-php/src/AdminCertificateService.php` | Revisar si `entregaManual` ya incluye todo lo necesario (sí, parece completo). |
| `apps/backend-php/index.php` | Verificar que `qr.png` y `entrega-manual` funcionan con la ruta de Angular (ya existen). |

### Enfoques

#### Opción A — Endpoint real + Blob QR + clipboard fallback + regenerar (Recomendada)

1. **Contrato frontend-backend**: consumir `GET /admin/certificados/{id}/entrega-manual` que ya existe.
2. **URL canónica**: usar `publicValidationUrl` del DTO directamente (no construir en frontend).
3. **Descarga QR**: consumir `GET /admin/certificados/{id}/qr.png`, recibir PNG, crear `Blob`, disparar descarga con `URL.createObjectURL(blob)` y filename semántico `{certificateCode}-qr.png`.
4. **Fallback clipboard**: si `navigator.clipboard` no está disponible, usar `document.execCommand('copy')` con un `textarea` temporal.
5. **PDF outdated**: si `pdfStatus === 'outdated'`, mostrar advertencia y botón "Volver a generar" que navega a `/admin/certificaciones/:id/pdf` (o eventualmente llama a POST regenerar si existe endpoint).
6. **Foco/Escape**: ya existe `@HostListener('document:keydown.escape')` y `tabindex="-1"` en el diálogo; verificar que el foco inicial va al título o al primer botón.

**Ventajas:**
- Usa infra ya existente en backend (endpoint real, QR real, PDF real).
- Elimina hardcode de host (`ifts14.edu.ar/certificados`).
- QR descargable real con filename semántico.
- Clipboard robusto.
- Prepara terreno para P6-02 (reenvío automático) y P6-05 (botón enviar independiente).

**Desventajas:**
- Requiere tocar varios archivos frontend (service, model, page, template, tests).
- `document.execCommand` está deprecated pero sigue funcionando en browsers viejos.

**Esfuerzo:** Medio.

#### Opción B — Solo habilitar el botón de preview y mínimos ajustes

1. Solo habilitar el botón "Entrega manual" en `certification-preview-page.html` (sacar `disabled`).
2. Dejar el delivery page como está (mock).

**Ventajas:** Mínimo cambio.

**Desventajas:** No cumple el spec de P6-01 (URL canónica, descarga QR, fallback clipboard, botón regenerar). El QR sigue siendo decorativo. El host sigue hardcodeado.

**Esfuerzo:** Bajo, pero incompleto.

#### Opción C — Usar librería QR en Angular (sin depender del backend PNG)

1. Generar el QR en el frontend con una librería como `qrcode` o `angularx-qrcode`.
2. Convertir canvas a Blob y descargar.

**Ventajas:** Independiente del backend para QR.

**Desventajas:** Duplica lógica de generación de QR (backend ya tiene `CertificateQrImageService` con TCPDF `write2DBarcode`). Añade dependencia. El spec dice "descarga QR vía Blob con filename semántico", no especifica si debe ser backend o frontend. Pero backend ya lo tiene.

**Esfuerzo:** Medio-Alto, y redundante.

### Recomendación

**Opción A**. Es la que satisface todos los requisitos del plan P6-01 con el menor costo (reusa endpoints backend existentes). Los endpoints `entrega-manual`, `qr.png` y `pdf` ya están implementados y probados. El trabajo principal es en el frontend Angular.

### Riesgos

1. **CORS / base href**: `environment.apiBaseUrl` puede apuntar a `/certificados/api`; asegurar que `qr.png` y `pdf` se descarguen con la URL correcta (absoluta o relativa al apiBaseUrl).
2. **Clipboard fallback en iframes**: `document.execCommand('copy')` puede fallar en iframes o contextos sin focus. Poco probable en el contexto admin real.
3. **Filename semántico en descarga Blob**: `URL.createObjectURL` + `a.download` funciona en todos los browsers modernos; en Safari iOS puede abrir en pestaña en lugar de descargar.
4. **Regenerar PDF**: actualmente no existe endpoint `POST /admin/certificados/{id}/regenerar`. El botón "Volver a generar" en P6-01 puede simplemente navegar a la vista PDF o mostrar un mensaje "Regenerá desde el expediente" como MVP, dejando el endpoint real para un ciclo posterior.

### Brechas (Gap Analysis)

| Requisito P6-01 | Estado actual | Brecha |
|---|---|---|
| URL canónica (no token) | Backend ya construye `{publicBaseUrl}/validar/{token}`; frontend hardcodea host | Frontend debe usar `publicValidationUrl` del DTO |
| Descarga QR vía Blob con filename semántico | Backend tiene `qr.png`; frontend tiene QR decorativo | Frontend debe consumir `qr.png`, crear Blob y disparar descarga |
| Fallback clipboard si Blob no disponible | Frontend tiene `navigator.clipboard` sin fallback | Añadir `document.execCommand('copy')` fallback |
| Botón "Volver a generar" cuando PDF desactualizado | No existe en frontend | Añadir lógica con `pdfStatus === 'outdated'` |
| Foco y escape en diálogos | Ya existe Escape handler y `tabindex="-1"` | Verificar foco inicial en diálogo tras carga |
| Botón "Entregar" en preview | Está `disabled` con handoff `F5-04` | Habilitar navegación a `/admin/certificaciones/:id/entrega` |

### Preparado para Proposal

**Sí.** Se recomienda avanzar a `sdd-propose` con:
- Scope: habilitar flujo de entrega manual real (frontend consume endpoints existentes).
- No requiere cambios backend salvo verificación de que `entrega-manual` y `qr.png` responden correctamente.
- Entregable: `CertificationDeliveryPage` funcional con descarga QR, clipboard robusto, detección de PDF outdated y navegación desde preview.
