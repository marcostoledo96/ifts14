# Delta for frontend-http-services

## MODIFIED Requirements

### Requirement: HttpInstitutionalConfigService provides institutional configuration

El sistema DEBE proveer `InstitutionalConfigService`, `HttpInstitutionalConfigService` e `InMemoryInstitutionalConfigService` vía `environment.useRealApi`.

El modelo `InstitutionalConfig` DEBE mapear 1:1 los campos de texto del DTO: `institutionName`, `certificateText`, `rectorName`, `rectorRole`, `advisorName`, `advisorRole`, `updatedAt`, `parameters` (9 claves tipadas) y los flags booleanos `rectorSignaturePresent` / `advisorSignaturePresent`. `obtener()` / `guardar()` DEBEN usar JSON sin multipart. El modelo NO DEBE inventar `direccion`, `logoUrl` ni URLs públicas de firma.
(Previously: el modelo excluía uploads/firmas y no incluía flags de presencia.)

#### Scenario: Fetch institutional config

- DADO el backend responde `GET /admin/configuracion-institucional`
- CUANDO se llama `obtener()`
- ENTONCES el servicio DEBE devolver `InstitutionalConfig` desde `envelope.data` (strings null → `''`; `parameters` tipados; flags booleanos de firma)

#### Scenario: Save institutional config

- DADO payload válido con `institutionName` no vacío y `parameters` opcionales
- CUANDO se llama `guardar(payload)`
- ENTONCES el servicio DEBE `PUT /admin/configuracion-institucional` en JSON
- Y DEBE devolver `InstitutionalConfig` actualizado sin enviar multipart de firmas

#### Scenario: HTTP error handling for config

- DADO el backend responde 4xx o 5xx
- CUANDO se llama `obtener()` o `guardar()`
- ENTONCES el servicio DEBE rechazar con error descriptivo

## ADDED Requirements

### Requirement: Métodos HTTP de firmas institucionales

`InstitutionalConfigService` (HTTP e in-memory) DEBE exponer métodos para `POST`/`DELETE`/`GET` de firmas por rol (`rector`|`asesor`) contra `/admin/configuracion-institucional/firmas/{rol}`. Upload DEBE usar multipart; DELETE/GET DEBEN ser inmediatos e independientes de `guardar()`.

#### Scenario: Upload firma por rol

- DADO `File` PNG/JPEG válido y rol permitido
- CUANDO se llama el método de upload
- ENTONCES el servicio DEBE `POST` multipart a `.../firmas/{rol}`
- Y DEBE resolver éxito/error sin invocar `guardar()`

#### Scenario: Delete y preview firma

- DADO un rol permitido
- CUANDO se llama delete o preview
- ENTONCES delete DEBE `DELETE .../firmas/{rol}` y preview DEBE `GET` binario con auth de sesión
- Y errores HTTP DEBEN rechazarse con mensaje descriptivo

#### Scenario: HttpTestingController cubre firmas

- DADO tests con `HttpTestingController`
- CUANDO se ejercitan upload/delete/preview
- ENTONCES DEBEN afirmar método, URL y cuerpo/headers esperados
- Y DEBEN flushear mock y verificar sin requests pendientes
