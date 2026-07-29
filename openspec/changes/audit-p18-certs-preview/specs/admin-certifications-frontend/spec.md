# Delta for admin-certifications-frontend

## MODIFIED Requirements

### Requirement: Previsualización segura y handoff explícito

El sistema DEBE mostrar en `/admin/certificaciones/:id` un expediente con estado, alumno, curso, asistencias, réplica (firmas reales si hay imagen; SVG solo fallback), auditoría, QR, zona de riesgo, `documentMasked`, `tokenPrefix` y URL truncada en validación. `revocado` DEBE ser visible. `Descargar PDF` DEBE navegar a `/admin/certificaciones/:id/pdf`. `Regenerar PDF` DEBE invocar seam `regenerarPdf` (NO navegar a `/pdf`; NO rotar token/QR). `Revocar` DEBE navegar a `…/:id/revocar`. Acciones: `Copiar link` + `Descargar QR`; NO «Entrega manual» ni «Compartir». Panel validación: mismos CTAs. `Copiar link` DEBE usar canónica de `obtenerEntregaManual().publicValidationUrl` (off si revocado/sin URL). `Descargar QR` vía `descargarQrPng` sin rotar. Soft config/entrega DEBEN permanecer. Autoridades desde config; vacío/fallo → “Configuración institucional pendiente” sin bloquear Copiar/QR. Load hard recuperable: mensaje fijo es-AR (*«No se pudo cargar la certificación.»*) + Reintentar→`cargar()`. Id inválido/not-found distinguible: SIN Reintentar. Errores QR/regen: `mensajeErrorApi` P15-strict o genérico; SIN raw `Error.message`. Post-regen: NO `publicValidationUrl` completa (truncar/omitir); nota permanencia QR OK; clipboard PUEDE usar canónica. NO exigir `errorRecuperable`. NO token completo/legajo/matrícula. DNI completo (D0).
(Previously: Regenerar y Descargar ambos → `/pdf`; sin honesty/Reintentar; URL canónica completa post-regen.)

#### Scenario: Expediente de una certificación

- **GIVEN** id válido
- **WHEN** carga el expediente
- **THEN** DEBE mostrar datos seguros, firmas reales si hay imagen, URL truncada y volver al listado
- **AND** si `revocado`, DEBE mostrarlo visible.

#### Scenario: Acciones PDF, revocación, entrega y copy/QR

- **GIVEN** expediente visible
- **WHEN** Bedelía usa PDF, Regenerar, revocar, Copiar o Descargar QR
- **THEN** `Descargar PDF` DEBE ir a `…/:id/pdf` sin rotar token
- **AND** `Regenerar PDF` DEBE llamar `regenerarPdf` y NO navegar a `/pdf`
- **AND** revocar DEBE ir a `…/:id/revocar`
- **AND** NO «Entrega manual» ni «Compartir»; Copiar usa canónica; QR vía `descargarQrPng`.

#### Scenario: Post-regen sin URL canónica completa

- **GIVEN** regen OK con `publicValidationUrl`
- **WHEN** se renderiza el resultado
- **THEN** NO DEBE mostrar la URL completa (truncar u omitir)
- **AND** PUEDE mostrar éxito + nota de permanencia QR.

#### Scenario: Fallo hard recuperable con Reintentar

- **GIVEN** fallo recuperable al `obtener` detalle
- **WHEN** se muestra el error
- **THEN** mensaje controlado es-AR sin raw `Error.message` + Reintentar→`cargar()`
- **AND** NO DEBE exigir `errorRecuperable`.

#### Scenario: Id inválido o not-found sin Reintentar

- **GIVEN** id inválido, ausente o not-found distinguible
- **WHEN** carga la ruta
- **THEN** estado seguro sin romper admin
- **AND** NO Reintentar.

#### Scenario: Fallo QR o regeneración sin raw

- **GIVEN** falla `descargarQr` o `regenerarPdf`
- **WHEN** se captura el error
- **THEN** `mensajeErrorApi` P15-strict o genérico es-AR
- **AND** SIN raw `Error.message`, SIN Reintentar de load, SIN DNI/token en mensaje.

#### Scenario: Soft config y entrega no bloqueantes

- **GIVEN** fallo soft de config o entrega-manual
- **WHEN** el detalle hard ya cargó
- **THEN** el expediente DEBE seguir usable con el patrón soft existente.

#### Scenario: Frontera de datos administrativa

- **GIVEN** UI admin del expediente
- **WHEN** se inspeccionan datos y mensajes
- **THEN** NO token completo, legajo ni matrícula
- **AND** DNI completo (D0).
