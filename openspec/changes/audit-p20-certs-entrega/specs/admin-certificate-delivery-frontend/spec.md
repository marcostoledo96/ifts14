# Delta for admin-certificate-delivery-frontend

## ADDED Requirements

### Requirement: Carga allSettled con honesty load-only

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

### Requirement: Honesty P15-strict en QR, PDF y regeneración

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

## MODIFIED Requirements

### Requirement: REQ-DEL-005: Botón "Volver a generar"

**Prioridad**: MEDIUM

Si `pdfStatus === 'outdated'`, MUST alert «El PDF está desactualizado» + «Volver a generar PDF». Al clic MUST llamar `CertificationsService.regenerarPdf(id)`, luego re-fetch `obtenerEntregaManual`. MUST NOT rotar token/QR. MUST NOT mostrar `publicValidationUrl` completa post-regen (D0). Errores vía `mensajeErrorApi` sin raw. MUST NOT stub “requiere acción del backend/administrador”.
(Previously: stub MVP sin seam `regenerarPdf`.)

#### Scenario: Regenerar vía API sin rotar token

- **GIVEN** `pdfStatus === 'outdated'`
- **WHEN** «Volver a generar PDF»
- **THEN** `regenerarPdf(id)` + re-fetch entrega
- **AND** MUST NOT rotar token/QR ni filtrar URL completa; sin raw

#### Scenario: Alert y CTA outdated

- **GIVEN** PDF desactualizado
- **WHEN** abre entrega
- **THEN** alert + botón «Volver a generar PDF»

### Requirement: REQ-DEL-008: Descargar PDF vía folio institucional

**Prioridad**: HIGH

«Descargar PDF» MUST navegar al folio `…/pdf?descargar=1` (paridad P19). MUST NOT `CertificationsService.descargarPdf` ni Blob TCPDF. Con `navigate=false` (test) MUST NOT mutar `location` y MUST afirmar URL objetivo. Footer: Copiar link + Descargar PDF + Cancelar; QR fuera del footer. Errores handoff: P15-strict sin raw.
(Previously: Blob vía `descargarPdf(id)` P-13; contradecía folio.)

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
