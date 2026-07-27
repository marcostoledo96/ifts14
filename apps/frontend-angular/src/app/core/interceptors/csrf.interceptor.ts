// Interceptor CSRF + credentials: inyecta X-CSRF-Token en requests mutantes,
// habilita withCredentials para cookies de sesión, y ante 401 (sesión expirada)
// limpia CSRF y navega a /admin/login sin propagar el error a las páginas.
import { HttpErrorResponse, HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { NEVER, catchError, throwError } from 'rxjs';
import { ADMIN_AUTH } from '../../features/admin/admin-auth.service';

const MUTATING_METHODS = new Set(['POST', 'PUT', 'PATCH', 'DELETE']);

/** Evita N navigates paralelos cuando varias APIs fallan 401 a la vez. */
let redirectingToLogin = false;

export const csrfInterceptor: HttpInterceptorFn = (req, next) => {
  const auth = inject(ADMIN_AUTH);
  const router = inject(Router);
  const token = auth.csrfToken();

  let finalReq = req.clone({ withCredentials: true });
  if (token && MUTATING_METHODS.has(req.method.toUpperCase())) {
    finalReq = finalReq.clone({ setHeaders: { 'X-CSRF-Token': token } });
  }

  return next(finalReq).pipe(
    catchError((err: HttpErrorResponse) => {
      // Login fallido debe llegar a LoginPage (mensaje de credenciales).
      const isLoginAttempt = /\/admin\/auth\/login\/?(\?|$)/.test(req.url);
      if (err.status === 401 && !isLoginAttempt) {
        auth.clearSession();
        if (!redirectingToLogin) {
          redirectingToLogin = true;
          void router.navigateByUrl('/admin/login').finally(() => {
            redirectingToLogin = false;
          });
        }
        // NEVER: la vista queda en loading hasta que el router destruye el componente.
        return NEVER;
      }
      return throwError(() => err);
    }),
  );
};

/** Solo tests: resetea el latch de redirect. */
export function resetCsrfInterceptorRedirectLatchForTests(): void {
  redirectingToLogin = false;
}
