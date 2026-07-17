# Spec: Editor de curso — paridad v0 con contrato estricto

## Purpose

Portar el editor de curso a la referencia v0 (grid + aside sticky, tabla de fechas con índice, toggle de estado, aviso de impacto) exponiendo solo los campos que el backend persiste (`codigo`, `nombre`, `estado`, fechas `fecha/descripcion/orden/estado`).

## Non-goals

Inputs fantasma (descripción/carga horaria/modalidad de curso, horario time, badge Emitidos/Sin emitir, checkbox de nueva entrega, creado_por, firma hash); edición de nombre/código; cambios backend/DB; PATCH post-create de estado.

## Requirements

### REQ-CEDIT-001: Layout grid con aside sticky

El editor MUST renderizar en pantallas anchas una grilla de dos columnas: contenido principal (datos + fechas) y un aside con acciones (Guardar/Cancelar) y metadatos, sticky respecto del scroll. En pantallas angostas MUST apilarse en una columna sin pérdida de funciones.

#### Scenario: Estructura presente

- GIVEN el editor cargado en modo create o edit
- WHEN se inspecciona el DOM
- THEN MUST existir el contenedor de grilla (`.editor-grid`) con una columna principal y un `aside` con las acciones de guardado

### REQ-CEDIT-002: Alta honesta (backend crea activo)

En modo create, el formulario MUST pedir solo código y nombre (obligatorios) y MUST comunicar que el curso se crea en estado `activo` (el backend ignora `estado` del body). MUST NOT ofrecer selector ni toggle de estado en create.

#### Scenario: Create sin selector de estado

- GIVEN el editor en modo create
- WHEN se inspecciona el formulario
- THEN MUST haber inputs de código y nombre y MUST NOT haber control de estado editable
- AND el texto MUST indicar que el curso se crea activo

#### Scenario: Validación de obligatorios

- GIVEN código o nombre vacíos
- WHEN se envía el formulario
- THEN MUST mostrarse un error de validación sin llamar al servicio

### REQ-CEDIT-003: Edición con identidad read-only

En modo edit, código y nombre MUST mostrarse como solo lectura (sin endpoint de actualización). El estado del curso MUST mostrarse mediante el toggle "Curso activo" y el badge/metadata correspondiente.

#### Scenario: Campos deshabilitados

- GIVEN el editor en modo edit con un curso cargado
- WHEN se inspeccionan los campos de código y nombre
- THEN MUST estar deshabilitados o presentarse como texto no editable

### REQ-CEDIT-004: Toggle de estado persistente

En modo edit, el editor MUST ofrecer un switch accesible (`role="switch"`, `aria-checked`) "Curso activo" con semántica binaria honesta sobre los 4 estados backend: encendido mapea a `activo`; apagado mapea a `cerrado` solo si el estado original era `activo`; si el estado original era `borrador`, `cerrado` o `archivado` y el toggle no se enciende, MUST conservarse el estado original. Al guardar, si el estado resultante difiere del original, MUST invocarse `actualizarEstado` (PATCH `/admin/cursos/{id}/estado`); si no difiere, MUST NOT invocarse.

#### Scenario: Desactivar curso activo

- GIVEN un curso con estado `activo`
- WHEN se apaga el toggle y se guarda
- THEN MUST llamarse `actualizarEstado(id, 'cerrado')`

#### Scenario: Guardar sin tocar el toggle

- GIVEN un curso con estado `archivado`
- WHEN se guarda sin encender el toggle
- THEN MUST NOT llamarse `actualizarEstado`

#### Scenario: Reactivar curso

- GIVEN un curso con estado `cerrado`
- WHEN se enciende el toggle y se guarda
- THEN MUST llamarse `actualizarEstado(id, 'activo')`

### REQ-CEDIT-005: Tabla de fechas con índice

La sección de fechas MUST listar cada fecha con: índice ordinal `#` (dos dígitos, `01`, `02`, …), input date, descripción opcional y estado (`programada`/`realizada`/`cancelada`). MUST NOT mostrar horario (time) ni badge de certificados emitidos. El contador de fechas MUST reflejar la cantidad actual.

#### Scenario: Índice visible

- GIVEN un curso con 3 fechas
- WHEN se renderiza la sección de fechas
- THEN MUST verse los índices `01`, `02` y `03` junto a cada fila

#### Scenario: Sin campos fantasma

- GIVEN la sección de fechas
- WHEN se inspecciona el DOM
- THEN MUST NOT existir `input[type="time"]` ni badges de emitidos

### REQ-CEDIT-006: Aviso de impacto condicional

En modo edit, cuando el borrador local modifica (fecha, descripción o estado) o quita una fecha cuyo estado original es `realizada`, el editor MUST mostrar un aviso no bloqueante explicando que los certificados asociados requerirán regenerar su PDF (el QR no cambia). Si ninguna fecha `realizada` fue tocada, el aviso MUST NOT mostrarse.

#### Scenario: Quitar fecha realizada

- GIVEN un curso con una fecha en estado `realizada`
- WHEN se quita esa fecha del borrador
- THEN MUST mostrarse el aviso de impacto

#### Scenario: Sin cambios sobre realizadas

- GIVEN el mismo curso recién cargado
- WHEN no se modifica ninguna fecha `realizada`
- THEN MUST NOT mostrarse el aviso

### REQ-CEDIT-007: Guardar en edición persiste estado y fechas

`guardar()` en modo edit MUST ejecutar, en este orden: `actualizarEstado` solo si el estado resultante difiere del original, y luego `reemplazarFechas` con el set del borrador. Ante error MUST mostrarse el mensaje sin fingir éxito. Tras éxito MUST mostrarse confirmación y refrescarse el detalle local (estado y fechas).

#### Scenario: Guardado completo

- GIVEN un curso `activo` con toggle apagado y una fecha agregada
- WHEN se guarda
- THEN MUST llamarse `actualizarEstado(id, 'cerrado')` y `reemplazarFechas(id, drafts)` y mostrarse confirmación

### REQ-CEDIT-008: Metadatos honestos en aside

En modo edit el aside MUST mostrar solo metadatos reales: código, estado actual y fechas de creación/última actualización (`createdAt`/`updatedAt`). MUST NOT mostrar creado_por, firma/hash ni conteos de alumnos inventados. En modo create MUST mostrarse una nota de que el identificador se genera al guardar.

#### Scenario: Metadata en edición

- GIVEN un curso cargado en edit
- WHEN se inspecciona el aside
- THEN MUST verse código, estado y timestamps del curso
- AND MUST NOT verse "Creado por" ni "Firma"
