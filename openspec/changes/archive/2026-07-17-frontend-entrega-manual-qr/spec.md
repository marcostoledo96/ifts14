# Spec: Entrega manual — QR download (Ciclo 13)

## Locks

1. Filename: `cert-{codigo}-qr.png` donde `codigo` = `detalle.numero` sanitizado (fallback `numeroExpediente`).
2. Descarga SOLO vía `CERTIFICATIONS_SOURCE.descargarQrPng` (no `fetch` directo).
3. Fallo de QR → mensaje inline; NO debe reemplazar el diálogo completo.

## Requirements

### REQ-QR-001: Botón visible

Botón **Descargar QR** visible, con icono Download, label claro y `aria-label` descriptivo. Disabled solo mientras descarga.

#### Scenario: Visible

- GIVEN entrega cargada
- WHEN se inspecciona el pie de acciones
- THEN existe botón Descargar QR habilitado (si no está descargando)

### REQ-QR-002: Blob + filename

Click DEBE pedir Blob via `descargarQrPng(id)` y descargar como `cert-{codigo}-qr.png`.

#### Scenario: Filename

- GIVEN certificado con numero `IFTS14-CERT-0001`
- WHEN descarga OK
- THEN filename = `cert-IFTS14-CERT-0001-qr.png`

#### Scenario: Error inline

- GIVEN `descargarQrPng` rechaza
- WHEN termina el click
- THEN el diálogo permanece y se muestra mensaje de error de QR (role=alert)

### REQ-QR-003: Seam autenticado

HTTP DEBE usar HttpClient hacia `GET …/admin/certificados/{id}/qr.png` (responseType blob), heredando credentials de sesión. Mock in-memory DEBE devolver un Blob PNG sin red.
