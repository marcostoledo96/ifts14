import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { VALIDATION_SOURCE } from '../../shared/certificates/validation-source';
import { ValidationSource, ValidationSourceResult } from '../../shared/certificates/validation-source';
import { MockValidationSource, VALID_VALID_DTO } from '../../shared/certificates/mock-tokens';
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
      data: VALID_VALID_DTO,
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

  it('demo-valido → bloque válido con curso, DNI completo y fechas asistidas (D0)', async () => {
    const fixture = await renderWith('demo-valido', new StubSource(validResult));
    const text = textOf(fixture);
    expect(text).toContain('Certificado verificable');
    expect(text).toContain('Técnico Superior en Sistemas');
    expect(text).toContain('12345678');
    expect(text).toContain('2025-03-10');
    expect(text).toContain('2025-03-12');
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

  it('BandaEstado es el único dueño de aria-live (sin región anidada)', async () => {
    const fixture = await renderWith('demo-revocado', new StubSource(revokedResult));
    const el = fixture.nativeElement as HTMLElement;
    // W3: el contenedor genérico ya no expone aria-live; BandaEstado es el único dueño.
    const liveRegions = el.querySelectorAll('[aria-live="polite"]');
    expect(liveRegions.length).toBe(1);
    expect(liveRegions[0].closest('app-banda-estado')).not.toBeNull();
    expect(liveRegions[0].getAttribute('aria-atomic')).toBe('true');
    // El wrapper genérico de la página no debe replicar live semantics.
    const wrapper = el.querySelector('section.validation > div');
    expect(wrapper?.hasAttribute('aria-live')).toBe(false);
  });

  it('estado válido se anuncia vía BandaEstado (única región live, contiene texto válido)', async () => {
    const fixture = await renderWith('demo-valido', new StubSource(validResult));
    const el = fixture.nativeElement as HTMLElement;
    // W4 (Codex PR #33): el estado válido también debe comunicarse vía BandaEstado.
    const liveRegions = el.querySelectorAll('[aria-live="polite"]');
    expect(liveRegions.length).toBe(1);
    expect(liveRegions[0].closest('app-banda-estado')).not.toBeNull();
    expect(liveRegions[0].getAttribute('aria-atomic')).toBe('true');
    const banda = el.querySelector('app-banda-estado');
    expect(banda).not.toBeNull();
    expect(banda?.textContent ?? '').toContain('Certificado verificable');
    // Sin región live anidada dentro del bloque de detalles.
    const article = el.querySelector('article.state-valid');
    expect(article?.querySelectorAll('[aria-live]').length ?? 0).toBe(0);
  });

  it('render basado en primitivos: dl/dt/dd nativos válidos en bloque válido (W2)', async () => {
    const fixture = await renderWith('demo-valido', new StubSource(validResult));
    const el = fixture.nativeElement as HTMLElement;
    // W2: el bloque válido usa dt/dd nativos dentro de un dl; sin wrappers custom.
    const dl = el.querySelector('dl');
    expect(dl).not.toBeNull();
    expect(dl?.querySelector('dt')).not.toBeNull();
    expect(dl?.querySelector('dd')).not.toBeNull();
    // Sin elementos custom dentro del <dl> (content model válido).
    expect(dl?.querySelector('app-campo-dato, app-banda-estado, app-folio-shell')).toBeNull();
  });

  it('no expone token, stack ni rutas en el render válido', async () => {
    const fixture = await renderWith('demo-valido', new StubSource(validResult));
    const text = textOf(fixture);
    expect(text).not.toContain('demo-valido');
    // Sin rutas internas ni stack traces.
    expect(text).not.toMatch(/\/api\//);
    expect(text).not.toMatch(/stack/i);
  });

  it('con MockValidationSource real: demo-valido → válido (smoke del wiring)', async () => {
    const fixture = await renderWith('demo-valido', new MockValidationSource());
    const text = textOf(fixture);
    expect(text).toContain('Certificado verificable');
  });
});