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
    // 5 ítems: 2 links (dashboard + cursos) + 3 placeholders deshabilitados
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
    expect(links.length).toBe(2);
    const cursosLink = links.find((a) => a.textContent?.includes('Cursos'));
    expect(cursosLink).toBeDefined();
    expect(cursosLink?.getAttribute('href')).toContain('/admin/cursos');
  });

  it('los ítems futuros (Alumnos..Certificaciones) son placeholders deshabilitados sin href', async () => {
    const f = await render();
    const el = f.nativeElement as HTMLElement;
    const placeholders = el.querySelectorAll('nav ul li button.nav-placeholder');
    expect(placeholders.length).toBe(3);
    placeholders.forEach((btn) => {
      expect(btn.getAttribute('disabled')).not.toBeNull();
      expect(btn.getAttribute('aria-disabled')).toBe('true');
      expect(btn.getAttribute('href')).toBeNull();
      expect(btn.tagName.toLowerCase()).toBe('button');
    });
    const labels = Array.from(placeholders).map((b) => b.textContent?.trim());
    expect(labels).toEqual(['Alumnos', 'Asistencias', 'Certificaciones']);
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