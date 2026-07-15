# Delta para admin-certificate-consulta

## MODIFIED Requirements

### Requirement: Listado administrativo de certificados

La API DEBE exponer `GET /admin/certificados` autorizado según `admin-auth`, con filtros opcionales por `estado`, `cursoId` y `alumnoId`, devolviendo DTOs con `documentMasked` y sin token completo.
(Previously: el listado exigía literalmente `X-Admin-Key`.)

#### Scenario: Listado con certificado vigente

- DADO al menos un certificado persistido
- CUANDO Bedelía consulta el listado autorizado
- ENTONCES la API DEBE responder `200` con `items` ordenados por emisión descendente.
- Y cada ítem DEBE incluir `documentMasked`, nunca `documentNumber`.

#### Scenario: Filtro de estado inválido

- DADO un query `estado` fuera del enum permitido
- CUANDO se consulta el listado
- ENTONCES la API DEBE responder `400 VALIDATION_ERROR`.
