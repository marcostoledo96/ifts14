# Especificación — admin-attendances-frontend

## Propósito

Definir la UI administrativa Angular 20 para el camino operativo Curso → Fecha → asistencias y certificados: listado global de cursos, intermedia de fechas, marcado de presentes y, con un solo botón, guardar asistencias + emitir/actualizar certificados del curso. En UI admin, `dniMostrar` muestra DNI completo ficticio (D0 2026-07-20). Entrega desde el hub: descarga PDF y copiar link público (sin SMTP).

## Requirements

### Requirement: Rutas protegidas y entradas de asistencias

El sistema DEBE exponer `/admin/asistencias`, `/admin/asistencias/curso/:id` y `/admin/cursos/:id/fechas/:fechaId/asistencias` bajo admin con sesión. La entrada habitual DEBE seguir siendo detalle de curso → marcado. El listado global DEBE ser acceso secundario y empujar **cursos → intermedia → marcado** (sin filas curso×fecha). Back desde marcado a la intermedia: fuera de alcance.

#### Scenario: Acceso con sesión mock

- **Given** sesión mock activa
- **When** se abre listado, intermedia o marcado
- **Then** DEBE mostrarse la pantalla correspondiente.

#### Scenario: Acceso sin sesión mock

- **Given** sin sesión mock
- **When** se abre una ruta de asistencias
- **Then** DEBE aplicarse la protección admin vigente.

#### Scenario: Entrada desde detalle de curso

- **Given** curso con fechas
- **When** Bedelía elige Abrir fecha / Cargar / Ver y entregar
- **Then** DEBE ir a `/admin/cursos/:id/fechas/:fechaId/asistencias`
- **And** sin fechas, DEBE ofrecer Agregar fecha (sin saltar al hub).

#### Scenario: Camino hub asistencias

- **Given** sesión y cursos en hub
- **When** se usa listado → curso → fecha
- **Then** DEBE recorrer `/admin/asistencias` → `/admin/asistencias/curso/:id` → marcado.

### Requirement: Listado global solo por curso

En `/admin/asistencias` el sistema DEBE listar una fila por curso (no curso×fecha). DEBE buscar por nombre o código. NO DEBE ofrecer chips de estado de fecha. Por fila DEBE mostrar N fechas asistibles (≠ `cancelada`) y PUEDE mostrar cuántas tienen ≥1 presente; NO DEBE usar `alumnosActivos` como total por fila. Cursos sin fechas asistibles DEBEN verse. El CTA DEBE ir a `/admin/asistencias/curso/:id`. DEBE paginar client-side de a 20 cursos (reset al buscar).

#### Scenario: Filas = cursos

- **Given** hub con varios cursos y fechas no canceladas
- **When** se abre `/admin/asistencias`
- **Then** DEBE haber una fila por curso (sin repetir nombre por fecha).

#### Scenario: Búsqueda por nombre o código

- **Given** cursos en el listado
- **When** se busca por fragmento de nombre o código
- **Then** DEBEN quedar solo filas coincidentes.

#### Scenario: Sin chips de estado de fecha

- **Given** el listado global
- **When** se revisan filtros
- **Then** NO DEBEN existir chips `programada`/`realizada` de fecha.

#### Scenario: Métricas honestas

- **Given** curso con N fechas no canceladas y M con presentes
- **When** se ve su fila
- **Then** DEBE mostrar N y PUEDE mostrar M; NO DEBE usar `alumnosActivos` como total.

#### Scenario: Curso sin fechas asistibles

- **Given** curso sin fechas o solo `cancelada`
- **When** se abre el listado y su CTA
- **Then** el curso DEBE verse y la intermedia DEBE mostrar empty claro.

#### Scenario: Paginación de 20

- **Given** hay más de 20 cursos en el resultado filtrado
- **When** se renderiza `/admin/asistencias`
- **Then** DEBE mostrar como máximo 20 filas/cards por página con pager accesible
- **And** al buscar DEBE volver a la página 1.

### Requirement: Agregación lineal de métricas del hub

En `/admin/asistencias`, al derivar métricas por curso desde el hub, el sistema DEBE agregar en tiempo lineal (sin barridos anidados redundantes sobre fechas). DEBE contar fechas asistibles ≠ `cancelada` y fechas con ≥1 presente solo entre asistibles. NO DEBE usar `alumnosActivos` como total por fila. La semántica de N/M DEBE coincidir con «Listado global solo por curso».

#### Scenario: Agregación en tiempo lineal

- DADO un hub con varios cursos y fechas
- CUANDO se carga `/admin/asistencias` y se calculan métricas
- ENTONCES la agregación DEBE completarse en tiempo lineal respecto del tamaño del hub
- Y NO DEBE realizar barridos anidados redundantes por cada curso sobre todas las fechas

#### Scenario: Cancelada excluida del conteo

- DADO un curso con fechas `cancelada` que tienen presentes registrados
- CUANDO se ve su fila en el listado
- ENTONCES esas fechas NO DEBEN sumar a fechas asistibles ni a fechas con presentes

#### Scenario: Sin alumnosActivos como total

- DADO el hub expone `alumnosActivos` por curso
- CUANDO se renderizan las métricas de la fila
- ENTONCES NO DEBE usarse `alumnosActivos` como total N ni M

### Requirement: Página intermedia de fechas del curso

