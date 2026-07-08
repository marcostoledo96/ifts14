# Especificación — admin-courses-frontend

## Propósito

Definir una UI administrativa Angular 20 para cursos y fechas, lista para contrato futuro, con datos ficticios solo en memoria y sin integración backend.

## Requirements

### Requirement: Rutas protegidas de cursos

El sistema DEBE exponer `/admin/cursos`, `/admin/cursos/nuevo`, `/admin/cursos/:id` y `/admin/cursos/:id/editar` solo dentro del flujo admin protegido por la sesión mock.

#### Scenario: Acceso con sesión mock

- **Given** existe una sesión mock activa
- **When** se abre cualquier ruta de cursos
- **Then** DEBE mostrarse la pantalla de cursos correspondiente.

#### Scenario: Acceso sin sesión mock

- **Given** no existe sesión mock activa
- **When** se intenta abrir una ruta de cursos
- **Then** DEBE aplicarse la misma protección vigente del panel admin.

### Requirement: UI contract-ready de cursos y fechas

El sistema DEBE renderizar listado, detalle y editor de cursos con semántica accesible, estados claros y datos ficticios no sensibles solo en memoria.

#### Scenario: Listado y detalle navegables

- **Given** hay cursos ficticios en memoria
- **When** se abre el listado o el detalle de un curso
- **Then** DEBEN verse nombre, estado y fechas del curso sin datos reales.

#### Scenario: Edición no persistente de fechas

- **Given** se edita una fecha de curso en el editor
- **When** se guarda el cambio en la UI
- **Then** DEBE reflejarse en memoria durante la sesión actual.
- **And** DEBE informarse que el cambio no persiste al recargar.

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

El sistema DEBE permitir abrir la pantalla de marcado de asistencia desde cada fecha de curso ficticia sin cambiar la persistencia mock ni exponer datos sensibles.

#### Scenario: Navegación desde detalle de curso

- **Given** existe una sesión mock activa y se visualiza el detalle de un curso
- **When** se activa “Tomar asistencia” en una fecha
- **Then** DEBE navegar a `/admin/cursos/:id/fechas/:fechaId/asistencias`.
- **And** NO DEBE mostrar DNI completo, email, token, legajo ni matrícula.
