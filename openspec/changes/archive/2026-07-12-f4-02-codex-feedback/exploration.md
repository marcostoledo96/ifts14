# Exploración — f4-02-codex-feedback

> Cambio correctivo monoclase sobre la rama de PR #40 (`okfrontend/certificate-pdf-preview`).
> Persistencia: OpenSpec + Engram. artifact_store.mode = `both`.
> preflight cacheado: `single-pr-default`, `review_budget_lines=4000`.
> Esta exploration **no implementa** producto; solo documenta alcance, diagnosis verificada contra código y opciones de tratamiento.

## Contexto y diagnóstico confirmado

D0 (decisiones institucionales vigentes — `AGENTS.md`, `GUIA.md`, `MARCOS_PROMPTS_SDD_3_SEMANAS_CICLOS_GIT.md:35`) exige que el certificado de curso muestre **fechas asistidas** (`attendedDates`) como **fechas exactas**, no como período. La capa pública ya cumple el contrato (`apps/frontend-angular/src/app/shared/certificates/dto.ts:26`, `result-mapper.ts:100`).

El expediente F4-01 (`apps/frontend-angular/src/app/features/admin/certifications/pages/preview/certification-preview-page.html:51-60, 227-252`) lista cada `attendedDates` como `<li>` con la fecha cruda y, dentro de la réplica documental, como `<td class="mono">{{ f }}</td>`. **La vista F4-01 está alineada con D0.**

La vista imprimible F4-02 (`apps/frontend-angular/src/app/features/admin/certifications/pages/pdf/certification-pdf-preview-page.ts:50-59` y `…html:122-124`) hace lo contrario: el computed `periodo()` colapsa el array a "Marzo 2026 a Marzo 2026" usando `Intl.DateTimeFormat('es-AR', { month: 'long', year: 'numeric' })` sobre la primera y la última fecha, y el template lo inserta como `dictado entre {{ periodo() }}`. Esto **rompe D0** y **diverge de la copia institucional** del F4-01 (donde las fechas son filas auditables).

Adicionalmente, los estados no vigentes carecen de marca visual en F4-02: solo `revocado` muestra `.cert-revocado-marca` + `.cert-revocado-banda` (`…css:279-305`, `…html:61-63, 93-100`). Los seeds `borrador` (id=3), `vencido` (id=4) y `revocado` (id=5) están definidos en `in-memory-certifications.service.ts:49-95`; **el id=1 (vigente) y el id=5 (revocado) son los únicos estados con cobertura visual y de checker real** (ver `print-app-check.mjs:7-10`, solo `['1', 'normal', …]` y `['5', 'revocado', …]`). No existe regla que bloquee la impresión, por lo que el tratamiento mínimo es **autorizar preview/print de no vigentes con marca + banda textual explícita**, dejando solo `vigente` limpio.

## Alcance

1. Restaurar en F4-02 la lista de fechas exactas `attendedDates` alineada con D0 y con la copia de F4-01.
2. Renderizar marca y banda textual para los estados `borrador` y `vencido`, equivalentes en patrón a la ya existente para `revocado`; `vigente` permanece sin marca.
3. Extender el checker autoritativo de la app real para cubrir los ids `1, 3, 4, 5` (vigente, borrador, vencido, revocado) y verificar 1 página A4, sin clipping y sin datos prohibidos en cada caso.
4. Actualizar la delta spec `admin-certifications-frontend` y el doc `docs/frontend/F4-02-vista-previa-pdf.md` con los escenarios de marca y de fechas exactas.
5. Cubrir el delta con tests focalizados (componente, checks de no-real-data y de no-secrets).

## No-objetivos

- No se introducen DTOs, servicios, dependencias nuevas, backend, HTTP, storage, auth real, email, SMTP, port literal de React/Next, ni `package.json` / lockfiles modificados.
- No se rota el token/QR (D0 vigente; `certification-pdf-preview-page.ts:16` lo declara permanente).
- No se agrega regla de bloqueo de impresión: la impresión de no vigentes se permite, con marca y banda textual explícitas.
- No se modifican `material_privado_no_versionar/`, secretos, dumps, logs, ni archivos fuera del scope.
- No se introduce un nuevo modelo de estado ni se modifica la gramática del campo `estado: EstadoCertificado` (`certifications.models.ts:5`).
- No se renumera el cambio: sigue siendo F4-02 en lineage; la rama de PR #40 absorbe el delta.

