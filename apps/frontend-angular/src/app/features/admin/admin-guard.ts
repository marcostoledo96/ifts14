// Guard admin: verifica sesión real contra backend PHP.
// Si no hay sesión o error de red, redirige a /admin/login.
import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { ADMIN_AUTH } from './admin-auth.service';

export const adminGuard: CanActivateFn = async () => {
  const auth = inject(ADMIN_AUTH);
  const router = inject(Router);
  const authenticated = await auth.session();
  if (authenticated) {
    return true;
  }
  return router.parseUrl('/admin/login');
};