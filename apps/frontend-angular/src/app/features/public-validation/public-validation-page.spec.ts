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
    error: {
      error: { code: 'CERTIFICATE_NOT_FOUND', message: 'x', details: [] },
      meta: { requestId: 'r' },
    },
  };

  const revokedResult: ValidationSourceResult = {
    ok: false,
    error: {
      error: { code: 'CERTIFICATE_REVOKED', message: 'x', details: [] },
      meta: { requestId: 'r' },
    },
  };

  const expiredResult: ValidationSourceResult = {
    ok: false,
    error: {
      error: { code: 'CERTIFICATE_EXPIRED', message: 'x', details: [] },
      meta: { requestId: 'r' },
    },
  };

  const techResult: ValidationSourceResult = { ok: false, error: null };

  it('demo-valido → folio válido con ACTA, DNI completo, fechas y PieControl (D0)', async () => {
    const fixture = await renderWith('demo-valido', new StubSource(validResult));
    const text = textOf(fixture);
    expect(text).toContain('ACTA DE VALIDACIÓN ACADÉMICA');
    expect(text).toContain('Certificación válida');
    expect(text).toContain('Documento verificado');
    expect(text).toContain('Técnico Superior en Sistemas');
    expect(text).toContain('12345678');
    expect(text).toContain('2025-03-10');
    expect(text).toContain('2025-03-12');
    expect(text).toContain('Certificado de curso');
    expect(text).toContain('ESTADO DE REGISTRO: VÁLIDO');
    expect(text).not.toContain('demo-valido');
  });

  it('demo-revocado → chrome revocada con sello, sin inventar alumno', async () => {
    const fixture = await renderWith('demo-revocado', new StubSource(revokedResult));
    const text = textOf(fixture);
    expect(text).toContain('Certificación revocada');
    expect(text).toContain('REVOCADO');
    expect(text).not.toContain('CERTIFICATE_REVOKED');
    expect(text).not.toContain('María');
    expect(text).not.toContain('12345678');
  });

  it('demo-expirado → chrome no encontrada (sin revelar expirado)', async () => {
    const fixture = await renderWith('demo-expirado', new StubSource(expiredResult));
    const text = textOf(fixture);
    expect(text).toContain('Certificación no encontrada');
    expect(text).toContain('SIN REGISTRO');
    expect(text).not.toContain('expirado');
    expect(text).not.toContain('CERTIFICATE_EXPIRED');
  });

  it('demo-inexistente → chrome no encontrada', async () => {
    const fixture = await renderWith('demo-inexistente', new StubSource(notFoundResult));
    const text = textOf(fixture);
    expect(text).toContain('Certificación no encontrada');
    expect(text).toContain('Sin registro para esta consulta');
    expect(text).not.toContain('404');
    expect(text).not.toContain('CERTIFICATE_NOT_FOUND');
  });

  it('demo-error-tecnico → chrome documental sin stack ni rutas', async () => {
    const fixture = await renderWith('demo-error-tecnico', new StubSource(techResult));
    const text = textOf(fixture);
    expect(text).toContain('No pudimos completar la validación');
    expect(text).toContain('Reintentar validación');
    expect(text).toContain('SERVICE_UNAVAILABLE');
    expect(text).not.toContain('stack');
    expect(text).not.toContain('/api/');
  });

  it('BandaEstado es el único dueño de aria-live (sin región anidada)', async () => {
    const fixture = await renderWith('demo-inexistente', new StubSource(notFoundResult));
    const el = fixture.nativeElement as HTMLElement;
    const liveRegions = el.querySelectorAll('[aria-live="polite"]');
    expect(liveRegions.length).toBe(1);
    expect(liveRegions[0].closest('app-banda-estado')).not.toBeNull();
    expect(liveRegions[0].getAttribute('aria-atomic')).toBe('true');
    const wrapper = el.querySelector('section.validation');
    expect(wrapper?.hasAttribute('aria-live')).toBe(false);
  });

  it('estado válido anuncia vía BandaEstado dentro del folio', async () => {
    const fixture = await renderWith('demo-valido', new StubSource(validResult));
    const el = fixture.nativeElement as HTMLElement;
    const liveRegions = el.querySelectorAll('[aria-live="polite"]');
    expect(liveRegions.length).toBe(1);
    expect(liveRegions[0].closest('app-banda-estado')).not.toBeNull();
    const banda = el.querySelector('article.folio app-banda-estado');
    expect(banda).not.toBeNull();
    expect(banda?.textContent ?? '').toContain('Documento verificado');
  });

  it('render basado en primitivos: dl/dt/dd nativos válidos en bloque válido (W2)', async () => {
    const fixture = await renderWith('demo-valido', new StubSource(validResult));
    const el = fixture.nativeElement as HTMLElement;
    const dl = el.querySelector('dl');
    expect(dl).not.toBeNull();
    expect(dl?.querySelector('dt')).not.toBeNull();
    expect(dl?.querySelector('dd')).not.toBeNull();
    expect(dl?.querySelector('app-campo-dato, app-banda-estado')).toBeNull();
  });

  it('tabla de fechas asistidas: SEQ padded y SÍ', async () => {
    const fixture = await renderWith('demo-valido', new StubSource(validResult));
    const el = fixture.nativeElement as HTMLElement;
    const filas = el.querySelectorAll('table.tabla-asistencias tbody tr');
    expect(filas.length).toBe(2);
    expect(filas[0].querySelectorAll('td')[0]?.textContent?.trim()).toBe('001');
    expect(filas[1].querySelectorAll('td')[0]?.textContent?.trim()).toBe('002');
    expect(textOf(fixture)).toContain('SÍ');
  });

  it('sidebar con sello decorativo aria-hidden, PieControl y timestamp', async () => {
    const fixture = await renderWith('demo-valido', new StubSource(validResult));
    const el = fixture.nativeElement as HTMLElement;
    const aside = el.querySelector('aside.folio-aside');
    expect(aside).not.toBeNull();
    const sello = aside?.querySelector('svg.sello-svg');
    expect(sello).not.toBeNull();
    expect(sello?.getAttribute('aria-hidden')).toBe('true');
    expect(aside?.textContent ?? '').toMatch(/\d{2}\/\d{2}\/\d{4} · \d{2}:\d{2} ART/);
    const pieLogo = el.querySelector('.pie-control .pie-logo') as HTMLImageElement | null;
    expect(pieLogo).not.toBeNull();
    expect(pieLogo?.getAttribute('src')).toContain('logo-ifts.webp');
  });

  it('no dibuja QR decorativo', async () => {
    const fixture = await renderWith('demo-valido', new StubSource(validResult));
    const el = fixture.nativeElement as HTMLElement;
    expect(el.querySelector('app-qr-verificacion')).toBeNull();
    const aside = el.querySelector('aside.folio-aside');
    const svgs = aside?.querySelectorAll('svg') ?? [];
    expect(svgs.length).toBe(1);
  });

  it('estado no-encontrada con sugerencias numeradas y sello sin-registro', async () => {
    const fixture = await renderWith('demo-inexistente', new StubSource(notFoundResult));
    const el = fixture.nativeElement as HTMLElement;
    const folio = el.querySelector('article.folio-no-verificable');
    expect(folio).not.toBeNull();
    expect(folio?.querySelectorAll('ul.sugerencias li').length).toBe(3);
    expect(folio?.querySelector('button.btn-primario')).not.toBeNull();
    expect(folio?.textContent ?? '').toContain('SIN REGISTRO');
    expect(folio?.querySelector('aside svg.sello-svg')).not.toBeNull();
  });

  it('estado technical-error con botón reintentar y pie', async () => {
    const fixture = await renderWith('demo-error-tecnico', new StubSource(techResult));
    const el = fixture.nativeElement as HTMLElement;
    const folio = el.querySelector('article.folio-error');
    expect(folio).not.toBeNull();
    expect(folio?.querySelector('button.btn-primario')).not.toBeNull();
    expect(folio?.querySelector('.pie-control')).not.toBeNull();
  });

  it('error de resource() muestra bloque técnico (isTechnicalError)', async () => {
    const source = new StubSource(techResult);
    await TestBed.configureTestingModule({
      imports: [PublicValidationPage],
      providers: configureProviders(source),
    }).compileComponents();
    const fixture = TestBed.createComponent(PublicValidationPage);
    fixture.componentRef.setInput('tokenCertificacion', 'demo-error-tecnico');
    fixture.detectChanges();
    await fixture.whenStable();
    fixture.detectChanges();
    const el = fixture.nativeElement as HTMLElement;
    expect(el.querySelector('article.folio-error')).not.toBeNull();
  });

  it('no expone token, stack ni rutas en el render válido', async () => {
    const fixture = await renderWith('demo-valido', new StubSource(validResult));
    const text = textOf(fixture);
    expect(text).not.toContain('demo-valido');
    expect(text).not.toMatch(/\/api\//);
    expect(text).not.toMatch(/stack/i);
  });

  it('con MockValidationSource real: demo-valido → válido (smoke del wiring)', async () => {
    const fixture = await renderWith('demo-valido', new MockValidationSource());
    const text = textOf(fixture);
    expect(text).toContain('Certificación válida');
  });
});
