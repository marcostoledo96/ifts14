# Delta para admin-certifications-frontend

## MODIFIED Requirements

### Requirement: Listado mock-only con datos seguros

El sistema DEBE mostrar un listado navegable de certificaciones ficticias, filtrable por validez, entrega y curso, y buscable por alumno, `documentMasked`, curso o número ficticio. DEBE usar únicamente mocks locales, incluidos `envio` y `numero`, sin requests de datos o API (`fetch`, XHR, `/api/`, storage o backend), cookies, IndexedDB, claves admin ni datos reales. La navegación `document` local y los assets estáticos necesarios para servir la SPA están permitidos. Debe presentar conteos de total, coincidencias y elementos visibles; tabla semántica en desktop y tarjetas equivalentes en mobile.

(Previously: filtraba solo por estado y no definía búsqueda, paginación, vistas responsive ni estados de carga.)

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

## ADDED Requirements

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
