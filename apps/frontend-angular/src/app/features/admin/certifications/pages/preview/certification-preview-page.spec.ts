import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { CertificationPreviewPage } from './certification-preview-page';
import { CERTIFICATIONS_SOURCE } from '../../certifications.service';
import { InMemoryCertificationsService } from '../../in-memory-certifications.service';
import { URL_PUBLICA_MAX } from '../../in-memory-certifications.service';

describe('CertificationPreviewPage', () => {
  async function render(id: string) {
    await TestBed.configureTestingModule({
      imports: [CertificationPreviewPage],
      providers: [
        provideRouter([]),
        { provide: CERTIFICATIONS_SOURCE, useClass: InMemoryCertificationsService },
      ],
    }).compileComponents();
    const fixture = TestBed.createComponent(CertificationPreviewPage);
    fixture.componentRef.setInput('id', id);
    fixture.detectChanges();
    await fixture.whenStable();
    fixture.detectChanges();
    return fixture;
  }

  it('muestra datos seguros en dl (documentMasked, tokenPrefix, URL truncada)', async () => {
    const f = await render('1');
    const el = f.nativeElement as HTMLElement;
    const dl = el.querySelector('dl.detalle-meta');
    expect(dl).not.toBeNull();
    const text = dl?.textContent || '';
    // documentMasked visible como XX****XX (formato mascarado).
    expect(text).toMatch(/\d{2}\*{4}\d{2}/);
    // tokenPrefix visible (prefijo_demo_xxx), no token completo.
    expect(text).toMatch(/prefijo_demo_[a-z0-9]{3}/);
  });

  it('muestra attendedDates como lista', async () => {
    const f = await render('1');
    const el = f.nativeElement as HTMLElement;
    const attended = el.querySelector('.attended-dates');
    expect(attended).not.toBeNull();
    // Cert 1 tiene 3 attendedDates.
    const items = attended?.querySelectorAll('li') || [];
    expect(items.length).toBe(3);
  });

  it('muestra auditEvents como lista', async () => {
    const f = await render('1');
    const el = f.nativeElement as HTMLElement;
    const audit = el.querySelector('.audit-events');
    expect(audit).not.toBeNull();
    expect(audit?.querySelectorAll('li').length).toBeGreaterThanOrEqual(1);
  });

  it('URL pública se muestra truncada (<= URL_PUBLICA_MAX chars) sin token completo', async () => {
    const f = await render('1');
    const el = f.nativeElement as HTMLElement;
    const urlEl = el.querySelector('.public-url');
    expect(urlEl).not.toBeNull();
    const urlText = urlEl?.textContent?.trim() || '';
    expect(urlText.length).toBeLessThanOrEqual(URL_PUBLICA_MAX);
    // No contiene un UUID completo.
    expect(urlText).not.toMatch(/[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}/i);
  });

  it('CTAs de PDF, entrega, revocación y listado real están deshabilitados', async () => {
    const f = await render('1');
    const el = f.nativeElement as HTMLElement;
    const disabledBtns = el.querySelectorAll('button[disabled][aria-disabled="true"]');
    expect(disabledBtns.length).toBeGreaterThanOrEqual(4);
  });

  it('CTAs deshabilitados mencionan handoff a F4/F5/F6', async () => {
    const f = await render('1');
    const el = f.nativeElement as HTMLElement;
    const text = el.textContent || '';
    expect(text).toContain('F4-01');
    expect(text).toContain('F5-04');
    expect(text).toContain('F6-01');
  });

  it('id inválido "abc" muestra "Certificación no encontrada" sin excepción', async () => {
    const f = await render('abc');
    const el = f.nativeElement as HTMLElement;
    expect(el.textContent).toContain('no encontrada');
  });

  it('id hex "0x1" no se coerce a 1: muestra "no encontrada"', async () => {
    const f = await render('0x1');
    const el = f.nativeElement as HTMLElement;
    expect(el.textContent).toContain('no encontrada');
  });

  it('id notación científica "1e0" no se coerce a 1: muestra "no encontrada"', async () => {
    const f = await render('1e0');
    const el = f.nativeElement as HTMLElement;
    expect(el.textContent).toContain('no encontrada');
  });

  it('id con espacios " 1 " se normaliza y carga la certificación', async () => {
    const f = await render(' 1 ');
    const el = f.nativeElement as HTMLElement;
    expect(el.textContent).not.toContain('no encontrada');
  });

  it('id inexistente "999" muestra "Certificación no encontrada"', async () => {
    const f = await render('999');
    const el = f.nativeElement as HTMLElement;
    expect(el.textContent).toContain('no encontrada');
  });

  it('muestra enlace de retorno a /admin/certificaciones', async () => {
    const f = await render('1');
    const el = f.nativeElement as HTMLElement;
    const volver = el.querySelector('a[routerLink="/admin/certificaciones"]');
    expect(volver).not.toBeNull();
  });

  it('no llama fetch', async () => {
    const fetchSpy = spyOn(window, 'fetch').and.callThrough();
    await render('1');
    expect(fetchSpy).not.toHaveBeenCalled();
  });

  it('no expone token completo en el DOM', async () => {
    const f = await render('1');
    const el = f.nativeElement as HTMLElement;
    expect(el.textContent).not.toMatch(/[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}/i);
  });
});