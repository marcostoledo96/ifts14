# Frontend Angular 20 — port desde `muestra_pagina/`

Este documento es la fuente de verdad para portar a Angular 20 la referencia visual v0 del módulo `/certificados/`.

## Estado de referencia

`muestra_pagina/` contiene la referencia visual v0 final y completa generada en Next.js/React, con código fuente exportado y capturas para todos los flujos 4-22. Se usa solo como referencia visual y funcional: no se copian componentes, rutas, hooks ni estilos literalmente. El `muestra_pagina/MANIFIESTO_V0.md` histórico fue retirado al reemplazar la carpeta por el export final; el inventario de referencia se completa contra el listado seguro de la carpeta.

| Estado | Cantidad | Uso |
|---|---:|---|
| Pantallas con referencia v0 | 19 | Base visual para flujos 4-22. |
| Pantallas pendientes | 0 | — |

Los flujos 11-22 se ejecutan con los ciclos F4-F6 definidos en `MATIAS_PROMPTS_SDD_3_SEMANAS_CICLOS_GIT.md` (guía unificada de Matías).

## División de responsabilidades frontend

| Responsable | Ramas/ciclos | Alcance |
|---|---|---|
| Marcos | `frontend/angular-shell` (`F1-03`..`F1-05`), `frontend/public-validation-flow` (`F2-01`, `F2-02`), `frontend/api-readiness` (`F3-01`, `F3-02`, `F3-05`) | Fundación Angular, estructura semántica/accesible, validación pública con mocks ficticios, frontera de servicios y build `/certificados/`. No define el diseño visual final. |
| Matías | `frontend/v0-design-system` (`F1-01`, `F1-02`), admin (`F2-03`..`F2-06`), QA/handoff (`F3-03`, `F3-04`, `F3-06`) y F4-F6 (ciclos definidos en la guía unificada) salvo nuevo acuerdo | Sistema visual desde v0, UI/UX final, admin, responsive, accesibilidad, QA visual y handoff. |

Secuencia de desbloqueo: Marcos puede iniciar `frontend/angular-shell`; Matías trabaja `frontend/v0-design-system`; Marcos avanza `frontend/public-validation-flow`; Matías aplica sistema visual y admin; Marcos formaliza `frontend/api-readiness`; Matías cierra QA/handoff. Coordinar cambios en archivos globales Angular antes de editar `angular.json`, `package.json`, estilos globales o rutas raíz.

## Inventario disponible en v0

| Prompt | Pantalla/flujo | Referencia v0 |
|---:|---|---|
| 4 | Validación pública válida | `app/page.tsx`, `components/validacion/*` |
| 5 | Estados públicos no exitosos | `app/estados/page.tsx`, `components/validacion/estado-*` |
| 6 | Dashboard administrativo | `app/admin/dashboard/page.tsx`, `components/admin/*` |
| 7 | Login administrativo | `app/admin/login/page.tsx`, `components/admin/login-form.tsx` |
| 8 | Crear/editar curso con fechas | `app/admin/cursos/nuevo/page.tsx`, `app/admin/cursos/[id]/editar/page.tsx`, `components/admin/curso-editor.tsx` |
| 9 | Registrar asistencias presentes | `app/admin/cursos/[id]/asistencias/page.tsx`, `components/admin/asistencias-editor.tsx` |
| 10 | Emitir certificación directa | `app/admin/certificaciones/nueva/page.tsx`, `components/admin/nueva-certificacion-editor.tsx` |

## Flujos 11-22 con referencia v0 y ejecución bloqueada por spec

Los flujos 11-22 ya tienen referencia v0 disponible en `muestra_pagina/` y se ejecutan con los ciclos F4-F6 de `MATIAS_PROMPTS_SDD_3_SEMANAS_CICLOS_GIT.md`. Cada ciclo mantiene su regla de bloqueo antes de implementar (spec previa de PDF, QR, permisos, auditoría o configuración según corresponda).

| Prompt | Flujo | Complejidad | Regla antes de implementar |
|---:|---|---|---|
| 11 | Detalle de certificación | Alta | Spec previa por PDF, QR, historial y revocación. |
| 12 | Vista previa PDF complementario | Alta | Spec previa de PDF y diseño aprobado. |
| 13 | Listado de cursos | Media | Contrato de datos o mocks explícitos. |
| 14 | Detalle de curso | Media | Contrato de curso, fechas y asistencias. |
| 15 | Listado de certificaciones | Media | Contrato de filtros, estados y paginación. |
| 16 | Listado de alumnos | Media | Cuidado con datos personales. |
| 17 | Detalle de alumno administrativo | Media | Spec previa de datos visibles. |
| 18 | Entrega manual de certificación | Baja | MVP sin email: copiar link / descargar PDF. |
| 19 | Revocar certificación | Baja | Spec de permisos y estado irreversible. |
| 20 | Carga masiva placeholder | Baja | Alcance placeholder, sin importación real. |
| 21 | Auditoría básica | Media | Contrato de eventos y permisos. |
| 22 | Configuración institucional | Alta | Configuración aprobada; no usar datos reales sensibles. |

## Tokens visuales observados

| Aspecto | Criterio portable a Angular |
|---|---|
| Paleta | Base institucional sobria, fondos claros, contraste alto, acentos controlados para estados. |
| Tipografía | Sans-serif legible para UI; monoespaciada solo para códigos, tokens abreviados o trazabilidad. |
| Layout público | Composición tipo folio/certificado, jerarquía clara y lectura vertical cómoda. |
| Layout admin | Shell administrativo con navegación simple, acciones principales visibles y tablas/listas legibles. |
| Espaciado | Aire suficiente entre bloques; evitar tarjetas anidadas sin necesidad. |
| Estados | Diferenciar válido, revocado, no encontrado y error técnico sin lenguaje ambiguo. |

> **Aplicado en F1-02.** Los tokens concretos (color, tipografía, radio, espaciado, foco, motion) están definidos en `apps/frontend-angular/src/styles.css` y documentados como fuente de verdad en `docs/frontend/02-sistema-visual-v0-f1-02.md`. Primitivos Angular (`BandaEstado`, `CampoDato`, `HeaderInstitucional`, `FolioShell`) disponibles en `apps/frontend-angular/src/app/shared/ui/`. Tailwind queda diferido a F1-04.

## Componentes candidatos

| Componente Angular futuro | Responsabilidad |
|---|---|
| `HeaderInstitucional` | Identidad del IFTS 14, contexto del módulo y navegación mínima. |
| `FolioCertificado` | Presentación pública del certificado o constancia verificable. |
| `BloqueTrazabilidad` | Fecha, curso, estado y metadatos no sensibles. |
| `AdminShell` | Estructura común de administración. |
| `AccionesPrincipales` | Acciones primarias y secundarias consistentes. |
| `BandejaPendientes` | Resumen de tareas administrativas pendientes. |
| `EstadoValidacion` | Válido, revocado, no encontrado y error técnico. |

## Reglas de portado

- Extraer intención visual, no código React/Next.
- Implementar componentes Angular propios bajo `apps/frontend-angular/` cuando el ciclo SDD lo apruebe.
- No inventar contratos API, PDF, QR, permisos ni configuración institucional.
- En validación pública, mostrar DNI completo por decisión institucional (D0); no exponer tokens completos ni datos reales.
- El certificado es de curso y debe mostrar fechas asistidas (`attendedDates`).
- QR/token permanente: las pantallas de entrega manual deben indicar "mismo QR"; no portar rotación de QR desde v0. El MVP no envía emails: la entrega es manual (copiar link / descargar PDF).
- Auth admin simple temporal (clave admin temporal, no portada al bundle); no portar credenciales demo de `login-form.tsx`.
- Firmantes PDF: Rector/a y Asesor/a Pedagógica vía configuración institucional.
- Usar mocks solo si el ciclo los declara explícitamente.
- Priorizar foco visible, navegación por teclado, responsive y contraste.
- No instalar dependencias visuales sin decisión documentada.

## Riesgos de portado

| Riesgo | Mitigación |
|---|---|
| Copiar JSX, hooks o App Router | Reescribir en Angular con componentes, routing y servicios propios. |
| Tokens de Tailwind/shadcn no trasladables | Convertirlos en criterios visuales o Tailwind aprobado para Angular, no en copia literal. |
| Scope creep en PDF, QR o revocación | Exigir spec previa antes de implementar. |
| Datos personales en pantallas admin | Minimizar exposición y usar mocks seguros. |
| Referencia v0 cambia mientras se porta | Revisar el listado seguro de `muestra_pagina/` al iniciar cada ciclo. |

## Build para cPanel

Cuando exista aplicación Angular real y el ciclo lo indique:

```bash
ng build --configuration production --base-href /certificados/
```

No desplegar ni copiar artefactos a cPanel desde OpenCode.

## Estado de la app Angular 20 (ciclo `frontend-angular-shell-public-validation-api-readiness`)

App creada en `apps/frontend-angular/` con Angular CLI 20.3.30 standalone. Desplegable bajo `/certificados/`. Shell semántico + página pública con `resource()` (tres bloques: `valid` / `not-verifiable` / `technical-error`, `aria-live="polite"`). Verificación: 35/35 tests, build prod verde (252.97 kB initial / 71.88 kB transfer, lazy 3.88 kB). Requiere `export PATH="$HOME/.local/bin:$PATH"`.

### Estado F2-03 — login y shell administrativo (mock)

Ciclo `f2-03-admin-login-shell` sobre rama `frontend/admin-foundation`. Base navegable del panel admin Angular 20 con sesión mock en memoria para desbloquear F2-04..F2-06. Sin auth real, sin clave admin temporal en bundle, sin storage/cookies/red ni datos mock de dominio.

Archivos creados en `apps/frontend-angular/src/app/features/admin/`:

- `mock-session.ts` — `InjectionToken<MockSession>` + `InMemoryMockSession` (`signal<boolean>`, `signIn`/`signOut`/`hasSession`).
- `admin-guard.ts` — `adminGuard` (`CanActivateFn`, `inject(Router)` y `inject(MOCK_SESSION)`). Redirección `/admin` → `/admin/dashboard` declarada en `app.routes.ts`.
- `admin-shell.{ts,html,css,spec.ts}` — shell admin con `role="banner"` sticky, sidebar, `main#contenido`, footer admin y badge "Sesión mock".
- `sidebar-admin.{ts,html,css,spec.ts}` — 5 ítems (Inicio, Cursos, Alumnos, Asistencias, Certificaciones) con SVG inline, `aria-current="page"`, botón "Cerrar sesión".
- `login-page.{ts,html,css,spec.ts}` — layout two-column responsive, subtítulo visible de simulación.
- `login-form.{ts,html,css,spec.ts}` — `fieldset/legend sr-only`, labels asociados, `autocomplete`, validación local, `role="alert"` con foco.
- `admin-dashboard-page.{ts,html,css,spec.ts}` — 3 tarjetas placeholder "Próximamente" (Cursos/Asistencias/Certificaciones).

Modificados:

- `app.routes.ts` — bloque `/admin/login`, `/admin` (`redirectTo: '/admin/dashboard'`, `pathMatch: 'full'`), `/admin/dashboard` con `adminGuard`, antes del wildcard `**`.
- `app.{ts,html,spec.ts}` — shell raíz route-aware: en `/admin/*` no renderiza `HeaderInstitucional` raíz ni `main#contenido`/`footer` públicos; `AdminShell` provee sus propios landmarks.

Límites explícitos (handoff a F2-04..F2-06): no backend, deploy, base de datos, `.htaccess`, material privado, auth real, clave admin temporal en Angular, cookies/`localStorage`/`sessionStorage`/IndexedDB, credenciales demo de `muestra_pagina/`, mocks de cursos/alumnos/asistencias/certificaciones, Tailwind/shadcn/lucide/CVA ni copia literal React/Next. Verificación: 146/146 tests verde, build sin warnings (283.68 kB initial / 81.34 kB transfer; lazy admin-shell 10.38 kB / 2.78 kB, login-page 29.32 kB / 6.97 kB). Checks negativos de clave admin temporal, storage y red en `apps/frontend-angular/src/app/features/admin` pasan (0 matches de literales exactos en Angular `src`).

