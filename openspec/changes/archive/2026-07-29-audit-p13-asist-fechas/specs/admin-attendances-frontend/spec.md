# Delta for admin-attendances-frontend

## MODIFIED Requirements

### Requirement: Página intermedia de fechas del curso

El sistema DEBE exponer `/admin/asistencias/curso/:id` (antes de rutas conflictivas) para elegir fecha asistible. DEBE listar solo fechas ≠ `cancelada` y DEBE mostrar/filtrar `programada`|`realizada`. El CTA DEBE ir a `/admin/cursos/:id/fechas/:fechaId/asistencias` (marcado intacto). Sin fechas asistibles: empty claro y DEBERÍA enlazar a detalle/agregar fecha si aplica. `:id` inválido o curso ausente del hub: error controlado con título/mensaje de no encontrado y solo «Volver a Asistencias» (sin Reintentar). Fallo recuperable de `listarHub`: título/mensaje de carga fallida y DEBE ofrecer Reintentar más Volver. Mensajes/títulos NO DEBEN incluir DNI ni token. NO DEBE exigir cambios de backend/`listarHub`.
(Previously: error controlado en curso inexistente sin exigir Reintentar solo recuperable ni título distinto not-found vs carga.)

#### Scenario: Fechas asistibles

- **GIVEN** curso con `programada`, `realizada` y `cancelada`
- **WHEN** se abre la intermedia
- **THEN** DEBEN listarse solo no canceladas y DEBE distinguirse/filtrarse estado.

#### Scenario: CTA al marcado

- **GIVEN** fecha asistible en la intermedia
- **WHEN** se activa el CTA
- **THEN** DEBE navegar a `/admin/cursos/:id/fechas/:fechaId/asistencias`.

#### Scenario: Empty sin fechas

- **GIVEN** curso sin fechas no canceladas
- **WHEN** se abre la intermedia
- **THEN** empty claro; DEBERÍA ofrecer enlace a detalle/agregar fecha si aplica.

#### Scenario: Curso inexistente o id inválido sin Reintentar

- **GIVEN** `:id` ausente en el hub o id no numérico/ inválido
- **WHEN** se abre la intermedia
- **THEN** DEBE mostrar error controlado con título de curso no encontrado
- **AND** DEBE ofrecer Volver a Asistencias sin Reintentar
- **AND** NO DEBE tumbar el panel ni incluir DNI/token.

#### Scenario: Fallo recuperable con Reintentar

- **GIVEN** id numérico válido y fallo recuperable de `listarHub`
- **WHEN** se presenta el error
- **THEN** DEBE mostrar título de carga fallida, Reintentar y Volver a Asistencias sin DNI/token
- **AND WHEN** el operador elige Reintentar
- **THEN** DEBE volver a solicitar el hub.

#### Scenario: Orden de ruta

- **GIVEN** rutas admin de asistencias
- **WHEN** se resuelve `/admin/asistencias/curso/:id`
- **THEN** DEBE activarse la intermedia (no otra ruta).
