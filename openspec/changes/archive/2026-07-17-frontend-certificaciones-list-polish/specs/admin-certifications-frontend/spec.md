# Delta: admin-certifications-frontend

See consolidated requirements in `../../spec.md` (REQ-CERTLIST-001…007).

## ADDED Requirements

Covered by REQ-CERTLIST-001…007 in change root `spec.md`: CTA nueva, badge validez dot+borde, empty Inbox+emitir, loading/error SVG, chips estado sin entrega, anti-`envio`, privacidad.

## MODIFIED Requirements

### Requirement: Listado mock-only con datos seguros

El sistema DEBE mostrar un listado navegable de certificaciones, filtrable por validez (`estado`) y curso, y buscable por alumno, `documentMasked`, curso o número. DEBE basarse en el seam `CertificationsService` (in-memory o HTTP) sin inventar campos ausentes del contrato de listado. MUST NOT filtrar ni mostrar entrega/`envio` hasta que exista campo en el DTO de listado. Debe presentar conteos de total, coincidencias y elementos visibles; tabla semántica en desktop y tarjetas equivalentes en mobile.
(Previously: exigía filtros por entrega/`envio` mock-only y datos exclusivamente locales sin seam HTTP.)

#### Scenario: Listado filtrado por estado

- **Given** existe un conjunto de certificaciones
- **When** Bedelía filtra por `borrador`, `vigente`, `revocado` o `vencido`
- **Then** DEBE ver solo coincidencias y un mensaje claro si no hay resultados.

#### Scenario: Frontera de datos segura

- **Given** una certificación aparece en el listado
- **When** se revisan sus datos visibles
- **Then** DEBE mostrar `documentMasked` y datos seguros.
- **And** NO DEBE mostrar DNI completo, token completo, email, matrícula, legajo, UUID ni datos reales prohibidos.

#### Scenario: Filtros y búsqueda combinables

- **Given** el listado contiene distintas validez y cursos
- **When** Bedelía combina filtros de estado/curso y una búsqueda segura
- **Then** DEBE aplicar la intersección y actualizar los conteos correctamente.
- **And** NO DEBE exponer filtro ni columna de entrega/`envio`.

#### Scenario: Paginación y cambio de resultados

- **Given** hay más de cinco coincidencias o la página activa deja de existir
- **When** Bedelía cambia filtros, búsqueda o página
- **Then** DEBE mostrar cinco elementos por página y reiniciar o acotar la página a un rango válido.

#### Scenario: Navegación conservada desde ambas vistas

- **Given** una certificación visible en tabla o tarjeta
- **When** Bedelía selecciona su detalle o PDF existente
- **Then** DEBE navegar a la ruta administrativa vigente sin cambiar el id, QR ni token.

#### Scenario: Estados no exitosos y vacíos

- **Given** el listado está cargando, falla, no tiene ítems o los filtros no coinciden
- **When** se renderiza cada condición
- **Then** DEBE distinguir carga, error, vacío total y sin resultados, con SVG donde aplique (REQ-CERTLIST-003/004) y acción para limpiar filtros o emitir cuando corresponda.
