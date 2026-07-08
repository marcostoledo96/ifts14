# Exploration: F2-05 — Asistencias admin

> **NOTA DE VERACIDAD (post-implementación, pre-PR CRITICAL F2-05)** — Esta
> exploration se escribió antes de implementar F2-05. Varias recomendaciones de
> reuso de primitivos F1-02 (`BandaEstado`, `appCampoDato`) como componentes en
> runtime **fueron superadas durante la implementación**. La implementación real
> de F2-05 NO usa `BandaEstado` ni `appCampoDato` en el runtime de asistencia;
> usa HTML semántico nativo: `<dl>/<dt>/<dd>`, `<p role="alert">` para errores,
> banners demo con `role="status"`, párrafos nativos para carga y `<output aria-live="polite">`. Los tokens F1-02
> (colores, tipografía, espaciado, `--focus-ring`) se reusan vía CSS custom
> properties, pero los primitivos como componentes/directivas NO se consumen.
> Los pasajes históricos que siguen se preservan como contexto de la decisión
> inicial, pero donde dicen "reusa `BandaEstado`/`appCampoDato`" debe leerse
> como "recomendación inicial, superada en implementación". Ver correcciones
> marcadas con `[SUPERSEDED]` más abajo.

## Goal

F2-05 es el tercer ciclo de Fase 2 dedicado al panel administrativo, según `MATIAS_PROMPTS_SDD_3_SEMANAS_CICLOS_GIT.md` líneas 948-993 y la spec `admin-foundation` (líneas 80-97) que dejó como handoff explícito:

> F2-05..F2-06 agregan funcionalidad administrativa. Cuando consultan la documentación F2-04, DEBEN encontrar Cursos activo, Asistencias/Certificaciones deshabilitados y límites vigentes como base de integración.

**Objetivo del ciclo**: preparar la UI administrativa Angular 20 para **marcar o revisar asistencias presentes** de un curso por fecha, sobre los modelos y mocks ya entregados por F2-04. Sin persistencia real, sin auth real, sin `X-Admin-Key`, sin HTTP desde el browser, sin storage, sin DNI completo, sin tokens, sin Tailwind, sin copia literal de `muestra_pagina/`.

