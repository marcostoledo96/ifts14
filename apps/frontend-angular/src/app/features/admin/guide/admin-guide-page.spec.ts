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
});
