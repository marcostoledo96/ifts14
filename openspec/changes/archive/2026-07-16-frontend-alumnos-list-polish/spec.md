# Spec: Lista alumnos polish + Nuevo alumno

## Purpose

Paridad visual/a11y del listado `/admin/alumnos` y alta administrativa mínima vía `POST /admin/alumnos`, sin inventar email ni métricas ausentes en API.

## Contrato POST

- `POST /admin/alumnos` body: `{ apellidoNombre: string, dni: string, estado?: "activo"|"inactivo" }`
- `201` + `studentDto`: `{ id, apellidoNombre, dniMostrar, estado }`
- Errores relevantes: `400`, `409 CONFLICT` (DNI duplicado), `5xx`
- Sin email en create ni en list DTO

## Non-goals

Email; legajo; búsqueda por apellido; React/lucide; backend/DB nuevos campos; N+1; edición; skeleton pesado; shell.

## Requirements

### REQ-SLIST-001: CTA Nuevo alumno

MUST mostrar en el header del listado un enlace/botón activo “Nuevo alumno” hacia `/admin/alumnos/nuevo`. MUST NOT deshabilitarlo ni marcar “pendiente de integración”.

#### Scenario: CTA presente

- GIVEN listado cargado
- WHEN se inspecciona el header
- THEN MUST existir enlace a `/admin/alumnos/nuevo` con texto “Nuevo alumno”

### REQ-SLIST-002: Badge contacto honesto

MUST mostrar badge “Sin email” con icono warning **solo** cuando `tieneEmail === false`. MUST mostrar “Contacto disponible” cuando `tieneEmail === true`. Cuando `tieneEmail === null` (HTTP sin dato), MUST mostrar placeholder honesto (p.ej. “Sin dato” / `—`) sin fingir “todos sin email”. MUST NOT renderizar dirección de email.

#### Scenario: Sin email real

- GIVEN alumno seed con `tieneEmail === false`
- WHEN se renderiza la fila
- THEN MUST verse “Sin email” con icono warning SVG

#### Scenario: Placeholder HTTP

- GIVEN alumno con `tieneEmail === null`
- WHEN se renderiza contacto
- THEN MUST NOT mostrar “Sin email” como afirmación
- AND MUST mostrar placeholder de dato ausente

### REQ-SLIST-003: Certificaciones con ShieldCheck

MUST mostrar icono ShieldCheck junto al conteo de certificaciones válidas **solo** cuando `certificacionesValidas` es un número real (`!= null`). Si es `null`, MUST mostrar `—` (o copy “Sin dato”). MUST NOT inventar conteos HTTP.

#### Scenario: Dato real

- GIVEN `certificacionesValidas === 2`
- WHEN se renderiza
- THEN MUST mostrar `2` con ShieldCheck SVG

#### Scenario: Null HTTP

- GIVEN `certificacionesValidas === null`
- WHEN se renderiza
- THEN MUST mostrar `—`

### REQ-SLIST-004: Cursos con asistencia honestos

MUST mostrar número solo si `cursosConAsistencia != null`; si `null`, MUST `—`. MAY incluir icono BookOpen solo con dato real.

#### Scenario: Null → guion

- GIVEN `cursosConAsistencia === null`
- WHEN se renderiza
- THEN MUST mostrar `—`

### REQ-SLIST-005: Estados con SVG

MUST diferenciar loading, error (+ Reintentar), vacío total y sin coincidencias, cada uno con SVG inline (`aria-hidden`). Vacío total MUST ofrecer CTA “Nuevo alumno” / “Crear primer alumno” a `/admin/alumnos/nuevo`. Sin coincidencias MUST permitir limpiar filtros.

#### Scenario: Empty con CTA

- GIVEN cero alumnos y sin filtros
- WHEN se muestra vacío
- THEN MUST haber SVG + enlace a `/admin/alumnos/nuevo`

### REQ-SLIST-006: Privacy lista

MUST seguir mostrando solo `dniMostrar`. MUST NOT email literal, legajo ni DNI completo en lista/cards. Búsqueda MUST seguir siendo solo nombre + `dniMostrar`.

#### Scenario: Sin PII completa

- GIVEN listado
- WHEN se inspecciona DOM de resultados
- THEN MUST NOT aparecer DNI completo ni email

### REQ-SLIST-007: Filtros con nullables

Filtros `con-email`/`sin-email` MUST coincidir solo con `true`/`false` respectivamente; `null` MUST NOT matchear. `con-cert`/`sin-cert` MUST usar solo cuando `certificacionesValidas != null` (`>0` / `===0`); `null` MUST NOT matchear.

#### Scenario: Null no entra en sin-email

- GIVEN alumno con `tieneEmail === null`
- WHEN se activa chip Sin email
- THEN ese alumno MUST NOT aparecer

### REQ-SEDIT-001: Ruta estática nuevo

MUST registrar `alumnos/nuevo` **antes** de `alumnos/:id`, bajo guard admin, cargando el editor.

#### Scenario: No cae en detalle

- GIVEN sesión admin
- WHEN se navega a `/admin/alumnos/nuevo`
- THEN MUST renderizar editor (no detalle con id “nuevo”)

### REQ-SEDIT-002: Formulario mínimo

MUST exigir `apellidoNombre` y `dni` (DNI completo solo en este input de alta admin). MUST defaultar alta a activo **sin** selector de estado en UI (omitir `estado` o enviar `activo`). MUST NOT campo email.

#### Scenario: Campos requeridos

- GIVEN form vacío
- WHEN se intenta guardar
- THEN MUST validación inline y MUST NOT llamar `crear`

### REQ-SEDIT-003: Seam crear

`StudentsService` MUST exponer `crear(draft)` con body exacto `{ apellidoNombre, dni, estado? }`. HTTP MUST `POST /admin/alumnos` y mapear `201` a modelo UI (`apellidoNombre` split; `dniMostrar` de respuesta). In-memory MUST crear con `dniMostrar` enmascarado ficticio y métricas seed coherentes. Errores MUST propagarse sin loguear DNI completo.

#### Scenario: POST body

- GIVEN draft válido
- WHEN `crear` HTTP
- THEN request body MUST contener `apellidoNombre` y `dni` y MUST NOT campos inventados (email, legajo)

#### Scenario: 409

- GIVEN backend `409`
- WHEN falla create
- THEN la página MUST mostrar error visible sin el DNI completo en el mensaje

### REQ-SEDIT-004: Handoff y anti doble-submit

Tras `201`, MUST navegar a `/admin/alumnos/:id`. Mientras `guardando`, MUST deshabilitar submit. Errores POST MUST ser visibles.

#### Scenario: Éxito

- GIVEN create OK con id `42`
- WHEN resuelve
- THEN MUST navegar a `/admin/alumnos/42`
