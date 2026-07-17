# Entrega manual — descarga QR

## Estado

Cerrado y archivado en `openspec/changes/archive/2026-07-17-frontend-entrega-manual-qr/`.
Verify: PASS WITH WARNINGS — `test:ci` 747/747, `tsc` exit 0, `build` exit 0 (2026-07-17).

## Alcance implementado

- `CertificationsService.descargarQrPng(id)` (HttpClient blob + mock PNG).
- Filename `cert-{codigo}-qr.png` (codigo = `detalle.numero` sanitizado).
- Error inline (`qrError`) sin reemplazar el diálogo.
- Botón con icono Download + `aria-label` descriptivo.
- Sin `fetch` crudo (hereda credentials/CSRF del interceptor).

## Referencias

- Archive: `openspec/changes/archive/2026-07-17-frontend-entrega-manual-qr/`
- Página: `certifications/pages/delivery/certification-delivery-page.*`
- Spec: `openspec/specs/admin-certificate-delivery-frontend/spec.md` (REQ-DEL-002)
