import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { CertificationsListPage } from './certifications-list-page';
import { CERTIFICATIONS_SOURCE } from '../../certifications.service';
import { InMemoryCertificationsService } from '../../in-memory-certifications.service';

describe('CertificationsListPage', () => {
  async function render() {
    await TestBed.configureTestingModule({
      imports: [CertificationsListPage],
      providers: [
        provideRouter([]),
        { provide: CERTIFICATIONS_SOURCE, useClass: InMemoryCertificationsService },
      ],
    }).compileComponents();
    const fixture = TestBed.createComponent(CertificationsListPage);
    fixture.detectChanges();
    await fixture.whenStable();
    fixture.detectChanges();
    return fixture;
  }

  it('muestra título Certificaciones y banner demo', async () => {
    const f = await render();
    const el = f.nativeElement as HTMLElement;
    expect(el.textContent).toContain('Certificaciones');
    expect(el.textContent).toContain('Datos de demostración');
  });

  it('expone input type=search', async () => {
    const f = await render();
    const el = f.nativeElement as HTMLElement;
    expect(el.querySelector('input[type="search"]')).not.toBeNull();
  });

  it('expone select por estado', async () => {
    const f = await render();
    const el = f.nativeElement as HTMLElement;
    expect(el.querySelector('select')).not.toBeNull();
  });

  it('renderiza entre 3 y 6 artículos del seed', async () => {
    const f = await render();
    const el = f.nativeElement as HTMLElement;
    const cards = el.querySelectorAll('article');
    expect(cards.length).toBeGreaterThanOrEqual(3);
    expect(cards.length).toBeLessThanOrEqual(6);
  });

  it('empty state usa output aria-live=polite cuando no hay matches', async () => {
    const f = await render();
    const el = f.nativeElement as HTMLElement;
    const input = el.querySelector('input[type="search"]') as HTMLInputElement;
    input.value = 'zzzz-no-existe';
    input.dispatchEvent(new Event('input'));
    f.detectChanges();
    await f.whenStable();
    f.detectChanges();
    const output = el.querySelector('output[aria-live="polite"]');
    expect(output).not.toBeNull();
    expect(output?.textContent).toContain('No hay');
  });

  it('enlaces apuntan a /admin/certificaciones/:id', async () => {
    const f = await render();
    const el = f.nativeElement as HTMLElement;
    const link = el.querySelector('article a[href*="/admin/certificaciones/"]') as HTMLAnchorElement | null;
    expect(link).not.toBeNull();
    expect(link?.getAttribute('href')).toContain('/admin/certificaciones/');
  });

  it('no expone token completo ni DNI completo en el listado', async () => {
    const f = await render();
    const el = f.nativeElement as HTMLElement;
    expect(el.textContent).not.toMatch(/[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}/i);
    // documentMasked cumple XX****XX: no hay DNI completo de 7-8 dígitos.
    expect(el.textContent).not.toMatch(/\b\d{7,8}\b/);
  });

  it('filtrar por estado=vigente reduce la lista', async () => {
    const f = await render();
    const el = f.nativeElement as HTMLElement;
    const totalBefore = el.querySelectorAll('article').length;
    const select = el.querySelector('select') as HTMLSelectElement;
    select.value = 'vigente';
    select.dispatchEvent(new Event('change'));
    f.detectChanges();
    await f.whenStable();
    f.detectChanges();
    const totalAfter = el.querySelectorAll('article').length;
    expect(totalAfter).toBeLessThanOrEqual(totalBefore);
    el.querySelectorAll('article').forEach((a) => {
      expect(a.textContent).toContain('vigente');
    });
  });

  it('filtrar por texto reduce la lista', async () => {
    const f = await render();
    const el = f.nativeElement as HTMLElement;
    const input = el.querySelector('input[type="search"]') as HTMLInputElement;
    input.value = 'Uno';
    input.dispatchEvent(new Event('input'));
    f.detectChanges();
    await f.whenStable();
    f.detectChanges();
    const cards = el.querySelectorAll('article');
    expect(cards.length).toBe(1);
  });

  it('no llama fetch', async () => {
    const fetchSpy = spyOn(window, 'fetch').and.callThrough();
    await render();
    expect(fetchSpy).not.toHaveBeenCalled();
  });
});