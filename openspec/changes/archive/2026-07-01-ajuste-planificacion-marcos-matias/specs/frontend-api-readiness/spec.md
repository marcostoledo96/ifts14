# Delta — frontend-api-readiness

## MODIFIED Requirements

### Requirement: Modelos TypeScript del DTO público

El frontend DEBE modelar la respuesta pública de verificación según `/certificados/api/`, incluyendo `valid`, `status`, `certificateCode`, estudiante con DNI completo, curso, fechas asistidas, `verifiedAt` y `requestId`; NO DEBE depender de tablas internas ni datos administrativos.
(Previously: el modelo usaba estudiante con documento enmascarado y excluía DNI completo.)

#### Scenario: DTO válido público

- DADO una respuesta exitosa del contrato backend
- CUANDO el frontend la interpreta
- ENTONCES DEBE representar estado, certificado, estudiante con DNI completo, curso y fechas asistidas.
- Y DEBE preservar `verifiedAt` y `requestId`.

#### Scenario: Datos internos excluidos

- DADO el modelo frontend
- CUANDO se revisan sus campos públicos
- ENTONCES NO DEBE requerir token completo, hash, pepper ni nombres de tablas.
- Y NO DEBE usar datos reales en mocks.

### Requirement: Servicio reemplazable de validación

El frontend DEBE centralizar resultados para usar mocks ficticios ahora y API PHP después, manteniendo el mismo contrato visible con DNI completo y fechas asistidas. La conmutación DEBE seguir siendo local por `environment` y desactivada por defecto en producción.
(Previously: la frontera preservaba el contrato con documento enmascarado.)

#### Scenario: Mocks ficticios alineados

- DADO `useRealApi` inactivo
- CUANDO se ejecuta la validación pública
- ENTONCES el servicio PUEDE responder estados ficticios con DNI completo ficticio y fechas asistidas.
- Y NO DEBE consultar datos reales.

#### Scenario: Cambio a API PHP real en local

- DADO `useRealApi: true` y API local disponible
- CUANDO se reemplazan mocks en local
- ENTONCES la pantalla DEBERÍA conservar el contrato visible sin reescritura funcional.
