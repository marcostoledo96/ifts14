# Design: P6-01 — Entrega Manual Funcional

## Enfoque

Conectar `CertificationDeliveryPage` a los endpoints backend existentes. Sin cambios en backend.

## Arquitectura

```
CertificationPreviewPage
  └─ Botón "Entrega manual" (habilitado)
       └─ routerLink: /admin/certificaciones/:id/entrega

CertificationDeliveryPage
  ├─ ngOnInit → CertificationDeliveryService.obtenerEntrega(id)
  │    └─ GET /admin/certificados/{id}/entrega-manual
  │         ← { publicValidationUrl, pdfDownloadUrl, tokenPrefix, pdfAvailable, pdfStatus }
  ├─ Copiar link
  │    ├─ navigator.clipboard.writeText(publicValidationUrl)
  │    └─ Fallback: document.execCommand('copy') + textarea temporal
  ├─ Descargar QR
  │    ├─ GET /admin/certificados/{id}/qr.png → response.blob()
  │    ├─ URL.createObjectURL(blob)
  │    ├─ <a download="{codigo}-qr.png"> click programático
  │    └─ URL.revokeObjectURL() cleanup
  └─ PDF desactualizado
       ├─ pdfStatus === 'outdated' → alert + botón "Volver a generar"
       └─ Botón → mensaje MVP
```

## Decisiones

| Decisión | Elección | Motivo |
|---|---|---|
| QR | Backend `qr.png` → Blob | Reutiliza `CertificateQrImageService`, sin dependencia npm |
| Clipboard fallback | `document.execCommand('copy')` | Cubre navegadores sin Clipboard API; deprecated pero funcional |
| Modelo | `EntregaManualDto` interface | Tipado seguro del response del backend |
| Servicio | Extender `CertificationsService` con `obtenerEntregaManual()` | Consistente con patrón existente |
| "Volver a generar" | Mensaje MVP | No hay endpoint `POST /regenerar` en backend; se agrega después |
| Botón preview | Quitar `disabled` y `aria-disabled` | Ya existe el routerLink; solo se habilita |

## Archivos

### Modificados

| Archivo | Cambio |
|---|---|
| `certifications.models.ts` | Agregar `EntregaManualDto` |
| `certifications.service.ts` | Agregar `obtenerEntregaManual(id): Promise<EntregaManualDto>` |
| `http-certifications.service.ts` | Implementar `GET /admin/certificados/{id}/entrega-manual` |
| `in-memory-certifications.service.ts` | Mock `obtenerEntregaManual()` con datos de seed |
| `certification-delivery-page.ts` | Consumir endpoint real, QR Blob, clipboard fallback, PDF outdated |
| `certification-delivery-page.html` | Actualizar template: binding real, alert outdated, botón regenerar |
| `certification-preview-page.html` | Habilitar botón "Entrega manual" (quitar disabled) |

### Tests

| Archivo | Cambio |
|---|---|
| `certification-delivery-page.spec.ts` | Tests con HttpTestingController, clipboard mock, QR Blob |
| `certification-preview-page.spec.ts` | Verificar botón habilitado y navegación |

## Riesgos

- `document.execCommand` deprecated → acceptable para fallback; la API principal es `navigator.clipboard`
- Safari iOS Blob → puede abrir en tab en vez de descargar; `download` attribute mitiga
- CORS/base href → QR/PDF URLs usan `apiBaseUrl` del environment
