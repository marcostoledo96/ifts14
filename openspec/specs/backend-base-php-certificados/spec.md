# Spec — base backend PHP para certificados

## Purpose

Definir la base mínima y segura del backend PHP 8.4.21 para `/certificados/api/`, sin implementar endpoints de negocio, Angular ni conexión real a base de datos durante `GET /health`.

## Requirements

### Requirement: Configuración externa segura

El backend MUST cargar configuración real desde un archivo PHP externo no versionado y MAY aceptar variables de entorno cuando estén disponibles. El repositorio MUST NOT versionar credenciales reales, `.env` ni archivos reales `config.php`, `db.php`, `database.php` o `conexion.php`.

#### Scenario: Configuración externa disponible

- **Given** existe una configuración externa válida fuera del repositorio
- **When** arranca la API
- **Then** el backend MUST cargarla sin imprimir rutas privadas ni secretos.

#### Scenario: Configuración ausente

- **Given** falta la configuración externa requerida
- **When** la API necesita inicializar configuración
- **Then** MUST responder error controlado `500 INTERNAL_ERROR` sin stack trace, rutas internas ni credenciales.

### Requirement: Fábrica PDO lazy y segura

El backend MUST proveer una fábrica PDO preparada para MariaDB usando opciones seguras: excepciones, fetch asociativo y emulación de prepared statements deshabilitada. La conexión MUST ser lazy y MUST NOT ejecutarse para `GET /health`.

#### Scenario: Conexión diferida

- **Given** se consulta `GET /certificados/api/health`
- **When** el request se procesa correctamente
- **Then** la fábrica PDO MUST NOT abrir conexión a la base.

#### Scenario: Uso futuro de datos

- **Given** un endpoint futuro requiere persistencia
- **When** solicita PDO
- **Then** la fábrica MUST crear la conexión con opciones seguras y prepared statements reales.

### Requirement: Respuestas JSON sin filtración interna

Toda respuesta MUST usar JSON UTF-8 con envelope `data/meta` para éxito y `error/meta` para errores. Los errores MUST NOT exponer SQL, credenciales, rutas internas, stack traces, DNI completo ni tokens completos.

#### Scenario: Respuesta exitosa

- **Given** una operación exitosa
- **When** el backend responde
- **Then** MUST emitir `{ "data": ..., "meta": ... }` con código HTTP correcto.

#### Scenario: Error inesperado

- **Given** ocurre una excepción no controlada
- **When** se genera la respuesta pública
- **Then** MUST emitir `500 INTERNAL_ERROR` con mensaje seguro y sin detalles internos.

### Requirement: Health check público y aislado

`GET /certificados/api/health` MUST responder disponibilidad básica sin requerir base de datos, autenticación ni secretos. La respuesta MUST ser `200` con `data.status: "ok"` y metadatos no sensibles.

#### Scenario: Health exitoso

- **Given** el backend base está desplegado
- **When** se consulta `GET /certificados/api/health`
- **Then** MUST responder `200` con envelope JSON y sin datos de configuración.

#### Scenario: Método no permitido

- **Given** un cliente usa un método distinto de `GET` sobre `/health`
- **When** la API procesa el request
- **Then** MUST responder error seguro sin ejecutar PDO.

### Requirement: Exclusiones de alcance

Este cambio MUST NOT implementar Angular, migraciones SQL, conexión real, servicios de negocio, `GET /certificados/api/certificados/{token}/verificacion` ni `POST /certificados/api/certificados/consulta`.

#### Scenario: Endpoint de validación excluido

- **Given** finaliza este ciclo
- **When** se inspecciona el backend creado
- **Then** MUST existir solo base técnica y health, no validación pública de certificados.

### Requirement: QA mínimo verificable

La verificación posterior MUST incluir `git status --ignored --short`, `php -l` sobre los PHP creados y `php -m` para confirmar `pdo_mysql`, `openssl` y `mbstring`.

#### Scenario: Comandos de QA ejecutables

- **Given** la implementación terminó
- **When** se ejecuta QA local
- **Then** esos comandos MUST mostrar sintaxis válida, extensiones requeridas y ausencia de secretos versionados.

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

### Requirement: QA smoke local reproducible y contrato HTTP sin ruido

El QA local DEBE ejecutar el smoke M3-06 con PHP del host cuando esté disponible, o con la imagen Docker existente `ifts14-php84` cuando falte PHP CLI. Si no hay PHP usable, Docker disponible, o imagen local construida, DEBE fallar con un mensaje claro y accionable. `HttpContractTest.php` DEBE dejar de emitir notices no fatales y DEBE conservar las mismas aserciones de contrato HTTP. El cambio NO DEBE alterar endpoints, respuestas públicas, deploy, base de datos ni comportamiento runtime D0.

#### Scenario: Smoke con PHP del host

- **Given** el host tiene `php` CLI disponible
- **When** se ejecuta `scripts/m3-06-smoke.sh`
- **Then** el smoke DEBE usar PHP del host
- **And** DEBE preservar las verificaciones existentes

#### Scenario: Smoke con fallback Docker

- **Given** el host no tiene `php` CLI
- **When** existe Docker y la imagen `ifts14-php84`
- **Then** el smoke DEBE ejecutarse con esa imagen
- **And** si la imagen falta, DEBE indicar cómo construirla

#### Scenario: Contrato HTTP sin notices no fatales

- **Given** `HttpContractTest.php` ejecuta requests locales
- **When** los contratos siguen cumpliéndose
- **Then** la salida NO DEBE incluir notices no fatales
- **And** las aserciones DEBEN seguir fallando ante cambios de contrato
