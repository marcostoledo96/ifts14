# Delta — admin-certifications-frontend

## ADDED Requirements

### Requirement: Rutas protegidas de certificaciones

El sistema DEBE exponer `/admin/certificaciones` y `/admin/certificaciones/:id` como rutas administrativas protegidas por la sesión mock vigente, sin alterar las rutas públicas ni el resto del panel admin.

#### Scenario: Acceso con sesión mock

- **Given** existe una sesión mock activa
- **When** se navega a `/admin/certificaciones` o `/admin/certificaciones/:id`
- **Then** DEBE cargarse el listado o la previsualización correspondiente.

#### Scenario: Acceso sin sesión mock

- **Given** no existe una sesión mock activa
- **When** se navega directo a una ruta de certificaciones
- **Then** DEBE aplicarse la protección administrativa vigente.

### Requirement: Listado mock-only con datos seguros

El sistema DEBE mostrar un listado navegable de certificaciones ficticias, filtrable por estado, usando únicamente datos seguros de demostración. NO DEBE usar HTTP, storage, cookies, IndexedDB, claves admin, datos reales, DNI completo, token completo ni correo electrónico.

#### Scenario: Listado filtrado por estado

- **Given** existe un conjunto mock de certificaciones
- **When** Bedelía filtra por `borrador`, `vigente`, `revocado` o `vencido`
- **Then** DEBE ver solo coincidencias ficticias y un mensaje claro si no hay resultados.

#### Scenario: Frontera de datos segura

- **Given** una certificación aparece en el listado
- **When** se revisan sus datos visibles
- **Then** DEBE mostrar `documentMasked` y datos ficticios.
- **And** NO DEBE mostrar DNI completo, token completo, email, matrícula, legajo ni datos reales.

### Requirement: Previsualización segura y handoff explícito

El sistema DEBE permitir previsualizar una certificación mock con `documentMasked`, `tokenPrefix`, URL pública truncada, fechas asistidas y auditoría mínima. Las acciones de emisión, PDF, entrega manual, revocación y listado real DEBEN permanecer deshabilitadas o marcadas como handoff.

#### Scenario: Previsualización de una certificación mock

- **Given** Bedelía abre `/admin/certificaciones/:id` con un id mock válido
- **When** la pantalla carga la certificación
- **Then** DEBE mostrar datos seguros y una URL pública truncada.
- **And** DEBE permitir volver al listado.

#### Scenario: Acción fuera de alcance

- **Given** Bedelía visualiza una certificación mock
- **When** revisa acciones de emitir, descargar PDF, entrega manual o revocar
- **Then** DEBEN estar deshabilitadas o señaladas como handoff de F4-F6.

#### Scenario: Id inexistente o inválido

- **Given** la ruta contiene un id inexistente o inválido
- **When** se carga la previsualización
- **Then** DEBE mostrar un estado de no encontrado sin romper la navegación admin.

### Requirement: Documentación y archivo del ciclo

El sistema DEBE dejar documentado durante `sdd-archive` que F2-06 es una base frontend mock-only y que quedan fuera emisión real, PDF/QR, entrega manual, revocación, integración HTTP, storage, auth real, datos reales y exposición de DNI/token completos.

#### Scenario: Cierre documental

- **Given** se archiva F2-06
- **When** se actualizan los specs y la documentación frontend
- **Then** DEBE constar el alcance mock-only, los archivos afectados y el handoff hacia F4-F6.
