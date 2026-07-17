# Spec: Paridad expediente certificación (P-12)

Delta visual sobre preview C12. Source of truth: `muestra_pagina/components/admin/expediente-certificacion.tsx`.

### Requirement: REQ-PAR-EXP-001 — Kickers y ficha densos

Kickers MUST usar `font-mono` + uppercase. Kicker de página MUST tracking ~0.16em y color circuit. Group kickers de ficha MUST tracking ~0.13em. Filas de ficha MUST padding horizontal ~1rem y vertical ~0.625rem (paridad `px-4 py-2.5`).

#### Scenario: Encabezado y ficha
- **Given** expediente cargado
- **When** se inspecciona header y ficha
- **Then** existe `.kicker` “Expediente de certificación”
- **And** ficha muestra group kickers Alumno / Curso / Trazabilidad
- **And** filas `.fila-dato` tienen padding horizontal

### Requirement: REQ-PAR-EXP-002 — QR decorativo

QR MUST 8×8 (64 celdas), `aria-hidden="true"`, sin PII. Panel validación MUST nota inferior con borde superior y fondo muted.

#### Scenario: QR sin datos
- **Given** expediente cargado
- **When** se inspecciona `.qr-decorativo`
- **Then** `aria-hidden="true"` y ≥64 `.qr-cell`
- **And** note de validación visible

### Requirement: REQ-PAR-EXP-003 — Acciones y C12

Descargar PDF MUST estilo primary ink. Entrega manual MUST secondary (borde). Copiar/Compartir MUST permanecer habilitados con URL canónica (sin F6-03).

#### Scenario: CTAs
- **Given** vigente con URL entrega
- **When** se inspeccionan acciones
- **Then** Copiar y Compartir enabled
- **And** Entrega manual no usa clase primary PDF
- **And** texto sin `F6-03`

### Requirement: REQ-PAR-EXP-004 — Documento réplica

Documento MUST sin `border-radius` de tarjeta. Firmas MUST copy “Firma digital verificada” (no emoji como único icono).

#### Scenario: Firmas
- **Given** config institucional OK
- **When** se inspeccionan autoridades
- **Then** texto contiene “Firma digital verificada”
- **And** no contiene “Autoridad Demo”
