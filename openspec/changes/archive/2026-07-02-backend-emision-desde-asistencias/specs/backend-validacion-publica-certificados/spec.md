# Delta — backend-validacion-publica-certificados

## MODIFIED Requirements

### Requirement: Respuesta pública segura

El sistema MUST devolver solo autenticidad, estado, código, nombre visible, DNI completo aprobado, curso, fecha de emisión, fechas asistidas del snapshot y `requestId`; MUST NOT exponer token completo, SQL, rutas internas ni configuración. Para certificados nuevos con `alumno_id`, `curso_id` y snapshot, el DNI completo MUST obtenerse desde `cert_alumnos.dni_cifrado` con clave externa y `attendedDates` MUST obtenerse de `cert_certificado_fechas`. Para certificados legacy sin FKs/snapshot, el sistema MUST conservar compatibilidad con datos heredados disponibles y MUST NOT inventar fechas. Logs, auditoría, errores y respuestas administrativas MUST NOT incluir DNI completo ni token completo.
(Previously: la respuesta pública exigía DNI completo y fechas asistidas, pero no definía fuente desde snapshot ni fallback legacy.)

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

## ADDED Requirements

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
