# Spec: Paridad entrega / revocar / PDF (P-13)

Delta sobre delivery + PDF preview + revoke chrome. Honest UI: descarga PDF solo vía API/seam existente.

---

## Capability: admin-parity-entrega-revocar-pdf

### REQ-PAR-PDF-001 — Descargar PDF con seam real

La vista `/admin/certificaciones/:id/pdf` MUST mostrar CTA **Descargar PDF** (primary) junto a **Imprimir**.
La descarga MUST usar `CertificationsService.descargarPdf(id)` → `GET /admin/certificados/{id}/pdf` (HttpClient, `responseType: 'blob'`).
MUST NOT inventar blob sin respuesta del servicio.
Filename MUST ser `cert-{codigo}.pdf` (codigo sanitizado).
Si falla, MUST feedback inline (live region / status), sin crash.

#### Scenario: CTA y descarga

- **Given** certificado cargado en PDF preview
- **When** Bedelía pulsa Descargar PDF
- **Then** se invoca `descargarPdf(id)` y se dispara descarga de Blob `application/pdf`
- **And** MUST NOT usar `fetch` crudo ni blob inventado en la página

#### Scenario: Imprimir intacto

- **Given** PDF preview
- **When** pulsa Imprimir
- **Then** `window.print()` (o feedback si no disponible) como hoy

### REQ-PAR-DEL-001 — Footer entrega = Copiar + PDF + Cancelar

Footer del diálogo de entrega MUST alinear acciones v0: **Copiar link** (primary), **Descargar PDF**, **Cancelar**.
**Descargar QR** MUST permanecer disponible pero fuera del footer (junto al bloque QR).
Descargar PDF MUST usar el mismo seam Blob (`descargarPdf`), no abrir solo la preview HTML.

#### Scenario: Footer visual

- **Given** entrega cargada
- **When** se inspecciona footer
- **Then** botones Copiar link, Descargar PDF, Cancelar
- **And** Descargar QR visible cerca del QR, no como cuarto CTA del footer row-reverse

### REQ-PAR-REV-001 — Escape y errores calibrados

Diálogo revocar MUST cerrar con Escape hacia el expediente (paridad v0).
Errores de motivo/confirmación MUST conservar role=alert y copy v0.
Error de carga MUST panel con enlace volver.

#### Scenario: Escape

- **Given** diálogo revocar abierto
- **When** Escape
- **Then** navega a `/admin/certificaciones/:id`
