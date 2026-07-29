# Delta for admin-students-frontend

## ADDED Requirements

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

## MODIFIED Requirements

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
