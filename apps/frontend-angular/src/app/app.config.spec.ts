import { appConfig } from './app.config';
import { VALIDATION_SOURCE } from './shared/certificates/validation-source';
import { MockValidationSource } from './shared/certificates/mock-tokens';
import { HttpValidationSource } from './shared/certificates/http-validation.source';
import { ADMIN_AUTH, HttpAdminAuthService } from './features/admin/admin-auth.service';
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

  it('useRealApi:true selecciona HttpValidationSource', () => {
    expect(environment.useRealApi).toBe(true);
    const provider = validationProvider();
    expect(provider).toBeDefined();
    expect(provider?.useClass).toBe(HttpValidationSource);
  });

  it('la selección referencia HttpValidationSource para la rama real', () => {
    expect(HttpValidationSource).toBeDefined();
    expect(HttpValidationSource).not.toBe(MockValidationSource);
  });
});

// P5-04 gate: el token ADMIN_AUTH debe estar provisto a nivel app, si no,
// LoginPage/AdminShell/adminGuard fallarían en runtime al inyectar un token
// sin provider. Reemplaza el antiguo MOCK_SESSION.
describe('app.config (P5-04 provider ADMIN_AUTH a nivel app)', () => {
  function adminAuthProvider(): Provider | undefined {
    const providers = (appConfig.providers ?? []) as unknown[];
    return providers.find(
      (p): p is Provider =>
        !!p &&
        typeof p === 'object' &&
        (p as Provider).provide === ADMIN_AUTH,
    );
  }

  it('provee ADMIN_AUTH a nivel app con HttpAdminAuthService', () => {
    const provider = adminAuthProvider();
    expect(provider).toBeDefined();
    expect(provider?.useExisting).toBe(HttpAdminAuthService);
  });
});