### Estado F2-04 — cursos y fechas admin (mock)

Ciclo `f2-04-admin-courses-dates` sobre rama `frontend/admin-courses-dates`. UI administrativa Angular 20 para cursos y fechas, navegable, contract-ready y testeable. Datos en memoria, sin auth real, sin `X-Admin-Key`, sin storage, sin HTTP desde el browser. Habilita Asistencias (F2-05) y Certificaciones (F2-06) sobre la misma base.

Archivos creados en `apps/frontend-angular/src/app/features/admin/courses/`:

- `courses.models.ts` — `EstadoCurso` (`borrador|activo|cerrado|archivado`, alineado al backend real), `EstadoFecha` (`programada|realizada|cancelada`), `Curso`, `CursoDetalle`, `CursoFecha`, `CursoDraft`, `CursoFechaDraft`, `CursosFiltros`. Sin DNI, email, token, matrícula ni nombres reales.
- `courses.service.ts` — interfaz `CoursesService` + token `COURSES_SOURCE` listo para futura sustitución por `HttpCoursesService` cuando la auth real esté aprobada. La implementación en memoria vive en `in-memory-courses.service.ts`.
- `in-memory-courses.service.ts` — `InMemoryCoursesService` con `listar`, `obtener`, `crear`, `actualizarEstado`, `listarFechas`, `guardarFecha` y `reemplazarFechas` (reemplazo completo del set de fechas: crea nuevas, actualiza existentes y elimina las quitadas). Seed ficticio de 6 cursos y 1–3 fechas por curso; mutaciones solo en instancia; banner "Datos de demostración: los cambios no se persisten al recargar".
- `courses-list-page.{ts,html,css,spec.ts}` — `<input type="search">` nativo, filtro por estado, `<section>` + `<article>`, banner de demo, enlaces a nuevo/detalle.
- `course-detail-page.{ts,html,css,spec.ts}` — nombre, código, estado (banda de estado styled `<p class="banda-estado" aria-live="polite">`, no el primitivo `BandaEstado`), `<dl>` de fechas y enlaces a `editar` y al listado.
- `course-editor-page.{ts,html,css,spec.ts}` — `data.mode` (`create`/`edit`), `fieldset/legend` por fechas, `<input type="date">`, validación local; al crear invoca `CoursesService.crear`/`guardarFecha` y al editar usa `reemplazarFechas` para persistir altas, cambios y quitas en memoria.
- `__checks__/no-secrets.spec.ts` y `__checks__/no-real-data.spec.ts` — tests negativos de seguridad y datos.

Archivos modificados en `apps/frontend-angular/src/app/`:

- `app.routes.ts` — rutas admin hijas (`/admin/dashboard` con `loadComponent`, `/admin/cursos`, `/admin/cursos/nuevo`, `/admin/cursos/:id`, `/admin/cursos/:id/editar`); orden: `nuevo` y `:id/editar` antes de `:id`, `:id` antes de `cursos`; catch-all admin antes de `**`; `COURSES_SOURCE` provisto a nivel de ruta.
- `features/admin/admin-shell.{ts,html,spec.ts}` — `<app-admin-dashboard-page />` reemplazado por `<router-outlet />`; el shell expone `rutaActual` (signal desde `router.events`/`NavigationEnd`).
- `features/admin/sidebar-admin.{ts,html,spec.ts}` — ítem `Cursos` con `route: '/admin/cursos'`; `isActive()` por prefijo (`startsWith('/admin/cursos')`) para activar Cursos en todas sus rutas hijas; `Inicio` solo activo en `/admin/dashboard` exacto.
- `features/admin/admin-dashboard-page.{ts,html,spec.ts}` — tarjeta "Cursos activos" como `<a routerLink="/admin/cursos">` con conteo ficticio; Asistencias/Certificaciones siguen como placeholders deshabilitados.
- `app.routes.spec.ts` — carga real de `CoursesListPage`, `CourseDetailPage`, `CourseEditorPage` con `RouterTestingHarness` + `withComponentInputBinding()`; id inválido (`/admin/cursos/abc`) no revienta, muestra "no encontrado".

Límites explícitos (F2-04): sin backend, deploy, base, material privado, auth real, `X-Admin-Key`, clave admin temporal, cookies/`localStorage`/`sessionStorage`/IndexedDB, HTTP/HttpClient/fetch/XMLHttpRequest desde el browser, datos reales, DNI, tokens, matrículas, emails, credenciales demo de `muestra_pagina/`, mocks de alumnos/asistencias/certificaciones, Tailwind/shadcn/lucide/CVA, copia literal React/Next, ni dependencias nuevas (`package.json`/lockfiles sin cambios). La sustitución real por `HttpCoursesService` queda para un ciclo con sesión segura aprobada (PHP HttpOnly o equivalente).

Verificación (`openspec/changes/archive/2026-07-07-f2-04-admin-courses-dates/verify-report.md`): **PASS WITH WARNINGS**. Tests: `npm run test:ci` 239/239 SUCCESS. Build: `npm run build` verde (Initial total 306.01 kB raw / 88.57 kB transfer; lazy `course-editor-page` 12.03 kB, `courses-list-page` 8.03 kB, `course-detail-page` 7.27 kB). Compliance: 11/13 escenarios compliant; 2/13 `PARTIAL` por tareas documentales propias de `sdd-archive` (ahora cerradas). Negative checks (script Python sobre 12 archivos no spec de `src/app/features/admin/courses` y sobre los chunks `course-editor-page`/`courses-list-page`/`course-detail-page`/`admin-shell`/`admin-dashboard-page`): 0 matches para `X-Admin-Key`/admin key, storage/cookies/IndexedDB, HTTP/fetch/HttpClient, campos DNI/token/email/alumno/student, emails y números DNI-like. `main` conserva código público existente de validación (`documentNumber`/mock público y `HttpValidationSource`); está fuera del alcance F2-04 y amparado por D0 público.

**Advertencia de tamaño de revisión**: diff estimado ~3452 líneas (3384 altas + 68 bajas) contra presupuesto 1500; medición real posterior ~3800. Pre-PR reviews no hallaron blockers CRITICAL tras corregir persistencia de quitas de fechas. Maintainer (Matías) aprobó **`size:exception`** (2026-07-07) antes de la preparación del PR; no se aplica split. Evidencia de archive OpenSpec del ciclo permanece en el mismo PR salvo cambio posterior. Esta decisión queda registrada en el archive report del ciclo.

Handoff a F2-05 (asistencias) y F2-06 (certificaciones): `CursoFecha` y `InMemoryCoursesService` ya están listos para reuso. Asistencias y Certificaciones siguen como placeholders deshabilitados en el dashboard ("Próximamente: Asistencias"/"Certificaciones", handoff F2-05/F2-06). El detalle del curso aún no muestra placeholders de asistencias/certificaciones: quedan para F2-05/F2-06. El `HeaderInstitucional` raíz en `/admin/*` (tech debt documentado en F2-03) sigue sin refactorizar; queda para un ciclo posterior.

### Estado F2-05 — Asistencias admin (mock)

Ciclo `f2-05-admin-attendance` sobre rama `frontend/admin-attendance`. UI administrativa Angular 20 para listar fechas con asistencia pendiente y marcar presentes por fecha, navegable, mock-only, contract-ready y testeable. Datos ficticios en memoria (12–15 personas demo por curso; D0 2026-07-20: `dniMostrar` con DNI completo ficticio), sin auth real, sin `X-Admin-Key`, sin storage, sin HTTP desde el browser. Habilita la base de integración con Certificaciones (F2-06) sobre el mismo shell admin y el patrón `COURSES_SOURCE`/`ATTENDANCE_SOURCE`.

Archivos creados en `apps/frontend-angular/src/app/features/admin/attendances/`:

- `models/attendance.types.ts` — `EstadoAlumno` (`activo`/`inactivo`), `AsistenciaAlumno` (`id`, `apellidoNombre`, `dniMostrar`, `estado`), `Asistencia`, `AsistenciaMarcado` e interface `AttendanceService` (`listarAlumnos`, `listarAsistencias`, `marcar`, `anular`).
- `data/attendance-mock.service.ts` — seed de 12–15 personas demo por curso; `dniMostrar` con DNI completo ficticio (D0); sin token, legajo ni matrícula. `marcar()` rechaza fechaId desconocido (no normaliza fechas inexistentes).
- `data/attendance.token.ts` — `ATTENDANCE_SOURCE` (`InjectionToken<AttendanceService>`) provisto a nivel de ruta admin junto a `COURSES_SOURCE`.
- `pages/list/attendances-list-page.{ts,html,css,spec.ts}` — `<input type="search">` nativo, listado de cursos/fechas, conteo `presentes/total` desde `ATTENDANCE_SOURCE`, CTA a la primera fecha activa/programada/realizada disponible con `aria-label` y breadcrumb.
- `pages/marking/attendance-marking-page.{ts,html,css,spec.ts}` — `effect()` reactivo sobre `cursoId()`/`fechaId()` con guard `loadGen` anti-stale; checkboxes nativos con `<label>` asociado, contador de marcados, botones Guardar/Descartar, resumen de fecha en `<dl>` nativo, `<output aria-live="polite">` para feedback de guardado, `<p role="alert">` para error/carga y estado controlado "Fecha no encontrada" con enlace de retorno cuando el `fechaId` no pertenece al curso. No usa `appCampoDato` ni `BandaEstado` (usa `<dl>`, `<p role="alert">` y `<output>` nativos).
- `__checks__/no-secrets.spec.ts` y `__checks__/no-real-data.spec.ts` — tests negativos de seguridad y datos.

Archivos modificados en `apps/frontend-angular/src/app/`:

- `app.routes.ts` — `/admin/asistencias` y `/admin/cursos/:id/fechas/:fechaId/asistencias` registradas en el orden seguro (dashboard, asistencias, cursos/nuevo, cursos/:id/fechas/:fechaId/asistencias, cursos/:id/editar, cursos/:id, cursos) antes de `pathMatch:'prefix'` y `**`; `ATTENDANCE_SOURCE` proveído a nivel de ruta.
- `app.routes.spec.ts` — casos de orden, sesión mock con/sin, runtime provider `ATTENDANCE_SOURCE`, ids inválidos y carga real de `AttendancesListPage` y `AttendanceMarkingPage` con `RouterTestingHarness` + `withComponentInputBinding()`.
- `features/admin/sidebar-admin.{ts,html,spec.ts}` — ítem `Asistencias` con `route: '/admin/asistencias'`; `isActive()` por prefijo (`startsWith('/admin/asistencias')`) para activarlo en todas sus rutas hijas; `Certificaciones` sigue como placeholder.
- `features/admin/admin-dashboard-page.{ts,html,spec.ts}` — tarjeta Asistencias pasa de placeholder deshabilitado a `<a routerLink="/admin/asistencias">` con conteo ficticio; Certificaciones sigue deshabilitado.
- `features/admin/courses/course-detail-page.{ts,html,spec.ts}` — link `Tomar asistencia` por fecha con `aria-label` y query limpia hacia `/admin/cursos/:id/fechas/:fechaId/asistencias`.

Límites explícitos (F2-05): sin backend, deploy, base de datos, `.htaccess`, material privado, auth real, `X-Admin-Key`, clave admin temporal, cookies/`localStorage`/`sessionStorage`/IndexedDB, HTTP/HttpClient/fetch/XMLHttpRequest desde el browser, datos reales, DNI completo administrativo, emails, tokens, matrículas, credenciales demo de `muestra_pagina/`, mocks de certificaciones, Tailwind/shadcn/lucide/CVA, copia literal React/Next, ni dependencias nuevas (`package.json`/lockfiles sin cambios). La sustitución real por `HttpAttendanceService` queda para un ciclo con sesión segura aprobada (PHP HttpOnly o equivalente). Solo datos de estudiantes: enmascarados (`dniMostrar` `XX****XX`); sin email, DNI completo, token, legajo ni matrícula. No se usa HTTP, `X-Admin-Key`, auth real, storage, ni dependencias nuevas en el frontend.

