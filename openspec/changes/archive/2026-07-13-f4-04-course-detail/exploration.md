# Exploration: F4-04 — Detalle de curso admin

**Change**: `f4-04-course-detail`
**Tipo**: exploration (no implementación)
**Proyecto**: `ifts14`
**Fecha**: 2026-07-12
**Almacén de artefactos**: hybrid (OpenSpec + Engram)
**Rama activa**: `frontend/course-detail` (sin commits sobre base)
**Base**: `b3d7675` (merge PR #46 `fix/pr-42-replacement`, sobre main con F4-03 + F3-05 + F4-02)
**Preflight cacheado**: `auto/both/single-pr-default/4000`

## Resumen ejecutivo

F4-04 evoluciona `CourseDetailPage` in-place para que `/admin/cursos/:id` alcance paridad funcional y visual con la referencia v0 (`muestra_pagina/components/admin/curso-detalle.tsx`), habilitando el bloque que F2-04/F4-03/F2-05/F2-06 dejaron diferido: estado del curso, métricas agregadas de presentes/alumnos/certificaciones por fecha, tabla accesible de fechas con asistentes cargados (Pendiente/N cargados), atajos a marcar asistencia y al expediente de certificaciones, y paridad con la v0 en jerarquía visual, acentos laterales y resumen de carga. La pantalla **no** agrega rutas, **no** toca backend, **no** introduce `X-Admin-Key`/HTTP/storage y **no** rompe el seam `COURSES_SOURCE` ni acopla `ATTENDANCE_SOURCE`/`CERTIFICATIONS_SOURCE` (consultas opcionales con `optional: true` y fallback honrado). El seam de F4-03 se mantiene: `cuatrimestre` y métricas `null`/`—` siguen siendo placeholders explícitos en el detalle cuando proceda, hasta que la spec `admin-master-data-api` los apruebe.

## Estado actual (post F4-03 + F4-02 + F3-05)

| Capa | Estado | Evidencia |
|---|---|---|
| F2-04 base cursos y fechas | ✅ mergeado | `apps/frontend-angular/src/app/features/admin/courses/{courses.models.ts, courses.service.ts, in-memory-courses.service.ts, course-detail-page.{ts,html,css,spec.ts}, course-editor-page.*, courses-list-page.*}` |
| F4-03 listado con paridad v0 | ✅ mergeado | `openspec/changes/archive/2026-07-12-f4-03-courses-list/verify-report.md` PASS 485/485, `parity-notes.md` documenta seam |
| F2-05 seam asistencia | ✅ mergeado | `apps/frontend-angular/src/app/features/admin/attendances/` con `ATTENDANCE_SOURCE` + `AttendanceMockService`; `attendance.types.ts` con `AsistenciaAlumno` (`dniMostrar`), `Asistencia`, `AsistenciaMarcado` |
| F2-06 seam certificaciones | ✅ mergeado | `apps/frontend-angular/src/app/features/admin/certifications/` con `CERTIFICATIONS_SOURCE` + `InMemoryCertificationsService`; `certifications.models.ts` con `Certificacion`, `CertificacionDetalle.attendedDates`, `AuditEvent` |
| CourseDetailPage actual | Mínimo viable: breadcrumb, ficha con `dl`, banda de estado, CTA `Editar fechas`, lista de fechas con link `Tomar asistencia` por fila (saltando `cancelada`) | `course-detail-page.html` 69 líneas, `course-detail-page.css` 219 líneas (dentro de budget 8 kB warn / 16 kB error) |
| Spec vigente | `openspec/specs/admin-courses-frontend/spec.md` con handoff explícito a F4-04 en el requirement `Acciones existentes y handoff` y `Enlace de toma de asistencia por fecha` | |
| Rutas | `/admin/cursos/:id` ya registrada con orden seguro y `COURSES_SOURCE` provisto a nivel `admin` | `app.routes.ts:101-105` |
| Contrato backend | DTO curso/alumno/fecha/asistencia/certificación ya documentados; F4-04 **no** los invoca (mock-only) | `docs/backend/01-contrato-api-certificados.md` líneas 27-115 |
| Referencia v0 | `muestra_pagina/components/admin/curso-detalle.tsx` 344 líneas (lectura segura); patrón breadcrumb, ficha con acento lateral, h2 "Registro de asistencias", tabla desktop + cards mobile, badges `Pendiente`/`N presentes` con icono, acciones "Cargar" o "Ver" por fila, vacío con CTA "Agregar fecha" | |

### Decisiones D0 que restringen F4-04

- QR/token **permanente**; reenvío normal **no** rota token. La página F4-04 no rota ni muestra tokens.
- DNI completo visible **solo** en validación pública; admin, logs, auditoría y errores **sin** DNI completo. F4-04 muestra solo `dniMostrar` enmascarado cuando corresponda (la lista de fechas y métricas no exponen DNI, sí nombre del curso y código).
- `documentMasked` `XX****XX` y `tokenPrefix` `prefijo_demo_xxx` ya implementados y validados por checks negativos.
- URL pública truncada a 60 chars (`URL_PUBLICA_MAX = 60`) — constante nombrada en `in-memory-certifications.service.ts:119`.
- Auth admin `X-Admin-Key` temporal; login real fuera del MVP. F4-04 sigue mock-only.
- `muestra_pagina/` solo como referencia visual; no compilar, no portar React/Next literalmente, no copiar credenciales demo, no usar `lucide-react`/`lucide-react`-equivalente, no usar Tailwind/shadcn/CVA.
- Email fuera del MVP; entrega manual sin SMTP. F4-04 no envía email.
- `muestra_pagina/` contiene la referencia visual v0 final y completa (export de Next.js/React con capturas para todos los flujos 4-22). Inventario contra el listado seguro de la carpeta.

### Estado actual del `CourseDetailPage` (F2-04) — qué hay hoy

- TS `course-detail-page.ts` (57 líneas): signal `detalle`, `cargando`, `error`; input `id` con `withComponentInputBinding()`; `courseId` computado con validación NaN/<=0; `ngOnInit` carga vía `courses.obtener(id)`. Sin seam a `ATTENDANCE_SOURCE` ni `CERTIFICATIONS_SOURCE`.
- HTML `course-detail-page.html` (69 líneas): breadcrumb `← Volver al listado`, header con `kicker` `Curso · {codigo}`, `<h1>` con nombre, `<p class="banda-estado">` con `aria-live="polite"`, `<dl class="curso-meta">` con Código/Creado/Actualizado, bloque `<div class="acciones">` con `Editar fechas` y `Volver al listado`, `<section class="fechas">` con `<dl class="fechas-lista">` donde cada `<dt>` es la fecha ISO y cada `<dd>` envuelve descripción/orden/estado + link `Tomar asistencia` (o texto no accionable si `cancelada`).
- CSS `course-detail-page.css` 219 líneas: usa `--color-circuit`/`--color-card`/`--color-ink`/`--color-valid`/`--color-warning-soft`; ya dentro del budget.
- Spec `course-detail-page.spec.ts` 118 líneas con 8 casos: nombre/código/estado, `dl` fechas, enlaces editar/volver, link `Tomar asistencia` por fila, fecha cancelada como texto no accionable, id inexistente, curso sin fechas, `BandaEstado` único `aria-live`, no-`fetch`.

### Gaps vs `muestra_pagina/components/admin/curso-detalle.tsx`

Comparación punto por punto entre la implementación Angular F2-04 y la referencia v0 React/Next:

| Elemento v0 | Angular F2-04 | Gap F4-04 |
|---|---|---|
| Breadcrumb `← Volver a cursos` con icono `ArrowLeft` | `<a routerLink>← Volver al listado</a>` | OK (texto, sin icono) |
| Ficha con acento lateral (`bg-circuit` activo / `bg-border` inactivo) | Sin acento lateral | **Falta** acento institucional izquierdo |
| `EstadoBadge` con dot y `bg-valid-soft` | `BandaEstado` actual con `estado-activo/borrador/cerrado/archivado/cancelada` | **Paridad mejorable** (dot + border + colores v0) |
| Encabezado `Editar curso` con icono `Pencil` | `Editar fechas` con texto y borde negro (estilo primario) | OK (sin icono, copy más preciso) |
| H2 "Registro de asistencias" + subtexto "N fechas cargadas · N pendientes" con `aria-live` | Sin subsección "Registro de asistencias"; solo `<h2>Fechas</h2>` | **Falta** h2 específico + resumen de carga con `aria-live` |
| Botón `Agregar fecha` (secundario) | No existe (solo via editor) | **Falta** atajo a `agregar fecha` desde el detalle |
| Botón `Cargar asistencias` (primario) | No existe | **Falta** atajo directo a la pantalla de marcado (la página ya existe, `Tomar asistencia` por fila cubre la ruta) |
| Tabla desktop con caption + `<th scope="col">`: Fecha / Asistencias cargadas / Acción | Lista `<dl>` con `fecha-row` grid (1 fecha + 1 línea de meta) | **Falta** tabla accesible desktop ≥`md` |
| Lista mobile `<ul class="space-y-3 sm:hidden">` con `CalendarDays` + estado + acción | Mismo grid en todos los viewports | **Falta** cards mobile con jerarquía |
| `EstadoCarga` con `CircleDashed` `Pendiente` o `CheckCircle2` `N presentes` | Solo muestra estado de la fecha (`programada/realizada/cancelada`) en badge mono | **Falta** diferenciar "asistencia pendiente" de "fecha cancelada" (visual) |
| Acciones por fila: `Cargar` (primario) si `presentes === null`, sino `Ver` (secundario) | `Tomar asistencia` (link) por fila, oculta para cancelada | **Acción incompleta** vs v0; copy "Ver" vs "Cargar" |
| Empty state "Todavía no hay fechas cargadas" con CTA `Agregar fecha` | `Este curso no tiene fechas programadas.` (texto plano) | **Falta** estado vacío enriquecido con CTA |
| Métricas por fila: "presentes" (entero o `null` con dot warning) | No se muestra; la métrica vive en el listado | **Falta** "N presentes" por fecha (cruce con `ATTENDANCE_SOURCE.listarAsistencias`) |
| Métrica global "fechasCargadas" y "pendientes" en h2 subtexto | No existe | **Falta** resumen agregable en `<h2 aria-live>` |

### Lo que NO se debe hacer en F4-04 (heredado de specs vigentes)

- `X-Admin-Key` en bundle ni en headers salientes; storage/cookies/IndexedDB; llamadas HTTP; datos reales; DNI completo administrativo; token completo; email; legajo; matrícula; UUID; dependencias nuevas; Tailwind; copia literal React/Next; persistencia real (`localStorage`/`sessionStorage`).
- Acoplar fuertemente `ATTENDANCE_SOURCE` y `CERTIFICATIONS_SOURCE`: el detalle los usa **opcional** (`{ optional: true }`) con `Promise.all` y un guard de generación idéntico al patrón de `attendance-marking-page.ts:90-101`. Fallback honrado: si el seam no está provisto o falla, mostrar placeholders `—`/`0` con texto accesible "Dato disponible con integración real" (mismo patrón que F4-03).
- Eliminar la acción `Tomar asistencia` por fila (la v0 la sustituye por `Cargar`/`Ver`; F4-04 la conserva y agrega, no reemplaza).
- Tocar `apps/backend-php/`, `database/`, `deploy/`, `material_privado_no_versionar/`, `package.json`/lockfiles, `angular.json` (salvo si budget CSS del `course-detail-page.css` supera 8 kB warn; el actual son ~5 kB estimados vs 219 líneas).
- Agregar ruta nueva: `/admin/cursos/:id` se mantiene. F4-04 evoluciona in-place sobre `course-detail-page.{ts,html,css,spec.ts}`.
- Crear un feature nuevo: el detalle permanece dentro de `features/admin/courses/`.
- Romper accesibilidad: `<dl>/<dt>/<dd>` con directiva `appCampoDato` o equivalente; `<table>` con `<caption class="sr-only">` y `<th scope="col">`; `<ul class="cards-mobile">` con `<li>` y datos accesibles; breadcrumb `<a>` con `aria-current` o equivalente; foco visible global preservado; `prefers-reduced-motion` respetado; `BandaEstado` único `aria-live` (la regla de la spec `admin-courses-frontend` se mantiene).

## Áreas afectadas (F4-04)

| Archivo / spec | Rol en F4-04 |
|---|---|
| `apps/frontend-angular/src/app/features/admin/courses/course-detail-page.ts` | **Modificado** — agregar `inject(ATTENDANCE_SOURCE, { optional: true })` y `inject(CERTIFICATIONS_SOURCE, { optional: true })`; signals `mapaAsistencias: Map<fechaId, n presentes>`, `mapaCertificaciones: Map<cursoNombre, readonly Certificacion[]>`; `cargar()` consume el seam con `Promise.allSettled` y guard de generación (mismo patrón que `attendance-marking-page.ts:90-141`). `id = input<string>('')` se mantiene; `courseId` computed se mantiene. |
| `apps/frontend-angular/src/app/features/admin/courses/course-detail-page.html` | **Modificado** — envolver ficha actual en `<article>` con acento lateral (`.detalle-card` con barra de acento `bg-circuit`/`bg-border`); agregar subsección "Registro de asistencias" con `<h2>` + `<p aria-live="polite">` con resumen "N fechas cargadas · N pendientes"; tabla desktop accesible con `<caption class="sr-only">` + `<th scope="col">`; cards mobile `<ul class="sm:hidden">`; badges de carga de asistencia (Pendiente/N presentes) por fila; vacío enriquecido con CTA `Agregar fecha` (placeholder si no aplica) si no se hace editor en línea. |
| `apps/frontend-angular/src/app/features/admin/courses/course-detail-page.css` | **Modificado** — estilo del acento lateral (`.detalle-card { display: flex } .detalle-acento { width: 4px; background: var(--color-circuit) } .detalle-acento.inactivo { background: var(--color-border) }`); tabla accesible; cards mobile; badge `Pendiente` (warning-soft + dot) y `N presentes` (valid + check); respetar budget 8 kB warn / 16 kB error. |
| `apps/frontend-angular/src/app/features/admin/courses/course-detail-page.spec.ts` | **Modificado** — agregar casos: acento lateral visible, h2 "Registro de asistencias" con `aria-live` y resumen correcto, tabla accesible desktop, cards mobile, `EstadoCarga` "Pendiente" vs "N presentes", acción `Tomar asistencia` por fila conservada, acción `Cargar` (primario) si presentes === null, acción `Ver` (secundario) si presentes > 0, `Tomar asistencia` oculto si cancelada, fallback de seam ausente (texto accesible), seam `optional: true` no rompe render, no-`fetch` por seam fallido. |
| `apps/frontend-angular/src/app/features/admin/courses/__checks__/no-secrets.spec.ts` | **Sin cambios esperados** — la lista de `sources()` ya incluye `CourseDetailPage.prototype.constructor`; el patrón es cubrir los nuevos literales del template. Si el template usa nuevos strings (`Pendiente`, `presentes`, `Agregar fecha`, `Cargar`, `Ver`), verificar que el chequeo sigue verde. |
| `apps/frontend-angular/src/app/features/admin/courses/__checks__/no-real-data.spec.ts` | **Sin cambios esperados** — los datos de la página son ficticios; los seam inyectados devuelven seed ficticio. |
| `apps/frontend-angular/src/app/features/admin/attendances/data/attendance-mock.service.ts` | **Sin cambios esperados** — la API `listarAsistencias(cursoId, fechaId)` ya existe y devuelve `readonly Asistencia[]`. F4-04 la consume con `Promise.allSettled` por cada `fechaId` y cuenta `alumnoId` únicos. |
| `apps/frontend-angular/src/app/features/admin/certifications/in-memory-certifications.service.ts` | **Sin cambios esperados** — la API `listar(filtros)` ya existe y devuelve `readonly Certificacion[]`. F4-04 la consume filtrando por `cursoNombre` exacto contra `d.nombre` (mapeo por nombre, mismo criterio que el seed de certificaciones usa al setear `cursoNombre`). Filtro cliente con `Set<string>` o `Array.filter` (no requiere nuevo método). |
| `apps/frontend-angular/src/app/app.routes.ts` | **Sin cambios esperados** — ruta `/admin/cursos/:id` ya registrada con orden seguro. |
| `apps/frontend-angular/src/app/app.routes.spec.ts` | **Sin cambios esperados** — `RouterTestingHarness` ya cubre `/admin/cursos/1`. F4-04 no agrega ni cambia ruta. |
| `apps/frontend-angular/src/app/features/admin/courses/courses.models.ts` | **Sin cambios esperados** — `Curso`, `CursoDetalle`, `CursoFecha` no requieren nuevos campos. Las métricas se computan en el componente desde los seams. |
| `apps/frontend-angular/src/app/features/admin/courses/courses.service.ts` | **Sin cambios esperados** — `CoursesService.obtener(id)` ya devuelve `CursoDetalle` con `fechas`. |
| `apps/frontend-angular/src/app/features/admin/courses/in-memory-courses.service.ts` | **Sin cambios esperados** — seed inalterado. |
| `openspec/specs/admin-courses-frontend/spec.md` | **Modificado** (delta ADDED/MODIFIED) — agregar requirement "Detalle enriquecido con métricas de asistencia y certificaciones", escenarios: cargar curso y ver métricas por fecha, seam ausente con fallback honrado, seam presente con datos del seed, acción `Cargar` vs `Ver` por fila, accesibilidad de tabla/cards, sin red ni secretos, vacío enriquecido. |
| `docs/frontend/00-angular20-port-v0.md` | **Actualizado** en `sdd-archive` — bloque "Estado F4-04 — Detalle de curso" con archivos, límites, handoff. |
| `docs/frontend/F4-04-detalle-curso.md` | **Crear** en `sdd-archive` — siguiendo el patrón de `F4-01`, `F4-02`, `F4-03`. |
| `muestra_pagina/components/admin/curso-detalle.tsx` | **Solo referencia visual** (lectura segura primeras 80 líneas + líneas clave 110-290). Inventario en `docs/frontend/00-angular20-port-v0.md`. No compilar ni portar. |
| `muestra_pagina/app/admin/cursos/[id]/page.tsx` | **Solo ruta de entrada** (17 líneas; lectura segura). |

## Criterios de aceptación hard

- **Paridad visual**: la UI del detalle F4-04 debe mantener paridad visual **igual o mejor** que `muestra_pagina/app/admin/cursos/[id]` y `muestra_pagina/components/admin/curso-detalle.tsx`. La vía preferida es copiar o simular el diseño/estilo al portar a Angular 20; **no** portar React/Next literalmente. Verificación comparativa con capturas.
- **Mock-only**: sin HTTP, sin `X-Admin-Key`, sin storage/cookies/IndexedDB, sin datos reales, sin DNI completo administrativo, sin token completo, sin email, sin legajo, sin matrícula, sin UUID, sin dependencias nuevas, sin Tailwind. La sustitución por `HttpCoursesService`/`HttpAttendanceService`/`HttpCertificationsService` queda para un ciclo con sesión segura aprobada (PHP HttpOnly o equivalente).
- **DNI/QR/token**: mantener `documentMasked` y `tokenPrefix` ya implementados; la página no expone DNI completo, token completo ni email en el DOM. Las métricas por fecha usan `presentes: number | null` y un dot `warning` para `null`.
- **Acciones reales fuera de F4-04**: la pantalla **no** implementa alta de curso (F4-04 no es el editor; sigue siendo `CourseEditorPage`), **no** elimina, **no** persiste. La acción `Tomar asistencia` por fila es la única navegación real (existe F2-05). Las acciones nuevas `Cargar` y `Ver` reutilizan la misma ruta `/admin/cursos/:id/fechas/:fechaId/asistencias` (F2-05). La eventual `Agregar fecha` (si se incluye) navega a `/admin/cursos/:id/editar` (F2-04) o queda deshabilitada con handoff.
- **Acoplamiento opcional con seams**: `ATTENDANCE_SOURCE` y `CERTIFICATIONS_SOURCE` se inyectan con `optional: true`. Si el seam no está provisto o falla, mostrar placeholders `—`/`0` con texto accesible "Dato disponible con integración real" (mismo patrón que F4-03). Esto preserva la regla de no acoplar y deja la página funcional sin esos providers.
- **Sin dependencias nuevas**: `package.json` y lockfiles sin cambios.
- **Cobertura de tests**: escenarios Given/When/Then deben cubrir render del detalle, presencia de secciones (ficha con acento, registro de asistencias, tabla desktop, cards mobile, badges de carga, acciones), `BandaEstado` único `aria-live`, breadcrumb al listado, id inválido/inexistente, seam presente con datos del seed, seam ausente con fallback, accesibilidad de tabla/cards, sin secretos ni datos reales.
- **Build verde**: `npm run build` sin warnings; CSS de `course-detail-page.css` dentro de budget 8 kB warn / 16 kB error. Carry-forward de warnings preexistentes (F4-01/F4-02) no relacionados.
- **Privacidad**: no exponer DNI, email, token, UUID, legajo ni matrícula en el DOM ni en el bundle. Mantener `checks` vigentes.
- **Responsive**: tabla oculta en mobile (`<md`); cards mobile visibles `<md`. Acciones accesibles por teclado con foco visible. `prefers-reduced-motion` respetado.
- **Estados diferenciados**: loading, error, vacío enriquecido (sin fechas con CTA `Agregar fecha`) y éxito con datos. Mínimo tres vistas distinguibles.

## Decisiones a resolver en `sdd-propose`

1. **Acoplamiento opcional vs fuerte con `ATTENDANCE_SOURCE` y `CERTIFICATIONS_SOURCE`**: recomendación **opcional** con fallback honrado a placeholder `—`/`0` + texto accesible. Razón: la spec `admin-courses-frontend` y F4-03 ya lo aplican; evita expandir el blast radius de F4-04 a features vecinas. Confirmar con el orquestador antes de `sdd-design`.

2. **Tabla desktop + cards mobile vs solo cards**: recomendación **tabla desktop ≥`md` + cards mobile `<md`** (mismo patrón que `CoursesListPage` post F4-03). La v0 usa tabla desktop + lista mobile, no cards. Mantener el seam de la v0 sin inventar un layout que la referencia no tiene.

3. **Acción `Agregar fecha` en el detalle vs placeholder**: si se incluye, navega a `/admin/cursos/:id/editar` (F2-04 ya cubre). Si se omite, dejar la v0 como referencia futura y la página solo lo muestra en el estado vacío. Decisión final con Matías.

4. **Mapeo curso → certificaciones**: la `Certificacion` actual no tiene `cursoId`, solo `cursoNombre`. El mapeo es por nombre exacto. F4-04 itera `certs.listar()` y agrupa por `cursoNombre === detalle.nombre`. Aceptable como seam temporal hasta que el backend exponga `cursoId` real. Documentar en el seam.

5. **Forecast y estrategia de entrega**: preflight `auto/both/single-pr-default/4000` cacheado. Forecast estimado **600-1100 líneas** sobre la página actual (CSS +20-50%, HTML +30-50%, TS +20-30%, specs +50-80%, checks sin cambios). Por debajo del budget 4000. **Single PR default** en la rama `frontend/course-detail` desde `b3d7675`. Confirmar con el orquestador.

6. **Route reuse y stale data**: el componente actual usa `ngOnInit` para cargar. Si F4-04 cruza seams con `Promise.allSettled` por cada fecha, debe respetar el patrón F2-04/F2-05 con `effect()` + `loadGen` y descartar respuestas obsoletas en `try`/`catch`/`finally`. El `ngOnInit` actual no reacciona a cambios de `id()` cuando Angular reutiliza la instancia en route reuse. Recomendación: migrar a `constructor() { effect(() => { ... }) }` con `untracked(() => void this.cargar(...))`, mismo patrón que `course-editor-page.ts:69-80` y `attendance-marking-page.ts:92-101`. Sin esto, navegar `/admin/cursos/1` → `/admin/cursos/2` puede mostrar datos stale.

7. **`BandaEstado` como único `aria-live`**: la spec `admin-courses-frontend` y F2-04 ya lo imponen. F4-04 debe mantener la regla: el subtexto "N fechas cargadas · N pendientes" con `aria-live="polite"` compite con la banda. Recomendación: mover el resumen a `<output aria-live="polite">` separado (no es `BandaEstado`) o reescribir el `aria-live` de la banda para que sea el resumen de carga. Decisión final con Matías.

8. **Tests runtime y de componente**: la `course-detail-page.spec.ts` actual cubre 8 casos. F4-04 debe agregar al menos 6 casos nuevos: acento lateral, h2 "Registro de asistencias" con resumen, tabla desktop, cards mobile, badge `Pendiente` vs `N presentes`, seam ausente con fallback, seam presente con datos, `Tomar asistencia` por fila conservada, `Cargar` vs `Ver` por fila, no-`fetch`, accesibilidad. Foco en escenarios Given/When/Then del spec delta.

## Enfoques evaluados

### Opción A — Evolución in-place de `CourseDetailPage` con seams opcionales (RECOMENDADA)

Rama: `frontend/course-detail` desde `b3d7675`. PR único. Reemplazar la página con paridad v0 + métricas + tabla desktop + cards mobile + acentos laterales + seams opcionales. Spec delta claro. Forecast 600-1100 líneas.

- **Pros**:
  - Mismo patrón que F4-03 (`CoursesListPage` in-place) y F4-01 (`CertificationPreviewPage` in-place).
  - No crea componente ni ruta nueva; `/admin/cursos/:id` ya existe.
  - Mantiene seams opcionales: no acopla fuertemente features, fallback honrado.
  - Spec delta claro sin reescribir la spec actual.
  - Budget holgado: 600-1100 vs 4000; single PR viable sin `size:exception`.
- **Contras**:
  - El template crece: más secciones, tabla, cards, badges. Mitigable con CSS limpio y tokens existentes.
  - Migración de `ngOnInit` a `effect()` + `loadGen` cambia el patrón del componente. Mitigable con tests out-of-order.
  - El `aria-live` de la banda puede chocar con el resumen de carga. Mitigable con `<output>` separado.
- **Esfuerzo**: Medio. ~600-1100 líneas adicionales sobre la página actual; single PR.

### Opción B — Nuevo `f4-04-course-detail-page` paralelo

Crear `pages/course-detail-v2/` y enrutar `/admin/cursos/:id` a un componente distinto. Mantener el original como legacy por un ciclo.

- **Pros**: aísla el diff y permite rollback trivial.
- **Contras**: duplica la ruta, deja dos componentes para la misma pantalla, contradice el patrón del equipo (F4-01/F4-02/F4-03 in-place).
- **Esfuerzo**: Mayor. Más diff por duplicación; menos limpio. **Descartado**.

### Opción C — Acoplar fuertemente `InMemoryCoursesService` con `AttendanceMockService`/`InMemoryCertificationsService`

Para tener `presentes` y `certificaciones` reales en el detalle, no opcionales.

- **Pros**: completitud visual del v0.
- **Contras**: invade features F2-05 y F2-06; acoplamiento entre mocks de features distintas; rompe la regla "no acoplar" de F4-03; infla el blast radius. **Descartado** mientras no haya spec `admin-master-data-api` aprobada.

### Opción D — Detalle presentational puro sin seams (solo `COURSES_SOURCE`)

Mostrar solo la ficha del curso y la lista de fechas, sin métricas de asistencia ni certificaciones. Mantener el handoff "F4-05" para esas métricas.

- **Pros**: mínimo absoluto; cero acoplamiento.
- **Contras**: no entrega el ciclo que pide el prompt de Matías ("detalle con fechas, asistencias y certificaciones asociadas"); contradice el alcance explícito.
- **Esfuerzo**: Bajo. Pero **descartado** por contradicción con el alcance del ciclo.

## Recomendación

**Opción A — F4-04 como evolución in-place de `CourseDetailPage` en la rama `frontend/course-detail` desde `b3d7675`, single PR, alcance acotado a paridad visual con `muestra_pagina/components/admin/curso-detalle.tsx` + seams opcionales + métricas con fallback honrado.**

Razones técnicas:

1. **Patrón consistente con el equipo**: F4-01, F4-02 y F4-03 reemplazaron in-place; F4-04 sigue el mismo principio sobre `CourseDetailPage`.
2. **Respeta el bloqueo declarado**: "contrato de curso, fechas, asistencias y certificaciones asociadas" — el seam `COURSES_SOURCE` + seams opcionales `ATTENDANCE_SOURCE`/`CERTIFICATIONS_SOURCE` (con `optional: true` y `Promise.allSettled`) satisfacen el bloqueo sin invadir features vecinas ni inventar endpoints.
3. **Mantiene seams dentro de su feature**: cada seam es opcional y honra fallback; la página funciona sin `ATTENDANCE_SOURCE` ni `CERTIFICATIONS_SOURCE` (renderiza placeholders `—`/`0` con texto accesible).
4. **Paridad visual obligatoría** (regla `AGENTS.md` línea 24 + `MATIAS_PROMPTS` línea 1537): tabla desktop ≥`md` con `<caption class="sr-only">` y `<th scope="col">`; cards mobile con `<ul>` y métricas; acento institucional lateral con `var(--color-circuit)`/`var(--color-border)`; acciones como texto con `aria-label` extendido (sin iconos, sin Tailwind, sin lucide).
5. **Sin dependencias nuevas**, sin Tailwind, sin shadcn, sin lucide, sin CVA, sin port literal de React/Next.
6. **Budget holgado**: 600-1100 líneas estimadas vs presupuesto 4000; single PR viable sin `size:exception`.
7. **Sin cambio de ruta**: `/admin/cursos/:id` se mantiene.

**Siguiente paso operativo**:

1. Cerrar esta exploración con `sdd-archive` (planning-only, sin código de producto) — el archivo `exploration.md` queda en `openspec/changes/f4-04-course-detail/` como evidencia.
2. Abrir el change `f4-04-course-detail` con `sdd-propose` ejecutando `explore → propose → spec → design → tasks → apply → verify → archive` en ese orden. El proposal debe declarar: alcance in-place, seams opcionales con fallback honrado, paridad v0 desktop+mobile, sin acoplar fuertemente attendance/certifs, forecast 600-1100 líneas, single PR, `size:exception` no requerida.
3. La spec delta (`admin-courses-frontend/spec.md`) debe declarar: tabla desktop accesible + cards mobile; `BandaEstado` único `aria-live` o `<output>` separado; seam `optional: true` con fallback honrado; badge `Pendiente` (warning-soft + dot) vs `N presentes` (valid + check); acción `Cargar` (primario) si presentes === null, `Ver` (secundario) si presentes > 0; `Tomar asistencia` por fila conservada; `Agregar fecha` opcional con handoff al editor; accesibilidad `<dl>` ficha + `<table>` fechas + `<ul>` mobile; sin red, secretos, datos reales, dependencias nuevas, Tailwind.
4. Handoff explícito post-F4-04: la pantalla `agregar fecha en línea` desde el detalle queda para un ciclo posterior; las acciones `Cargar`/`Ver` se acoplan a la ruta de marcado existente; las certificaciones del curso se mapean por `cursoNombre` exacto (temporal) hasta que el backend exponga `cursoId` real.

## Listo para propuesta

**Sí**, con las siguientes condiciones para el orquestador:

- Indicar al usuario que la fase siguiente es **F4-04 Detalle de curso (evolución in-place)**, en la rama `frontend/course-detail`, base `b3d7675`.
- Confirmar la base antes de `git switch -c`/`git checkout -b`: la rama ya existe en este árbol (`frontend/course-detail`); verificar con `git branch --show-current` y `git log -1 --oneline` que la base es efectivamente `b3d7675` y que la rama está limpia. Verificado en esta exploración: árbol limpio, sin commits sobre la base, working tree OK.
- Confirmar la estrategia de entrega: `single-pr-default` ya cacheada; forecast 600-1100 líneas; no se requiere `size:exception`; si el forecast final > 3500, dividir en PR encadenado en la misma rama (rara vez necesario con alcance acotado a la página).
- Confirmar las decisiones pendientes en `sdd-propose`: (1) acoplamiento opcional vs fuerte; (2) tabla + cards vs solo cards; (3) `Agregar fecha` sí/no; (4) mapeo por `cursoNombre`; (5) migración a `effect()` + `loadGen`; (6) `BandaEstado` único `aria-live` vs `<output>` separado.
- Confirmar que el ciclo NO toca: `apps/backend-php/`, `database/`, `deploy/`, `material_privado_no_versionar/`, `package.json`/lockfiles, `angular.json` (salvo budget CSS), `app.routes.ts`, `courses.service.ts`, `courses.models.ts`, `in-memory-courses.service.ts`, `attendance-mock.service.ts`, `in-memory-certifications.service.ts`, `admin-shell.*`, `sidebar-admin.*`, `admin-dashboard-page.*`, `mock-session.ts`, `admin-guard.ts`, `login-*.*`, features `public-validation`, `landing`, `not-found`, `shared/*`. Mantiene la regla "no F5+": la gestión de alumnos (F5-02/F5-03) y la entrega manual de certificación (F5-04) quedan para ciclos posteriores.
- Cerrar este change `f4-04-course-detail` con `sdd-archive` después de que el `sdd-propose` quede alineado con el orquestador, para mantener `openspec/changes/` limpio y dejar la decisión documentada.
- Después de cerrar el ciclo, ejecutar `mem_session_summary` con Goal/Instructions/Discoveries/Accomplished/Next Steps/Relevant Files.

## Riesgos

| Riesgo | Probabilidad | Mitigación |
|---|---|---|
| Acoplamiento fuerte con `ATTENDANCE_SOURCE`/`CERTIFICATIONS_SOURCE` | Media | Seams `optional: true` + `Promise.allSettled` + fallback honrado con placeholders `—`/`0` y texto accesible |
| Métricas aparentan datos reales | Baja | Placeholder rotulado y handoff a `admin-master-data-api` cuando exista |
| Regresión responsive/accesible | Media | Tests de componente (focus, teclado, `aria-live` único o `<output>` separado) y evidencia desktop/mobile contra v0 |
| Scope creep hacia F5+ (gestión de alumnos, entrega manual) | Baja | Limitar a detalle de curso; seams opcionales; ninguna acción nueva fuera de `Tomar asistencia`/`Cargar`/`Ver` |
| Route reuse pisa estado vigente | Media | Migrar de `ngOnInit` a `constructor() { effect(() => { ... }) }` con `loadGen`, mismo patrón F2-04/F2-05 |
| CSS supera budget 8 kB warn | Baja | Forecast +20-50% sobre 219 líneas (~5 kB estimados); si supera, ajustar `angular.json` (carry-forward de F4-01/F4-02) |
| Doble `aria-live` (banda + resumen) rompe spec | Media | Decidir en `sdd-propose`: `BandaEstado` único o `<output>` separado |

## Apéndice — Estructura de seams (referencia rápida)

```
COURSES_SOURCE
└─ InMemoryCoursesService
   ├─ listar(filtros?): Promise<readonly Curso[]>
   ├─ obtener(id): Promise<CursoDetalle>  ← usado por CourseDetailPage hoy
   ├─ crear(dto): Promise<CursoDetalle>
   ├─ actualizarEstado(id, estado): Promise<CursoDetalle>
   ├─ listarFechas(cursoId): Promise<readonly CursoFecha[]>
   ├─ guardarFecha(cursoId, dto): Promise<CursoFecha>
   └─ reemplazarFechas(cursoId, dtos): Promise<readonly CursoFecha[]>

ATTENDANCE_SOURCE (opcional en F4-04)
└─ AttendanceMockService
   ├─ listarAlumnos(cursoId): Promise<readonly AsistenciaAlumno[]>
   ├─ listarAsistencias(cursoId, fechaId): Promise<readonly Asistencia[]>  ← usado en F4-04
   ├─ marcar(cursoId, fechaId, marcados): Promise<readonly Asistencia[]>
   └─ anular(asistenciaId): Promise<void>

CERTIFICATIONS_SOURCE (opcional en F4-04)
└─ InMemoryCertificationsService
   ├─ listar(filtros?): Promise<readonly Certificacion[]>  ← usado en F4-04 (filtro cliente por cursoNombre)
   ├─ obtener(id): Promise<CertificacionDetalle>
   └─ contar(): Promise<number>
```

### Mapeo de métricas (F4-04)

| Métrica | Origen | Forma |
|---|---|---|
| Fechas del curso | `detalle.fechas` | `readonly CursoFecha[]` |
| Presentes por fecha | `attendance.listarAsistencias(cursoId, fechaId).length` (módulo único por alumno) | `Map<number, number>` o `Map<number, number | null>` |
| Fechas con asistencia cargada | `presentes > 0` | `number` |
| Fechas pendientes | `presentes === null` | `number` |
| Certificaciones del curso | `certs.listar().filter(c => c.cursoNombre === detalle.nombre)` | `readonly Certificacion[]` |
| Total certificaciones del curso | `certs.length` | `number` |
| Cuatrimestre | `detalle.cuatrimestre` | `string` (ya en F4-03) |
| Cantidad de fechas | `detalle.fechas.length` | `number` (ya en F4-03) |
| Alumnos del curso | `attendance.listarAlumnos(cursoId)` | `readonly AsistenciaAlumno[]` (no se muestra en F4-04; se usa solo para `length` si la spec lo exige) |

### Acciones por fila (F4-04 vs v0 vs F2-04)

| Estado de la fecha | Asistencias | v0 | F2-04 actual | F4-04 propuesto |
|---|---|---|---|---|
| `programada` | `null` (pendiente) | `Cargar` (primario) | `Tomar asistencia` (link) | `Cargar` (primario, va a `/admin/cursos/:id/fechas/:fechaId/asistencias`) + `Tomar asistencia` (secundario, mismo destino) |
| `programada` | `> 0` (cargadas) | `Ver` (secundario) | `Tomar asistencia` (link) | `Ver` (secundario) + `Tomar asistencia` (link) |
| `realizada` | `> 0` | `Ver` (secundario) | `Tomar asistencia` (link) | `Ver` (secundario) + `Tomar asistencia` (link) |
| `realizada` | `0` | (no presente en v0) | `Tomar asistencia` (link) | `Tomar asistencia` (link) + nota visual "Sin presentes" |
| `cancelada` | (no aplica) | (oculta) | Texto "Fecha cancelada: no se toma asistencia" | Texto "Fecha cancelada: no se toma asistencia" (sin cambios) |

Decisión final sobre `Cargar`/`Ver`/`Tomar asistencia` simultáneos: **simplificar a una sola acción visible** (la v0) y mover la redundancia a `aria-label` extendido. Decisión final con Matías en `sdd-propose`.
