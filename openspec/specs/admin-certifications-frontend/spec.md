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

El sistema DEBE mostrar en `/admin/certificaciones/:id` un expediente con estado, alumno, curso, asistencias, réplica (firmas reales si hay imagen; SVG solo fallback), auditoría, QR, zona de riesgo, `documentMasked`, `tokenPrefix` y URL truncada en validación. `revocado` DEBE ser visible. `Descargar PDF` DEBE navegar a `/admin/certificaciones/:id/pdf`. `Regenerar PDF` DEBE invocar seam `regenerarPdf` (NO navegar a `/pdf`; NO rotar token/QR). `Revocar` DEBE navegar a `…/:id/revocar`. Acciones: `Copiar link` + `Descargar QR`; NO «Entrega manual» ni «Compartir». Panel validación: mismos CTAs. `Copiar link` DEBE usar canónica de `obtenerEntregaManual().publicValidationUrl` (off si revocado/sin URL). `Descargar QR` vía `descargarQrPng` sin rotar. Soft config/entrega DEBEN permanecer. Autoridades desde config; vacío/fallo → “Configuración institucional pendiente” sin bloquear Copiar/QR. Load hard recuperable: mensaje fijo es-AR (*«No se pudo cargar la certificación.»*) + Reintentar→`cargar()`. Id inválido/not-found distinguible: SIN Reintentar. Errores QR/regen: `mensajeErrorApi` P15-strict o genérico; SIN raw `Error.message`. Post-regen: NO `publicValidationUrl` completa (truncar/omitir); nota permanencia QR OK; clipboard PUEDE usar canónica. NO exigir `errorRecuperable`. NO token completo/legajo/matrícula. DNI completo (D0).

#### Scenario: Expediente de una certificación

- **GIVEN** id válido
- **WHEN** carga el expediente
- **THEN** DEBE mostrar datos seguros, firmas reales si hay imagen, URL truncada y volver al listado
- **AND** si `revocado`, DEBE mostrarlo visible.

#### Scenario: Acciones PDF, revocación, entrega y copy/QR

- **GIVEN** expediente visible
- **WHEN** Bedelía usa PDF, Regenerar, revocar, Copiar o Descargar QR
- **THEN** `Descargar PDF` DEBE ir a `…/:id/pdf` sin rotar token
- **AND** `Regenerar PDF` DEBE llamar `regenerarPdf` y NO navegar a `/pdf`
- **AND** revocar DEBE ir a `…/:id/revocar`
- **AND** NO «Entrega manual» ni «Compartir»; Copiar usa canónica; QR vía `descargarQrPng`.

#### Scenario: Post-regen sin URL canónica completa

- **GIVEN** regen OK con `publicValidationUrl`
- **WHEN** se renderiza el resultado
- **THEN** NO DEBE mostrar la URL completa (truncar u omitir)
- **AND** PUEDE mostrar éxito + nota de permanencia QR.

#### Scenario: Fallo hard recuperable con Reintentar

- **GIVEN** fallo recuperable al `obtener` detalle
- **WHEN** se muestra el error
- **THEN** mensaje controlado es-AR sin raw `Error.message` + Reintentar→`cargar()`
- **AND** NO DEBE exigir `errorRecuperable`.

#### Scenario: Id inválido o not-found sin Reintentar

- **GIVEN** id inválido, ausente o not-found distinguible
- **WHEN** carga la ruta
- **THEN** estado seguro sin romper admin
- **AND** NO Reintentar.

#### Scenario: Fallo QR o regeneración sin raw

- **GIVEN** falla `descargarQr` o `regenerarPdf`
- **WHEN** se captura el error
- **THEN** `mensajeErrorApi` P15-strict o genérico es-AR
- **AND** SIN raw `Error.message`, SIN Reintentar de load, SIN DNI/token en mensaje.

#### Scenario: Soft config y entrega no bloqueantes