Verificación (`openspec/changes/archive/2026-07-08-f2-05-admin-attendance/verify-report.md`): **PASS WITH WARNINGS**. Tests: `npm run test:ci` 315/315 SUCCESS. Build: `npm run build` verde (Initial total 310.43 kB raw / 89.66 kB transfer; lazy `attendance-marking-page` 11.44 kB, `attendances-list-page` 7.48 kB). Compliance: 9/10 grupos compliant; 1/10 partial por cierre documental propio de `sdd-archive` (cerrado en este archive). Negative checks (script Python sobre 9 archivos no spec de `src/app/features/admin/attendances` + sobre los chunks `attendance-marking-page` y `attendances-list-page` + specs `__checks__`): 0 matches para `X-Admin-Key`/admin key, storage/cookies/IndexedDB, HTTP/fetch/HttpClient, DNI/token/email/alumno/student, emails y números DNI-like.

**Advertencia de tamaño de revisión**: diff estimado ~2.870 líneas (2.841 altas / 29 bajas) contra presupuesto 1.500; medición real posterior consistente. Maintainer (Matías) aprobó **`size:exception`** antes de la preparación del PR; no se aplica split. Esta decisión queda registrada en el archive report del ciclo (`openspec/changes/archive/2026-07-08-f2-05-admin-attendance/archive-report.md`).

Handoff a F2-06 (certificaciones): `Asistencia`, `AsistenciaAlumno`, `AttendanceService` y `ATTENDANCE_SOURCE` quedan listos para reuso y para que el ciclo de certificaciones consuma `attendedDates` desde `CursoFecha` y `Asistencia` sin reescribir la UI de Asistencias. Certificaciones sigue como placeholder deshabilitado en el dashboard ("Próximamente: Certificaciones", handoff F2-06). El `HeaderInstitucional` raíz en `/admin/*` (tech debt documentado en F2-03) sigue sin refactorizar; queda para un ciclo posterior.

### Estado F2-06 — Certificaciones admin (mock)

Ciclo `f2-06-admin-certifications` sobre rama `frontend/admin-certifications`. UI administrativa Angular 20 para listar y previsualizar certificaciones ficticias, navegable, mock-only, contract-ready y testeable. Datos ficticios en memoria (3–6 certificados demo, `documentMasked` `XX****XX`, `tokenPrefix` `prefijo_demo_xxx`, URL pública truncada a 60 chars), sin auth real, sin `X-Admin-Key`, sin storage, sin HTTP desde el browser. Activa Certificaciones como ruta navegable en el shell admin y deja CTAs de emisión/PDF/entrega/revocación/listado real deshabilitados con handoff explícito a F4-F6.

Archivos creados en `apps/frontend-angular/src/app/features/admin/certifications/`:

- `certifications.models.ts` — `EstadoCertificado` (`borrador`/`vigente`/`revocado`/`vencido`), `Certificacion` (con `documentMasked`, `tokenPrefix`), `CertificacionDetalle` (añade `publicValidationUrl` truncada, `attendedDates`, `auditEvents`), `AuditEvent`, `CertificacionesFiltros`. Sin DNI/token/email/legajo/matrícula.
- `certifications.service.ts` — interface `CertificationsService` (`listar`, `obtener`, `contar`) y `CERTIFICATIONS_SOURCE` (`InjectionToken<CertificationsService>`).
- `in-memory-certifications.service.ts` — seed de 6 certificados ficticios; `documentMasked` `XX****XX`; `tokenPrefix` `prefijo_demo_xxx`; `publicValidationUrl` truncada a 60 chars sin token completo; clone defensivo en `obtener`; sin email, DNI completo, token completo, legajo ni matrícula.
- `certifications.service.spec.ts` — cubre `listar`/`obtener`/`contar`, id inválido, clone defensivo, filtros por estado y texto, formato `documentMasked`/`tokenPrefix`, URL truncada sin UUID.
- `pages/list/certifications-list-page.{ts,html,css,spec.ts}` — banner "Datos de demostración — No persiste al recargar"; `input[type="search"]` + `<select>` por estado; 3–6 `<article>`; empty state `<output aria-live="polite">`; enlaces a `/admin/certificaciones/:id`; sin token completo en DOM.
- `pages/preview/certification-preview-page.{ts,html,css,spec.ts}` — `<dl>` seguro (`documentMasked`, `tokenPrefix`, URL truncada, `attendedDates`, `auditEvents`); CTAs PDF/entrega/revocación/listado real `disabled` con `aria-disabled="true"` y copy "F4-01/F4-02/F5-04/F6-01"; id inválido/inexistente muestra "Certificación no encontrada" sin excepción; enlace retorno a `/admin/certificaciones`; banner "Disponible en F4/F5/F6"; sin emisión, PDF, revocación ni listado real.
- `__checks__/no-secrets.spec.ts` y `__checks__/no-real-data.spec.ts` — tests negativos de seguridad (sin `X-Admin-Key`, HTTP/fetch/HttpClient, storage/cookies/IndexedDB, DNI/token/email) y datos (formato mascarado, placeholders neutros, sin UUID, URL truncada).

Archivos modificados en `apps/frontend-angular/src/app/`:

- `app.routes.ts` — `certificaciones` (listado) y `certificaciones/:id` (preview) registradas en orden seguro (`:id` antes del listado, después de `cursos`, antes del catch-all admin); `CERTIFICATIONS_SOURCE` proveído a nivel de ruta admin junto a `COURSES_SOURCE` y `ATTENDANCE_SOURCE`.
- `app.routes.spec.ts` — casos de orden de children, sesión mock con/sin, runtime `CERTIFICATIONS_SOURCE` con `RouterTestingHarness` + `withComponentInputBinding()`, id inválido `/admin/certificaciones/abc` sin `NullInjectorError`, regresión sin provider (debe fallar), render real del seed.
- `features/admin/sidebar-admin.{ts,html,spec.ts}` — ítem `Certificaciones` pasa de placeholder a `route: '/admin/certificaciones'`; `isActive()` extendido con prefijo `/admin/certificaciones` para activo en `/admin/certificaciones/:id`.
- `features/admin/admin-dashboard-page.{ts,html,spec.ts}` — tarjeta "Próximamente: Certificaciones" reemplazada por `<a routerLink="/admin/certificaciones">` con conteo ficticio; quitado copy "F2-06"/"handoff" del bloque Certificaciones.

Límites explícitos (F2-06): sin backend, deploy, base de datos, `.htaccess`, material privado, auth real, `X-Admin-Key`, clave admin temporal, cookies/`localStorage`/`sessionStorage`/IndexedDB, HTTP/HttpClient/fetch/XMLHttpRequest desde el browser, datos reales, DNI completo administrativo, tokens completos, emails, legajos, matrículas, credenciales demo de `muestra_pagina/`, Tailwind/shadcn/lucide/CVA, copia literal React/Next, ni dependencias nuevas (`package.json`/lockfiles sin cambios). Emisión real, PDF/QR, entrega manual, revocación y listado real quedan como handoff a F4-01/F4-02/F5-04/F6-01. La sustitución real por `HttpCertificationsService` queda para un ciclo con sesión segura aprobada.

Verificación (re-verify post correcciones pre-commit): `npm run test:ci` **394/394 SUCCESS** (incluye specs de servicio, páginas, checks de seguridad/datos y rutas runtime). `npm run build` verde sin warnings (Initial total 313.84 kB raw / 90.36 kB transfer; lazy `certification-preview-page` 8.38 kB, `certifications-list-page` 7.76 kB; vs F2-05 310.43 kB / 89.66 kB). `git diff --check` PASS (sin salida). Veredicto final: **PASS** (14/14 escenarios compliant, 0 CRITICAL/WARNING).

Corrective fixes pre-commit aplicados sobre la rama y consolidados en el re-verify:

- **Strict id parsing**: la regex de `CertificationPreviewPage` acepta únicamente enteros decimales positivos; rechaza coercibles como `0x1` y `1e0`. Cubierto por `app.routes.spec.ts` y `certification-preview-page.spec.ts` (casos rechazados y normalización válida de ` 1 `).
- **Dashboard fallback**: `admin-dashboard-page` consume `CertificationsService.contar()` vía signal (`contar().then()`) y, ante rechazo de la promesa, cae explícitamente a `0`. `inject(CERTIFICATIONS_SOURCE, { optional: true })` protege el consumo fuera del árbol admin.
- **No-secrets check endurecido**: el spec negativo `__checks__/no-secrets.spec.ts` enumera métodos públicos, getters y parámetros del constructor como fuentes válidas de búsqueda, e incluye las funciones puras a nivel de módulo (`seed` y `truncarUrl`) que contienen los literales del seed ficticio, evitando falsos negativos por literales que viven fuera de los cuerpos de clase.
- **Constante nombrada para truncado de URL**: la longitud de truncado de `publicValidationUrl` (60 chars) pasa a una constante nombrada en el modelo/feature, citada en specs y tests. Único punto de cambio si un ciclo siguiente redefine la política.

Handoff a F4-01/F4-02/F5-04/F6-01: `Certificacion`, `CertificacionDetalle`, `CertificationsService` y `CERTIFICATIONS_SOURCE` quedan listos para reuso. Los CTAs de emisión, PDF, entrega manual, revocación y listado real están deshabilitados en la UI con handoff explícito. `attendedDates` ya está modelado en el detalle para consumo futuro desde `CursoFecha`/`Asistencia`. El `HeaderInstitucional` raíz en `/admin/*` (tech debt documentado en F2-03) sigue sin refactorizar; queda para un ciclo posterior.

### Estado F4-01 — Detalle de certificación (expediente administrativo)

Ciclo `f4-01-certificate-detail` sobre la base de F2-06. Reemplaza la previsualización mínima de `/admin/certificaciones/:id` por un expediente administrativo mock-only: estado, alumno, curso, asistencias, documento réplica, auditoría, QR decorativo y zona de riesgo. Mantiene paridad visual con `muestra_pagina/app/admin/certificaciones/[id]` y `muestra_pagina/components/admin/expediente-certificacion.tsx`, portada a Angular 20 con CSS local y tokens globales (`--color-ink`, `--color-circuit`, `--color-valid`, `--color-destructive`). Sin Tailwind ni dependencias nuevas.

Archivos modificados en `apps/frontend-angular/src/app/features/admin/certifications/`:

- `pages/preview/certification-preview-page.ts` — helpers de presentación (número visual `IFTS14-CERT-NNNN`, fechas formateadas, labels de estado y handoff); señal derivada de handoffs; carga sin cambios (sigue usando `CERTIFICATIONS_SOURCE.obtener(id)`).
- `pages/preview/certification-preview-page.html` — breadcrumb, encabezado (kicker/h1/subtítulo/badge), columna de control, ficha, acciones `disabled` con `aria-disabled="true"`, QR decorativo CSS, zona de riesgo, documento réplica (`<article>` institucional) y auditoría (`<ol class="auditoria-timeline">`).
- `pages/preview/certification-preview-page.css` — grilla responsive (`grid-template-columns: 21rem minmax(0,1fr)` a partir de `64rem`), paneles, documento institucional, badges, botones disabled y QR decorativo 8×8 con tokens existentes.
- `pages/preview/certification-preview-page.spec.ts` — ampliado: secciones del expediente, acciones con `aria-disabled`, handoffs F4-02/F5-04/F6-03/F6-01, id inválido (`abc`, `0x1`, `1e0`, `999`) y route reuse.
- `__checks__/no-secrets.spec.ts` — endurecido: prohibe `localStorage`, `sessionStorage`, `IndexedDB`, `fetch`, `HttpClient` y `X-Admin-Key` en el feature.
- `__checks__/no-real-data.spec.ts` — endurecido: valida DOM, seed y `documentMasked` sin DNI completo, token, email, legajo, matrícula ni UUID.

Archivos modificados fuera del feature:

