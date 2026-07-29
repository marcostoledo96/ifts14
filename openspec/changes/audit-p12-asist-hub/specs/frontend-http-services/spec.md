# Delta for frontend-http-services

## ADDED Requirements

### Requirement: listarHub HTTP (condicional al apply)

SOLO SI apply edita `HttpAttendanceService` / `listarHub`, este requisito DEBE fusionarse a la spec principal; si apply omite HTTP, este delta es N/A y NO DEBE exigirse merge. Cuando aplique: `listarHub` DEBE `GET /admin/hub/asistencias`, mapear DTOs al contrato de `AttendanceService.listarHub` sin cambiar semántica. PUEDE mapear asistencias en una sola pasada.

#### Scenario: listarHub GET y mapeo DTO

- DADO apply tocó HTTP y el backend responde el hub consolidado
- CUANDO se llama `listarHub()`
- ENTONCES el servicio DEBE `GET /admin/hub/asistencias`
- Y DEBE devolver el DTO mapeado al contrato vigente (cursos, fechas, asistencias)
- Y el contrato de respuesta NO DEBE cambiar
- Y PUEDE evitar barridos de mapeo redundantes sobre el mismo array de asistencias

#### Scenario: HTTP omitido — delta N/A

- DADO apply no edita `HttpAttendanceService`
- CUANDO cierra P12
- ENTONCES este requisito NO DEBE fusionarse ni bloquear verify
