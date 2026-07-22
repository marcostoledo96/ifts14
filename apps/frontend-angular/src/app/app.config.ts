import {
  ApplicationConfig,
  ENVIRONMENT_INITIALIZER,
  inject,
  provideBrowserGlobalErrorListeners,
  provideZoneChangeDetection,
} from '@angular/core';
import { provideRouter, withComponentInputBinding } from '@angular/router';
import { provideHttpClient, withInterceptors } from '@angular/common/http';

import { routes } from './app.routes';
import { VALIDATION_SOURCE } from './shared/certificates/validation-source';
import {
  MockValidationSource,
  resetMockAdminPublicStatus,
} from './shared/certificates/mock-tokens';
import { HttpValidationSource } from './shared/certificates/http-validation.source';
import { ADMIN_AUTH, HttpAdminAuthService } from './features/admin/admin-auth.service';
import { csrfInterceptor } from './core/interceptors/csrf.interceptor';
import { environment } from '../environments/environment';
import { InMemoryCertificationsService } from './features/admin/certifications/in-memory-certifications.service';

function initMockCertificationsBridge(): void {
  const certs = inject(InMemoryCertificationsService);

  if (typeof window !== 'undefined') {
    const params = new URLSearchParams(window.location.search);
    const wantsReset = params.has('mockReset') || window.location.hash === '#mockReset';

    const reset = () => {
      resetMockAdminPublicStatus();
      certs.resetToSeed();
    };

    // Consola: __IFTS14_MOCK_RESET__() → seed limpio + reload.
    (window as unknown as { __IFTS14_MOCK_RESET__?: () => void }).__IFTS14_MOCK_RESET__ = () => {
      reset();
      window.location.href = `${window.location.origin}/certificados/admin/certificaciones`;
    };

    if (wantsReset) {
      reset();
      // Recarga limpia sin query (F5 ya no rehidrata revocaciones).
      window.location.replace(`${window.location.origin}/certificados/admin/certificaciones`);
      return;
    }
  }
  // Por si quedó estado sucio de HMR sin F5 completo.
  if (typeof window !== 'undefined' && new URLSearchParams(window.location.search).has('mockReseed')) {
    certs.resetToSeed();
  }
}

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
    // Mock: construye InMemory root + puente admin↔validación; soporta ?mockReset=1.
    ...(environment.useRealApi
      ? []
      : [
          {
            provide: ENVIRONMENT_INITIALIZER,
            multi: true,
            useValue: initMockCertificationsBridge,
          },
        ]),
    { provide: ADMIN_AUTH, useExisting: HttpAdminAuthService },
  ],
};