- `apps/frontend-angular/src/app/app.routes.spec.ts` — expectativa runtime de `/admin/certificaciones/1` ajustada al expediente; se preserva la ruta `certificaciones/:id`.
- `apps/frontend-angular/angular.json` — budget `anyComponentStyle` ajustado a `8kB warning / 16kB error` para admitir el CSS del expediente (CSS del componente pesa 13.78 kB; ver warning registrado en `verify-report.md`).

Límites explícitos (F4-01): sin backend real, HTTP, `X-Admin-Key`, storage/cookies/IndexedDB, sesión real, DNI completo administrativo, token completo, email, legajo, matrícula ni datos reales en la UI admin. QR decorativo sin token embebido. Las acciones PDF, copiar link, entrega manual, regenerar PDF y revocar certificación quedan `disabled` con handoff explícito a F4-02, F5-04, F6-03 y F6-01. F4-02 (ruta/vista PDF imprimible) queda diferido: la réplica documental visible cubre el expediente sin ruta nueva.

Verificación (`sdd-verify`): `npm run test:ci` **420/420 SUCCESS**; `npm run build` exit 0 con **warning de budget CSS** (`certification-preview-page.css` 13.78 kB > 8 kB warning, dentro de 16 kB error) aceptado como trade-off de paridad visual; 6/6 escenarios compliant, 0 CRITICAL. Evidencia visual en `openspec/changes/archive/2026-07-12-f4-01-certificate-detail/evidence/` (capturas desktop 1280×800 y mobile 390×844 + `parity-notes.md` con tabla comparativa v0 vs Angular). Diff inspeccionado: 1588 líneas cambiadas, dentro del budget de 4000. Detalle en `docs/frontend/F4-01-expediente-certificacion.md` y en el archive report del ciclo.

Handoff a F4-02/F5-04/F6-03/F6-01: la UI ya está lista para que esos ciclos conecten las acciones reales manteniendo la frontera de datos. F4-02 (ruta/vista PDF imprimible) sigue diferido; F5-04 (entrega manual real), F6-03 (link público) y F6-01 (revocación real) llegan en sus propios ciclos. El `HeaderInstitucional` raíz en `/admin/*` (tech debt documentado en F2-03) sigue sin refactorizar; queda para un ciclo posterior.

### Estado F4-02 — Vista previa imprimible de certificado

Ciclo `f4-02-certificate-pdf-preview` sobre la base F4-01. Agrega la ruta `/admin/certificaciones/:id/pdf` como página standalone Angular 20, lazy, mock-only y con impresión nativa (A4 apaisado). Activa los CTAs `Descargar PDF` y `Regenerar PDF` del expediente F4-01 como `routerLink`; mantiene `Copiar link` (F6-03), `Entrega manual` (F5-04) y `Revocar certificación` (F6-01) deshabilitados con `aria-disabled="true"`. Reutiliza `CERTIFICATIONS_SOURCE`, `CertificacionDetalle` y los modelos de F2-06. Portado desde `muestra_pagina/components/admin/vista-previa-pdf.tsx` sin React/Next ni Tailwind; paridad v0 con CSS local y tokens globales (`--color-ink`, `--color-tech-blue`, `--color-circuit`, `--color-valid`). Sin dependencias nuevas, sin backend, sin HTTP, sin storage, sin PDF/QR real. El QR/token permanece permanente (D0: no rota).

Archivos creados en `apps/frontend-angular/src/app/features/admin/certifications/pages/pdf/`:

- `certification-pdf-preview-page.ts` — componente standalone con signals (`id`, `certificacion`, `estado`), validación decimal positiva, `effect` anti-race, `imprimir()` con guard (`typeof window.print === 'function'`), live region `role="status" aria-live="polite"` y diferido vía `requestAnimationFrame` antes de invocar el diálogo nativo.
- `certification-pdf-preview-page.html` — folio seguro (encabezado, cuerpo, firmas, bloque de validación QR, pie), breadcrumb, barra de acciones `.no-print`, nota QR `.no-print` y live region `.no-print`.
- `certification-pdf-preview-page.css` — layout responsive + `@page { size: A4 landscape; margin: 0; }`, `.no-print`, `print-color-adjust: exact` y compactación print para 1 A4 (padding/gap/escala/tipografía/break).
- `certification-pdf-preview-page.spec.ts` — 35 specs: ids robustos (`abc`, `0`, `0x1`, `1e0`, `999`, vacío, route reuse), privacidad (sin `tokenPrefix`/DNI/email/UUID/legajo/matrícula), QR 8×8, autoridades neutras, `imprimir()` con rAF + guard, no manipulación DOM del shell.

Archivos modificados:

- `apps/frontend-angular/src/app/app.routes.ts` — `certificaciones/:id/pdf` registrada **antes** de `certificaciones/:id` para que `:id` no capture el sufijo `/pdf`.
- `apps/frontend-angular/src/app/app.routes.spec.ts` — 7 specs nuevos de orden, resolución de ruta PDF y entradas adversariales.
- `apps/frontend-angular/src/app/features/admin/certifications/pages/preview/certification-preview-page.html` — `Descargar PDF` y `Regenerar PDF` pasan de `<button disabled>` a `<a [routerLink]="['/admin/certificaciones', id, 'pdf']">`; los otros tres CTAs intactos.
- `apps/frontend-angular/src/app/features/admin/certifications/pages/preview/certification-preview-page.css` — estilo `.btn-pdf` para los enlaces habilitados.
- `apps/frontend-angular/src/app/features/admin/certifications/pages/preview/certification-preview-page.spec.ts` — ampliado con delta F4-02: dos enlaces PDF a `/admin/certificaciones/:id/pdf` y tres handoffs deshabilitados exactos (F5-04, F6-03, F6-01).
- `apps/frontend-angular/src/app/features/admin/certifications/__checks__/no-secrets.spec.ts` — `CertificationPdfPreviewPage` añadida al array `sources()`.
- `apps/frontend-angular/src/app/features/admin/certifications/__checks__/no-real-data.spec.ts` — 7 specs nuevos de DOM del PDF preview (sin DNI/token/email/legajo/matrícula/UUID).
- `apps/frontend-angular/src/app/features/admin/admin-shell.css` — `@media print` estable que oculta skip-link, sidebar-desktop, topbar, footer, drawer-overlay, drawer-mobile y menu-btn; resetea `.layout`/`.content`/`main#contenido` a block sin padding ni max-width (sustituye el workaround DOM que probó FAIL en la primera pasada de verify).

Límites explícitos (F4-02): sin PDF/QR real, sin backend, sin HTTP, sin `X-Admin-Key`, sin storage/cookies/IndexedDB, sin sesión real, sin datos reales, sin DNI/token completos administrativos, sin email, legajo, matrícula, sin UUID, sin dependencias nuevas, sin Tailwind, sin copia literal React/Next. Autoridades: `Autoridad Demo Uno` (Rector/a) y `Autoridad Demo Dos` (Asesor/a Pedagógica) — placeholders neutros. La carga horaria y el folio no se exponen porque no están modelados en `CertificacionDetalle`; queda nota de scope en `parity-notes.md`.

Verificación (`sdd-verify`, lineage `review-c74662c658bf5781`):

- `npm run test:ci` **474/474 SUCCESS** (35 PDF preview + 79 routes + 24 checks + 336 resto).
- `npm run build` exit 0 con **2 warnings de budget CSS**: `certification-pdf-preview-page.css` 12,41 kB y `certification-preview-page.css` 14,31 kB; ambos < 16 kB error, trade-off de paridad visual.
- `bash openspec/changes/f4-02-certificate-pdf-preview/evidence/print-app-check.sh` exit 0: arranca `ng serve`, espera la app, completa el formulario de login mock renderizado y navega por la SPA (autoritativo, no usa fixture HTML). Genera dos PDFs Chromium con CDP `Page.printToPDF`:
  - `id=1` normal: `841.92 × 594.96 pt`, 1 página, hash `d5204c6f7524c74b3606c49c6e2b21b0f241827a77b4d8c3fc2a023fdab6b82c`.
  - `id=5` revocado: `841.92 × 594.96 pt`, 1 página, hash `0e81b5bb7fc5a8a9ac161c5c426f62151fb9b4d2f4885fd68a316ccff2d7f37d`.
  - `pdftotext` confirmó títulos, alumnos, cursos, autoridades, números de certificado, estado revocado y texto institucional; ausentes: shell admin, controles no imprimibles, DNI/token completos, email, UUID, legajo y matrícula; URL visible truncada.
- `git diff --check`: limpio. `package.json`, lockfiles, `angular.json` y `.atl`: sin cambios tracked ni untracked.
- Líneas authored: 328 tracked + 3253 untracked textuales = 3581; por debajo del presupuesto 4000.

Fallo histórico y corrección (no ocultada):

- La primera corrida de `sdd-verify` (lineage previo `review-7ad4da8e`) terminó en **FAIL** porque el folio ~921 CSS px no entraba en ~794 px disponibles de A4 landscape, el `admin-shell` externo solo se ocultaba vía workaround DOM (click) en `emulateMedia('print')`/`page.pdf()`, y la captura `pdf-print.png` anterior era screenshot de pantalla (inválida como prueba paginada).
- La corrección se aplicó con lineage **nuevo** `review-c74662c658bf5781` (sin reutilizar el lineage fallido), compactando `@media print` de `certification-pdf-preview-page.css` a 1 A4 landscape, agregando `@media print` estable en `admin-shell.css`, eliminando el workaround DOM del TS (`SHELL_SELECTORS`, `hidden`/`for`/`finally`) y regenerando evidencia real (PDF Chromium + `pdf-print.png` desde el PDF normal). Las 7 tareas `C1`–`C7` quedaron verdes; ver `apply-evidence.md` para el detalle.

Warnings carry-forward (no bloqueantes):

- `requestAnimationFrame` no conserva/cancela su handle al destruir el componente; follow-up previamente aprobado y sin falla runtime observada.
- Dos warnings de budget CSS (`certification-pdf-preview-page.css` 12,41 kB; `certification-preview-page.css` 14,31 kB), ambos debajo del límite de error de 16 kB; trade-off de paridad visual.
- Escenario documental 11 (cierre) diferido por diseño a `sdd-archive`; no es defecto del producto verificado.

Handoff a F5-04/F6-03/F6-01: la UI ya está lista para que esos ciclos conecten las acciones reales manteniendo la frontera de datos. F5-04 (entrega manual real), F6-03 (link público) y F6-01 (revocación real) llegan en sus propios ciclos. La configuración institucional de autoridades y pie queda pendiente hasta un ciclo que conecte `HttpInstitutionalConfigService`. El `HeaderInstitucional` raíz en `/admin/*` (tech debt documentado en F2-03) sigue sin refactorizar; queda para un ciclo posterior.

Detalle en `docs/frontend/F4-02-vista-previa-pdf.md` y archive `openspec/changes/archive/2026-07-12-f4-02-certificate-pdf-preview/`.

### Estado F4-03 — Listado de cursos con paridad v0

Ciclo `f4-03-courses-list` sobre la base F2-04. Evoluciona `CoursesListPage` in-place para que `/admin/cursos` alcance paridad funcional y visual con `muestra_pagina/components/admin/lista-cursos.tsx`, sin nuevas rutas, dependencias, backend, HTTP ni storage. Tabla accesible en desktop (`<caption>`, `<th scope="col">`, métricas con `—` y texto accesible "Dato disponible con integración real"), tarjetas mobile con las mismas métricas, filtro de búsqueda, selector de estado, chips `aria-pressed` con/sin fechas, `Limpiar filtros` condicional y diferenciación de loading, error con reintento, vacío total y sin coincidencias. Métricas `alumnosPresentes`/`certificaciones` quedan `null`/`—` con explicación accesible; el listado no consulta features de asistencias ni certificaciones.

Archivos en `apps/frontend-angular/src/app/features/admin/courses/`:

