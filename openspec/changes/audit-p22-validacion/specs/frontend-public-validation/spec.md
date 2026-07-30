# Delta for frontend-public-validation

## ADDED Requirements

### Requirement: Formato de fechas del folio (es-AR)

Para certificados vigentes, la pantalla pública DEBE mostrar `issuedAt` y cada entrada de `attendedDates` en formato `dd/mm/yyyy` (locale es-AR), en paridad con `muestra_pagina`. DEBE NOT mostrar ISO crudo (`YYYY-MM-DD` o timestamps) como texto visible del folio cuando el valor es parseable.

#### Scenario: Fecha de emisión es-AR

- **GIVEN** respuesta `valid` con `issuedAt` parseable (p. ej. `2025-03-10`)
- **WHEN** se renderiza el folio
- **THEN** la fecha de emisión DEBE mostrarse como `dd/mm/yyyy` (p. ej. `10/03/2025`)

#### Scenario: Fechas asistidas es-AR

- **GIVEN** respuesta `valid` con `attendedDates` parseables
- **WHEN** se renderiza la tabla de asistencias
- **THEN** cada fecha DEBE mostrarse como `dd/mm/yyyy`

### Requirement: Staging revocado ≡ no-encontrada (contrato aceptado)

El sistema DEBE tratar el colapso staging/backend «revocado → 404 `CERTIFICATE_NOT_FOUND`» como contrato aceptado (no defecto de front P22). Cuando el envelope trae `CERTIFICATE_REVOKED` (mock u otro), DEBE conservar chrome REVOCADO. DEBE NOT desbloquear ni exigir emisión PHP de `CERTIFICATE_REVOKED` en este ciclo. `RATE_LIMITED` DEBE permanecer fuera de alcance (copy genérico técnico aceptable).

#### Scenario: Staging unificado como no-encontrada

- **GIVEN** verify PHP responde `404 CERTIFICATE_NOT_FOUND` para un token de certificado revocado
- **WHEN** Angular mapea y renderiza
- **THEN** DEBE mostrar chrome no-encontrada / SIN REGISTRO
- **AND** DEBE NOT inventar chrome REVOCADO ni tratarlo como bug de front

#### Scenario: REVOCADO solo con código explícito

- **GIVEN** error/mock con `reason === CERTIFICATE_REVOKED`
- **WHEN** se valida públicamente
- **THEN** DEBE mostrar sello REVOCADO / chrome revocada
- **AND** DEBE NOT revelar el código crudo

### Requirement: Reintentar en no-encontrada y técnico

En estados `not-verifiable` (no-encontrada) y `technical-error`, la pantalla DEBE ofrecer «Reintentar validación» (o equivalente) que recargue la verificación del token de la ruta. DEBE NOT exigir patrón admin `errorRecuperable`.

#### Scenario: Reintentar en no-encontrada

- **GIVEN** estado no-encontrada / SIN REGISTRO
- **WHEN** el usuario activa Reintentar
- **THEN** DEBE relanzar la verificación del token de la ruta

#### Scenario: Reintentar en técnico

- **GIVEN** estado `technical-error`
- **WHEN** el usuario activa Reintentar
- **THEN** DEBE relanzar la verificación sin exponer detalles técnicos

### Requirement: Honesty técnica sin filtración

La pantalla pública DEBE usar copy técnico fijo/controlado. DEBE NOT pegar raw `Error.message`, stack traces, rutas internas, `/api/`, token completo ni DNI en mensajes de error. Certificados vigentes DEBEN seguir mostrando DNI completo (D0).

#### Scenario: Técnico sin raw ni stack

- **GIVEN** falla técnica con `Error.message` o stack simulados
- **WHEN** se renderiza el error técnico
- **THEN** DEBE mostrar copy fijo seguro
- **AND** DEBE NOT incluir raw message, stack, rutas ni `/api/`

#### Scenario: Válida mantiene D0 DNI completo

- **GIVEN** respuesta `valid` con `documentNumber`
- **WHEN** se renderiza el folio
- **THEN** DEBE mostrar DNI completo
- **AND** DEBE NOT pintar el token completo en el DOM del cuerpo
