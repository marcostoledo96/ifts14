# Especificación — admin-courses-frontend

## Propósito

Definir una UI administrativa Angular 20 para cursos y fechas, lista para contrato futuro, con datos ficticios solo en memoria y sin integración backend.

## Requirements

### Requirement: Rutas protegidas de cursos

El sistema DEBE exponer `/admin/cursos`, `/admin/cursos/nuevo`, `/admin/cursos/:id` y `/admin/cursos/:id/editar` solo dentro del flujo admin protegido por la sesión mock.

(Previously: Protegía las rutas de cursos sin exigir el refresco reactivo del detalle al reutilizar su componente.)

#### Scenario: Acceso con sesión mock

- **Given** existe una sesión mock activa
- **When** se abre cualquier ruta de cursos
- **Then** DEBE mostrarse la pantalla de cursos correspondiente.

#### Scenario: Acceso sin sesión mock

- **Given** no existe sesión mock activa
- **When** se intenta abrir una ruta de cursos
- **Then** DEBE aplicarse la misma protección vigente del panel admin.

#### Scenario: Detalle válido, inválido y reutilizado

- **Given** existe una sesión mock activa
- **When** se abre un id válido, uno inválido/inexistente o se navega entre dos ids de detalle
- **Then** DEBE mostrar el curso correcto o un estado no encontrado controlado, sin conservar datos obsoletos.

### Requirement: UI contract-ready de cursos y fechas

El sistema DEBE renderizar listado, detalle y editor de cursos con semántica accesible, estados claros y datos ficticios no sensibles solo en memoria. El listado DEBE mostrar cuatrimestre, cantidad derivada de fechas y métricas de presentes/certificaciones como placeholders explícitos; estas últimas NO DEBEN consultar otros features. DEBE ofrecer filtros por búsqueda, chips toggle de los cuatro estados (Borrador / Activos / Cerrados / Archivados) con indicador visual, chips con/sin fechas, badge de estado con dot y borde semántico, acento lateral en filas/cards, estados de carga/error/vacío con iconografía inline, resumen accesible, limpieza de filtros y paginación client-side de 20 ítems por página (reset al filtrar).

(Previously: filtro de estado vía select; badge de estado plano; estados de pantalla solo texto.)

#### Scenario: Listado y detalle navegables

- **Given** hay cursos ficticios en memoria
- **When** se abre el listado o el detalle de un curso
- **Then** DEBEN verse nombre, estado y fechas del curso sin datos reales.

#### Scenario: Edición no persistente de fechas

- **Given** se edita una fecha de curso en el editor
- **When** se guarda el cambio en la UI
- **Then** DEBE reflejarse en memoria durante la sesión actual.
- **And** DEBE informarse que el cambio no persiste al recargar.

#### Scenario: Tabla accesible en desktop

- **Given** existen resultados y el viewport es desktop
- **When** se renderiza el listado
- **Then** DEBE mostrarse una tabla con encabezados, cuatrimestre, fechas, métricas, estado y acciones accesibles.
- **And** presentes/certificaciones DEBEN indicar que el dato depende de integración real.

#### Scenario: Tarjetas de métricas en mobile

- **Given** existen resultados y el viewport es mobile
- **When** se renderiza el listado
- **Then** DEBEN mostrarse tarjetas legibles con sus métricas y acciones equivalentes a desktop.

#### Scenario: Filtros y limpieza

- **Given** se aplican búsqueda, chip de estado y filtro con/sin fechas
- **When** se activa “Limpiar filtros”
- **Then** DEBEN restablecerse los tres filtros y el resumen accesible DEBE anunciar el resultado.

#### Scenario: Paginación de 20

- **Given** hay más de 20 cursos en el resultado filtrado
- **When** se renderiza el listado
- **Then** DEBE mostrar como máximo 20 filas/cards por página con pager accesible
- **And** al cambiar filtros DEBE volver a la página 1.

#### Scenario: Chips de estado con toggle

