# Delta de admin-courses-frontend

## ADDED Requirements

### Requirement: Paridad verificable y frontera del listado F4-03

El listado DEBE conservar datos mock institucionalmente seguros y demostrar paridad visual igual o mejor que la referencia v0, sin incorporar backend, red, dependencias, rutas ni acoplamiento con asistencias o certificaciones.

#### Scenario: Evidencia de paridad y privacidad

- **Given** se verifica el listado con datos ficticios
- **When** se capturan sus vistas desktop 1280×800 y mobile 390×844, más carga y error
- **Then** la evidencia DEBE comparar tabla, tarjetas y estados contra v0.
- **And** NO DEBE exhibir DNI, email, token, UUID ni datos reales.

## MODIFIED Requirements

### Requirement: UI contract-ready de cursos y fechas

El sistema DEBE renderizar listado, detalle y editor de cursos con semántica accesible, estados claros y datos ficticios no sensibles solo en memoria. El listado DEBE mostrar cuatrimestre, cantidad derivada de fechas y métricas de presentes/certificaciones como placeholders explícitos; estas últimas NO DEBEN consultar otros features. DEBE ofrecer filtros por búsqueda, los cuatro estados y con/sin fechas, resumen accesible y limpieza de filtros.

(Previously: Renderizaba listado, detalle y editor básicos, sin contrato de paridad responsive, filtros por fechas ni estados de pantalla diferenciados.)

#### Scenario: Listado y detalle navegables

- **Given** hay cursos ficticios en memoria
- **When** se abre el listado o el detalle de un curso
- **Then** DEBEN verse nombre, estado y fechas del curso sin datos reales.

#### Scenario: Edición no persistente de fechas

- **Given** se edita una fecha de curso en el editor
- **When** se guarda el cambio en la UI
- **Then** DEBE reflejarse en memoria durante la sesión actual.
- **And** DEBE informarse que el cambio no persiste al recargar.

#### Scenario: Tabla accesible en desktop

- **Given** existen resultados y el viewport es desktop
- **When** se renderiza el listado
- **Then** DEBE mostrarse una tabla con encabezados, cuatrimestre, fechas, métricas, estado y acciones accesibles.
- **And** presentes/certificaciones DEBEN indicar que el dato depende de integración real.

#### Scenario: Tarjetas de métricas en mobile

- **Given** existen resultados y el viewport es mobile
- **When** se renderiza el listado
- **Then** DEBEN mostrarse tarjetas legibles con sus métricas y acciones equivalentes a desktop.

#### Scenario: Filtros y limpieza

- **Given** se aplican búsqueda, estado y filtro con/sin fechas
- **When** se activa “Limpiar filtros”
- **Then** DEBEN restablecerse los tres filtros y el resumen accesible DEBE anunciar el resultado.

#### Scenario: Carga, error y reintento

- **Given** la obtención del listado está pendiente o falla
- **When** se muestra cada estado
- **Then** DEBEN diferenciarse carga y error seguro, y el error DEBE permitir reintentar.

#### Scenario: Vacío y sin resultados diferenciados

- **Given** no hay cursos o los filtros no encuentran coincidencias
- **When** termina la carga
- **Then** DEBEN mostrarse mensajes distintos para vacío inicial y sin resultados, con limpieza disponible para este último.

#### Scenario: Acciones existentes y handoff

- **Given** un curso aparece en el listado
- **When** se activa “Ver detalle” o “Editar”
- **Then** DEBE navegar a las rutas existentes del curso con nombre accesible.
- **And** la evolución del detalle y sus datos asociados DEBE quedar como handoff de F4-04.
