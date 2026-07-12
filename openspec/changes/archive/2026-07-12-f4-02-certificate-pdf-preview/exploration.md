# Exploración — F4-02 Vista previa PDF complementario

**Change**: `f4-02-certificate-pdf-preview`
**Tipo**: exploration (planning, no implementación)
**Proyecto**: `ifts14`
**Fecha**: 2026-07-12
**Almacén de artefactos**: OpenSpec + Engram (hybrid)
**Base de partida**: `main` (F4-01 mergeado en `oke399833` / PR #38; rama `frontend/certificate-detail-pdf` ya cerrada)

## Resumen ejecutivo

F4-02 es la **vista previa imprimible** del certificado de curso, materializada en una nueva ruta `/admin/certificaciones/:id/pdf`. Materializa los handoffs `F4-02` que F4-01 dejó visibles y deshabilitados en los CTAs `Descargar PDF` y `Regenerar PDF` del expediente `/admin/certificaciones/:id`. La página es **mock-only** y **presentational**: reutiliza el seam `CERTIFICATIONS_SOURCE` y los modelos de F2-06/F4-01, **no** genera PDFs reales del lado backend, **no** rota el token/QR, **no** envía email y **no** persiste. La experiencia imprimible se logra con `window.print()` + `@media print` + `@page { size: A4 landscape; margin: 0; }` + clase `.no-print` propia (sin Tailwind). La paridad visual se evalúa contra `muestra_pagina/components/admin/vista-previa-pdf.tsx` (416 líneas) y `muestra_pagina/app/admin/certificaciones/[id]/pdf/page.tsx`, portada a Angular 20 con CSS local y tokens globales (`--color-ink`, `--color-circuit`, `--color-tech-blue`, `--color-warning`).

## Quick path

1. Confirmar `main` con F4-01 mergeado y árbol limpio.
2. Abrir change `f4-02-certificate-pdf-preview` con `sdd-new` y ejecutar el pipeline completo (explore → propose → spec → design → tasks → apply → verify → archive).
3. Crear rama nueva `frontend/certificate-pdf-preview` desde `main` (la rama `frontend/certificate-detail-pdf` ya cerró; la guía unificada proponía una sola rama para F4-01 y F4-02, pero F4-01 ya mergeó).
4. Implementar la página standalone `pages/pdf/certification-pdf-preview-page.{ts,html,css,spec.ts}` y registrar la ruta `admin/certificaciones/:id/pdf` **antes** de `certificaciones/:id` en `app.routes.ts`.
5. En F4-01, actualizar el delta: los CTAs `Descargar PDF` y `Regenerar PDF` del expediente cambian de `disabled` a `routerLink` hacia `/admin/certificaciones/:id/pdf` (handoff ejecutado) y el botón `Imprimir` se mantiene como atajo a la misma ruta.

## Estado actual (post F4-01)

| Capa | Estado | Evidencia |
|---|---|---|
| F4-01 Expediente | ✅ merge rama `frontend/certificate-detail-pdf` (PR #38) en `oke399833` | `openspec/changes/archive/2026-07-12-f4-01-certificate-detail/`, verify-report.md PASS WITH WARNINGS (CSS budget) |
| Handoff F4-02 visible | ✅ Implementado | `certification-preview-page.html:95` y `:104` muestran `Descargar PDF` y `Regenerar PDF` con `<span class="handoff">{{ handoffs.pdf }}</span>` (= "F4-02"). Constante en `certification-preview-page.ts:67`. |
| Documento réplica F4-01 | Visible en panel admin (no imprimible, layout 2 columnas con columna de control) | `.documento-replica` con encabezado navy, declaración, tabla de asistencia, autoridades (`Autoridad Demo Uno/Dos`), QR decorativo, trazabilidad. |
| Referencia v0 F4-02 | ✅ Utilizable | `muestra_pagina/components/admin/vista-previa-pdf.tsx` (416 líneas) + `muestra_pagina/app/admin/certificaciones/[id]/pdf/page.tsx` + capturas `pdf-desktop.png` (139.6 kB), `pdf-desktop2.png` (129.7 kB), `pdf-mobile.png` (83.1 kB). |
| Modelos reusables | ✅ | `Certificacion`, `CertificacionDetalle` (con `documentMasked`, `tokenPrefix`, `publicValidationUrl` truncada, `attendedDates`, `auditEvents`), constante `URL_PUBLICA_MAX = 60`, `truncarUrl`, seed de 6 certificados ficticios. |
| Servicio reusables | ✅ | `CertificationsService.obtener(id)`, `CERTIFICATIONS_SOURCE` provisto a nivel de ruta admin en `app.routes.ts:60`. |
| Specs vigentes | ✅ | `openspec/specs/admin-certifications-frontend/spec.md` (modificado por F4-01) y `openspec/specs/certificate-pdf-qr-generation/spec.md` (backend, archivado; habilita la entrega real en ciclos posteriores, no este). |
| Contrato backend PDF | ✅ Sincronizado D0 | `docs/backend/01-contrato-api-certificados.md` define `GET /admin/certificados/{id}/pdf` (descarga persistida). F4-02 no la invoca: es solo imprimible. |

### Decisiones D0 que restringen F4-02

- QR/token **permanente**; reenvío normal **no** rota token. La página F4-02 muestra el mismo `publicValidationUrl` (truncada) y un QR decorativo.
- DNI completo visible **solo** en validación pública; admin, logs, auditoría y errores **sin** DNI completo. La página F4-02 es admin, así que usa `documentMasked`.
- `documentMasked` `XX****XX` y `tokenPrefix` `prefijo_demo_xxx` ya implementados y validados por checks negativos.
- URL pública truncada a 60 chars (`URL_PUBLICA_MAX = 60`) — constante nombrada.
- Auth admin `X-Admin-Key` temporal; login real fuera del MVP. F4-02 sigue mock-only.
- `muestra_pagina/` solo como referencia visual; no compilar, no portar React/Next literalmente, no copiar credenciales demo, no usar `lucide-react`/`lucide-react`-equivalente, no usar Tailwind/shadcn/CVA.
- Email fuera del MVP; entrega manual sin SMTP. F4-02 no envía email.
- Firmantes PDF: Rector/a y Asesor/a Pedagógica vía configuración institucional. F4-02 usa placeholders neutros `Autoridad Demo Uno/Dos` (mismo patrón que F4-01) hasta que se conecte `HttpInstitutionalConfigService` en un ciclo posterior.

## Áreas afectadas

| Archivo / spec | Rol en F4-02 |
|---|---|
| `apps/frontend-angular/src/app/features/admin/certifications/pages/pdf/certification-pdf-preview-page.{ts,html,css,spec.ts}` (nuevo) | Página standalone: carga detalle, renderiza certificado imprimible, `window.print()`, breadcrumb + acción "Volver" no imprimibles. |
| `apps/frontend-angular/src/app/app.routes.ts` | Registrar `path: 'certificaciones/:id/pdf'` **antes** de `path: 'certificaciones/:id'` para que `:id` no la capture. |
| `apps/frontend-angular/src/app/app.routes.spec.ts` | Extender con caso `certificaciones/:id/pdf` (id válido, id inválido, orden de rutas con `:id` no captura el sufijo). |
| `apps/frontend-angular/src/app/features/admin/certifications/pages/preview/certification-preview-page.{ts,html}` | Delta F4-01→F4-02: CTAs `Descargar PDF` y `Regenerar PDF` pasan de `disabled` a `<a routerLink="/admin/certificaciones/{{ id() }}/pdf">` con copy "Disponible" en lugar de "F4-02". El botón `Imprimir` del expediente se mantiene como atajo a la misma ruta. |
| `apps/frontend-angular/src/app/features/admin/certifications/certifications.models.ts` | Reutilizar `CertificacionDetalle`. **No requiere cambios** salvo necesidad real detectada en apply. |
| `apps/frontend-angular/src/app/features/admin/certifications/in-memory-certifications.service.ts` | Reutilizar seed. **No requiere cambios**. |
| `apps/frontend-angular/src/app/features/admin/certifications/__checks__/no-secrets.spec.ts` | Extender para cubrir el feature de PDF (sin `X-Admin-Key`, sin `HttpClient`/`fetch`, sin storage). |
| `apps/frontend-angular/src/app/features/admin/certifications/__checks__/no-real-data.spec.ts` | Extender para cubrir DOM y seed sin DNI completo, token completo, email, legajo, matrícula, UUID; `documentMasked` y `tokenPrefix` correctos; URL truncada. |
| `apps/frontend-angular/angular.json` | Ajustar `anyComponentStyle` (8 kB warn / 16 kB error) si el CSS de F4-02 también excede; reutilizar el ajuste de F4-01 si ya alcanza. |
| `apps/frontend-angular/src/app/features/admin/certifications/pages/preview/certification-preview-page.spec.ts` | Actualizar el caso "CTAs de PDF, copiar link, entrega, regenerar y revocar están deshabilitados" → descargar PDF y regenerar PDF son `routerLink` (no `disabled`); las otras siguen `disabled` con sus handoffs. |
| `openspec/specs/admin-certifications-frontend/spec.md` | Modificar el requirement `Previsualización segura y handoff explícito` para reflejar el delta: PDF ejecutable desde el expediente, link/entrega/revocación siguen deshabilitados. |
| `docs/frontend/00-angular20-port-v0.md` | Agregar bloque "Estado F4-02 — Vista previa PDF complementario" durante `sdd-archive` con archivos creados/modificados, límites, verificación y handoff a F5-04/F6-03/F6-01. |
| `docs/frontend/F4-02-vista-previa-pdf.md` (nuevo) | Documentar ruta, secciones, acciones, print styles, frontera de datos, evidencia visual. |
| `muestra_pagina/components/admin/vista-previa-pdf.tsx` | **Solo referencia visual** (lectura segura). No compilar ni portar. |
| `muestra_pagina/app/admin/certificaciones/[id]/pdf/page.tsx` | **Solo referencia visual** de la ruta. No compilar ni portar. |
| `muestra_pagina/capturas/pdf-desktop.png`, `pdf-desktop2.png`, `pdf-mobile.png` | **Solo referencia visual** para `parity-notes.md`. |

## Criterios de aceptación hard

- **Paridad visual**: la UI de F4-02 debe mantener paridad visual igual o mejor que `muestra_pagina/components/admin/vista-previa-pdf.tsx` y `muestra_pagina/app/admin/certificaciones/[id]/pdf/page.tsx`. La vía preferida es portar la intención visual a Angular 20 con CSS local y tokens globales; **no** portar React/Next literalmente (sin `lucide-react`, sin `import Link from "next/link"`, sin `AdminShell`, sin clases Tailwind).
- **Mock-only**: sin HTTP, sin `X-Admin-Key`, sin storage/cookies/IndexedDB, sin datos reales, sin DNI completo, sin token completo, sin email, sin PDF real generado, sin QR real, sin revocación real, sin entrega manual real, sin SMTP. La página consume `CERTIFICATIONS_SOURCE.obtener(id)` y renderiza; ningún fetch, ningún HttpClient, ningún `window.print()` con archivo descargable.
- **Frontera de datos**: usar solo `documentMasked` (no DNI completo), `tokenPrefix` (no token completo), `publicValidationUrl` truncada (no UUID), `attendedDates`, `emitidoEn`, `venceEn`, `nombreAlumno`, `cursoNombre`, `numeroExpediente` (derivado), `estado`. Los datos v0 que muestran DNI completo (`D.N.I. {alumno.dni}`) y nombres plausibles (`M. Marcelo Canetti`, `María Eugenia Pizzul`) **no** se portan: usar `documentMasked` y `Autoridad Demo Uno/Dos`/`Autoridad Demo Uno/Dos` (mismo patrón que F4-01).
- **Sin generación real de PDF/QR**: el documento se renderiza en HTML/CSS y se imprime con el browser (`window.print()`); no se llama al endpoint `GET /admin/certificados/{id}/pdf` del backend; no se genera un PNG con la extensión `gd`; no se persiste ningún archivo.
- **Imprimibilidad**: `@media print` aplica `@page { size: A4 landscape; margin: 0; }` (la v0 es horizontal y la guía `00-angular20-port-v0.md` confirma la pista horizontal). Clase `.no-print` con `display: none !important;` en `@media print` oculta breadcrumb, acción "Imprimir", acción "Volver", banner de ayuda, footer de UI. La cabecera del documento y el cuerpo se mantienen; los colores de fondo se preservan con `print-color-adjust: exact;` (los tokens v0 son seguros para print: `--color-ink`, `--color-tech-blue`, `--color-circuit`, `--color-warning`).
- **Ruta registrada en orden seguro**: `path: 'certificaciones/:id/pdf'` **antes** de `path: 'certificaciones/:id'`. Verificar con `app.routes.spec.ts` que una URL como `/admin/certificaciones/1/pdf` no colisiona con `:id` ni con el catch-all admin (`path: 'admin' pathMatch: 'prefix' redirectTo: '/admin/dashboard'`).
- **Id inválido/inexistente**: `abc`, `0`, `0x1`, `1e0`, `999`, vacío y `:id` no numérico muestran "Certificación no encontrada" o el patrón vigente, sin excepciones, sin petición HTTP.
- **Acciones externas deshabilitadas en el expediente F4-01**: solo `Descargar PDF` y `Regenerar PDF` pasan a `routerLink` (handoff ejecutado). `Copiar link`, `Entrega manual` y `Revocar certificación` siguen `disabled` con `aria-disabled="true"` y copy `F6-03`, `F5-04`, `F6-01` respectivamente.
- **Sin dependencias nuevas**: `package.json` y lockfiles sin cambios. `window.print()` es API nativa del browser; los estilos de print son CSS estándar; las decoraciones SVG (escudo, marca IFTS, etc.) son inline en el template, sin librerías.
- **Cobertura de tests**: escenarios Given/When/Then deben cubrir render del documento, datos seguros en DOM, presencia del QR decorativo 8×8, autoridades neutras, acción "Imprimir" con `role="status"` y `aria-live="polite"`, acción "Volver" con `routerLink`, id inválido, ausencia de secretos, ausencia de datos reales, orden de rutas con `:id/pdf` antes de `:id`.
- **Build verde**: `npm run build` debe pasar; el warning de CSS budget (8 kB warn / 16 kB error) ya está ajustado en F4-01 a 16 kB error. F4-02 debe caber en el mismo budget o ajustar localmente.
- **Evidencia visual**: capturas desktop 1280×800 y mobile 390×844 en `openspec/changes/f4-02-certificate-pdf-preview/evidence/` + `parity-notes.md` con tabla comparativa v0 vs Angular.

## Enfoques de implementación

### Opción A — Nueva página standalone en `/admin/certificaciones/:id/pdf` (recomendada)

- **Descripción**: ruta nueva, componente nuevo (`CertificationPdfPreviewPage`), reusa el seam `CERTIFICATIONS_SOURCE.obtener(id)`. La página es presentational: render del certificado en HTML/CSS + `window.print()` con print styles; sin lógica de negocio adicional. Los CTAs `Descargar PDF` y `Regenerar PDF` del expediente F4-01 pasan de `disabled` a `routerLink` hacia esta ruta; el botón `Imprimir` del expediente se mantiene como atajo.
- **Pros**:
  - Reutiliza 100% del seam, modelos, seed, constante `URL_PUBLICA_MAX`, checks negativos, sidebar (no se toca), dashboard (no se toca).
  - Sigue el patrón del v0 (`muestra_pagina/app/admin/certificaciones/[id]/pdf/page.tsx` con `params: Promise<{ id: string }>` + `<VistaPreviaPdf id={id} />`).
  - Separa concerns: expediente (panel admin) vs documento imprimible (vista documento). Mismo `:id`, dos vistas, dos rutas.
  - URL compartible: Bedelía puede copiar la URL `/admin/certificaciones/1/pdf` y abrirla en otra pestaña sin pasar por el expediente.
  - El documento se imprime con `window.print()` sin generar PDF real: cumple "no generar PDF real" (D0) sin bloquear la experiencia imprimible.
  - El handoff de F4-01 ("Disponible en F4-02") se materializa: el delta de F4-01 es chico y verificable.
  - El forecast del ciclo queda chico: página standalone + delta del expediente + tests + docs. Aproximadamente 700–1100 líneas estimadas, dentro del budget de 4000.
- **Contras**:
  - Doble ruta para el mismo recurso: la URL `/admin/certificaciones/:id` (expediente) y `/admin/certificaciones/:id/pdf` (documento) requieren navegación cruzada (botón "Volver" en la nueva página; CTAs "Volver al listado" en el expediente).
  - El delta del expediente F4-01 introduce un cambio retroactivo: `disabled` → `routerLink` en dos CTAs. Riesgo bajo: el componente ya tiene un patrón de router (los `<a routerLink>` ya existen para "Volver al listado" y para la navegación a `/admin/certificaciones/:id` desde el listado).
  - `window.print()` no se puede testear unitariamente; se valida con feedback accesible y, opcionalmente, con Playwright.
- **Esfuerzo**: **Medio**. Mock + UI + delta F4-01 + print styles + tests + QA + docs.

### Opción B — Sección expandible dentro del expediente (no recomendada)

- **Descripción**: la página F4-01 actual agrega un panel inferior con el documento imprimible y un botón "Imprimir" en la barra de acciones del expediente; no se crea ruta nueva.
- **Pros**:
  - Sin ruta nueva; sin cambios en `app.routes.ts`; sin delta de F4-01; sin necesidad de breadcrumb adicional.
  - Una sola página por certificación.
- **Contras**:
  - **Rompe la paridad visual** (criterio de aceptación hard). La v0 tiene la vista previa como página standalone; el F4-01 expediente es 2 columnas (control + documento) y meter el documento imprimible dentro de la misma vista lo apila.
  - El print styles es complicado: el panel de control no se puede ocultar sin ocultar la grilla. Hay que reorganizar la grilla para imprimir, lo que duplica CSS y rompe responsive.
  - El handoff de F4-01 ("Disponible en F4-02") se reduce a "una pestaña más en la misma página", lo que diluye la decisión de scope.
  - El URL compartible se pierde: `/admin/certificaciones/1/pdf` no existe.
  - El forecast se acerca al budget porque hay que reescribir gran parte del layout de F4-01.
- **Esfuerzo**: **Medio-Alto**. Sin reuso efectivo; reorganización del layout + delta F4-01.

### Opción C — Generación PDF real con `jsPDF`/`pdf-lib` u otra librería (rechazada)

- **Descripción**: en lugar de `window.print()`, generar un PDF real en el browser con una librería JS y descargarlo desde la misma página.
- **Pros**: descarga directa; control del tamaño y formato.
- **Contras**:
  - **Rompe "sin dependencias nuevas"** (regla D0 y de la guía unificada de Matías).
  - **Rompe "no generar PDF real"** sin spec previa (regla del ciclo F4-02, ver `MATIAS_PROMPTS_SDD_3_SEMANAS_CICLOS_GIT.md` línea 1523: "No generes PDF real ni QR real sin spec previa").
  - La spec vigente `certificate-pdf-qr-generation` define la generación PDF del lado backend, no del frontend.
  - Tamaño del bundle Angular crece y se mete en un territorio que la guía pide dejar para ciclos posteriores.
- **Esfuerzo**: **Alto** (con libs) o **Alto** (sin libs, reimplementando). Descartada por violación de reglas D0 y de scope.

## Decisión de alcance F4-02 vs entregables posteriores

| Tema | F4-02 | F5-04 Entrega manual | F6-03 Link público | F6-01 Revocación |
|---|---|---|---|---|
| Ruta | `/admin/certificaciones/:id/pdf` (nueva) | `/admin/certificaciones/:id/entrega` (nueva) | Pública (no admin) | `/admin/certificaciones/:id/revocar` (nueva) |
| Acción imprimible | `window.print()` | "Copiar link" + "Descargar PDF" (descarga real via `GET /admin/certificados/{id}/pdf`) | n/a (validación pública ya existe) | Confirmación irreversible con POST `revocar` |
| Datos | Mock-only, `documentMasked`/`tokenPrefix`/URL truncada/QR decorativo | Mock o real según spec del ciclo | DTO público (DNI completo) | Mock o real según spec del ciclo |
| Backend | No | `X-Admin-Key` cuando se conecte | `/validar/{token}` público | `X-Admin-Key` cuando se conecte |
| PDF/QR real | No (solo `window.print()` del browser) | Sí (`GET /admin/certificados/{id}/pdf`) | n/a | n/a |
| Email/SMTP | No | No | No | No |
| Handoff desde F4-01 | Ejecuta `Descargar PDF` y `Regenerar PDF` | `Entrega manual` | `Copiar link` | `Revocar certificación` |
| Rama | `frontend/certificate-pdf-preview` (nueva) | `frontend/admin-certifications` (con F2-06/F5-01/F6-01/F6-03) | idem | idem |

**Recomendación de delivery**: single-pr (F4-02 + delta F4-01 en el mismo PR). El forecast es 700–1100 líneas, dentro del budget de 4000. No se requiere chained-PR.

## Datos permitidos (resumen)

| Dato | Origen | Visible en F4-02 |
|---|---|---|
| `nombreAlumno` | `Certificacion.nombreAlumno` | Sí (protagonista del documento) |
| `documentMasked` | `Certificacion.documentMasked` (formato `XX****XX`) | Sí (debajo del nombre, con sufijo "(mascarado)" opcional) |
| DNI completo | **No existe en el modelo admin** | **No** |
| `cursoNombre` | `Certificacion.cursoNombre` | Sí (cuerpo del certificado) |
| `attendedDates` | `CertificacionDetalle.attendedDates` | Sí (rango inicio–fin derivado, no lista exhaustiva) |
| `emitidoEn` | `Certificacion.emitidoEn` | Sí (fecha de emisión) |
| `venceEn` | `Certificacion.venceEn` | Sí (si no es null; opcional) |
| `estado` | `Certificacion.estado` | Sí (solo `revocado` muestra banda; otros estados no cambian la apariencia del documento) |
| `tokenPrefix` | `Certificacion.tokenPrefix` | No (es dato admin, no aparece en el documento) |
| `publicValidationUrl` | `CertificacionDetalle.publicValidationUrl` (truncada a 60 chars) | Sí (debajo del QR decorativo, con host visible + path truncado) |
| `numeroExpediente` | Derivado del `id()` (`IFTS14-CERT-NNNN`) | Sí (encabezado del documento y bloque de validación) |
| Email | **No existe en el modelo** | **No** |
| Legajo / Matrícula / UUID | **No existe en el modelo** | **No** |
| Token completo | Cifrado en backend (no en admin) | **No** (solo `publicValidationUrl` truncada) |
| Firmantes | `Configuración institucional` (rector + asesor) | Placeholders neutros `Autoridad Demo Uno` y `Autoridad Demo Dos` (mismo patrón F4-01) |
| Logos institucionales | Placeholders v0 (`EscudoCircular`, `MarcaPrograma`, `MarcaIfts`, `MarcaCiudad`) | Replicar como SVG inline en Angular con tokens (`--color-ink`, `--color-circuit`, `--color-tech-blue`, `--color-warning`) — sin librerías |

## Acciones y handoffs

| Acción en F4-02 | Estado | Mecanismo |
|---|---|---|
| Imprimir | **Habilitado** | `window.print()` con guard `if (typeof window !== 'undefined')` (estilo v0) + feedback accesible `role="status" aria-live="polite"` ("Documento listo para enviar a la impresora"). |
| Volver al expediente | **Habilitado** | `<a routerLink="/admin/certificaciones/{{ id() }}">← Volver al expediente</a>` con `class="no-print"`. |
| Cerrar | **Habilitado** | `<a routerLink="/admin/certificaciones">← Certificaciones</a>` (breadcrumb) con `class="no-print"`. |

| Acción en F4-01 (delta) | Estado actual | Estado post F4-02 |
|---|---|---|
| Descargar PDF | `disabled` con `handoff F4-02` | `<a routerLink="/admin/certificaciones/{{ id() }}/pdf">Descargar PDF</a>` con `class="btn-primary"` o equivalente |
| Regenerar PDF | `disabled` con `handoff F4-02` | `<a routerLink="/admin/certificaciones/{{ id() }}/pdf">Regenerar PDF</a>` (atajo) |
| Imprimir (atajo) | (no existe en F4-01) | `<a routerLink="/admin/certificaciones/{{ id() }}/pdf">Imprimir</a>` (atajo; equivale al "Imprimir" del expediente) — opcional; recomendación: agregar Imprimir como atajo en la barra de acciones, mismo destino |
| Copiar link | `disabled` con `handoff F6-03` | Sigue `disabled` (sin cambio) |
| Entrega manual | `disabled` con `handoff F5-04` | Sigue `disabled` (sin cambio) |
| Revocar certificación | `disabled` con `handoff F6-01` | Sigue `disabled` (sin cambio) |

## Paridad visual: criterios de aceptación

| Aspecto v0 | Implementación Angular 20 | Criterio |
|---|---|---|
| Ruta `/admin/certificaciones/:id/pdf` | Misma ruta en Angular | ✅ id exacto |
| Layout horizontal (apaisado) | `@page { size: A4 landscape; margin: 0; }` + `aspect-ratio` o `max-width` con grid fluido | ✅ |
| Header con logos (Escudo, Programa, IFTS) | SVG inline con `currentColor` y tokens (`--color-ink`, `--color-circuit`, `--color-tech-blue`, `--color-warning`) | ✅ sin librerías |
| Título "CERTIFICADO" centrado, serif bold grande | `<h2 class="cert-titulo">CERTIFICADO</h2>` con `font-family: serif; font-size: clamp(2.5rem, 6vw, 4.5rem); font-weight: 700; letter-spacing: 0.08em; color: var(--color-ink);` | ✅ |
| Bloque de validación con QR (izq) + firmantes (centro/der) | Grid `lg:grid-cols-[1fr_minmax(0,17rem)_1fr]` o equivalente CSS Grid; QR a la izquierda, firmante 1 (Rector) a la izquierda, firmante 2 (Asesor) a la derecha, bloque de validación en el centro | ✅ |
| QR decorativo 8×8 | Mismo patrón de 64 celdas del F4-01 (`qrCells: readonly number[]`) — reusar constante o copiarla | ✅ |
| Datos del alumno: nombre y "D.N.I. {dni}" | `nombreAlumno` + `documentMasked` con texto "Documento {documentMasked}" (mismo patrón que F4-01 expediente); sin DNI completo | ⚠️ Diferencia intencional de privacidad |
| Datos del curso y periodo | `cursoNombre` + periodo derivado de `attendedDates[0]`/`attendedDates[N-1]` formateado con `Intl.DateTimeFormat("es-AR", { month: "long", year: "numeric" })` | ✅ con diferencia menor (sin `cargaHoraria`) |
| Carga horaria | **Omitir**: no está en `CertificacionDetalle` y la guía F4-01 dice "No ampliar `CertificacionDetalle` salvo necesidad real". Si se requiere, agregar `cargaHoraria?: number;` opcional | ⚠️ Diferencia intencional de scope |
| Firmantes (Rector + Asesor) | `Autoridad Demo Uno` (Rector/a) y `Autoridad Demo Dos` (Asesor/a Pedagógica) | ⚠️ Diferencia intencional (placeholders neutros, sin nombres plausibles; mismo patrón F4-01) |
| Cargos | "Rector/a — IFTS N.° 14" y "Asesor/a Pedagógica — IFTS N.° 14" | ✅ literal |
| Bloque de validación: Emisión, Folio, N.° certificado | `emitidoEn` formateado corto, `numeroExpediente` derivado, y "Folio" omitido (no está en el modelo) | ⚠️ Diferencia menor (Folio omitido) |
| Link público | `publicValidationUrl` truncada con host destacado y path truncado a 60 chars | ✅ |
| Footer: "BA · Buenos Aires Ciudad" + nota "Datos institucionales desde Configuración" | Replicar con marca neutra y nota "Configuración institucional pendiente" (placeholder) | ⚠️ Diferencia intencional (sin logos BA plausibles; usar marca neutra) |
| Barra de acciones (no imprime) | `<div class="no-print">` con botones "Imprimir" y "Volver" | ✅ con `.no-print` |
| Banner de aviso (no imprime) | `<p class="no-print" role="status" aria-live="polite">` con feedback de impresión | ✅ con `.no-print` |
| `print:hidden` (Tailwind) | `.no-print { display: none; }` con `@media print { .no-print { display: none !important; } }` | ✅ equivalente sin Tailwind |
| `window.print()` desde React | `window.print()` desde Angular con guard `typeof window !== 'undefined'` y `isPlatformBrowser` | ✅ |
| Iconos lucide-react (Printer, Download, ShieldCheck, Link2, Sun, Wind, Leaf, Cpu, Lock) | Símbolos Unicode / emoji / texto (🖨 ⬇ 🛡 🔗 ☀ 🍃 🔒 ✓) | ⚠️ Diferencia intencional (sin librerías) |
| Animaciones/transiciones de Tailwind | Ninguna en Angular; la vista previa es estática para impresión | ✅ sin animaciones (no afecta print) |

## Tests y evidencia visual

### Tests unitarios (Angular)

| Spec | Cubre |
|---|---|
| `certification-pdf-preview-page.spec.ts` (nuevo) | Render del documento con datos seguros (`documentMasked`, `tokenPrefix`, `publicValidationUrl` truncada, `attendedDates`, `emitidoEn`, `numeroExpediente`); ausencia de DNI completo, token completo, email, legajo, matrícula, UUID; botón "Imprimir" con `aria-disabled`/`role="status"`; botón "Volver" con `routerLink`; id inválido (`abc`, `0`, `0x1`, `1e0`, `999`, vacío) → "Certificación no encontrada"; route reuse con cambio de id; barra de acciones con `class="no-print"`; cuerpo del certificado con `class="print-area"`. |
| `app.routes.spec.ts` (modificado) | Caso `certificaciones/:id/pdf` con id válido renderiza la página; id inválido no rompe; orden de rutas (`:id/pdf` antes de `:id`); `RouterTestingHarness` + `withComponentInputBinding()`. |
| `certification-preview-page.spec.ts` (modificado) | El delta de F4-01: CTAs `Descargar PDF` y `Regenerar PDF` son `routerLink` (no `disabled`); el resto sigue `disabled` con sus handoffs; breadcrumb del expediente sin cambios. |
| `__checks__/no-secrets.spec.ts` (modificado) | Cubre el feature de PDF: sin `X-Admin-Key`, sin `HttpClient`/`fetch`, sin `localStorage`/`sessionStorage`/`IndexedDB`, sin `XMLHttpRequest`. |
| `__checks__/no-real-data.spec.ts` (modificado) | Cubre el feature de PDF: DOM y seed sin DNI completo, token completo, email, legajo, matrícula, UUID; `documentMasked` con formato `XX****XX`; `tokenPrefix` con formato `prefijo_demo_xxx`; URL truncada a 60 chars. |

### Build y comandos

| Comando | Esperado |
|---|---|
| `npm run test:ci` (cwd `apps/frontend-angular`) | `exit 0`, todos los specs verdes (incluyendo los nuevos y modificados). |
| `npm run build` (cwd `apps/frontend-angular`) | `exit 0`; warning de CSS budget aceptable si se mantiene dentro de 16 kB error. |
| `git status --short` (pre-commit) | Solo archivos del scope F4-02 + delta F4-01; sin `material_privado_no_versionar/`, sin secretos, sin dumps. |
| `git diff --name-only` (pre-commit) | Idem; verificar diff antes de stagear. |

### Evidencia visual

| Artifact | Notas |
|---|---|
| `openspec/changes/f4-02-certificate-pdf-preview/evidence/cert-pdf-angular.png` | Captura desktop 1280×800 del PDF preview (con barra de acciones visible). |
| `openspec/changes/f4-02-certificate-pdf-preview/evidence/cert-pdf-angular-mobile.png` | Captura mobile 390×844 del PDF preview (con barra de acciones visible). |
| `openspec/changes/f4-02-certificate-pdf-preview/evidence/cert-pdf-angular-print.png` (opcional) | Captura del modo print (Playwright `page.emulateMedia({ media: 'print' })` o equivalente) que muestra el documento sin la barra de acciones. |
| `openspec/changes/f4-02-certificate-pdf-preview/evidence/parity-notes.md` | Tabla comparativa v0 vs Angular con las diferencias intencionales (privacidad: `documentMasked` en lugar de DNI; firmantes neutros; sin logos BA plausibles; sin carga horaria; sin Folio). |
| `openspec/changes/f4-02-certificate-pdf-preview/evidence/route-order-check.png` (opcional) | Captura de `app.routes.spec.ts` con el caso de orden de rutas verificado. |

## Recomendación

**Opción A** — Implementar F4-02 como nueva página standalone `/admin/certificaciones/:id/pdf` con `window.print()` y print styles propios (sin Tailwind, sin librerías), reusando `CERTIFICATIONS_SOURCE` y los modelos de F4-01/F2-06. Hacer el delta de F4-01 para que los CTAs `Descargar PDF` y `Regenerar PDF` pasen a `routerLink` (handoff ejecutado). Rama nueva `frontend/certificate-pdf-preview` desde `main`. Single-PR; forecast 700–1100 líneas; budget 4000.

Razones:

1. **Cierra el handoff de F4-01**: los botones `Descargar PDF` y `Regenerar PDF` del expediente pasan de `disabled` con copy `F4-02` a `routerLink` activo, ejecutando el plan declarado en el diseño de F4-01.
2. **Sigue el patrón v0**: la referencia `muestra_pagina/app/admin/certificaciones/[id]/pdf/page.tsx` define exactamente esta ruta y `muestra_pagina/components/admin/vista-previa-pdf.tsx` define la página presentational con `window.print()`. Portar la intención visual es directo.
3. **Reuso máximo**: seam `CERTIFICATIONS_SOURCE`, modelos `CertificacionDetalle`, seed de 6 certificados, constante `URL_PUBLICA_MAX`, checks negativos — todo está listo.
4. **Mock-only, sin dependencias nuevas**: `window.print()` es API nativa del browser; los print styles son CSS estándar; las decoraciones SVG son inline. Cero impacto en `package.json` y lockfiles.
5. **Criterio de aceptación hard verificable**: la paridad visual es _hard acceptance_ y puede declararse en la spec y verificarse en `sdd-verify` con comparación de capturas contra `muestra_pagina/capturas/pdf-desktop.png`, `pdf-desktop2.png`, `pdf-mobile.png`.
6. **Riesgo acotable**: la única complejidad es el delta retroactivo en F4-01 (dos CTAs cambian de `disabled` a `routerLink`); el resto es trabajo de página nueva. Si el forecast se acerca a 3500 líneas (improbable), dividir en dos PRs encadenados.

## Riesgos

- **`window.print()` solo en browser**: `if (typeof window !== 'undefined')` es la guarda de la v0. En SSR no aplica (Angular en este proyecto no usa SSR; pero `typeof window` cubre el caso defensivo). Tests no pueden verificar la apertura del diálogo de impresión, pero pueden verificar el feedback accesible. **Mitigación**: extraer la función `imprimir()` en el componente y cubrir con un test que valide el guard y el feedback.
- **Print styles y `print-color-adjust: exact`**: el certificado usa fondos (`--color-ink`, `--color-warning`, etc.) y los browsers a veces los omiten al imprimir. **Mitigación**: aplicar `-webkit-print-color-adjust: exact; print-color-adjust: exact;` en el contenedor del documento y verificar con Playwright `page.emulateMedia({ media: 'print' })`.
- **CSS budget warning**: F4-01 ya emite warning de CSS (13.78 kB vs 8 kB warn / 16 kB error). F4-02 tendrá su propio CSS y puede repetir el patrón. **Mitigación**: budget `anyComponentStyle` ya ajustado en F4-01; F4-02 puede compartir el ajuste o declarar el propio. Verificar `npm run build` con `2>&1 | grep -E "(warning|error|budget)"`.
- **Ruta fuera de orden**: si `path: 'certificaciones/:id'` se declara antes de `path: 'certificaciones/:id/pdf'`, la URL `/admin/certificaciones/1/pdf` puede ser capturada por `:id` con `id=1` y un path adicional que no matchea. **Mitigación**: declarar la ruta PDF **antes** de la ruta `:id`; cubrir con `app.routes.spec.ts` que `RouterTestingHarness` resuelve a la página PDF.
- **Delta retroactivo en F4-01**: cambiar `disabled` a `routerLink` en dos CTAs es un cambio sobre código mergeado. **Mitigación**: hacer el delta dentro del mismo PR de F4-02; actualizar `certification-preview-page.spec.ts` para reflejar el nuevo estado; documentar el delta en el `proposal.md`, `spec.md` y `design.md` de F4-02.
- **Configuración institucional**: la v0 muestra nombres plausibles (`M. Marcelo Canetti`, `María Eugenia Pizzul`) hardcoded. Angular debe usar placeholders neutros. Si un ciclo futuro conecta `HttpInstitutionalConfigService`, los nombres reales vendrán de `GET /admin/configuracion-institucional` y se inyectarán en la página. **Mitigación**: dejar un TODO documentado en el código; no inventar nombres plausibles.
- **Carga horaria, Folio**: la v0 los muestra; el modelo admin no los tiene. **Mitigación**: omitir con nota "Configuración institucional pendiente" o derivar de `emitidoEn` + `venceEn` cuando aplique. La guía F4-01 dice "No ampliar `CertificacionDetalle` salvo necesidad real" — el alcance F4-02 no los exige.
- **Paridad visual con `pdf-desktop.png` y compañía**: la v0 tiene header con tres logos (Escudo + Programa + IFTS), footer con "BA · Buenos Aires Ciudad" y el título serif "CERTIFICADO". La calidad visual del port depende de las decoraciones SVG inline. **Mitigación**: dedicar tiempo a la decoración SVG en el apply; capturar evidencia visual y comparar contra `parity-notes.md`.

## Contradicciones entre planificación y artefactos cerrados

1. **F4-01 cubría "el documento réplica"; F4-02 era "diferido"**: F4-01 diseño (línea 7) y archive-report declararon "F4-02 queda diferido" porque la réplica documental visible cubría el expediente. Sin embargo, el expediente F4-01 **no** es imprimible (layout 2 columnas con columna de control) y sus botones PDF siguen **disabled** con handoff `F4-02`. Por lo tanto, F4-02 es ahora la **vista previa dedicada + imprimible** que materializa el handoff, no una duplicación de la réplica. **Resolución**: la decisión de scope de F4-02 es "página imprimible standalone con `window.print()`", no "repetir la réplica en otra página".
2. **Rama `frontend/certificate-detail-pdf` compartida F4-01/F4-02**: la guía unificada (línea 178) y la F4-01 exploration.md (línea 9) propusieron la rama compartida. F4-01 ya mergeó a `main`; la rama ya no existe. **Resolución**: F4-02 abre una rama nueva desde `main` con nombre descriptivo `frontend/certificate-pdf-preview`. La intención original se cumplió con F4-01; F4-02 es una capacidad nueva y merece rama propia.
3. **`muestra_pagina/MANIFIESTO_V0.md` retirado**: la guía dice que el inventario se completa contra el listado seguro de la carpeta. El listado actual muestra `muestra_pagina/capturas/pdf-desktop.png` (139.6 kB), `pdf-desktop2.png` (129.7 kB), `pdf-mobile.png` (83.1 kB) y `muestra_pagina/app/admin/certificaciones/[id]/pdf/page.tsx` (22 líneas, contiene `<AdminShell active="Certificaciones">` + `<VistaPreviaPdf id={id} />`). **Resolución**: la referencia v0 es utilizable; no hay bloqueo de inventario.
4. **"F4-02 no genera PDF real" (regla D0 y de la guía de Matías) vs "vista previa PDF complementario"**: el nombre del ciclo puede confundir con "generar PDF real". **Resolución**: el alcance es "vista previa imprimible con `window.print()`", no "generar PDF del lado backend". La generación real del PDF persistido queda en la spec `certificate-pdf-qr-generation` y se descarga vía `GET /admin/certificados/{id}/pdf` cuando se conecte (ciclo posterior, no F4-02).
5. **CSS budget warning de F4-01**: el verify-report de F4-01 declaró "PASS WITH WARNINGS" por el warning de CSS (13.78 kB > 8 kB warn). F4-02 sumará su propio CSS. **Resolución**: aceptar el warning explícitamente en el verify-report de F4-02 si se reproduce, o ajustar `anyComponentStyle` en `angular.json` a un valor que cubra ambos componentes.

## No-objetivos

- **No** generar PDF real del lado frontend (`jsPDF`, `pdf-lib`, `html2canvas` o equivalente).
- **No** generar QR real con token embebido; el QR es decorativo CSS.
- **No** descargar PDF persistido del backend (`GET /admin/certificados/{id}/pdf` queda para F5-04 o ciclo posterior).
- **No** invocar `X-Admin-Key`, `HttpClient`, `fetch`, `XMLHttpRequest` desde el browser.
- **No** persistir datos reales, sin DNI completo, sin token completo, sin email, sin legajo, sin matrícula, sin UUID.
- **No** usar `localStorage`/`sessionStorage`/`IndexedDB`/cookies.
- **No** usar Tailwind, shadcn, lucide-react, CVA, ni dependencias nuevas.
- **No** copiar credenciales demo de `muestra_pagina/` (no son datos de producción).
- **No** tocar PHP, MariaDB, deploy cPanel, `material_privado_no_versionar/`, secretos, dumps, logs.
- **No** rotar token/QR; el QR/token es permanente (D0).
- **No** enviar email ni SMTP/PHPMailer.
- **No** revocar certificación.
- **No** exponer nombres plausibles reales de autoridades; usar `Autoridad Demo Uno`/`Autoridad Demo Dos`.
- **No** usar `lucide-react`-equivalente ni icon libs; usar Unicode/emoji/texto.
- **No** cambiar la ruta `/admin/certificaciones/:id` ni la página del expediente; solo registrar la nueva ruta PDF y actualizar los CTAs.
- **No** inventar `cargaHoraria`, `folio`, `lugar` si no están en el modelo admin; la spec del ciclo debe declarar la omisión como diferencia intencional de scope.

## Listo para propuesta

**Sí**, con las siguientes condiciones para el orquestador:

- Indicar al usuario que la fase siguiente recomendada es **F4-02 Vista previa PDF complementario (imprimible)** en la rama `frontend/certificate-pdf-preview` (nueva desde `main`).
- Confirmar que la rama `frontend/certificate-detail-pdf` ya cerró (F4-01 mergeado en `oke399833`); F4-02 abre rama nueva.
- Confirmar que el alcance es **Opción A**: página standalone con `window.print()` y print styles propios, sin generación real de PDF.
- Confirmar que se acepta el delta retroactivo en F4-01: los CTAs `Descargar PDF` y `Regenerar PDF` del expediente pasan de `disabled` a `routerLink` hacia la nueva ruta.
- Mantener el alcance mock-only y declarar el handoff explícito a F5-04, F6-03 y F6-01 desde la spec de F4-02.
- Mantener la paridad visual como _hard acceptance criterion_ referenciando `muestra_pagina/components/admin/vista-previa-pdf.tsx`, `muestra_pagina/app/admin/certificaciones/[id]/pdf/page.tsx` y `muestra_pagina/capturas/pdf-{desktop,desktop2,mobile}.png`.
- Aceptar el warning de CSS budget si se reproduce (mismo trade-off que F4-01).
- Confirmar si la rama `frontend/certificate-pdf-preview` debe ramificarse desde `main` o desde otra rama explícita.

## Checklist de exploración (auto-verificación)

- [x] Leído `README.md`, `GUIA.md`, `docs/00-indice-general.md`.
- [x] Leído `docs/opencode/optimizacion-tokens.md` (ruta mínima del rol).
- [x] Leído `MATIAS_PROMPTS_SDD_3_SEMANAS_CICLOS_GIT.md` sección F4-02 (líneas 1511-1531) y tabla de ciclos (líneas 225-238).
- [x] Leído `openspec/changes/archive/2026-07-12-f4-01-certificate-detail/{exploration,proposal,design,tasks,verify-report,evidence/parity-notes}.md`.
- [x] Leído `openspec/changes/archive/2026-07-12-f4-01-certificate-detail/specs/admin-certifications-frontend/spec.md` (delta F4-01).
- [x] Leído `openspec/specs/admin-certifications-frontend/spec.md` (spec vigente post F4-01).
- [x] Leído `openspec/specs/certificate-pdf-qr-generation/spec.md` (spec backend PDF archivada; no se usa en F4-02).
- [x] Leído `apps/frontend-angular/src/app/features/admin/certifications/{certifications.models,certifications.service,in-memory-certifications.service}.ts`.
- [x] Leído `apps/frontend-angular/src/app/features/admin/certifications/pages/preview/certification-preview-page.{ts,html}` (F4-01 expediente; lugar del delta retroactivo).
- [x] Leído `apps/frontend-angular/src/app/app.routes.ts` (orden de rutas y provider).
- [x] Leído `apps/frontend-angular/src/app/features/admin/certifications/pages/preview/certification-preview-page.css` (parcial; CSS budget warning confirmado).
- [x] Leído `apps/frontend-angular/src/styles.css` (tokens v0: `--color-ink`, `--color-circuit`, `--color-tech-blue`, `--color-warning`, `--color-valid`, `--color-destructive`).
- [x] Leído `muestra_pagina/components/admin/vista-previa-pdf.tsx` (416 líneas; referencia visual completa de F4-02 con `window.print()`, `print:hidden`, QR decorativo, firmantes, configuración institucional).
- [x] Leído `muestra_pagina/app/admin/certificaciones/[id]/pdf/page.tsx` (ruta v0 con `params: Promise<{ id: string }>`).
- [x] Listado de `muestra_pagina/capturas/` (confirmadas `pdf-desktop.png`, `pdf-desktop2.png`, `pdf-mobile.png`).
- [x] Leído `docs/backend/01-contrato-api-certificados.md` (endpoint `GET /admin/certificados/{id}/pdf` archivado; F4-02 no lo invoca).
- [x] CodeGraph consultado (1 call) — `codegraph_explore` sobre `certifications preview page detalle route pdf print page` confirmó blast radius del componente `CertificationPreviewPage` (3 callers; 3 specs) y mostró el código verbatim. No fue necesaria más exploración porque las áreas de F4-02 son nuevas (nueva carpeta `pages/pdf/`, nueva ruta) y el seam reusado ya está indexado.
- [x] `muestra_pagina/MANIFIESTO_V0.md` confirmado ausente (retirado según GUIA.md línea 92); inventario completado contra el listado seguro de la carpeta.
- [x] No se inspeccionó `material_privado_no_versionar/`, secretos, dumps, logs ni descargas del servidor.
- [x] No se editó código de producto ni specs; solo se creó `exploration.md` en `openspec/changes/f4-02-certificate-pdf-preview/`.

## Próximo paso

`sdd-new f4-02-certificate-pdf-preview` para abrir el change con `sdd-propose` (alcance mock-only, handoff F4-02 ejecutado desde F4-01, paridad visual con `vista-previa-pdf.tsx`), continuando con `sdd-spec` (delta sobre `admin-certifications-frontend` con dos CTAs ejecutables), `sdd-design` (print styles, orden de rutas, reuso de `CERTIFICATIONS_SOURCE` y `qrCells`), `sdd-tasks` (forecast con guard lines, target ≤ 1100 líneas), `sdd-apply`, `sdd-verify` (con evidencia visual y `parity-notes.md`) y `sdd-archive` (actualizar `docs/frontend/00-angular20-port-v0.md`, crear `docs/frontend/F4-02-vista-previa-pdf.md` y sincronizar la spec).
