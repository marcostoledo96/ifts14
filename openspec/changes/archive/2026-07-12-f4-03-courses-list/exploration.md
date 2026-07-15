# Exploration: F4-03 — Listado de cursos (post F4-02, sobre F2-04)

**Change**: `f4-03-courses-list`
**Tipo**: exploration (no implementación)
**Proyecto**: `ifts14`
**Fecha**: 2026-07-12
**Almacén de artefactos**: hybrid (OpenSpec + Engram)
**Rama activa**: `frontend/courses-list`
**Base**: merge `ca2f9c3` (PR #40 `frontend/certificate-pdf-preview`)

## Contexto y pregunta

F2-04 (`archive 2026-07-07-f2-04-admin-courses-dates`) ya implementó una base navegable para cursos y fechas en Angular 20: rutas `/admin/cursos*`, modelos `Curso`/`CursoFecha`, `InMemoryCoursesService` con seed de 6 cursos, `CoursesListPage` con grilla de tarjetas, búsqueda por texto y filtro por estado. F4-01 y F4-02 ya están mergeados; la base de trabajo es `ca2f9c3` (rama `frontend/certificate-pdf-preview`). F4-03 (guía unificada, línea 1533-1553) pide "implementar el listado administrativo de cursos con filtros, fechas y estados usando mocks o contrato documentado", con bloqueo declarado "contrato o mocks explícitos para cursos, fechas y estados" y referencia visual v0 `muestra_pagina/app/admin/cursos` (`muestra_pagina/components/admin/lista-cursos.tsx`).

Esta exploración debe responder: ¿qué existe?, ¿qué falta?, ¿F4-03 es mejora, port de paridad o duplicación?, ¿qué rutas/filtros/acciones/estados/datos/handoffs/tests son obligatorios?, y dejar la recomendación inequívoca para que la fase `sdd-propose` defina alcance y que `sdd-spec` no tenga que re-investigar.

## Estado actual (lo que ya está en `ca2f9c3`)

### `apps/frontend-angular/src/app/features/admin/courses/` (todo F2-04)

| Archivo | Líneas | Estado |
|---|---:|---|
| `courses.models.ts` | 47 | `EstadoCurso` = `borrador\|activo\|cerrado\|archivado` (alineado al backend real); `EstadoFecha` = `programada\|realizada\|cancelada`; `Curso` con `id, codigo, nombre, estado, createdAt, updatedAt`; `CursoFecha`, `CursoDetalle`, `CursoDraft`, `CursoFechaDraft`, `CursosFiltros` con `estado?` y `q?`. **No** modela `cuatrimestre` ni contadores (`fechas`, `alumnosPresentes`, `certificaciones`). |
| `courses.service.ts` | 29 | `CoursesService` interface (`listar`, `obtener`, `crear`, `actualizarEstado`, `listarFechas`, `guardarFecha`, `reemplazarFechas`) + `COURSES_SOURCE` `InjectionToken`. Sin HTTP. |
| `in-memory-courses.service.ts` | 262 | Seed: 6 cursos `CUR-001..CUR-006` con 1-3 fechas cada uno; mutaciones solo en instancia; sin DNI, emails, tokens, matrículas ni nombres reales. |
| `courses.service.spec.ts` | 7.5K | Cobertura de filtros, mutaciones, validaciones y reset por test. |
| `courses-list-page.{ts,html,css,spec.ts}` | 64 + 72 + 219 + 103 = 458 | Página actual: `<input type="search">` + `<select>` por estado, grilla responsive 1-2 columnas con `<article class="card-curso">`, banner "Datos de demostración", CTA "Nuevo curso" vía `routerLink="/admin/cursos/nuevo"`, enlace a `/admin/cursos/:id`. **No** tiene: chips toggle, "con/sin fechas", tabla desktop, mobile cards con métricas, `cuatrimestre`, contadores, limpiar filtros, vista states demostrables. |
| `course-detail-page.{ts,html,css,spec.ts}` | 57 + 69 + … | Detalle con nombre/código/estado (banda `<p class="banda-estado" aria-live="polite">`), `<dl>` de fechas, links a `editar` y `Tomar asistencia` por fecha. **Fuera de scope F4-03**. |
| `course-editor-page.{ts,html,css,spec.ts}` | 221 + … | Modo `create`/`edit` con `fieldset/legend`, `<input type="date">`, `reemplazarFechas`. **Fuera de scope F4-03**. |
| `__checks__/no-secrets.spec.ts` | 1.9K | Prohíbe `X-Admin-Key`, `localStorage`, `sessionStorage`, `document.cookie`, `HttpClient`, `fetch(`, `XMLHttpRequest`, `DNI`, `token`, `http://`, `https://` en `InMemoryCoursesService`, `CoursesListPage`, `CourseDetailPage`, `CourseEditorPage`. |
| `__checks__/no-real-data.spec.ts` | 2.1K | Verifica `códigos CUR-NNN`, sin emails, sin UUID, 6 cursos, ids <100, sin nombres propios plausibles. |

### Routing (`app.routes.ts`, `app.routes.spec.ts`)

- `app.routes.ts:80-110`: `/admin/cursos/nuevo`, `/admin/cursos/:id/fechas/:fechaId/asistencias` (F2-05), `/admin/cursos/:id/editar`, `/admin/cursos/:id`, `/admin/cursos` (CoursesListPage) — orden seguro first-wins; `COURSES_SOURCE` proveído a nivel de ruta admin.
- Tests de orden: `/admin/cursos/nuevo` no cae en `:id`; `/admin/cursos/123/editar` no cae en `:id` ni `nuevo`; id inválido (`/admin/cursos/abc`) muestra "no encontrado" sin excepción.
- **No se requieren rutas nuevas** para F4-03; la evolución es in-place sobre la misma ruta `/admin/cursos`.

### Specs vigentes

- `openspec/specs/admin-courses-frontend/spec.md`: 5 requirements (Rutas protegidas, UI contract-ready, Frontera segura, Documentación/handoff, Enlace de toma de asistencia) — todos ya cumplidos. F4-03 no necesita un spec nuevo, sino un **delta** sobre este (o un spec complementario `admin-courses-frontend/listado` si se prefiere granularidad). Se recomienda delta MODIFIED/ADDED.
- `openspec/specs/admin-foundation/spec.md`: cubre shell, login, sesión mock, accesibilidad, sin dependencias visuales nuevas. Ya cumplido.
- `openspec/specs/database-cursos-alumnos-asistencias/spec.md` (archivado 2026-07-02): modelo `cert_cursos`, `cert_curso_fechas`, `cert_alumnos`, `cert_asistencias`, `cert_certificado_fechas`. Contrato de datos disponible.
- `openspec/specs/admin-master-data-api/spec.md`: API admin para `cursos`, `fechas`, `asistencias`. Endpoints ya documentados, integración real pospuesta (HttpCoursesService queda para ciclo con sesión segura aprobada).

### Archivos previos del workflow Matias (referencia)

- `archive/2026-07-12-planificar-siguiente-fase-matias/exploration.md` (línea 116-131): **Opción C — F4-03 Listado de cursos** ya evaluada como "alternativa independiente"; conclusión archivada: "Esfuerzo: Medio. UI listado + filtros + detalle de curso si se hace junto con F4-04". El plan no se cerró porque F4-01/F4-02 tomaron prioridad en la unidad `certificate-detail-pdf`.
- `archive/2026-07-07-f2-04-admin-courses-dates/proposal.md` (línea 50): "Mitigación Riesgo: Superar 1500 líneas → `sdd-tasks` debe recomendar split antes de apply si el forecast excede presupuesto". El PR de F2-04 terminó con `size:exception` (Matías aprobó explícitamente 3452 líneas vs 1500 budget). Es precedente: este módulo admite excepción justificada, pero single-pr sigue siendo preferida.
- `archive/2026-07-12-f4-01-certificate-detail/design.md` (línea 13-17): patrón "evolución in-place sobre la misma ruta/componente"; "Reusar la ruta, el seam `CERTIFICATIONS_SOURCE`, `CertificacionDetalle` y los mocks de F2-06". F4-01 lo demuestra: reemplazó el preview in-place sin cambiar la ruta. F4-03 puede replicar este patrón sobre `courses-list-page`.

### Referencia visual v0 (`muestra_pagina/components/admin/lista-cursos.tsx`, 713 líneas)

La página v0 implementa, en React + Tailwind + lucide:

| Elemento v0 | Estado actual Angular | Acción F4-03 |
|---|---|---|
| Search + chip filters toggle (`aria-pressed`) | `<input type="search">` + `<select>` único por estado | **Portar** chips Estado (activos/inactivos) y Fechas (con/sin). Mantener el `<select>` o reemplazarlo por chips: el `select` actual es accesible y más compacto, pero los chips permiten multi-selección coherente con la spec (`EstadoCurso` actual tiene 4 valores, no 2 — v0 simplifica a 2). |
| Tabla desktop (`md:block`) con columnas: nombre+codigo+cuatrimestre / fechas / alumnos / certif / estado / acciones | Grilla de `<article>` 1-2 cols (mobile/tablet) | **Portar** tabla desktop ≥`md` con `<caption class="sr-only">`, `<th scope="col">` y `<tbody>`. Mantener grilla de tarjetas en `<md` para paridad. |
| Card mobile con `<dl>` de métricas inline | Card simple con `<dl class="card-curso-meta">` (solo código+actualizado) | **Portar** métricas inline (fechas, presentes, certif) con `<dl>` nativo. |
| `cuatrimestre: string` en `Curso` v0 (`"1.er cuatrimestre 2026"`, `"Sin programar"`, `"2.º cuatrimestre 2025"`) | No modelado | **Agregar** al modelo `Curso` y al seed; sin backend real, queda como string libre institucionalmente seguro. |
| Conteos: `fechas: number` (count), `alumnosPresentes: number`, `certificaciones: number` | `fechas` puede derivarse trivialmente del `CursoDetalle` en mock; `alumnosPresentes` y `certificaciones` requieren cruzar con `InMemoryAttendanceService` e `InMemoryCertificationsService` o `Http*Service` futuro | **Decisión**: derivar `fechas` en `InMemoryCoursesService.listar()` (cómputo trivial en mock). Para `alumnosPresentes` y `certificaciones`, **no cruzar features**: mostrar `0` con copy explícito "Dato disponible con integración real" o placeholders neutros hasta que `admin-master-data-api` apruebe la spec. Riesgo: si se acopla `InMemoryCoursesService` con `InMemoryAttendanceService`/`InMemoryCertificationsService` ahora, F4-03 invade F2-05/F2-06. |
| `EstadoBadge` con tokens `bg-valid-soft` / `bg-secondary` | `estado-chip estado-{{ c.estado }}` con `color-mix` para activo y gris para resto | **Mantener** chip actual (más simple, ya accesible). El chip actual cubre los 4 estados del backend real; el badge v0 solo cubre 2 (`activo`/`inactivo`). |
| `BotonAccion` icon (Eye, Pencil) con `aria-label` | `card-curso-link` texto "Ver detalle" | **Portar** acciones: ícono "Ver detalle" → `/admin/cursos/:id` (F2-04 detail); ícono "Editar" → `/admin/cursos/:id/editar` (F2-04 editor). Sin íconos de librerías (Tailwind/lucide prohibidos per AGENTS.md F1-02 → F1-04 pendiente). Reemplazar con SVG inline o glifos neutros como ya hace `sidebar-admin` o por texto corto. **Recomendación**: acciones texto con `aria-label` extendido, sin iconos. |
| "Limpiar filtros" (`X` button) cuando `hayFiltrosActivos` | No existe | **Portar** acción de limpiar. |
| Resumen resultados con `aria-live="polite"` | No existe (solo mensaje de "No hay cursos…") | **Portar** "N cursos en el archivo / coinciden con el filtro" como `<output aria-live="polite">`. |
| Empty/loading/error states (`TablaCargando`, `EstadoError`, `EstadoSinResultados`, `EstadoVacio`) | Cubierto parcialmente: `cargando()` y `error()` con `<p>` y mensaje de "No hay cursos…". | **Portar** `EstadoCargando` (skeleton `<div>` con `aria-busy="true"`) y `EstadoError` (mensaje seguro + botón "Reintentar" que reaplica la promesa `recargar()`). Sin el demo switcher "Con datos/Cargando/Error/Sin cursos" del v0 (eso es debug del sample, no producto). |
| `aria-label` por `BotonAccion` con nombre del curso | No | **Portar** `aria-label="Ver detalle de {{ curso.nombre }}"` y `aria-label="Editar {{ curso.nombre }}"`. |
| `bg-circuit` / `bg-border` en barra lateral de fila (acento institucional) | `card-curso` con borde neutro | **Portar** barra vertical 4px en tarjeta y 0.5px en card mobile, usando tokens `var(--color-circuit)` y `var(--color-border)` ya documentados en F1-02. |

### Filtros y estados

- v0 simplifica estados a 2 (`activo` / `inactivo`). Angular real usa 4 (`borrador` / `activo` / `cerrado` / `archivado`). El chip toggle con 2 valores no se mapea directo; opciones:
  - **A. Mantener `<select>`** (más simple, cubre los 4) + agregar chips "Con fechas" / "Sin fechas" como segundo grupo. Reutiliza el patrón actual; menos diff.
  - **B. Reemplazar `<select>` por chips** con 4 toggles de estado. Coherente con v0 pero pierde la opción "Todos" implícita (multi-selección OK si la spec permite "ninguno" = "todos").
  - **Recomendación**: **A** — el `<select>` actual es accesible, ya testeado, y cubre los 4 estados del backend real. Los chips nuevos (Fechas: con/sin) sí se portan. El filtro "cuatrimestre" no se modela como toggle (cuatrimestre es string libre).
- Filtro `q` actual: case-insensitive sobre `codigo` y `nombre`. **Mantener**.
- "Limpiar filtros": resetea `q`, `estado`, `fechas` (con/sin). **Portar**.

### Acciones y handoffs

- "Nuevo curso" → `/admin/cursos/nuevo` (existe, F2-04).
- "Ver detalle" → `/admin/cursos/:id` (existe, F2-04 detail).
- "Editar" → `/admin/cursos/:id/editar` (existe, F2-04 editor, handoff a F4-04 si se quiere detail real; pero el editor de F2-04 ya permite gestión de fechas — **no inventar "editar datos del curso" que no esté en F2-04**).
- "Tomar asistencia" en detail (F2-05) — **fuera de scope F4-03**; el link por fila se queda en detail.
- "Eliminar curso" — **no inventar**. No hay spec que lo apruebe.

### Datos permitidos en la UI

- Visible: `codigo`, `nombre`, `estado`, `cuatrimestre`, `fechas` (count), `alumnosPresentes` (mock explícito o 0), `certificaciones` (mock explícito o 0), `updatedAt` (opcional, no usado en v0).
- **No** visible: `createdAt` (auditoría), DNI, email, token, legajo, matrícula, UUID, datos reales.
- Conteos reales `alumnosPresentes` y `certificaciones` **no se infieren** desde asistencia/certif mocks sin cruzar features. Se muestran como `0` con copy "Disponible con integración" o se omiten del listado (preferible mostrar `—` con `aria-label="Dato pendiente de contrato"`).

### Tests previstos

| Capa | Cobertura objetivo | Enfoque |
|---|---|---|
| Unit/component | Búsqueda, chip filtros (con/sin fechas), limpiar filtros, empty state, vista cargando/error, acciones `aria-label` y links a detail/editor | `courses-list-page.spec.ts` ampliado (>=12 tests, estilo F2-06 cert list) |
| Routing | `/admin/cursos` carga con provider, id inválido sigue funcionando, sin cambio de orden | `app.routes.spec.ts` sin cambios esperados |
| Privacidad/seguridad | Sin `X-Admin-Key`, storage, HTTP, DNI, token, email, UUID, `documentNumber` | `__checks__/no-secrets.spec.ts` endurecido para incluir nuevos campos; `__checks__/no-real-data.spec.ts` extendido con `cuatrimestre` permitido pero no `Sin programar` malformado, sin UUID en códigos |
| Visual/paridad | Capturas desktop 1280×800 y mobile 390×844 contra `muestra_pagina/components/admin/lista-cursos.tsx` | `evidence/cursos-desktop.png`, `evidence/cursos-mobile.png`, `evidence/estado-cargando.png`, `evidence/estado-error.png`, `parity-notes.md` |
| Build | `npm run test:ci` + `npm run build` verde, sin warnings nuevos de budget CSS | `angular.json` puede requerir ajuste si el CSS del listado crece > 8 kB warning (F4-01 ya lo subió a 8kB warning / 16kB error en `certification-preview-page.css`) |

### Riesgos identificados

| Riesgo | Probabilidad | Mitigación |
|---|---|---|
| Acoplar `InMemoryCoursesService` con `InMemoryAttendanceService`/`InMemoryCertificationsService` para `alumnosPresentes`/`certificaciones` → invade F2-05/F2-06 | Media | Mostrar `0` o `—` con copy explícito "pendiente de contrato" hasta que `admin-master-data-api` apruebe la spec; documentar handoff en `sdd-archive`. |
| Reemplazar `<select>` por chips para los 4 estados del backend → fricción con la UX accesible actual y mayor diff sin valor | Baja | Mantener `<select>` (probado, accesible) y portar solo los chips "Con/Sin fechas" como segundo grupo. |
| Cargar `cuatrimestre` con strings arbitrarios → drift visual con v0 | Baja | Reusar los strings literales del seed v0: `"1.er cuatrimestre 2026"`, `"2.º cuatrimestre 2025"`, `"Sin programar"`. |
| Exceder el budget de 4000 líneas (F2-04 ya pidió `size:exception`) | Baja | Forecast: 600-1100 líneas adicionales (página reemplazada + modelo + servicio + spec + checks + evidence). Dentro del budget usuario (4000). Si `sdd-tasks` proyecta >3500, dividir en PR encadenado en la misma rama. |
| Duplicación con F2-04 — confusión sobre qué ciclo cerró qué | Baja | F4-03 **evolución in-place** del mismo archivo `courses-list-page.{ts,html,css,spec.ts}` (mismo patrón que F4-01 con `certification-preview-page`); el PR description deja explícito que reemplaza F2-04. |
| Inventar íconos (lucide/Tailwind) que rompan la regla F1-02 | Media | Acciones como texto con `aria-label` extendido o SVG inline (los iconos de `sidebar-admin` ya son SVG inline en Angular — replicar el patrón si se quiere icono). |
| Confundir "filtros" del modelo con los del v0 (v0 solo 2 estados, real 4) | Media | Documentar en spec y `parity-notes.md` la decisión: `<select>` actual se conserva; chips nuevos son "Con/Sin fechas" (coherente con el dominio). |
| Cambiar la ruta o crear un nuevo componente `f4-03-courses-list-page` paralelo | Baja | El prompt de F4-03 explícitamente dice "no copies React/Next literalmente"; la guía unificada (línea 1537) dice "frontend/admin-courses" como rama — no ruta nueva. F4-03 es in-place en `/admin/cursos`. |

## Áreas afectadas

| Área | Impacto | Descripción |
|---|---|---|
| `apps/frontend-angular/src/app/features/admin/courses/courses.models.ts` | Modificado | Agregar `cuatrimestre: string` y conteos derivados (`fechas: number`, `alumnosPresentes: number`, `certificaciones: number` con default `0`). Ajustar `CursosFiltros` con `conFechas?: boolean` o `fechas: 'con' \| 'sin' \| 'todos'`. |
| `apps/frontend-angular/src/app/features/admin/courses/courses.service.ts` | Modificado | Mantener firma `listar(filtros?)`; añadir overload o `CursosFiltros` con `conFechas`. |
| `apps/frontend-angular/src/app/features/admin/courses/in-memory-courses.service.ts` | Modificado | Seed: agregar `cuatrimestre` a los 6 cursos. `listar()` computa `fechas: this.cursos.find(...).fechas.length` para cada item; `alumnosPresentes` y `certificaciones` = `0` con comentario. Aplicar filtro `conFechas`/`sinFechas` server-side. |
| `apps/frontend-angular/src/app/features/admin/courses/courses-list-page.{ts,html,css,spec.ts}` | Modificado in-place | Reemplazar la grilla de cards por tabla desktop ≥`md` + mobile cards. Agregar chips "Con/Sin fechas". Resumen `<output aria-live="polite">` con "N cursos / Limpiar". Skeleton loading + estado error + estado sin resultados vs vacío. Acciones "Ver detalle" y "Editar" con `aria-label`. |
| `apps/frontend-angular/src/app/features/admin/courses/__checks__/no-secrets.spec.ts` | Modificado | Endurecer para incluir la página modificada. |
| `apps/frontend-angular/src/app/features/admin/courses/__checks__/no-real-data.spec.ts` | Modificado | Validar `cuatrimestre` no vacío, sin UUID, sin `Sin programar` malformado. |
| `apps/frontend-angular/src/app/app.routes.spec.ts` | Sin cambio esperado | Ruta `/admin/cursos` sin tocar; `RouterTestingHarness` ya cubre la carga. |
| `apps/frontend-angular/angular.json` | Posible ajuste | Si CSS del listado crece > 8 kB warning, ajustar budget a `8kB warn / 16kB error` (mismo ajuste que F4-01). |
| `apps/frontend-angular/src/app/features/admin/courses/__checks__/` | Modificado | `parity-notes.md` se guarda en `openspec/changes/f4-03-courses-list/evidence/` (no en la app). |
| `openspec/specs/admin-courses-frontend/spec.md` | Delta MODIFIED/ADDED | Agregar requirement "Listado con paridad v0: filtros chips, tabla desktop, mobile cards, métricas, limpiar, estados de pantalla". |
| `docs/frontend/00-angular20-port-v0.md` | Modificado en `sdd-archive` | Bloque "Estado F4-03 — Listado de cursos" con archivos, límites, handoff a F4-04. |
| `docs/frontend/F4-03-listado-cursos.md` | Crear en `sdd-archive` | Siguiendo el patrón de `F4-01-expediente-certificacion.md` y `F4-02-vista-previa-pdf.md`. |

## Enfoques evaluados

### Opción A — Evolución in-place de `courses-list-page` (RECOMENDADA)

Rama: `frontend/courses-list`. PR único. Reemplazar el archivo de la página con la paridad v0 + chips + tabla desktop + cards mobile + métricas + limpiar + estados. Extender modelo con `cuatrimestre` y conteos derivados. `InMemoryCoursesService` queda dentro de la feature. Sin acoplar `ATTENDANCE_SOURCE`/`CERTIFICATIONS_SOURCE`.

- **Pros**:
  - Mismo patrón que F4-01 (`certification-preview-page` reemplazado in-place).
  - No crea componente ni ruta nueva; la ruta `/admin/cursos` y `CoursesListPage` ya existen.
  - Mantiene mocks dentro del feature (no cruza con F2-05/F2-06).
  - Spec delta claro, sin reescribir la spec actual.
  - Budget usuario 4000 holgado (forecast 600-1100).
- **Contras**:
  - El modelo `Curso` cambia (agrega `cuatrimestre`, conteos): rompe consumidores que importen el tipo sin defaults. Mitigable con defaults en el seed y tests que no asuman shape previa.
  - El cambio in-place hace que la historia de git muestre "rewrite" — la propuesta debe dejar claro que reemplaza F2-04.
- **Esfuerzo**: Medio. ~600-1100 líneas adicionales sobre el estado actual; single PR.
- **Tamaño de revisión estimado**: ~900 líneas adicionales (página + spec + checks + docs). F2-04 fue 3452 con `size:exception`; este forecast es ~3-4x más bajo.

### Opción B — Nuevo `f4-03-courses-list-page` paralelo

Crear `pages/courses-list-v2/` y enrutar `/admin/cursos` a un componente distinto del de F2-04. Mantener el `courses-list-page` original como legacy por un ciclo.

- **Pros**: aísla el diff y permite rollback trivial.
- **Contras**: duplica el route, deja dos componentes para la misma pantalla, contradice la consigna del prompt de F4-03 ("listado de cursos" único), y el equipo de Matías no usa ese patrón (F4-01 y F4-02 in-place).
- **Esfuerzo**: Mayor. Más diff por duplicación; menos limpio.

### Opción C — Acoplar `InMemoryCoursesService` con `InMemoryAttendanceService`/`InMemoryCertificationsService`

Para tener `alumnosPresentes` y `certificaciones` reales en el listado mock.

- **Pros**: completitud visual del v0.
- **Contras**: invade features F2-05 y F2-06; acoplamiento entre mocks de features distintas; requiere `inject(ATTENDANCE_SOURCE, {optional: true})` y `inject(CERTIFICATIONS_SOURCE, {optional: true})` con `Promise.all`, lo que infla `listar()` y suelta blast radius de F4-03 sobre las otras specs. **No recomendado** mientras no haya spec `admin-master-data-api` aprobada que lo habilite.
- **Esfuerzo**: Alto. Más diff, más tests, mayor riesgo de regresión.

## Recomendación

**Opción A — F4-03 como evolución in-place de `courses-list-page` en la rama `frontend/courses-list` desde `ca2f9c3`, single PR, alcance acotado a paridad visual con `muestra_pagina/components/admin/lista-cursos.tsx`.**

Razones técnicas:

1. **Patrón consistente con el equipo**: F4-01 y F4-02 reemplazaron la página existente in-place; F4-03 sigue el mismo principio sobre `courses-list-page`.
2. **Respeta el bloqueo declarado**: "contrato o mocks explícitos" — el seed actual + `cuatrimestre` agregado + conteos derivados en mock satisfacen el bloqueo sin invadir features vecinas ni inventar endpoints.
3. **Mantiene mocks dentro de la feature**: `InMemoryCoursesService` sigue siendo autónoma; `alumnosPresentes` y `certificaciones` se muestran como `0` con copy "Dato disponible con integración real" (placeholder honesto) hasta que `admin-master-data-api` los apruebe.
4. **Filtros útiles, no exóticos**: `<select>` por estado (cubre los 4 del backend real) + chips "Con/Sin fechas" (coherente con el dominio) + "Limpiar filtros". El `<select>` no se reemplaza por chips porque 4 toggles serían ruido; el sample v0 es de 2 estados y simplifica.
5. **Paridad visual obligatoría** (regla `AGENTS.md` línea 24 + `MATIAS_PROMPTS` línea 1537): tabla desktop ≥`md` con `<caption class="sr-only">` y `<th scope="col">`; mobile cards con `<dl>` de métricas; barra lateral de acento institucional con `var(--color-circuit)`/`var(--color-border)`; acciones como texto con `aria-label` extendido (sin iconos, sin Tailwind, sin lucide).
6. **Sin dependencias nuevas**, sin Tailwind, sin shadcn, sin lucide, sin CVA, sin port literal de React/Next (regla F1-02 → F1-04 pendiente).
7. **Budget holgado**: 600-1100 líneas estimadas vs presupuesto 4000; single PR viable sin `size:exception`.
8. **Sin cambio de ruta**: `/admin/cursos` se mantiene; F4-04 (detalle de curso) puede salir después desde la misma rama mergeada o desde un nuevo branch — fuera de scope de esta exploración.

**Siguiente paso operativo**:

1. Cerrar esta exploración con `sdd-archive` (planning-only, sin código de producto) — el archivo `exploration.md` queda en `openspec/changes/f4-03-courses-list/` como evidencia.
2. Abrir el change `f4-03-courses-list` con `sdd-propose` ejecutando `explore → propose → spec → design → tasks → apply → verify → archive` en ese orden. El proposal debe declarar: alcance in-place, modelo extendido con `cuatrimestre` + conteos derivados (mock), paridad v0 desktop+mobile, sin acoplar attendance/certifs, forecast 600-1100 líneas, single PR, `size:exception` no requerida.
3. La spec (`admin-courses-frontend/spec.md` o un spec delta paralelo) debe declarar: filtros `<select>` estado + chips "Con/Sin fechas" + limpiar + `aria-live` resumen; tabla desktop ≥`md` con `caption` + `th`; cards mobile con `dl` métricas; `EstadoCargando` skeleton + `EstadoError` con reintentar + `EstadoVacio` vs `EstadoSinResultados`; `cuatrimestre` string libre; conteos `fechas` derivado en mock; `alumnosPresentes` y `certificaciones` placeholder `0` con handoff a `admin-master-data-api` cuando exista spec.
4. Handoff explícito a F4-04: `cuatrimestre` y conteos mock sentarán base; el detalle de curso (F4-04) reusará el seam `COURSES_SOURCE` y los mismos placeholders de `alumnosPresentes`/`certificaciones`.

## Listo para propuesta

**Sí**, con las siguientes condiciones para el orquestador:

- Indicar al usuario que la fase siguiente es **F4-03 Listado de cursos (evolución in-place)**, en la rama `frontend/courses-list`, base `ca2f9c3`.
- Confirmar la base antes de `git switch -c`/`git checkout -b`: la rama ya existe en este árbol (`frontend/courses-list`); verificar con `git branch --show-current` y `git log -1 --oneline` que la base es efectivamente `ca2f9c3` y que la rama está limpia o con un WIP explícito aprobado.
- Confirmar la estrategia de entrega: `single-pr-default` ya cacheada; forecast 600-1100 líneas; no se requiere `size:exception`; si el forecast final > 3500, dividir en PR encadenado en la misma rama (rara vez necesario con alcance acotado a la página).
- Confirmar que el ciclo NO toca: `apps/backend-php/`, `database/`, `deploy/`, `material_privado_no_versionar/`, `apps/frontend-angular/src/app/features/admin/attendances/`, `apps/frontend-angular/src/app/features/admin/certifications/`, ni `package.json`/lockfiles. Mantiene la regla de "no F4-04 detalle": el detail de curso queda para el siguiente ciclo.
- Cerrar este change `f4-03-courses-list` con `sdd-archive` después de que el `sdd-propose` quede alineado con el orquestador, para mantener `openspec/changes/` limpio y dejar la decisión documentada.