## Estado actual (cómo funciona hoy)

### Datos (seed en memoria)

- `in-memory-certifications.service.ts:17-112` define 6 certificaciones mock. Estados cubiertos: `vigente` (ids 1, 2, 6), `borrador` (id 3), `vencido` (id 4), `revocado` (id 5).
- `CertificacionDetalle` (`certifications.models.ts:20-24`) ya incluye `attendedDates: readonly string[]` (ISO date), `publicValidationUrl` truncada por `truncarUrl()` (max 60 chars, `…` al final) y `auditEvents`. No se requieren cambios de DTO.

### Vista imprimible F4-02

- `certification-pdf-preview-page.ts:24-128` carga por id con validación decimal y `effect` anti-race. `periodo()` (líneas 50-59) es el único consumidor de `attendedDates` y produce "Marzo 2026 a Marzo 2026" o "Mayo 2026" para un único elemento.
- `certification-pdf-preview-page.html:122-124` inserta `dictado entre {{ periodo() }},` dentro del cuerpo del certificado. La fecha exacta nunca aparece.
- Marcas visuales: solo `.cert-revocado-marca` (esquina superior derecha) y `.cert-revocado-banda` (banda textual). Ninguna marca para `borrador` ni `vencido`.
- `imprimir()` (líneas 114-127) usa `window.print()` + `requestAnimationFrame` con guard de browser; el chrome del `admin-shell` se oculta vía `admin-shell.css` `@media print` (estable, sin workaround DOM tras la corrección C1-C7 del F4-02 original).
- QR decorativo 8×8 (`qrCells: readonly number[]`); autoridad dual "Autoridad Demo Uno/Dos".

### Vista expediente F4-01 (referencia de copia)

- `certification-preview-page.html:51-60` (panel) y `227-252` (réplica documental): cada `attendedDates` se renderiza como `<li>` con `seq`, `fecha` (ISO) y `✓`, o como fila de tabla con `SEQ / FECHA / ASISTENCIA`. La copia institucional es la fuente de verdad para F4-02.

### Spec y checker vigentes

- Spec actual: `openspec/specs/admin-certifications-frontend/spec.md` (merged con la delta del F4-02 archivado). El requisito de "previsualización segura" menciona "asistencias" pero **no exige** fechas exactas en la vista imprimible; la delta del codex debe precisarlo.
- Checker autoritativo: `openspec/changes/archive/2026-07-12-f4-02-certificate-pdf-preview/evidence/print-app-check.sh` + `print-app-check.mjs`. Hoy cubre `id=1` y `id=5`; el codex pide extender a `id=1, 3, 4, 5`.
- Checks de frontera: `apps/frontend-angular/src/app/features/admin/certifications/__checks__/no-real-data.spec.ts:149-209` cubren `id='1'` en el DOM del PDF preview (DNI completo, UUID, email, legajo, matrícula, fetch, `documentMasked`, URL truncada). **No hay cobertura específica para los estados `borrador`/`vencido`/`revocado`** ni para fechas exactas en el DOM de F4-02.

## Archivos afectados