- `courses.models.ts` — `cuatrimestre: string`, `cantidadFechas: number`, `alumnosPresentes: number | null`, `certificaciones: number | null`; `CursosFiltros.conFechas?: boolean`.
- `in-memory-courses.service.ts` — derivación de cuatrimestre y `cantidadFechas` desde el seed; métricas en `null`; alta crea `cuatrimestre: 'Sin programar'`, `cantidadFechas: 0`.
- `courses-list-page.ts` — signals `q`/`estado`/`conFechas`; `recargar()` consume `CursosFiltros` completo; handlers `onConFechas`, `onLimpiarFiltros`, `onReintentar`; distinción `vacioTotal` vs `sinCoincidencias`; guard local de generación anti-race.
- `courses-list-page.html` — `<table>` accesible desktop, `<ul class="cards-mobile">` mobile, métricas con `—` + texto accesible, banners con `aria-busy`/`role="alert"`, `<p aria-live="polite">` para resumen, links `Ver detalle`/`Editar` con nombre accesible.
- `courses-list-page.css` — responsive con tokens existentes; tabla oculta `<md`, cards ocultas `≥md`; chips con `aria-pressed=true` diferenciado.
- `courses.service.spec.ts` (24 specs) y `courses-list-page.spec.ts` (13 specs) — derivación, filtros, placeholders, semántica, acciones y links.
- `__checks__/no-secrets.spec.ts` y `__checks__/no-real-data.spec.ts` — `CoursesListPage.prototype.recargar` y `onLimpiarFiltros` añadidos a `sources()`; cuatrimestres y datos ficticios institucionalmente seguros.

Límites explícitos (F4-03): sin backend real, HTTP, `X-Admin-Key`, storage/cookies/IndexedDB, sesión real, DNI completo administrativo, token completo, email, legajo, matrícula, UUID, dependencias nuevas, Tailwind, copia literal React/Next ni datos reales. Las acciones reales (alta persistida, eliminar curso, acoplar con `Asistencia`/`Certificacion`) quedan como handoff a F4-04 y ciclos posteriores.

Verificación (`sdd-verify`, lineage `review-fc99c946d72cec8e`):

- `rtk npm run test:ci` **485/485 SUCCESS** (13 page + 24 service + 448 resto).
- `rtk npm run build` exit 0 con **2 warnings de budget CSS preexistentes** (`certification-pdf-preview-page.css` 12,41 kB y `certification-preview-page.css` 14,31 kB, ambos < 16 kB error) — carry-forward de F4-01/F4-02, trade-off de paridad visual. F4-03 **no** introduce warnings nuevos.
- Focused page 13/13, focused service 24/24, suite completa, `git diff --check` exit 0.
- Runtime real con `ng serve`: desktop 1280×800 mostró tabla con 6 filas y cards ocultas; mobile 390×844 mostró 6 cards y tabla oculta; filtro sin coincidencias mostró mensaje diferenciado y `Limpiar filtros`; privacidad confirmada (sin DNI/email/token/UUID).
- Capturas en `openspec/changes/archive/2026-07-12-f4-03-courses-list/evidence/` (desktop 1280×800, mobile 390×844, loading, error, empty-total, no-results + `parity-notes.md`).

Fallo histórico y corrección (no ocultada):

- La primera corrida de `sdd-verify` terminó en **FAIL** porque dos `listar()` superpuestos podían resolverse en orden inverso y mostrar cursos stale, error o loading de una generación vieja.
- La corrección se aplicó con guard local de generación dentro de `CoursesListPage.recargar()` (contador que invalida respuestas previas en `try`, `catch` y `finally`), sin RxJS, sin cancelación ni abstracciones nuevas. R1–R3 verdes; suite 485/485, build exit 0, focused y `git diff --check` pasan.

Warnings carry-forward (no bloqueantes):

- Dos warnings de budget CSS preexistentes en preview/PDF de certificaciones, ajenos a `courses-list`.
- `requestAnimationFrame` heredado de F4-02 sin cancelación de handle al destruir el componente; follow-up previamente aprobado, sin falla runtime observada.

Handoff a F4-04: `Ver detalle` y `Editar` solo reusan rutas existentes. La evolución del detalle, los cambios persistentes en fechas y la integración con `Asistencia`/`Certificacion` llegan en F4-04 y ciclos posteriores. El `HeaderInstitucional` raíz en `/admin/*` (tech debt documentado en F2-03) sigue sin refactorizar; queda para un ciclo posterior.

Detalle en `docs/frontend/F4-03-listado-cursos-paridad-v0.md` y archive `openspec/changes/archive/2026-07-12-f4-03-courses-list/`.

### Estado F5-01 — Listado de certificaciones con paridad v0 (filtros, paginación, harness QA)

Ciclo `f5-01-certifications-list` sobre la base F2-06 (modelo y servicio en memoria) y F4-01/F4-02 (detalle y vista PDF imprimible mock-only). Evoluciona `CertificationsListPage` in-place para que `/admin/certificaciones` alcance paridad funcional y visual con `muestra_pagina/components/admin/lista-certificaciones.tsx`, sin nuevas rutas, dependencias, backend, HTTP, storage, cookies, IndexedDB ni `X-Admin-Key`. Mantiene `CERTIFICATIONS_SOURCE`/`InMemoryCertificationsService` y el seam `InMemory*` ya aprobado en F2-06; los handoffs F4-01/F4-02 (detalle y PDF imprimible) y F5-04/F6-01/F6-03 siguen deshabilitados con `aria-disabled="true"` salvo los CTAs de navegación ya habilitados.

Archivos modificados en `apps/frontend-angular/src/app/features/admin/certifications/`:

- `certifications.models.ts` — agrega `EnvioCertificacion` (`entregado`/`pendiente-entrega`/`requiere-nueva-entrega`), `numero` ficticio y `envio` en el modelo `Certificacion`. `documentMasked` sigue siendo el único documento visible; sin DNI completo, token completo, email, legajo, matrícula ni UUID.
- `in-memory-certifications.service.ts` — completa los 6 registros ficticios con `numero` y `envio`; sin red, sin storage, sin claves admin, sin datos reales.
- `pages/list/certifications-list-page.{ts,html,css,spec.ts}` — `signal`s de filtros (`validez`, `entrega`, `curso`, `busqueda`), `computed()` de resultados/conteos y `slice()` de 5; `onLimpiarFiltros` resetea y reinicia página; `onPagina()` acota con `paginaSegura()`; harness QA local no persistente (`datos|cargando|error|vacio-total`) habilitado mediante `isDevMode()` y seam inyectable para tests, ausente e inmutable en producción/staging; tabla desktop con `<caption>`, `<th scope="col">` y resumen `aria-live="polite"`; cards mobile con `<dl>`; skeleton de carga, alerta de error con reintento, vacío total y sin coincidencias diferenciados; links a detalle y PDF existentes conservados.
- `certifications.service.spec.ts` y `certifications-list-page.spec.ts` — cubren `numero`/`envio`, filtros combinables, búsqueda segura, paginación y clamp, los cuatro estados del harness, semántica de tabla/cards, links a detalle/PDF, race guard anti-stale y reset.
- `__checks__/no-secrets.spec.ts` y `__checks__/no-real-data.spec.ts` — endurecidos para incluir nuevos campos, métodos y DOM del listado en los checks negativos de seguridad y datos.

Límites explícitos (F5-01): sin backend real, HTTP, `X-Admin-Key`, storage/cookies/IndexedDB, sesión real, DNI completo administrativo, token completo, email, legajo, matrícula, UUID, dependencias nuevas, Tailwind, copia literal React/Next ni datos reales. No se modifican `app.routes.ts`, detalle, PDF, servicio, backend, configuración ni dependencias. Las acciones reales (emisión, entrega manual, revocación, listado real) y la persistencia de filtros/página siguen como handoff a F4-F6; el harness QA no persiste estado entre recargas ni expone la app a URL/storage, y `onVistaQA` ignora invocaciones cuando QA está deshabilitado.

Verificación (`sdd-verify`, receipt `review-ec94f4e582546bed`):

- `rtk npm run test:ci` **498/498 SUCCESS** (160/160 focused: `certifications.service.spec.ts` + `certifications-list-page.spec.ts` + `app.routes.spec.ts` + `no-real-data.spec.ts` + `no-secrets.spec.ts`).
- `rtk npm run build` exit 0 con **2 warnings de budget CSS preexistentes** (`certification-pdf-preview-page.css` 12,41 kB y `certification-preview-page.css` 14,31 kB) — carry-forward de F4-01/F4-02, ajenos a F5-01.
- Compliance: 2/2 requisitos (Listado mock-only con datos seguros; Harness y evidencia verificable del listado); 8/8 escenarios compliant; 0 CRITICAL, 0 blockers. **PASS**.
- Runtime real con `ng serve` + Playwright sobre `http://127.0.0.1:4200/certificados/admin/certificaciones`, sesión mock y viewports 1280×800 / 390×844: estado inicial `Total: 6 · Coincidencias: 6 · Visibles: 5` con tabla desktop; página 2 con una fila y botón siguiente deshabilitado; combinación `curso + vigente + Entregado + búsqueda Uno` → 1/1/1 con id 1 y reset a página 1; `Limpiar filtros` restaura 6/6/5 y página 1; harness QA fuerza carga con 5 skeletons, error con reintento, vacío total y sin coincidencias 6/0/0; mobile 390×844 muestra 5 cards con `<dl>`; navegación real desde cards a `/admin/certificaciones/1` y `/admin/certificaciones/1/pdf`; consola 0 errores / 0 warnings.
- Privacidad: sin DNI completo, email, UUID, prefijo de token visible ni solicitudes no estáticas/fetch/XHR.
- Capturas en `openspec/changes/archive/2026-07-13-f5-01-certifications-list/evidence/` (desktop 1280×800, mobile 390×844, loading, error, empty-total, no-results + `parity-notes.md`).
- `git diff --check`: limpio. `package.json`, lockfiles, `angular.json` y `.atl`: sin cambios tracked ni untracked.

Handoff a F4-F6: `Certificacion`/`EnvioCertificacion`/`numero` quedan listos para reuso; la integración con emisión, entrega, revocación y listado real llega en F5-04/F6-01/F6-03 y F5-04. El `HeaderInstitucional` raíz en `/admin/*` (tech debt documentado en F2-03) sigue sin refactorizar; queda para un ciclo posterior. El spec main `admin-certifications-frontend/spec.md` queda sincronizado con el delta de F5-01 (requisito `Listado mock-only con datos seguros` extendido a 6 escenarios y `Harness y evidencia verificable del listado` agregado).

Detalle en archive `openspec/changes/archive/2026-07-13-f5-01-certifications-list/` y archive report del ciclo.

### Estado F5-02 — Listado de alumnos con privacidad minimizada

Implementación aplicada en `frontend/students-list`; cerrado y archivado en `openspec/changes/archive/2026-07-13-f5-02-students-list/` (verify PASS 6/6, 14/14, suite 521/521, build exit 0). `/admin/alumnos` usa un seed local independiente con documento enmascarado y `tieneEmail` booleano, sin direcciones, legajo, documento completo, red ni storage. Incluye búsqueda segura, filtros combinables, paginación de cinco, tabla desktop, tarjetas mobile, estados accesibles, guard anti-race y QA limitado a desarrollo/tests. Sidebar y dashboard enlazan la ruta; el detalle permanece deshabilitado y sin `:id` hasta F5-03. Ver `docs/frontend/F5-02-listado-alumnos-paridad-v0.md`.

### Estado P5-02 — servicios HTTP del panel admin (HttpClient + toggle)

Capa de servicios HTTP que reemplaza los mocks en memoria del panel admin (`CoursesService`, `StudentsService`, `AttendanceService`, `CertificationsService`) y agrega `InstitutionalConfigService` nuevo. Cero cambios en UI, rutas, modelos consumidos por componentes o dependencias. Mocks (`InMemory*`, `AttendanceMockService`) y `InjectionToken` (`COURSES_SOURCE`, `STUDENTS_SOURCE`, `ATTENDANCE_SOURCE`, `CERTIFICATIONS_SOURCE`) quedan intactos como fallback.

Archivos nuevos (11):

