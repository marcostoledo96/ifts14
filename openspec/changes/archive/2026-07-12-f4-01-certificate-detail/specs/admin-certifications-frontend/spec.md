# Delta — admin-certifications-frontend

## ADDED Requirements

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

## MODIFIED Requirements

### Requirement: Previsualización segura y handoff explícito

El sistema DEBE reemplazar la previsualización mínima de `/admin/certificaciones/:id` por un expediente administrativo mock-only con estado, alumno, curso, asistencias, documento réplica, auditoría, QR decorativo y zona de riesgo. DEBE usar solo `documentMasked`, `tokenPrefix` y URL truncada; NO DEBE usar backend real, HTTP, `X-Admin-Key`, storage, cookies, IndexedDB, sesión real, DNI completo, token completo, email ni datos reales. Las acciones PDF, link, entrega, regeneración y revocación DEBEN permanecer deshabilitadas con handoff explícito.
(Previously: permitía una previsualización mock mínima con datos seguros, URL truncada, auditoría básica y acciones fuera de alcance.)

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

> **F4-02 diferido**: la réplica documental visible en F4-01 cubre el expediente; una ruta/vista PDF imprimible (F4-02) queda fuera de este cambio.
