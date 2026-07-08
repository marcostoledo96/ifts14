# Exploration: F2-04 — Cursos y fechas

## Goal

F2-04 es el segundo ciclo de Fase 2 dedicado al panel administrativo, según `MATIAS_PROMPTS_SDD_3_SEMANAS_CICLOS_GIT.md` (líneas 901-946) y la spec archivada `admin-foundation` (líneas 80-94) que dejó como handoff explícito: **"F2-04..F2-06 agregan funcionalidad administrativa. Cuando consultan la documentación F2-03, DEBEN encontrar rutas, shell, sesión mock y límites vigentes como base de integración"**. Su objetivo es **preparar UI administrativa para listar, detallar y crear/editar cursos y sus fechas**, usando modelos/mocks de frontend hasta que exista integración real, sin auth real ni exposición de `X-Admin-Key` en bundle.

Rama: `frontend/admin-courses-dates` (limpia desde `main` actualizado con PR #34 que mergeó F2-03). Modo SDD: artifact store `hybrid` (OpenSpec + Engram), chained-PR `single-pr-default`, review budget 1500.

## Scope (in / out)

### Incluido

- **Activación del ítem `Cursos` en `SidebarAdmin`**: cambiar `route: null` → `route: '/admin/cursos'` (definido en `features/admin/sidebar-admin.ts:17`), sin reordenar los otros 4 ítems (que siguen como placeholder). El activador pasa de "botón deshabilitado" a `<a [routerLink]>` con `aria-current="page"`.
- **Migración de `AdminShell` a child routes**: el `admin-shell.html` actual renderiza `<app-admin-dashboard-page />` inline (línea 40 de `features/admin/admin-shell.html`). Con F2-04+ ya hay 2+ páginas admin; el comentario en `admin-shell.ts:9-10` lo anticipa: "F2-04..F2-06 migrarán a rutas hijas con `<router-outlet>`". Reemplazar la línea 40 por `<router-outlet />` y mover `AdminDashboardPage` a una ruta hija `/admin/dashboard` con `loadComponent`. Esto preserva el dashboard placeholder y abre la puerta a las páginas de cursos sin duplicar shell.
- **Rutas admin hijas** (en `app.routes.ts` o en un nuevo `features/admin/admin.routes.ts` con `RouterModule.forChild`):
  - `/admin/login` (existente, intacto).
  - `/admin` → `redirectTo: '/admin/dashboard'` (existente, intacto).
  - `/admin/dashboard` → `AdminDashboardPage` (protegido por `adminGuard`, antes inline, ahora ruta hija).
  - `/admin/cursos` → `CursosListPage` (protegido por `adminGuard`, lazy `loadComponent`).
  - `/admin/cursos/nuevo` → `CursoEditorPage` con `modo='nuevo'` (protegido, lazy).
  - `/admin/cursos/:id` → `CursoDetallePage` (protegido, lazy).
  - `/admin/cursos/:id/editar` → `CursoEditorPage` con `modo='editar'` y route param `id` (protegido, lazy).
  - Catch-all admin `/admin` `pathMatch: 'prefix'` → `/admin/dashboard` (existente, intacto).
- **Modelos TypeScript** tipados contra el contrato backend `admin-master-data-api` (`openspec/specs/admin-master-data-api/spec.md` líneas 9-67) y `docs/backend/01-contrato-api-certificados.md` líneas 110-126. Crear `features/admin/courses/courses.model.ts` con:
  - `EstadoCurso = 'activo' | 'inactivo'`.
  - `Curso` (DTO administrativo): `{ id: number; codigo: string; nombre: string; estado: EstadoCurso; createdAt: string; updatedAt: string }`.
  - `CursoDetalle` extiende `Curso` con: `fechas: CursoFecha[]` y contadores `alumnosPresentes: number`, `certificaciones: number` (derivados para UI; la fuente real es el backend).
  - `EstadoFecha = 'programada' | 'realizada' | 'cancelada'` (alineado con el spec; `programada` y `realizada` son las que permiten registrar asistencia per `docs/backend/01-contrato-api-certificados.md:123`).
  - `CursoFecha`: `{ id: number; cursoId: number; fecha: string; descripcion: string; orden: number; estado: EstadoFecha }`.
  - Sin `dni`, sin `documentNumber`, sin `token`, sin `attendedDates` (pertenecen a la spec de certificación; acá solo estructura académica).
- **Servicios mock tipados** (sin llamadas HTTP, sin `X-Admin-Key`, sin `localStorage`/`sessionStorage`):
  - `features/admin/courses/mock-courses.service.ts` con `InMemoryCoursesService` (`@Injectable({ providedIn: 'root' })`) que expone `listar(filtros?)`, `obtener(id)`, `crear(dto)`, `actualizarEstado(id, estado)`, `listarFechas(cursoId)`, `crearFecha(cursoId, dto)`, `actualizarFecha(cursoId, fechaId, dto)`. Datos seed: 6 cursos ficticios (alineados con el dominio IFTS: Desarrollo Web II, Sistemas Embebidos, Ciberseguridad, Programación Avanzada I, Redes, Análisis de Datos), 1-3 fechas por curso, estados variados. Mutaciones devuelven `Promise<T>` resuelta con un retardo simulado (50-200 ms) para reproducir estados `loading`. **Ningún** método hace HTTP. La señalización de "temporal/mock" es un campo `readonly __mock = true` y un comment explícito.
  - `COURSES_SOURCE` `InjectionToken<CoursesService>` (mismo patrón que `VALIDATION_SOURCE` en `app.config.ts:30-33`) para futura sustitución por `HttpCoursesService` cuando cPanel Basic Auth o PHP HttpOnly esté aprobado.
  - **No** se implementa `HttpCoursesService` en F2-04. Queda como TODO en la spec del spec.
- **Componentes nuevos** bajo `apps/frontend-angular/src/app/features/admin/courses/`, todos standalone, CSS por componente, tokens por cascada, sin Tailwind/shadcn/lucide, sin copy literal de `muestra_pagina/`:
  - `courses-list-page.ts/.html/.css/.spec.ts`: kicker + título "Cursos", subtítulo de archivo académico, barra de búsqueda (`<input type="search">` nativo, sin librería), filtros toggle por estado (activo/inactivo) y por carga de fechas (con/sin fechas), botón primario "Nuevo curso" con `routerLink="/admin/cursos/nuevo"`, grilla responsive de tarjetas `Curso` con badge de estado, conteo de fechas/alumnos/certificaciones y acciones "Ver" (`routerLink="/admin/cursos/{id}"`) y "Editar" (`routerLink="/admin/cursos/{id}/editar"`). Estados de pantalla demostrables sin API: `datos`, `cargando`, `vacio-total`, `error-tecnico` (con `BandaEstado kind="error"` reusando el primitivo F1-02). Lista vacía con CTA "Crear primer curso".
  - `course-detail-page.ts/.html/.css/.spec.ts`: breadcrumb "← Cursos" (link a `/admin/cursos`), ficha del curso con monograma 4-cuadrados + título + código + estado + fechas cargadas + acciones "Editar curso" y "Volver", lista de fechas del curso con `fechaISO`, descripción, orden, badge de estado (`programada|realizada|cancelada`), indicadores de carga de asistencia (futura F2-05) y botón "Agregar fecha" (placeholder visible que abre el editor de fechas inline o navega a `/admin/cursos/{id}/fechas/nueva` si la spec lo aprueba; default: navega a la página de edición).
  - `course-editor-page.ts/.html/.css/.spec.ts`: shell de formulario con `fieldset/legend` sr-only, inputs `codigo` (text, maxlength 32, pattern `[A-Z0-9-]+`), `nombre` (text, maxlength 200, required), `estado` (select nativo con `<option>` para `activo|inactivo`), validador local (required, minlength). En modo `nuevo`: botón "Crear" deshabilitado mientras se valida; al submit válido llama a `InMemoryCoursesService.crear()` y navega a `/admin/cursos/{id}`. En modo `editar`: precarga con el curso existente; al submit llama a `actualizarEstado()` (la API solo permite PATCH estado per spec `admin-master-data-api`); botón "Cancelar" vuelve a la lista o al detalle. Lista inline de fechas precargadas + "Agregar fecha" + "Quitar" (soft, solo en edición). **Submit y mutaciones quedan envueltos en try/catch con `BandaEstado kind="error"`**: ningún error sale a consola sin narrativa de UI.
  - **No** se implementa persistencia real (`localStorage`/`sessionStorage`/IndexedDB). El servicio es solo en memoria; refresh de la página pierde los cambios. Esto es visible en UI con un banner discreto "Datos de demostración: los cambios no se persisten al recargar".
- **Actualización de `AdminDashboardPage`**: la tarjeta "Próximamente: Cursos" pasa a ser un link real (`routerLink="/admin/cursos"`) y el texto cambia a "Cursos activos" con conteo mock derivado de `InMemoryCoursesService.listar().length`. Las tarjetas de Asistencias y Certificaciones siguen como placeholders.
- **Patch a `docs/frontend/00-angular20-port-v0.md`** en la sección "Estado F2-03" (línea 119-138): agregar subsección "Estado F2-04" (~25-40 líneas) confirmando rutas creadas, componentes, modelos, servicio mock, límites explícitos (sin auth real, sin `X-Admin-Key`, sin HTTP, sin storage) y handoff a F2-05/F2-06. Confirmar y ajustar en `sdd-archive`.
- **Tests unitarios** (Karma + ChromeHeadless, ya configurado, runner verde 146/146 al cierre de F2-03):
  - 1 test por componente nuevo cubriendo render básico, foco visible, role ARIA, navegación por teclado, cambio de estado (`loading→datos`, `datos→error`).
  - Tests del servicio mock: `listar()` devuelve los 6 seed, `crear()` agrega sin persistir tras refresh simulado (spy sobre `signal` interno o reset entre tests), `actualizarEstado()` rechaza estados fuera de `activo|inactivo` con `400 VALIDATION_ERROR` simulado.
  - Tests de rutas: `/admin/cursos` carga `CursosListPage` y exige `adminGuard`; `/admin/cursos/nuevo` carga `CursoEditorPage` con `modo='nuevo'`; `/admin/cursos/:id` carga `CursoDetallePage` con route param resuelto vía `withComponentInputBinding()`; `pathMatch: 'prefix'` admin sigue aislando.
  - Tests de seguridad: `grep` en el código fuente confirma que **ningún** archivo Angular bajo `apps/frontend-angular/src/app/features/admin/courses/` contiene la cadena literal `X-Admin-Key`, `admin_api_key`, `dni_cipher_key`, `token_encryption_key`, `dni_cifrado`, `documentNumber` (DNI completo), `token_cifrado`, ni `localStorage`/`sessionStorage`/`IndexedDB` para credenciales. Test negativo de red: spy sobre `HttpClient` y verificación de que `InMemoryCoursesService` no lo invoca.
  - Tests de `app.routes.spec.ts` actualizados: agregar 4-6 casos para admin sin romper los 8 existentes de F2-03.
- **Pequeño patch en `apps/frontend-angular/src/app/features/admin/admin-shell.html`** solo en la línea 40 (`<app-admin-dashboard-page />` → `<router-outlet />`) + ajuste de `imports` en `admin-shell.ts` (quitar `AdminDashboardPage`, agregar `RouterOutlet`). El shell, sidebar, topbar, footer, drawer mobile y badge "Sesión mock" quedan intactos.

### Excluido (no tocar)

- **Auth real / `X-Admin-Key` / login real**: la `admin-foundation` spec (líneas 44-60) y `docs/backend/01-contrato-api-certificados.md:534` lo prohíben de forma explícita. F2-04 no envía headers admin desde el browser, no instala `ngx-auth`/`@auth0/angular-jwt`/`keycloak-angular`, no expone `X-Admin-Key` en el bundle, no usa `localStorage`/`sessionStorage`/IndexedDB para credenciales. La sesión mock de F2-03 sigue activa; F2-04 la consume vía `MOCK_SESSION`/`adminGuard` sin modificarla.
- **Datos reales o dominiales sensibles**: el seed mock usa nombres de cursos genéricos del dominio IFTS (desarrollo web, sistemas embebidos, etc.) **sin** nombres reales de la oferta académica vigente. No se cargan DNIs, no se cargan emails, no se cargan tokens, no se cargan códigos de curso que parezcan reales. Aplica regla D0: el admin no muestra DNI completo fuera de la validación pública (decisión D0), no expone token completo, no expone claves, IV, tag, ciphertext ni SQL.
- **Backend / base / deploy / `.htaccess`**: NO tocar `apps/backend-php/`, `database/`, `deploy/`, `docker/`, `material_privado_no_versionar/`, `.env*`, dumps, logs, secretos. El backend admin con `X-Admin-Key` ya está implementado por Marcos; F2-04 es solo shell Angular.
- **Asistencias (F2-05) y certificaciones (F2-06)**: F2-04 entrega **solo** cursos y fechas. El botón "Asistencias" en el detalle de curso es **placeholder visible** ("Próximamente: F2-05"); no se renderiza la grilla de F2-05. La emisión de certificación desde el detalle de curso también es placeholder ("Próximamente: F2-06"). Esto mantiene el ciclo en presupuesto y deja el modelo `CursoFecha` listo para F2-05.
- **PDF, QR, revocación, configuración institucional, entrega manual, revisión de auditoría, carga masiva, listado/detalle de alumnos, listado de certificaciones, expediente de certificación**: todos fuera de F2-04; pertenecen a F2-06 y F4-F6 según la guía unificada.
- **Tailwind, shadcn, CVA, lucide, fuentes web, `cn()`, `class-variance-authority`, `tailwind-merge`**: NO instalar. F1-02 dejó tokens en CSS custom properties y SVG inline; F1-04 (otra rama) define Tailwind. F2-04 hereda esa decisión y reusa `--font-sans`, `--color-ink`, `--color-circuit`, `--color-border`, `--color-muted`, `--space-*`, `--radius-*`, `--focus-ring`, `--tracking-caps*`, `--color-tech-blue`, `--color-valid`/`-soft`, `--color-warning`/`-soft`, `--color-destructive`/`-soft`, `--color-card`, `--color-foreground`, `--color-paper`, `--color-muted-foreground`, `--color-ring`, `--color-ink-foreground`, `--motion-fast`. No se introducen tokens nuevos.
- **Persistencia real**: nada de `localStorage`, `sessionStorage`, IndexedDB, cookies propias, archivos en `assets/`, ni envíos al backend. El servicio mock es solo en memoria. Documentar visible: "Datos de demostración: los cambios no se persisten al recargar".
- **`muestra_pagina/`**: lectura segura de `app/admin/cursos/page.tsx` (17 líneas), `app/admin/cursos/nuevo/page.tsx` (17 líneas), `app/admin/cursos/[id]/page.tsx` (17 líneas), `components/admin/lista-cursos.tsx` (713 líneas, patrones de filtros y estados), `components/admin/curso-detalle.tsx` (344 líneas, patrones de ficha y fechas), `components/admin/curso-editor.tsx` (29.2 KB, **NO portable** por tamaño; usar solo como referencia de campos, no de copy ni de layout literal). **No abrir** capturas pesadas, `prompts_stitch_v0_ifts14.md`, `pnpm-lock.yaml`, ni `app/admin/certificaciones`, `app/admin/alumnos`, `app/admin/configuracion` (esos flujos son F4-F6). **No modificar** ningún archivo de `muestra_pagina/`.
- **`HeaderInstitucional` raíz en admin**: el `app.html` raíz sigue mostrando `HeaderInstitucional` en `/admin/*` (es el comportamiento actual post-F2-03). El `AdminShell` define su propio `role="banner"` en el topbar (intencional). Esto es tech debt documentado en F2-03 explore; F2-04 no lo resuelve. Si en `sdd-design` se aprueba refactorizar `app.html` raíz para que las features públicas incluyan su propio `HeaderInstitucional`, se discute como alcance adicional con presupuesto explícito; F2-04 default = no tocar `app.html`.
- **`environment.ts` y `environment.development.ts`**: intactos. F2-04 no agrega endpoint admin al environment (no hay integración HTTP). Si Marcos aprueba `HttpCoursesService` futuro, el ciclo correspondiente lo discute.
- **`admin-shell.ts` y `admin-shell.css`**: la migración a `<router-outlet />` es **mínima** (1 línea HTML, 1 import TS, sin tocar CSS ni landmarks). El sidebar, topbar, drawer mobile, badge "Sesión mock" y footer admin quedan intactos. Cambios cosméticos del shell se difieren a un ciclo posterior.
- **`muestra_pagina/components/admin/curso-editor.tsx`**: **NO** se copia el código (29 KB de complejidad, no portable). F2-04 se inspira solo en los **campos** que aparecen (`codigo`, `nombre`, `estado`, `fechas[]`) y en la **estructura de formulario** (fieldset/legend, label asociado, validación local). El copy de los labels y los mensajes de error se redactan en español argentino formal, no se traducen literalmente.
- **Rutas públicas existentes** (`''`, `validar/:tokenCertificacion`, `**`): intactas. Los 8 tests de `app.routes.spec.ts` post-F2-03 deben seguir pasando.
- **`shared/certificates/*`** (DTOs D0, mock tokens, http-validation, result-mapper, validation service): intactos. F2-04 no introduce DTOs públicos.
- **`shared/ui/*`** (BandaEstado, CampoDato, FolioShell, HeaderInstitucional): reusables sin tocar. F2-04 puede consumir `BandaEstado` para estados de error del servicio mock.
- **Rama de Marcos o de otros**: no tocar `frontend/api-readiness`, `frontend/public-validation-flow`, `integration/*`, ni `main`. La rama `frontend/admin-courses-dates` es solo de Matías.
- **Cambio de `Matías_PROMPTS` o `MARCOS_PROMPTS`**: no se modifican guías operativas. El índice F0-F6 de Matías actualiza el estado de F2-04 a ✅ en el cierre (`docs(governance): actualizar indice de fases de matias`).

## Current State (Angular hoy, post F2-03)

### Estructura y estado del scaffold (post F2-03)

- `apps/frontend-angular/` Angular CLI 20.3.30 standalone, 146/146 tests verde al cierre de F2-03 (archivado en `openspec/changes/archive/2026-07-07-f2-03-admin-login-shell/`), build prod sin warnings: 283.68 kB initial / 81.34 kB transfer; lazy `admin-shell` 10.38 kB / 2.78 kB, `login-page` 29.32 kB / 6.97 kB.
- `apps/frontend-angular/src/app/features/admin/` tiene: `admin-shell.{ts,html,css,spec.ts}` (con dashboard inline), `admin-guard.ts/.spec.ts`, `admin-dashboard-page.{ts,html,css,spec.ts}` (placeholder con 3 tarjetas "Próximamente"), `login-form.{ts,html,css,spec.ts}`, `login-page.{ts,html,css,spec.ts}`, `mock-session.ts/.spec.ts`, `sidebar-admin.{ts,html,css,spec.ts}`. **No existe `features/admin/courses/`**.
- `apps/frontend-angular/src/app/app.routes.ts` (59 líneas, post-PR-#34) tiene:
  - `''` (landing).
  - `validar/:tokenCertificacion` (público).
  - `admin/login` (F2-03).
  - `admin` → `redirectTo: '/admin/dashboard'` (F2-03).
  - `admin/dashboard` con `adminGuard`, `loadComponent: AdminShell` (F2-03).
  - `admin` `pathMatch: 'prefix'` → `/admin/dashboard` (F2-03 catch-all admin, aísla del wildcard público).
  - `**` → `NotFoundPage` (intacto).
- `apps/frontend-angular/src/app/app.routes.spec.ts` (post F2-03): cubre las 3 rutas públicas originales + las 5 admin nuevas. F2-04 agrega casos para 4 rutas nuevas (cursos/nuevo, cursos/:id, cursos/:id/editar, dashboard migrado a child route) sin romper los actuales.
- `apps/frontend-angular/src/app/app.config.ts` (36 líneas): `provideRouter(routes, withComponentInputBinding())`, `provideHttpClient()`, `VALIDATION_SOURCE` con mock por default, `MOCK_SESSION` con `useExisting: InMemoryMockSession`. **F2-04 no necesita** agregar `COURSES_SOURCE` al `app.config` providers porque se provee a nivel feature (en el routing module) o se inyecta directamente; decisión en `sdd-design`.
- `apps/frontend-angular/src/environments/environment.ts` y `environment.development.ts`: `useRealApi: false`, `apiBaseUrl: '/certificados/api'`. F2-04 no los toca.
- `apps/frontend-angular/src/styles.css` (119 líneas, F1-02): tokens completos. Suficiente para F2-04; no se introducen tokens nuevos.
- `apps/frontend-angular/angular.json`: presupuestos `500 kB warn / 1 MB error` initial, `4 kB warn / 8 kB error` por `anyComponentStyle`. F2-04 puede tocar `4-6 kB` por `courses-list-page` (tarjetas + filtros) y `3-4 kB` por `course-detail-page`. Build prod target: < 320 kB initial / < 95 kB transfer (estimación con margen para F2-05 y F2-06 que se quedan).
- `apps/frontend-angular/package.json` (49 líneas): solo `@angular/*` 20.3.0, `rxjs`, `tslib`, `zone.js`, tooling. F2-04 **no** agrega dependencias.

### Primitivos F1-02 disponibles para reuso

- `BandaEstado` (selector `app-banda-estado`, `kind: 'valid' | 'revoked' | 'not-verifiable' | 'error' | 'loading'`): reusable para estados de error del servicio mock (`error` y `loading`). Dueño único de `aria-live`/`aria-atomic`; los wrappers externos no replican.
- `CampoDato` (directiva `[appCampoDato]` sobre `<dt>/<dd>`, variantes `default | mono | highlight`): reusable en la ficha del curso (detail page) si se listan metadatos con `dl/dt/dd`. En F2-04 se usa `<dl>` simple con la directiva para `Código / Estado / Fechas cargadas / Última actualización`.
- `HeaderInstitucional` y `FolioShell`: no aplican al admin (F2-03 lo explicó; el admin tiene su propio shell con topbar y `role="banner"` propio).

### Estado del `AdminShell` actual y migración a child routes

- `admin-shell.html:40` contiene `<app-admin-dashboard-page />` directo. F2-04 lo reemplaza por `<router-outlet />`.
- `admin-shell.ts:14` importa `AdminDashboardPage`; F2-04 lo reemplaza por `RouterOutlet` (o `RouterLink` si se necesita).
- `admin-shell.ts:9-10` lo anticipa: "F2-04..F2-06 migrarán a rutas hijas con `<router-outlet>` cuando haya más de una página admin".
- Cambio mínimo: 1 línea HTML + 1 import + 1 componente declarado en `imports`. Sin tocar `admin-shell.css`, sin tocar landmarks, sin tocar sidebar, topbar, drawer mobile, badge mock, footer, ni el guard.

### Estado del `SidebarAdmin` y activación de Cursos

- `sidebar-admin.ts:17` define el ítem Cursos con `route: null` (placeholder deshabilitado). F2-04 cambia a `route: '/admin/cursos'`.
- `sidebar-admin.html:27-44` renderiza el placeholder como `<button disabled>` cuando `route === null`. Cuando `route !== null`, renderiza `<a [routerLink]>` con `aria-current="page"` (líneas 6-26). F2-04 hace que Cursos pase al segundo branch.
- `isActive()` (`sidebar-admin.ts:35-37`) compara `item.route === this.active()`. Con `route: '/admin/cursos'`, las rutas hijas (`/admin/cursos/nuevo`, `/admin/cursos/:id`) **no** activan automáticamente el ítem Cursos. **Decisión a resolver en `sdd-design`**: (a) usar `route.startsWith('/admin/cursos')` para que toda la sección active el ítem, o (b) pasar `active` como `withComponentInputBinding()` desde el shell admin en cada ruta. Recomendación: (a) con `startsWith` para mantener el shell route-agnóstico.

### Estado del contrato backend `admin-master-data-api` (lo que la UI representa, sin llamarlo)

- `docs/backend/01-contrato-api-certificados.md:27-40` lista los endpoints admin:
  - `POST /admin/cursos` (crear), `GET /admin/cursos?estado=` (listar con filtro), `GET /admin/cursos/{id}` (detalle), `PATCH /admin/cursos/{id}/estado` (actualizar estado).
  - `POST /admin/cursos/{cursoId}/fechas` (crear fecha), `GET /admin/cursos/{cursoId}/fechas` (listar ordenadas por `orden` y `fecha`), `PATCH /admin/cursos/{cursoId}/fechas/{fechaId}` (actualizar fecha/orden/estado).
- `admin-master-data-api/spec.md:9-67` cubre los 4 requirements: `Administración de cursos`, `Administración de alumnos con DNI seguro` (no aplica a F2-04), `Administración de fechas de curso` (rango `orden: 1..65535`), `Registro y anulación lógica de asistencias` (no aplica a F2-04).
- DTO `Curso` (`docs/backend/01-contrato-api-certificados.md:110`): `{id, codigo, nombre, estado, createdAt, updatedAt}`. Estado `activo|inactivo`. F2-04 tipa esto en `courses.model.ts` y lo usa en toda la UI.
- DTO `Fecha` (línea 112): `{id, cursoId, fecha, descripcion, orden, estado}`. Estado `programada|realizada|cancelada` (alineado con el modelo `cert_curso_fechas`; F2-05 lo confirma). F2-04 tipa esto y lo usa en la lista de fechas del detalle y en el editor.
- Errores específicos (líneas 130-137): `400 VALIDATION_ERROR`, `401 UNAUTHORIZED`, `404 COURSE_NOT_FOUND`/`STUDENT_NOT_FOUND`/`COURSE_DATE_NOT_FOUND`, `409 CONFLICT`, `415 UNSUPPORTED_MEDIA_TYPE`, `500 CONFIGURATION_ERROR`. F2-04 simula estos errores en el servicio mock para que la UI los pueda reproducir (ej. `crear()` con código duplicado → `409 CONFLICT`).
- Privacidad: las respuestas admin **nunca** incluyen DNI completo, token completo, hash, clave, IV, tag, ciphertext, SQL, ni rutas internas. F2-04 replica esa regla: el `Curso` y `CursoFecha` no tienen esos campos.

### Estado del `AdminDashboardPage` y actualización para F2-04

- `admin-dashboard-page.html:9-20` tiene 3 tarjetas placeholder. La primera ("Próximamente: Cursos", línea 10) pasa a ser link real con conteo dinámico.
- El dashboard sigue funcionando como handoff visual a F2-05 y F2-06 (Asistencias, Certificaciones). Solo la primera tarjeta cambia.
- Migración a child route: `AdminDashboardPage` se importa vía `loadComponent: () => import('./admin-dashboard-page').then(m => m.AdminDashboardPage)` en `app.routes.ts` (o `admin.routes.ts`), ya no se importa en `admin-shell.ts`.

## Reference state (`muestra_pagina/`, lectura segura)

Inventario confirmado por F1-01/F1-02 y por la spec `admin-foundation`:

- `muestra_pagina/app/admin/cursos/page.tsx` (17 líneas): entrada del listado, usa `<AdminShell active="Cursos">` con `<ListaCursos />`. F2-04 replica la **ruta** Angular `/admin/cursos` pero **no** la envoltura React; usa el `AdminShell` nativo con `<router-outlet />`.
- `muestra_pagina/app/admin/cursos/nuevo/page.tsx` (17 líneas): entrada del editor en modo `nuevo`. F2-04 replica con `modo='nuevo'` como route data.
- `muestra_pagina/app/admin/cursos/[id]/page.tsx` (17 líneas): entrada del detalle. F2-04 replica con `:id` como route param.
- `muestra_pagina/components/admin/lista-cursos.tsx` (713 líneas): patrón de **filtros toggle** (estado, con/sin fechas, búsqueda por texto), 4 vistas (`datos|cargando|error|vacio-total`), tarjeta de curso con badge de estado, contadores (fechas, alumnos presentes, certificaciones), acciones "Ver" y "Editar". F2-04 toma el patrón estructural (filtros toggle, 4 vistas, badge, contadores, acciones) y lo reimplementa en Angular standalone sin copy literal ni `lucide-react`. Los iconos `Plus`, `Search`, `Eye`, `Pencil`, `CalendarDays`, `Users`, `BadgeCheck`, `FolderOpen`, `AlertTriangle`, `RotateCw`, `X` se reemplazan por **texto** o por **SVG inline simple** cuando aporta (`Eye` y `Pencil` son casos donde el texto es suficiente: "Ver" / "Editar").
- `muestra_pagina/components/admin/curso-detalle.tsx` (344 líneas): patrón de **breadcrumb** "← Volver a cursos", **ficha del curso** con monograma 4-cuadrados (mismo SVG del `HeaderInstitucional` F1-02 y del `AdminShell` topbar), título, código, estado, fechas, **lista de fechas** con `fechaISO`, descripción, orden, badge de estado, indicadores de carga de asistencia. F2-04 replica breadcrumb, ficha, lista de fechas, y reemplaza el contador "presentes" de la v0 por un placeholder visible "Asistencias: handoff F2-05" (no se renderiza la grilla de F2-05).
- `muestra_pagina/components/admin/curso-editor.tsx` (29.2 KB, **NO portable por tamaño**): patrón de **editor de curso y fechas** con fieldset/legend, validación, gestión inline de fechas (agregar/quitar/reordenar). F2-04 usa la **estructura** (fieldset/legend, label asociado, validación local, lista inline de fechas) pero redacta labels y mensajes en español argentino formal. El editor de v0 también maneja reordenamiento de fechas con drag-and-drop (librería no instalada) — F2-04 default: orden por `orden` numérico editable en input, sin drag-and-drop (YAGNI; se puede agregar en un ciclo posterior si Marcos lo aprueba).
- **No** se abre: capturas pesadas, `prompts_stitch_v0_ifts14.md`, `pnpm-lock.yaml`, otros `app/admin/*/page.tsx` (certificaciones, alumnos, configuracion, dashboard son F2-06/F5/F4-F6).

## Affected Areas

- `apps/frontend-angular/src/app/app.routes.ts` — **MODIFICAR** agregando 4 rutas admin hijas (`/admin/dashboard` con loadComponent propio, `/admin/cursos`, `/admin/cursos/nuevo`, `/admin/cursos/:id`, `/admin/cursos/:id/editar`) y removiendo el inline de `AdminDashboardPage` del shell. Alternativa: extraer a `features/admin/admin.routes.ts` con `RouterModule.forChild` y montarlo lazy. Estimado: +30-50 líneas (incluye comentarios de seguridad y referencia a la spec `admin-foundation`).
- `apps/frontend-angular/src/app/app.routes.spec.ts` — **MODIFICAR** agregando 4-6 tests para las nuevas rutas (carga con `loadComponent`, `adminGuard` aplicado, `:id` route param resuelto con `withComponentInputBinding()`). Estimado: +40-60 líneas.
- `apps/frontend-angular/src/app/features/admin/admin-shell.html` — **MODIFICAR** una línea: `<app-admin-dashboard-page />` → `<router-outlet />`. Estimado: +0-1 líneas.
- `apps/frontend-angular/src/app/features/admin/admin-shell.ts` — **MODIFICAR** dos líneas: `imports: [SidebarAdmin, AdminDashboardPage]` → `imports: [SidebarAdmin, RouterOutlet]` y `import { AdminDashboardPage }` → `import { RouterOutlet } from '@angular/router'`. Estimado: +0-1 líneas.
- `apps/frontend-angular/src/app/features/admin/sidebar-admin.ts` — **MODIFICAR** dos líneas: `Cursos` con `route: null` → `route: '/admin/cursos'`. `isActive()` puede usar `startsWith('/admin/cursos')` para activar el ítem en rutas hijas (decisión de `sdd-design`). Estimado: +1-3 líneas.
- `apps/frontend-angular/src/app/features/admin/sidebar-admin.spec.ts` — **MODIFICAR** tests: el ítem Cursos pasa de placeholder deshabilitado a `<a>` con `routerLink`, `aria-current` se aplica en `/admin/cursos` y sus hijas, no se aplica en `/admin/dashboard`. Estimado: +10-20 líneas.
- `apps/frontend-angular/src/app/features/admin/admin-dashboard-page.{ts,html,css,spec.ts}` — **MODIFICAR** la primera tarjeta: de "Próximamente: Cursos" a "Cursos activos" con conteo dinámico derivado de `InMemoryCoursesService.listar().length` y `routerLink="/admin/cursos"`. Las otras dos tarjetas (Asistencias, Certificaciones) siguen como placeholder. Estimado: +5-15 líneas (HTML/CSS) + +10-20 líneas (spec).
- `apps/frontend-angular/src/app/features/admin/courses/` — **CREAR** directorio con:
  - `courses.model.ts`: tipos `EstadoCurso`, `Curso`, `CursoDetalle`, `EstadoFecha`, `CursoFecha`, `CursosFiltros`. Estimado: 60-100 líneas.
  - `courses.service.ts` con `CoursesService` (interfaz) + `InMemoryCoursesService` (mock) + `COURSES_SOURCE` `InjectionToken<CoursesService>`. Estimado: 200-280 líneas (incluye seed de 6 cursos + 14 fechas + helpers de mutación + simulación de errores).
  - `courses.service.spec.ts`: tests del servicio mock. Estimado: 100-150 líneas.
  - `courses-list-page.ts/.html/.css/.spec.ts`: listado con filtros, tarjeta, estados. Estimado: 200-260 líneas (TS+HTML+CSS) + 80-120 líneas (spec).
  - `course-detail-page.ts/.html/.css/.spec.ts`: detalle con ficha y lista de fechas. Estimado: 200-260 líneas (TS+HTML+CSS) + 80-120 líneas (spec).
  - `course-editor-page.ts/.html/.css/.spec.ts`: editor con fieldset/legend, validación local, mutación simulada. Estimado: 240-320 líneas (TS+HTML+CSS) + 100-140 líneas (spec).
- `docs/frontend/00-angular20-port-v0.md` — **MODIFICAR** agregando subsección "Estado F2-04" (~25-40 líneas) en la sección "Estado de la app Angular 20" (línea 115). Confirmar y ajustar en `sdd-archive`.
- `MATIAS_PROMPTS_SDD_3_SEMANAS_CICLOS_GIT.md` — **MODIFICAR** solo la fila F2-04 de la tabla de fases (línea 24): estado `⏳` → `✅`, columna commit/notes con el SHA real al cerrar. Mensaje: `docs(governance): actualizar indice de fases de matias`. Estimado: +1 línea.
- `openspec/changes/f2-04-admin-courses-dates/` — **CREAR** con artefactos OpenSpec: `exploration.md` (este archivo), `proposal.md`, `design.md`, `tasks.md`, `specs/admin-courses-frontend/spec.md` (delta), `apply-progress.md`, `verify-report.md`, `archive-report.md`.

### Out of affected areas (no tocar)

- `apps/frontend-angular/src/styles.css` (tokens F1-02 suficientes; F2-04 no introduce tokens nuevos).
- `apps/frontend-angular/src/app/app.html`, `app.ts`, `app.config.ts`, `app.config.spec.ts` (intactos: el shell raíz no cambia, `app.config.ts` no necesita `COURSES_SOURCE` si se provee a nivel feature).
- `apps/frontend-angular/src/app/app.css`.
- `apps/frontend-angular/src/app/shared/certificates/*` (intactos: validación pública no se toca).
- `apps/frontend-angular/src/app/shared/ui/*` (4 primitivos F1-02; F2-04 solo consume `BandaEstado` y `CampoDato` sin modificarlos).
- `apps/frontend-angular/src/app/features/landing/*`, `features/not-found/*`, `features/public-validation/*` (intactos).
- `apps/frontend-angular/src/app/features/admin/mock-session.ts`, `admin-guard.ts`, `login-form.*`, `login-page.*`, `admin-shell.css` (intactos; solo cambian `admin-shell.html` línea 40 y `admin-shell.ts` import).
- `apps/frontend-angular/src/environments/environment.ts` y `environment.development.ts` (intactos: F2-04 no agrega endpoint admin al environment).
- `apps/frontend-angular/angular.json`, `package.json`, `tsconfig*.json`, `proxy.conf.json`, `karma.conf.*`, `src/index.html` (intactos: no se modifica config).
- `muestra_pagina/` salvo lectura segura listada arriba.
- `apps/backend-php/`, `database/`, `deploy/`, `docker/`, `.htaccess`, `material_privado_no_versionar/`, `.env*`, dumps, logs, secretos.
- `openspec/changes/` distinto a `f2-04-admin-courses-dates/`.
- `MARCOS_PROMPTS_SDD_3_SEMANAS_CICLOS_GIT.md` (intacto: Marcos mantiene su propio flujo).
- Ramas no mergeadas: `frontend/v0-design-system` y `frontend/admin-foundation` ya mergeadas (PR #33 y PR #34). `frontend/admin-courses-dates` parte de `main` actualizado.

## Approaches (resumen comparativo)

| Approach | Pros | Con | Effort | Notas |
|---|---|---|---|---|
| **A. UI contract-ready con servicio mock tipado contra el DTO backend, sin HTTP, sin `X-Admin-Key` (RECOMENDADO)** | Cero dependencias nuevas; cumple specs `admin-certificate-delivery`/`admin-certificate-emission`/`admin-foundation`; UI demoable end-to-end con estados `loading/error/empty`; modelo `Curso`/`CursoFecha` listo para F2-05/F2-06 y para futura sustitución por `HttpCoursesService`; sin tocar `app.config.ts` ni `environment.ts`; tests Karma+Jasmine sin infra nueva. | "No llama al backend real" (es visible en UI con banner de demo); refresh pierde cambios. | Low-Medium | Encaja con `MATIAS_PROMPTS_SDD_3_SEMANAS_CICLOS_GIT.md:915-922` y la spec `admin-foundation` (líneas 44-60). |
| B. Llamadas HTTP reales a `/admin/cursos` con `X-Admin-Key` enviado desde Angular | "Funciona" contra backend ya implementado por Marcos. | **PROHIBIDO** por `admin-certificate-delivery/spec.md:11` y `:41-46`, `admin-certificate-emission/spec.md:73-78`, `admin-foundation/spec.md:44-60` y `docs/backend/01-contrato-api-certificados.md:534` (X-Admin-Key NO DEBE aparecer en bundle, headers salientes del browser, ni storage). Tests de seguridad lo bloquean. | — | Descartado. |
| C. HttpCoursesService detrás de feature flag en `environment.development.ts` (similar a M3-06 con `useRealApi`) | Patrón ya validado en `app.config.ts:30-33` y `apps/frontend-angular/src/app/shared/certificates/http-validation.source.ts`. | Sigue enviando header `X-Admin-Key` desde el browser. Mismo veto que B. | — | Descartado. |
| D. HttpCoursesService con login PHP HttpOnly + cookie de sesión | Solución correcta per `admin-foundation/spec.md:44-60` para producción. | Requiere tocar `apps/backend-php/` (login PHP + cookie `HttpOnly` `SameSite`), `deploy/`, `.htaccess`, y un ciclo dedicado a auth; **fuera del alcance de F2-04**. | High | Diferido a F4-F6 según `docs/frontend/00-angular20-port-v0.md:39-54`. F2-04 no toca eso. |
| E. Persistencia local con `localStorage` o IndexedDB | "Sobrevive" al refresh. | **PROHIBIDO** por `admin-foundation/spec.md:44-60` y `admin-certificate-delivery/spec.md:11`. Tests de seguridad lo bloquean. | — | Descartado. |
| F. Solo `<router-outlet />` con un único `CursosPage` placeholder (sin lista, sin detalle, sin editor) | Mínimo absoluto. | No entrega lo que pide el ciclo (listado + detalle + editor). Regresión vs F4-03/F4-04 que la guía ya planifica. | — | Descartado. |

### Decisión recomendada: Approach A

- Cumple la regla "No instalar dependencias no aprobadas" sin negociar.
- Cumple las specs `admin-foundation`, `admin-certificate-delivery`, `admin-certificate-emission`, `backend-contrato-api-certificados` (sin `X-Admin-Key` en browser).
- Encaja con `apps/frontend-angular/AGENTS.md:11` (Angular 20, estructura por features, separar componentes/servicios/modelos) y con el scaffold verde post-F2-03.
- Deja explícito que la integración es placeholder (banner de demo + subtítulos honestos + tests que verifican que no hay HTTP real).
- Prepara el terreno para F2-05 (asistencias reutiliza `CursoFecha` y `InMemoryCoursesService`) y F2-06 (certificaciones).
- Presupuesto: ~1100-1450 líneas (3 features × ~250 + 1 modelo ~80 + 1 servicio ~250 + tests de servicio ~130 + 1 routes patch ~40 + 1 routes spec patch ~50 + patch de docs ~30 + patch de dashboard ~25 + patch de sidebar ~10 + patch de index ~1). Margen 50-400 líneas para imprevistos y tests extras. Por debajo o apenas por debajo de 1500.
- Si el forecast final supera 1500, `sdd-tasks` puede dividir: PR #1 = `CursosListPage` + `courses.model.ts` + `courses.service.ts` + sidebar activation + dashboard tile; PR #2 = `CursoDetallePage` + `CursoEditorPage` + tests cruzados. Esto encaja con la spec del spec: el detalle/editor es un delta, no rompe el contrato.

## Decisiones a resolver en `sdd-propose`

1. **Migración de `AdminDashboardPage` a child route vs mantener inline**: recomendación **migrar a child route** con `<router-outlet />` en el shell. El comentario en `admin-shell.ts:9-10` lo anticipa. Cambio mínimo (1 línea HTML + 1 import). Decisión final con Matías.
2. **`isActive()` para rutas hijas de Cursos**: recomendación **usar `startsWith('/admin/cursos')`** para que `/admin/cursos/nuevo` y `/admin/cursos/:id/editar` activen el ítem Cursos en el sidebar. Mantiene el shell route-agnóstico. Decisión final con Matías.
3. **Sub-ruta de edición vs editor como vista separada del detalle**: recomendación **sub-ruta `/admin/cursos/:id/editar`** con `modo='editar'` y route param `id`. Mantiene la URL canónica del detalle. El editor de v0 es una página, no un modal. Decisión final con Matías.
4. **Sub-ruta para nueva fecha dentro de curso**: recomendación **no crear sub-ruta** en F2-04; el botón "Agregar fecha" en el detalle abre un **inline** simple (form pequeño al final de la lista) o navega a `/admin/cursos/:id/fechas/nueva` (recomendación: inline simple para no inflar el scope). Decisión final con Matías.
5. **Banner de "datos de demostración"**: recomendación **visible** en cada página de cursos (listado, detalle, editor) con texto "Datos de demostración: los cambios no se persisten al recargar". Cumple el espíritu del F2-03 ("subtítulo visible de simulación") y lo aplica al nuevo dominio. Decisión final con Matías.
6. **Delta a spec base**: recomendación **SÍ** a un spec nuevo `admin-courses-frontend` (criterios portables: rutas, modelos, servicio mock, seguridad X-Admin-Key, sin `localStorage`/`sessionStorage`, sin HTTP real, sin tailwind, sin shadcn, sin lucide). El test negativo de "no X-Admin-Key en `dist/`" puede vivir como criterio de la nueva spec o como refuerzo de `admin-foundation`. Decisión final con Matías.
7. **División en chained PRs**: F2-04 forecast ~1100-1450 líneas. Si supera 1500, dividir en PR #1 (modelos + servicio + listado + sidebar) y PR #2 (detalle + editor). Decisión final en `sdd-tasks` con el tamaño real.

## Tokens que F2-04 reusa (no introduce nuevos)

- Color: `--color-ink`, `--color-ink-foreground`, `--color-circuit`, `--color-tech-blue`, `--color-border`, `--color-muted`, `--color-muted-foreground`, `--color-foreground`, `--color-card`, `--color-paper`, `--color-ring`, `--color-valid`/`-soft`, `--color-warning`/`-soft`, `--color-destructive`/`-soft`.
- Tipografía: `--font-sans`, `--font-mono`, `--tracking-caps`, `--tracking-caps-tight`.
- Radio: `--radius-sm`, `--radius-md`, `--radius-lg`.
- Espaciado: `--space-1..6`.
- Foco: `--focus-ring` (heredado del global `:focus-visible`).
- Motion: `--motion-fast` (transiciones de hover en tarjetas y badges; respeta `prefers-reduced-motion`).
- Layout: `--layout-page-max` (56rem) para el `main` admin.

## Componentes candidatos (F2-04 produce los 4 nuevos + 1 modelo + 1 servicio)

| Componente Angular | Patrón v0 de referencia | Por qué entra en F2-04 | Por qué NO entra (queda para ciclos siguientes) |
|---|---|---|---|
| `CoursesListPage` | `components/admin/lista-cursos.tsx` | Pantalla principal del ciclo; pide el prompt 13. | Datos reales, filtros server-side, paginación (F4-03 con spec de paginación). |
| `CourseDetailPage` | `components/admin/curso-detalle.tsx` | Pantalla de ficha; pide el prompt 14. | Acciones de F2-05 (asistencias cargadas) y F2-06 (certificaciones emitidas) — placeholder visible. |
| `CourseEditorPage` | `components/admin/curso-editor.tsx` (estructura, no copy) | Pantalla de alta/edición; pide los prompts 8/14. | Reordenamiento drag-and-drop de fechas (ciclo posterior con librería aprobada); PDF/QR/revocación (F4-F6). |
| `InMemoryCoursesService` + `COURSES_SOURCE` + `courses.model.ts` | — | Tipos alineados con `admin-master-data-api`; sustituto mock listo para `HttpCoursesService` futuro. | Persistencia real (F4-F6 con PHP HttpOnly). |
| `AccionesPrincipales`, `BandejaPendientes`, `ActividadReciente` | `components/admin/*.tsx` | — | F4-F6. No entran. |
| `ListaAlumnos`, `ListaCertificaciones`, `ExpedienteCertificacion`, `RevocarCertificacion`, `EntregaManual`, `VistaPreviaPdf`, `AsistenciasEditor`, `NuevaCertificacionEditor` | `components/admin/*.tsx` | — | F2-05, F2-06, F4-F6. No entran. |
| `ConfiguracionInstitucional` | `components/admin/configuracion-institucional.tsx` | — | F6-04. No entra. |

## Riesgos

| Riesgo | Probabilidad | Mitigación |
|---|---|---|
| Exceder 1500 LOC en una sola PR | Medium | Forecast ~1100-1450; margen 50-400. Si pasa, `sdd-tasks` divide en chained PRs (listado vs detalle+editor). `sdd-apply` lo verifica con `git diff --stat` antes del primer commit. |
| Romper 146/146 tests existentes de F2-03 | Low | `admin-shell` cambia 1 línea HTML + 1 import; `sidebar-admin` cambia 1 línea `route` y opcional `isActive()` con `startsWith`; nuevos tests admin no tocan asertos existentes. `app.routes.spec.ts` agrega casos sin modificar los 8 públicos + 5 admin actuales. |
| Romper presupuesto `4 kB warn / 8 kB error` por `anyComponentStyle` | Low-Medium | `courses-list-page` con filtros + tarjetas puede tocar 4-5 kB; `course-detail-page` con ficha + lista de fechas puede tocar 3-4 kB; `course-editor-page` con fieldset + inputs + lista de fechas inline puede tocar 4-5 kB. Si warn, reducir selectores redundantes o extraer a `BandaEstado` cuando aplique. |
| Implementar auth real o transmitir `X-Admin-Key` desde el browser | Low (regla clara en specs y AGENTS) | Tests de seguridad verifican que no hay literales `X-Admin-Key`, `admin_api_key`, `dni_cipher_key`, `token_encryption_key`, `dni_cifrado`, `documentNumber`, `token_cifrado` en `apps/frontend-angular/src/app/features/admin/courses/`. Tests negativos de red: spy sobre `HttpClient` y verificación de que `InMemoryCoursesService` no lo invoca. Subtítulos y banner visible aclaran que es mock. |
| Hardcodear DNIs o emails en el seed mock | Low | Seed usa solo `codigo` + `nombre` + `estado` + `fechas` (sin DNI, sin email, sin token, sin datos personales). Tests verifican que el modelo `Curso` no tiene esos campos. |
| Exponer código de curso que parezca real | Low | Códigos seed ficticios alineados con el dominio IFTS (`DSW-02`, `ISE-01`, `CSI-03`, `PAV-01`, `RCD-02`, `ADP-01`) pero **no** tomados de la oferta académica vigente. Aclarar en banner "Datos de demostración, no representan cursos reales". |
| Conflicto con `HeaderInstitucional` raíz en admin | Low (F2-03 ya lo documentó como tech debt) | F2-04 mantiene el comportamiento actual: el `app.html` raíz sigue mostrando `HeaderInstitucional` en `/admin/*`, y el `AdminShell` define su propio `role="banner"` en el topbar. Documentar en `sdd-archive` que el refactor del shell raíz queda para un ciclo posterior. |
| Pérdida del patrón D0 (no DNI completo, no token completo en UI/logs) | Low | F2-04 no muestra DNI ni token. El admin de cursos opera sobre `codigo`, `nombre`, `estado`, `fecha`, `descripcion`, `orden`. Los únicos DTOs visibles son académicos, sin PII. |
| `muestra_pagina/app/admin/cursos/*` cambia mientras se porta | Low | Snapshot export; rama actual no modifica v0. Si cambia, se reabre la exploración. |
| Auto-commit / auto-push | Low (regla clara) | `AGENTS.md:25`, `MATIAS_PROMPTS_SDD_3_SEMANAS_CICLOS_GIT.md:922` y la sección de Git en la guía exigen aprobación explícita de Matías en el mismo turno + diff-confirmation gate + pre-push safety. OpenCode solo propone comandos. |
| Romper accesibilidad | Low | `CoursesListPage` con `<input type="search">` + `<label>` asociado, filtros con `<fieldset>/<legend>` sr-only, tarjetas con `<article>` semántico y `aria-current="page"` en breadcrumb. `CourseDetailPage` con breadcrumb `<a>` + `<dl>/<dt>/<dd>` con directiva `appCampoDato`. `CourseEditorPage` con fieldset/legend, label asociado, `autocomplete` correcto, foco al error tras submit inválido, `aria-describedby` para mensajes de validación. Foco global preservado. `prefers-reduced-motion` respetado. `BandaEstado` es el único dueño de `aria-live`/`aria-atomic`. |
| `HttpCoursesService` futuro colisiona con `proxy.conf.json` | Low (no se implementa en F2-04) | Si Marcos aprueba HTTP futuro, NO debe pasar por el proxy público `/certificados/api` (es server-to-server, vía cPanel Basic Auth o PHP HttpOnly, no desde el browser). Documentar en la spec `admin-courses-frontend` cuando se cree. |
| Costo de OpenCode al portar v0 | Low | `muestra_pagina/components/admin/curso-editor.tsx` (29.2 KB) **no** se abre como archivo completo; solo se inspecciona con `Read` las primeras 80 líneas o con `codegraph_explore` si estuviera disponible. Sin instalar CodeGraph en este ciclo (decisión de Marcos). |
| `codegraph` no disponible en este entorno | Low | CodeGraph no se inicializa (decisión de Marcos). Se usan `Read`/`Grep`/`Glob` puntuales para inspección segura. No se aplica a la doc de soft launch porque ya está activa. |
| `Engram` `mem_save` falla por schema antiguo | Low | Si el schema rechaza `capture_prompt`, se omite el campo. Documentado en `sdd-phase-common.md:55`. |

## Review Workload Forecast

| Campo | Valor |
|---|---|
| Líneas estimadas modificadas/agregadas | ~1100-1450 (3 features × ~250 + 1 modelo ~80 + 1 servicio ~250 + tests de servicio ~130 + 1 routes patch ~40 + 1 routes spec patch ~50 + patch de docs ~30 + patch de dashboard ~25 + patch de sidebar ~10 + patch de index ~1) |
| Riesgo de exceder el presupuesto de 1500 líneas | **Medium** (margen 50-400; dividir si pasa) |
| PRs encadenados recomendados | **Conditional** (si forecast final > 1500 → dividir en PR #1 listado + PR #2 detalle+editor) |
| Estrategia de entrega | single-pr sobre `frontend/admin-courses-dates`; fallback chained |
| Decisión antes de apply | **Sí** — `sdd-propose` debe confirmar las 7 decisiones listadas arriba. |
| Tiempo estimado de revisión | Medio-alto: 1 PR con 3 features nuevos + 1 modelo + 1 servicio + 5 rutas + 1 routes patch + 1 tests patch + 4 doc/component patches; tests verde; sin deploy, sin build prod nuevo, sin backend. |
| `Decision needed before apply` | **Yes** (7 decisiones listadas) |
| `Chained PRs recommended` | **Conditional** (depende del forecast final de `sdd-tasks`) |
| `400-line budget risk` | **Low** (cambio en 1 PR ~1300 líneas, sin recencia de 400 en archivos individuales) |
| `1500-line budget risk` | **Medium** (forecast 1100-1450; margen 50-400) |

## Relevant files (read in this exploration)

- `AGENTS.md` (133 líneas) — reglas operativas, política Git, X-Admin-Key, DNI completo, rama sugerida.
- `apps/frontend-angular/AGENTS.md` (18 líneas) — reglas del frontend Angular.
- `docs/00-indice-general.md` (52 líneas) — ruta de lectura mínima vigente.
- `docs/opencode/optimizacion-tokens.md` (105 líneas) — uso de `RTK`, perfil eficiente, Graphify solo para Marcos.
- `MATIAS_PROMPTS_SDD_3_SEMANAS_CICLOS_GIT.md` (extracto: F2-04 líneas 901-946, índice F0-F6 líneas 11-46, división operativa frontend líneas 48-54) — definición exacta del ciclo, su rama, su índice de gobernanza.
- `docs/frontend/00-angular20-port-v0.md` (232 líneas) — fuente de verdad del port, división de responsabilidades Marcos/Matías, inventario prompts 4-22, tokens visuales observados, componentes candidatos, riesgos, estado F1-02/F2-03/M3-06.
- `docs/frontend/02-sistema-visual-v0-f1-02.md` (118 líneas) — tokens F1-02, primitivos disponibles, reglas de uso, fuera de alcance, verificación.
- `apps/frontend-angular/src/app/app.routes.ts` (59 líneas) — rutas vigentes post F2-03.
- `apps/frontend-angular/src/app/app.routes.spec.ts` — cobertura de rutas post F2-03.
- `apps/frontend-angular/src/app/app.config.ts` (36 líneas) — providers y `MOCK_SESSION`/`VALIDATION_SOURCE`.
- `apps/frontend-angular/src/app/features/admin/admin-shell.ts/.html/.css/.spec.ts` — shell admin con dashboard inline, topbar, sidebar, drawer, footer, badge.
- `apps/frontend-angular/src/app/features/admin/sidebar-admin.ts/.html/.css/.spec.ts` — navegación con 5 ítems (Inicio activo, Cursos/Alumnos/Asistencias/Certificaciones placeholders).
- `apps/frontend-angular/src/app/features/admin/admin-dashboard-page.ts/.html/.css/.spec.ts` — placeholder con 3 tarjetas "Próximamente".
- `apps/frontend-angular/src/app/features/admin/admin-guard.ts/.spec.ts`, `mock-session.ts/.spec.ts`, `login-form.*`, `login-page.*` — base operativa F2-03.
- `apps/frontend-angular/src/app/shared/certificates/*` — validación intacta (no se toca en F2-04).
- `apps/frontend-angular/src/app/shared/ui/*` (4 primitivos F1-02) — `BandaEstado`, `CampoDato`, `FolioShell`, `HeaderInstitucional`.
- `apps/frontend-angular/src/styles.css` (119 líneas) — tokens F1-02 completos.
- `apps/frontend-angular/angular.json` (133 líneas) — presupuestos y base href.
- `apps/frontend-angular/package.json` (49 líneas) — confirmar ausencia de Tailwind/shadcn/lucide/auth libs.
- `muestra_pagina/app/admin/cursos/page.tsx` (17 líneas) — entrada del listado.
- `muestra_pagina/app/admin/cursos/nuevo/page.tsx` (17 líneas) — entrada del editor (nuevo).
- `muestra_pagina/app/admin/cursos/[id]/page.tsx` (17 líneas) — entrada del detalle.
- `muestra_pagina/components/admin/lista-cursos.tsx` (713 líneas, lectura segura, primeras 120 líneas) — patrón de filtros toggle, 4 vistas, tarjeta, contadores, acciones.
- `muestra_pagina/components/admin/curso-detalle.tsx` (344 líneas, lectura segura, primeras 80 líneas) — patrón de breadcrumb, ficha, lista de fechas.
- `muestra_pagina/components/admin/curso-editor.tsx` (29.2 KB, **NO portable**; lectura parcial por nombre/estructura solamente) — patrón estructural de fieldset/legend, validación, lista inline de fechas.
- `openspec/specs/admin-foundation/spec.md` (94 líneas) — handoff explícito a F2-04..F2-06 (líneas 80-94), regla de no auth real (líneas 44-60).
- `openspec/specs/admin-master-data-api/spec.md` (111 líneas) — contrato backend: cursos, fechas, errores, privacidad.
- `docs/backend/01-contrato-api-certificados.md` (693 líneas, extractos relevantes) — endpoints admin de cursos y fechas (líneas 27-40), DTOs (líneas 110-126), errores (líneas 130-137), privacidad (líneas 530-534).
- `openspec/changes/archive/2026-07-07-f2-03-admin-login-shell/exploration.md` (Engram #5172) — precedente estructural de `explore.md` con secciones in/out/affected/risks/forecast/ready, mismo template aplicado a F2-04.
- Engram: 3 observaciones previas de F2-03 (explore/spec/proposal) + 4 de tareas + 2 de sesiones; sin observaciones específicas de F2-04. Contexto: 5 sesiones recientes de revisión y merge de F1-02 (PR #33) + F2-03 (PR #34) ya mergeado; `main` actualizado, rama `frontend/admin-courses-dates` limpia.

## Do not touch (read-only this cycle)

- `apps/frontend-angular/src/styles.css` (tokens F1-02 suficientes; no se introducen tokens nuevos).
- `apps/frontend-angular/src/app/app.html`, `app.ts`, `app.config.ts`, `app.css` (intactos: el shell raíz no cambia).
- `apps/frontend-angular/src/app/shared/certificates/*` (intactos: validación pública no se toca).
- `apps/frontend-angular/src/app/shared/ui/*` (4 primitivos F1-02; F2-04 los consume sin modificarlos).
- `apps/frontend-angular/src/app/features/landing/*`, `features/not-found/*`, `features/public-validation/*` (intactos).
- `apps/frontend-angular/src/app/features/admin/mock-session.ts`, `admin-guard.ts`, `login-form.*`, `login-page.*`, `admin-shell.css` (intactos; solo cambia `admin-shell.html` línea 40 + `admin-shell.ts` import + `sidebar-admin.ts` 1-2 líneas + `admin-dashboard-page.*` primera tarjeta).
- `apps/frontend-angular/src/environments/*` (intactos: F2-04 no agrega endpoint admin al environment).
- `apps/frontend-angular/angular.json`, `package.json`, `tsconfig*.json`, `proxy.conf.json`, `karma.conf.*`, `src/index.html` (intactos: no se modifica config).
- `muestra_pagina/` salvo lectura segura listada arriba.
- `apps/backend-php/`, `database/`, `deploy/`, `docker/`, `.htaccess`, `material_privado_no_versionar/`, `.env*`, dumps, logs, secretos.
- Cualquier archivo bajo `openspec/changes/` distinto a `f2-04-admin-courses-dates/`.
- Ramas no mergeadas: `frontend/v0-design-system` y `frontend/admin-foundation` ya mergeadas (PR #33 y PR #34). `frontend/admin-courses-dates` parte de `main` actualizado.

## Ready for Proposal

**Yes**, con 7 decisiones a resolver en `sdd-propose`:

1. **Migración de `AdminDashboardPage` a child route** (recomendado: sí).
2. **`isActive()` con `startsWith('/admin/cursos')` para rutas hijas** (recomendado: sí).
3. **Sub-ruta `/admin/cursos/:id/editar` vs editor como vista separada** (recomendado: sub-ruta con `modo='editar'`).
4. **Sub-ruta para nueva fecha vs inline** (recomendado: inline simple).
5. **Banner de "datos de demostración"** (recomendado: visible en cada página de cursos).
6. **Delta a spec base** (recomendado: spec nueva `admin-courses-frontend` con criterios portables).
7. **División en chained PRs** (recomendado: single-pr si forecast < 1500; chained si > 1500).

**Próxima fase recomendada**: `sdd-propose`. Tamaño estimado: 100-150 líneas de `proposal.md`, 7 decisiones explícitas con respuesta de Matías, y forecast de revisión.

**Estructura esperada del change folder**:
```
openspec/changes/f2-04-admin-courses-dates/
├── exploration.md         (este archivo)
├── proposal.md            (sdd-propose)
├── design.md              (sdd-design)
├── tasks.md               (sdd-tasks)
├── specs/                 (sdd-spec, recomendado: spec nueva admin-courses-frontend)
│   └── admin-courses-frontend/
│       └── spec.md
├── apply-progress.md      (sdd-apply)
├── verify-report.md       (sdd-verify)
└── archive-report.md      (sdd-archive)
```

**Mensaje de commit sugerido** (a proponer en `sdd-archive`, no a ejecutar en este turno):
`feat(frontend): preparar cursos y fechas admin (F2-04)`.
