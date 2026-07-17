# Exploration: frontend-parity-entrega-revocar-pdf (P-13)

## Current State

- **PDF** (`certification-pdf-preview-page`): barra con Imprimir (emoji) + Volver; sin Descargar PDF. Backend ya expone `GET /admin/certificados/{id}/pdf` (`application/pdf`). Frontend tiene `pdfDownloadUrl` en DTO pero **no** `descargarPdf` en `CertificationsService` (sí tiene `descargarQrPng`).
- **Entrega** (`certification-delivery-page`): footer Copiar + Descargar QR + Descargar PDF (abre preview en tab; status “PDF descargado” engañoso) + Cancelar. QR es plus vs v0.
- **Revocar** (`certification-revoke-page`): modal cercano a v0; falta Escape; overlay de error a calibrar.

## Tabla de gaps

| # | Elemento v0 | Angular | Decisión |
|---|-------------|---------|----------|
| P1 | Imprimir + Descargar PDF (primary) | Solo Imprimir | **Restaurar** Descargar PDF vía seam real Blob |
| P2 | Iconos Printer/Download Lucide | Emoji 🖨 | SVG inline |
| E1 | Footer Copiar + PDF + Cancelar | + QR en mismo footer | QR junto al bloque QR; footer = Copiar+PDF+Cancelar |
| E2 | Descargar PDF real (mock v0) | `window.open` preview | Blob vía `descargarPdf` |
| R1 | Escape cierra | Ausente | Agregar HostListener Escape |
| R2 | Errores motivo/confirm | Ya existen | Calibrar copy/CSS vs v0 |

## Recommendation

Approach 1: agregar `descargarPdf(id): Promise<Blob>` (HTTP + in-memory mínimo válido), cablear PDF + entrega; calcar chrome; Escape en revocar. Sin fake blob inventado.

## Ready for Proposal

Yes.
