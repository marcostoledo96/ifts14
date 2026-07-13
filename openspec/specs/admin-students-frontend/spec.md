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

### Requirement: Estados y QA

El sistema DEBE diferenciar carga/error/vacío/sin coincidencias. QA solo DEBE operar en desarrollo/tests e invisible e inmutable en producción/staging. El detalle DEBE quedar deshabilitado para F5-03; NO DEBE registrar `/admin/alumnos/:id`. La UI DEBE igualar o mejorar v0.

#### Scenario: Estados distinguibles

- GIVEN carga, error, cero registros o sin resultado
- WHEN se presenta el estado
- THEN DEBE distinguirlos accesiblemente.

#### Scenario: QA y detalle diferido

- GIVEN desarrollo/tests o producción/staging
- WHEN se intenta activar QA o detalle
- THEN QA DEBE operar solo en desarrollo/tests y el detalle seguir deshabilitado con “Disponible en F5-03”.
- AND la navegación no DEBE resolver una ruta de detalle.
