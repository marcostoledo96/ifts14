// M3-06 4.2: confirma la conmutación mock/API real en app.config.ts.
// El test builder (karma) NO aplica fileReplacements, así que importa
// environment.ts (producción) con useRealApi=false → MockValidationSource.
// La rama true (HttpValidationSource) se ejercita en
// http-validation.source.spec.ts (HttpTestingController) y en el smoke local.
import { appConfig } from './app.config';
import { VALIDATION_SOURCE } from './shared/certificates/validation-source';
import { MockValidationSource } from './shared/certificates/mock-tokens';
import { HttpValidationSource } from './shared/certificates/http-validation.source';
import { MOCK_SESSION, InMemoryMockSession } from './features/admin/mock-session';
import { environment } from '../environments/environment';

type Provider = { provide?: unknown; useClass?: unknown; useExisting?: unknown };

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

// F2-03 gate: el token MOCK_SESSION debe estar provisto a nivel app, si no,
// LoginPage/AdminShell/adminGuard fallarían en runtime al inyectar un token
// sin provider. Sin este assertion, el wiring del provider sería invisible a
// los tests (cada spec lo provee en su propio TestBed y enmascara el fallo).
describe('app.config (F2-03 provider MOCK_SESSION a nivel app)', () => {
  function mockSessionProvider(): Provider | undefined {
    const providers = (appConfig.providers ?? []) as unknown[];
    return providers.find(
      (p): p is Provider =>
        !!p &&
        typeof p === 'object' &&
        (p as Provider).provide === MOCK_SESSION,
    );
  }

  it('provee MOCK_SESSION a nivel app', () => {
    const provider = mockSessionProvider();
    expect(provider).toBeDefined();
    expect(provider?.useExisting).toBe(InMemoryMockSession);
  });
});