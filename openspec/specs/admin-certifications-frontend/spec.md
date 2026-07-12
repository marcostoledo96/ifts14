# Especificación — admin-certifications-frontend

## Propósito

Definir la UI administrativa Angular 20 para listar y previsualizar certificaciones ficticias, navegable, mock-only, contract-ready y testeable. Habilita la base de integración con emisión, PDF, entrega manual, revocación y listado real (F4-01/F4-02/F5-01/F5-04/F6-01) sin exponer DNI completo administrativo, tokens completos, datos reales, red, storage ni auth real.

## Requirements

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

El sistema DEBE reemplazar la previsualización mínima de `/admin/certificaciones/:id` por un expediente administrativo mock-only con estado, alumno, curso, asistencias, documento réplica, auditoría, QR decorativo y zona de riesgo. DEBE usar solo `documentMasked`, `tokenPrefix` y URL truncada; NO DEBE usar backend real, HTTP, `X-Admin-Key`, storage, cookies, IndexedDB, sesión real, DNI completo, token completo, email ni datos reales. Las acciones PDF, link, entrega, regeneración y revocación DEBEN permanecer deshabilitadas con handoff explícito.

#### Scenario: Expediente de una certificación mock

- **Given** Bedelía abre `/admin/certificaciones/:id` con un id mock válido
- **When** la pantalla carga el expediente
- **Then** DEBE mostrar datos seguros, secciones administrativas y URL pública truncada.
- **And** DEBE permitir volver al listado.

#### Scenario: Acciones fuera de alcance

- **Given** Bedelía visualiza un expediente mock
- **When** revisa PDF, copiar link, entrega manual, regenerar o revocar
- **Then** cada acción DEBE estar deshabilitada y declarar su handoff: F4-02, F5-04, F6-03 o F6-01.

#### Scenario: Id inexistente, inválido o ausente

- **Given** la ruta contiene un id inexistente, inválido o ausente
- **When** se carga el expediente
- **Then** DEBE mostrar un estado seguro de no encontrado sin romper la navegación admin.

#### Scenario: Frontera de datos administrativa

- **Given** el expediente se renderiza en la UI admin
- **When** se inspecciona la información visible
- **Then** NO DEBE exponer DNI completo, token completo, email, legajo, matrícula ni datos reales.

### Requirement: Paridad visual y evidencia de verificación

El sistema DEBE mantener paridad visual igual o mejor que `muestra_pagina/app/admin/certificaciones/[id]` y `muestra_pagina/components/admin/expediente-certificacion.tsx`, sin portar React/Next literalmente. La verificación DEBE dejar evidencia de tests/checks y comparación de captura contra la referencia.

#### Scenario: Paridad visual del expediente

- **Given** existe un expediente mock válido
- **When** se compara la pantalla Angular con la referencia v0
- **Then** DEBE conservar o mejorar jerarquía, layout, secciones, estados y acciones visibles.

#### Scenario: Evidencia de checks en verify

- **Given** se ejecuta `sdd-verify`
- **When** se reportan resultados
- **Then** DEBE incluir tests/checks de privacidad, handoffs, id inválido y comparación de captura.

### Requirement: Documentación y archivo del ciclo

El sistema DEBE dejar documentado durante `sdd-archive` que F4-01 es la base frontend mock-only del expediente administrativo y que quedan fuera emisión real, PDF/QR, entrega manual, revocación, integración HTTP, storage, auth real, datos reales y exposición de DNI/token completos. F2-06 queda como antecedente de la previsualización mínima reemplazada por F4-01.

#### Scenario: Cierre documental

- **Given** se archiva F4-01
- **When** se actualizan los specs y la documentación frontend
- **Then** DEBE constar el alcance mock-only, los archivos afectados y el handoff hacia F4-F6.

> **F4-02 diferido**: la réplica documental visible en F4-01 cubre el expediente; una ruta/vista PDF imprimible (F4-02) queda fuera de este cambio.
