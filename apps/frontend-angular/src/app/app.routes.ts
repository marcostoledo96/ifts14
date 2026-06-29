import { Routes } from '@angular/router';

export const routes: Routes = [
  // La raíz redirige a la demo válida: punto de entrada legítimo.
  { path: '', redirectTo: 'validar/demo-valido', pathMatch: 'full' },
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