- `apps/frontend-angular/src/app/features/admin/institutional-config/institutional-config.service.ts` — interfaz `InstitutionalConfigService` + token `INSTITUTIONAL_CONFIG_SOURCE`.
- `apps/frontend-angular/src/app/features/admin/institutional-config/http-institutional-config.service.ts` — `GET /admin/configuracion-institucional`; `institutionName` → `nombre`, `direccion` y `logoUrl` default `null`.
- `apps/frontend-angular/src/app/features/admin/students/http-students.service.ts` — `listar`/`contar` (GET `/admin/alumnos`), `obtener` (GET `/admin/alumnos/:id`); `apellidoNombre` se parte en el primer espacio; `ingreso` default `''`; 404 → `null`.
- `apps/frontend-angular/src/app/features/admin/certifications/http-certifications.service.ts` — `listar`/`contar` (GET `/admin/certificados`), `obtener`, `revocar` (POST `/admin/certificados/:id/revocar` con `{ reason }`); mapeos `certificateCode` → `numero`, `student.displayName` → `nombreAlumno`, `status` → `estado`; `envio` default `'pendiente-entrega'`.
- `apps/frontend-angular/src/app/features/admin/courses/http-courses.service.ts` — CRUD contra `/admin/cursos` y `/admin/cursos/:id/fechas`; `reemplazarFechas` orquesta GET → PATCH cancelada → PATCH existentes → POST nuevas → re-read; filtros `q`/`estado`/`conFechas` client-side; `cuatrimestre` default `'Sin programar'`.
- `apps/frontend-angular/src/app/features/admin/attendances/data/http-attendance.service.ts` — `listarAlumnos` (GET `/admin/alumnos`, filtra `activo`), `listarAsistencias` (GET `/admin/asistencias?cursoId=`, filtra `fechaId` client-side), `marcar` (DELETE existentes + POST presentes, all-or-nothing), `anular` (DELETE).

Archivo modificado:

- `apps/frontend-angular/src/app/app.routes.ts` — el toggle `environment.useRealApi` ahora selecciona HTTP o in-memory para los 4 tokens del panel admin, replicando el patrón M3-06 de `VALIDATION_SOURCE`. `INSTITUTIONAL_CONFIG_SOURCE` queda cableado directo a `HttpInstitutionalConfigService` porque no hay `InMemoryInstitutionalConfigService`.

Decisiones de diseño cerradas en archive (resueltas por ausencia de endpoint en backend):

| Decisión | Resolución | Razón |
|---|---|---|
| `cuatrimestre` default | `'Sin programar'` (string) | tipo `string` en `courses.models.ts` |
| `ingreso` default | `''` (string vacío) | tipo `string` en `students.models.ts` |
| `reemplazarFechas` estrategia de baja | PATCH `estado: 'cancelada'` | backend no expone DELETE de fechas |
| `listarAlumnos(cursoId)` filtro por curso | devuelve todos los activos, ignora `cursoId` | backend no tiene tabla curso-alumno |
| `revocar` body key | `reason` (no `motivo`) | contrato PHP usa clave en inglés |

Verificación: archive `openspec/changes/archive/2026-07-15-p5-02-frontend-http-angular/` — PASS WITH WARNINGS, 24/24 tareas, 7/7 requirements, 30/30 escenarios, suite 595/595 SUCCESS, `ng build` exit 0. Review 4R lineage `review-8cecf76c4d5a4f4d` aprobada con `risk_level: high` y 12 findings WARNING clasificadas `info` (sin CRITICAL). Las 5 advertencias W1–W4/S1–S2 del verify-report ya quedaron reflejadas en la spec canónica `openspec/specs/frontend-http-services/spec.md`. Spec canónica con 8 requirements y 30 escenarios. Detalle completo en `openspec/changes/archive/2026-07-15-p5-02-frontend-http-angular/design.md` y `verify-report.md`.

Límites explícitos (P5-02): sin cambios de UI, rutas, modelos consumidos, mocks, `InjectionToken`, backend, deploy, base de datos, `.htaccess`, material privado, sesión real más allá del toggle, DNI completo administrativo, tokens completos, emails, matrículas, credenciales demo, Tailwind, dependencias nuevas ni copia literal de React/Next. La activación real contra la API PHP queda en manos de cada operador local (toggle `useRealApi: true` en `environment.development.ts` solo para smoke).

### Checkpoint M3-06 — integración Angular/API local

Conmutación local mock/API real sin reescribir la pantalla pública:

- `environment.ts` (prod) y `environment.development.ts` (dev) exponen `useRealApi: false` + `apiBaseUrl: '/certificados/api'`. El modo real queda **desactivado por defecto** en ambos entornos; en dev se activa a mano (toggle local, no commitear `true`) para el smoke.
- `app.config.ts` selecciona `HttpValidationSource` cuando `useRealApi: true`, `MockValidationSource` cuando `false`.
- `http-validation.source.ts` construye la URL como `${apiBaseUrl}/certificados/{encodeURIComponent(token)}/verificacion` (frontera única mock/real).
- `proxy.conf.json` reenvía `/certificados/api` → `http://127.0.0.1:8080` durante `ng serve` (`angular.json` `serve.options.proxyConfig`). **No** se habilita CORS/preflight en el backend por defecto (spec: "Preflight no requerido").
- Separación `base href /certificados/` (rutas Angular) vs `apiBaseUrl` (endpoint API): `baseHref` nunca se usa para resolver la URL de la API en `ng serve`.

Smoke local documentado (no ejecutado en este turno — PHP CLI no instalado localmente):

1. Levantar API PHP local en `:8080` (`bash scripts/m3-06-smoke.sh` resuelve `php` CLI primero y, si no está, cae a la imagen Docker local `ifts14-php84`; prueba las rutas `/certificados/api/health` y `/certificados/api/certificados/{token}/verificacion`, valida el JSON de respuesta, usa token ficticio BIEN formado de 32+ chars → 404 `CERTIFICATE_NOT_FOUND` controlado cuando no hay certificado sembrado; 400, 404 genérico y 500 = FAIL conforme a spec). **Falta de `php` CLI ya no es un hard blocker si la imagen Docker está disponible.**
2. En `environment.development.ts`, pasar `useRealApi: true` (solo local).
3. `ng serve` (proxy.conf.json activo) → abrir `http://localhost:4200/certificados/validar/<token-ficticio>`.
4. Capturar evidencia con tokens ficticios; sin datos reales.
5. Revertir `useRealApi` a `false`.

Evidencia de verificación de este turno (sin PHP CLI): `npm test --watch=false` 74/74 SUCCESS (incluye los casos de `apiBaseUrl`, `app.config` y alineación D0), `npm run build` verde (253.46 kB initial / 72.04 kB transfer, dentro de presupuestos). Smoke `scripts/m3-06-smoke.sh`: sin `php` CLI pero con la imagen `ifts14-php84` disponible, el fallback Docker levanta la API (ver `docs/backend/01-contrato-api-certificados.md`); end-to-end real requiere DB demo sembrada.

### Estructura técnica

`angular.json`: `baseHref: "/certificados/"` en `production` y `development` (presupuestos 500 kB warn / 1 MB error), `index` explícito y salida plana para cPanel. `environments/environment{,.development}.ts`: ambos exponen `useRealApi: false` (mock por defecto) + `apiBaseUrl: '/certificados/api'`; en dev, `useRealApi: true` es un toggle local manual para smoke. `app.config.ts`: `provideRouter` + `withComponentInputBinding` + `provideHttpClient()` + `VALIDATION_SOURCE` seleccionado por `environment.useRealApi` (`true` → `HttpValidationSource`, `false` → `MockValidationSource`). `app.routes.ts`: `''` carga landing sin validación, `validar/:tokenCertificacion` carga la validación pública, `**` carga página no encontrada sin validar tokens. `app.ts`: shell `header[role=banner]` / `main#contenido` / `footer` con skip link.

### Shared certificates

`dto.ts` (DTOs D0 del contrato PHP: `documentNumber` + `attendedDates`; legado `documentMasked` tolerado en mapper), `validation-source.ts` (interfaz + InjectionToken, frontera reemplazable), `mock-tokens.ts` (`MockValidationSource` + tokens `demo-valido|revocado|expirado|inexistente|error-tecnico`; fixture D0 `VALID_VALID_DTO` y legado `LEGACY_VALID_DTO`), `http-validation.source.ts` (`HttpValidationSource` con `HttpClient`, URL `${environment.apiBaseUrl}/certificados/{encodeURIComponent(token)}/verificacion`; usa suscripción cancelable vía `AbortSignal` en vez de `firstValueFrom`), `result-mapper.ts` (validación D0: `documentNumber` exige `attendedDates` no vacío; legado `documentMasked` sin fechas; 404/revocado/expirado/inexistente → `not-verifiable`; 5xx/red/JSON → `technical-error`), `validation.service.ts` (`verify(token)` consume `VALIDATION_SOURCE`; sin cambios al swap).

> **Contrato D0 alineado (ciclo `m4-01b-angular-dto-d0-alignment`).** `dto.ts`, `result-mapper.ts`, template público y tests consumen `documentNumber` + `attendedDates` para certificados emitidos desde el modelo curso/alumno. Certificados legados sin FK siguen mostrando `documentMasked`. Con `useRealApi: true`, un `200` del backend ya no colapsa a `technical-error` por shape obsoleto.

### Límites de UI final

Base técnica, no diseño visual final. Diseño visual corresponde a Matías (F1-01/F1-02). Admin, PDF, QR, entrega manual y configuración institucional quedan fuera de este ciclo.

## Checkpoint M3-06 final — smoke Angular/API

Cierre documental post-merge del ciclo `m3-06-final-angular-api-smoke`. Verifica que la frontera pública Angular puede consumir la API PHP local con datos ficticios, sin deploy ni cambios de producto. No rotó token/QR, no activó email/SMTP/PHPMailer, no deployó ni tocó `public_html`.

### Checklist Angular/API (D0)

| Ítem | Estado |
|---|---|
| Conmutación mock/API real vía `environment.useRealApi` | OK: `false` por defecto en prod y dev; toggle local manual en dev. |
| `app.config.ts` selecciona `HttpValidationSource`/`MockValidationSource` | OK: frontera única, sin reescribir la pantalla pública. |
| `http-validation.source.ts` URL `${apiBaseUrl}/certificados/{encodeURIComponent(token)}/verificacion` | OK: coincide con el contrato backend. |
| `proxy.conf.json` reenvía `/certificados/api` → `127.0.0.1:8080` en `ng serve` | OK: no se habilita CORS/preflight en backend productivo. |
| DTO público D0: `documentNumber` + `attendedDates`; legado `documentMasked` fallback | OK: `dto.ts` y `result-mapper.ts` alineados con backend. |
| 404 `CERTIFICATE_NOT_FOUND` → estado no verificable (no error técnico) | OK: `result-mapper.ts` colapsa 404/revocado/expirado/inexistente a `not-verifiable`. |
| 5xx/red/JSON inválido → error técnico genérico | OK: sin revelar infraestructura. |
| UI pública no pide DNI como input de búsqueda pública | OK: solo lee token desde la ruta. |
| QR/token permanente sin rotación normal | OK: no hay lógica de rotación en el frontend. |
| Clave admin temporal no llega al bundle Angular público | OK: admin queda fuera del bundle público; 0 matches del literal en `apps/frontend-angular/src`. |

### Comandos Angular reproducibles

```bash
# Tests unitarios (Karma + ChromeHeadless)
cd apps/frontend-angular && npm test -- --watch=false --browsers=ChromeHeadless

# Build producción con base href /certificados/
cd apps/frontend-angular && npm run build
```

### Evidencia de verificación M3-06 final

