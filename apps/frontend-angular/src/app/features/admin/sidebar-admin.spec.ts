import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { SidebarAdmin } from './sidebar-admin';

describe('SidebarAdmin', () => {
  async function render(active = '/admin/dashboard') {
    await TestBed.configureTestingModule({
      imports: [SidebarAdmin],
      providers: [provideRouter([])],
    }).compileComponents();
    const fixture = TestBed.createComponent(SidebarAdmin);
    fixture.componentRef.setInput('active', active);
    fixture.detectChanges();
    return fixture;
  }

  it('muestra marca institucional Bedelía · Panel', async () => {
    const f = await render();
    const el = f.nativeElement as HTMLElement;
    expect(el.textContent).toContain('IFTS N.° 14');
    expect(el.textContent).toContain('Bedelía · Panel');
    const brandImg = el.querySelector('.sidebar-brand-img') as HTMLImageElement | null;
    expect(brandImg).not.toBeNull();
    expect(brandImg?.getAttribute('src')).toContain('logo-ifts.webp');
  });

  it('usa heading Operación y NO Secciones', async () => {
    const f = await render();
    const el = f.nativeElement as HTMLElement;
    expect(el.querySelector('.sidebar-heading')?.textContent?.trim()).toBe('Operación');
    expect(el.textContent).not.toContain('Secciones');
  });

  it('muestra 5 ítems operativos en nav principal', async () => {
    const f = await render();
    const el = f.nativeElement as HTMLElement;
    expect(el.querySelector('[role="navigation"]')).not.toBeNull();
    const opLinks = el.querySelectorAll('.nav-list--operacion li a');
    expect(opLinks.length).toBe(5);
    const labels = Array.from(opLinks).map((a) => a.textContent?.replace(/\s+/g, ' ').trim());
    expect(labels).toEqual(['Inicio', 'Cursos', 'Alumnos', 'Asistencias', 'Certificaciones']);
  });

  it('usa iconIds Lucide-like y SVG 16×16 (Inicio = LayoutGrid, no home)', async () => {
    const f = await render();
    const c = f.componentInstance;
    expect(c.items.map((i) => i.iconId)).toEqual([
      'layout-grid',
      'book-open',
      'users',
      'calendar-check',
      'qr-code',
    ]);
    expect(c.configItem.iconId).toBe('settings');
    const el = f.nativeElement as HTMLElement;
    const inicioSvg = el.querySelector('.nav-list--operacion li a svg') as SVGElement | null;
    expect(inicioSvg).not.toBeNull();
    expect(inicioSvg?.getAttribute('width')).toBe('16');
    expect(inicioSvg?.getAttribute('height')).toBe('16');
    // LayoutGrid: cuatro rects; home usaba un solo path
    expect(inicioSvg?.querySelectorAll('rect').length).toBeGreaterThanOrEqual(4);
    expect(inicioSvg?.querySelectorAll('path').length).toBe(0);
  });

  it('Configuración aparece exactamente una vez en el footer', async () => {
    const f = await render();
    const el = f.nativeElement as HTMLElement;
    const allConfig = Array.from(el.querySelectorAll('a')).filter((a) =>
      a.getAttribute('href')?.includes('/admin/configuracion'),
    );
    expect(allConfig.length).toBe(1);
    expect(el.querySelector('.sidebar-footer a')?.getAttribute('href')).toContain('/admin/configuracion');
    const opText = Array.from(el.querySelectorAll('.nav-list--operacion a')).map((a) => a.textContent);
    expect(opText.join(' ')).not.toContain('Configuración');
  });

  it('Cursos es un link que navega a /admin/cursos', async () => {
    const f = await render();
    const el = f.nativeElement as HTMLElement;
    const cursosLink = Array.from(el.querySelectorAll('.nav-list--operacion a')).find((a) =>
      a.textContent?.includes('Cursos'),
    );
    expect(cursosLink).toBeDefined();
    expect(cursosLink?.getAttribute('href')).toContain('/admin/cursos');
  });

  it('Asistencias es un link que navega a /admin/asistencias', async () => {
    const f = await render();
    const el = f.nativeElement as HTMLElement;
    const asistLink = Array.from(el.querySelectorAll('.nav-list--operacion a')).find((a) =>
      a.textContent?.includes('Asistencias'),
    );
    expect(asistLink).toBeDefined();
    expect(asistLink?.getAttribute('href')).toContain('/admin/asistencias');
  });

  it('Certificaciones es un link que navega a /admin/certificaciones', async () => {
    const f = await render();
    const el = f.nativeElement as HTMLElement;
    const certLink = Array.from(el.querySelectorAll('.nav-list--operacion a')).find((a) =>
      a.textContent?.includes('Certificaciones'),
    );
    expect(certLink).toBeDefined();
    expect(certLink?.getAttribute('href')).toContain('/admin/certificaciones');
  });

  it('Alumnos es un link que navega a /admin/alumnos', async () => {
    const f = await render();
    const el = f.nativeElement as HTMLElement;
    const link = Array.from(el.querySelectorAll('.nav-list--operacion a')).find((a) =>
      a.textContent?.includes('Alumnos'),
    );
    expect(link?.getAttribute('href')).toContain('/admin/alumnos');
  });

  it('marca aria-current=page en Inicio cuando active=/admin/dashboard', async () => {
    const f = await render('/admin/dashboard');
    const el = f.nativeElement as HTMLElement;
    const current = el.querySelector('nav a[aria-current="page"]');
    expect(current?.textContent).toContain('Inicio');
  });

  it('Cursos queda activo por prefijo en /admin/cursos', async () => {
    const f = await render('/admin/cursos');
    const el = f.nativeElement as HTMLElement;
    const current = el.querySelector('nav a[aria-current="page"]');
    expect(current?.textContent).toContain('Cursos');
    expect(current?.classList.contains('active')).toBe(true);
  });

  it('Cursos queda activo por prefijo en /admin/cursos/nuevo', async () => {
    const f = await render('/admin/cursos/nuevo');
    const el = f.nativeElement as HTMLElement;
    const current = el.querySelector('nav a[aria-current="page"]');
    expect(current?.textContent).toContain('Cursos');
  });

  it('Cursos queda activo por prefijo en /admin/cursos/123/editar', async () => {
    const f = await render('/admin/cursos/123/editar');
    const el = f.nativeElement as HTMLElement;
    const current = el.querySelector('nav a[aria-current="page"]');
    expect(current?.textContent).toContain('Cursos');
  });

  it('Asistencias queda activo por prefijo en /admin/asistencias', async () => {
    const f = await render('/admin/asistencias');
    const el = f.nativeElement as HTMLElement;
    const current = el.querySelector('nav a[aria-current="page"]');
    expect(current?.textContent).toContain('Asistencias');
  });

  it('Asistencias queda activo en ruta de marcado /admin/cursos/:id/fechas/:fechaId/asistencias', async () => {
    const f = await render('/admin/cursos/1/fechas/11/asistencias');
    const el = f.nativeElement as HTMLElement;
    const current = el.querySelector('nav a[aria-current="page"]');
    expect(current?.textContent).toContain('Asistencias');
    expect(current?.textContent).not.toContain('Cursos');
  });

  it('Asistencias queda activo en ruta de marcado aunque tenga query o fragmento', async () => {
    const f = await render('/admin/cursos/1/fechas/11/asistencias?desde=detalle#alumnos');
    const el = f.nativeElement as HTMLElement;
    const current = el.querySelector('nav a[aria-current="page"]');
    expect(current?.textContent).toContain('Asistencias');
    expect(current?.textContent).not.toContain('Cursos');
  });

  it('Certificaciones queda activo por prefijo en /admin/certificaciones', async () => {
    const f = await render('/admin/certificaciones');
    const el = f.nativeElement as HTMLElement;
    const current = el.querySelector('nav a[aria-current="page"]');
    expect(current?.textContent).toContain('Certificaciones');
  });

  it('Certificaciones queda activo por prefijo en /admin/certificaciones/1', async () => {
    const f = await render('/admin/certificaciones/1');
    const el = f.nativeElement as HTMLElement;
    const current = el.querySelector('nav a[aria-current="page"]');
    expect(current?.textContent).toContain('Certificaciones');
  });

  it('Alumnos queda activo por prefijo en /admin/alumnos', async () => {
    const f = await render('/admin/alumnos');
    expect((f.nativeElement as HTMLElement).querySelector('nav a[aria-current="page"]')?.textContent).toContain(
      'Alumnos',
    );
  });

  it('Configuración queda activo por prefijo en /admin/configuracion', async () => {
    const f = await render('/admin/configuracion');
    const el = f.nativeElement as HTMLElement;
    const current = el.querySelector('nav a[aria-current="page"]');
    expect(current?.textContent).toContain('Configuración');
    expect(current?.closest('.sidebar-footer')).not.toBeNull();
  });

  it('Configuración NO queda activo cuando active=/admin/dashboard', async () => {
    const f = await render('/admin/dashboard');
    const el = f.nativeElement as HTMLElement;
    const current = el.querySelector('nav a[aria-current="page"]');
    expect(current?.textContent).not.toContain('Configuración');
  });

  it('Inicio NO queda activo cuando active=/admin/cursos', async () => {
    const f = await render('/admin/cursos');
    const el = f.nativeElement as HTMLElement;
    const current = el.querySelector('nav a[aria-current="page"]');
    expect(current?.textContent).not.toContain('Inicio');
  });

  it('incluye botón Cerrar sesión usable', async () => {
    const f = await render();
    const el = f.nativeElement as HTMLElement;
    const btn = el.querySelector('button.logout-btn') as HTMLButtonElement | null;
    expect(btn).not.toBeNull();
    expect(btn?.disabled).toBe(false);
    expect(btn?.textContent).toContain('Cerrar sesión');
  });

  it('emite cerrarSesion al click del botón', async () => {
    const f = await render();
    let called = false;
    f.componentInstance.cerrarSesion.subscribe(() => (called = true));
    const btn = (f.nativeElement as HTMLElement).querySelector('button.logout-btn') as HTMLButtonElement;
    btn.click();
    expect(called).toBe(true);
  });
});
