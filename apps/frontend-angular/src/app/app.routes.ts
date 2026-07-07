import { Routes } from '@angular/router';
import { adminGuard } from './features/admin/admin-guard';

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
  // Rutas admin F2-03: sesión mock en memoria. NO usar la clave admin temporal
  // en bundle ni storage/cookies/red. Ver spec admin-foundation.
  {
    path: 'admin/login',
    title: 'Admin · Login (mock) — IFTS 14',
    loadComponent: () =>
      import('./features/admin/login-page').then((m) => m.LoginPage),
  },
  {
    // /admin redirige al dashboard; adminGuard del dashboard manda a /admin/login
    // si no hay sesión mock.
    path: 'admin',
    redirectTo: '/admin/dashboard',
    pathMatch: 'full',
  },
  {
    path: 'admin/dashboard',
    title: 'Admin · Dashboard (mock) — IFTS 14',
    canActivate: [adminGuard],
    loadComponent: () =>
      import('./features/admin/admin-shell').then((m) => m.AdminShell),
  },
  // Las URLs inválidas no deben colisionar con un token de demo conocido.
  // Llevan a una página no encontrada que no valida nada.
  {
    path: '**',
    loadComponent: () =>
      import('./features/not-found/not-found-page').then((m) => m.NotFoundPage),
  },
];