# Spec: PDF Regeneration (P6-02)

## Capability: `pdf-regeneration`

### REQ-REGEN-001: Regenerar PDF con mismo token

**Prioridad**: CRITICAL

**Given** un certificado emitido con PDF desactualizado (`pdf_estado !== 'vigente'`)  
**When** el admin solicita regeneración vía `POST /admin/certificados/{id}/regenerar-pdf`  
**Then** el backend DEBE regenerar el PDF usando el mismo token (no rotar)  
**And** DEBE actualizar `pdf_estado = 'vigente'` y `pdf_generado_revision = contenido_revision`  
**And** DEBE devolver los datos de entrega (`publicValidationUrl`, `pdfDownloadUrl`, `pdfStatus`)

### REQ-REGEN-002: Rechazar regeneración si PDF vigente

**Prioridad**: HIGH

**Given** un certificado con PDF ya vigente y revisiones alineadas  
**When** se solicita regeneración  
**Then** el backend DEBE responder `200` con `{ regenerado: false, mensaje: "El PDF ya está actualizado" }`

### REQ-REGEN-003: Botón en preview dispara regeneración

**Prioridad**: CRITICAL

**Given** la página de preview de certificación  
**When** el admin hace clic en "Regenerar PDF"  
**Then** el frontend DEBE llamar a `POST /admin/certificados/{id}/regenerar-pdf`  
**And** en éxito DEBE mostrar los datos de entrega actualizados  
**And** en error DEBE mostrar mensaje descriptivo

### REQ-REGEN-004: Auditoría de regeneración

**Prioridad**: MEDIUM

**Given** una regeneración exitosa  
**When** se completa la operación  
**Then** el backend DEBE registrar el evento en la tabla de auditoría con `accion = 'pdf_regenerado'`
