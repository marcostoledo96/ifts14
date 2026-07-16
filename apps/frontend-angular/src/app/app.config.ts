import {
  ApplicationConfig,
  provideBrowserGlobalErrorListeners,
  provideZoneChangeDetection,
} from '@angular/core';
import { provideRouter, withComponentInputBinding } from '@angular/router';
import { provideHttpClient, withInterceptors } from '@angular/common/http';

import { routes } from './app.routes';
import { VALIDATION_SOURCE } from './shared/certificates/validation-source';
import { MockValidationSource } from './shared/certificates/mock-tokens';
import { HttpValidationSource } from './shared/certificates/http-validation.source';
import { ADMIN_AUTH, HttpAdminAuthService } from './features/admin/admin-auth.service';
import { csrfInterceptor } from './core/interceptors/csrf.interceptor';
import { environment } from '../environments/environment';

// provideHttpClient con interceptor CSRF que también habilita withCredentials
// para enviar cookies de sesión PHP (HttpOnly, Secure, SameSite=Strict).
// ADMIN_AUTH reemplaza MOCK_SESSION: autenticación real contra backend.
export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),
    provideZoneChangeDetection({ eventCoalescing: true }),
    provideRouter(routes, withComponentInputBinding()),
    provideHttpClient(withInterceptors([csrfInterceptor])),
    {
      provide: VALIDATION_SOURCE,
      useClass: environment.useRealApi ? HttpValidationSource : MockValidationSource,
    },
    { provide: ADMIN_AUTH, useExisting: HttpAdminAuthService },
  ],
};