import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { VALIDATION_SOURCE } from '../../shared/certificates/validation-source';
import { ValidationSource, ValidationSourceResult } from '../../shared/certificates/validation-source';
import { MockValidationSource } from '../../shared/certificates/mock-tokens';
import { PublicValidationPage } from './public-validation-page';

function configureProviders(source: ValidationSource) {
  return [
    provideRouter([]),
    { provide: VALIDATION_SOURCE, useValue: source },
  ];
}

class StubSource implements ValidationSource {
  constructor(private readonly result: ValidationSourceResult) {}
  async fetch(_token: string, _signal?: AbortSignal): Promise<ValidationSourceResult> {
    return this.result;
  }
}

async function renderWith(token: string, source: ValidationSource) {
  await TestBed.configureTestingModule({
    imports: [PublicValidationPage],
    providers: configureProviders(source),
  }).compileComponents();

  const fixture = TestBed.createComponent(PublicValidationPage);
  fixture.componentRef.setInput('tokenCertificacion', token);
  fixture.detectChanges();
  // resource() loader es async: esperar resolución.
  await fixture.whenStable();
  fixture.detectChanges();
  return fixture;
}

function textOf(fixture: ReturnType<typeof TestBed.createComponent>): string {
  const el = fixture.nativeElement as HTMLElement;
  return el.textContent ?? '';
}

describe('PublicValidationPage', () => {
  const validResult: ValidationSourceResult = {
    ok: true,
    envelope: {
      data: {
        valid: true,
        status: 'vigente',
        certificateCode: 'CERT-2025-0001',
        student: { displayName: 'Juan Pérez', documentMasked: '12.345.**' },
        course: { name: 'Técnico Superior en Sistemas', issuedAt: '2025-03-15' },
        verifiedAt: '2025-06-29T10:00:00Z',
      },
      meta: { requestId: 'req-v' },
    },
  };

  const notFoundResult: ValidationSourceResult = {
    ok: false,
    error: { error: { code: 'CERTIFICATE_NOT_FOUND', message: 'x', details: [] }, meta: { requestId: 'r' } },
  };

  const revokedResult: ValidationSourceResult = {
    ok: false,
    error: { error: { code: 'CERTIFICATE_REVOKED', message: 'x', details: [] }, meta: { requestId: 'r' } },
  };

  const expiredResult: ValidationSourceResult = {
    ok: false,
    error: { error: { code: 'CERTIFICATE_EXPIRED', message: 'x', details: [] }, meta: { requestId: 'r' } },
  };

  const techResult: ValidationSourceResult = { ok: false, error: null };

  it('demo-valido → bloque válido con curso, fecha y documento enmascarado', async () => {
    const fixture = await renderWith('demo-valido', new StubSource(validResult));
    const text = textOf(fixture);
    expect(text).toContain('Certificado verificable');
    expect(text).toContain('Técnico Superior en Sistemas');
    expect(text).toContain('12.345.**');
    // No debe exponer DNI completo ni token.
    expect(text).not.toContain('12345678');
    expect(text).not.toContain('demo-valido');
  });

  it('demo-revocado → mismo bloque "no verificable"', async () => {
    const fixture = await renderWith('demo-revocado', new StubSource(revokedResult));
    const text = textOf(fixture);
    expect(text).toContain('no es verificable');
    expect(text).not.toContain('revocado');
    expect(text).not.toContain('CERTIFICATE_REVOKED');
  });

  it('demo-expirado → mismo bloque "no verificable"', async () => {
    const fixture = await renderWith('demo-expirado', new StubSource(expiredResult));
    const text = textOf(fixture);
    expect(text).toContain('no es verificable');
    expect(text).not.toContain('expirado');
  });

  it('demo-inexistente → mismo bloque "no verificable"', async () => {
    const fixture = await renderWith('demo-inexistente', new StubSource(notFoundResult));
    const text = textOf(fixture);
    expect(text).toContain('no es verificable');
    expect(text).not.toContain('404');
    expect(text).not.toContain('CERTIFICATE_NOT_FOUND');
  });

  it('demo-error-tecnico → bloque técnico, sin stack ni rutas', async () => {
    const fixture = await renderWith('demo-error-tecnico', new StubSource(techResult));
    const text = textOf(fixture);
    expect(text).toContain('No se pudo completar la verificación');
    expect(text).not.toContain('stack');
    expect(text).not.toContain('/api/');
  });

  it('usa aria-live polite en el contenedor de estado', async () => {
    const fixture = await renderWith('demo-valido', new StubSource(validResult));
    const el = fixture.nativeElement as HTMLElement;
    const live = el.querySelector('[aria-live="polite"]');
    expect(live).not.toBeNull();
    expect(live?.getAttribute('aria-atomic')).toBe('true');
  });

  it('con MockValidationSource real: demo-valido → válido (smoke del wiring)', async () => {
    const fixture = await renderWith('demo-valido', new MockValidationSource());
    const text = textOf(fixture);
    expect(text).toContain('Certificado verificable');
  });
});