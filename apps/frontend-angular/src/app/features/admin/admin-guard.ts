// Guards admin. Sesión mock por inject(); redirige sin sesión.
// NO usa la clave admin temporal ni endpoints. Ver spec admin-foundation.
import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { MOCK_SESSION } from './mock-session';

// /admin/* exige sesión mock activa; si no, va a /admin/login.
export const adminGuard: CanActivateFn = () => {
  const session = inject(MOCK_SESSION);
  const router = inject(Router);
  if (session.hasSession()) {
    return true;
  }
  return router.parseUrl('/admin/login');
};