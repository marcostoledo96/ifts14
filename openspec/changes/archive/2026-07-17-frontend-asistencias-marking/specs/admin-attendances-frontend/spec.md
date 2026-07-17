# Delta for admin-attendances-frontend

Cambio: `frontend-asistencias-marking` — polish de la pantalla de marcado (toggle accesible, selector de fecha inline con guardia de cambios, resumen con dirty). Identificadores REQ-AMARK-*.

## MODIFIED Requirements

### Requirement: Lista y marcado mock en memoria

El sistema DEBE listar cursos/fechas que requieren asistencia y permitir alternar presente/ausente en filas de estudiantes ficticios con `dniMostrar` enmascarado mediante un control **toggle accesible** (`aria-pressed`), NO un checkbox nativo. Los cambios DEBEN vivir solo en memoria y DEBEN poder guardarse o descartarse; Guardar DEBE estar deshabilitado cuando no hay cambios sin guardar.
(Previously: alternaba presentes con checkboxes nativos y Guardar estaba siempre habilitado.)

#### Scenario: Lista de fechas asistibles

- **Given** hay cursos y fechas ficticias en memoria
- **When** se abre `/admin/asistencias`
- **Then** DEBEN verse cursos/fechas disponibles y conteos demostrativos sin datos reales.

#### Scenario: Marcado de presentes con toggle

- **Given** se abre una fecha válida
- **When** se activa el toggle «+ Marcar» de un alumno
- **Then** el botón DEBE pasar a `aria-pressed="true"` con texto «✓ Presente» y el estado DEBE actualizarse solo en memoria.
- **And** Descartar DEBE restaurar el último estado cargado/guardado.

#### Scenario: Guardar deshabilitado sin cambios

- **Given** la selección coincide con la baseline guardada
- **When** se observa la acción Guardar
- **Then** Guardar DEBE estar deshabilitado hasta que exista al menos un cambio.

## ADDED Requirements

### Requirement: REQ-AMARK-02 Selector de fecha inline con guardia de cambios

El sistema DEBE ofrecer un selector «Fecha de la clase» poblado con las fechas del curso; al elegir otra fecha DEBE navegar a `/admin/cursos/:id/fechas/:fechaId/asistencias` (reutilización de componente). Las fechas con estado `cancelada` DEBEN mostrarse deshabilitadas (visibles pero no seleccionables). Si hay cambios sin guardar, el sistema DEBE pedir confirmación antes de cambiar de fecha; si se cancela, NO DEBE navegar ni perder la fecha vigente en el selector.

#### Scenario: Cambio de fecha sin cambios pendientes

- **Given** no hay cambios sin guardar
- **When** se elige otra fecha en el selector
- **Then** DEBE navegarse a la ruta de marcado de esa fecha y recargar sus datos.

#### Scenario: Cambio de fecha con cambios pendientes y confirmación

- **Given** hay cambios sin guardar
- **When** se elige otra fecha y se confirma el descarte
- **Then** DEBE navegarse a la nueva fecha descartando los cambios.

#### Scenario: Cambio de fecha cancelado por el usuario

- **Given** hay cambios sin guardar
- **When** se elige otra fecha y se cancela la confirmación
- **Then** NO DEBE navegarse y el selector DEBE volver a la fecha vigente.

#### Scenario: Fecha cancelada no seleccionable

- **Given** el curso tiene una fecha con estado `cancelada`
- **When** se abre el selector
- **Then** esa opción DEBE verse deshabilitada.

### Requirement: REQ-AMARK-03 Resumen de carga con cambios sin guardar

El sistema DEBE mostrar un resumen con la fecha seleccionada, la cantidad de presentes y los cambios sin guardar (agregados/quitados respecto de la baseline).

#### Scenario: Resumen refleja diferencias

- **Given** se marcan o quitan presentes respecto de la baseline
- **When** cambia la selección
- **Then** el resumen DEBE informar la cantidad de cambios sin guardar y el conteo de presentes vigente.

### Requirement: REQ-AMARK-04 Impacto en certificados fuera de alcance

El sistema NO DEBE mostrar avisos de impacto de certificados ni conteos de reentrega en esta pantalla, por ausencia de contrato/endpoint real; el gap DEBE quedar documentado como non-goal con handoff a backend.

#### Scenario: Sin aviso de impacto inventado

- **Given** se edita la asistencia de una fecha
- **When** se revisa la pantalla de marcado
- **Then** NO DEBE aparecer aviso de impacto de certificados ni conteo de reentrega.
