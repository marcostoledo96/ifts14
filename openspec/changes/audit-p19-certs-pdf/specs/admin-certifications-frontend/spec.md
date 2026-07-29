# Delta for admin-certifications-frontend

## MODIFIED Requirements

### Requirement: Paridad visual, folio imprimible y evidencia de verificación

El sistema DEBE mantener paridad visual ≥ v0 (`vista-previa-pdf.tsx`) sin portar React/Next. En `/admin/certificaciones/:id/pdf` DEBE renderizar folio A4 apaisado **1 página**, firmas **3:2**; excluir chrome no imprimible; listar cada ISO de `attendedDates` (sin “dictado entre”). `vigente` limpio; `borrador`/`vencido`/`revocado` con marca+banda (revocado visible) sin bloquear impresión. Pie **SIN** disclaimers/textos institucionales no deseados. Verify: tests, build, capturas desktop/mobile/print.

**Imprimir** = `window.print()` A4 landscape 1 pág. **Descargar PDF** = captura folio visible (html2canvas+jsPDF) → `cert-{codigo}.pdf` semántico (preferir `detalle.numero`); **NO** `CertificationsService.descargarPdf` ni blob API. QR = PNG canónico de `publicValidationUrl` completa (UI PUEDE truncar); **NO** rotar token/QR; **NO** token/matrícula/legajo completos; DNI completo UI (D0).

Load hard recuperable: *«No se pudo cargar la certificación.»* + `errorRecuperable=true` + Reintentar→`load()`. Not-found/id inválido: mensaje controlado **SIN** Reintentar/`errorRecuperable`. Fallo descarga: `mensajeErrorApi`/genérico (*«No se pudo generar el PDF.»*) **SIN** Reintentar/`errorRecuperable`/raw `Error.message`. Soft config/QR no bloqueantes.
(Previously: Descargar = seam API P-13 blob; sin honesty/`errorRecuperable`/Reintentar en PDF.)

#### Scenario: Paridad visual de la vista imprimible

- **GIVEN** certificación mock válida
- **WHEN** se compara Angular vs v0 (desktop/mobile)
- **THEN** DEBE conservar o mejorar jerarquía, layout, estados y acciones.

#### Scenario: Fechas asistidas exactas en el folio

- **GIVEN** `attendedDates` con una o más fechas
- **WHEN** carga el folio
- **THEN** DEBE mostrar cada ISO; NO resumen "dictado entre".

#### Scenario: Identificación de estados no vigentes

- **GIVEN** folio `vigente`|`borrador`|`vencido`|`revocado`
- **WHEN** se renderiza
- **THEN** solo `vigente` limpio; no vigentes (incl. revocado) con marca+banda sin bloquear impresión.

#### Scenario: Impresión nativa A4 una página

- **GIVEN** vista imprimible cargada
- **WHEN** Bedelía imprime
- **THEN** A4 apaisado 1 página, firmas 3:2, sin chrome admin
- **AND** MUST usar `window.print()`.

#### Scenario: Descargar PDF por captura del folio visible

- **GIVEN** `/admin/certificaciones/:id/pdf` con folio visible
- **WHEN** pulsa **Descargar PDF**
- **THEN** html2canvas+jsPDF → `cert-{codigo}.pdf`
- **AND** MUST NOT `CertificationsService.descargarPdf` ni Blob API
- **AND** Imprimir permanece disponible.

#### Scenario: Filename semántico

- **GIVEN** detalle con `numero` o id
- **WHEN** se nombra la descarga
- **THEN** `cert-{codigo}.pdf` preferiendo `detalle.numero`.

#### Scenario: QR canónico sin rotación

- **GIVEN** id válido en vista PDF
- **WHEN** carga
- **THEN** QR PNG (`descargarQrPng`/fallback) codifica URL canónica completa
- **AND** UI PUEDE truncar URL; NO grid 8×8 ni rotar token/QR.

#### Scenario: Pie sin disclaimers

- **GIVEN** folio renderizado
- **WHEN** se inspecciona el pie imprimible
- **THEN** NO disclaimers ni textos institucionales no deseados.

#### Scenario: Fallo hard recuperable con Reintentar

- **GIVEN** fallo recuperable al `obtener`
- **WHEN** se muestra error
- **THEN** mensaje fijo es-AR sin raw + `errorRecuperable=true` + Reintentar→`load()`.

#### Scenario: Id inválido o not-found sin Reintentar

- **GIVEN** id inválido/ausente/not-found
- **WHEN** carga la ruta PDF
- **THEN** mensaje controlado; NO Reintentar ni `errorRecuperable`.

#### Scenario: Fallo de descarga sin Reintentar ni raw

- **GIVEN** falla captura/generación PDF
- **WHEN** se captura el error
- **THEN** mensaje controlado sin raw; NO Reintentar ni `errorRecuperable`.

#### Scenario: Checker de aplicación real por estado

- **GIVEN** checker sobre ids `1`,`3`,`4`,`5`
- **WHEN** inspecciona folio/impresión
- **THEN** fechas, estado, privacidad, 1 página A4 sin clipping/chrome
- **AND** NO token/matrícula/legajo completos; DNI completo UI OK (D0).

#### Scenario: Evidencia de checks en verify

- **GIVEN** `sdd-verify`
- **WHEN** se reportan resultados
- **THEN** rutas/ids, privacidad, handoffs, impresión, build, evidencia desktop/mobile/print.
