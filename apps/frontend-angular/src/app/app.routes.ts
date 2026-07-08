import { Routes } from '@angular/router';
import { adminGuard } from './features/admin/admin-guard';
import { COURSES_SOURCE } from './features/admin/courses/courses.service';
import { InMemoryCoursesService } from './features/admin/courses/in-memory-courses.service';

export const routes: Routes = [
  // La raíz carga una página de inicio no validante: no llama a la API ni usa
  // tokens de demo. La validación sólo ocurre en validar/:tokenCertificacion.
  {
    path: '',
    loadComponent: () =>
      import('./features/landing/landing-page').then((m) => m.LandingPage),
    pathMatch: 'full',
  },
  {
    path: 'validar/:tokenCertificacion',
    loadComponent: () =>
      import('./features/public-validation/public-validation-page').then(
        (m) => m.PublicValidationPage,
      ),
  },
  // Rutas admin F2-03/F2-04: sesión mock en memoria. NO usar la clave admin
  // temporal en bundle ni storage/cookies/red. Ver spec admin-foundation.
  {
    path: 'admin/login',
    title: 'Admin · Login (mock) — IFTS 14',
    loadComponent: () =>
      import('./features/admin/login-page').then((m) => m.LoginPage),
  },
  {
    // /admin redirige al dashboard; adminGuard del shell manda a /admin/login
    // si no hay sesión mock.
    path: 'admin',
    redirectTo: '/admin/dashboard',
    pathMatch: 'full',
  },
  {
    // Shell admin con rutas hijas: dashboard, cursos (listado, nuevo,
    // editar, detalle). El orden dentro de children importa: rutas estáticas
    // (nuevo, :id/editar) deben ir ANTES que :id y que el listado para no
    // caer en el parámetro.
    path: 'admin',
    canActivate: [adminGuard],
    // ponytail: provee COURSES_SOURCE solo en el árbol admin/cursos; sin
    // HTTP/storage/secretos. Si se saca, /admin/cursos* falla con
    // NullInjectorError en runtime (no en specs, que lo proveen a mano).
    providers: [
      { provide: COURSES_SOURCE, useClass: InMemoryCoursesService },
    ],
    loadComponent: () =>
      import('./features/admin/admin-shell').then((m) => m.AdminShell),
    children: [
      {
        path: 'dashboard',
        title: 'Admin · Dashboard (mock) — IFTS 14',
        loadComponent: () =>
          import('./features/admin/admin-dashboard-page').then((m) => m.AdminDashboardPage),
      },
      {
        path: 'cursos/nuevo',
        data: { mode: 'create' },
        loadComponent: () =>
          import('./features/admin/courses/course-editor-page').then((m) => m.CourseEditorPage),
      },
      {
        path: 'cursos/:id/editar',
        data: { mode: 'edit' },
        loadComponent: () =>
          import('./features/admin/courses/course-editor-page').then((m) => m.CourseEditorPage),
      },
      {
        path: 'cursos/:id',
        loadComponent: () =>
          import('./features/admin/courses/course-detail-page').then((m) => m.CourseDetailPage),
      },
      {
        path: 'cursos',
        loadComponent: () =>
          import('./features/admin/courses/courses-list-page').then((m) => m.CoursesListPage),
      },
    ],
  },
  // Aislamiento admin: captura cualquier /admin/* no matcheado arriba
  // (/admin/typo) ANTES de que caiga al wildcard público. pathMatch 'prefix'
  // hace de catch-all admin; el redirect manda al dashboard, donde
  // adminGuard envía sin sesión a /admin/login. Va después del bloque admin
  // con children para no interceptarlo.
  {
    path: 'admin',
    pathMatch: 'prefix',
    redirectTo: '/admin/dashboard',
  },
  // Las URLs inválidas no deben colisionar con un token de demo conocido.
  // Llevan a una página no encontrada que no valida nada.
  {
    path: '**',
    loadComponent: () =>
      import('./features/not-found/not-found-page').then((m) => m.NotFoundPage),
  },
];