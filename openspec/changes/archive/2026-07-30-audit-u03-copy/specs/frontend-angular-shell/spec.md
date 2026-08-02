# Delta for frontend-angular-shell

## ADDED Requirements

### Requirement: SHELL-COPY-01 — Glosario UI y consistencia de copy visible

El frontend DEBE mantener `docs/frontend/04-glosario-ui.md` como glosario breve de etiquetas visibles (español argentino formal). Labels/badges/mensajes de producto hacia el usuario DEBEN seguir ese glosario para los términos canónicos: certificación **Válida** / **Revocado**; curso listado **Activo** / **Inactivo**; fecha **Programada** / **Realizada**; pantalla detalle cert **Expediente**; operación Copiar/QR/PDF **Entrega manual**. El glosario DEBE notar que el chrome público **VÁLIDO** / **REVOCADO** ≠ badge admin **Válida** / **Revocado** (misma semántica, superficie distinta). API/DTO/filtros PUEDEN conservar `vigente`/`revocado`. Copy operativo en diálogos de revocación PUEDE usar «vigente» al nombrar el estado de dominio. DEBE NOT forzar paridad literal admin↔público ni rediseñar el folio ceremonial. Hub Activo/Inactivo en asistencias queda **fuera** de este ciclo (DEFER). Este ciclo DEBE NOT cambiar lógica de negocio, contratos HTTP ni patrones U5 de error/vacío.

#### Scenario: Glosario versionado con asimetría público/admin

- **GIVEN** el árbol `docs/frontend/`
- **WHEN** se consulta el glosario UI
- **THEN** DEBE existir `04-glosario-ui.md` con los términos canónicos de U3
- **AND** DEBE notar VÁLIDO/REVOCADO público ≠ Válida/Revocado admin

#### Scenario: Copy visible sigue el glosario sin tocar API

- **GIVEN** labels/badges/mensajes de producto en UI admin/pública
- **WHEN** se audita copy de estado de certificación hacia el usuario
- **THEN** DEBE usar **Válida** / **Revocado** (y «válidas» donde el copy nombre el estado)
- **AND** API/DTO PUEDEN seguir `vigente`/`revocado`; DEBE NOT rotar token/QR ni alterar D0
