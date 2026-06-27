# Delta — base backend PHP para certificados

## ADDED Requirements

### Requirement: Headers de seguridad centralizados

El backend MUST emitir headers mínimos de seguridad desde la capa común de respuesta para todas las respuestas JSON: `X-Content-Type-Options: nosniff` y `X-Frame-Options: SAMEORIGIN`. Esta regla MUST aplicar a éxitos, errores de validación, errores de autorización, errores de método y errores internos controlados.

#### Scenario: Éxito con headers de seguridad

- **Given** una operación exitosa como `GET /certificados/api/health`
- **When** el backend responde JSON
- **Then** MUST incluir `X-Content-Type-Options: nosniff`.
- **And** MUST incluir `X-Frame-Options: SAMEORIGIN`.

#### Scenario: Error con headers de seguridad

- **Given** una respuesta de error controlada
- **When** el backend responde JSON
- **Then** MUST conservar el sobre seguro de error.
- **And** MUST incluir ambos headers de seguridad.