- **GIVEN** fallo soft de config o entrega-manual
- **WHEN** el detalle hard ya cargó
- **THEN** el expediente DEBE seguir usable con el patrón soft existente.

#### Scenario: Frontera de datos administrativa

- **GIVEN** UI admin del expediente
- **WHEN** se inspeccionan datos y mensajes
- **THEN** NO token completo, legajo ni matrícula
- **AND** DNI completo (D0).

### Requirement: Paridad visual, folio imprimible y evidencia de verificación

El sistema DEBE mantener paridad visual ≥ v0 (`vista-previa-pdf.tsx`) sin portar React/Next. En `/admin/certificaciones/:id/pdf` DEBE renderizar folio A4 apaisado **1 página**, firmas **3:2**; excluir chrome no imprimible; listar cada ISO de `attendedDates` (sin “dictado entre”). `vigente` limpio; `borrador`/`vencido`/`revocado` con marca+banda (revocado visible) sin bloquear impresión. Pie **SIN** disclaimers/textos institucionales no deseados. Verify: tests, build, capturas desktop/mobile/print.

**Imprimir** = `window.print()` A4 landscape 1 pág. **Descargar PDF** = captura folio visible (html2canvas+jsPDF) → `cert-{codigo}.pdf` semántico (preferir `detalle.numero`); **NO** `CertificationsService.descargarPdf` ni blob API. QR = PNG canónico de `publicValidationUrl` completa (UI PUEDE truncar); **NO** rotar token/QR; **NO** token/matrícula/legajo completos; DNI completo UI (D0).

Load hard recuperable: *«No se pudo cargar la certificación.»* + `errorRecuperable=true` + Reintentar→`load()`. Not-found/id inválido: mensaje controlado **SIN** Reintentar/`errorRecuperable`. Fallo descarga: `mensajeErrorApi`/genérico (*«No se pudo generar el PDF.»*) **SIN** Reintentar/`errorRecuperable`/raw `Error.message`. Soft config/QR no bloqueantes.

#### Scenario: Paridad visual de la vista imprimible

- **GIVEN** certificación mock válida
- **WHEN** se compara Angular vs v0 (desktop/mobile)
- **THEN** DEBE conservar o mejorar jerarquía, layout, estados y acciones.

#### Scenario: Fechas asistidas exactas en el folio

- **GIVEN** `attendedDates` con una o más fechas
- **WHEN** carga el folio
- **THEN** DEBE mostrar cada ISO; NO resumen "dictado entre".

#### Scenario: Identificación de estados no vigentes

- **GIVEN** folio `vigente`|`borrador`|`vencido`|`revocado`
- **WHEN** se renderiza
- **THEN** solo `vigente` limpio; no vigentes (incl. revocado) con marca+banda sin bloquear impresión.

#### Scenario: Impresión nativa A4 una página

- **GIVEN** vista imprimible cargada
- **WHEN** Bedelía imprime
- **THEN** A4 apaisado 1 página, firmas 3:2, sin chrome admin
- **AND** MUST usar `window.print()`.

#### Scenario: Descargar PDF por captura del folio visible

- **GIVEN** `/admin/certificaciones/:id/pdf` con folio visible
- **WHEN** pulsa **Descargar PDF**
- **THEN** html2canvas+jsPDF → `cert-{codigo}.pdf`
- **AND** MUST NOT `CertificationsService.descargarPdf` ni Blob API
- **AND** Imprimir permanece disponible.

#### Scenario: Filename semántico

- **GIVEN** detalle con `numero` o id
- **WHEN** se nombra la descarga
- **THEN** `cert-{codigo}.pdf` preferiendo `detalle.numero`.

#### Scenario: QR canónico sin rotación

- **GIVEN** id válido en vista PDF
- **WHEN** carga
- **THEN** QR PNG (`descargarQrPng`/fallback) codifica URL canónica completa
- **AND** UI PUEDE truncar URL; NO grid 8×8 ni rotar token/QR.

#### Scenario: Pie sin disclaimers