El sistema DEBE exponer `/admin/asistencias/curso/:id` (antes de rutas conflictivas) para elegir fecha asistible. DEBE listar solo fechas ≠ `cancelada` y DEBE mostrar/filtrar `programada`|`realizada`. El CTA DEBE ir a `/admin/cursos/:id/fechas/:fechaId/asistencias` (marcado intacto). Sin fechas asistibles: empty claro y DEBERÍA enlazar a detalle/agregar fecha si aplica. `:id` inválido o curso ausente del hub: error controlado con título/mensaje de no encontrado y solo «Volver a Asistencias» (sin Reintentar). Fallo recuperable de `listarHub`: título/mensaje de carga fallida y DEBE ofrecer Reintentar más Volver. Mensajes/títulos NO DEBEN incluir DNI ni token. NO DEBE exigir cambios de backend/`listarHub`.

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

### Requirement: Hub de fecha — asistencias

El sistema DEBE presentar en `/admin/cursos/:id/fechas/:fechaId/asistencias` la lista de alumnos con toggles presente/ausente y `dniMostrar` completo ficticio. En el lateral DEBE haber un CTA «Ver certificados del curso» hacia `/admin/cursos/:id/fechas/:fechaId/asistencias/certificados`, sin listar certificados en el aside. El botón primario DEBE ser «Guardar y generar certificados». Fallo recuperable de carga: DEBE ofrecer Reintentar. Id/fecha inválidos o not-found: error controlado SIN Reintentar. Fallo de `marcar` con envelope HTTP: DEBE usar `mensajeErrorApi` (incl. 400). Mensajes NO DEBEN incluir DNI ni token. NO DEBE exigir cambios a `HttpAttendanceService.marcar` ni backend.

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

### Requirement: Página de certificados del curso (por fecha)

El sistema DEBE exponer `/admin/cursos/:id/fechas/:fechaId/asistencias/certificados` con el listado filtrado por `cursoId`, botón «Volver a asistencias», y por fila las acciones en este orden: Copiar link, Descargar QR (`descargarQrPng`), Descargar PDF. NO DEBE mostrar token completo.

#### Scenario: Entrega desde página dedicada

- **Given** hay certificados del curso
- **When** Bedelía abre la página de certificados de la fecha
- **Then** DEBE ver la lista completa con link, QR y PDF
- **And** Descargar QR DEBE obtener la imagen PNG del QR de validación oficial.

### Requirement: Guardar y generar certificados

El sistema DEBE, al confirmar «Guardar y generar certificados»: persistir asistencias; para cada presente, emitir si no hay vigente o `regenerarPdf` si hay vigente, **en serie (un await tras otro; NO en paralelo)**; SIN rotar token/QR; redirigir con resumen (emitidos, actualizados, fallidos). Si `fechaClase > hoy` (AR): persistir, NO emitir/regenerar, contar presentes como `fallidos` con mensaje de fecha futura/programada. Sin presentes: CTA deshabilitado o mensaje 400 claro. `regenerado: false` DEBE seguir contando como actualizado. Errores parciales NO DEBEN tumbar el lote. Logs/mensajes sin DNI/token. Token/QR permanente es invariante documentado (vía `pdf-regeneration` / `admin-certificate-emission`; NO rotar ni cambiar esos specs).

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

### Requirement: Carga vigente en reutilización de ruta

El sistema DEBE actualizar datos al navegar entre URLs de marcado reutilizando componente y NO DEBE permitir que cargas u operaciones obsoletas sobrescriban el estado vigente.

#### Scenario: Cambio de URL actualiza datos

- **Given** se está marcando una fecha
- **When** se navega a otra URL de marcado
- **Then** DEBEN cargarse curso, fecha, alumnos y certificados de la URL actual.

#### Scenario: Carga o guardado obsoleto ignorado

- **Given** una carga o guardado anterior termina después de una navegación posterior
- **When** ambas respuestas llegan fuera de orden
- **Then** la respuesta anterior NO DEBE sobrescribir la pantalla actual.

### Requirement: Paridad de estado de fecha en fuente mock de asistencias

El mock de `ATTENDANCE_SOURCE`, al marcar presentes de una fecha, DEBE aplicar la misma regla auto que el backend: si no está `cancelada`, `realizada` solo con ≥1 presente y `fecha <= hoy` (`America/Argentina/Buenos_Aires`); si no, `programada`. DEBE actualizar `fechaEstado` en la respuesta y el estado de la fecha en memoria del curso. DEBE rechazar fechas `cancelada`. La fuente HTTP hereda `fechaEstado` del API sin reimplementar la regla.

#### Scenario: Mock fecha pasada → realizada

- DADO fecha mock `programada` con `fecha < hoy` AR
- CUANDO se marca ≥1 presente
- ENTONCES `fechaEstado` y la fecha del curso DEBEN ser `realizada`

#### Scenario: Mock same-day → realizada

- DADO fecha mock con `fecha == hoy` AR
- CUANDO se marca ≥1 presente
- ENTONCES `fechaEstado` DEBE ser `realizada`

#### Scenario: Mock sin presentes → programada

- DADO fecha mock `realizada` con presentes
- CUANDO se marca con cero presentes
- ENTONCES la fecha en memoria DEBE ser `programada`

### Requirement: Frontera segura

El sistema NO DEBE exponer `X-Admin-Key`, headers admin, storage/cookies inseguros, datos reales, email, token completo, legajo ni matrícula en el roster. DEBE mostrar DNI completo en UI admin (D0). La entrega desde el hub es PDF + link; NO DEBE enviar email SMTP en este flujo.

#### Scenario: Inspección segura

- **Given** se inspecciona el flujo de asistencias/hub
- **When** se revisa código, runtime o bundle
- **Then** NO DEBEN aparecer secretos, token completo ni datos sensibles reales.
- **And** DEBE permitirse DNI completo ficticio en UI admin.
