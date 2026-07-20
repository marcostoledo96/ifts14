# Delta for admin-certificate-emission

## ADDED Requirements

### Requirement: Definición de asistencias certificables

«Asistencias activas certificables» DEBEN ser filas con `eliminado_en` NULL en fechas con estado `realizada`. Fechas `programada`/`cancelada` NO DEBEN entrar al snapshot. NO DEBE haber refresh de estado de fecha en `emitir` en este ciclo (diferido).

#### Scenario: Solo realizadas en el snapshot

- DADO asistencias activas en una fecha `realizada` y otra `programada`
- CUANDO se emite
- ENTONCES el snapshot DEBE incluir solo la `realizada` y responder `201`

#### Scenario: Solo programada no certifica

- DADO asistencias activas solo en fechas `programada`
- CUANDO se emite
- ENTONCES DEBE responder `400 VALIDATION_ERROR` sin persistir

## MODIFIED Requirements

### Requirement: Snapshot de emisión inmutable

El sistema DEBE crear el snapshot en `cert_certificado_fechas` solo con asistencias activas certificables (fecha `realizada`, `eliminado_en` NULL) al emitir y DEBE usarlo luego para validación pública y PDF institucional.
(Previously: «asistencias activas» sin exigir estado `realizada` de la fecha.)

#### Scenario: Asistencia anulada después de emitir

- DADO un certificado emitido con snapshot
- CUANDO una asistencia viva se elimina o cambia después
- ENTONCES validación y PDF institucional DEBEN conservar las fechas certificadas originales.
