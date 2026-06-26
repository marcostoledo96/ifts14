# Spec — rate limiting de endpoints públicos

## Purpose

Definir una protección mínima de nodo único para los endpoints públicos de validación de certificados, sin migraciones, dependencias ni persistencia de datos sensibles.

## Requirements

### Requirement: Límite público por origen

El sistema MUST aplicar rate limiting configurable a `GET /certificados/api/certificados/{token}/verificacion` y `POST /certificados/api/certificados/consulta`. Al superar el umbral dentro de la ventana configurada, MUST responder `429 RATE_LIMITED` con sobre de error seguro.

#### Scenario: Umbral excedido en GET

- **Given** un origen que alcanzó el límite configurado
- **When** consulta `GET /certificados/api/certificados/{token}/verificacion` dentro de la ventana
- **Then** la API MUST responder `429 RATE_LIMITED`.

#### Scenario: Umbral excedido en POST

- **Given** un origen que alcanzó el límite configurado
- **When** consulta `POST /certificados/api/certificados/consulta` dentro de la ventana
- **Then** la API MUST responder `429 RATE_LIMITED`.

### Requirement: Persistencia mínima sin datos sensibles

El rate limiter MUST ser local al nodo, sin dependencias nuevas ni migraciones SQL. MAY usar JSON temporal con bloqueo de archivo. MUST NOT guardar IP cruda, token completo ni DNI; la clave de bucket MUST derivarse de un hash con salt configurado.

#### Scenario: Archivo de buckets seguro

- **Given** consultas públicas con IP, token y documento asociados
- **When** se persiste el estado del rate limiter
- **Then** el archivo MUST contener solo buckets no reversibles y contadores/tiempos mínimos.

#### Scenario: Sin cambios de esquema

- **Given** este cambio implementado
- **When** se revisan dependencias y base de datos
- **Then** MUST NOT existir dependencia nueva ni migración SQL nueva.

### Requirement: Limitaciones documentadas

La documentación MUST declarar que el rate limiting es básico, de nodo único y no distribuido; SHOULD advertir impacto por NAT/IP compartida y permisos de escritura/bloqueo en temporales.

#### Scenario: Revisión operativa

- **Given** una persona preparando deploy en cPanel
- **When** lee la documentación del backend
- **Then** MUST encontrar limitaciones y condiciones operativas del rate limiter.
