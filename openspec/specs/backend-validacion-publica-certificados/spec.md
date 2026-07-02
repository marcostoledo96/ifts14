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

El sistema MUST devolver solo autenticidad, estado, código, nombre visible, DNI completo aprobado, curso, fecha de emisión, fechas asistidas del snapshot y `requestId`; MUST NOT exponer token completo, SQL, rutas internas ni configuración. Para certificados nuevos con `alumno_id`, `curso_id` y snapshot, el DNI completo MUST obtenerse desde `cert_alumnos.dni_cifrado` con clave externa y `attendedDates` MUST obtenerse de `cert_certificado_fechas`. Para certificados legacy sin FKs/snapshot, el sistema MUST conservar compatibilidad con datos heredados disponibles y MUST NOT inventar fechas. Logs, auditoría, errores y respuestas administrativas MUST NOT incluir DNI completo ni token completo.

#### Scenario: DTO válido desde snapshot

- DADO un certificado verificable emitido desde asistencias
- CUANDO la API responde `200`
- ENTONCES `data.valid` MUST ser `true` e incluir DNI completo aprobado y fechas asistidas desde snapshot.
- AND MUST NOT exponer token completo, hashes, SQL ni rutas internas.

#### Scenario: Certificado legacy sin snapshot

- DADO un certificado verificable anterior sin FKs ni snapshot
- CUANDO la API responde `200`
- ENTONCES MUST conservar los datos heredados disponibles.
- AND MUST NOT recalcular ni inventar `attendedDates`.

#### Scenario: Descifrado de DNI falla cerrado

- DADO un certificado nuevo que requiere DNI cifrado
- CUANDO falta la clave externa o el descifrado falla
- ENTONCES la API MUST responder error seguro o no verificable según política vigente.
- AND MUST NOT exponer DNI cifrado, clave, SQL ni rutas internas.

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

El ejemplo versionable MUST incluir `token_pepper`; la configuración real MUST permanecer externa. El seed demo MUST alinear `token_hash` con el pepper de ejemplo. El sistema MUST aplicar rate limiting mínimo a GET y POST con umbral/ventana configurables, sin dependencia nueva ni migración SQL.

#### Scenario: Seed demo coherente

- **Given** el token demo ficticio y el pepper de ejemplo
- **When** se calcula el hash esperado
- **Then** MUST coincidir con el valor del seed demo.

#### Scenario: Rate limiting en endpoints públicos

- **Given** un bucket público que excedió el umbral configurado
- **When** se invoca GET o POST dentro de la ventana
- **Then** la API MUST responder `429 RATE_LIMITED` sin consultar ni devolver datos del certificado.

#### Scenario: Estado local sin datos sensibles

- **Given** actividad pública de validación con IP, token y posible DNI asociado al certificado
- **When** se guarda el estado del rate limiter
- **Then** MUST NOT persistirse IP cruda, token completo ni DNI.

### Requirement: Inmutabilidad de validación pública

La validación pública MUST usar el snapshot de `cert_certificado_fechas` como evidencia histórica y MUST NOT recalcular asistencias vivas al validar.

#### Scenario: Asistencia modificada después de emisión

- DADO un certificado emitido con snapshot
- CUANDO una asistencia viva se elimina o cambia después
- ENTONCES la validación pública MUST seguir mostrando las fechas materializadas originales.

#### Scenario: Fecha de curso modificada después de emisión

- DADO un certificado emitido con descripción y orden materializados
- CUANDO cambia la fecha viva del curso
- ENTONCES la validación pública MUST usar fecha, descripción y orden del snapshot.