| Verificación | Resultado | Entorno |
|---|---|---|
| `npm test --watch=false` | **74/74 SUCCESS** (0.148 s) | Node 24.18.0, npm 11.16.0, Chrome Headless 149. |
| `npm run build` | **Verde**: 253.46 kB initial / 72.04 kB transfer; lazy `public-validation-page` 5.18 kB. Base href `/certificados/`. | Angular CLI 20.3.30, presupuesto 500 kB warn / 1 MB error. |
| Backend unit (Docker) | **6/6 OK** (6 scripts ejecutados): AuthGate, NormalizePath, EntregaManual, AdminCertificateService, HttpContract, PdfResilience. | `ifts14-php84` (PHP 8.4-cli + gd/pdo_mysql/mbstring/xml/zip), mismo Dockerfile que CI. |
| Backend E2E (Docker + MariaDB 10.6) | **4/4 OK**: SnapshotEmission, HttpEmissionE2e, AdminMasterDataHttp, AdminCertificadosConsultaHttp. | Red Docker `m3-06-net`, MariaDB `mariadb:10.6`, DSN `host=m3-06-mariadb`. Reproduce `.github/workflows/backend-tests.yml`. |
| Smoke `scripts/m3-06-smoke.sh` | **BLOCKED** localmente: `php` CLI no instalado en PATH y el script aún no tenía fallback Docker (evidencia del ciclo `m3-06-final-angular-api-smoke`). El ciclo `m3-06-warning-cleanup` agregó fallback Docker; ver `docs/backend/01-contrato-api-certificados.md`. | Evidencia alternativa: backend Docker + CI. |

### Estado smoke/manual Angular→PHP

`scripts/m3-06-smoke.sh` resuelve PHP al inicio: prefiere `php` CLI en PATH; si no está, cae a la imagen Docker local `ifts14-php84`; si ninguna está, sale `2` (BLOCKED). **Falta de `php` CLI ya no es un hard blocker si la imagen Docker está disponible.** Requiere además curl y MariaDB/MySQL ficticia en `127.0.0.1` para end-to-end real.

- Evidencia ciclo `m3-06-final-angular-api-smoke` (histórico): host sin `php` CLI y script sin fallback Docker → smoke **BLOCKED** (exit 2). Evidencia reproducible alternativa: backend unit + E2E vía Docker (`ifts14-php84` + `mariadb:10.6`) que replica `.github/workflows/backend-tests.yml`, más `npm test`/`npm run build` Angular.
- Evidencia ciclo `m3-06-warning-cleanup` (actual): con `php` CLI ausente e imagen `ifts14-php84` presente, el fallback Docker levantó la API, `/health` dio 200 y el `trap` limpió el contenedor; la verificación con token ficticio respondió 500 por DB demo ausente → smoke exit 1 esperado del entorno (no regresión). End-to-end real requiere DB demo sembrada con credenciales ficticias válidas.

El flujo manual Angular→PHP vía `proxy.conf.json` (`environment.development.ts` con `useRealApi: true` local, `ng serve`) se documenta como paso operativo futuro; no usa datos reales.

## Contrato API esperado

Cuando exista integración real:

- ruta pública conceptual: `/certificados/validar/:tokenCertificacion`;
- endpoint esperado: `/certificados/api/certificados/{token}/verificacion`;
- `404 CERTIFICATE_NOT_FOUND` se muestra como certificado no verificable, no como error técnico;
- la UI pública muestra DNI completo por decisión institucional (D0) y fechas asistidas (`attendedDates`);
- la UI pública no debe pedir DNI como input de búsqueda pública;
- QR/token permanente: pantallas de entrega manual indican "mismo QR", no rotación;
- los modelos TypeScript futuros deben respetar `docs/backend/01-contrato-api-certificados.md`.

## Ver también

- [F4-04 — Detalle de curso con paridad v0](./F4-04-detalle-curso-paridad-v0.md) — ficha, tabla desktop, tarjetas mobile y métricas opcionales de asistencia; evidencia de desktop, mobile, vacío, cancelada y realizadas con acción `Ver`.
- [Reporte de QA manual F3-04](./03-qa-manual-f3-04.md) — checklist transversal de build, responsive, teclado/foco, contraste, estados, consola y datos sensibles. Estado BLOCKED hasta ejecutar QA manual y checks automáticos; F3-05 no satisface esos pendientes por sí solo.
- [Verificación de build F3-05](./04-build-validacion-f3-05.md) — build de producción con `base-href /certificados/`, artefactos generados, tamaños, warnings y pendientes.

## Cierre P5-03 — Environments

El ciclo `p5-03-environments` (archive `openspec/changes/archive/2026-07-15-p5-03-environments/`) corrigió el estado por defecto del entorno de build:

- `apps/frontend-angular/src/environments/environment.ts` ahora expone `useRealApi: true` (producción usa API real).
- `apps/frontend-angular/src/environments/environment.development.ts` sigue en `useRealApi: false` (desarrollo usa mocks).
- `apps/frontend-angular/src/environments/environment.staging.ts` mantiene `useRealApi: true` y `apiBaseUrl: '/certificados_staging/api'`.
- Se agregó `apps/frontend-angular/src/environments/environment.guard.spec.ts` como guarda de CI: el test falla con `exit ≠ 0` si `environment.useRealApi !== true`.

Las menciones anteriores en este documento (sección "Checkpoint M3-06" y "Estructura técnica") describían `useRealApi: false` en `environment.ts`; esa descripción corresponde al estado previo a P5-03. La spec canónica vigente es `openspec/specs/frontend-environments/spec.md` y la verificación quedó en `verify-report.md` del archive: 6/6 requirements y 597/597 tests en verde.

## Cierre P5-04 — Login Angular real

El ciclo `p5-04-login-angular-real` (archive `openspec/changes/archive/2026-07-15-p5-04-login-angular-real/`) reemplazó la sesión mock del panel admin por autenticación real contra la API PHP:

- Se eliminó `apps/frontend-angular/src/app/features/admin/mock-session.ts` y su test. La pieza `InMemoryMockSession` ya no existe en el árbol frontend.
- Nuevo `AdminAuthService` (`apps/frontend-angular/src/app/features/admin/admin-auth.service.ts`) expone `login(creds)`, `session()` y `logout()` sobre `HttpClient` con paths relativos a `apiBaseUrl`. El `csrfToken` se mantiene como `Signal<string|null>` y nunca se persiste en `localStorage` ni `sessionStorage`.
- Nuevo `csrf.interceptor.ts` (`apps/frontend-angular/src/app/core/interceptors/csrf.interceptor.ts`) inyecta `X-CSRF-Token` solo en requests mutantes (POST/PUT/PATCH/DELETE) y limpia sesión + redirige a `/admin/login` ante 401.
- `app.config.ts` ahora registra `provideHttpClient(withInterceptors([csrfInterceptor]))` y expone el `InjectionToken ADMIN_AUTH` en lugar del viejo `MOCK_SESSION`.
- `LoginPage` hace POST real a `/admin/auth/login`, maneja 401/429 con mensajes genéricos y limpia el campo `password` antes de navegar a `/admin/dashboard`.
- `adminGuard` consulta `GET /admin/auth/session` de forma asíncrona y redirige a `/admin/login` cuando la respuesta es negativa o hay error de red.
- `AdminShell` ejecuta POST real de logout y limpia estado local antes de navegar a `/admin/login`.

Archivos: 21 cambios totales — 3 nuevos (`admin-auth.service.ts`, `csrf.interceptor.ts`, `admin-auth.service.spec.ts`), 16 modificados (rutas, `app.config`, login/admin/shell y sus tests) y 2 eliminados (`mock-session.ts`, `mock-session.spec.ts`).

Verificación: archive `openspec/changes/archive/2026-07-15-p5-04-login-angular-real/verify-report.md` — **PASS** 8/8 requirements, 605/605 tests SUCCESS en Karma + ChromeHeadless, 0 blockers y 1 warning LOW (W1: `withCredentials` aplicado vía `req.clone({ withCredentials: true })` en el interceptor porque `withCredentials()` no es export de Angular 20; funcionalmente equivalente). `X-Admin-Key` no aparece en el bundle productivo y la contraseña no se retiene en memoria más allá del request HTTP.

Spec canónica nueva: `openspec/specs/admin-angular-auth/spec.md` con 8 requirements y 8 escenarios Given/When/Then (login con credenciales reales, sesión vía cookie HttpOnly, guard verifica sesión real, logout real, CSRF en mutantes, 401 redirige a login, sin X-Admin-Key en bundle y sin credenciales en memoria).

Límites explícitos (P5-04): no cambia backend PHP, no agrega roles ni recuperación de contraseña, no toca configuración CORS/cookies del cPanel (responsabilidad de infraestructura), no modifica mocks públicos de validación ni rutas de la landing pública. QA manual de login (refresh, pestaña nueva, logout, back button, expiración, cookies en DevTools) queda como ALTO-C pendiente de ejecución humana; el corte del ciclo no incluye esa corrida.

## Cierre P6-01 — Entrega manual funcional

El ciclo `p6-01-entrega-manual-funcional` (archive `openspec/changes/archive/2026-07-15-p6-01-entrega-manual-funcional/`) conectó la página de entrega manual con los endpoints backend existentes y eliminó el comportamiento mock-only de Bedelía:

- `certifications.models.ts` agrega `EntregaManualDto` con `certificadoId`, `publicValidationUrl`, `pdfDownloadUrl`, `tokenPrefix`, `pdfAvailable` y `pdfStatus`.
- `CertificationsService` expone `obtenerEntregaManual(id): Promise<EntregaManualDto>` y se implementa en `http-certifications.service.ts` (`GET /admin/certificados/{id}/entrega-manual`) e `in-memory-certifications.service.ts` (mock con `pdfStatus` sample).
- `CertificationDeliveryPage` consume el endpoint real: muestra `publicValidationUrl` desde el DTO (sin host hardcodeado), descarga el QR PNG con `fetch` + `Blob` + `URL.createObjectURL` y filename semántico `{codigo}-qr.png`, y aplica fallback de clipboard con `navigator.clipboard.writeText` y `document.execCommand('copy')` sobre un `textarea` temporal.
- Detección de PDF `outdated`: cuando `pdfStatus === 'outdated'` se muestra un alert y el botón "Volver a generar PDF" (MVP: mensaje informativo; la regeneración real del PDF queda como handoff P6-02).
- `CertificationPreviewPage` quita `disabled` y `aria-disabled` del botón "Entrega manual" y navega a `/admin/certificaciones/:id/entrega` vía `routerLink`.
- Foco y escape: el handler de Escape existente se preserva; el cambio cumple REQ-DEL-007 sin regresiones.

Archivos: 8 cambios totales — 7 modificados (`certifications.models.ts`, `certifications.service.ts`, `http-certifications.service.ts`, `in-memory-certifications.service.ts`, `certification-delivery-page.{ts,html,css}`) y 1 spec reescrito (`certification-delivery-page.spec.ts`). Además 7 tests modificados o ampliados (`certification-preview-page.spec.ts`, `http-certifications.service.spec.ts`, `certifications.service.spec.ts`, `app.routes.spec.ts`, `admin-dashboard-page.spec.ts`, `certification-pdf-preview-page.spec.ts`, `certifications-list-page.spec.ts`).

Verificación: archive `openspec/changes/archive/2026-07-15-p6-01-entrega-manual-funcional/verify-report.md` — **PASS** 7/7 requirements (REQ-DEL-001 a REQ-DEL-007), 617/617 tests SUCCESS en Karma + ChromeHeadless, 0 blockers y 0 warnings. `npm run test:ci` exit `0`.

Spec canónica nueva: `openspec/specs/admin-certificate-delivery-frontend/spec.md` con 7 requirements y 7 escenarios Given/When/Then (URL canónica desde backend, descarga QR Blob con filename semántico, fallback de clipboard, detección de PDF `outdated`, botón "Volver a generar", botón "Entrega manual" habilitado en preview y foco/escape en diálogos).

Límites explícitos (P6-01): no agrega endpoint backend nuevo (se reutilizan `entrega-manual`, `qr.png` y `pdf`), no introduce envío automático por email (P6-02), no implementa regeneración real de PDF (MVP: mensaje), no toca configuración CORS/cookies del cPanel, no modifica mocks públicos de validación ni rutas de la landing pública. La regeneración real del PDF y el envío automático tras regeneración siguen como handoff P6-02.

