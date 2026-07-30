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

Si `pdfStatus === 'outdated'`, MUST alert «El PDF está desactualizado» + «Volver a generar PDF». Al clic MUST llamar `CertificationsService.regenerarPdf(id)`, luego re-fetch `obtenerEntregaManual`. MUST NOT rotar token/QR. MUST NOT mostrar `publicValidationUrl` completa post-regen (D0). Errores vía `mensajeErrorApi` sin raw. MUST NOT stub “requiere acción del backend/administrador”.

#### Scenario: Regenerar vía API sin rotar token

- **GIVEN** `pdfStatus === 'outdated'`
- **WHEN** «Volver a generar PDF»
- **THEN** `regenerarPdf(id)` + re-fetch entrega
- **AND** MUST NOT rotar token/QR ni filtrar URL completa; sin raw

#### Scenario: Alert y CTA outdated

- **GIVEN** PDF desactualizado
- **WHEN** abre entrega
- **THEN** alert + botón «Volver a generar PDF»

### REQ-DEL-006: Expediente sin CTA «Entrega manual» (acciones directas)

**Prioridad**: HIGH

**Given** la página de preview de certificación
**When** Bedelía inspecciona el panel Acciones y el panel Enlace de validación
**Then** NO DEBE mostrar el botón «Entrega manual»
**And** DEBE ofrecer Copiar link, Compartir, Descargar PDF y Descargar QR desde el expediente
**And** la ruta `/admin/certificaciones/{id}/entrega` PUEDE seguir existiendo para acceso directo / QA, sin CTA en el expediente

### REQ-DEL-007: Foco y escape en diálogos

**Prioridad**: MEDIUM

**Given** un diálogo o modal abierto en la página de entrega
**When** se presiona Escape
**Then** el diálogo DEBE cerrarse
**And** el foco DEBE retornar al elemento que abrió el diálogo

### REQ-DEL-008: Descargar PDF vía folio institucional

**Prioridad**: HIGH

«Descargar PDF» MUST navegar al folio `…/pdf?descargar=1` (paridad P19). MUST NOT `CertificationsService.descargarPdf` ni Blob TCPDF. Con `navigate=false` (test) MUST NOT mutar `location` y MUST afirmar URL objetivo. Footer: Copiar link + Descargar PDF + Cancelar; QR fuera del footer. Errores handoff: P15-strict sin raw.

#### Scenario: PDF navega folio descargar=1

- **GIVEN** entrega con id válido
- **WHEN** Descargar PDF
- **THEN** URL folio `?descargar=1`; MUST NOT Blob `descargarPdf`

#### Scenario: navigate=false no muta location

- **GIVEN** handoff con `navigate=false`
- **WHEN** Descargar PDF
- **THEN** MUST NOT cambiar `location`; MUST afirmar URL folio `?descargar=1`

#### Scenario: Footer y QR layout

- **GIVEN** diálogo cargado
- **WHEN** se inspecciona layout
- **THEN** footer = Copiar + PDF + Cancelar; QR fuera del footer

### REQ-DEL-009: Carga allSettled con honesty load-only

Carga MUST usar `Promise.allSettled`: `obtener` + `obtenerEntregaManual`. Detalle hard: mensaje fijo *«No se pudo cargar la certificación.»* sin raw `Error.message`. `errorRecuperable` + Reintentar MUST solo en hard recuperable de detalle (Reintentar → recarga). Not-found/id inválido: mensaje controlado sin Reintentar/`errorRecuperable`. Entrega `409`/`TOKEN_NOT_RECOVERABLE` MUST ser soft: si detalle OK, ficha permanece; mensaje bedelía operable (*«No se pudo recuperar el enlace…»*, sin jargon de claves); Copiar/QR off; MUST NOT Reintentar por 409.

#### Scenario: Detalle hard recuperable con Reintentar

- **GIVEN** `obtener` falla recuperable
- **WHEN** termina la carga
- **THEN** mensaje fijo es-AR sin raw; `errorRecuperable=true`; Reintentar recarga

#### Scenario: Not-found sin Reintentar

- **GIVEN** id inválido/ausente/not-found
- **WHEN** carga entrega
- **THEN** mensaje controlado; MUST NOT Reintentar ni `errorRecuperable`

#### Scenario: 409 operable sin tumbar ficha

- **GIVEN** detalle OK y entrega 409/`TOKEN_NOT_RECOVERABLE`
- **WHEN** se renderiza
- **THEN** ficha + mensaje bedelía; Copiar/QR off; MUST NOT Reintentar

### REQ-DEL-010: Honesty P15-strict en QR, PDF y regeneración

Errores de QR, PDF y regen MUST usar `mensajeErrorApi` (P15-strict) o genérico es-AR; MUST NOT raw `Error.message`; MUST NOT `errorRecuperable`/Reintentar de carga. DNI MUST completo si se muestra (D0). MUST NOT filtrar token completo ni `publicValidationUrl` completa en toasts/post-regen (D0).

#### Scenario: Fallo QR controlado

- **GIVEN** `descargarQrPng` falla
- **WHEN** Descargar QR
- **THEN** error inline controlado; diálogo intacto; MUST NOT raw

#### Scenario: Fallo PDF controlado

- **GIVEN** handoff PDF falla
- **WHEN** se captura el error
- **THEN** mensaje `mensajeErrorApi`/genérico; MUST NOT raw ni Reintentar carga

#### Scenario: D0 anti-token y DNI completo

- **GIVEN** ficha visible
- **WHEN** se inspecciona UI/feedback
- **THEN** DNI completo si mostrado; MUST NOT token/URL completa en toasts/post-regen
