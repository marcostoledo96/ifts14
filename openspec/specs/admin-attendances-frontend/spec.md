# Especificación — admin-attendances-frontend

## Propósito

Definir la UI administrativa Angular 20 para el camino operativo Curso → Fecha → asistencias y certificados: listar fechas, marcar presentes y, con un solo botón, guardar asistencias + emitir/actualizar certificados del curso. En UI admin, `dniMostrar` muestra DNI completo ficticio (D0 2026-07-20). Entrega desde el hub: descarga PDF y copiar link público (sin SMTP).

## Requirements

### Requirement: Rutas protegidas y entradas de asistencias

El sistema DEBE exponer `/admin/asistencias` y `/admin/cursos/:id/fechas/:fechaId/asistencias` dentro del flujo admin protegido por sesión. La navegación habitual DEBE ser desde el detalle de curso (Abrir fecha / Cargar / Ver y entregar). El listado global `/admin/asistencias` DEBE permanecer como acceso secundario y empujar el camino Cursos → fecha.

#### Scenario: Acceso con sesión mock

- **Given** existe una sesión mock activa
- **When** se abre una ruta de asistencias
- **Then** DEBE mostrarse la lista o el hub de fecha correspondiente.

#### Scenario: Acceso sin sesión mock

- **Given** no existe sesión mock activa
- **When** se intenta abrir una ruta de asistencias
- **Then** DEBE aplicarse la protección vigente del panel admin.

#### Scenario: Entrada desde detalle de curso

- **Given** un curso con fechas
- **When** Bedelía elige Abrir fecha / Cargar / Ver y entregar
- **Then** DEBE navegar a `/admin/cursos/:id/fechas/:fechaId/asistencias`.
- **And** si no hay fechas, DEBE ofrecer Agregar fecha sin saltar al hub genérico de asistencias.

### Requirement: Hub de fecha — asistencias

El sistema DEBE presentar en `/admin/cursos/:id/fechas/:fechaId/asistencias` la lista de alumnos con toggles presente/ausente y `dniMostrar` completo ficticio. En el lateral DEBE haber un CTA «Ver certificados del curso» hacia `/admin/cursos/:id/fechas/:fechaId/asistencias/certificados`, sin listar certificados en el aside. El botón primario DEBE ser «Guardar y generar certificados».

#### Scenario: Marcado de presentes

- **Given** se abre una fecha válida
- **When** se alternan toggles de estudiantes y se guarda
- **Then** el estado DEBE actualizarse vía `ATTENDANCE_SOURCE`.
- **And** descartar DEBE restaurar el último estado cargado/guardado.

#### Scenario: CTA a certificados del curso

- **Given** se está en el hub de fecha
- **When** se observa el aside
- **Then** DEBE mostrarse el botón/enlace a la página de certificados
- **And** NO DEBE listar filas de certificados en el lateral.

#### Scenario: Búsqueda por nombre o documento

- **Given** hay alumnos en el roster de una fecha
- **When** se busca por apellido, nombre o DNI completo ficticio
- **Then** DEBE filtrar coincidencias visibles sin enmascarar el documento.

### Requirement: Página de certificados del curso (por fecha)

El sistema DEBE exponer `/admin/cursos/:id/fechas/:fechaId/asistencias/certificados` con el listado filtrado por `cursoId`, botón «Volver a asistencias», y por fila las acciones en este orden: Copiar link, Descargar QR (`descargarQrPng`), Descargar PDF. NO DEBE mostrar token completo.

#### Scenario: Entrega desde página dedicada

- **Given** hay certificados del curso
- **When** Bedelía abre la página de certificados de la fecha
- **Then** DEBE ver la lista completa con link, QR y PDF
- **And** Descargar QR DEBE obtener la imagen PNG del QR de validación oficial.

### Requirement: Guardar y generar certificados

El sistema DEBE, al confirmar «Guardar y generar certificados»: persistir asistencias; para cada alumno presente en esa fecha, emitir certificado alumno+curso si no hay vigente, o `regenerarPdf` si ya hay vigente (sin rotar token/QR); redirigir a la página de certificados del curso con resumen (emitidos, actualizados, fallidos). Errores parciales NO DEBEN tumbar todo el flujo. Logs y mensajes NO DEBEN incluir DNI ni token completos.

#### Scenario: Emisión, regeneración y redirección

- **Given** hay presentes marcados en la fecha
- **When** se pulsa «Guardar y generar certificados»
- **Then** DEBEN persistirse las asistencias.
- **And** cada presente sin certificado vigente DEBE emitir uno nuevo.
- **And** cada presente con vigente DEBE regenerar PDF sin rotar token.
- **And** DEBE navegar a `…/asistencias/certificados`.

#### Scenario: Sin presentes ni cambios

- **Given** no hay cambios pendientes ni presentes
- **When** se observa el botón primario
- **Then** DEBE estar deshabilitado.

### Requirement: Carga vigente en reutilización de ruta

El sistema DEBE actualizar datos al navegar entre URLs de marcado reutilizando componente y NO DEBE permitir que cargas u operaciones obsoletas sobrescriban el estado vigente.

#### Scenario: Cambio de URL actualiza datos

- **Given** se está marcando una fecha
- **When** se navega a otra URL de marcado
- **Then** DEBEN cargarse curso, fecha, alumnos y certificados de la URL actual.

#### Scenario: Carga o guardado obsoleto ignorado

- **Given** una carga o guardado anterior termina después de una navegación posterior
- **When** ambas respuestas llegan fuera de orden
- **Then** la respuesta anterior NO DEBE sobrescribir la pantalla actual.

### Requirement: Paridad de estado de fecha en fuente mock de asistencias

El mock de `ATTENDANCE_SOURCE`, al marcar presentes de una fecha, DEBE aplicar la misma regla auto que el backend: si no está `cancelada`, `realizada` solo con ≥1 presente y `fecha <= hoy` (`America/Argentina/Buenos_Aires`); si no, `programada`. DEBE actualizar `fechaEstado` en la respuesta y el estado de la fecha en memoria del curso. DEBE rechazar fechas `cancelada`. La fuente HTTP hereda `fechaEstado` del API sin reimplementar la regla.

#### Scenario: Mock fecha pasada → realizada

- DADO fecha mock `programada` con `fecha < hoy` AR
- CUANDO se marca ≥1 presente
- ENTONCES `fechaEstado` y la fecha del curso DEBEN ser `realizada`

#### Scenario: Mock same-day → realizada

- DADO fecha mock con `fecha == hoy` AR
- CUANDO se marca ≥1 presente
- ENTONCES `fechaEstado` DEBE ser `realizada`

#### Scenario: Mock sin presentes → programada

- DADO fecha mock `realizada` con presentes
- CUANDO se marca con cero presentes
- ENTONCES la fecha en memoria DEBE ser `programada`

### Requirement: Frontera segura

El sistema NO DEBE exponer `X-Admin-Key`, headers admin, storage/cookies inseguros, datos reales, email, token completo, legajo ni matrícula en el roster. DEBE mostrar DNI completo en UI admin (D0). La entrega desde el hub es PDF + link; NO DEBE enviar email SMTP en este flujo.

#### Scenario: Inspección segura

- **Given** se inspecciona el flujo de asistencias/hub
- **When** se revisa código, runtime o bundle
- **Then** NO DEBEN aparecer secretos, token completo ni datos sensibles reales.
- **And** DEBE permitirse DNI completo ficticio en UI admin.
