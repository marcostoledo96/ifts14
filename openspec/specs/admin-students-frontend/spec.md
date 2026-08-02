# Especificación — admin-students-frontend

## Propósito

Listado, editor (create/edit) y detalle de alumnos vía `STUDENTS_SOURCE` (HTTP si `useRealApi`, si no in-memory) con DNI completo en UI admin (D0 2026-07-20). Contacto por badges sin email literal; copy de listado/editor/detalle sin «legajo» inventado; métricas del detalle `0` vs «—»; Reintentar solo en fallo recuperable.

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

Búsqueda DEBE ser por nombre y `dniMostrar`. NO DEBE filtrar por legajo. Chips: certificaciones (con/sin) y «Sin email». NO DEBE haber chip «Con email». Filtros null-safe; 20/página. El conflicto de DNI duplicado en alta/edición DEBE regirse por «Conflicto 409 sin PII en editor», no por este requisito.
(Previously: incluía escenario «Alta con DNI duplicado» bajo búsqueda.)

#### Scenario: Búsqueda y filtro de contacto

- GIVEN alumnos con y sin email
- WHEN busca por nombre/DNI y aplica «Sin email»
- THEN DEBE filtrar sin legajo ni chip «Con email»

#### Scenario: Entrada de búsqueda prohibida

- GIVEN texto tipo legajo
- WHEN se evalúa
- THEN NO DEBE coincidir por campos ausentes del DTO

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

El detalle `/admin/alumnos/:id` DEBE mostrar Apellido y Nombre, DNI completo en `dniMostrar` y el año de ingreso (celda vacía si `ingreso` vacío). DEBE mostrar el email registrado o indicador honesto si no hay. Copy visible (kicker, títulos, errores) DEBE omitir «legajo»/«Legajo»/«legajos»; PUEDE usar ficha, registro, perfil o `#id`. NO DEBE mostrar legajo inventado, matrícula, UUID ni token. Métricas `cursosConAsistencia`, `certificacionesValidas` y `certificacionesRevocadas` DEBEN mostrar el número (incluido `0`) cuando hay valor; «—» SOLO si null/ausente. DEBE listar cursos con asistencia de forma consistente (nombre, código, fechas abreviadas, estado cert: Emitida→expediente, Pendiente→emitir, En curso). Mensajes/errores/logs NO DEBEN incluir DNI ni token completos. Fallo recuperable de `obtener` DEBE ofrecer Reintentar y «Volver a Alumnos». Id inválido o alumno no encontrado DEBE ofrecer solo «Volver a Alumnos» (sin Reintentar).
(Previously: ficha/cursos/id inválido sin exigir copy sin legajo, métricas 0 vs «—» en revocadas ni Reintentar solo recuperable.)

#### Scenario: Ficha de alumno admin

- GIVEN el detalle `/admin/alumnos/:id` de un alumno del seed
- WHEN renderiza la ficha
- THEN DEBE mostrar nombre, ingreso, DNI completo y email `@example.invalid` si corresponde
- AND NO DEBE contener «legajo», «Legajo» ni «legajos» ni mostrar matrícula/UUID/token

#### Scenario: Cursos y certificaciones consistentes

- GIVEN el alumno tiene cursos asociados
- WHEN se renderiza la trayectoria (desktop o mobile)
- THEN DEBE mostrar tabla o cards con fechas abreviadas y estados/enlaces honestos («Ver certificación» / emitir / en curso)

#### Scenario: Métricas cero vs ausente

- GIVEN `certificacionesRevocadas` (u otra métrica del detalle) en `0` y en null
- WHEN renderiza el panel de métricas
- THEN DEBE mostrar `0` para el cero y «—» para null

#### Scenario: Fallo recuperable con Reintentar

- GIVEN id numérico válido y fallo recuperable de `obtener`
- WHEN se presenta el error
- THEN DEBE mostrar Reintentar y Volver a Alumnos sin DNI/token en el mensaje
- AND WHEN el operador elige Reintentar
- THEN DEBE volver a solicitar el alumno

#### Scenario: ID inválido o no encontrado sin Reintentar

- GIVEN `/admin/alumnos/999` o un id no numérico
- WHEN carga la página
- THEN DEBE mostrar estado seguro con Volver a Alumnos, sin Reintentar y sin romper la shell admin

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

### Requirement: Editor administrativo create y edit

Las rutas `/admin/alumnos/nuevo` y `/admin/alumnos/:id/editar` DEBEN compartir el editor con modos create y edit. Create DEBE admitir lote multi-fila, validar apellido/nombre/DNI (email opcional) y, al guardar, mostrar resumen sin navegar. Edit DEBE cargar vía `obtener`, guardar con actualización y navegar a `/admin/alumnos/:id`. UI DEBE mostrar DNI completo; mensajes/errores/logs NO DEBEN incluir DNI ni token completos.
(Previously: solo «Alta con email opcional» y escenario de duplicado bajo búsqueda.)

#### Scenario: Create con lote y resumen

- GIVEN modo create con una o más filas válidas
- WHEN guarda el lote
- THEN DEBE persistir altas y mostrar resumen sin navegar al detalle

#### Scenario: Edit carga y guarda

- GIVEN modo edit con id válido
- WHEN carga y guarda cambios válidos
- THEN DEBE rellenar el formulario y, al éxito, navegar a `/admin/alumnos/:id`

#### Scenario: Edit no encontrado

- GIVEN id inválido o alumno inexistente
- WHEN carga el editor
- THEN DEBE mostrar estado no encontrado seguro con enlace a Alumnos

#### Scenario: Validación inline

- GIVEN fila con apellido/nombre vacíos, DNI inválido o email mal formado
- WHEN valida
- THEN DEBE marcar errores accesibles y NO DEBE enviar el draft

### Requirement: Copy del editor sin legajo inventado

Ayuda, labels e intro del editor DEBEN omitir «legajo»/«legajos»; PUEDE usar ficha, registro o perfil.

#### Scenario: Ayuda de email sin legajo

- GIVEN el formulario de alta o edición
- WHEN se lee la ayuda del email
- THEN NO DEBE contener «legajo» ni «legajos»

### Requirement: Error de carga recuperable en editor

Error recuperable al cargar en edit DEBE ofrecer **Reintentar** y «Volver a Alumnos» (patrón P8).

#### Scenario: Reintentar tras fallo de carga

- GIVEN modo edit y fallo recuperable de `obtener`
- WHEN se presenta el error
- THEN DEBE mostrar Reintentar y Volver a Alumnos
- AND WHEN el operador elige Reintentar
- THEN DEBE volver a solicitar el alumno

### Requirement: Conflicto 409 sin PII en editor

Create y edit DEBEN mapear DNI duplicado a conflicto (`StudentDuplicateError` o equivalente). Mensaje DEBE ser genérico sin DNI/token. SI hay id existente, DEBE ofrecer enlace a `/admin/alumnos/{id}`.

#### Scenario: 409 en create con enlace

- GIVEN DNI ya registrado y respuesta con id existente
- WHEN se intenta crear
- THEN DEBE rechazar sin PII y enlazar a `/admin/alumnos/{id}`

#### Scenario: 409 en edit con enlace

- GIVEN edición que colisiona con otro alumno y hay id
- WHEN falla la actualización
- THEN DEBE mostrar conflicto sin PII y enlace al perfil existente
