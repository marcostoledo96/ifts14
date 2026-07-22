# Delta for admin-master-data-api

## ADDED Requirements

### Requirement: Auto-gestión de estado de fecha tras escritura de asistencias

Tras registrar o anular lógicamente una asistencia, si la fecha no está `cancelada`, la API DEBE recalcular y persistir su `estado` con día local `America/Argentina/Buenos_Aires` (`Y-m-d`): `realizada` solo si hay ≥1 asistencia activa y `fecha < hoy`; si no, `programada`. NO DEBE inferir ni modificar `cancelada`. Si el estado entra o sale de `realizada`, DEBE conservar el sync de snapshots / `pdf_estado=desactualizado` vigente. NO DEBE agregar cron ni refresh en `emitir` en este ciclo. Un write de asistencia posterior DEBE reaplicar la regla (p. ej. same-day vuelve a `programada` tras override manual).

#### Scenario: Fecha pasada con presente → realizada

- DADO fecha no cancelada con `fecha < hoy` AR
- CUANDO se registra ≥1 asistencia activa
- ENTONCES el estado DEBE ser `realizada` y DEBE correr sync si hay certificados vigentes afectados

#### Scenario: Same-day o futura → programada

- DADO fecha no cancelada con `fecha >= hoy` AR
- CUANDO se registra ≥1 asistencia activa
- ENTONCES el estado DEBE ser `programada`

#### Scenario: Anular todos → programada

- DADO fecha `realizada` con una asistencia activa
- CUANDO se anula esa asistencia
- ENTONCES el estado DEBE ser `programada` y DEBE correr sync de snapshots afectados

#### Scenario: Cancelada intacta

- DADO fecha `cancelada`
- CUANDO se intenta registrar asistencia
- ENTONCES DEBE rechazarse y el estado DEBE permanecer `cancelada`
