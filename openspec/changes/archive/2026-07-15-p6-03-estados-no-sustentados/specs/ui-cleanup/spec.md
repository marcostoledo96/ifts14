# Spec: UI Cleanup (P6-03)

## Capability: `ui-cleanup`

### REQ-CLEAN-001: Eliminar TipoEnvio del modelo

**Prioridad**: HIGH

**Given** el modelo `Certificacion` en `certifications.models.ts`  
**When** se inspecciona la interfaz  
**Then** NO DEBE contener el campo `envio: TipoEnvio`  
**And** NO DEBE existir el tipo `TipoEnvio`

### REQ-CLEAN-002: Eliminar filtros de envío del listado

**Prioridad**: HIGH

**Given** la página de listado de certificaciones  
**When** se renderiza  
**Then** NO DEBE mostrar chips de filtro de entrega  
**And** NO DEBE tener columna "Entrega" en la tabla

### REQ-CLEAN-003: Suprimir "firma digital verificada"

**Prioridad**: MEDIUM

**Given** las páginas de preview y PDF preview de certificación  
**When** se renderizan  
**Then** NO DEBEN contener el texto "firma digital verificada"

### REQ-CLEAN-004: Suprimir "validez legal"

**Prioridad**: MEDIUM

**Given** las páginas de preview y PDF preview  
**When** se renderizan  
**Then** NO DEBEN contener textos de "validez legal" o "validez legal y académica"
