import {
  ApplicationConfig,
  provideBrowserGlobalErrorListeners,
  provideZoneChangeDetection,
} from '@angular/core';
import { provideRouter, withComponentInputBinding } from '@angular/router';
import { provideHttpClient } from '@angular/common/http';

import { routes } from './app.routes';
import { VALIDATION_SOURCE } from './shared/certificates/validation-source';
import { MockValidationSource } from './shared/certificates/mock-tokens';
import { HttpValidationSource } from './shared/certificates/http-validation.source';
import { MOCK_SESSION, InMemoryMockSession } from './features/admin/mock-session';
import { environment } from '../environments/environment';

// provideHttpClient habilita HttpClient para HttpValidationSource.
// Conmutación mock/API real vía environment.useRealApi (M3-06).
// useRealApi=true → HttpValidationSource contra environment.apiBaseUrl.
// useRealApi=false → MockValidationSource con tokens demo.
//
// MOCK_SESSION se provee a nivel app para que LoginPage, AdminShell y
// adminGuard resuelvan la inyección en runtime. InMemoryMockSession es
// providedIn: 'root'; useExisting evita una segunda instancia del servicio.
export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),
    provideZoneChangeDetection({ eventCoalescing: true }),
    provideRouter(routes, withComponentInputBinding()),
    provideHttpClient(),
    {
      provide: VALIDATION_SOURCE,
      useClass: environment.useRealApi ? HttpValidationSource : MockValidationSource,
    },
    { provide: MOCK_SESSION, useExisting: InMemoryMockSession },
  ],
};