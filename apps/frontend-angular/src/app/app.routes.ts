import { Routes } from '@angular/router';

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
  // Las URLs inválidas no deben colisionar con un token de demo conocido.
  // Llevan a una página no encontrada que no valida nada.
  {
    path: '**',
    loadComponent: () =>
      import('./features/not-found/not-found-page').then((m) => m.NotFoundPage),
  },
];