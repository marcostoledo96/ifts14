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

  it('muestra 5 ítems de navegación con role=navigation', async () => {
    const f = await render();
    const el = f.nativeElement as HTMLElement;
    expect(el.querySelector('[role="navigation"]')).not.toBeNull();
    // 5 ítems: 4 links (dashboard + cursos + asistencias + certificaciones) + 1 placeholder deshabilitado
    const links = el.querySelectorAll('nav ul li a');
    const placeholders = el.querySelectorAll('nav ul li button.nav-placeholder');
    expect(links.length + placeholders.length).toBe(5);
  });

  it('etiqueta los 5 ítems esperados', async () => {
    const f = await render();
    const el = f.nativeElement as HTMLElement;
    const labels = Array.from(el.querySelectorAll('nav ul li > * > span:last-child, nav ul li span')).map((s) => s.textContent);
    expect(labels).toEqual([
      'Inicio',
      'Cursos',
      'Alumnos',
      'Asistencias',
      'Certificaciones',
    ]);
  });

  it('Cursos es un link que navega a /admin/cursos', async () => {
    const f = await render();
    const el = f.nativeElement as HTMLElement;
    const links = Array.from(el.querySelectorAll('nav ul li a'));
    expect(links.length).toBe(4);
    const cursosLink = links.find((a) => a.textContent?.includes('Cursos'));
    expect(cursosLink).toBeDefined();
    expect(cursosLink?.getAttribute('href')).toContain('/admin/cursos');
  });

  it('Asistencias es un link que navega a /admin/asistencias', async () => {
    const f = await render();
    const el = f.nativeElement as HTMLElement;
    const links = Array.from(el.querySelectorAll('nav ul li a'));
    const asistLink = links.find((a) => a.textContent?.includes('Asistencias'));
    expect(asistLink).toBeDefined();
    expect(asistLink?.getAttribute('href')).toContain('/admin/asistencias');
  });

  it('Certificaciones es un link que navega a /admin/certificaciones', async () => {
    const f = await render();
    const el = f.nativeElement as HTMLElement;
    const links = Array.from(el.querySelectorAll('nav ul li a'));
    const certLink = links.find((a) => a.textContent?.includes('Certificaciones'));
    expect(certLink).toBeDefined();
    expect(certLink?.getAttribute('href')).toContain('/admin/certificaciones');
  });

  it('los ítems futuros (Alumnos) son placeholders deshabilitados sin href', async () => {
    const f = await render();
    const el = f.nativeElement as HTMLElement;
    const placeholders = el.querySelectorAll('nav ul li button.nav-placeholder');
    expect(placeholders.length).toBe(1);
    placeholders.forEach((btn) => {
      expect(btn.getAttribute('disabled')).not.toBeNull();
      expect(btn.getAttribute('aria-disabled')).toBe('true');
      expect(btn.getAttribute('href')).toBeNull();
      expect(btn.tagName.toLowerCase()).toBe('button');
    });
    const labels = Array.from(placeholders).map((b) => b.textContent?.trim());
    expect(labels).toEqual(['Alumnos']);
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
    // Cursos NO debe quedar activo en esta ruta.
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

  it('Inicio NO queda activo cuando active=/admin/cursos', async () => {
    const f = await render('/admin/cursos');
    const el = f.nativeElement as HTMLElement;
    const current = el.querySelector('nav a[aria-current="page"]');
    expect(current?.textContent).not.toContain('Inicio');
  });

  it('incluye botón Cerrar sesión', async () => {
    const f = await render();
    const el = f.nativeElement as HTMLElement;
    expect(el.querySelector('button.logout-btn')?.textContent).toContain('Cerrar sesión');
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
