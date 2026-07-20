# Delta for admin-attendances-frontend

## ADDED Requirements

### Requirement: Paridad de estado de fecha en fuente mock de asistencias

El mock de `ATTENDANCE_SOURCE`, al marcar presentes de una fecha, DEBE aplicar la misma regla auto que el backend: si no está `cancelada`, `realizada` solo con ≥1 presente y `fecha < hoy` (`America/Argentina/Buenos_Aires`); si no, `programada`. DEBE actualizar `fechaEstado` en la respuesta y el estado de la fecha en memoria del curso. DEBE rechazar fechas `cancelada`. La fuente HTTP hereda `fechaEstado` del API sin reimplementar la regla.

#### Scenario: Mock fecha pasada → realizada

- DADO fecha mock `programada` con `fecha < hoy` AR
- CUANDO se marca ≥1 presente
- ENTONCES `fechaEstado` y la fecha del curso DEBEN ser `realizada`

#### Scenario: Mock same-day → programada

- DADO fecha mock con `fecha == hoy` AR
- CUANDO se marca ≥1 presente
- ENTONCES `fechaEstado` DEBE ser `programada`

#### Scenario: Mock sin presentes → programada

- DADO fecha mock `realizada` con presentes
- CUANDO se marca con cero presentes
- ENTONCES la fecha en memoria DEBE ser `programada`
