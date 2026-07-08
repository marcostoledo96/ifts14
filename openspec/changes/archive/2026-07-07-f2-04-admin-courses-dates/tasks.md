# Tasks: F2-04 — Cursos y fechas admin

## Review Workload Forecast

Estimated changed lines: 1100–1450 (per `design.md`). Budget: 1500. Forecast dentro pero cerca del techo; `design.md` ya define split defensivo si supera 1500. PR único sobre `frontend/admin-courses-dates` (rutas, shell, sidebar, dashboard, list/detail/editor, service, tests, docs, verify, archive).

Decision needed before apply: No
Chained PRs recommended: No
Chain strategy: pending
400-line budget risk: Medium

### Maintainer decision (pre-PR, 2026-07-07)

Diff/review surface final excedió el presupuesto (~3452 estimadas vs 1500; medición real posterior ~3800). Pre-PR reviews no encontraron blockers CRITICAL tras corregir persistencia de quitas de fechas. Maintainer (Matías) aprobó explícitamente **`size:exception`** ("Aceptar excepción") antes de la preparación del PR. No se aplica split. La evidencia de archive OpenSpec (este archivo, `verify-report.md`, `archive-report.md`) permanece en el mismo PR salvo cambio posterior del maintainer.

## Phase 1: Foundation

- [x] 1.1 Crear `apps/frontend-angular/src/app/features/admin/courses/courses.models.ts` con `EstadoCurso` (`borrador|activo|cerrado|archivado`), `EstadoFecha`, `Curso`, `CursoFecha`, `CursoDetalle`, `CursoDraft`, `CursoFechaDraft`, `CursosFiltros`.
- [x] 1.2 Crear `courses.service.ts` con `CoursesService` (`listar`, `obtener`, `crear`, `actualizarEstado`, `listarFechas`, `guardarFecha`) y `COURSES_SOURCE`.
- [x] 1.3 Crear `in-memory-courses.service.ts` con seed ficticio de 6 cursos, 1–3 fechas por curso; sin DNI, email, token, matrícula ni nombres reales; mutaciones solo en instancia.
- [x] 1.4 Crear `courses.service.spec.ts`: filtros, validación local, mutaciones y reset por test (sin HTTP/storage/cookies).

## Phase 2: Routing y shell

- [x] 2.1 Reescribir `app.routes.ts`: `path: 'admin', canActivate: [adminGuard], loadComponent: AdminShell, children: [...]` con orden `dashboard` → `cursos/nuevo` → `cursos/:id/editar` → `cursos/:id` → `cursos`; mantener catch-all admin antes de `**`.
- [x] 2.2 En `app.routes.spec.ts` tests de orden: `/admin/cursos/nuevo` NO cae en `:id`; `/admin/cursos/123/editar` NO cae en `:id` ni en `nuevo`; sin sesión terminan en `/admin/login`.
- [x] 2.3 Modificar `admin-shell.html` y `admin-shell.ts`: reemplazar `<app-admin-dashboard-page />` por `<router-outlet />`; mantener sidebar, banner, footer, drawer, skip-link.
- [x] 2.4 Extender `admin-shell.spec.ts`: shell expone `<router-outlet>` y deja de renderizar el dashboard inline.
- [x] 2.5 Modificar `sidebar-admin.ts` y `.html`: `Cursos` con `route: '/admin/cursos'`; `isActive()` por prefijo para Cursos, igualdad para Inicio.
- [x] 2.6 Extender `sidebar-admin.spec.ts`: Cursos navega a `/admin/cursos`; activo en `/admin/cursos*`; Inicio solo en `/admin/dashboard`.
- [x] 2.7 Modificar `admin-dashboard-page.html` y `.ts`: tarjeta Cursos como `<a routerLink="/admin/cursos">` con conteo ficticio; resto deshabilitado.

## Phase 3: UI de cursos

- [x] 3.1 Crear `courses-list-page.ts/html/css/spec.ts` con `<input type="search">`, filtro por estado, `<section>` + `<article>`, banner "Datos de demostración" y enlaces a nuevo/detalle.
- [x] 3.2 Crear `course-detail-page.ts/html/css/spec.ts` con nombre, código, estado (`BandaEstado`), `<dl>` de fechas y enlaces a `editar` y al listado.
- [x] 3.3 Crear `course-editor-page.ts/html/css/spec.ts` con `data.mode` (`create`/`edit`), `fieldset/legend` por fechas, `<input type="date">` y validación local; al guardar invoca `CoursesService.crear`/`guardarFecha`.
- [x] 3.4 Reusar o crear `BandaEstado` como única región `aria-live`; foco visible global, sin Tailwind.

## Phase 4: Tests de seguridad y regresión

- [x] 4.1 Crear `__checks__/no-secrets.spec.ts` que falle si aparece `X-Admin-Key`, `localStorage`, `sessionStorage`, `document.cookie`, `HttpClient`, `fetch(`, `XMLHttpRequest`, `DNI`, `token`, `http://` o `https://` en `src/app/features/admin/courses/**`.
- [x] 4.2 Crear `__checks__/no-real-data.spec.ts`: seed sin emails, DNI, tokens, nombres o matrículas plausibles.
- [x] 4.3 Extender `app.routes.spec.ts` con carga real de `CoursesListPage`, `CourseDetailPage` y `CourseEditorPage` con sesión mock; rutas públicas intactas.
- [x] 4.4 Gate correctivo: proveer `COURSES_SOURCE` en runtime (`app.routes.ts` route provider de la ruta admin con `InMemoryCoursesService`). Sin este provider, `/admin/cursos*` revienta con `NullInjectorError` en runtime (los specs de componentes lo proveen a mano y enmascaran el bug). Tests de integración via `RouterTestingHarness` que instancian el componente enrutado a través del route injector real + test de regresión que verifica que sacarlo rompe runtime.

## Phase 5: Verificación y cierre

- [x] 5.1 `sdd-apply` corre `npm run test:ci` y `npm run build` y captura resultados reales.
- [x] 5.1.1 CORRECTIVO: route param `:id` se liga como string vía `withComponentInputBinding()`. `CourseDetailPage`/`CourseEditorPage` declaran `id = input<string>('')` y computan el id numérico con `courseId()`/`idNumber()` (validan vacío/NaN/<=0 → null → error controlado, sin excepción). `AdminShell` expone `rutaActual` (signal desde `router.events`/`NavigationEnd`) y la pasa como `[active]` a `SidebarAdmin` en desktop y drawer. Tests: `app.routes.spec.ts` con `RouterTestingHarness` + `withComponentInputBinding()` cubre `/admin/cursos/1` (renderiza seed), `/admin/cursos/1/editar` (carga form), `/admin/cursos/abc` (id inválido, no revienta); `admin-shell.spec.ts` cubre bind de ruta activa. Specs de componentes ajustados a `setInput('id', String(n))`. `npm run test:ci` = 239/239 SUCCESS, `npm run build` OK.
- [x] 5.2 `sdd-verify` genera `verify-report.md` con archivos tocados, comandos, escenarios cubiertos y NO cubiertos, y riesgos abiertos.
- [x] 5.3 `sdd-archive` actualiza `docs/frontend/00-angular20-port-v0.md` con estado F2-04, exclusiones y handoff F2-05/F2-06.
- [x] 5.4 `sdd-archive` mueve la carpeta a `openspec/changes/archive/2026-07-07-f2-04-admin-courses-dates/` y mergea deltas en `openspec/specs/admin-courses-frontend/spec.md` y `admin-foundation/spec.md`.
