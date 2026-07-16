# Verify Report: P6-02 — Reenvío Automático (MVP)

```yaml
schema: gentle-ai.verify-result/v1
verdict: pass
blockers: 0
warnings: 1
```

## Requirements Verification

| REQ | Descripción | Estado | Evidencia |
|---|---|---|---|
| REQ-REGEN-001 | Regenerar PDF con mismo token | ✅ PASS | `AdminCertificateService::regenerarPdf()` — mismo token, update estado |
| REQ-REGEN-002 | Rechazar si ya vigente | ✅ PASS | `if (pdf_estado === 'vigente' && aligned)` → `{ regenerado: false }` |
| REQ-REGEN-003 | Botón preview dispara regeneración | ✅ PASS | `certification-preview-page.ts`: `onRegenerarPdf()` → POST → loading → resultado |
| REQ-REGEN-004 | Auditoría | ✅ PASS | `accion = 'pdf_regenerado'` registrado |

## Test Results

```
Frontend: 621/621 SUCCESS
Backend: 5 tests escritos (RegenerarPdfTest.php), no ejecutables sin PHP local
```

## Warnings

| # | Severity | Descripción |
|---|---|---|
| W1 | MEDIUM | Backend test `RegenerarPdfTest.php` no ejecutado — PHP no disponible en entorno local. Debe correrse en CI o entorno con PHP 8.4.21 + TCPDF. |

## Files Changed (14)

| Capa | Archivos |
|---|---|
| Backend | `index.php`, `AdminCertificateService.php`, `RegenerarPdfTest.php` (nuevo) |
| Frontend | `certifications.models.ts`, `certifications.service.ts`, `http-certifications.service.ts`, `in-memory-certifications.service.ts`, `certification-preview-page.ts`, `.html`, `.css`, `.spec.ts`, `admin-dashboard-page.spec.ts`, `certifications-list-page.spec.ts`, `certification-pdf-preview-page.spec.ts` |
