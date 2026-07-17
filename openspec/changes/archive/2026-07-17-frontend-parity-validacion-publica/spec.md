# Spec: Paridad validación pública (P-15)

Delta sobre `frontend-public-validation`. Fuente visual: `muestra_pagina/components/validacion/*`.

---

## ADDED Requirements

### Requirement: REQ-PAR-VAL-001 — Folio vigente alineado a v0

El estado `valid` MUST renderizar folio con eyebrow `ACTA DE VALIDACIÓN ACADÉMICA`, banda de estado **dentro** del article (título + `ESTADO: VÁLIDO`), datos alumno (DNI completo D0), curso con campo TIPO presentacional `Certificado de curso`, tabla de asistencias con SEQ padded a 3 dígitos y marca `SÍ`, aside con sello variante válido (`aria-hidden`) y PieControl con monograma `14`. MUST NOT dibujar QR decorativo. MUST NOT mostrar token de la URL.

#### Scenario: Folio válido con D0 y PieControl

- **Given** respuesta `valid` con `documentNumber` y `attendedDates`
- **When** se renderiza la página
- **Then** MUST mostrar ACTA…, DNI completo, fechas, sello VÁLIDO y PieControl
- **And** MUST NOT mostrar token ni QR decorativo

### Requirement: REQ-PAR-VAL-002 — No encontrada (not-verifiable genérico)

Cuando `kind === not-verifiable` y `reason` NO es `CERTIFICATE_REVOKED`, la UI MUST calcar `estado-no-encontrada`: membrete portal, banda ámbar “Sin registro…”, grid + sello `sin-registro`, sugerencias numeradas, PieControl `SIN REGISTRO`. MUST NOT exponer token completo ni códigos de error crudos.

#### Scenario: 404 / expirado / missing → no encontrada

- **Given** `CERTIFICATE_NOT_FOUND` o `CERTIFICATE_EXPIRED`
- **When** se renderiza
- **Then** MUST mostrar chrome de no encontrada + sello sin-registro
- **And** MUST NOT contener `CERTIFICATE_` ni el token de ruta

### Requirement: REQ-PAR-VAL-003 — Revocada cuando el código es explícito

Cuando `kind === not-verifiable` y `reason === CERTIFICATE_REVOKED`, la UI MUST calcar chrome de `estado-revocada` (membrete, banda destructive, sello revocado, PieControl `REVOCADO`) sin inventar alumno/curso/fechas si el envelope no los trae. El mapper sigue entregando `not-verifiable` con `reason` interno.

#### Scenario: Mock demo-revocado

- **Given** error `CERTIFICATE_REVOKED`
- **When** se renderiza
- **Then** MUST mostrar “Certificación revocada” y sello REVOCADO
- **And** MUST NOT inventar nombre de alumno ni DNI

### Requirement: REQ-PAR-VAL-004 — Error técnico documental

El estado técnico MUST calcar chrome de `estado-error` (encabezado sistema, filas de evento presentacionales, CTAs Reintentar/Volver, PieControl) sin stack, sin `/api/`, sin rutas internas. Hora de consulta del cliente; `requestId` solo si existe.

#### Scenario: Error técnico seguro

- **Given** falla de red o `technical-error`
- **When** se renderiza
- **Then** MUST mostrar Reintentar validación y nota de interrupción temporal
- **And** MUST NOT exponer stack ni `/api/`

### Requirement: REQ-PAR-VAL-005 — Mobile 375/390

En viewport ≤390px el folio MUST apilar aside bajo el cuerpo, mostrar N.° de certificado en la línea de consulta del membrete válido, y mantener botones apilados legibles.

#### Scenario: Stack mobile

- **Given** viewport 375px y estado válido
- **When** se inspecciona el layout
- **Then** aside MUST apilar debajo y N.° mobile MUST ser visible
