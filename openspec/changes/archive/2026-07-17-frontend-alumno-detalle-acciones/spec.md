# Spec: Detalle de alumno — habilitar acciones

## Purpose

Habilitar emisión desde el detalle de alumno con preselección por query, y lectura honesta de asistencias por `alumnoId`, sin fingir editar/compartir ni inventar datos.

## Non-goals

Rutas anidadas v0; PATCH datos personales; compartir a nivel legajo; DNI completo admin; campos inventados; cambios backend/DB.

## Requirements

### REQ-SDET-001: CTA Nueva certificación activo

MUST mostrar enlace/botón activo “Nueva certificación” hacia `/admin/certificaciones/nueva?alumno=:id` (id del detalle). MUST NOT quedar disabled por “fase posterior”.

#### Scenario: CTA navega con alumno

- GIVEN detalle de alumno id `1` cargado
- WHEN se inspecciona “Nueva certificación”
- THEN MUST ser un enlace (o navegación) a `/admin/certificaciones/nueva?alumno=1`
- AND MUST NOT tener `disabled`

### REQ-SDET-002: Emitir por fila pendiente

MUST, para cada curso con `estadoCert === 'pendiente'`, ofrecer “Emitir certificación” activo hacia `/admin/certificaciones/nueva?alumno=:alumnoId&curso=:cursoId` cuando `curso.id` sea un id numérico real; si el id de curso no es usable, MUST usar solo `?alumno=:alumnoId`.

#### Scenario: Fila pendiente con curso id

- GIVEN alumno con curso pendiente `id: "3"`
- WHEN se inspecciona “Emitir certificación”
- THEN MUST enlazar a `.../nueva?alumno=<id>&curso=3`
- AND MUST NOT estar disabled

### REQ-SDET-003: Preselección query en emisión nueva

MUST, en `/admin/certificaciones/nueva`, leer query `alumno` y opcional `curso` tras cargar catálogos. Si el id de alumno existe en el catálogo de **activos**, MUST preseleccionarlo; si no, MUST ignorarlo y MAY mostrar aviso no bloqueante. Si `curso` existe en catálogo de cursos activos, MUST preseleccionarlo; si no, MUST ignorarlo (aviso no bloqueante). MUST NOT impedir emisión manual por query inválida.

#### Scenario: Alumno y curso válidos

- GIVEN catálogos con alumno activo `46` y curso activo `4`
- WHEN se navega a `/admin/certificaciones/nueva?alumno=46&curso=4`
- THEN MUST quedar seleccionados alumno `46` y curso `4`
- AND MUST disparar evaluación de par (presentes/duplicado) como selección manual

#### Scenario: Query inválida

- GIVEN query `alumno=99999` (no existe o inactivo)
- WHEN cargan catálogos
- THEN MUST dejar selector de alumno vacío
- AND MUST NOT bloquear la pantalla
- AND SHOULD mostrar aviso no bloqueante

### REQ-SDET-004: Ver asistencias read-only

MUST habilitar “Ver asistencias” solo vía listado/sección read-only en el detalle alimentado por `AttendanceService.listarAsistenciasPorAlumno(alumnoId)` (GET `/admin/asistencias?alumnoId=`). MUST NOT enlazar a `/admin/asistencias` sin filtro de alumno. MUST mostrar loading/empty/error honestos. MUST NOT inventar filas ni DNI completo.

#### Scenario: Listado con datos

- GIVEN seam que devuelve asistencias del alumno
- WHEN el usuario abre/ve “Ver asistencias”
- THEN MUST listar fechas (y cursoId o nombre si ya está en el detalle) sin datos inventados

#### Scenario: Vacío

- GIVEN seam que devuelve `[]`
- WHEN se ve la sección
- THEN MUST mostrar empty state honesto

### REQ-SDET-005: Compartir y Editar disabled honestos

MUST mantener “Compartir por canal externo” y “Editar datos” disabled. Motivo Compartir MUST indicar que la entrega es por certificación (no F5-04 a nivel legajo como bloqueo de producto futuro ambiguo). Motivo Editar MUST indicar ausencia de API de actualización de datos personales. MUST NOT reutilizar “Disponible en F2-05”.

#### Scenario: Motivos visibles

- GIVEN detalle cargado
- WHEN se inspeccionan Compartir y Editar
- THEN MUST estar disabled con `aria-describedby` y copy honesto
- AND MUST NOT mencionar F2-05

### REQ-SDET-006: Seam listarAsistenciasPorAlumno

MUST extender `AttendanceService` con `listarAsistenciasPorAlumno(alumnoId: number)`. HTTP MUST GET `/admin/asistencias?alumnoId=`. Mock MUST filtrar por `alumnoId`. Callers existentes de `listarAsistenciasPorPar` MUST seguir intactos.

#### Scenario: HTTP query

- GIVEN `HttpAttendanceService`
- WHEN se llama `listarAsistenciasPorAlumno(10)`
- THEN MUST solicitar `GET .../admin/asistencias?alumnoId=10`

### REQ-SDET-007: Privacidad admin

MUST seguir mostrando solo `dniMostrar` enmascarado en detalle y en cualquier listado de asistencias del detalle. MUST NOT renderizar DNI completo, email literal, legajo ni token.

#### Scenario: Sin fuga

- GIVEN detalle + sección asistencias
- WHEN se inspecciona el texto
- THEN MUST NOT contener email literal ni legajo
