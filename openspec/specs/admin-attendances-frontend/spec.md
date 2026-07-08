# Especificación — admin-attendances-frontend

## Propósito

Definir la UI administrativa Angular 20 para listar fechas con asistencia pendiente y marcar presentes con datos ficticios solo en memoria, sin backend ni datos sensibles.

## Requirements

### Requirement: Rutas protegidas y entradas de asistencias

El sistema DEBE exponer `/admin/asistencias` y `/admin/cursos/:id/fechas/:fechaId/asistencias` dentro del flujo admin protegido por sesión mock. La navegación DEBE estar disponible desde sidebar, dashboard y fechas de curso.

#### Scenario: Acceso con sesión mock

- **Given** existe una sesión mock activa
- **When** se abre una ruta de asistencias
- **Then** DEBE mostrarse la lista o pantalla de marcado correspondiente.

#### Scenario: Acceso sin sesión mock

- **Given** no existe sesión mock activa
- **When** se intenta abrir una ruta de asistencias
- **Then** DEBE aplicarse la protección vigente del panel admin.

### Requirement: Lista y marcado mock en memoria

El sistema DEBE listar cursos/fechas que requieren asistencia y permitir alternar presente/ausente en filas de estudiantes ficticios con `dniMostrar` enmascarado. Los cambios DEBEN vivir solo en memoria y DEBEN poder guardarse o descartarse.

#### Scenario: Lista de fechas asistibles

- **Given** hay cursos y fechas ficticias en memoria
- **When** se abre `/admin/asistencias`
- **Then** DEBEN verse cursos/fechas disponibles y conteos demostrativos sin datos reales.

#### Scenario: Marcado de presentes

- **Given** se abre una fecha válida
- **When** se alternan checkboxes de estudiantes y se guarda
- **Then** el estado DEBE actualizarse solo en memoria.
- **And** descartar DEBE restaurar el último estado cargado/guardado.

### Requirement: Carga vigente en reutilización de ruta

El sistema DEBE actualizar datos al navegar entre URLs de marcado reutilizando componente y NO DEBE permitir que cargas obsoletas sobrescriban el estado vigente.

#### Scenario: Cambio de URL actualiza datos

- **Given** se está marcando una fecha
- **When** se navega a otra URL de marcado
- **Then** DEBEN cargarse curso, fecha y alumnos de la URL actual.

#### Scenario: Carga obsoleta ignorada

- **Given** una carga anterior termina después de una navegación posterior
- **When** ambas respuestas llegan fuera de orden
- **Then** la respuesta anterior NO DEBE sobrescribir la pantalla actual.

### Requirement: Frontera segura y handoff

El sistema NO DEBE exponer `X-Admin-Key`, headers admin, storage/cookies, HTTP/API, datos reales, DNI completo, email, token, legajo ni matrícula. NO DEBE agregar Tailwind/dependencias, copiar React/Next, emitir certificados, PDF ni email. La documentación DEBE registrar límites y handoff a F2-06.

#### Scenario: Inspección segura

- **Given** se inspecciona el flujo de asistencias
- **When** se revisa código, runtime o bundle
- **Then** NO DEBEN aparecer secretos, red, persistencia browser ni datos sensibles.

#### Scenario: Cierre documental

- **Given** se cierra F2-05
- **When** se actualiza documentación frontend
- **Then** DEBEN constar límites mock y traspaso a F2-06 certificaciones.
