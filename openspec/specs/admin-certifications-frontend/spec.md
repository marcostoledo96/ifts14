# Especificación — admin-certifications-frontend

## Propósito

Definir la UI administrativa Angular 20 para listar y previsualizar certificaciones ficticias, navegable, mock-only, contract-ready y testeable. Habilita la base de integración con emisión, PDF, entrega manual, revocación y listado real (F4-01/F4-02/F5-01/F5-04/F6-01). La UI admin DEBE mostrar DNI completo en `documentMasked`/`dniMostrar` (D0 2026-07-20). NO DEBE exponer tokens completos, datos reales, red, storage ni auth real. Logs, auditoría, errores y dumps NO DEBEN incluir DNI completo ni token completo.

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

### Requirement: Listado admin de certificaciones

El sistema DEBE mostrar en `/admin/certificaciones` un listado vía `CERTIFICATIONS_SOURCE.listar()` (HTTP o in-memory), sin inventar filas fuera del seam. DEBE filtrar por `vigente`|`revocado`, curso y texto (alumno, curso, `documentMasked`, número). Labels: `vigente` → **Válida**, `revocado` → **Revocado**. DEBE mostrar DNI completo (`documentMasked`). NO DEBE ofrecer «Estado de entrega» ni `borrador`/`vencido`/`pendiente`. DEBE paginar de a 20 con `paginasVisibles` (≤5 botones + elipsis; páginas >5 alcanzables). `mostrarResumen` DEBE ocultarse con `cargando` o `error`. Copy: «coincide»/«coinciden» según singular/plural. Distinguir vacío total vs sin coincidencias (limpiar filtros si aplica). Fallo: mensaje controlado + Reintentar; NO `errorRecuperable` ni raw `Error.message`. NO token completo ni DNI/token en mensajes/logs. CTA nueva y enlaces detalle/PDF DEBEN conservar rutas. Harness QA PUEDE existir solo fuera de prod/staging.

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

### Requirement: Harness y evidencia verificable del listado

En desarrollo y tests, el sistema DEBE ofrecer un harness QA explícito y no persistente para forzar los estados del listado. El harness NO DEBE renderizarse ni permitir mutaciones en builds de producción o staging. DEBE permitir verificar paridad desktop/mobile, accesibilidad, conteos, filtros, paginación y la frontera de privacidad, sin requests de datos o API ni mutación de datos.

#### Scenario: QA de estados y responsive

- **Given** el harness QA está habilitado para verificación local
- **When** se fuerzan carga, error, vacío total y sin resultados en desktop y mobile
- **Then** DEBE mostrar el estado esperado sin romper tabla, tarjetas ni controles accesibles.

#### Scenario: Harness ausente fuera de QA

- **Given** la aplicación se ejecuta en modo producción o staging
- **When** se renderiza el listado o se intenta invocar el cambio de vista QA
- **Then** NO DEBE mostrar controles QA ni permitir estados falsos de carga, error o vacío.

#### Scenario: QA de privacidad mock-only

- **Given** se ejecuta el checker contra listado, detalle y PDF mock existentes
- **When** inspecciona texto visible y solicitudes de red
- **Then** NO DEBE encontrar token completo, UUID, datos reales de personas ni requests de datos o API mediante `fetch`, XHR, `/api/`, storage o backend.
- **And** DEBE permitir `documentMasked`/`dniMostrar` con DNI completo visible en UI admin (D0).
- **And** PUEDE observar la navegación `document` local y los assets estáticos necesarios para servir la SPA.

### Requirement: Previsualización segura y handoff explícito

El sistema DEBE mostrar en `/admin/certificaciones/:id` un expediente con estado, alumno, curso, asistencias, documento réplica, auditoría, QR, zona de riesgo, `documentMasked`, `tokenPrefix` y URL truncada decorativa. `Descargar PDF` y `Regenerar PDF` DEBEN navegar a `/admin/certificaciones/:id/pdf`; `Revocar certificación` DEBE navegar a `/admin/certificaciones/:id/revocar`. El panel de acciones NO DEBE incluir el CTA «Entrega manual» ni «Compartir» (redundante con Copiar link). El panel Acciones DEBE ofrecer `Copiar link` y `Descargar QR`. El panel «Enlace de validación» DEBE ofrecer también `Copiar link` y `Descargar QR`. `Copiar link` DEBE usar la URL canónica de `obtenerEntregaManual().publicValidationUrl` (deshabilitado si revocado o sin URL). `Descargar QR` DEBE obtener el PNG vía `descargarQrPng` sin rotar token. Las autoridades de la réplica DEBEN venir de configuración institucional (`rectorName`/`advisorName` + roles); si la config falla o ambos nombres están vacíos, DEBE mostrar “Configuración institucional pendiente” sin bloquear Copiar/Descargar QR. El QR/token DEBE permanecer permanente. NO DEBE exponer token completo, legajo ni matrícula. DEBE mostrar DNI completo en `documentMasked`/`dniMostrar` (D0).

