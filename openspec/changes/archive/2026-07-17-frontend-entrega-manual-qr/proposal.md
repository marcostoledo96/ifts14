# Proposal: Entrega manual — QR download

## Intent

Cerrar la descarga real del QR en entrega manual: filename semántico `cert-{codigo}-qr.png`, seam autenticado vía HttpClient, y error inline sin destruir el diálogo.

## Scope

### In Scope
- `CertificationsService.descargarQrPng(id): Promise<Blob>` (HTTP + in-memory).
- `CertificationDeliveryPage`: usar seam, filename `cert-{codigo}-qr.png`, `qrError` inline, aria-label, icono Download.
- Actualizar REQ-DEL-002 y tests.

### Out of Scope
- Regeneración PDF real; email; rotación token/QR; cambios backend; polish visual general del modal.

## Approach

Approach 1: método en el servicio de certificaciones (respeta interceptor de sesión). Página solo orquesta Blob → objectURL → click → revoke.

## Risks
- Stubs de `CertificationsService` en specs deben agregar el método.
- Filename cambia → actualizar asserts REQ-DEL-002.
