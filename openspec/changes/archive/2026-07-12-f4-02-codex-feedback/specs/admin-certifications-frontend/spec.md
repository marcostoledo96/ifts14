# Delta — admin-certifications-frontend

## MODIFIED Requirements

### Requirement: Paridad visual, folio imprimible y evidencia de verificación

El sistema DEBE mantener paridad visual igual o mejor que la referencia v0 del expediente y `vista-previa-pdf.tsx`, sin portar React/Next literalmente. La vista DEBE usar impresión nativa en A4 apaisado; sus controles no imprimibles DEBEN excluirse de la salida y conservarse los colores. En el folio DEBE listar cada fecha ISO de `attendedDates` sin resumirla como período. Un certificado `vigente` DEBE permanecer limpio; uno `borrador`, `vencido` o `revocado` DEBE exhibir su marca y banda textual correspondiente, sin impedir la impresión. La verificación DEBE dejar evidencia de tests/checks, build Angular y capturas desktop, mobile y print.

(Previously: The printable view required visual parity, native A4 print, non-printable controls excluded, and generic verification evidence.)

#### Scenario: Paridad visual de la vista imprimible

- **Given** existe una certificación mock válida
- **When** se compara la vista Angular con v0 en desktop y mobile
- **Then** DEBE conservar o mejorar jerarquía, layout, estados y acciones.

#### Scenario: Fechas asistidas exactas en el folio

- **Given** una certificación mock contiene una o más fechas en `attendedDates`
- **When** se carga su folio imprimible
- **Then** DEBE mostrar cada fecha ISO exacta y NO DEBE mostrar un resumen “dictado entre”.

#### Scenario: Identificación de estados no vigentes

- **Given** se carga un folio `vigente`, `borrador`, `vencido` o `revocado`
- **When** se renderiza el estado del documento
- **Then** solo el folio `vigente` DEBE quedar limpio.
- **And** cada estado no vigente DEBE mostrar su marca y banda textual correcta sin bloquear la impresión.

#### Scenario: Impresión nativa segura

- **Given** la vista imprimible está cargada
- **When** Bedelía ejecuta la impresión nativa
- **Then** DEBE aplicarse A4 apaisado y excluir los controles no imprimibles.
- **And** NO DEBE generarse ni descargarse un PDF real.

#### Scenario: Checker de aplicación real por estado

- **Given** el checker se ejecuta contra la aplicación Angular real para los ids `1`, `3`, `4` y `5`
- **When** inspecciona cada folio y su salida de impresión
- **Then** DEBE comprobar fechas, estado, privacidad y una única página A4 completa, sin clipping ni chrome administrativo.
- **And** NO DEBE encontrar DNI completo, token completo, email, matrícula ni legajo.

#### Scenario: Evidencia de checks en verify

- **Given** se ejecuta `sdd-verify`
- **When** se reportan resultados
- **Then** DEBE incluir rutas e ids, privacidad, handoffs, impresión, build y evidencia desktop/mobile/print.
