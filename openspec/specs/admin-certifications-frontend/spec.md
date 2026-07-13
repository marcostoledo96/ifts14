# Especificación — admin-certifications-frontend

## Propósito

Definir la UI administrativa Angular 20 para listar y previsualizar certificaciones ficticias, navegable, mock-only, contract-ready y testeable. Habilita la base de integración con emisión, PDF, entrega manual, revocación y listado real (F4-01/F4-02/F5-01/F5-04/F6-01) sin exponer DNI completo administrativo, tokens completos, datos reales, red, storage ni auth real.

## Requirements

### Requirement: Rutas protegidas de certificaciones

El sistema DEBE exponer `/admin/certificaciones`, `/admin/certificaciones/:id` y `/admin/certificaciones/:id/pdf` como rutas administrativas protegidas por la sesión mock vigente, sin alterar rutas públicas ni el resto del panel.

#### Scenario: Acceso con sesión mock

- **Given** existe una sesión mock activa y un id mock válido
- **When** se navega al listado, expediente o vista imprimible
- **Then** DEBE cargar la pantalla correspondiente.

#### Scenario: Acceso sin sesión mock

- **Given** no existe una sesión mock activa
- **When** se navega directo a una ruta de certificaciones
- **Then** DEBE aplicarse la protección administrativa vigente.

#### Scenario: Id inválido en la vista imprimible

- **Given** una sesión mock activa y un id inexistente, inválido o ausente
- **When** se carga `/admin/certificaciones/:id/pdf`
- **Then** DEBE mostrarse un estado seguro sin excepciones, red ni ruptura de navegación.

### Requirement: Listado mock-only con datos seguros

El sistema DEBE mostrar un listado navegable de certificaciones ficticias, filtrable por validez, entrega y curso, y buscable por alumno, `documentMasked`, curso o número ficticio. DEBE usar únicamente mocks locales, incluidos `envio` y `numero`, sin requests de datos o API (`fetch`, XHR, `/api/`, storage o backend), cookies, IndexedDB, claves admin ni datos reales. La navegación `document` local y los assets estáticos necesarios para servir la SPA están permitidos. Debe presentar conteos de total, coincidencias y elementos visibles; tabla semántica en desktop y tarjetas equivalentes en mobile.

#### Scenario: Listado filtrado por estado

- **Given** existe un conjunto mock de certificaciones
- **When** Bedelía filtra por `borrador`, `vigente`, `revocado` o `vencido`
- **Then** DEBE ver solo coincidencias ficticias y un mensaje claro si no hay resultados.

#### Scenario: Frontera de datos segura

- **Given** una certificación aparece en el listado
- **When** se revisan sus datos visibles
- **Then** DEBE mostrar `documentMasked` y datos ficticios.
- **And** NO DEBE mostrar DNI completo, token completo, email, matrícula, legajo, UUID ni datos reales.

#### Scenario: Filtros y búsqueda combinables

- **Given** el listado mock contiene distintas validez, entregas y cursos
- **When** Bedelía combina filtros y una búsqueda segura
- **Then** DEBE aplicar la intersección y actualizar los conteos correctamente.

#### Scenario: Paginación y cambio de resultados

- **Given** hay más de cinco coincidencias o la página activa deja de existir
- **When** Bedelía cambia filtros, búsqueda o página
- **Then** DEBE mostrar cinco elementos por página y reiniciar o acotar la página a un rango válido.

#### Scenario: Navegación conservada desde ambas vistas

- **Given** una certificación visible en tabla o tarjeta
- **When** Bedelía selecciona su detalle o PDF existente
- **Then** DEBE navegar a la ruta administrativa vigente sin cambiar el id, QR ni token mock.

#### Scenario: Estados no exitosos y vacíos

- **Given** el listado está cargando, falla, no tiene mocks o los filtros no coinciden
- **When** se renderiza cada condición
- **Then** DEBE distinguir carga, error, vacío total y sin resultados, con una acción para limpiar filtros cuando corresponda.

### Requirement: Harness y evidencia verificable del listado

El sistema DEBE ofrecer un harness QA explícito y no persistente para forzar los estados del listado. DEBE permitir verificar paridad desktop/mobile, accesibilidad, conteos, filtros, paginación y la frontera de privacidad, sin requests de datos o API ni mutación de datos.

#### Scenario: QA de estados y responsive

