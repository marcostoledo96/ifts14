# Delta for admin-certifications-frontend

## ADDED Requirements

### Requirement: CERT-COPY-01 — Badge expediente, Documento y copy de estado

En expediente (`/admin/certificaciones/:id`) el badge de estado `revocado` DEBE mostrar exactamente **Revocado** (DEBE NOT **Revocada**). La etiqueta de campo del DNI completo DEBE ser **Documento** (DEBE NOT «Documento (mascarado)» ni forzar «DNI» como label). El valor DEBE seguir D0 (DNI completo). En preview, listado, entrega, revocar y nueva: copy visible que nombre el estado de certificación hacia el usuario DEBE usar **válidas** / **Válida** (DEBE NOT «vigentes» / «vigente» como copy de estado). Filtros, DTO, comparaciones y copy operativo de dominio en diálogos de revocación PUEDEN conservar `vigente`/`vigentes` al nombrar el estado de API. Badges de listado DEBEN permanecer **Válida** / **Revocado**. DEBE NOT cambiar seams, rotar token/QR ni alterar lógica de revocación/emisión.

#### Scenario: Expediente muestra Revocado

- **GIVEN** certificación con estado `revocado` cargada en expediente
- **WHEN** se renderiza el badge de estado
- **THEN** DEBE mostrar **Revocado**
- **AND** DEBE NOT mostrar **Revocada**

#### Scenario: Label Documento con DNI completo

- **GIVEN** expediente (u otra ficha admin de certificación) con `documentMasked`
- **WHEN** se inspecciona la etiqueta del campo documento
- **THEN** DEBE leer **Documento**
- **AND** el valor DEBE ser DNI completo (D0); DEBE NOT decir «mascarado»

#### Scenario: Copy visible válidas sin tocar API vigente

- **GIVEN** pantallas admin de certificaciones (preview/list/delivery/revoke/new)
- **WHEN** el copy visible nombra certificaciones en estado vigente hacia Bedelía
- **THEN** DEBE usar **válidas** / **Válida**
- **AND** filtros/DTO PUEDEN seguir `vigente`; copy operativo de dominio en revocar PUEDE conservar «vigente»