#### Scenario: Expediente de una certificación

- **Given** Bedelía abre un expediente con id válido
- **When** la pantalla carga
- **Then** DEBE mostrar datos seguros, URL truncada decorativa y permitir volver al listado.

#### Scenario: Acciones PDF, revocación, entrega y copy/QR

- **Given** Bedelía visualiza un expediente
- **When** selecciona PDF, revocación, o inspecciona Copiar link / Descargar QR
- **Then** las acciones PDF DEBEN abrir la vista imprimible sin rotar QR/token.
- **And** la revocación DEBE navegar a `/admin/certificaciones/:id/revocar`.
- **And** el panel Acciones NO DEBE mostrar «Entrega manual» ni «Compartir».
- **And** Copiar link DEBE usar la URL canónica de entrega-manual cuando el certificado no está revocado.
- **And** Descargar QR (en Acciones y en Enlace de validación) DEBE obtener el PNG vía `descargarQrPng` sin rotar token.

#### Scenario: Id inexistente, inválido o ausente

- **Given** el expediente recibe un id inexistente, inválido o ausente
- **When** se carga la ruta administrativa
- **Then** DEBE mostrar un estado seguro sin romper la navegación admin.

#### Scenario: Frontera de datos administrativa

- **Given** el expediente se renderiza en la UI admin
- **When** se inspecciona la información visible
- **Then** NO DEBE exponer token completo, legajo ni matrícula.
- **And** DEBE mostrar DNI completo en campos de documento del expediente (D0).

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
- **And** la impresión MUST usar `window.print()` (no generar PDF client-side inventado).

#### Scenario: Descargar PDF con seam API (P-13)

- **Given** la vista `/admin/certificaciones/:id/pdf` cargada y existe `GET /admin/certificados/{id}/pdf`
- **When** Bedelía pulsa **Descargar PDF**
- **Then** DEBE invocar `CertificationsService.descargarPdf(id)` (HttpClient blob) y disparar descarga `cert-{codigo}.pdf`
- **And** MUST NOT inventar un Blob sin respuesta del servicio
- **And** Imprimir MUST permanecer disponible en paralelo

#### Scenario: QR real en la vista imprimible

- **Given** la vista `/admin/certificaciones/:id/pdf` con id válido
- **When** la pantalla carga
- **Then** DEBE mostrar un PNG de QR vía `descargarQrPng(id)` (mismo endpoint/mock que entrega)
- **And** DEBE mostrar la URL canónica de `obtenerEntregaManual().publicValidationUrl`
- **And** NO DEBE usar la cuadrícula decorativa 8×8
- **And** el QR/token NO DEBE rotar

#### Scenario: Checker de aplicación real por estado

- **Given** el checker se ejecuta contra la aplicación Angular real para los ids `1`, `3`, `4` y `5`
- **When** inspecciona cada folio y su salida de impresión
- **Then** DEBE comprobar fechas, estado, privacidad y una única página A4 completa, sin clipping ni chrome administrativo.
- **And** NO DEBE encontrar token completo, matrícula ni legajo.
- **And** DEBE permitir DNI completo visible en UI admin (D0).

#### Scenario: Evidencia de checks en verify

- **Given** se ejecuta `sdd-verify`
- **When** se reportan resultados
- **Then** DEBE incluir rutas e ids, privacidad, handoffs, impresión, build y evidencia desktop/mobile/print.

### Requirement: Documentación y archivo del ciclo

El sistema DEBE documentar durante `sdd-archive` que F4-02 agrega una vista imprimible mock-only y habilita sus enlaces desde F4-01. DEBE mantener fuera de alcance PDF/QR reales, backend, entrega, revocación, HTTP, storage, auth real y exposición de tokens completos. Logs/auditoría/errores sin DNI ni token completos; UI admin con DNI completo (D0).

#### Scenario: Cierre documental

- **Given** se archiva F4-02
- **When** se actualizan specs y documentación frontend
- **Then** DEBE constar el alcance mock-only, los archivos afectados y los handoffs F5-F6.

### Requirement: Emisión directa de certificación (pantalla nueva)

