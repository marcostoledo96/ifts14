# Especificación — admin-students-frontend

## Propósito

Listado de alumnos mock-only sin datos personales.

## Requirements

### Requirement: Fuente privada

El sistema DEBE proveer un DTO de UI `Alumno` desde una fuente local. Solo DEBE mostrar `dniMostrar` enmascarado, ficticio y único por alumno con patrón `NN****NN`; el DTO y el seed NO DEBEN contener, almacenar ni mostrar email literal o real, propiedad `email`, legajo, DNI completo, token, matrícula o UUID. El DTO PUEDE incluir únicamente `tieneEmail` como booleano de contacto derivado de un seed que no contiene direcciones de email literales.

#### Scenario: DTO y seed seguros

- GIVEN el seed carga un alumno
- WHEN se transforma y presenta su DTO de UI
- THEN DEBE mostrar solo `dniMostrar` enmascarado, ficticio y único por alumno con patrón `NN****NN` y, si corresponde, `tieneEmail` booleano.
- AND NO DEBE contener ni mostrar email, legajo, DNI completo, token, matrícula o UUID.

#### Scenario: Sin red

- GIVEN se usa el listado
- WHEN se inspecciona
- THEN NO DEBE emitir requests ni usar storage, cookies o IndexedDB.

### Requirement: Búsqueda y filtros privados

El sistema DEBE buscar exclusivamente por nombre y `dniMostrar` enmascarado. NO DEBE buscar ni filtrar por legajo o email. El filtro de contacto DEBE limitarse a `con-email` o `sin-email`, resuelto solo con `tieneEmail`; el listado DEBE conservar filtros combinables, cinco resultados por página y conteos.

#### Scenario: Búsqueda y filtro de contacto seguro

- GIVEN existen alumnos con valores `tieneEmail` verdaderos y falsos
- WHEN se busca por nombre o DNI enmascarado y se aplica `con-email` o `sin-email`
- THEN DEBE devolver solo coincidencias del texto y del booleano solicitado.
- AND NO DEBE requerir ni revelar una dirección de email o legajo.

#### Scenario: Entrada de búsqueda prohibida

- GIVEN una persona ingresa un legajo o una dirección de email como texto de búsqueda
- WHEN se evalúa la consulta
- THEN NO DEBE usar esos campos ni obtener coincidencias desde datos no presentes en el DTO.

#### Scenario: Filtros y paginación

- GIVEN hay más de cinco resultados
- WHEN cambian filtros/página
- THEN DEBE mostrar cinco o menos de una página válida.
- AND DEBE reiniciar o acotar la página ante cambios.

#### Scenario: Vistas accesibles

- GIVEN la pantalla abre en desktop o mobile
- WHEN renderiza
- THEN DEBE usar tabla con encabezados o tarjetas equivalentes.
- AND DEBE anunciar el resumen de resultados mediante una región accesible.

### Requirement: Estados, detalle y QA

El sistema DEBE diferenciar carga/error/vacío/sin coincidencias. QA solo DEBE operar en desarrollo/tests e invisible e inmutable en producción/staging. El detalle DEBE implementarse bajo `/admin/alumnos/:id` protegido por sesión mock. La UI DEBE igualar o mejorar v0 en paridad visual, responsive y accesibilidad.

#### Scenario: Estados distinguibles

- GIVEN carga, error, cero registros o sin resultado
- WHEN se presenta el estado
- THEN DEBE distinguirlos accesiblemente.

#### Scenario: QA y acceso al detalle

- GIVEN desarrollo/tests o producción/staging
- WHEN se intenta activar QA o navegar al detalle
- THEN QA DEBE operar solo en desarrollo/tests.
- AND la navegación a `/admin/alumnos/:id` DEBE resolver el componente de detalle correspondiente si la sesión mock está activa.

### Requirement: Detalle administrativo privado y consistente

El detalle de alumno DEBE mostrar Apellido y Nombre, DNI enmascarado `NN****NN` y el año de ingreso. NO DEBE mostrar legajo, matrícula, UUID, token completo ni dirección de email real/literal. DEBE usar el indicador booleano `tieneEmail` para mostrar "Contacto disponible" o "Sin contacto registrado". DEBE listar cursos con asistencia presentes de forma consistente con las claves existentes de cursos y certificaciones, detallando nombre del curso, código, fechas de asistencia en formato abreviado, y estado de la certificación (Emitida con link al expediente, Pendiente con link a emitir, o En curso).

#### Scenario: Ficha de alumno segura

- GIVEN la pantalla del detalle `/admin/alumnos/:id` para un alumno del seed
- WHEN renderiza la ficha
- THEN DEBE mostrar nombre, ingreso y DNI enmascarado `NN****NN`.
- AND NO DEBE mostrar legajo, email literal, matrícula ni UUID.

#### Scenario: Cursos y certificaciones consistentes

- GIVEN el alumno tiene cursos asociados
- WHEN se renderiza la lista de cursos en el detalle (desktop o mobile)
- THEN DEBE mostrar una tabla semántica o tarjetas equivalentes.
- AND DEBE listar las fechas de presentes con formato abreviado.
- AND DEBE mostrar el estado de la certificación y los enlaces correspondientes ("Ver certificación" o "Emitir certificación") sin inventar datos inconsistentes.

#### Scenario: ID inexistente o inválido

- GIVEN se navega a `/admin/alumnos/999` o un ID inválido
- WHEN carga la página
- THEN DEBE mostrar un estado no encontrado seguro, permitiendo volver al listado, sin romper la shell admin.

