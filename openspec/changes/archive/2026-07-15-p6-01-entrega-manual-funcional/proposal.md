# Propuesta: P6-01 — Entrega Manual Funcional

## Intent

El flujo de entrega manual administrativa (`/admin/certificaciones/:id/entrega`) hoy es mock-only: host hardcodeado, QR decorativo, sin detección de PDF desactualizado y con un clipboard que no tiene fallback. Bedelía necesita copiar el link público real, descargar el QR PNG y saber cuándo el PDF está outdated para regenerarlo antes de entregar.

## Scope

### In Scope
- Conectar `CertificationDeliveryPage` a `GET /admin/certificados/{id}/entrega-manual`.
- Mostrar URL canónica (`publicValidationUrl`) sin construirla en frontend.
- Descargar QR PNG vía `GET /admin/certificados/{id}/qr.png` usando Blob con filename semántico `{numero}-qr.png`.
- Agregar fallback clipboard con `document.execCommand('copy')`.
- Detectar `pdfStatus === 'outdated'` y mostrar botón "Volver a generar".
- Habilitar botón "Entrega manual" en `CertificationPreviewPage`.
- Agregar `EntregaManualDto` y extender contratos de servicios.
- Tests unitarios de los nuevos flujos.

### Out of Scope
- Cambios de backend (endpoints ya existen).
- Envío automático por email (P6-02).
- Panel de auditoría de entregas (P6-03).
- Endpoint real de regeneración de PDF (MVP: navegar/mostrar mensaje).

## Capabilities

### New Capabilities
- `admin-certificate-delivery-frontend`: Entrega manual real en Angular con URL canónica, descarga QR Blob, clipboard fallback, detección PDF outdated y navegación desde preview.

### Modified Capabilities
- `admin-certifications-frontend`: Se agrega el método `obtenerEntregaManual(id)` al contrato del servicio y se habilita el botón de entrega manual desde el preview.
- `admin-certificate-delivery`: Se amplía la especificación de backend con los estados `pdfStatus` y `pdfAvailable` ya retornados por el endpoint existente (delta mínimo para reflejar el contrato real).

## Approach

Seguir la Opción A recomendada por exploración: reutilizar los endpoints backend existentes (`entrega-manual`, `qr.png`, `pdf`) y concentrar el trabajo en el frontend Angular. Se agrega `EntregaManualDto` en `certifications.models.ts`, se extiende `CertificationsService` con `obtenerEntregaManual(id)` y se implementan los métodos en los adaptadores en memoria y HTTP. La descarga de QR usa `fetch` + `Blob` + `URL.createObjectURL` con un `<a download>`. El clipboard prueba `navigator.clipboard.writeText` primero y cae a `document.execCommand('copy')` sobre un `textarea` temporal. El botón "Volver a generar" navega a la vista de PDF o muestra un mensaje informativo si aún no hay endpoint de regeneración.

## Affected Areas

| Area | Impact | Description |
|------|--------|-------------|
| `apps/frontend-angular/src/app/features/admin/certifications/pages/delivery/certification-delivery-page.ts` | Modified | Consume `entrega-manual`; agrega descarga QR Blob, clipboard fallback, lógica outdated. |
| `apps/frontend-angular/src/app/features/admin/certifications/pages/delivery/certification-delivery-page.html` | Modified | UI de URL canónica, alerta PDF outdated, botón "Volver a generar", descarga QR real. |
| `apps/frontend-angular/src/app/features/admin/certifications/pages/delivery/certification-delivery-page.css` | Modified | Estados de alerta, spinner de regeneración. |
| `apps/frontend-angular/src/app/features/admin/certifications/pages/preview/certification-preview-page.html` | Modified | Habilita botón "Entrega manual" y navega a `/admin/certificaciones/:id/entrega`. |
| `apps/frontend-angular/src/app/features/admin/certifications/certifications.models.ts` | Modified | Agrega `EntregaManualDto` y `PdfStatus`. |
| `apps/frontend-angular/src/app/features/admin/certifications/certifications.service.ts` | Modified | Agrega `obtenerEntregaManual(id)` al contrato. |
| `apps/frontend-angular/src/app/features/admin/certifications/in-memory-certifications.service.ts` | Modified | Mock de `obtenerEntregaManual` con `pdfStatus` sample. |
| `apps/frontend-angular/src/app/features/admin/certifications/http-certifications.service.ts` | Modified | Implementa `GET /admin/certificados/{id}/entrega-manual`. |
| `apps/frontend-angular/src/app/features/admin/certifications/pages/delivery/certification-delivery-page.spec.ts` | Modified | Tests de clipboard fallback, descarga QR, estado outdated. |
| `apps/frontend-angular/src/app/features/admin/certifications/pages/preview/certification-preview-page.spec.ts` | Modified | Test de navegación a entrega manual. |

## Risks

| Risk | Likelihood | Mitigation |
|------|------------|------------|
| `document.execCommand` deprecated | Low | Aceptado como fallback; primero se intenta `navigator.clipboard`. |
| No endpoint de regeneración de PDF | High | MVP: botón navega a vista PDF o muestra mensaje informativo. |
| Safari descarga Blob en pestaña | Low | Usar `a.download` + `target="_blank"` como fallback. |
| URL base de QR/PDF mal resuelta | Low | Validar `environment.apiBaseUrl` en spec/diseño. |

## Rollback Plan

1. Revertir los archivos frontend modificados a la versión anterior.
2. Deshabilitar nuevamente el botón "Entrega manual" en preview.
3. Conservar endpoints backend intactos (no se tocan).
4. Verificar que `CertificationDeliveryPage` vuelva al comportamiento mock-only sin romper rutas.

## Dependencies

- Endpoints backend `entrega-manual`, `qr.png` y `pdf` ya implementados y operativos.
- Ruta Angular `/admin/certificaciones/:id/entrega` ya registrada.
- `environment.apiBaseUrl` resuelve correctamente hacia `/certificados/api` o equivalente.

## Success Criteria

- [ ] `CertificationDeliveryPage` muestra `publicValidationUrl` real sin host hardcodeado.
- [ ] El botón "Copiar link" funciona con `navigator.clipboard` y fallback `execCommand`.
- [ ] El botón "Descargar QR" obtiene PNG del backend, crea Blob y dispara descarga con filename semántico.
- [ ] Si `pdfStatus === 'outdated'`, aparece advertencia y botón "Volver a generar".
- [ ] El botón "Entrega manual" en preview navega a la página de entrega.
- [ ] Tests unitarios de clipboard, QR Blob y navegación pasan.
