# Spec: Lista de cursos — UI polish

## Purpose

Paridad visual/a11y del listado `/admin/cursos` respecto de v0, adaptada al contrato real de 4 estados, sin inventar métricas ni tocar backend.

## Non-goals

Agregados Presentes/Certificaciones; N+1; cambios PHP/DB/API; fabricar conteos en seed; port React/lucide; vista QA; shell/sidebar.

## Requirements

### REQ-CLIST-001: Chips de estado con dots

MUST reemplazar el `<select>` de estado por chips toggle mutuos exclusivos (`aria-pressed`) para `borrador`, `activo`, `cerrado` y `archivado`, cada uno con indicador dot. Labels: Borrador / Activos / Cerrados / Archivados. MUST usar toggle single: segundo click del chip activo limpia el filtro (`todos`). MUST NOT usar filtro binario Activos/Inactivos de v0.

#### Scenario: Filtrar por Activos

- GIVEN listado con seed mixto
- WHEN se activa el chip Activos
- THEN MUST mostrar solo cursos `estado === 'activo'`
- AND el chip MUST tener `aria-pressed="true"`

#### Scenario: Toggle off

- GIVEN chip Activos activo
- WHEN se vuelve a activar el mismo chip
- THEN MUST limpiar el filtro de estado (`todos`) y listar sin restricción de estado

#### Scenario: Sin select

- GIVEN se renderiza el listado
- WHEN se inspecciona el filtro de estado
- THEN MUST NOT existir `<select>` de estado
- AND MUST existir botones chip con `data-estado`

### REQ-CLIST-002: Chips Con/Sin fechas

MUST mantener el filtro toggle Con fechas / Sin fechas (`aria-pressed`, `data-fechas`) y la limpieza conjunta con búsqueda y estado.

#### Scenario: Limpiar filtros

- GIVEN búsqueda, estado y fechas activos
- WHEN se activa “Limpiar filtros”
- THEN MUST restablecer q, estado=`todos` y conFechas=`null`

### REQ-CLIST-003: Badge de estado con dot y borde

MUST renderizar el estado del curso como badge con dot, borde semántico y etiqueta humana (Borrador / Activo / Cerrado / Archivado). `activo` MUST usar semántica valid/teal; los demás MUST usar muted/borde neutro o tono diferenciado sin inventar estados.

#### Scenario: Badge en fila

- GIVEN un curso activo en resultados
- WHEN se renderiza la tabla o la card
- THEN MUST verse badge con dot y texto “Activo” (no el raw `activo` solo como clase)

### REQ-CLIST-004: Acento lateral

MUST mostrar acento de color lateral en filas de tabla y franja en cards mobile según estado (`activo` → acento institucional/valid; otros → muted/borde).

#### Scenario: Acento presente

- GIVEN hay resultados
- WHEN se renderiza tabla o cards
- THEN cada fila/card MUST incluir un acento `aria-hidden` con clase de estado

### REQ-CLIST-005: Placeholders Presentes / Certificaciones

MUST mostrar `—` (o número solo si `!= null`) para Presentes y Certificaciones. MUST NOT inventar conteos, consultar otros features ni hacer N+1. MUST conservar copy a11y de integración real cuando el valor es placeholder.

#### Scenario: Null → guion

- GIVEN `alumnosPresentes` y `certificaciones` son null
- WHEN se renderiza la fila
- THEN MUST mostrar `—` y el aviso accesible de dato con integración real

### REQ-CLIST-006: Estados loading / error / empty / sin coincidencias

MUST diferenciar carga, error con reintento, vacío total y sin coincidencias. MUST incluir iconos SVG inline (no librería lucide). Vacío total MUST ofrecer CTA “Crear primer curso” a `/admin/cursos/nuevo`. Sin coincidencias MUST permitir limpiar filtros.

#### Scenario: Error + reintento

- GIVEN `listar` falla
- WHEN se muestra el estado
- THEN MUST `role="alert"`, icono, mensaje seguro y botón Reintentar

#### Scenario: Vacío total

- GIVEN lista vacía sin filtros
- WHEN termina la carga
- THEN MUST mensaje de vacío + enlace a nuevo curso

#### Scenario: Sin coincidencias

- GIVEN filtros sin resultados
- WHEN termina la carga
- THEN MUST mensaje distinto al vacío total y acción de limpiar filtros

### REQ-CLIST-007: Frontera sin backend ni inventos

MUST NOT modificar servicios HTTP/in-memory para fabricar conteos, ni endpoints PHP, ni migraciones. MUST NOT portar JSX/React literal.

#### Scenario: Sin fetch en unit test in-memory

- GIVEN render con `InMemoryCoursesService`
- WHEN se monta la página
- THEN MUST NOT llamar `window.fetch`
