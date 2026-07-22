# Delta for admin-attendances-frontend

Cambio: `frontend-asistencias-listado-por-curso` — hub cursos → fechas → marcado (Opción A). Sin API.

## ADDED Requirements

### Requirement: Listado global solo por curso

En `/admin/asistencias` el sistema DEBE listar una fila por curso (no curso×fecha). DEBE buscar por nombre o código. NO DEBE ofrecer chips de estado de fecha. Por fila DEBE mostrar N fechas asistibles (≠ `cancelada`) y PUEDE mostrar cuántas tienen ≥1 presente; NO DEBE usar `alumnosActivos` como total por fila. Cursos sin fechas asistibles DEBEN verse. El CTA DEBE ir a `/admin/asistencias/curso/:id`.

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

### Requirement: Página intermedia de fechas del curso

El sistema DEBE exponer `/admin/asistencias/curso/:id` (antes de rutas conflictivas) para elegir fecha asistible. DEBE listar solo fechas ≠ `cancelada` y DEBE mostrar/filtrar `programada`|`realizada`. El CTA DEBE ir a `/admin/cursos/:id/fechas/:fechaId/asistencias` (marcado intacto). Sin fechas asistibles: empty claro y DEBERÍA enlazar a detalle/agregar fecha si aplica. `:id` ausente: error controlado. NO DEBE exigir cambios de backend/`listarHub`.

#### Scenario: Fechas asistibles

- **Given** curso con `programada`, `realizada` y `cancelada`
- **When** se abre la intermedia
- **Then** DEBEN listarse solo no canceladas y DEBE distinguirse/filtrarse estado.

#### Scenario: CTA al marcado

- **Given** fecha asistible en la intermedia
- **When** se activa el CTA
- **Then** DEBE navegar a `/admin/cursos/:id/fechas/:fechaId/asistencias`.

#### Scenario: Empty sin fechas

- **Given** curso sin fechas no canceladas
- **When** se abre la intermedia
- **Then** empty claro; DEBERÍA ofrecer enlace a detalle/agregar fecha si aplica.

#### Scenario: Curso inexistente

- **Given** `:id` ausente en el hub
- **When** se abre la intermedia
- **Then** error controlado sin tumbar el panel.

#### Scenario: Orden de ruta

- **Given** rutas admin de asistencias
- **When** se resuelve `/admin/asistencias/curso/:id`
- **Then** DEBE activarse la intermedia (no otra ruta).

## MODIFIED Requirements

### Requirement: Rutas protegidas y entradas de asistencias

El sistema DEBE exponer `/admin/asistencias`, `/admin/asistencias/curso/:id` y `/admin/cursos/:id/fechas/:fechaId/asistencias` bajo admin con sesión. La entrada habitual DEBE seguir siendo detalle de curso → marcado. El listado global DEBE ser acceso secundario y empujar **cursos → intermedia → marcado** (sin filas curso×fecha). Back desde marcado a la intermedia: fuera de alcance.
(Previously: solo listado + marcado; listado empujaba Cursos→fecha sin intermedia ni solo-cursos.)

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
