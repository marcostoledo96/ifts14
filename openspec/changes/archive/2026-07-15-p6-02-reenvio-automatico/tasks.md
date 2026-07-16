# Tasks: P6-02 — Reenvío Automático (MVP)

**Review Workload Forecast**: ~120 líneas, ~8 archivos. Bajo cuota. PR única.

### T1: Backend — endpoint regenerar-pdf (CRITICAL)
- [x] `index.php`: ruta `POST /admin/certificados/{id}/regenerar-pdf`
- [x] `AdminCertificateService.php`: método `regenerarPdf(int $id): array`
  - Verificar certificado existe y está emitido
  - Si ya vigente: `{ regenerado: false, mensaje: '...' }`
  - Regenerar PDF con `CertificatePdfService` (mismo token)
  - `UPDATE cert_certificados SET pdf_estado='vigente', pdf_generado_revision=contenido_revision`
  - Auditar `pdf_regenerado`
  - Responder `{ regenerado: true, publicValidationUrl, pdfDownloadUrl, pdfStatus: 'vigente' }`

### T2: Frontend — contrato y HTTP (CRITICAL)
- [x] `certifications.service.ts`: agregar `regenerarPdf(id: number): Promise<RegenerarPdfResult>`
- [x] `http-certifications.service.ts`: `POST /admin/certificados/{id}/regenerar-pdf`
- [x] `in-memory-certifications.service.ts`: mock que simula regeneración

### T3: Frontend — preview page (HIGH)
- [x] `certification-preview-page.ts`: handler `regenerarPdf()` → loading → resultado
- [x] `certification-preview-page.html`: botón con estado loading, área de resultado

### T4: Tests (HIGH)
- [x] Backend: `tests/RegenerarPdfTest.php` con 5 escenarios
- [x] Frontend: specs de preview page actualizados + 4 tests nuevos de regeneración

### T5: Ejecutar tests
- [ ] Backend: `php tests/RegenerarPdfTest.php` — PHP no disponible en entorno local (sin sudo/Docker)
- [x] Frontend: `npm run test:ci` — 621/621 SUCCESS

## Estimación

~120 líneas. 8 archivos (4 backend, 4 frontend).
