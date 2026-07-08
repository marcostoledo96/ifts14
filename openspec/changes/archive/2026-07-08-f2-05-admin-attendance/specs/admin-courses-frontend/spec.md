# Delta for admin-courses-frontend

## ADDED Requirements

### Requirement: Enlace de toma de asistencia por fecha

El sistema DEBE permitir abrir la pantalla de marcado de asistencia desde cada fecha de curso ficticia sin cambiar la persistencia mock ni exponer datos sensibles.

#### Scenario: Navegación desde detalle de curso

- **Given** existe una sesión mock activa y se visualiza el detalle de un curso
- **When** se activa “Tomar asistencia” en una fecha
- **Then** DEBE navegar a `/admin/cursos/:id/fechas/:fechaId/asistencias`.
- **And** NO DEBE mostrar DNI completo, email, token, legajo ni matrícula.
