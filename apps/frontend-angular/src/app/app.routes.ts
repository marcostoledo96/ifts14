import { Routes } from '@angular/router';

export const routes: Routes = [
  { path: '', redirectTo: 'validar/demo-valido', pathMatch: 'full' },
  {
    path: 'validar/:tokenCertificacion',
    loadComponent: () =>
      import('./features/public-validation/public-validation-page').then(
        (m) => m.PublicValidationPage,
      ),
  },
  { path: '**', redirectTo: 'validar/demo-valido' },
];