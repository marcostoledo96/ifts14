import {
  ApplicationConfig,
  provideBrowserGlobalErrorListeners,
  provideZoneChangeDetection,
} from '@angular/core';
import { provideRouter, withComponentInputBinding } from '@angular/router';

import { routes } from './app.routes';
import { VALIDATION_SOURCE } from './shared/certificates/validation-source';
import { MockValidationSource } from './shared/certificates/mock-tokens';

// ponytail: provideHttpClient diferido a Fase 3. La fuente mock satisface
// VALIDATION_SOURCE para que ValidationService tenga su dependencia concreta.
export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),
    provideZoneChangeDetection({ eventCoalescing: true }),
    provideRouter(routes, withComponentInputBinding()),
    { provide: VALIDATION_SOURCE, useClass: MockValidationSource },
  ],
};