| Archivo | Acción | Motivo |
|---|---|---|
| `apps/frontend-angular/src/app/features/admin/certifications/pages/pdf/certification-pdf-preview-page.html` | Modificar | Reemplazar `@if (periodo()) { dictado entre {{ periodo() }}, }` por la lista de `attendedDates` (estilo tabla SEQ/FECHA/ASISTENCIA o bloque con `<dl>`); añadir `.cert-estado-marca--borrador\|--vencido` + `.cert-estado-banda--borrador\|--vencido` análogos al patrón `revocado`. |
| `apps/frontend-angular/src/app/features/admin/certifications/pages/pdf/certification-pdf-preview-page.ts` | Modificar | Eliminar o neutralizar `periodo()` (computed) y su dependencia de `Intl.DateTimeFormat('es-AR', { month, year })`; introducir helper único `estadoMarca()` y `estadoBanda()` que devuelvan el texto y la clase según `d.estado` (vigente → nada; borrador/vencido/revocado → marca + banda con copy específico). |
| `apps/frontend-angular/src/app/features/admin/certifications/pages/pdf/certification-pdf-preview-page.css` | Modificar | Refactorizar `.cert-revocado-marca` y `.cert-revocado-banda` como modificadores de un bloque `.cert-estado-marca`/`.cert-estado-banda` con `--borrador` y `--vencido`; mantener la regla `break-inside: avoid` y los overrides `@media print` (líneas 913-917) para que la versión impresa siga siendo 1 A4 landscape sin overflow. |
| `apps/frontend-angular/src/app/features/admin/certifications/pages/pdf/certification-pdf-preview-page.spec.ts` | Modificar | Sustituir/añadir tests que aserten: (a) `attendedDates` aparece como fechas ISO en el DOM del folio; (b) el texto del cuerpo no contiene "dictado entre" cuando hay 1+ fechas; (c) para `id=3`/`id=4` se renderiza marca + banda con copy BORRADOR/VENCIDO; (d) para `id=1` no se renderiza ninguna marca ni banda. |
| `apps/frontend-angular/src/app/features/admin/certifications/__checks__/no-real-data.spec.ts` | Modificar | Extender `renderPdfPreview` a ids `1, 3, 4, 5` y asertar: ausencia de DNI completo, UUID, email, legajo, matrícula; `documentMasked` y URL truncada presentes. |
| `apps/frontend-angular/src/app/features/admin/certifications/__checks__/no-secrets.spec.ts` | Modificar | Verificar que la nueva rama de template (lista de fechas exactas + bandas) no introduce literales prohibidos, `fetch`, storage, cookies, IndexedDB ni `X-Admin-Key`. |
| `openspec/changes/archive/2026-07-12-f4-02-certificate-pdf-preview/evidence/print-app-check.mjs` | Modificar | Sustituir `CASES` por `[['1','normal',[...]], ['3','borrador',[...,'BORRADOR']], ['4','vencido',[...,'VENCIDO']], ['5','revocado',[...,'revocada']]]`; añadir asserts por caso (marca textual presente, fecha ISO presente, sin "dictado entre"). Mantener la regla de 1 página A4, `overflow: visible`, sin clipping, sin DNI/UUID/email/legajo/matrícula. |
| `openspec/changes/archive/2026-07-12-f4-02-certificate-pdf-preview/evidence/print-app-check.sh` | Modificar (mínimo) | Sin cambios funcionales; añadir `pdftotext` assertions por caso si se externalizan al shell. |
| `openspec/specs/admin-certifications-frontend/spec.md` | Modificar | Delta `MODIFIED Requirements` para el requisito de previsualización: añadir escenario "Fechas exactas D0" y escenario "Marcas por estado no vigente" (borrador/vencido/revocado). |
| `openspec/changes/f4-02-codex-feedback/specs/admin-certifications-frontend/spec.md` | Crear | Delta formal (mismo contenido que el delta merged) en la carpeta del nuevo cambio, para alimentar `sdd-archive` al cierre. |
| `docs/frontend/F4-02-vista-previa-pdf.md` | Modificar | Documentar: (a) la lista de fechas exactas (no período); (b) las marcas de estado no vigente; (c) el checker extendido a ids `1, 3, 4, 5`. |
| `apps/frontend-angular/src/app/app.routes.ts` | No tocar | La ruta `certificaciones/:id/pdf` ya está registrada antes de `:id`; no se requieren cambios. |
| `apps/frontend-angular/src/app/app.routes.spec.ts` | No tocar | Cobertura vigente. |
| `apps/frontend-angular/src/app/features/admin/certifications/pages/preview/certification-preview-page.*` | No tocar | F4-01 ya cumple D0. |
| `apps/frontend-angular/src/app/features/admin/certifications/certifications.{models,service}.ts` | No tocar | DTOs y contrato no cambian. |
| `package.json` / lockfiles / `angular.json` | No tocar | Sin dependencias nuevas; sin ajustes de budget. |

## Enfoques considerados

### A. Mínimo respaldado — fechas exactas + marcas por estado (recomendado)

