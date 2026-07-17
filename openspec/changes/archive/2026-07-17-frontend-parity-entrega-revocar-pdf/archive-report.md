# Archive report: 2026-07-17-frontend-parity-entrega-revocar-pdf

## Summary

Ciclo P-13 de paridad entrega/revocar/PDF cerrado. Restaurado **Descargar PDF** vía seam API real (`CertificationsService.descargarPdf` → `GET …/pdf`). Footer de entrega alineado a v0 (Copiar + PDF + Cancelar) con QR junto al bloque QR. Revocar: Escape + panel de error calibrado.

## Verify

PASS WITH WARNINGS — 772/772 tests, tsc 0, build 0 (warnings CSS budget).

## Spec sync

- `openspec/specs/admin-certificate-delivery-frontend/spec.md` — REQ-DEL-008
- `openspec/specs/admin-certifications-frontend/spec.md` — escenario Descargar PDF P-13

## Docs

`docs/frontend/parity-entrega-revocar-pdf.md`