- **Given** el listado está cargado
- **When** se activa un chip de estado y luego el mismo chip otra vez
- **Then** DEBE filtrar por ese estado y después limpiar el filtro de estado (toggle single).
- **And** NO DEBE usarse un `<select>` de estado.

#### Scenario: Carga, error y reintento

- **Given** la obtención del listado está pendiente o falla
- **When** se muestra cada estado
- **Then** DEBEN diferenciarse carga y error seguro con iconografía inline, y el error DEBE permitir reintentar.

#### Scenario: Vacío y sin resultados diferenciados

- **Given** no hay cursos o los filtros no encuentran coincidencias
- **When** termina la carga
- **Then** DEBEN mostrarse mensajes distintos para vacío inicial y sin resultados, con CTA “Crear primer curso” en el vacío y limpieza disponible para sin resultados.

#### Scenario: Acciones existentes y detalle implementado

- **Given** un curso aparece en el listado
- **When** se activa “Ver detalle” o “Editar”
- **Then** DEBE navegar a las rutas existentes del curso con nombre accesible.
- **And** “Ver detalle” DEBE navegar al detalle implementado en F4-04.

### Requirement: Frontera segura sin datos reales ni red


El sistema NO DEBE exponer `X-Admin-Key`, claves, storage/cookies, llamadas HTTP/API, datos reales, DNI, tokens ni información de estudiantes en la UI de cursos.

#### Scenario: Sin secretos ni persistencia browser

- **Given** se inspecciona el flujo de cursos
- **When** se revisa código/bundle y runtime
- **Then** NO DEBEN aparecer claves admin, storage, cookies ni llamadas HTTP/API.

#### Scenario: Seed ficticio permitido

- **Given** la UI necesita contenido demostrativo
- **When** se renderizan cursos y fechas
- **Then** DEBE usar datos ficticios institucionalmente seguros.
- **And** NO DEBE incluir DNI, tokens ni estudiantes reales.

### Requirement: Documentación y handoff

El sistema DEBE documentar límites de F2-04 y el traspaso a F2-05 asistencias y F2-06 certificaciones.

#### Scenario: Cierre documental

- **Given** se cierra F2-04
- **When** se actualiza la documentación frontend
- **Then** DEBEN constar exclusiones de backend, deploy, auth real, HTTP, datos reales, Tailwind/deps nuevas y copia React/Next.
- **And** DEBE quedar indicado que asistencias y certificaciones continúan en F2-05/F2-06.

### Requirement: Enlace de toma de asistencia por fecha

El sistema DEBE abrir el marcado desde cada fecha usable del detalle sin persistencia nueva ni datos sensibles. Las acciones por fila DEBEN conservar «Cargar» / «Ver y entregar».

(Previously: copy «Tomar asistencia»; sin fijar «Ver y entregar».)

#### Scenario: Navegación desde detalle de curso

- **Given** sesión admin y detalle con fechas usables
- **When** se activa «Cargar» o «Ver y entregar»
- **Then** DEBE navegar a `/admin/cursos/:id/fechas/:fechaId/asistencias`
- **And** DEBE mostrar DNI completo (D0); NO DEBE mostrar token, legajo ni matrícula
- **And** NO DEBE renombrar esas acciones en este ciclo

### Requirement: Paridad verificable y frontera del listado F4-03

El listado DEBE conservar datos mock institucionalmente seguros y demostrar paridad visual igual o mejor que la referencia v0, sin incorporar backend, red, dependencias, rutas ni acoplamiento con asistencias o certificaciones.

#### Scenario: Evidencia de paridad y privacidad

- **Given** se verifica el listado con datos ficticios
- **When** se capturan sus vistas desktop 1280×800 y mobile 390×844, más carga y error
- **Then** la evidencia DEBE comparar tabla, tarjetas y estados contra v0.
- **And** NO DEBE exhibir DNI, email, token, UUID ni datos reales.

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
