# Spec: Validación Pública Refinada (P6-04)

## Capability: `public-validation-refined`

### REQ-VAL-001: Layout folio con sidebar

**Prioridad**: HIGH

**Given** un certificado válido  
**When** se renderiza la página de validación  
**Then** DEBE usar layout grid de 2 columnas (principal + sidebar)  
**And** en mobile DEBE apilar sidebar debajo del contenido principal

### REQ-VAL-002: Datos completos del certificado

**Prioridad**: CRITICAL

**Given** un certificado válido  
**When** se muestra la información  
**Then** DEBE incluir: nombre del alumno, DNI completo, nombre del curso, código de certificado, fechas asistidas (tabla), fecha de emisión

### REQ-VAL-003: Membrete institucional

**Prioridad**: MEDIUM

**Given** la página de validación  
**When** se renderiza  
**Then** DEBE mostrar membrete "IFTS N.° 14 — Bedelía"

### REQ-VAL-004: Sidebar con trazabilidad

**Prioridad**: MEDIUM

**Given** un certificado válido  
**When** se renderiza el sidebar  
**Then** DEBE mostrar: folio del certificado, timestamp de consulta (cliente), sello oficial decorativo (`aria-hidden`)

### REQ-VAL-005: Estados no-válidos con cuerpo editorial

**Prioridad**: MEDIUM

**Given** un certificado no verificable o con error técnico  
**When** se renderiza  
**Then** DEBE mostrar la banda de estado Y un cuerpo editorial explicativo

### REQ-VAL-006: Sin QR decorativo

**Prioridad**: HIGH

**Given** cualquier estado de validación  
**When** se renderiza la página  
**Then** NO DEBE dibujar un QR falso o decorativo
