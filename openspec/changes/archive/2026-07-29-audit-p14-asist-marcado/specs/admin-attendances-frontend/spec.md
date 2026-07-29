# Delta for admin-attendances-frontend

## MODIFIED Requirements

### Requirement: Hub de fecha — asistencias

El sistema DEBE presentar en `/admin/cursos/:id/fechas/:fechaId/asistencias` la lista de alumnos con toggles presente/ausente y `dniMostrar` completo ficticio. En el lateral DEBE haber un CTA «Ver certificados del curso» hacia `/admin/cursos/:id/fechas/:fechaId/asistencias/certificados`, sin listar certificados en el aside. El botón primario DEBE ser «Guardar y generar certificados». Fallo recuperable de carga: DEBE ofrecer Reintentar. Id/fecha inválidos o not-found: error controlado SIN Reintentar. Fallo de `marcar` con envelope HTTP: DEBE usar `mensajeErrorApi` (incl. 400). Mensajes NO DEBEN incluir DNI ni token. NO DEBE exigir cambios a `HttpAttendanceService.marcar` ni backend.
(Previously: sin Reintentar solo recuperable ni mensajeErrorApi en catch de marcar.)

#### Scenario: Marcado de presentes

- **GIVEN** se abre una fecha válida
- **WHEN** se alternan toggles y se guarda
- **THEN** el estado DEBE actualizarse vía `ATTENDANCE_SOURCE`
- **AND** descartar DEBE restaurar el último estado cargado/guardado.

#### Scenario: CTA a certificados del curso

- **GIVEN** se está en el hub de fecha
- **WHEN** se observa el aside
- **THEN** DEBE mostrarse el enlace a certificados
- **AND** NO DEBE listar filas de certificados en el lateral.

#### Scenario: Búsqueda por nombre o documento

- **GIVEN** hay alumnos en el roster
- **WHEN** se busca por apellido, nombre o DNI completo ficticio
- **THEN** DEBE filtrar coincidencias sin enmascarar el documento.

#### Scenario: Fallo recuperable de carga con Reintentar

- **GIVEN** id/fecha válidos y fallo recuperable de carga
- **WHEN** se presenta el error
- **THEN** DEBE ofrecer Reintentar sin DNI/token
- **AND WHEN** se elige Reintentar
- **THEN** DEBE volver a cargar curso, alumnos y asistencias.

#### Scenario: Id o fecha inválidos sin Reintentar

- **GIVEN** `:id`/`:fechaId` inválidos o not-found
- **WHEN** se abre el hub
- **THEN** DEBE mostrar error controlado SIN Reintentar ni DNI/token.

#### Scenario: Envelope 400 al marcar

- **GIVEN** fallo de `marcar` con envelope HTTP 400
- **WHEN** se captura el error
- **THEN** DEBE mostrar el mensaje vía `mensajeErrorApi` sin DNI/token.

### Requirement: Guardar y generar certificados

El sistema DEBE, al confirmar «Guardar y generar certificados»: persistir asistencias; para cada presente, emitir si no hay vigente o `regenerarPdf` si hay vigente, **en serie (un await tras otro; NO en paralelo)**; SIN rotar token/QR; redirigir con resumen (emitidos, actualizados, fallidos). Si `fechaClase > hoy` (AR): persistir, NO emitir/regenerar, contar presentes como `fallidos` con mensaje de fecha futura/programada. Sin presentes: CTA deshabilitado o mensaje 400 claro. `regenerado: false` DEBE seguir contando como actualizado. Errores parciales NO DEBEN tumbar el lote. Logs/mensajes sin DNI/token. Token/QR permanente es invariante documentado (vía `pdf-regeneration` / `admin-certificate-emission`; NO rotar ni cambiar esos specs).
(Previously: sin serie explícita, mensajes fecha futura/sin presentes ni `regenerado:false` as-is.)

#### Scenario: Emisión, regeneración y redirección

- **GIVEN** presentes en fecha ≤ hoy AR
- **WHEN** se pulsa «Guardar y generar certificados»
- **THEN** DEBEN persistirse las asistencias
- **AND** sin vigente DEBE emitir; con vigente DEBE regenerar PDF sin rotar token
- **AND** DEBE navegar a `…/asistencias/certificados`.

#### Scenario: Emisión y regeneración en serie

- **GIVEN** ≥2 presentes a emitir o regenerar
- **WHEN** se ejecuta guardar y generar
- **THEN** cada `emitir`/`regenerarPdf` DEBE completarse antes del siguiente
- **AND** NO DEBEN lanzarse en paralelo (`Promise.all`).

#### Scenario: Fecha futura o programada

- **GIVEN** `fechaClase > hoy` AR y ≥1 presente
- **WHEN** se pulsa «Guardar y generar certificados»
- **THEN** las asistencias DEBEN persistirse
- **AND** NO DEBE llamar `emitir` ni `regenerarPdf`
- **AND** `fallidos` DEBE incluir presentes con mensaje de fecha futura/programada sin DNI/token.

#### Scenario: Sin presentes ni cambios

- **GIVEN** no hay cambios pendientes ni presentes
- **WHEN** se observa el botón primario
- **THEN** DEBE estar deshabilitado.

#### Scenario: Token permanente al regenerar

- **GIVEN** un presente con certificado vigente
- **WHEN** se regenera el PDF
- **THEN** el token/QR NO DEBE rotar (`tokenPrefix` estable).
