# Delta for admin-courses-frontend

## MODIFIED Requirements

### Requirement: Enlace de toma de asistencia por fecha

El sistema DEBE abrir el marcado desde cada fecha usable del detalle sin persistencia nueva ni datos sensibles. Las acciones por fila DEBEN conservar «Cargar» / «Ver y entregar».

(Previously: copy «Tomar asistencia»; sin fijar «Ver y entregar».)

#### Scenario: Navegación desde detalle de curso

- **Given** sesión admin y detalle con fechas usables
- **When** se activa «Cargar» o «Ver y entregar»
- **Then** DEBE navegar a `/admin/cursos/:id/fechas/:fechaId/asistencias`
- **And** DEBE mostrar DNI completo (D0); NO DEBE mostrar token, legajo ni matrícula
- **And** NO DEBE renombrar esas acciones en este ciclo

### Requirement: Detalle de curso enriquecido y seguro

El sistema DEBE enriquecer `/admin/cursos/:id` con ficha, fechas y estado de asistencias, reutilizando rutas y seams opcionales. DEBE mapear en la **página** (no en el servicio HTTP de cursos) id inválido, inexistente y HTTP 404 a not-found amigable único. DEBE ofrecer Reintentar en fallos recuperables, CTA «Ver fechas del curso» al hub, etiquetas humanas de estado, fechas es-AR, y ocultar `cuatrimestre` si es «Sin programar». NO DEBE inventar métricas de certificaciones, ni `/admin/cursos/:id/asistencias`, ni tocar listado/editor/backend.

(Previously: errores técnicos; sin CTA hub; copy «Ver»; sin es-AR ni ocultar placeholder; frontera «sin HTTP» obsoleta.)

#### Scenario: Ficha informativa del curso

- **Given** un curso válido cargado
- **When** finaliza la carga
- **Then** DEBEN verse nombre, código, estado con etiqueta humana y metadatos permitidos
- **And** si `cuatrimestre` es «Sin programar», NO DEBE mostrarse
- **And** fechas de cursada DEBEN ir en locale es-AR

#### Scenario: Fechas equivalentes en desktop y mobile

- **Given** el curso tiene fechas
- **When** se renderiza desktop o mobile
- **Then** DEBE haber tabla con caption/encabezados o tarjetas equivalentes (fecha, estado, conteo, acción)

#### Scenario: Conteo, estado y acción de asistencia

- **Given** fecha activa o realizada
- **When** asistencia pendiente o con presentes
- **Then** DEBE mostrar `Pendiente`+`Cargar`, o conteo+`Ver y entregar`, al marcado existente
- **And** con conteo null y seam OK, NO DEBE mostrar «—» junto a `Pendiente`
- **And** seam faltante/fallido → `No disponible` sin acción; lista vacía real → `Pendiente`/`Cargar`
- **And** fecha cancelada NO DEBE ofrecer acción

#### Scenario: Seams opcionales y métricas por curso

- **Given** seams de asistencia/certificaciones faltan, fallan o sin `cursoId`
- **When** se calcula una métrica del curso
- **Then** lista vacía real → `Pendiente`/`Cargar`; seam faltante/fallido → `No disponible` sin acción
- **And** SOLO DEBE asociar si `cursoId` coincide exactamente
- **And** NO DEBE inventar métricas de certificaciones ausentes

#### Scenario: Carga, vacío sin fechas y error recuperable

- **Given** carga pendiente, curso sin fechas, o fallo recuperable (red/API no-404)
- **When** se muestra el estado
- **Then** DEBE diferenciar skeleton, vacío con `Agregar fecha` al editor, y error con **Reintentar**
- **And** DEBE haber un único `aria-live="polite"`

#### Scenario: Not-found amigable sin ruido técnico

- **Given** id no numérico/≤0, curso inexistente, o HTTP 404
- **When** la página resuelve el error
- **Then** DEBE mostrar «Curso no encontrado.»
- **And** NO DEBE mostrar `Error.message`, URL, cuerpo HTTP ni id en el texto
- **And** el mapeo DEBE ser solo en la página; NO DEBE exigir cambio de `HttpCoursesService.obtener`

#### Scenario: CTA al hub de fechas del curso

- **Given** curso válido en el detalle
- **When** se activa «Ver fechas del curso»
- **Then** DEBE navegar a `/admin/asistencias/curso/:id`
- **And** DEBE conservar «Abrir primera fecha» y deep-links por fila
- **And** NO DEBE usar `/admin/cursos/:id/asistencias`

#### Scenario: Privacidad y accesibilidad

- **Given** detalle en desktop 1280×800 y mobile 390×844
- **When** se revisan ficha, fechas y errores/vacíos
- **Then** DEBE conservar foco visible y un único `aria-live="polite"`
- **And** NO DEBE exponer DNI/email/token/UUID/legajo/matrícula/datos reales/secretos
- **And** NO DEBE exigir redesign amplio vs v0