HTML: reemplazar el bloque `dictado entre {{ periodo() }}` por una tabla compacta (3 columnas: SEQ / FECHA / ASISTENCIA) o un bloque `<dl>` con cada fecha, replicando el patrón F4-01 dentro del folio. TS: introducir un helper `estadoMarca()` que devuelva `{ label: 'BORRADOR' | 'VENCIDO' | 'REVOCADO' | null, copy: string | null }`; un `computed` único aplica la marca y la banda cuando `label !== null`. CSS: factorizar `cert-revocado-marca`/`cert-revocado-banda` como bloque base `.cert-estado-marca`/`.cert-estado-banda` con modificadores `--borrador`, `--vencido`, `--revocado` (color y copy cambian; geometría y posición se conservan). Checker: extender `CASES` a 4 ids; añadir asserts por estado.

- **Pros**: diff chico (~150-250 líneas), preserva la corrección C1-C7 del F4-02 archivado (1 A4 landscape, sin overflow), reusa patrón existente, no rompe F4-01 ni el contrato DTO, y deja el lineage `review-c74662c658bf5781` con un delta menor.
- **Cons**: requiere un test focalizado de overflow porque la tabla suma filas; presupuesto CSS puede acercarse al warning de 12,97 kB existente (límite error 16 kB).
- **Esfuerzo**: Bajo-Medio.

### B. Refactor a un componente `CertEstadoMarca` standalone

Extraer marca+banda a un componente presentacional reusable, parametrizado por `estado` y `copy`. Aplicar tanto en F4-02 como en F4-01 (DRY). HTML limpio y un único punto de copy de estado.

- **Pros**: mejor cohesión, copy y estilo en un solo lugar, paridad F4-01/F4-02 asegurada.
- **Cons**: diff más grande (~300-500 líneas), scope creep fuera de la diagnosis codex, mayor superficie a verificar (cambia F4-01, no solo F4-02); el budget review no lo justifica.
- **Esfuerzo**: Medio-Alto.

### C. Solo-fix del colapso a período, sin marcas para borrador/vencido

Mantener las marcas como están (solo `revocado`); arreglar solo el `periodo() → attendedDates` exacta. Cubrir el resto con delta spec que diga "no vigente se imprime tal cual".

- **Pros**: diff mínimo absoluto; cero riesgo de clipping.
- **Cons**: **no cumple** el criterio del codex ("tratamiento mínimo respaldado es permitir preview/print con marca + banda textual BORRADOR/VENCIDO"). Falla el delta de marca de estado.
- **Esfuerzo**: Bajo.

## Recomendación

**Enfoque A**. Justificación:

- Alinear la diagnosis a la spec del codex (D0 + marcas por estado) sin scope creep.
- Reutilizar el patrón `.cert-revocado-*` reduce la superficie CSS y el riesgo de regresión en la corrección de impresión C1-C7 (1 A4 landscape, sin overflow, sin chrome admin).
- Mantiene el lineage `review-c74662c658bf5781` con un delta acotado; encaja en `single-pr-default` y `review_budget_lines=4000` (forecast ~200-350 líneas, lejos del presupuesto).
- El cambio en la `periodo() → attendedDates` no requiere DTO nuevo: el modelo ya expone el array; el template solo lo renderiza. La marca por estado es CSS + copy, sin lógica nueva.

## Riesgos

