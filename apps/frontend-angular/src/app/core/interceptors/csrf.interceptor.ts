// Interceptor CSRF + credentials: inyecta X-CSRF-Token en requests mutantes,
// habilita withCredentials para cookies de sesión, y redirige a /admin/login
// en 401 (sesión expirada).
import { HttpErrorResponse, HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { catchError, throwError } from 'rxjs';
import { ADMIN_AUTH } from '../../features/admin/admin-auth.service';

const MUTATING_METHODS = new Set(['POST', 'PUT', 'PATCH', 'DELETE']);

export const csrfInterceptor: HttpInterceptorFn = (req, next) => {
  const auth = inject(ADMIN_AUTH);
  const token = auth.csrfToken();

  let finalReq = req.clone({ withCredentials: true });
  if (token && MUTATING_METHODS.has(req.method.toUpperCase())) {
    finalReq = finalReq.clone({ setHeaders: { 'X-CSRF-Token': token } });
  }

  return next(finalReq).pipe(
    catchError((err: HttpErrorResponse) => {
      if (err.status === 401) {
        auth.clearSession();
        inject(Router).navigate(['/admin/login']);
      }
      return throwError(() => err);
    }),
  );
};