El sistema DEBE exponer la ruta estática `/admin/certificaciones/nueva` **antes** de `/admin/certificaciones/:id`, con una pantalla única de emisión (no wizard) que orquesta seams existentes. El body de emisión DEBE ser exactamente `{ alumnoId, cursoId, issuedAt, expiresAt }`. Tras HTTP 201, DEBE navegar al expediente `/admin/certificaciones/:id`. NO DEBE inventar logos, firmas archivo ni folio definitivo antes del POST. NO DEBE eliminar la ruta ni deprecar CTAs existentes. El copy DEBE posicionar esta pantalla como emisión puntual (alumno+curso) frente al flujo habitual Asistencias (marcar en una fecha y generar desde ahí); NO DEBE usar «complementario». Fallo recuperable al cargar catálogos o elegibilidad del par: DEBE usar `errorRecuperable` y ofrecer Reintentar con mensaje controlado es-AR, SIN raw `Error.message`. Fallo de emit no mapeado (else): DEBE usar `mensajeErrorApi` o genérico es-AR, SIN Reintentar de load y SIN raw `Error.message`. Si se muestra DNI, DEBE ser completo. NO DEBE mostrar token completo ni incluir DNI/token en mensajes/logs. NO DEBE exigir cambios HTTP/backend ni rotación de token/QR.

#### Scenario: Ruta estática precede a :id

- **GIVEN** sesión admin activa
- **WHEN** se navega a `/admin/certificaciones/nueva`
- **THEN** DEBE cargar la pantalla de emisión y NO el detalle con id literal `"nueva"`.

#### Scenario: Emitir con éxito

- **GIVEN** un par alumno/curso con presentes elegibles sobre fechas `realizada`
- **WHEN** Bedelía confirma Emitir
- **THEN** DEBE enviarse `POST /admin/certificados` con el body de cuatro campos
- **AND** DEBE navegar al detalle del `data.id` recibido.

#### Scenario: Copy de rol edge vs Asistencias

- **GIVEN** sesión admin en `/admin/certificaciones/nueva`
- **WHEN** se lee el subtítulo (y nota CTA si existe)
- **THEN** DEBE indicar emisión puntual alumno+curso y que el flujo habitual es marcar asistencias en una fecha y generar desde ahí
- **AND** NO DEBE usar la palabra «complementario».

#### Scenario: Fallo recuperable de catálogos con Reintentar

- **GIVEN** fallo recuperable al cargar cursos, alumnos o config institucional
- **WHEN** se presenta el error
- **THEN** DEBE marcar `errorRecuperable` y ofrecer Reintentar con mensaje controlado
- **AND** NO DEBE pegar raw `Error.message` ni DNI/token
- **AND WHEN** se elige Reintentar
- **THEN** DEBE volver a cargar los catálogos.

#### Scenario: Fallo recuperable de par con Reintentar

- **GIVEN** fallo recuperable al evaluar elegibilidad del par (fechas/asistencias/vigente)
- **WHEN** se presenta el error de par
- **THEN** DEBE marcar `errorRecuperable` y ofrecer Reintentar con mensaje controlado
- **AND** NO DEBE pegar raw `Error.message` ni DNI/token
- **AND WHEN** se elige Reintentar
- **THEN** DEBE volver a evaluar el par.

#### Scenario: Emit else sin Reintentar ni raw Error.message

- **GIVEN** falla Emitir fuera de los status ya mapeados (409/400/500)
- **WHEN** se captura el error
- **THEN** DEBE mostrar mensaje vía `mensajeErrorApi` o genérico es-AR
- **AND** NO DEBE ofrecer Reintentar de load ni pegar raw `Error.message`
- **AND** el mensaje NO DEBE incluir DNI ni token.

#### Scenario: DNI completo y anti-token

- **GIVEN** la UI muestra documento del alumno (chip o preview)
- **WHEN** se renderiza la pantalla
- **THEN** el DNI DEBE verse completo
- **AND** NO DEBE aparecer token completo en la UI ni en mensajes/logs.

### Requirement: Emisión desde hub de fecha (camino feliz)

El camino operativo habitual del directivo DEBE ser Curso → Fecha → «Guardar y generar certificados» → página `…/asistencias/certificados` (spec `admin-attendances-frontend`). Esa orquestación reutiliza `CERTIFICATIONS_SOURCE.emitir` / `regenerarPdf` / `listar({ cursoId })` / `obtenerEntregaManual` / `descargarQrPng` / `descargarPdf`. La pantalla «Nueva certificación» permanece para casos edge. Entrega: Copiar link, Descargar QR, Descargar PDF (sin SMTP). Regenerar NO DEBE rotar token/QR.

#### Scenario: Generación desde presentes de una fecha

- **Given** Bedelía marcó presentes en el hub de fecha
- **When** confirma «Guardar y generar certificados»
- **Then** cada presente sin vigente DEBE emitir; cada presente con vigente DEBE regenerar PDF sin rotar token
- **And** DEBE redirigir a la página de certificados del curso con acciones link, QR y PDF.