| # | Riesgo | Mitigación |
|---|---|---|
| 1 | La tabla de fechas exactas suma filas y rompe la regla "1 A4 landscape sin overflow" conquistada en C1-C7 | Mantener `break-inside: avoid` sobre `.certificado-folio`; verificar con `print-app-check.mjs` para `id=4` (2 fechas) e `id=1` (3 fechas) que `layout.overflow === 'visible'` y `pages === '1'`. |
| 2 | El presupuesto CSS del componente (12,97 kB hoy) se acerca al límite de error 16 kB al añadir modificadores `--borrador`/`--vencido` | Reutilizar variables CSS institucionales (`--color-destructive` y similares); un solo bloque `.cert-estado-banda { … }` con modificadores de color, no duplicar padding/typography. Si se acerca al límite, mover variantes a `admin-shell.css` ya importado. |
| 3 | Regresión de privacidad al añadir nuevos textos (literal "BORRADOR"/"VENCIDO") | `no-secrets.spec.ts` y `no-real-data.spec.ts` cubren los 4 ids; los literales nuevos son palabras institucionales, no datos prohibidos. |
| 4 | `print-app-check.mjs` se rompe al añadir un caso (puerto, login mock, dev server) | Mantener el orden de `CASES` con id 1 primero; el login mock por UI ya está validado en la versión archivada; cualquier `pages !== '1'` se reporta como `FAIL` explícito. |
| 5 | Spec divergente entre el delta archivado y el nuevo | El delta nuevo se guarda en `openspec/changes/f4-02-codex-feedback/specs/admin-certifications-frontend/spec.md` y `sdd-archive` debe mergearlo a `openspec/specs/admin-certifications-frontend/spec.md`; no se reescribe el archivo vigente, se sincroniza como delta `MODIFIED Requirements`. |
| 6 | Pérdida accidental del lineage `review-c74662c658bf5781` | El cambio correcto opera sobre la misma rama PR #40; el `verify-report.md` archivado sigue siendo evidencia del lineage previo. La nueva verify genera lineage propio sin reusar el anterior. |
| 7 | Mismatch entre el copy de la banda (p. ej. "BORRADOR") y la marca en mayúsculas (`<span>BORRADOR</span>`) | Un único helper `estadoMarca()` devuelve label y copy; un solo `@if (estadoMarca(); as em)` controla marca y banda; ningún `string literal` se duplica en el template. |

## Listo para propuesta

**Sí.** La diagnosis está confirmada contra el código real (D0 vigente, F4-02 colapsa a período, marcas solo en `revocado`, checker solo cubre ids 1 y 5). El enfoque A es backward-compatible con la corrección C1-C7, reutiliza el patrón existente, no toca F4-01 ni el DTO, y se ejecuta en un solo PR contra la rama actual. El orquestador puede lanzar `sdd-propose` con scope = enfoque A, scope_budget ≈ 200-350 líneas, single-pr-default, sin DTO nuevo, sin dependencias nuevas.

## Apéndice — referencias leídas (mínimo)

- `AGENTS.md` (raíz) y `openspec/AGENTS.md`, `apps/frontend-angular/AGENTS.md`, `docs/AGENTS.md`.
- `docs/frontend/F4-02-vista-previa-pdf.md`, `docs/frontend/F4-01-expediente-certificacion.md`.
- `openspec/changes/archive/2026-07-12-f4-02-certificate-pdf-preview/{proposal,design,tasks,verify-report}.md` y `…/specs/admin-certifications-frontend/spec.md`.
- `openspec/changes/archive/2026-07-12-f4-01-certificate-detail/specs/admin-certifications-frontend/spec.md` y `…/design.md`.
- `openspec/specs/admin-certifications-frontend/spec.md` (vigente merged).
- `apps/frontend-angular/src/app/features/admin/certifications/{certifications.models,in-memory-certifications.service,certifications.service}.ts`.
- `apps/frontend-angular/src/app/features/admin/certifications/pages/pdf/certification-pdf-preview-page.{ts,html,css,spec.ts}` (extractos clave: `periodo()` 50-59, marcas 61-63/93-100/122-124, CSS 279-305/913-917).
- `apps/frontend-angular/src/app/features/admin/certifications/pages/preview/certification-preview-page.html` (51-60, 227-252).
- `apps/frontend-angular/src/app/features/admin/certifications/__checks__/no-real-data.spec.ts` (149-209) y `no-secrets.spec.ts` (referencia).
- `openspec/changes/archive/2026-07-12-f4-02-certificate-pdf-preview/evidence/print-app-check.{sh,mjs}` (CASES 7-10).
- `apps/frontend-angular/src/app/shared/certificates/dto.ts:3,17,26,40` y `result-mapper.ts:100` (D0 reference).
- `MARCOS_PROMPTS_SDD_3_SEMANAS_CICLOS_GIT.md:34-35, 433-460` (D0 verbatim), `GUIA.md:49` (decisiones vigentes D0).
