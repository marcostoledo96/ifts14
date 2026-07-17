# Paridad P-13 — Entrega / Revocar / PDF (2026-07-17)

Chrome de entrega, revocación y vista PDF alineado a `muestra_pagina`.

## Decisiones

- **Descargar PDF restaurado** porque existe seam backend `GET /admin/certificados/{id}/pdf`. Se agregó `CertificationsService.descargarPdf` (HttpClient blob), espejo de `descargarQrPng`.
- **Sin fake blob:** la UI no inventa PDF; mock in-memory solo para tests.
- **Entrega:** footer = Copiar link + Descargar PDF + Cancelar (calco v0). **Descargar QR** se mantiene junto al bloque QR.
- **PDF preview:** Imprimir (SVG) + Descargar PDF (primary ink).
- **Revocar:** Escape cierra al expediente; panel de error con `role=alert`.

## Verify

`test:ci` 772 SUCCESS · `tsc` 0 · `build` 0 (warnings CSS budget).

Archivo SDD: `openspec/changes/archive/2026-07-17-frontend-parity-entrega-revocar-pdf/`.