Rama: `frontend/admin-attendance` (limpia desde `main` actualizado con PR #35 que mergeó F2-04). Modo SDD: artifact store `hybrid` (OpenSpec + Engram), chained-PR `single-pr-default`, review budget **1500**.

## Current State (Angular, post F2-04)

- `apps/frontend-angular/` Angular CLI 20.3.30 standalone, 239/239 tests verde al cierre de F2-04 (archivado en `openspec/changes/archive/2026-07-07-f2-04-admin-courses-dates/`), build prod sin warnings: 306.01 kB initial / 88.57 kB transfer; lazy `course-editor-page` 12.03 kB, `courses-list-page` 8.03 kB, `course-detail-page` 7.27 kB.
- `apps/frontend-angular/src/app/features/admin/courses/` ya entrega: `courses.models.ts` (`EstadoCurso`, `EstadoFecha`, `Curso`, `CursoFecha`, `CursoDetalle`, `CursoDraft`, `CursoFechaDraft`, `CursosFiltros`), `courses.service.ts` (interfaz + `COURSES_SOURCE` `InjectionToken`), `in-memory-courses.service.ts` (seed 6 cursos × 1-3 fechas, sin DNI/email/token/matrícula), listado, detalle y editor con `effect()` anti-route-reuse aplicado en F2-04, y `__checks__/{no-secrets,no-real-data}.spec.ts`.
- `apps/frontend-angular/src/app/app.routes.ts` (100 líneas) tiene rutas admin hijas: `admin/login`, `admin` → `/admin/dashboard`, `admin/dashboard`, `admin/cursos/nuevo`, `admin/cursos/:id/editar`, `admin/cursos/:id`, `admin/cursos`, catch-all admin y wildcard público.
- `apps/frontend-angular/src/app/features/admin/sidebar-admin.ts` tiene 5 ítems; `Asistencias` con `route: null` (placeholder deshabilitado). El método `isActive()` debe extender la regla de prefijo a `/admin/asistencias*` análoga a Cursos.
- `apps/frontend-angular/src/app/features/admin/admin-dashboard-page.{ts,html}` tiene 3 tarjetas: "Cursos" como link real, "Asistencias" y "Certificaciones" como placeholders. La tarjeta Asistencias pasa a link real en F2-05.
- `apps/frontend-angular/src/styles.css` (F1-02): tokens completos suficientes. Sin nuevos tokens en F2-05.
- `apps/frontend-angular/angular.json`: presupuestos `500 kB warn / 1 MB error` initial, `4 kB warn / 8 kB error` por `anyComponentStyle`. F2-05 debería tocar ~3-5 kB por `attendance-marking-page` (tabla + checklist + búsqueda).
- `apps/frontend-angular/package.json`: solo `@angular/*` 20.3.0, `rxjs`, `tslib`, `zone.js`, tooling. F2-05 no agrega dependencias.

### Primitivos F1-02 reusables

> **[SUPERSEDED — ver NOTA DE VERACIDAD arriba]** La implementación real de
> F2-05 NO usa estos primitivos como componentes/directivas en runtime. Se
> conservan los tokens F1-02 (CSS custom properties) pero se usa HTML semántico
> nativo. Las líneas siguientes reflejan la recomendación inicial, no lo que se
> construyó.

- `BandaEstado` (selector `app-banda-estado`, `kind: 'valid' | 'revoked' | 'not-verifiable' | 'error' | 'loading'`): única dueña de `aria-live`/`aria-atomic`; **recomendación inicial** era reusarlo para errores y carga del servicio de asistencia. **Implementación real**: NO se usa `BandaEstado`; los errores se renderizan con `<p role="alert">`, los banners demo con `role="status"`, la carga con párrafos nativos y el feedback de guardado con `<output aria-live="polite">`.
- `CampoDato` (directiva `[appCampoDato]` sobre `<dt>/<dd>`): **recomendación inicial** era reusarlo en la ficha de la fecha. **Implementación real**: NO se usa `appCampoDato`; la ficha de la fecha usa `<dl>/<dt>/<dd>` nativos sin directiva wrapper.
- `HeaderInstitucional` y `FolioShell`: no aplican al admin (F2-03 lo explicó; el admin tiene su propio shell con topbar y `role="banner"` propio). Sin cambios.

### Lección operativa de F2-04 (PR #35, crítico pre-PR)

F2-04 detectó un bug real de Angular component reuse: navegar entre `/admin/cursos/1/editar` y `/admin/cursos/2/editar` reusaba la instancia del `CourseEditorPage` y una resolución tardía de `obtener(1)` pisaba el estado del curso 2. La solución usa `effect()` que reacciona al cambio del `input('id')` + guard contra cargas obsoletas (token incremental o `loadGen` con cancelación lógica). El fix quedó en `course-editor-page.ts` con tests deterministas (incluido out-of-order async). **F2-05 debe aplicar el mismo patrón desde el inicio** en `attendance-marking-page` (los route params `cursoId` y `fechaId` se reusan al navegar entre fechas del mismo curso o entre cursos).

## Scope

### Incluido

- **Activar ítem `Asistencias` en `SidebarAdmin`**: `route: null` → `route: '/admin/asistencias'`, con SVG inline ya presente y `isActive()` por prefijo `startsWith('/admin/asistencias')`. Sin reordenar los otros 4 ítems; `Certificaciones` sigue como placeholder.
- **Rutas admin hijas en `app.routes.ts`**: 2-3 rutas nuevas dentro del bloque `admin` con `canActivate: [adminGuard]`, `COURSES_SOURCE` y nuevo `ATTENDANCE_SOURCE` provistos a nivel de ruta (mismo patrón que F2-04). Orden dentro de `children`:
  - `/admin/asistencias` → `AttendancesListPage` (selector de curso + fecha; entrada principal del ciclo).
  - `/admin/cursos/:id/fechas/:fechaId/asistencias` → `AttendanceMarkingPage` (marcado de presentes por fecha; entrada desde el detalle del curso y desde la lista de asistencias).
  - `pathMatch: 'prefix'` admin intacto.
- **Modelos TypeScript** tipados contra `admin-master-data-api` (`openspec/specs/admin-master-data-api/spec.md:69-95`) y `docs/backend/01-contrato-api-certificados.md:108-126`:
  - `AsistenciaAlumno` (mock-only DTO administrativo): `{ id, apellidoNombre, dniMostrar, estado: 'activo' | 'inactivo' }`. Sin DNI completo, sin email, sin matrícula, sin token. `dniMostrar` enmascarado (`"12****78"`).
  - `Asistencia` (fila activa): `{ id, alumnoId, cursoId, cursoFechaId, fecha: string, fechaEstado: EstadoFecha, registradoEn: string }`.
  - `AsistenciaMarcado` (entrada de marcado): `{ alumnoId, presente: boolean }`. **Presencia = fila activa**; ausencia = fila inexistente. Coherente con la spec `database-cursos-alumnos-asistencias/spec.md:46-58` y `admin-master-data-api/spec.md:69-95`.
  - `AsistenciasFiltros`: `{ cursoId?, fechaId?, q? }`.
- **Servicio mock tipado** (sin HTTP, storage ni claves):
  - `features/admin/attendances/attendance.service.ts` con interfaz `AttendanceService`: `listarAlumnos(cursoId): Promise<AsistenciaAlumno[]>`, `listarAsistencias(cursoId, fechaId): Promise<readonly Asistencia[]>`, `marcar(cursoId, fechaId, marcados: readonly AsistenciaMarcado[]): Promise<readonly Asistencia[]>`, `anular(asistenciaId): Promise<void>`. La "anulación" es soft en el modelo (borrado de la fila activa; el backend real usa `eliminado_en` y no se implementa en F2-05).
  - `ATTENDANCE_SOURCE` `InjectionToken<AttendanceService>` (mismo patrón que `COURSES_SOURCE` y `VALIDATION_SOURCE`).
  - `in-memory-attendance.service.ts`: seed de 12-15 alumnos ficticios por curso (apellido + nombre institucionalmente seguros: "Persona Demo 01..15" con `dniMostrar: "12****78"`, `dniMostrar: "23****45"`, etc.) y 0-4 asistencias activas precargadas por fecha. Mutaciones solo en memoria; banner "Datos de demostración: los cambios no se persisten al recargar" en cada pantalla. Sin `X-Admin-Key`, sin `localStorage`/`sessionStorage`, sin HTTP.
- **Componentes nuevos** bajo `apps/frontend-angular/src/app/features/admin/attendances/`:
  - `attendances-list-page.{ts,html,css,spec.ts}`: kicker + título "Asistencias", `<input type="search">` nativo para filtrar cursos, lista de cursos con conteo de fechas y total de presentes demo, cada tarjeta abre `/admin/cursos/:id/fechas/:fechaId/asistencias` seleccionable. Sin `appCampoDato` aquí; usa `<article>` con `<dl>` simple o lista nativa.
  - `attendance-marking-page.{ts,html,css,spec.ts}`: breadcrumb "← Asistencias", ficha de la fecha con `<dl>/<dt>/<dd>` nativos (curso, código, fecha, estado, descripción, orden), `<input type="search">` sobre apellido/nombre/dniMostrar, lista de alumnos con `<input type="checkbox">` por alumno (label asociado, `role="checkbox"` nativo), contador de marcados vs total, contador de cambios pendientes, botón "Guardar" deshabilitado si no hay cambios, botón "Descartar" que revierte al baseline, `<output aria-live="polite">` para feedback de guardado, `<p role="alert">` para errores y párrafos nativos para carga. **Aplica `effect()` para reaccionar al cambio de `cursoId`/`fechaId`** (lección F2-04 PR #35) + guard contra respuestas obsoletas.
- **Actualización de `CourseDetailPage`**: cada `<dt>` de fecha gana un link "Tomar asistencia" que navega a `/admin/cursos/:id/fechas/:fechaId/asistencias`. Reemplaza el placeholder "Próximamente: F2-05" que el handoff de F2-04 dejó implícito (el detalle del curso aún no mostraba placeholders de asistencias/certificaciones por línea 168 de `docs/frontend/00-angular20-port-v0.md`).
- **Actualización de `AdminDashboardPage`**: la tarjeta "Próximamente: Asistencias" pasa a `<a routerLink="/admin/asistencias">` con conteo ficticio derivado del servicio. "Certificaciones" sigue como placeholder deshabilitado.
- **Tests de seguridad y regresión** (mismo patrón que F2-04):
  - `__checks__/no-secrets.spec.ts` extendido a `src/app/features/admin/attendances/**`: 0 matches para `X-Admin-Key`, `localStorage`, `sessionStorage`, `document.cookie`, `HttpClient`, `fetch(`, `XMLHttpRequest`, `DNI`, `token`, `http://`, `https://`, `email`, `alumno.student`, `legajo`, `matricula`.
  - `__checks__/no-real-data.spec.ts`: seed sin emails, sin DNIs plausibles (8 dígitos sin enmascarar), sin matrículas tipo `STD-2024-NNN`, sin nombres propios plausibles. Cobertura: `dniMostrar` siempre con patrón `XX****XX` (2-3 dígitos, 4 asteriscos, 2-3 dígitos).
  - `app.routes.spec.ts`: 2-3 casos nuevos para `/admin/asistencias`, `/admin/asistencias` con `:cursoId`/`:fechaId` inválidos (muestra "no encontrado" sin reventar), orden de rutas (cursos/* no captura `/admin/asistencias`).
  - `attendance-marking-page.spec.ts`: tests deterministas de route reuse con `fakeAsync` + `tick()` cubriendo (a) `effect()` recarga al cambiar `cursoId`/`fechaId`, (b) carga obsoleta no pisa estado actual (mismo patrón que el fix de F2-04), (c) checkbox toggle actualiza `set` interno, (d) "Guardar" deshabilitado sin cambios, (e) "Descartar" revierte baseline.
  - `in-memory-attendance.service.spec.ts`: `listarAlumnos`, `listarAsistencias` (vacío, parcial, completo), `marcar` (alta, baja, duplicado activo controlado, error controlado en `anular` con id inexistente), reset por test (sin estado compartido).
- **Patch a `docs/frontend/00-angular20-port-v0.md`** en `sdd-archive`: agregar subsección "Estado F2-05 — Asistencias admin (mock)" con archivos creados, modificaciones, límites explícitos, evidencia de verificación, advertencia de tamaño de revisión y handoff a F2-06.
- **Crear / extender specs OpenSpec**:
  - Nueva spec `admin-attendances-frontend` con 4 requirements: `Rutas protegidas de asistencias`, `UI contract-ready de asistencia por fecha`, `Frontera segura sin datos reales ni red`, `Documentación y handoff a F2-06`.
  - Modificar `admin-foundation` con 2-3 requirements `MODIFIED` (analogía F2-04): `Rutas administrativas aisladas` agrega `/admin/asistencias*`, `Sidebar accesible con Asistencias activo`, `Dashboard con handoff F2-05`.

### Excluido (no tocar)

- **Auth real, `X-Admin-Key`, login real**: prohibido en Angular. Misma regla que F2-03/F2-04. Sesión mock sigue activa; se consume vía `MOCK_SESSION`/`adminGuard` sin modificarla. Sustitución real por `HttpAttendanceService` queda para un ciclo con sesión segura aprobada (PHP HttpOnly o equivalente).
- **Datos reales o sensibles**: seed sin DNI completo, sin email, sin token, sin matrículas, sin nombres propios plausibles. `dniMostrar` enmascarado es el único dato de documento permitido en admin (per `docs/backend/01-contrato-api-certificados.md:122`). Aplica regla D0: el admin **no muestra DNI completo fuera de la validación pública** (decisión D0), no expone token completo, no expone claves, IV, tag, ciphertext ni SQL.
- **Backend / base / deploy / `.htaccess`**: NO tocar `apps/backend-php/`, `database/`, `deploy/`, `docker/`, `material_privado_no_versionar/`, `.env*`, dumps, logs, secretos. El backend admin con `X-Admin-Key` ya está implementado por Marcos; F2-05 es solo shell Angular.
- **Certificaciones (F2-06)**: F2-05 entrega solo la UI de marcado de asistencia; el botón "Emitir certificación" en la página de fecha es placeholder ("Próximamente: F2-06") o no se renderiza. Esto mantiene el ciclo en presupuesto y deja los modelos `Asistencia` y `AsistenciaAlumno` listos para F2-06.
- **Configuración institucional, firmantes PDF, revocación, entrega manual, revisión de auditoría, carga masiva, listado/detalle de alumnos, listado de certificaciones, expediente de certificación, vista previa PDF, nueva certificación**: todos fuera de F2-05; pertenecen a F2-06 y F4-F6 según la guía unificada.
- **Persistencia real**: nada de `localStorage`, `sessionStorage`, IndexedDB, cookies propias, archivos en `assets/`, ni envíos al backend. El servicio mock es solo en memoria.
- **Tailwind, shadcn, CVA, lucide, fuentes web, `cn()`, `class-variance-authority`, `tailwind-merge`**: NO instalar. F1-02 dejó tokens en CSS custom properties y SVG inline; F1-04 (otra rama) define Tailwind. F2-05 hereda esa decisión y reusa los mismos tokens que F2-04.
- **`muestra_pagina/components/admin/asistencias-editor.tsx`** (589 líneas): **no** se copia el código. F2-05 se inspira solo en los **campos** que aparecen (`alumno.id`, `alumno.legajo`, `alumno.apellido`, `alumno.nombre`, `alumno.dni`, `alumno.email` → en F2-05 se reemplazan por `id`, `apellidoNombre`, `dniMostrar` sin legajo/email/curso; `fecha.id`, `fecha.etiqueta`, `fecha.certificada`, `fecha.presentesGuardados` → en F2-05 se reemplaza por `id`, `descripcion`, `estado`, `asistencias` con flag `presente`) y en la **estructura de marcado** (selector de fecha, búsqueda, checklist por alumno, contador de cambios, baseline revert). **No** se portan: fechas `certificadas` con flag de re-emisión (F2-06), drag-and-drop, paginación, dialog, modal, multi-select. El copy de los labels y los mensajes de error se redactan en español argentino formal, no se traducen literalmente.
- **`muestra_pagina/app/admin/cursos/[id]/asistencias/page.tsx`** (17 líneas, entrada): solo se inspecciona su existencia y patrón de ruta para alinearla con `/admin/cursos/:id/fechas/:fechaId/asistencias` (más profundo y específico por fecha).
- **`muestra_pagina/capturas/`**, `prompts_stitch_v0_ifts14.md`, `pnpm-lock.yaml`: no abrir.
- **Rutas públicas existentes** (`''`, `validar/:tokenCertificacion`, `**`): intactas. Los tests de `app.routes.spec.ts` post-F2-04 (239 tests) deben seguir pasando.
- **Shared certificates** (`shared/certificates/*`): intacto. F2-05 no introduce DTOs públicos.
- **Shared UI** (`shared/ui/*`): reusables sin tocar. F2-05 reusa tokens F1-02 por CSS, pero no consume `BandaEstado` ni `appCampoDato` en runtime.
- **Rama de Marcos o de otros**: no tocar `frontend/api-readiness`, `frontend/public-validation-flow`, `frontend/v0-design-system`, `integration/*`, ni `main`. La rama `frontend/admin-attendance` es solo de Matías.
- **`MATIAS_PROMPTS_SDD_3_SEMANAS_CICLOS_GIT.md` o `MARCOS_PROMPTS_SDD_3_SEMANAS_CICLOS_GIT.md`**: no se modifican. El índice F0-F6 de Matías actualiza el estado de F2-05 a ✅ en el cierre.

## Rutas y navegación (mínimas)

```txt
/admin/asistencias                                          (AttendancesListPage)
/admin/cursos/:id/fechas/:fechaId/asistencias               (AttendanceMarkingPage)
```

Ruta primaria de entrada: `Asistencias` en el sidebar.
Ruta secundaria de entrada: botón "Tomar asistencia" en cada `<dt>` de fecha del `CourseDetailPage`.

Esta decisión evita inflar la nav con 5+ rutas (`:id/asistencias` general, `:id/fechas/:fechaId/asistencias` específico, etc.) y alinea con el patrón v0 (`app/admin/cursos/[id]/asistencias/page.tsx`) extendido por fecha.

## Áreas afectadas

| Archivo | Acción | Descripción |
|---|---|---|
| `apps/frontend-angular/src/app/app.routes.ts` | Modificar | Hijas `asistencias` y `cursos/:id/fechas/:fechaId/asistencias`; orden importa: `:id/fechas/:fechaId/asistencias` antes que `:id/editar` no aplica (no colisionan); nuevo `ATTENDANCE_SOURCE` provider a nivel de ruta admin (mismo patrón que `COURSES_SOURCE`). |
| `apps/frontend-angular/src/app/app.routes.spec.ts` | Modificar | 2-3 casos para `/admin/asistencias` y `/admin/cursos/1/fechas/2/asistencias`; sin sesión → `/admin/login`; id inválido → "no encontrado" sin reventar. |
| `apps/frontend-angular/src/app/features/admin/sidebar-admin.{ts,html,spec.ts}` | Modificar | `Asistencias` con `route: '/admin/asistencias'`; `isActive()` por prefijo `startsWith('/admin/asistencias')`. `Certificaciones` sigue placeholder. |
| `apps/frontend-angular/src/app/features/admin/admin-dashboard-page.{ts,html,spec.ts}` | Modificar | Tarjeta "Asistencias" como `<a routerLink="/admin/asistencias">` con conteo ficticio. |
| `apps/frontend-angular/src/app/features/admin/courses/course-detail-page.{ts,html,spec.ts}` | Modificar | Cada `<dt>` de fecha gana un link "Tomar asistencia" que navega a la ruta específica. |
| `apps/frontend-angular/src/app/features/admin/attendances/*` | Crear | `attendance.models.ts`, `attendance.service.ts`, `in-memory-attendance.service.ts`, `attendances-list-page.{ts,html,css,spec.ts}`, `attendance-marking-page.{ts,html,css,spec.ts}`, `__checks__/no-secrets.spec.ts`, `__checks__/no-real-data.spec.ts`. |
| `docs/frontend/00-angular20-port-v0.md` | Modificar en archive | Estado F2-05, exclusiones y handoff F2-06. |
| `openspec/changes/f2-05-admin-attendance/*` | Crear | `exploration.md` (este), `proposal.md`, `design.md`, `specs/admin-attendances-frontend/spec.md`, `specs/admin-foundation/spec.md` (delta), `tasks.md`, `verify-report.md`, `archive-report.md`. |
| `openspec/specs/admin-attendances-frontend/spec.md` | Crear en archive | Spec nueva con 4 requirements. |
| `openspec/specs/admin-foundation/spec.md` | Modificado en archive | 2-3 requirements `MODIFIED`. |

## Reuse from F2-04 (mínimo cambio)

- **`COURSES_SOURCE`** se mantiene; `InMemoryCoursesService.listarFechas(cursoId)` se reutiliza para resolver fechas en la página de marcado. No se duplica lógica.
- **Estados y ficha de fecha**: la recomendación inicial era usar `BandaEstado`/`appCampoDato`, pero la implementación real usa HTML semántico nativo (`<dl>/<dt>/<dd>`, `<p role="alert">`, banners demo con `role="status"`, `<output aria-live="polite">`) y tokens F1-02 vía CSS.
- **`__checks__/no-secrets.spec.ts` y `__checks__/no-real-data.spec.ts`** se duplican como patrón en `attendances/`; se ajustan los `forbidden` y los regex para cubrir los modelos nuevos (`legajo`, `matricula`, `email`, `student`, `DNI` sin enmascarar, `dni_` sin `Mostrar`).
- **Foco global `:focus-visible` + `--focus-ring`**, `prefers-reduced-motion`, tokens de color/tipografía/espaciado: todo del F1-02 + F2-04, sin cambios. Las regiones live de F2-05 son nativas y no anidadas.

## Backend contract alignment

De `openspec/specs/admin-master-data-api/spec.md:69-95` y `docs/backend/01-contrato-api-certificados.md:108-126`:

```ts
// F2-05 modela el contrato backend sin generar deuda:
Asistencia        = { id, alumnoId, cursoId, cursoFechaId, fecha, fechaEstado, registradoEn }
AsistenciaAlumno  = { id, apellidoNombre, dniMostrar, estado } // sin email, sin legajo, sin matrícula
EstadoFecha       = 'programada' | 'realizada' | 'cancelada'    // F2-04 ya lo define
```

Reglas operativas que el servicio mock respeta:

- **Presencia = fila activa** (no booleano ausente/presente). Ausencia = fila inexistente. Coherente con `database-cursos-alumnos-asistencias/spec.md:46-58`.
- **Asistencia válida** requiere alumno `activo` y fecha `programada` o `realizada` (F2-05 mock: filtra en `listarAlumnos` excluyendo fechas `cancelada` y alumnos `inactivo`).
- **Filtros `cursoId`/`alumnoId`**: enteros positivos; id inválido → error controlado (no expandir el listado). F2-05 mock: el servicio rechaza id `<=0` o `NaN` con `Error("Id inválido")`.
- **Duplicado activo**: `409 CONFLICT`; en el mock, `marcar` rechaza alta duplicada con `Error("Asistencia duplicada")`.
- **Anulación** = soft (`eliminado_en` en backend; en F2-05 mock: splice de la fila). Sin `DELETE` físico.
- **Privacidad**: `dniMostrar` enmascarado es el único dato de documento permitido en admin; nunca `DNI` plano, nunca `dni_cifrado`, nunca `dni_hash`, nunca token completo, nunca SQL ni secretos en logs/errores.

## Privacy guardrails (específicos F2-05)

- **Mock students**: 12-15 por curso con `apellidoNombre: "Persona Demo 01"` (cero nombres propios plausibles), `dniMostrar: "12****78"` (patrón fijo `XX****XX` con checksum ficticio, 2-3 dígitos + 4 asteriscos + 2-3 dígitos). Cero emails, cero legajo, cero matrícula.
- **Mock teachers/cursos** siguen el patrón F2-04: nombres genéricos del dominio IFTS (sin oferta académica vigente), códigos `CUR-NNN`.
- **Logs**: cero. No hay `console.*` en runtime; errores se muestran con `<p role="alert">` y mensaje del `Error.message` del servicio mock (que tampoco incluye datos sensibles).
- **Bundle**: cero literales de `X-Admin-Key`, `dni_cipher_key`, `token_encryption_key`, `localStorage`, `sessionStorage`, `fetch(`, `HttpClient`. Tests `__checks__/no-secrets.spec.ts` lo verifican.
- **UI pública intacta**: DNI completo sigue mostrándose SOLO en `validar/:tokenCertificacion` (D0). El admin nunca ve DNI completo.

## Approaches considered

| Approach | Pros | Cons | Effort |
|---|---|---|---|
| **A. Una sola ruta `/admin/cursos/:id/fechas/:fechaId/asistencias` con entrada desde el detalle del curso** | Alineada con v0 (`app/admin/cursos/[id]/asistencias/page.tsx`); una sola página; reuso natural de `CursoFecha`. | Sidebar `Asistencias` no tiene entrada propia; requiere paso previo por el detalle. | Low |
| **B. Una sola ruta `/admin/asistencias` con wizard de curso + fecha inline** | Sidebar activo; flujo guiado; mínimo cambio de rutas. | Sin deep-link directo desde el detalle del curso; wizard más complejo. | Low-Med |
| **C. Recomendada: 2 rutas — `/admin/asistencias` (lista) + `/admin/cursos/:id/fechas/:fechaId/asistencias` (marcado)** | Sidebar `Asistencias` activo; deep-link desde el detalle; ambas entradas coexisten; F2-06 puede reusar la ruta de marcado. | 1 ruta extra; 1 componente lista liviano. | Low-Med |
| **D. 3+ rutas (`:id/asistencias`, `:id/fechas/:fechaId/asistencias`, `:id/fechas/nueva`, etc.)** | Cobertura completa de la matriz. | Sobrescope; tamaño > 1500 probable. | Med-High |

## Recommendation

**Approach C**: 2 rutas, una entrada principal desde `Asistencias` (sidebar) y una entrada específica por fecha desde el detalle del curso. Lista de cursos con búsqueda + tarjeta por curso que abre la primera fecha activa (o selector de fecha inline si hay varias). Página de marcado específica por `(cursoId, fechaId)` con `effect()` para route reuse (lección F2-04), checklist de alumnos con `<input type="checkbox">`, contador de cambios, guardar/descartar, búsqueda sobre `apellidoNombre`/`dniMostrar`.

Razones:

1. **Respeta el budget 1500**: lista liviana + página de marcado = ~800-1200 líneas estimadas (vs 1500-2000 de F2-04 sin lista propia). F2-04 ya reutilizó `COURSES_SOURCE`; F2-05 hereda el patrón de servicios mock y tokens CSS, no los primitivos `BandaEstado`/`appCampoDato`.
2. **Mantiene el spec del prompt 9** (`muestra_pagina/app/admin/cursos/[id]/asistencias/page.tsx`) con extensión específica por fecha.
3. **Sidebar `Asistencias` activo** cumple el handoff F2-04 sin requerir paso previo por Cursos.
4. **`effect()` desde el inicio** evita repetir el ciclo de review crítico de PR #35 (route reuse bug en `CourseEditorPage`).
5. **No introduce nuevos modelos backend** (reusa `CursoFecha`/`Curso`/`EstadoFecha` de F2-04; agrega solo `Asistencia` + `AsistenciaAlumno` + `AsistenciaMarcado`).
6. **Reversible**: rollback = quitar `features/admin/attendances/`, devolver `Asistencias` a placeholder en sidebar y dashboard, quitar las 2 rutas y restaurar `CourseDetailPage` sin el link.

### Estructura de archivos propuesta

```txt
apps/frontend-angular/src/app/features/admin/attendances/
├── attendance.models.ts                  (~70 líneas)
├── attendance.service.ts                 (~50 líneas, interfaz + ATTENDANCE_SOURCE)
├── in-memory-attendance.service.ts       (~150 líneas, seed + operaciones)
├── in-memory-attendance.service.spec.ts  (~180 líneas, tests de servicio)
├── attendances-list-page.ts/html/css/spec.ts  (~250 líneas total)
├── attendance-marking-page.ts/html/css/spec.ts  (~350 líneas total, con effect() + tests)
└── __checks__/
    ├── no-secrets.spec.ts                (~50 líneas)
    └── no-real-data.spec.ts              (~70 líneas)
```

Estimación total: ~1170 líneas (incluido tests), ~750-900 de código. **Margen 600-750 contra budget 1500**. Si `sdd-tasks` detecta crecimiento (por ejemplo, tests exhaustivos de route reuse), se puede preacordar un split o pedir `size:exception` desde el inicio.

## Test plan (resumen)

| Capa | Qué probar | Enfoque |
|---|---|---|
| Unit servicio | `listarAlumnos` filtra inactivos, `listarAsistencias` filtra eliminadas, `marcar` rechaza duplicado activo, `anular` con id inexistente lanza error controlado, `marcar` con id inválido lanza error. | Karma/Jasmine con `TestBed.configureTestingModule` + `ATTENDANCE_SOURCE` provider; reset por test. |
| Unit componentes | Render básico, foco visible, `role="checkbox"` por alumno, `aria-live` para cambios, navegación por teclado (Space toggle, Enter submit), `effect()` recarga al cambiar inputs, stale-load no pisa estado actual. | Karma/Jasmine + `ComponentFixture`; `fakeAsync` + `tick()` para `effect()`. |
| Routing | `/admin/asistencias` carga `AttendancesListPage`; `/admin/cursos/1/fechas/2/asistencias` carga `AttendanceMarkingPage`; sin sesión mock → `/admin/login`; id inválido → "no encontrado" sin reventar. | `app.routes.spec.ts` con `RouterTestingHarness` + `withComponentInputBinding()`. |
| Seguridad/CI | 0 matches para `X-Admin-Key`, `localStorage`, `sessionStorage`, `HttpClient`, `fetch(`, `XMLHttpRequest`, `DNI` plano, `token`, `legajo`, `matricula`, `email`, `http://`, `https://` en `src/app/features/admin/attendances/**`. | `__checks__/no-secrets.spec.ts` (toString) + script Python sobre dist. |
| Datos | Seed sin emails, sin DNIs plausibles (8+ dígitos sin enmascarar), sin matrículas `STD-2024-NNN`, sin nombres propios plausibles; `dniMostrar` siempre con patrón `XX****XX`. | `__checks__/no-real-data.spec.ts` sobre `InMemoryAttendanceService`. |
| Build | `npm run test:ci` verde; `npm run build` verde dentro de presupuestos; 0 warnings de Angular CLI. | `sdd-apply` ejecuta y captura resultados. |

## Build & size forecast

| Métrica | Estimación |
|---|---|
| Líneas nuevas (código) | ~700-800 |
| Líneas nuevas (tests) | ~400-450 |
| Líneas modificadas (rutas, sidebar, dashboard, course-detail, app.routes.spec) | ~80-120 |
| **Total estimado** | **~1180-1370** |
| Budget | 1500 |
| Margen | 130-320 |
| 400-line risk (por archivo) | **Low** (ningún archivo individual > 400) |
| 1500-line risk (PR) | **Low-Medium** (margen 130-320; dividir si pasa) |
| PR strategy | `single-pr-default`; preacordar split si `sdd-tasks` detecta >1500 |
| `Decision needed before apply` | **No** (1-2 decisiones en `sdd-propose` para confirmar: lista de cursos en `AttendancesListPage` con entrada a "primera fecha activa" vs selector de fecha inline) |
| `Chained PRs recommended` | **No** por defecto; **Yes** si `sdd-tasks` forecast >1500 |

## Riesgos

| Riesgo | Probabilidad | Mitigación |
|---|---|---|
| Repetir bug de route reuse de F2-04 PR #35 en `AttendanceMarkingPage` | Medium | Aplicar `effect()` + `loadGen` guard desde el inicio; tests deterministas de out-of-order async desde `sdd-design`. |
| Exceder 1500 líneas con tests exhaustivos | Low-Medium | Forecast 1180-1370; margen 130-320. Si `sdd-tasks` proyecta >1500, dividir en PR #1 (modelos + servicio + sidebar + dashboard + tests de servicio + check) y PR #2 (lista + marcado + tests de componentes). |
| Filtrar DNI completo o email en mocks de alumnos | Low | `__checks__/no-real-data.spec.ts` con regex de `dniMostrar` patrón `XX****XX` y asserts de no-nombres-propios. |
| Implementar `HttpAttendanceService` con `X-Admin-Key` desde el browser | Low (regla clara) | Tests de seguridad (`__checks__/no-secrets.spec.ts` + script Python sobre dist). Subtítulos y banner visible aclaran que es mock. |
| Auto-commit / auto-push | Low (regla clara) | `AGENTS.md:25`, `MATIAS_PROMPTS_SDD_3_SEMANAS_CICLOS_GIT.md:969` y la sección de Git en la guía exigen aprobación explícita de Matías en el mismo turno + diff-confirmation gate + pre-push safety. |
| Romper accesibilidad | Low | `<input type="checkbox">` con `<label>` asociado y `role="checkbox"` nativo; `<output aria-live="polite">` para contador de cambios (no en contenedor con `BandaEstado` para evitar anidar `aria-live`); `<fieldset>/<legend>` sr-only para grupos; foco al primer cambio inválido; `prefers-reduced-motion` respetado. |
| `course-detail-page.html` cambia con la adición de links de asistencia | Low | El handoff F2-04 ya dejó explícito que el detalle aún no mostraba placeholders de F2-05; el patch es mínimo (1 `<a>` por `<dt>` de fecha) y no toca CSS ni rutas. |
| Romper shell F2-03/F2-04 | Low | Sidebar cambia 1 línea (`route` y `isActive()`); admin-shell y admin-dashboard no tocan CSS ni landmarks. |
| Costo de OpenCode al portar v0 (editor 589 líneas) | Low | Lectura parcial con `Read` primeras 100 líneas o `Grep` por nombre; sin abrir el archivo completo. Sin instalar CodeGraph (decisión de Marcos). |
| `Engram` `mem_save` falla por schema antiguo | Low | Si el schema rechaza `capture_prompt`, omitir el campo. Documentado en `sdd-phase-common.md:55`. |
| `proxy.conf.json` o `environment.ts` se modifican accidentalmente | Low | No tocar `apps/frontend-angular/src/environments/**` ni `proxy.conf.json` (F2-05 no agrega HTTP). Documentar en `sdd-archive` que siguen intactos. |

## Specs a crear / modificar

### `openspec/specs/admin-attendances-frontend/spec.md` (nueva, 4 requirements)

- `Rutas protegidas de asistencias`: `/admin/asistencias` y `/admin/cursos/:id/fechas/:fechaId/asistencias` protegidas por sesión mock.
- `UI contract-ready de asistencia por fecha`: lista navegable, marcado con checklist, contador de cambios, guardar/descartar, banner demo, estados de error/carga.
- `Frontera segura sin datos reales ni red`: sin `X-Admin-Key`, storage, HTTP, DNI completo, emails, matrículas, tokens. `dniMostrar` enmascarado como único dato de documento.
- `Documentación y handoff a F2-06`: cierre F2-05 documentado; emisión de certificación desde la página de asistencia queda como placeholder.

### `openspec/specs/admin-foundation/spec.md` (modificada, 2-3 requirements `MODIFIED`)

- `Rutas administrativas aisladas`: agrega `/admin/asistencias*` al alcance.
- `Shell accesible, responsive y alineado a F1-02`: estado activo comprensible para `/admin/asistencias*` en sidebar.
- `Documentación y límites de handoff`: cierre F2-05 y handoff F2-06.

## Review Workload Forecast

| Campo | Valor |
|---|---|
| Líneas estimadas modificadas/agregadas | ~1180-1370 |
| Riesgo de exceder el presupuesto de 1500 líneas | **Low-Medium** (margen 130-320) |
| PRs encadenados recomendados | **Conditional** (si forecast final > 1500 → dividir) |
| Estrategia de entrega | single-pr sobre `frontend/admin-attendance`; fallback chained |
| Decisión antes de apply | **Sí** (1-2 decisiones en `sdd-propose`; ver arriba) |
| Tiempo estimado de revisión | Medio: 1 PR con 2 features nuevos + 1 modelo + 1 servicio + 2-3 rutas + 4 patches; tests verde; sin deploy, sin build prod nuevo, sin backend. |
| `Decision needed before apply` | **Yes** (1-2 decisiones listadas) |
| `Chained PRs recommended` | **Conditional** (depende del forecast final de `sdd-tasks`) |
| `400-line budget risk` | **Low** (ningún archivo individual > 400) |
| `1500-line budget risk` | **Low-Medium** (forecast 1180-1370; margen 130-320) |

## Relevant files (read in this exploration)

- `AGENTS.md` (133 líneas) — reglas operativas, política Git, X-Admin-Key, DNI completo, rama sugerida.
- `apps/frontend-angular/AGENTS.md` (18 líneas) — reglas del frontend Angular.
- `docs/00-indice-general.md` (52 líneas) — ruta de lectura mínima vigente.
- `docs/opencode/optimizacion-tokens.md` (105 líneas) — uso de `RTK`, perfil eficiente, Graphify solo para Marcos.
- `MATIAS_PROMPTS_SDD_3_SEMANAS_CICLOS_GIT.md` (líneas 948-993: ciclo F2-05; índice F0-F6 líneas 11-46; división operativa frontend líneas 48-54) — definición exacta del ciclo, su rama, su índice de gobernanza.
- `docs/frontend/00-angular20-port-v0.md` (262 líneas) — fuente de verdad del port, división de responsabilidades Marcos/Matías, inventario prompts 4-22, tokens visuales observados, estado F1-02/F2-03/F2-04/M3-06.
- `docs/frontend/02-sistema-visual-v0-f1-02.md` (118 líneas) — tokens F1-02, primitivos disponibles, reglas de uso.
- `apps/frontend-angular/src/app/app.routes.ts` (100 líneas) — rutas vigentes post F2-04.
- `apps/frontend-angular/src/app/features/admin/courses/courses.{models,service,in-memory-courses.service}.ts` — base reusada de F2-04.
- `apps/frontend-angular/src/app/features/admin/courses/course-detail-page.{ts,html}` — a extender con link "Tomar asistencia" por fecha.
- `apps/frontend-angular/src/app/features/admin/{sidebar-admin,admin-dashboard-page}.{ts,html}` — a extender con `Asistencias` activo.
- `apps/frontend-angular/src/app/features/admin/courses/course-editor-page.ts` — patrón `effect()` anti-route-reuse a replicar.
- `apps/frontend-angular/src/app/features/admin/courses/__checks__/{no-secrets,no-real-data}.spec.ts` — patrón de tests de seguridad y datos a duplicar.
- `openspec/specs/admin-foundation/spec.md` (98 líneas) — handoff explícito a F2-04..F2-06 (líneas 80-97), regla de no auth real (líneas 44-60).
- `openspec/specs/admin-courses-frontend/spec.md` (69 líneas) — spec de F2-04 archivada; base de paralelismo para F2-05.
- `openspec/specs/admin-master-data-api/spec.md` (111 líneas) — contrato backend: cursos, fechas, **asistencias (líneas 69-95)**, errores, privacidad.
- `openspec/specs/database-cursos-alumnos-asistencias/spec.md` (78 líneas) — modelo MariaDB; regla "presencia = fila activa" (líneas 44-58).
- `docs/backend/01-contrato-api-certificados.md` (693 líneas, extractos relevantes) — DTOs admin de asistencia (líneas 108-126), privacidad (líneas 530-534), endpoint `/admin/asistencias` (líneas 38-40, 124-125).
- `openspec/changes/archive/2026-07-07-f2-04-admin-courses-dates/{exploration,design,tasks,verify-report,archive-report}.md` — precedente estructural completo de F2-04 (tamaño 53K exploration; forecast 1100-1450 terminó en ~3800 con `size:exception` aprobada por Matías).
- `muestra_pagina/components/admin/asistencias-editor.tsx` (589 líneas, lectura segura, primeras 100 líneas) — patrón estructural de marcado; **no portable**, solo inspiración de campos.
- `muestra_pagina/app/admin/cursos/[id]/asistencias/page.tsx` (17 líneas, entrada) — patrón de ruta específica por curso.
- Engram: 6 observaciones recientes de F2-04 PR #35 (route reuse fix + size exception + reviews R1/R2/R3/R4); sin observaciones específicas de F2-05. Contexto: PR #35 mergeado; `main` actualizado; rama `frontend/admin-attendance` limpia.

## Ready for proposal

**Yes** — abrir `sdd-propose` para:

1. Crear `proposal.md` con scope (in/out), áreas afectadas, riesgos, plan de reversión y criterios de éxito alineados con este exploration.
2. Producir 1-2 decisiones para confirmación de Matías:
   - **D1**: ¿`AttendancesListPage` muestra lista de cursos con entrada directa a la primera fecha activa del curso, o selector de fecha inline? (Recomendado: entrada directa a la primera fecha activa + breadcrumb "Cambiar fecha" en `AttendanceMarkingPage`).
   - **D2**: ¿`AttendanceMarkingPage` muestra la fecha como `<dl>` nativo o como `<header>` simple? (Recomendado final implementado: `<dl>/<dt>/<dd>` nativo, sin `appCampoDato`, para mantener semántica directa y menor diff).
3. Mantener `single-pr-default` con `size:exception` preacordada si forecast final > 1500 (lección F2-04 PR #35).
