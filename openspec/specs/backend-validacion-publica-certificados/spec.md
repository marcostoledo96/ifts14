# Spec — validación pública de certificados

## Purpose

Definir el comportamiento de los endpoints públicos de verificación de certificados QR implementados en el backend PHP 8.4 bajo `/certificados/api/`. Esta spec cubre solo la validación pública mínima: los endpoints administrativos de emisión, revocación y reenvío siguen fuera de alcance y se tratarán en ciclos SDD posteriores.

## Requirements

### Requirement: Validación pública por GET

El sistema MUST validar certificados por token público mediante `GET /certificados/api/certificados/{token}/verificacion`. Si el front controller normaliza la ruta, la ruta PHP interna MAY ser `/certificados/{token}/verificacion` sin cambiar la URL pública desplegada.

#### Scenario: Certificado vigente por GET

- **Given** un token con formato válido y certificado vigente
- **When** se consulta la URL pública `/certificados/api/certificados/{token}/verificacion`
- **Then** la respuesta MUST ser `200` con DTO público de certificado válido.

### Requirement: Consulta pública por POST

El sistema MUST aceptar `POST /certificados/api/certificados/consulta` con JSON `{ "token": "..." }` y MUST reutilizar el mismo resultado que GET.

#### Scenario: Certificado vigente por POST

- **Given** un body JSON con token válido
- **When** se consulta `POST /certificados/api/certificados/consulta`
- **Then** la respuesta MUST coincidir con el DTO público de GET.

### Requirement: Lookup seguro por hash

El sistema MUST validar formato de token, calcular `SHA-256(token + token_pepper)` con pepper externo a Git y consultar MariaDB usando PDO prepared statements.

#### Scenario: Token con formato inválido

- **Given** un token ausente o fuera de formato
- **When** se invoca GET o POST
- **Then** la API MUST responder `400 VALIDATION_ERROR` sin consultar por token completo.

### Requirement: Respuesta pública segura

El sistema MUST devolver solo autenticidad, estado, código, nombre visible, documento enmascarado, curso, fecha de emisión y `requestId`; MUST NOT exponer DNI completo, token completo, SQL, rutas internas ni configuración.

#### Scenario: DTO válido mínimo

- **Given** un certificado verificable
- **When** la API responde `200`
- **Then** `data.valid` MUST ser `true` y el documento MUST estar enmascarado.

### Requirement: No verificable unificado

El sistema MUST responder `404 CERTIFICATE_NOT_FOUND` de forma indistinguible para token inexistente, revocado, vencido, fuera de ventana o certificado no vigente.

#### Scenario: Caso no verificable

- **Given** un token inexistente, revocado, vencido o no actual
- **When** se consulta la validación pública
- **Then** la respuesta MUST ser `404 CERTIFICATE_NOT_FOUND` sin revelar la causa.

### Requirement: Auditoría mínima no bloqueante

El sistema SHOULD registrar evento `verificacion` con resultado `ok`, `rechazado` o `error`, `request_id` y prefijo de hash; una falla de auditoría MUST NOT romper la respuesta pública.

#### Scenario: Auditoría falla

- **Given** una verificación procesable y falla el INSERT de auditoría
- **When** la API arma la respuesta pública
- **Then** MUST devolver el resultado de validación sin exponer la falla interna.

### Requirement: Configuración, seed y rate limiting

El ejemplo versionable MUST incluir `token_pepper`; la configuración real MUST permanecer externa. El seed demo MUST alinear `token_hash` con el pepper de ejemplo. Rate limiting queda documentado como pendiente y MUST NOT implementarse en este ciclo.

#### Scenario: Seed demo coherente

- **Given** el token demo ficticio y el pepper de ejemplo
- **When** se calcula el hash esperado
- **Then** MUST coincidir con el valor del seed demo.