- **GIVEN** folio renderizado
- **WHEN** se inspecciona el pie imprimible
- **THEN** NO disclaimers ni textos institucionales no deseados.

#### Scenario: Fallo hard recuperable con Reintentar

- **GIVEN** fallo recuperable al `obtener`
- **WHEN** se muestra error
- **THEN** mensaje fijo es-AR sin raw + `errorRecuperable=true` + Reintentar→`load()`.

#### Scenario: Id inválido o not-found sin Reintentar

- **GIVEN** id inválido/ausente/not-found
- **WHEN** carga la ruta PDF
- **THEN** mensaje controlado; NO Reintentar ni `errorRecuperable`.

#### Scenario: Fallo de descarga sin Reintentar ni raw

- **GIVEN** falla captura/generación PDF
- **WHEN** se captura el error
- **THEN** mensaje controlado sin raw; NO Reintentar ni `errorRecuperable`.

#### Scenario: Checker de aplicación real por estado

- **GIVEN** checker sobre ids `1`,`3`,`4`,`5`
- **WHEN** inspecciona folio/impresión
- **THEN** fechas, estado, privacidad, 1 página A4 sin clipping/chrome
- **AND** NO token/matrícula/legajo completos; DNI completo UI OK (D0).

#### Scenario: Evidencia de checks en verify

- **GIVEN** `sdd-verify`
- **WHEN** se reportan resultados
- **THEN** rutas/ids, privacidad, handoffs, impresión, build, evidencia desktop/mobile/print.

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

### Requirement: Diálogo revocar — honesty de carga

En `/admin/certificaciones/:id/revocar` el sistema DEBE cargar el detalle vía `CERTIFICATIONS_SOURCE.obtener(id)`. Fallo hard recuperable: DEBE mostrar mensaje fijo es-AR (*«No se pudo cargar la certificación.»*), marcar `errorRecuperable=true` y ofrecer Reintentar → recarga. Not-found / id inválido distinguible: mensaje controlado SIN Reintentar ni `errorRecuperable`. DEBE NOT pegar raw `Error.message`. Señales de carga (`error` / `errorRecuperable`) DEBEN permanecer separadas del error de submit. DNI completo en ficha (D0); DEBE NOT token completo ni DNI/token en mensajes/logs.

#### Scenario: Load recuperable con Reintentar

- **GIVEN** fallo recuperable al `obtener` en `/revocar`
- **WHEN** termina la carga
- **THEN** mensaje fijo es-AR sin raw; `errorRecuperable=true`; Reintentar → recarga

#### Scenario: Not-found sin Reintentar

- **GIVEN** id inválido, ausente o not-found distinguible
- **WHEN** carga `/revocar`
- **THEN** mensaje controlado; DEBE NOT Reintentar ni `errorRecuperable`

#### Scenario: Load sin raw Error.message

- **GIVEN** cualquier fallo de carga
- **WHEN** se muestra el panel de error
- **THEN** DEBE NOT pegar raw `Error.message` ni DNI/token en el mensaje

### Requirement: Diálogo revocar — submit P15-strict y MOTIVO_MAX

Al confirmar revocación el sistema DEBE invocar `CERTIFICATIONS_SOURCE.revocar` con motivo sanitizado. Fallo de POST: DEBE mostrar error **inline** en el diálogo vía `mensajeErrorApi` P15-strict (envelope) o genérico es-AR (*«No se pudo revocar la certificación.»*); DEBE NOT reusar el overlay de carga; DEBE NOT `errorRecuperable` ni Reintentar de load por fallo de submit; DEBE NOT raw `Error.message`. Éxito: DEBE navegar al expediente con `?revocada=1` (flash UI diferido; re-fetch de estado basta). `MOTIVO_MAX` DEBE ser **180** (maxlength + validator; paridad backend). DEBE NOT rotar token/QR salvo revocación explícita vía seam.

#### Scenario: Submit inline sin overlay ni raw

