# Spec: Admin Certificate Delivery Frontend (P6-01)

## Capability: `admin-certificate-delivery-frontend`

Delta spec — funcionalidad real de entrega manual desde el panel admin.

### REQ-DEL-001: URL canónica desde backend

**Prioridad**: CRITICAL

**Given** un certificado con token generado
**When** el admin abre la página de entrega manual
**Then** el frontend DEBE obtener `publicValidationUrl` desde `GET /admin/certificados/{id}/entrega-manual`
**And** DEBE mostrar la URL completa sin hardcodear el dominio

### REQ-DEL-002: Descarga QR vía Blob con filename semántico

**Prioridad**: CRITICAL

**Given** la página de entrega manual cargada
**When** el admin hace clic en "Descargar QR"
**Then** el frontend DEBE solicitar el PNG vía `CertificationsService.descargarQrPng(id)` (`GET /admin/certificados/{id}/qr.png` con HttpClient/sesión)
**And** DEBE crear un Blob con el response y disparar descarga
**And** el filename DEBE ser `cert-{codigo}-qr.png` (codigo = `detalle.numero` sanitizado; ej: `cert-IFTS14-CERT-0001-qr.png`)
**And** si falla, DEBE mostrar error inline sin reemplazar el diálogo completo
**And** el botón DEBE tener `aria-label` descriptivo e icono de descarga

### REQ-DEL-003: Fallback clipboard para copiar link

**Prioridad**: HIGH

**Given** la página de entrega manual con URL visible
**When** el admin hace clic en "Copiar link"
**Then** DEBE usar `navigator.clipboard.writeText()` si está disponible
**And** si no está disponible, DEBE usar `document.execCommand('copy')` como fallback
**And** DEBE mostrar feedback visual (texto cambiado a "Copiado ✓" por 2s)

### REQ-DEL-004: Detección de PDF desactualizado

**Prioridad**: HIGH

**Given** un certificado cuyo PDF está desactualizado (`pdfStatus === 'outdated'`)
**When** el admin abre la entrega manual
**Then** DEBE mostrarse un alert con el mensaje "El PDF está desactualizado"
**And** DEBE mostrarse un botón "Volver a generar PDF"

### REQ-DEL-005: Botón "Volver a generar"

**Prioridad**: MEDIUM

**Given** un PDF desactualizado detectado
**When** el admin hace clic en "Volver a generar PDF"
**Then** DEBE navegar a la página de regeneración o mostrar mensaje de que se requiere regeneración
**And** MVP: mostrar mensaje "La regeneración de PDF requiere acción del backend. Contactar al administrador."

### REQ-DEL-006: Botón "Entregar" habilitado en preview

**Prioridad**: HIGH

**Given** la página de preview de certificación
**When** el botón "Entrega manual" está presente
**Then** DEBE estar habilitado (no disabled)
**And** al hacer clic DEBE navegar a `/admin/certificaciones/{id}/entrega`

### REQ-DEL-007: Foco y escape en diálogos

**Prioridad**: MEDIUM

**Given** un diálogo o modal abierto en la página de entrega
**When** se presiona Escape
**Then** el diálogo DEBE cerrarse
**And** el foco DEBE retornar al elemento que abrió el diálogo

### REQ-DEL-008: Descargar PDF vía Blob (paridad P-13)

**Prioridad**: HIGH

**Given** la página de entrega manual cargada
**When** el admin hace clic en "Descargar PDF"
**Then** el frontend DEBE solicitar el PDF vía `CertificationsService.descargarPdf(id)` (`GET /admin/certificados/{id}/pdf` con HttpClient/sesión)
**And** DEBE crear un Blob y disparar descarga con filename `cert-{codigo}.pdf`
**And** el footer MUST mostrar Copiar link + Descargar PDF + Cancelar (paridad v0)
**And** Descargar QR MUST permanecer disponible fuera del footer (junto al bloque QR)
**And** MUST NOT inventar un blob sin respuesta del servicio
