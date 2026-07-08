# Design: F2-04 — Cursos y fechas admin

## Enfoque técnico

Implementar una UI Angular 20 standalone, mínima y navegable para cursos/fechas dentro del admin mock existente. El cambio migra `AdminShell` a rutas hijas con `<router-outlet />`, activa `Cursos`, agrega páginas contract-ready y mantiene datos solo en memoria: sin HTTP, storage, claves, DNI, tokens ni dependencias nuevas.

## Decisiones de arquitectura

| Opción | Tradeoff | Decisión |
|---|---|---|
| Rutas hijas bajo `admin` vs rutas planas `admin/dashboard` + shell repetido | Hijas requieren reordenar rutas, pero evita duplicar shell y cumple el comentario F2-03. | Usar `path: 'admin', canActivate: [adminGuard], loadComponent: AdminShell, children: [...]`. Mantener `admin/login` fuera del shell y un catch-all admin antes de `**`. |
| Activación por igualdad vs prefijo | Igualdad no activa `/admin/cursos/nuevo`; prefijo es simple y route-agnostic. | `SidebarAdmin.isActive()` usa igualdad para Inicio y `startsWith('/admin/cursos')` para Cursos. |
| Servicio mock directo vs `HttpCoursesService` | HTTP sería más realista, pero expondría frontera admin no aprobada. | `CoursesService` + `InMemoryCoursesService` provisto en root/feature; no crear implementación HTTP en F2-04. |
| Estados de curso `activo/inactivo` vs contrato real | `inactivo` no aparece en el servicio backend actual; el backend usa `borrador`, `activo`, `cerrado`, `archivado`. | Tipar `EstadoCurso` con los estados backend actuales para no generar deuda de contrato. UI seed ficticia usa combinaciones seguras. |

## Flujo de datos

```txt
/admin/cursos* ─→ adminGuard ─→ AdminShell ─→ router-outlet
                                      │
                                      ├─ SidebarAdmin(active por URL)
                                      └─ Courses*Page ─→ COURSES_SOURCE/InMemoryCoursesService
                                                            └─ seed ficticio mutable en memoria
```

## Arquitectura de rutas exacta

`app.routes.ts` debe preservar orden:

```ts
{ path: 'admin/login', loadComponent: () => import('./features/admin/login-page').then(m => m.LoginPage) },
{ path: 'admin', redirectTo: '/admin/dashboard', pathMatch: 'full' },
{
  path: 'admin',
  canActivate: [adminGuard],
  loadComponent: () => import('./features/admin/admin-shell').then(m => m.AdminShell),
  children: [
    { path: 'dashboard', title: 'Admin · Dashboard (mock) — IFTS 14', loadComponent: () => import('./features/admin/admin-dashboard-page').then(m => m.AdminDashboardPage) },
    { path: 'cursos/nuevo', data: { mode: 'create' }, loadComponent: () => import('./features/admin/courses/course-editor-page').then(m => m.CourseEditorPage) },
    { path: 'cursos/:id/editar', data: { mode: 'edit' }, loadComponent: () => import('./features/admin/courses/course-editor-page').then(m => m.CourseEditorPage) },
    { path: 'cursos/:id', loadComponent: () => import('./features/admin/courses/course-detail-page').then(m => m.CourseDetailPage) },
    { path: 'cursos', loadComponent: () => import('./features/admin/courses/courses-list-page').then(m => m.CoursesListPage) },
  ],
},
{ path: 'admin', pathMatch: 'prefix', redirectTo: '/admin/dashboard' },
{ path: '**', loadComponent: () => import('./features/not-found/not-found-page').then(m => m.NotFoundPage) },
```

## Cambios de archivos

| Archivo | Acción | Descripción |
|---|---|---|
| `app.routes.ts`, `app.routes.spec.ts` | Modificar | Rutas hijas, guard, catch-all admin y pruebas anti-regresión. |
| `features/admin/admin-shell.ts/html` | Modificar | Reemplazar dashboard inline por `RouterOutlet`; no tocar CSS/drawer. |
| `features/admin/sidebar-admin.*` | Modificar | `Cursos` link real, activo por prefijo; placeholders restantes deshabilitados. |
| `features/admin/admin-dashboard-page.*` | Modificar | Tarjeta Cursos como link real; Asistencias/Certificaciones siguen placeholders. |
| `features/admin/courses/*` | Crear | Modelos, servicio en memoria, listado, detalle, editor y specs. |
| `docs/frontend/00-angular20-port-v0.md` | Modificar en archive | Estado F2-04, límites y handoff F2-05/F2-06. |

## Interfaces / contratos

```ts
export type EstadoCurso = 'borrador' | 'activo' | 'cerrado' | 'archivado';
export type EstadoFecha = 'programada' | 'realizada' | 'cancelada';
export interface Curso { id: number; codigo: string; nombre: string; estado: EstadoCurso; createdAt: string; updatedAt: string; }
export interface CursoFecha { id: number; cursoId: number; fecha: string; descripcion: string | null; orden: number; estado: EstadoFecha; }
export interface CoursesService { listar(f?: CursosFiltros): Promise<Curso[]>; obtener(id: number): Promise<CursoDetalle>; crear(dto: CursoDraft): Promise<CursoDetalle>; actualizarEstado(id: number, estado: EstadoCurso): Promise<CursoDetalle>; listarFechas(cursoId: number): Promise<CursoFecha[]>; guardarFecha(cursoId: number, dto: CursoFechaDraft): Promise<CursoFecha>; }
```

Seed: 6 cursos ficticios, 1–3 fechas por curso, sin estudiantes, DNI, emails, tokens, códigos reales ni storage. Mutaciones viven solo en la instancia en memoria y muestran banner: “Datos de demostración: los cambios no se persisten al recargar”.

## Estrategia de pruebas

| Capa | Qué probar | Enfoque |
|---|---|---|
| Unit | Servicio, filtros, validación local, navegación de componentes. | Karma/Jasmine con seed reset por test. |
| Routing | `/admin/cursos*` protegido, dashboard hijo, catch-all admin antes de `**`; `cursos/nuevo` y `cursos/:id/editar` no deben caer en `:id` ni en listado. | `app.routes.spec.ts` + navegación real con/sin sesión mock. |
| Seguridad/CI | Sin `X-Admin-Key`, storage, HTTP, DNI/token fields ni dependencias nuevas. | Tests/grep sobre `src/app/features/admin/courses`, `npm run test:ci`, `npm run build`. |

## Accesibilidad y responsive

Usar `<section>`, `<article>`, `<dl>`, `fieldset/legend`, labels asociados, foco visible global, `BandaEstado` como única región live, `input type="search"`, `input type="date"`, `select` nativo y layout mobile-first. El drawer F2-03 no se modifica: no debe reaparecer `aria-controls` hacia nodos ausentes.

## Migración / rollout

Sin migración de datos ni deploy. Rollback: quitar `features/admin/courses/`, restaurar dashboard inline, devolver `Cursos` a placeholder y remover rutas/docs F2-04.

## Carga de revisión

Forecast producto/docs: 1100–1450 líneas. Riesgo 1500: medio. Si `sdd-tasks` proyecta >1500, dividir antes de apply: PR 1 rutas+shell+sidebar+dashboard+listado+servicio; PR 2 detalle+editor+tests restantes.

## Preguntas abiertas

- Ninguna bloqueante.
