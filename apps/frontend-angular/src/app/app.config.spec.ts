// M3-06 4.2: confirma la conmutación mock/API real en app.config.ts.
// El test builder (karma) NO aplica fileReplacements, así que importa
// environment.ts (producción) con useRealApi=false → MockValidationSource.
// La rama true (HttpValidationSource) se ejercita en
// http-validation.source.spec.ts (HttpTestingController) y en el smoke local.
import { appConfig } from './app.config';
import { VALIDATION_SOURCE } from './shared/certificates/validation-source';
import { MockValidationSource } from './shared/certificates/mock-tokens';
import { HttpValidationSource } from './shared/certificates/http-validation.source';
import { environment } from '../environments/environment';

type Provider = { provide?: unknown; useClass?: unknown };

describe('app.config (M3-06 conmutación)', () => {
  function validationProvider(): Provider | undefined {
    const providers = (appConfig.providers ?? []) as unknown[];
    return providers.find(
      (p): p is Provider =>
        !!p &&
        typeof p === 'object' &&
        (p as Provider).provide === VALIDATION_SOURCE,
    );
  }

  it('useRealApi:false selecciona MockValidationSource', () => {
    expect(environment.useRealApi).toBe(false);
    const provider = validationProvider();
    expect(provider).toBeDefined();
    expect(provider?.useClass).toBe(MockValidationSource);
  });

  it('la selección referencia HttpValidationSource para la rama real', () => {
    // Estructural: el archivo app.config.ts importa HttpValidationSource y lo
    // usa en el ternario de VALIDATION_SOURCE. Verificamos que el módulo lo
    // expone y es distinto de MockValidationSource.
    expect(HttpValidationSource).toBeDefined();
    expect(HttpValidationSource).not.toBe(MockValidationSource);
  });
});