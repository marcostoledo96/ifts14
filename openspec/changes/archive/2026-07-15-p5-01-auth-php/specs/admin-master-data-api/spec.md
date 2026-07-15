# Delta para admin-master-data-api

## MODIFIED Requirements

### Requirement: Administración de cursos

La API DEBE permitir crear, listar, consultar detalle y actualizar estado de cursos mediante endpoints admin autorizados según `admin-auth`.
(Previously: los endpoints exigían literalmente `X-Admin-Key`.)

#### Scenario: Curso creado y consultable

- DADO un request admin autorizado con código y nombre válidos
- CUANDO se crea un curso
- ENTONCES la API DEBE responder `201` con DTO seguro y permitir verlo en listado y detalle.

#### Scenario: Estado de curso actualizado

- DADO un curso existente
- CUANDO se actualiza su estado a un valor permitido
- ENTONCES la API DEBE persistirlo y rechazar estados inválidos con `400 VALIDATION_ERROR`.

### Requirement: Seguridad, envelopes y auditoría

Todos los endpoints DEBEN exigir autorización según `admin-auth`; los POST/PATCH autenticados por cookie DEBEN cumplir CSRF. Los POST/PATCH JSON DEBEN exigir `Content-Type: application/json`; errores DEBEN usar el sobre estable y auditoría/logs NO DEBEN incluir DNI completo, token completo, SQL ni secretos.
(Previously: todos los endpoints exigían `X-Admin-Key`.)

#### Scenario: Request admin no autorizado

- DADO un request sin autorización válida según `admin-auth`
- CUANDO accede a datos maestros
- ENTONCES la API DEBE responder `401 UNAUTHORIZED` con sobre seguro.

#### Scenario: JSON inválido o media type incorrecto

- DADO un POST/PATCH sin JSON válido
- CUANDO llega al endpoint
- ENTONCES la API DEBE responder `415` o `400` antes de side effects.
