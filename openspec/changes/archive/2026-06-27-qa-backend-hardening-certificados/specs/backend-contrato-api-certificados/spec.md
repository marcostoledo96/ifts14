# Delta — contrato de API para certificados QR

## ADDED Requirements

### Requirement: Headers de seguridad en respuestas JSON

Toda respuesta JSON de la API MUST incluir `X-Content-Type-Options: nosniff` y `X-Frame-Options: SAMEORIGIN`. La respuesta MUST NOT exponer secretos, DNI completo, tokens completos, SQL ni rutas internas.

#### Scenario: Respuesta JSON con headers mínimos

- **Given** cualquier endpoint JSON de `/certificados/api/`
- **When** la API responde éxito o error
- **Then** MUST incluir `X-Content-Type-Options: nosniff`.
- **And** MUST incluir `X-Frame-Options: SAMEORIGIN`.

### Requirement: Validación de Content-Type en POST JSON

Los endpoints POST que esperan JSON MUST exigir `Content-Type: application/json` compatible. Si falta o no corresponde, MUST responder `415 UNSUPPORTED_MEDIA_TYPE` antes de validar payload o ejecutar side effects.

#### Scenario: Content-Type inválido

- **Given** un POST JSON público o administrativo sin `application/json`
- **When** llega a la API
- **Then** MUST responder `415 UNSUPPORTED_MEDIA_TYPE` con sobre de error seguro.
- **And** MUST NOT persistir, auditar acción de negocio ni revocar certificados.

#### Scenario: Content-Type válido

- **Given** un POST con `Content-Type: application/json`
- **When** el body es procesable
- **Then** la API MAY continuar con la validación del payload.

### Requirement: JSON malformado en POST JSON

Los endpoints `POST /certificados/api/certificados/consulta`, `POST /certificados/api/admin/certificados` y `POST /certificados/api/admin/certificados/{id}/revocar` MUST responder `400 VALIDATION_ERROR` ante JSON malformado antes de cualquier side effect.

#### Scenario: Body JSON malformado

- **Given** un POST JSON con body sintácticamente inválido
- **When** la API intenta leerlo
- **Then** MUST responder `400 VALIDATION_ERROR` con mensaje seguro.
- **And** MUST NOT consultar por token completo, emitir, revocar ni persistir cambios.

### Requirement: Pendientes de hardening documentados

La documentación backend SHOULD registrar como diferidos: CORS/preflight, límite de tamaño de body, rate limiting distribuido, observabilidad real y `ultimo_uso_en` en verificación pública.

#### Scenario: Gaps explícitos

- **Given** este ciclo archivado
- **When** se revisa la documentación backend
- **Then** SHOULD listar esos pendientes como fuera de alcance de este cambio.
