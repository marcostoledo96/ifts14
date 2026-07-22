# Spec — admin-certificate-consulta

## Purpose

Definir la consulta administrativa de certificados emitidos y la configuración institucional editable, sin exponer DNI completo ni token completo en respuestas admin.

## Requirements

### Requirement: Listado administrativo de certificados

La API DEBE exponer `GET /admin/certificados` autorizado según `admin-auth`, con filtros opcionales por `estado`, `cursoId` y `alumnoId`, devolviendo DTOs con `documentMasked` y sin token completo.

#### Scenario: Listado con certificado vigente

- DADO al menos un certificado persistido
- CUANDO Bedelía consulta el listado autorizado
- ENTONCES la API DEBE responder `200` con `items` ordenados por emisión descendente.
- Y cada ítem DEBE incluir `documentMasked`, nunca `documentNumber`.

#### Scenario: Filtro de estado inválido

- DADO un query `estado` fuera del enum permitido
- CUANDO se consulta el listado
- ENTONCES la API DEBE responder `400 VALIDATION_ERROR`.

### Requirement: Detalle administrativo de certificado

La API DEBE exponer `GET /admin/certificados/{id}` con snapshot de fechas asistidas, auditoría segura y links relativos a PDF, entrega manual y QR.

#### Scenario: Expediente encontrado

- DADO un certificado existente con snapshot
- CUANDO se consulta su detalle autorizado
- ENTONCES la API DEBE responder `200` con `attendedDates`, `auditEvents` y `links`.
- Y DEBE incluir `documentMasked` con DNI completo (D0 2026-07-20).
- Y NO DEBE incluir token completo ni el campo `documentNumber`.

#### Scenario: Certificado inexistente

- DADO un `id` inexistente
- CUANDO se consulta el detalle
- ENTONCES la API DEBE responder `404 CERTIFICATE_NOT_FOUND`.

### Requirement: Configuración institucional administrable

La API DEBE permitir leer y actualizar la fila única de configuración institucional con DTO camelCase seguro, más el mapa tipado `parameters` (`cert_parametros_sistema`).

#### Scenario: Lectura con fallback

- DADO ausencia de fila en `cert_configuracion_institucional`
- CUANDO se consulta `GET /admin/configuracion-institucional`
- ENTONCES la API DEBE responder `200` con fallback seguro documentado
- Y DEBE incluir `parameters` con las 9 claves del catálogo activo (valores desde DB o defaults).

#### Scenario: Actualización válida

- DADO un body con `institutionName` no vacío
- CUANDO se ejecuta `PUT /admin/configuracion-institucional`
- ENTONCES la API DEBE persistir y responder `200` con `updatedAt`.

#### Scenario: Actualización de parámetros tipados

- DADO un body con `parameters` solo con claves seed conocidas
- CUANDO se ejecuta `PUT /admin/configuracion-institucional`
- ENTONCES la API DEBE upsert en `cert_parametros_sistema` y devolver los valores actualizados en `data.parameters`.

#### Scenario: Parámetro desconocido o email inválido

- DADO `parameters` con clave no catalogada o `email_contacto` mal formado
- CUANDO se intenta actualizar
- ENTONCES la API DEBE responder `400 VALIDATION_ERROR` sin persistir esos cambios.

#### Scenario: Nombre institucional ausente

- DADO un body sin `institutionName` válido
- CUANDO se intenta actualizar
- ENTONCES la API DEBE responder `400 VALIDATION_ERROR` sin persistir.
