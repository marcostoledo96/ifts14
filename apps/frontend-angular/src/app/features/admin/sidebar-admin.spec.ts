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
    // 5 ítems: 1 link (dashboard) + 4 placeholders deshabilitados
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

  it('solo Inicio (/admin/dashboard) es un link navegable', async () => {
    const f = await render();
    const el = f.nativeElement as HTMLElement;
    const links = Array.from(el.querySelectorAll('nav ul li a'));
    expect(links.length).toBe(1);
    expect(links[0]?.textContent).toContain('Inicio');
    // No debe existir ningún <a> con href absoluto a rutas futuras
    // (Cursos/Alumnos/Asistencias/Certificaciones) que recargue la app y
    // pierda la sesión mock en memoria.
    const unsafeHrefs = Array.from(el.querySelectorAll('nav ul li a[href]'))
      .map((a) => a.getAttribute('href'))
      .filter((h) => h === '/admin/cursos' || h === '/admin/alumnos' || h === '/admin/asistencias' || h === '/admin/certificaciones');
    expect(unsafeHrefs).toEqual([]);
  });

  it('los ítems futuros (Cursos..Certificaciones) son placeholders deshabilitados sin href', async () => {
    const f = await render();
    const el = f.nativeElement as HTMLElement;
    const placeholders = el.querySelectorAll('nav ul li button.nav-placeholder');
    expect(placeholders.length).toBe(4);
    placeholders.forEach((btn) => {
      expect(btn.getAttribute('disabled')).not.toBeNull();
      expect(btn.getAttribute('aria-disabled')).toBe('true');
      expect(btn.getAttribute('href')).toBeNull();
      expect(btn.tagName.toLowerCase()).toBe('button');
    });
    const labels = Array.from(placeholders).map((b) => b.textContent?.trim());
    expect(labels).toEqual(['Cursos', 'Alumnos', 'Asistencias', 'Certificaciones']);
  });

  it('marca aria-current=page en el ítem activo (Inicio)', async () => {
    const f = await render('/admin/dashboard');
    const el = f.nativeElement as HTMLElement;
    const current = el.querySelector('nav a[aria-current="page"]');
    expect(current?.textContent).toContain('Inicio');
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