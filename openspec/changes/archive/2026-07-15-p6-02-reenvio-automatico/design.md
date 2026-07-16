# Design: P6-02 — Reenvío Automático (MVP)

## Backend

```
POST /admin/certificados/{id}/regenerar-pdf
  → AdminCertificateService::regenerarPdf(id)
    → verificar certificado existe y está emitido
    → si pdf_estado === 'vigente' && revisiones alineadas → 200 { regenerado: false }
    → regenerar PDF con mismo token (CertificatePdfService)
    → UPDATE pdf_estado='vigente', pdf_generado_revision=contenido_revision
    → auditar evento 'pdf_regenerado'
    → devolver { regenerado: true, publicValidationUrl, pdfDownloadUrl, pdfStatus: 'vigente' }
```

## Frontend

```
CertificationPreviewPage
  └─ Botón "Regenerar PDF" → certificationService.regenerarPdf(id)
       ├─ Loading state (botón disabled + spinner)
       ├─ Éxito → mostrar datos de entrega (URL, QR disponible)
       └─ Error → toast/alert con mensaje
```

## Archivos

| Archivo | Cambio |
|---|---|
| `apps/backend-php/index.php` | Nueva ruta POST |
| `apps/backend-php/src/AdminCertificateService.php` | Método `regenerarPdf()` |
| `apps/frontend-angular/.../certifications.service.ts` | `regenerarPdf(id)` en contrato |
| `apps/frontend-angular/.../http-certifications.service.ts` | POST a regenerar-pdf |
| `apps/frontend-angular/.../in-memory-certifications.service.ts` | Mock regenerarPdf |
| `apps/frontend-angular/.../certification-preview-page.ts` | Handler del botón |
| `apps/frontend-angular/.../certification-preview-page.html` | Estado loading/resultado |
