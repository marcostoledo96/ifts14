# Delta — admin-certifications-frontend

## MODIFIED Requirements

### Requirement: Rutas protegidas de certificaciones

El sistema DEBE exponer `/admin/certificaciones`, `/admin/certificaciones/:id` y `/admin/certificaciones/:id/pdf` como rutas administrativas protegidas por la sesión mock vigente, sin alterar rutas públicas ni el resto del panel.
(Antes: solo se exponían el listado y el expediente.)

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

### Requirement: Previsualización segura y handoff explícito

El sistema DEBE mostrar en `/admin/certificaciones/:id` un expediente mock-only con estado, alumno, curso, asistencias, documento réplica, auditoría, QR decorativo, zona de riesgo, `documentMasked`, `tokenPrefix` y URL truncada. `Descargar PDF` y `Regenerar PDF` DEBEN navegar a `/admin/certificaciones/:id/pdf`; `Copiar link`, `Entrega manual` y `Revocar certificación` DEBEN permanecer deshabilitadas con handoff F6-03, F5-04 y F6-01. El QR/token DEBE permanecer permanente. NO DEBE usar backend, HTTP, storage, sesión real, `X-Admin-Key`, PDF/QR real, dependencias nuevas, datos reales, DNI/token completos, email, legajo ni matrícula.
(Antes: todas las acciones, incluidas las PDF, estaban deshabilitadas con handoff.)

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

### Requirement: Paridad visual y evidencia de verificación

El sistema DEBE mantener paridad visual igual o mejor que la referencia v0 del expediente y `vista-previa-pdf.tsx`, sin portar React/Next literalmente. La vista DEBE usar impresión nativa en A4 apaisado; sus controles no imprimibles DEBEN excluirse de la salida y conservarse los colores. La verificación DEBE dejar evidencia de tests/checks, build Angular y capturas desktop, mobile y print.
(Antes: la paridad y evidencia solo cubrían el expediente F4-01.)

#### Scenario: Paridad visual de la vista imprimible

- **Given** existe una certificación mock válida
- **When** se compara la vista Angular con v0 en desktop y mobile
- **Then** DEBE conservar o mejorar jerarquía, layout, estados y acciones.

#### Scenario: Impresión nativa segura

- **Given** la vista imprimible está cargada
- **When** Bedelía ejecuta la impresión nativa
- **Then** DEBE aplicarse A4 apaisado y excluir los controles no imprimibles.
- **And** NO DEBE generarse ni descargarse un PDF real.

#### Scenario: Evidencia de checks en verify

- **Given** se ejecuta `sdd-verify`
- **When** se reportan resultados
- **Then** DEBE incluir rutas e ids, privacidad, handoffs, impresión, build y evidencia desktop/mobile/print.

### Requirement: Documentación y archivo del ciclo

El sistema DEBE documentar durante `sdd-archive` que F4-02 agrega una vista imprimible mock-only y habilita sus enlaces desde F4-01. DEBE mantener fuera de alcance PDF/QR reales, backend, entrega, revocación, HTTP, storage, auth real y exposición de DNI/token completos.
(Antes: F4-02 figuraba como diferido.)

#### Scenario: Cierre documental

- **Given** se archiva F4-02
- **When** se actualizan specs y documentación frontend
- **Then** DEBE constar el alcance mock-only, los archivos afectados y los handoffs F5-F6.