- **Given** el harness QA está habilitado para verificación local
- **When** se fuerzan carga, error, vacío total y sin resultados en desktop y mobile
- **Then** DEBE mostrar el estado esperado sin romper tabla, tarjetas ni controles accesibles.

#### Scenario: QA de privacidad mock-only

- **Given** se ejecuta el checker contra listado, detalle y PDF mock existentes
- **When** inspecciona texto visible y solicitudes de red
- **Then** NO DEBE encontrar DNI completo, token completo, email, UUID, datos reales ni requests de datos o API mediante `fetch`, XHR, `/api/`, storage o backend.
- **And** PUEDE observar la navegación `document` local y los assets estáticos necesarios para servir la SPA.

### Requirement: Previsualización segura y handoff explícito

El sistema DEBE mostrar en `/admin/certificaciones/:id` un expediente mock-only con estado, alumno, curso, asistencias, documento réplica, auditoría, QR decorativo, zona de riesgo, `documentMasked`, `tokenPrefix` y URL truncada. `Descargar PDF` y `Regenerar PDF` DEBEN navegar a `/admin/certificaciones/:id/pdf`; `Copiar link`, `Entrega manual` y `Revocar certificación` DEBEN permanecer deshabilitadas con handoff F6-03, F5-04 y F6-01. El QR/token DEBE permanecer permanente. NO DEBE usar backend, HTTP, storage, sesión real, `X-Admin-Key`, PDF/QR real, dependencias nuevas, datos reales, DNI/token completos, email, legajo ni matrícula.

#### Scenario: Expediente de una certificación mock

- **Given** Bedelía abre un expediente con id mock válido
- **When** la pantalla carga
- **Then** DEBE mostrar datos seguros, URL truncada y permitir volver al listado.

#### Scenario: Handoff F4-02 habilitado y restantes diferidos

- **Given** Bedelía visualiza un expediente mock
- **When** selecciona una acción PDF o revisa los demás controles
- **Then** las acciones PDF DEBEN abrir la vista imprimible sin rotar QR/token.
- **And** los otros controles DEBEN continuar deshabilitados con su handoff explícito.

#### Scenario: Id inexistente, inválido o ausente

- **Given** el expediente recibe un id inexistente, inválido o ausente
- **When** se carga la ruta administrativa
- **Then** DEBE mostrar un estado seguro sin romper la navegación admin.

#### Scenario: Frontera de datos administrativa

- **Given** el expediente se renderiza en la UI admin
- **When** se inspecciona la información visible
- **Then** NO DEBE exponer datos prohibidos ni realizar solicitudes de red.

### Requirement: Paridad visual, folio imprimible y evidencia de verificación

El sistema DEBE mantener paridad visual igual o mejor que la referencia v0 del expediente y `vista-previa-pdf.tsx`, sin portar React/Next literalmente. La vista DEBE usar impresión nativa en A4 apaisado; sus controles no imprimibles DEBEN excluirse de la salida y conservarse los colores. En el folio DEBE listar cada fecha ISO de `attendedDates` sin resumirla como período. Un certificado `vigente` DEBE permanecer limpio; uno `borrador`, `vencido` o `revocado` DEBE exhibir su marca y banda textual correspondiente, sin impedir la impresión. La verificación DEBE dejar evidencia de tests/checks, build Angular y capturas desktop, mobile y print.

#### Scenario: Paridad visual de la vista imprimible

- **Given** existe una certificación mock válida
- **When** se compara la vista Angular con v0 en desktop y mobile
- **Then** DEBE conservar o mejorar jerarquía, layout, estados y acciones.

#### Scenario: Fechas asistidas exactas en el folio

- **Given** una certificación mock contiene una o más fechas en `attendedDates`
- **When** se carga su folio imprimible
- **Then** DEBE mostrar cada fecha ISO exacta y NO DEBE mostrar un resumen "dictado entre".

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

### Requirement: Documentación y archivo del ciclo

El sistema DEBE documentar durante `sdd-archive` que F4-02 agrega una vista imprimible mock-only y habilita sus enlaces desde F4-01. DEBE mantener fuera de alcance PDF/QR reales, backend, entrega, revocación, HTTP, storage, auth real y exposición de DNI/token completos.

#### Scenario: Cierre documental

- **Given** se archiva F4-02
- **When** se actualizan specs y documentación frontend
- **Then** DEBE constar el alcance mock-only, los archivos afectados y los handoffs F5-F6.
