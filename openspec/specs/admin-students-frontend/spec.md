# Especificación — admin-students-frontend

## Propósito

Listado y detalle de alumnos vía `STUDENTS_SOURCE` (HTTP si `useRealApi`, si no in-memory) con DNI completo en UI admin (D0 2026-07-20). Contacto por badges sin email literal; copy del listado sin «legajo» inventado.

## Requirements

### Requirement: Fuente administrativa con DNI completo

El DTO `Alumno` DEBE resolverse vía `STUDENTS_SOURCE` (HTTP si `useRealApi`, si no in-memory). DEBE mostrar `dniMostrar` completo en listado. PUEDE incluir `email`/`tieneEmail`. NO DEBE mostrar token, legajo, matrícula ni UUID.
(Previously: mock-only y «Sin red».)

#### Scenario: DTO y presentación administrativa

- GIVEN la fuente resuelve un alumno
- WHEN se presenta en el listado
- THEN DEBE mostrar DNI completo sin token/legajo/matrícula/UUID

#### Scenario: Fuente según entorno

- GIVEN `useRealApi` verdadero o falso
- WHEN el listado solicita alumnos
- THEN API real → HTTP; mock → in-memory

### Requirement: Búsqueda y filtros

Búsqueda DEBE ser por nombre y `dniMostrar`. NO DEBE filtrar por legajo. Chips: certificaciones (con/sin) y «Sin email». NO DEBE haber chip «Con email». Filtros null-safe; 20/página.
(Previously: chips `con-email`/`sin-email` UI; sin set v0 ni null-safety.)

#### Scenario: Búsqueda y filtro de contacto

- GIVEN alumnos con y sin email
- WHEN busca por nombre/DNI y aplica «Sin email»
- THEN DEBE filtrar sin legajo ni chip «Con email»

#### Scenario: Entrada de búsqueda prohibida

- GIVEN texto tipo legajo
- WHEN se evalúa
- THEN NO DEBE coincidir por campos ausentes del DTO

#### Scenario: Alta con DNI duplicado

- GIVEN DNI ya existente
- WHEN se intenta crear otro
- THEN DEBE rechazar con conflicto y enlace a `/admin/alumnos/{id}`

#### Scenario: Filtros y paginación

- GIVEN más de veinte resultados
- WHEN cambian filtros/página
- THEN DEBE mostrar ≤20 por página y acotar ante cambios

#### Scenario: Vistas accesibles

- GIVEN desktop o mobile
- WHEN renderiza
- THEN DEBE usar tabla o cards con resumen accesible

### Requirement: Alta con email opcional

El formulario de alta DEBE aceptar apellido y nombre, DNI completo y email opcional (`AlumnoDraft.email?`). El estado DEBE quedar activo por defecto. El body de creación DEBE omitir `email` cuando el campo está vacío.

#### Scenario: Alta mínima y con email

- GIVEN el operador completa apellido y nombre y DNI
- WHEN guarda sin email
- THEN DEBE crear el alumno con `dniMostrar` igual al DNI ingresado y `email` null.
- AND WHEN completa un email válido `@example.invalid`
- THEN DEBE enviarlo en el draft y persistirlo en el DTO resultante.

### Requirement: Estados, detalle y QA

El listado DEBE distinguir carga/error (Reintentar)/vacío/sin coincidencias. QA solo en desarrollo/tests (`isDevMode`); invisible en prod/staging. Detalle en `/admin/alumnos/:id` con sesión. NO DEBE reabrir email literal ni chip «Con email».
(Previously: QA genérico; sin Reintentar; sin acotar privacidad de contacto.)

#### Scenario: Estados distinguibles

- GIVEN carga, error, vacío o sin coincidencias
- WHEN se presenta
- THEN DEBE distinguirlos; error recuperable DEBE ofrecer Reintentar

#### Scenario: QA y acceso al detalle

- GIVEN desarrollo/tests o prod/staging
- WHEN se intenta QA o navegar al detalle
- THEN QA solo en desarrollo/tests; detalle resuelve con sesión

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

### Requirement: Copy del listado sin legajo inventado

Intro y vacío de `/admin/alumnos` DEBEN omitir «legajo»/«legajos» (registro/ficha). NO DEBEN inventar legajo.

#### Scenario: Intro y vacío honestos

- GIVEN listado con o sin alumnos
- WHEN se lee intro o vacío
- THEN NO DEBE contener «legajo» ni «legajos»

### Requirement: Contacto por badge sin email literal

Contacto DEBE usar badges «Contacto disponible», «Sin email» o «Sin dato». NO DEBE mostrar email literal ni chip «Con email».

#### Scenario: Badges de contacto

- GIVEN alumnos con/sin email o sin dato
- WHEN renderiza tabla o cards
- THEN DEBE verse el badge sin email ni chip «Con email»

### Requirement: Métricas numéricas en listado

Conteos numéricos (incluido 0) DEBEN mostrarse como número; «—» SOLO si null/ausente.

#### Scenario: Cero vs ausente

- GIVEN métrica `0` y null
- WHEN renderiza métricas
- THEN DEBE mostrar `0` y «—»
