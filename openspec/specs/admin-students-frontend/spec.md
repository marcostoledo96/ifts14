# Especificación — admin-students-frontend

## Propósito

Listado y detalle de alumnos mock-only con DNI completo en UI admin (D0 2026-07-20) y email de contacto opcional ficticio.

## Requirements

### Requirement: Fuente administrativa con DNI completo

El sistema DEBE proveer un DTO de UI `Alumno` desde una fuente local. DEBE mostrar `dniMostrar` con el DNI completo ficticio (6–10 dígitos) en listados y detalle admin. El DTO PUEDE incluir `email: string | null` con direcciones ficticias `@example.invalid` en seeds. NO DEBE almacenar ni mostrar token, legajo, matrícula ni UUID. El DTO PUEDE incluir `tieneEmail` como booleano derivado de `email` para filtros de contacto.

#### Scenario: DTO y seed administrativos

- GIVEN el seed carga un alumno
- WHEN se transforma y presenta su DTO de UI
- THEN DEBE mostrar `dniMostrar` con DNI completo ficticio y, si corresponde, `email` opcional `@example.invalid` y/o `tieneEmail` booleano.
- AND NO DEBE contener ni mostrar token, legajo, matrícula o UUID.

#### Scenario: Sin red

- GIVEN se usa el listado
- WHEN se inspecciona
- THEN NO DEBE emitir requests ni usar storage, cookies o IndexedDB.

### Requirement: Búsqueda y filtros

El sistema DEBE buscar por nombre y `dniMostrar` completo. NO DEBE buscar ni filtrar por legajo. El filtro de contacto DEBE limitarse a `con-email` o `sin-email`, resuelto con `tieneEmail` (y/o presencia de `email`). El listado DEBE conservar filtros combinables, veinte resultados por página y conteos.

#### Scenario: Búsqueda y filtro de contacto

- GIVEN existen alumnos con y sin email registrado
- WHEN se busca por nombre o DNI completo y se aplica `con-email` o `sin-email`
- THEN DEBE devolver solo coincidencias del texto y del criterio de contacto solicitado.
- AND NO DEBE requerir ni revelar legajo.

#### Scenario: Entrada de búsqueda prohibida

- GIVEN una persona ingresa un legajo como texto de búsqueda
- WHEN se evalúa la consulta
- THEN NO DEBE usar ese campo ni obtener coincidencias desde datos no presentes en el DTO.

#### Scenario: Alta con DNI duplicado

- GIVEN ya existe un alumno con el mismo DNI
- WHEN se intenta crear otro alumno con ese documento
- THEN DEBE rechazar el alta con error de conflicto (sin crear un segundo registro).
- AND DEBE ofrecer un enlace al perfil del alumno existente (`/admin/alumnos/{id}`).

#### Scenario: Filtros y paginación

- GIVEN hay más de veinte resultados
- WHEN cambian filtros/página
- THEN DEBE mostrar veinte o menos de una página válida.
- AND DEBE reiniciar o acotar la página ante cambios.

#### Scenario: Vistas accesibles

- GIVEN la pantalla abre en desktop o mobile
- WHEN renderiza
- THEN DEBE usar tabla con encabezados o tarjetas equivalentes.
- AND DEBE anunciar el resumen de resultados mediante una región accesible.

### Requirement: Alta con email opcional

El formulario de alta DEBE aceptar apellido y nombre, DNI completo y email opcional (`AlumnoDraft.email?`). El estado DEBE quedar activo por defecto. El body de creación DEBE omitir `email` cuando el campo está vacío.

#### Scenario: Alta mínima y con email

- GIVEN el operador completa apellido y nombre y DNI
- WHEN guarda sin email
- THEN DEBE crear el alumno con `dniMostrar` igual al DNI ingresado y `email` null.
- AND WHEN completa un email válido `@example.invalid`
- THEN DEBE enviarlo en el draft y persistirlo en el DTO resultante.

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

### Requirement: Detalle administrativo consistente

El detalle de alumno DEBE mostrar Apellido y Nombre, DNI completo en `dniMostrar` y el año de ingreso. DEBE mostrar el email registrado cuando existe, o indicador honesto cuando no. NO DEBE mostrar legajo inventado, matrícula, UUID ni token completo. DEBE listar cursos con asistencia presentes de forma consistente con las claves existentes de cursos y certificaciones, detallando nombre del curso, código, fechas de asistencia en formato abreviado, y estado de la certificación (Emitida con link al expediente, Pendiente con link a emitir, o En curso).

#### Scenario: Ficha de alumno admin

- GIVEN la pantalla del detalle `/admin/alumnos/:id` para un alumno del seed
- WHEN renderiza la ficha
- THEN DEBE mostrar nombre, ingreso, DNI completo y email `@example.invalid` si corresponde.
- AND NO DEBE mostrar legajo inventado, matrícula ni UUID.

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
