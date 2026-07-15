# Delta para admin-courses-frontend

## MODIFIED Requirements

### Requirement: Rutas protegidas de cursos

El sistema DEBE exponer `/admin/cursos`, `/admin/cursos/nuevo`, `/admin/cursos/:id` y `/admin/cursos/:id/editar` solo dentro del flujo admin protegido por la sesión mock.

(Previously: Protegía las rutas de cursos sin exigir el refresco reactivo del detalle al reutilizar su componente.)

#### Scenario: Acceso con sesión mock

- GIVEN existe una sesión mock activa
- WHEN se abre cualquier ruta de cursos
- THEN DEBE mostrarse la pantalla de cursos correspondiente.

#### Scenario: Acceso sin sesión mock

- GIVEN no existe sesión mock activa
- WHEN se intenta abrir una ruta de cursos
- THEN DEBE aplicarse la misma protección vigente del panel admin.

#### Scenario: Detalle válido, inválido y reutilizado

- GIVEN existe una sesión mock activa
- WHEN se abre un id válido, uno inválido/inexistente o se navega entre dos ids de detalle
- THEN DEBE mostrar el curso correcto o un estado no encontrado controlado, sin conservar datos obsoletos.

## ADDED Requirements

### Requirement: Detalle de curso enriquecido y seguro

El sistema DEBE enriquecer `/admin/cursos/:id` in-place con información de curso, fechas y estado de asistencias. DEBE reutilizar rutas existentes, mantener los seams opcionales y NO DEBE incorporar backend, HTTP, almacenamiento browser ni capacidades F5+.

#### Scenario: Ficha informativa del curso

- GIVEN un curso ficticio válido
- WHEN finaliza la carga del detalle
- THEN DEBEN mostrarse nombre, código, estado y metadatos permitidos con acento institucional.

#### Scenario: Fechas equivalentes en desktop y mobile

- GIVEN el curso tiene fechas
- WHEN se renderiza en desktop o mobile
- THEN DEBE mostrar tabla con caption y encabezados o tarjetas equivalentes con fecha, estado, conteo y acción.

#### Scenario: Conteo, estado y acción de asistencia

- GIVEN una fecha activa o realizada
- WHEN su asistencia está pendiente o tiene presentes
- THEN DEBE mostrar `Pendiente` y `Cargar`, o el conteo de presentes y `Ver`, hacia la ruta existente de asistencia.
- AND si el seam de asistencia falta o rechaza, DEBE mostrar `No disponible` sin habilitar una acción; una lista vacía real mantiene `Pendiente` y `Cargar`.
- AND una fecha cancelada NO DEBE ofrecer acción de asistencia.

#### Scenario: Seams opcionales y métricas por curso

- GIVEN los seams de asistencia o certificaciones faltan, fallan o no exponen `cursoId`
- WHEN se calcula una métrica asociada al curso
- THEN el detalle DEBE permanecer usable: una lista vacía real conserva `Pendiente`/`Cargar`, mientras que un seam faltante o fallido se rotula `No disponible` sin acción habilitada.
- AND SOLO DEBE asociar métricas cuando `cursoId` coincida exactamente; NO DEBE inferirlas por nombre.

#### Scenario: Carga, error y curso sin fechas

- GIVEN la carga está pendiente, falla o el curso no tiene fechas
- WHEN se muestra el estado correspondiente
- THEN DEBE diferenciar carga, error recuperable y vacío con enlace `Agregar fecha` al editor existente.

#### Scenario: Privacidad, paridad y accesibilidad

- GIVEN se verifica el detalle en desktop 1280×800 y mobile 390×844
- WHEN se comparan tabla, tarjetas y estados con la referencia v0
- THEN DEBE lograr paridad visual igual o mejor, foco visible y un único resumen `aria-live="polite"`.
- AND NO DEBE exponer DNI, email, token, UUID, legajo, matrícula, datos reales ni secretos.
