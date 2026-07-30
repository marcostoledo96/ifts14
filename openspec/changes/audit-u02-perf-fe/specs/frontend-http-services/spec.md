# Delta for frontend-http-services

## ADDED Requirements

### Requirement: HTTP-PERF-01 — Coalesce in-flight de listarHub

`HttpAttendanceService.listarHub` DEBE coalescer llamadas concurrentes/in-flight de modo que como máximo un `GET /admin/hub/asistencias` esté en vuelo. PUEDE aplicar TTL corto de reuso en memoria. Tras `marcar`, `anular` u operaciones equivalentes que muten el hub, DEBE invalidar el coalesce/cache. NO DEBE cambiar semántica HTTP, shape DTO ni `Cache-Control` backend.

#### Scenario: Hub list → fechas sin doble GET in-flight

- **GIVEN** navegación hub → fechas de curso con `listarHub` pendiente o reutilizable
- **WHEN** ambas pantallas invocan `listarHub()`
- **THEN** DEBE haber ≤1 `GET /admin/hub/asistencias` in-flight
- **AND** ambas DEBEN resolver el mismo DTO mapeado al contrato vigente

#### Scenario: Invalidación tras marcar o anular

- **GIVEN** resultado de `listarHub` coalescido o en TTL
- **WHEN** `marcar` o `anular` (u mutación de hub equivalente) completa con éxito
- **THEN** DEBE invalidar coalesce/cache de `listarHub`
- **AND** la siguiente `listarHub()` DEBE emitir un GET fresco

#### Scenario: Semántica HTTP intacta

- **GIVEN** coalesce activo
- **WHEN** se inspecciona la red de `listarHub`
- **THEN** método, URL y mapeo DEBEN coincidir con `listarHub HTTP`
- **AND** NO DEBE alterarse `Cache-Control` ni el contrato de respuesta

### Requirement: HTTP-PERF-02 — Cache de sesión para previewFirma y obtener

`HttpInstitutionalConfigService` DEBE cachear en memoria de sesión `previewFirma(rol)` y DEBE coalescer/cachear `obtener()` sin mutación intermedia. DEBE invalidar firma del rol tras upload/delete; DEBE invalidar `obtener` tras `guardar` exitoso y tras mutaciones de firma que cambien flags. DEBERÍA limpiar caches al logout si el seam es fácil. NO DEBE cambiar URLs, auth, multipart ni `Cache-Control: no-store`.

#### Scenario: Reuso de previewFirma en la sesión

- **GIVEN** `previewFirma(rol)` ya resolvió en la sesión
- **WHEN** otra pantalla pide el mismo rol sin mutación
- **THEN** DEBE reusar memoria/Promise in-flight
- **AND** NO DEBE emitir un segundo `GET .../firmas/{rol}` innecesario

#### Scenario: Invalidación tras mutar firma o guardar

- **GIVEN** cache de `previewFirma` y/o `obtener` poblado
- **WHEN** upload/delete de firma o `guardar` completa con éxito
- **THEN** DEBE invalidar entradas afectadas
- **AND** la siguiente lectura DEBE ir a la red

#### Scenario: Limpieza en logout (si el seam es fácil)

- **GIVEN** caches poblados y clear path accesible
- **WHEN** Bedelía cierra sesión admin
- **THEN** DEBERÍA vaciar caches de sesión
- **AND** NO DEBE filtrar blobs a otra sesión
