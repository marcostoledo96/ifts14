# Delta for admin-certifications-frontend

## RENAMED Requirements

### Requirement: Listado mock-only con datos seguros → Listado admin de certificaciones

(Reason: Ya no es mock-only; carga vía seam HTTP/`CERTIFICATIONS_SOURCE`.)
(Migration: Referencias docs/QA/tests → nuevo nombre; MODIFIED reemplaza el contenido.)

## MODIFIED Requirements

### Requirement: Listado admin de certificaciones

El sistema DEBE mostrar en `/admin/certificaciones` un listado vía `CERTIFICATIONS_SOURCE.listar()` (HTTP o in-memory), sin inventar filas fuera del seam. DEBE filtrar por `vigente`|`revocado`, curso y texto (alumno, curso, `documentMasked`, número). Labels: `vigente` → **Válida**, `revocado` → **Revocado**. DEBE mostrar DNI completo (`documentMasked`). NO DEBE ofrecer «Estado de entrega» ni `borrador`/`vencido`/`pendiente`. DEBE paginar de a 20 con `paginasVisibles` (≤5 botones + elipsis; páginas >5 alcanzables). `mostrarResumen` DEBE ocultarse con `cargando` o `error`. Copy: «coincide»/«coinciden» según singular/plural. Distinguir vacío total vs sin coincidencias (limpiar filtros si aplica). Fallo: mensaje controlado + Reintentar; NO `errorRecuperable` ni raw `Error.message`. NO token completo ni DNI/token en mensajes/logs. CTA nueva y enlaces detalle/PDF DEBEN conservar rutas. Harness QA PUEDE existir solo fuera de prod/staging.
(Previously: mock-only; filtros validez+entrega+curso con borrador/vencido; pager fijo; sin honesty/seam ni `paginasVisibles`/`mostrarResumen`.)

#### Scenario: Carga vía seam listar

- **GIVEN** sesión admin activa
- **WHEN** se abre `/admin/certificaciones`
- **THEN** DEBE cargar el listado vía `CERTIFICATIONS_SOURCE.listar()`
- **AND** NO DEBE inventar filas fuera de ese seam.

#### Scenario: Filtro por estado vigente o revocado

- **GIVEN** hay certificaciones vigentes y revocadas
- **WHEN** Bedelía filtra por `vigente` o `revocado`
- **THEN** DEBE ver solo coincidencias de ese estado
- **AND** el badge DEBE mostrar **Válida** o **Revocado** según corresponda
- **AND** NO DEBE ofrecer `borrador`, `vencido` ni `pendiente`.

#### Scenario: Filtros y búsqueda combinables sin entrega

- **GIVEN** el listado tiene distintos estados y cursos
- **WHEN** Bedelía combina estado, curso y texto
- **THEN** DEBE aplicar la intersección y actualizar conteos
- **AND** NO DEBE existir filtro «Estado de entrega».

#### Scenario: DNI completo y anti-token

- **GIVEN** una certificación visible en tabla o tarjeta
- **WHEN** se revisan datos visibles y mensajes de error
- **THEN** DEBE mostrar `documentMasked` con DNI completo
- **AND** NO DEBE mostrar token completo ni DNI/token en logs o mensajes.

#### Scenario: Paginación con paginasVisibles

- **GIVEN** hay más de cinco páginas de coincidencias (20 por página)
- **WHEN** Bedelía navega el pager
- **THEN** DEBE ver como máximo cinco botones de página más elipsis
- **AND** DEBE poder alcanzar páginas mayores a 5
- **AND** al cambiar filtros DEBE reiniciar o acotar la página a un rango válido.

#### Scenario: Resumen gated y grammar de coincidencias

- **GIVEN** el listado está cargando o en error
- **WHEN** se renderiza la pantalla
- **THEN** NO DEBE mostrar el resumen de conteo
- **AND GIVEN** hay resultados sin carga ni error
- **WHEN** el conteo es 1 o mayor a 1
- **THEN** DEBE usar «coincide» o «coinciden» según corresponda.

#### Scenario: Vacíos y fallo recuperable de listado

- **GIVEN** vacío total, sin coincidencias de filtros, o fallo al listar
- **WHEN** se renderiza cada condición
- **THEN** DEBE distinguir vacío total, sin resultados (con limpiar filtros) y error
- **AND** el error DEBE ofrecer Reintentar con mensaje controlado
- **AND** NO DEBE usar `errorRecuperable` ni raw `Error.message`.

#### Scenario: Navegación a detalle y PDF

- **GIVEN** una certificación visible
- **WHEN** Bedelía elige detalle o PDF
- **THEN** DEBE navegar a la ruta admin vigente sin rotar QR/token.

#### Scenario: QA de vistas opcional fuera de prod

- **GIVEN** build de producción o staging
- **WHEN** se renderiza el listado
- **THEN** NO DEBE mostrar controles QA ni forzar estados falsos
- **AND** en desarrollo/tests el harness PUEDE forzar carga/error/vacíos.
