# Spec — frontend-public-validation

## Purpose

Definir el flujo público de validación por token con estados ficticios, alineado al contrato backend y sin exposición de datos sensibles. La pantalla pública muestra DNI completo visible y fechas asistidas del curso para certificados vigentes, según decisión institucional documentada. Paridad visual P-15 con `muestra_pagina/components/validacion/*`.

## Requirements

### Requirement: Ruta pública de validación

El sistema DEBE exponer una pantalla pública para `/certificados/validar/:tokenCertificacion` que lea el token desde la ruta y muestre el estado de validación correspondiente. Para certificados vigentes, la pantalla DEBE mostrar certificado verificable, curso, fecha de emisión, DNI completo visible y fechas asistidas del curso, usando datos ficticios o el contrato real alineado.

#### Scenario: Certificado válido ficticio

- **Dado** un token de mock marcado como vigente
- **Cuando** se abre la ruta pública de validación
- **Entonces** la pantalla DEBE mostrar certificación válida, curso, fecha, DNI completo y fechas asistidas.
- **Y** NO DEBE mostrar token completo ni datos reales.

#### Scenario: Certificado legado con documentMasked

- **Dado** una respuesta pública legada con `documentMasked` y sin `attendedDates`
- **Cuando** el mapper valida el DTO
- **Entonces** la pantalla DEBE mostrar el documento enmascarado y omitir el bloque de fechas asistidas.
- **Y** NO DEBE colapsar a error técnico por ausencia de `documentNumber`.

#### Scenario: Certificado revocado con código explícito

- **Dado** un error `CERTIFICATE_REVOKED` (mock o futuro contrato)
- **Cuando** se valida públicamente
- **Entonces** la pantalla DEBE mostrar chrome de certificación revocada (sello REVOCADO) sin inventar alumno/curso.
- **Y** NO DEBE revelar el código de error crudo `CERTIFICATE_REVOKED`.

#### Scenario: Certificado no encontrado

- **Dado** un token de mock inexistente (`CERTIFICATE_NOT_FOUND`)
- **Cuando** se valida públicamente
- **Entonces** la pantalla DEBE mostrar certificación no encontrada / SIN REGISTRO.
- **Nota:** el backend PHP actual filtra revocados como no encontrados; en ese caso la UI muestra no encontrada.

#### Scenario: Error técnico distinguible

- **Dado** una falla técnica simulada
- **Cuando** la validación no puede completarse
- **Entonces** la pantalla DEBE mostrar un error técnico documental seguro, distinto del estado no verificable.
- **Y** NO DEBE exponer stack traces, rutas internas ni detalles de infraestructura.

### Requirement: Flujo público sin credenciales ni datos adicionales

La validación pública NO DEBE pedir DNI completo, login, clave administrativa ni campos adicionales para validar el token recibido.

#### Scenario: Consulta pública mínima

- **Dado** una persona externa que escanea un QR futuro
- **Cuando** llega a la ruta de validación
- **Entonces** el token de la URL DEBE ser suficiente para iniciar la verificación pública.

### Requirement: Confirmación pública D0 sin cambio visual

La validación pública DEBE confirmar el contrato D0 vigente: certificados vigentes muestran DNI completo sólo en la pantalla pública y fechas asistidas; certificados inexistentes, vencidos o inválidos por formato se presentan como no encontrados cuando corresponda; revocados con código explícito muestran chrome revocada.

#### Scenario: Certificado D0 verificable

- **Dado** una respuesta pública D0 de la API PHP con `documentNumber` y `attendedDates`
- **Cuando** Angular mapea el resultado de validación
- **Entonces** DEBE mostrar certificación válida, DNI completo público y fechas asistidas.
- **Y** NO DEBE mostrar token completo ni datos administrativos.

#### Scenario: No encontrado por 404

- **Dado** una respuesta `404 CERTIFICATE_NOT_FOUND` para un token ficticio
- **Cuando** Angular mapea el error
- **Entonces** DEBE mostrar estado no encontrada, no error técnico.
- **Y** NO DEBE revelar códigos de error crudos.

