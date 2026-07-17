# Exploration — frontend-entrega-manual-qr (Ciclo 13)

## Existe

- Ruta `/admin/certificaciones/:id/entrega` → `CertificationDeliveryPage` (P6-01).
- Botón visible **Descargar QR** con spinner; `descargarQr()` hace `fetch(api…/qr.png)` → Blob → `<a download>`.
- Filename actual: `{numeroExpediente}-qr.png` (`IFTS14-CERT-0001-qr.png`).
- Spec canónico REQ-DEL-002: `{codigoCertificado}-qr.png`.
- Plan C13: `cert-{codigo}-qr.png`, icono Download, aria-label, error toast.

## Gaps

1. **Filename** no cumple plan C13 (`cert-*-qr.png`).
2. **`fetch` crudo** bypasea interceptor CSRF/`withCredentials` → falla en API real con sesión.
3. **Error** usa `error` global y **reemplaza el diálogo** entero (malo).
4. Icono es QR-pattern, no Download; falta `aria-label` descriptivo.
5. No hay método en `CertificationsService` para QR (seam incompleto).

## Referencia v0

`muestra_pagina/components/admin/entrega-manual.tsx` no tiene botón QR (solo Copiar + Descargar PDF). Angular ya supera v0 en funcionalidad; C13 alinea contrato y robustez.

## Decisión

Mover descarga a `CertificationsService.descargarQrPng(id)` (HttpClient blob + mock), filename `cert-{codigo}-qr.png`, error inline `qrError`, aria-label + icono Download.