## Cierre P6-02 — Reenvío automático (MVP, regeneración real de PDF)

El ciclo `p6-02-reenvio-automatico` (archive `openspec/changes/archive/2026-07-15-p6-02-reenvio-automatico/`) convirtió el botón "Regenerar PDF" del preview en una llamada real al backend y dejó el envío automático por email como handoff fuera de alcance (D1-14):

- `certifications.models.ts` agrega `RegenerarPdfResult` con `regenerado`, `mensaje?`, `publicValidationUrl?`, `pdfDownloadUrl?` y `pdfStatus?` (`vigente` cuando se regeneró, mensaje en otro caso).
- `CertificationsService` expone `regenerarPdf(id): Promise<RegenerarPdfResult>`; `http-certifications.service.ts` lo implementa como `POST /admin/certificados/{id}/regenerar-pdf` e `in-memory-certifications.service.ts` lo simula con el mismo shape para que los tests de componentes no dependan del backend real.
- `CertificationPreviewPage.onRegenerarPdf()` reemplaza el `routerLink` por una llamada HTTP con `loading`, `error` y `resultado` reactivos; el botón muestra estado de carga y al finalizar renderiza los datos de entrega (`publicValidationUrl`, `pdfDownloadUrl`, `pdfStatus`) usando el mismo bloque visual de la página de entrega manual. Si el PDF ya estaba vigente, el backend responde `{ regenerado: false, mensaje: "El PDF ya está actualizado" }` y la UI lo muestra sin error.
- `AdminCertificateService::regenerarPdf()` regenera el PDF con `CertificatePdfService` reutilizando el mismo token (D1-15, sin rotación), marca `pdf_estado='vigente'`, actualiza `pdf_generado_revision` y registra `accion='pdf_regenerado'` en auditoría.
- Backend test nuevo: `apps/backend-php/tests/RegenerarPdfTest.php` cubre 5 escenarios (certificado inexistente, certificado emitido, PDF vigente no regenera, PDF desactualizado regenera, auditoría). No ejecutable en el entorno local por ausencia de PHP 8.4.21 con TCPDF (W1); debe correrse en CI o en el entorno de staging.

Archivos: 14 cambios totales — 3 backend (`index.php`, `AdminCertificateService.php`, `RegenerarPdfTest.php` nuevo) y 11 frontend (`certifications.models.ts`, `certifications.service.ts`, `http-certifications.service.ts`, `in-memory-certifications.service.ts`, `certification-preview-page.{ts,html,css}`, `certification-preview-page.spec.ts`, `admin-dashboard-page.spec.ts`, `certifications-list-page.spec.ts`, `certification-pdf-preview-page.spec.ts`).

Verificación: archive `openspec/changes/archive/2026-07-15-p6-02-reenvio-automatico/verify-report.md` — **PASS** 4/4 requirements (REQ-REGEN-001 a REQ-REGEN-004), 621/621 tests SUCCESS en Karma + ChromeHeadless (`npm run test:ci` exit `0`), 0 blockers y 1 warning (W1 backend test no ejecutable sin PHP local).

Spec canónica nueva: `openspec/specs/pdf-regeneration/spec.md` con 4 requirements y 4 escenarios Given/When/Then (regenerar PDF con mismo token, rechazar PDF vigente con `regenerado: false`, botón en preview que dispara el endpoint con loading/resultado y auditoría `pdf_regenerado`).

Límites explícitos (P6-02): no introduce envío automático por email (D1-14, sigue fuera del MVP), no rota token/QR (D1-15), no agrega dependencias nuevas, no toca configuración CORS/cookies del cPanel, no modifica mocks públicos de validación ni rutas de la landing pública. El warning W1 queda como ALTO-B pendiente: ejecutar `RegenerarPdfTest.php` en CI con PHP 8.4.21 + TCPDF antes de promover el cierre a `DONE WITH WARNINGS` formal.

## Cierre P6-03 — Eliminar estados no sustentados

El ciclo `p6-03-estados-no-sustentados` (archive `openspec/changes/archive/2026-07-15-p6-03-estados-no-sustentados/`) eliminó de la UI activa los estados de entrega sin persistencia real y el copy legal sin aprobación institucional:

- `certifications.models.ts`: `TipoEnvio` y el campo `envio: TipoEnvio` en `Certificacion` se retiran; `envio` también sale de `CertificacionesFiltros`. `http-certifications.service.ts` deja de inyectar `envio: 'pendiente-entrega'` por defecto.
- `in-memory-certifications.service.ts`: el seed deja de incluir `envio` en los 6 registros ficticios; los specs que dependían de ese campo se ajustan.
- `certifications-list-page.{ts,html}`: el array `envios`, la signal `envio`, los chips de filtro por entrega, la columna "Entrega" de la tabla y el helper `etiquetaEnvio()` se eliminan; los tests del listado (`certifications-list-page.spec.ts`, `admin-dashboard-page.spec.ts`) cubren ahora la nueva forma sin estado de entrega.
- `certification-preview-page.html` y `certification-pdf-preview-page.{ts,html}`: se suprimen los textos "firma digital verificada", "validez legal" y "validez legal y académica"; el copy de autoridad firmante y la nota de validez genérica los reemplazan sin claims legales.
- Tests: ajustes en `certifications.service.spec.ts`, `http-certifications.service.spec.ts`, `in-memory-certifications.service.spec.ts`, `certifications-list-page.spec.ts`, `certification-preview-page.spec.ts` y `certification-pdf-preview-page.spec.ts` para reflejar el modelo y el copy limpios.

Verificación: archive `openspec/changes/archive/2026-07-15-p6-03-estados-no-sustentados/verify-report.md` — **PASS** 4/4 requirements (REQ-CLEAN-001 a REQ-CLEAN-004), 619/619 tests SUCCESS en Karma + ChromeHeadless (`npm run test:ci` exit `0`), TypeScript compila limpio, `grep` 0 matches residuales de `TipoEnvio`, `envio`, `firma digital verificada` o `validez legal` en el código activo.

Spec canónica nueva: `openspec/specs/ui-cleanup/spec.md` con 4 requirements y 4 escenarios Given/When/Then (modelo sin `TipoEnvio`/`envio`, listado sin chips ni columna "Entrega", sin "firma digital verificada" en preview/PDF preview, sin "validez legal" en preview/PDF preview).

Límites explícitos (P6-03): no reemplaza los estados eliminados con otros nuevos (eso es rediseño, queda como handoff), no cambia el backend, no rota token/QR, no agrega dependencias, no toca la landing pública ni los mocks de validación, mantiene la paridad visual con `muestra_pagina/` (la referencia v0 ya no exponía esos estados en su diseño final). Próximo ciclo: P6-04 (validación pública refinada).

## Cierre P6-04 — Validación pública refinada

El ciclo `p6-04-validacion-publica-refinada` (archive `openspec/changes/archive/2026-07-15-p6-04-validacion-publica-refinada/`) refinó la página pública de validación (`/certificados/validar/:tokenCertificacion`) para alcanzar paridad visual con `muestra_pagina/`:

- `public-validation-page.html`: layout grid folio de 2 columnas (principal + sidebar), header con membrete "IFTS N.° 14 — Bedelía", secciones de datos completos (folio, alumno, DNI completo, curso, código de certificado, fecha de emisión, tabla de fechas asistidas) y sidebar con folio, timestamp de consulta del cliente y sello oficial decorativo marcado `aria-hidden`. Los estados `not-verifiable` y `technical-error` ahora muestran la banda de estado más un cuerpo editorial explicativo.
- `public-validation-page.css`: grid layout, estilos del sidebar, tipografía institucional, colores de la paleta v0 y responsive (mobile: sidebar apilado debajo del contenido principal).
- `public-validation-page.ts`: timestamp de consulta generado en cliente y bindings adaptados al nuevo template. No dibuja QR decorativo.
- `public-validation-page.spec.ts`: assertions DOM actualizadas para cubrir la nueva estructura (folio, datos, tabla, sidebar con sello, membrete, responsive stack, cuerpo editorial en estados no válidos, ausencia de QR).

Verificación: archive `openspec/changes/archive/2026-07-15-p6-04-validacion-publica-refinada/verify-report.md` — **PASS** 6/6 requirements (REQ-VAL-001 a REQ-VAL-006), 626/626 tests SUCCESS en Karma + ChromeHeadless (`npm run test:ci` exit `0`), TypeScript compila limpio.

Spec canónica ampliada: `openspec/specs/frontend-public-validation/spec.md` agrega 4 nuevos requirements al capability existente (folio con sidebar, membrete IFTS 14, cuerpo editorial en estados no válidos, sin QR decorativo) preservando los scenarios originales de la pantalla pública.

Límites explícitos (P6-04): no cambia el backend, no rota token/QR, no agrega dependencias, no introduce QR decorativo falso, no toca la UI admin, no agrega diferenciación pública entre revocado/vencido/inexistente (sigue como `not-verifiable` único, D1-03), no modifica la ruta ni el token. Próximo ciclo: P6-05 (CSS y accesibilidad).

## Cierre P6-05 — CSS y accesibilidad

El ciclo `p6-05-css-accesibilidad` (archive `openspec/changes/archive/2026-07-15-p6-05-css-accesibilidad/`) aplicó un polish de CSS y accesibilidad sobre la UI activa de admin y validación pública, manteniendo paridad visual con `muestra_pagina/` y sin nuevas dependencias. 10 fixes quirúrgicos de 1–5 líneas cada uno:

- `styles.css`: declaración de custom properties faltantes en `:root` (`--color-secondary`, `--color-accent`, `--color-primary-foreground`, `--radius-xl`) y exclusión de `.focus-visible` del reset de animaciones para que el indicador de foco siga visible cuando el usuario activa `prefers-reduced-motion`.
- `certification-delivery-page.css`: corrección de la media query `prefers-reduced-motion` (`prefers-reduced-motion: reduce`) y eliminación del `box-shadow` duplicado en `.btn:focus-visible`.
- `certification-revoke-page.html` / `.css`: movimiento del `z-index: 60` inline del botón de revocación a la clase CSS `.dialog-card` con z-index consistente, evitando solapamientos con el dialog overlay.
- `certification-revoke-page.ts` / `certification-delivery-page.ts`: focus trap de teclado (Tab / Shift+Tab) dentro de los diálogos para mantener el foco en su contenido cerrable.
- `admin-shell.html`: atributo `inert` en `.content` cuando `menuAbierto()` está activo, dejando el contenido fuera del tab order y de lectores de pantalla mientras el drawer mobile está abierto.
- `public-validation-page.css`: `overflow-x: auto` en la tabla de fechas para que la lista de muchas fechas no rompa el layout en mobile.
- `certifications-list-page.css`: reformateo del CSS minificado con saltos de línea para que el diff futuro sea legible.

Verificación: archive `openspec/changes/archive/2026-07-15-p6-05-css-accesibilidad/verify-report.md` — **PASS**, 0 blockers y 0 warnings, 626/626 tests SUCCESS en Karma + ChromeHeadless (`npm run test:ci` exit `0`), TypeScript compila limpio.

P6 cierra con 5/5 ciclos archivados (P6-01 a P6-05). Este ciclo no introdujo delta de spec canónica nueva: los cambios son mejoras de implementación que no alteran el contrato observable de las specs existentes (`frontend-public-validation`, `admin-certificate-delivery-frontend`, `admin-certificate-revocation`, `frontend-angular-shell`).

Límites explícitos (P6-05): no agrega dependencias nuevas, no rota token/QR, no cambia el backend, no introduce un sistema de diseño distinto del vigente, no modifica la ruta ni el token, no toca la lógica de los flujos 4–22, no agrega diferenciación pública entre estados (D1-03), no reescribe `muestra_pagina/`. Próximo ciclo: P7-01 (CI frontend).
- [Handoff a Marcos — F3-06](./05-handoff-marcos-f3-06.md) — reporte de handoff final de Fase 3 a Marcos con F3-04/F3-05 y roadmap F4-F6.