### Requirement: Layout folio con sidebar (validación pública refinada)

La pantalla pública DEBE renderizar un layout grid de 2 columnas para certificados vigentes: contenido principal (folio, alumno, DNI completo, curso, TIPO, tabla de fechas asistidas, fecha de emisión, código de certificado) y sidebar con trazabilidad (código, timestamp de consulta del cliente, sello oficial decorativo). En mobile, el sidebar DEBE apilar debajo del contenido principal. El ancho del contenedor DEBE usar `--layout-page-max` (56rem) para paridad con v0 `max-w-4xl`.

#### Scenario: Certificado vigente en desktop

- **Dado** una respuesta `valid` con datos completos
- **Cuando** se renderiza la página con viewport desktop
- **Entonces** la pantalla DEBE mostrar grid de 2 columnas (principal + sidebar).
- **Y** el sidebar DEBE incluir código, timestamp de consulta (cliente) y sello oficial decorativo marcado `aria-hidden`.
- **Y** el PieControl DEBE mostrar monograma `14` y `ESTADO DE REGISTRO: VÁLIDO`.

#### Scenario: Certificado vigente en mobile

- **Dado** una respuesta `valid` con datos completos
- **Cuando** se renderiza la página con viewport mobile (≤390px)
- **Entonces** el sidebar DEBE apilar debajo del contenido principal sin perder legibilidad.
- **Y** el N.° de certificado DEBE aparecer en la línea de consulta del membrete.

### Requirement: Membrete institucional del folio

El folio vigente y el de revocada DEBEN usar el eyebrow `ACTA DE VALIDACIÓN ACADÉMICA`. El estado no encontrada DEBE usar `PORTAL DE VALIDACIÓN`. El header de página (`HeaderInstitucional`) ya identifica IFTS N.° 14.

#### Scenario: Membrete ACTA en página válida

- **Dado** una respuesta `valid`
- **Cuando** se renderiza la página
- **Entonces** el folio DEBE incluir `ACTA DE VALIDACIÓN ACADÉMICA`.

#### Scenario: Membrete portal en no encontrada

- **Dado** una respuesta `not-verifiable` genérica
- **Cuando** se renderiza la página
- **Entonces** el folio DEBE incluir `PORTAL DE VALIDACIÓN`.

### Requirement: Estados no válidos con cuerpo editorial

La pantalla pública DEBE mostrar, para `not-verifiable` (no encontrada / revocada) y error técnico, banda de estado embebida y cuerpo editorial alineado a v0, sin exponer detalles operativos, de infraestructura ni trazas técnicas.

#### Scenario: Cuerpo editorial en no encontrada

- **Dado** una respuesta `not-verifiable` no-revocada
- **Cuando** se renderiza la página
- **Entonces** la pantalla DEBE mostrar banda ámbar, sugerencias numeradas y sello SIN REGISTRO.

#### Scenario: Cuerpo editorial en revocada

- **Dado** `reason === CERTIFICATE_REVOKED`
- **Cuando** se renderiza la página
- **Entonces** la pantalla DEBE mostrar banda destructive, sello REVOCADO y PieControl REVOCADO sin inventar alumno/curso.

#### Scenario: Cuerpo editorial en error técnico

- **Dado** una respuesta `technical-error`
- **Cuando** se renderiza la página
- **Entonces** la pantalla DEBE mostrar chrome documental de error con Reintentar.
- **Y** NO DEBE exponer stack traces, rutas internas ni detalles de infraestructura.

### Requirement: Sin QR decorativo en la página pública

La pantalla pública NO DEBE dibujar un QR falso ni decorativo en ningún estado de validación. La verificación real ocurre en backend contra el token de la URL.

#### Scenario: Página sin QR decorativo

- **Dado** cualquier estado de validación (`valid`, `not-verifiable`, `technical-error`)
- **Cuando** se renderiza la página
- **Entonces** la pantalla NO DEBE mostrar un QR falso o decorativo.
- **Y** la verificación DEBE seguir basándose en el token de la ruta.

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
