import {
  ADMIN_SEED_CERT1_DTO,
  MockValidationSource,
  mockPublicValidationToken,
  resetMockAdminPublicStatus,
  setMockAdminPublicStatus,
} from './mock-tokens';
import {
  clearMockAdminLiveEstadoResolver,
  registerMockAdminLiveEstadoResolver,
} from './mock-admin-bridge';

describe('MockValidationSource — tokens admin seed', () => {
  const source = new MockValidationSource();

  afterEach(() => {
    resetMockAdminPublicStatus();
    clearMockAdminLiveEstadoResolver();
  });

  it('mockPublicValidationToken alinea prefijo con Copiar link', () => {
    expect(mockPublicValidationToken('prefijo_demo_a1b')).toBe('prefijo_demo_a1b-completo');
  });

  it('prefijo_demo_a1b-completo → vigente Demo Uno (DNI + fechas)', async () => {
    const result = await source.fetch(mockPublicValidationToken('prefijo_demo_a1b'));
    expect(result.ok).toBeTrue();
    if (!result.ok) return;
    expect(result.envelope.data).toEqual(ADMIN_SEED_CERT1_DTO);
    expect(result.envelope.data.student.documentNumber).toBe('12345678');
    expect(result.envelope.data.course.attendedDates?.length).toBe(3);
  });

  it('prefijo_demo_i5j-completo → revocado', async () => {
    const result = await source.fetch(mockPublicValidationToken('prefijo_demo_i5j'));
    expect(result.ok).toBeFalse();
    if (result.ok) return;
    expect(result.error?.error.code).toBe('CERTIFICATE_REVOKED');
  });

  it('prefijo_demo_g4h-completo → expirado', async () => {
    const result = await source.fetch(mockPublicValidationToken('prefijo_demo_g4h'));
    expect(result.ok).toBeFalse();
    if (result.ok) return;
    expect(result.error?.error.code).toBe('CERTIFICATE_EXPIRED');
  });

  it('prefijo_demo_e3f-completo (borrador) → no encontrado', async () => {
    const result = await source.fetch(mockPublicValidationToken('prefijo_demo_e3f'));
    expect(result.ok).toBeFalse();
    if (result.ok) return;
    expect(result.error?.error.code).toBe('CERTIFICATE_NOT_FOUND');
  });

  it('demo-valido sigue vigente (fixtures de UI pública)', async () => {
    const result = await source.fetch('demo-valido');
    expect(result.ok).toBeTrue();
  });

  it('live bridge: estado InMemory revocado gana sobre fixture vigente', async () => {
    registerMockAdminLiveEstadoResolver((token) =>
      token === mockPublicValidationToken('prefijo_demo_c2d') ? 'revocado' : null,
    );
    const result = await source.fetch(mockPublicValidationToken('prefijo_demo_c2d'));
    expect(result.ok).toBeFalse();
    if (result.ok) return;
    expect(result.error?.error.code).toBe('CERTIFICATE_REVOKED');
  });

  it('storage revocado gana aunque el puente viva diga vigente', async () => {
    const token = mockPublicValidationToken('prefijo_demo_c2d');
    setMockAdminPublicStatus('prefijo_demo_c2d', 'revocado');
    registerMockAdminLiveEstadoResolver((t) => (t === token ? 'vigente' : null));
    const result = await source.fetch(token);
    expect(result.ok).toBeFalse();
    if (result.ok) return;
    expect(result.error?.error.code).toBe('CERTIFICATE_REVOKED');
  });

  it('sin live bridge, prefijo_demo_c2d-completo sigue vigente (fixture)', async () => {
    const result = await source.fetch(mockPublicValidationToken('prefijo_demo_c2d'));
    expect(result.ok).toBeTrue();
  });
});
