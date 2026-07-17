# Delta: frontend-http-services

See consolidated REQ-SEDIT-003 and list nullables in `../../spec.md`.

## ADDED Requirements

### Requirement: HttpStudentsService.crear

The system SHALL implement `crear(draft: AlumnoDraft)` posting `{ apellidoNombre, dni, estado? }` to `POST /admin/alumnos`, mapping `201` envelope data to UI models. List mapping SHALL use `null` for `tieneEmail`, `cursosConAsistencia`, and `certificacionesValidas` when the API does not provide them.

#### Scenario: Create student

- GIVEN valid draft
- WHEN `crear` is called
- THEN SHALL POST exact body fields only and return mapped alumno/detalle with `dniMostrar` from response
