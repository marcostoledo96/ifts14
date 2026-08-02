import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { AdminGuidePage } from './admin-guide-page';

describe('AdminGuidePage', () => {
  async function render() {
    await TestBed.configureTestingModule({
      imports: [AdminGuidePage],
      providers: [provideRouter([])],
    }).compileComponents();
    const fixture = TestBed.createComponent(AdminGuidePage);
    fixture.detectChanges();
    return fixture;
  }

  it('muestra título, Volver al panel y cinco secciones con anclas', async () => {
    const f = await render();
    const el = f.nativeElement as HTMLElement;
    expect(el.querySelector('#guia-title')?.textContent).toContain('Flujo de trabajo de Bedelía');
    const back = el.querySelector('[data-testid="volver-dashboard"]') as HTMLAnchorElement;
    expect(back).toBeTruthy();
    expect(back.getAttribute('href')).toBe('/admin/dashboard');
    expect(back.textContent).toMatch(/Volver al panel/i);

    expect(el.querySelector('.intro-banner')).not.toBeNull();
    expect(el.querySelector('.guia-nav')).not.toBeNull();
    expect(el.querySelector('.guia-layout')).not.toBeNull();

    for (const id of ['cursos', 'alumnos', 'asistencias', 'certificaciones', 'configuracion']) {
      expect(el.querySelector(`[data-testid="guia-seccion-${id}"]`)).not.toBeNull();
      expect(el.querySelector(`#${id}`)).not.toBeNull();
    }
    expect(el.textContent).not.toContain('Carga masiva');
    expect(el.textContent).toContain('token/QR es permanente');
  });

  it('enlaza cada sección a la ruta admin correspondiente', async () => {
    const f = await render();
    const el = f.nativeElement as HTMLElement;
    const ctas = Array.from(el.querySelectorAll('.seccion-cta')) as HTMLAnchorElement[];
    expect(ctas.map((a) => a.getAttribute('href'))).toEqual([
      '/admin/cursos',
      '/admin/alumnos',
      '/admin/asistencias',
      '/admin/certificaciones',
      '/admin/configuracion',
    ]);
  });

  it('describe el flujo real de emisión y estados de certificado', async () => {
    const f = await render();
    const el = f.nativeElement as HTMLElement;

    const intro = el.querySelector('.intro-text')?.textContent ?? '';
    expect(intro).toContain('marcar y generar certificados');
    expect(intro).toContain('entrega y expediente');

    const asist = el.querySelector('[data-testid="guia-seccion-asistencias"]')?.textContent ?? '';
    expect(asist).toContain('Guardar y generar certificados');
    expect(asist).toContain('camino principal de emisión');
    expect(asist).toContain('Ver certificados del curso');

    const certs = el.querySelector('[data-testid="guia-seccion-certificaciones"]')?.textContent ?? '';
    expect(certs).toContain('Válida o Revocado');
    expect(certs).toContain('no hay estado «vencido»');
    expect(certs).not.toContain('vigente, vencido, revocado');
    expect(certs).toContain('Nueva certificación');
    expect(certs).toContain('alternativa');
    expect(certs).toContain('regenerar PDF');

    expect(el.querySelector('.lede')?.textContent).toMatch(/desde el panel/i);
  });
});
