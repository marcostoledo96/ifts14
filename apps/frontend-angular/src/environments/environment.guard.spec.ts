// P5-03: guarda de build — falla en CI si environment.ts usa mocks.
// Este test importa el entorno por defecto (environment.ts = producción).
// Si alguien cambia useRealApi a false, el test rompe en npm run test:ci.
import { environment } from './environment';

describe('Environment guard (P5-03)', () => {
  it('producción DEBE usar API real (useRealApi: true)', () => {
    expect(environment.useRealApi).toBe(true);
  });

  it('apiBaseUrl de producción debe ser /certificados/api', () => {
    expect(environment.apiBaseUrl).toBe('/certificados/api');
  });
});