- **GIVEN** diálogo cargado y `revocar` falla
- **WHEN** Bedelía confirma
- **THEN** error inline vía `mensajeErrorApi`/fallback; diálogo intacto
- **AND** DEBE NOT overlay de carga, `errorRecuperable`, Reintentar de load ni raw

#### Scenario: Éxito navega expediente

- **GIVEN** revocación OK
- **WHEN** termina el POST
- **THEN** navega a `…/:id` con `?revocada=1` sin exigir flash UI en este ciclo

#### Scenario: Motivo acotado a 180

- **GIVEN** formulario de motivo visible
- **WHEN** se valida maxlength / validator
- **THEN** `MOTIVO_MAX` DEBE ser 180

### Requirement: Diálogo revocar — confirmación, copy y sanitize

El diálogo DEBE exigir confirmación explícita (checkbox) antes de habilitar revocar; DEBE mostrar copy de consecuencias (estado público / QR revocado; ayuda motivo; aviso auditoría). Motivo obligatorio (mínimo vigente) DEBE sanitizarse en cliente (DNI/token UUID/email → placeholders) antes del POST. Deep-link no vigente DEBE bloquear el form. Escape DEBE volver al expediente. DEBE NOT reescribir copy de consecuencias salvo typo. DEBE NOT tocar delivery P20, validación pública P22 ni backend `admin-certificate-revocation` en este ciclo.

#### Scenario: Confirmación y consecuencias

- **GIVEN** diálogo con certificación vigente cargada
- **WHEN** se inspecciona UI
- **THEN** checkbox de confirmación + banner de consecuencias visibles
- **AND** sin confirmar, DEBE NOT permitir revocar

#### Scenario: Sanitize motivo antes del POST

- **GIVEN** motivo con DNI/token/email
- **WHEN** Bedelía confirma revocar
- **THEN** el body DEBE usar motivo sanitizado (placeholders)
- **AND** DEBE NOT enviar DNI/token completos en el motivo

#### Scenario: No vigente bloquea form

- **GIVEN** certificación no vigente / ya revocada
- **WHEN** abre `/revocar`
- **THEN** DEBE bloquear el formulario de revocación

### Requirement: CERT-PERF-01 — Carga diferida de html2canvas-pro y jspdf

La vista `/admin/certificaciones/:id/pdf` DEBE NOT cargar `html2canvas-pro` ni `jspdf` al abrir/renderizar el folio. DEBEN cargarse solo al ejecutar **Descargar PDF** (import dinámico). Filename (`cert-{codigo}.pdf`), captura del folio, D0 e **Imprimir** (`window.print()`) DEBEN permanecer sin cambio de contrato. Fallo DEBE seguir error controlado existente (sin Reintentar/`errorRecuperable`/raw).

#### Scenario: Abrir PDF no baja deps de captura

- **GIVEN** navegación a `/admin/certificaciones/:id/pdf` con id válido
- **WHEN** el folio se renderiza sin pulsar **Descargar PDF**
- **THEN** chunks de `html2canvas-pro` y `jspdf` NO DEBEN solicitarse
- **AND** Imprimir y el folio DEBEN seguir disponibles

#### Scenario: Descarga dispara import dinámico

- **GIVEN** folio visible en la vista PDF
- **WHEN** Bedelía pulsa **Descargar PDF**
- **THEN** DEBE cargar `html2canvas-pro` y `jspdf` en ese momento
- **AND** DEBE generar `cert-{codigo}.pdf` por captura del folio
- **AND** NO DEBE usar `CertificationsService.descargarPdf` ni blob API

#### Scenario: Fallo de deps o captura sin regresión UX

- **GIVEN** falla el import dinámico o la generación PDF
- **WHEN** se captura el error
- **THEN** mensaje controlado (*«No se pudo generar el PDF.»* o `mensajeErrorApi`)
- **AND** NO Reintentar/`errorRecuperable`/raw; D0 vigente en camino feliz
