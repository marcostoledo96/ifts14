# Delta — admin-auth

## MODIFIED Requirements

### Requirement: Autorización administrativa por `X-Admin-Key`

Los endpoints administrativos MUST exigir el header `X-Admin-Key` y MUST comparar su valor contra una clave administrativa externa a Git. La autorización MUST fallar cerrada si la clave configurada falta, está vacía, tiene menos de 16 caracteres, el header falta o el valor no coincide. La comparación MUST ser de tiempo constante y las respuestas/logs MUST NOT exponer la clave ni fragmentos de la clave.
(Previously: la clave configurada solo debía existir y no estar vacía.)

#### Scenario: Header válido

- **Given** existe una clave administrativa externa con 16 caracteres o más
- **When** un request admin incluye `X-Admin-Key` correcto
- **Then** el request MAY continuar hacia la operación solicitada.

#### Scenario: Falla cerrada

- **Given** falta la clave configurada, es menor a 16 caracteres, falta el header o el valor no coincide
- **When** se invoca cualquier endpoint administrativo
- **Then** la API MUST responder `401 UNAUTHORIZED` con sobre de error seguro.
- **And** MUST NOT abrir datos administrativos ni revelar la causa exacta.

#### Scenario: Secreto no observable

- **Given** una autorización exitosa o fallida
- **When** se generan respuesta, auditoría o logs técnicos
- **Then** MUST NOT incluir la clave administrativa completa ni parcial.
