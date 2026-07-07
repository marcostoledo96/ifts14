import { TestBed } from '@angular/core/testing';
import { provideRouter, Router } from '@angular/router';
import { AdminShell } from './admin-shell';
import { MOCK_SESSION, InMemoryMockSession } from './mock-session';

describe('AdminShell', () => {
  async function render() {
    await TestBed.configureTestingModule({
      imports: [AdminShell],
      providers: [
        provideRouter([]),
        { provide: MOCK_SESSION, useClass: InMemoryMockSession },
      ],
    }).compileComponents();
    const fixture = TestBed.createComponent(AdminShell);
    fixture.detectChanges();
    return fixture;
  }

  it('renderiza banner único (role=banner) sin duplicar main ni contentinfo del root', async () => {
    const f = await render();
    const el = f.nativeElement as HTMLElement;
    expect(el.querySelectorAll('[role="banner"]').length).toBe(1);
    expect(el.querySelectorAll('[role="main"]').length).toBe(1);
    expect(el.querySelectorAll('[role="contentinfo"]').length).toBe(1);
  });

  it('muestra badge Sesión mock en topbar', async () => {
    const f = await render();
    const el = f.nativeElement as HTMLElement;
    expect(el.textContent).toContain('Sesión mock');
  });

  it('incluye skip link hacia #contenido', async () => {
    const f = await render();
    const el = f.nativeElement as HTMLElement;
    expect(el.querySelector('a.skip-link')?.getAttribute('href')).toBe('#contenido');
  });

  // --- Navegación mobile (Codex PR #34) ---
  // AdminShell debe exponer un control de navegación en viewports pequeños
  // que permita acceder a las secciones y al logout.

  it('expone control de navegación mobile (botón menú)', async () => {
    const f = await render();
    const el = f.nativeElement as HTMLElement;
    const btn = el.querySelector('.menu-btn') as HTMLButtonElement | null;
    expect(btn).not.toBeNull();
    expect(btn?.getAttribute('aria-label')).toContain('navegación');
    // Drawer condicional: aria-controls solo apunta a un elemento existente
    // cuando el drawer está en el DOM. Cerrado => null (sin target roto).
    expect(btn?.getAttribute('aria-controls')).toBeNull();
    // aria-expanded refleja el estado del drawer (cerrado al inicio).
    expect(btn?.getAttribute('aria-expanded')).toBe('false');
  });

  it('abrirMenu/cerrarMenu setean menuAbierto', async () => {
    const f = await render();
    expect(f.componentInstance.menuAbierto()).toBe(false);
    f.componentInstance.abrirMenu();
    expect(f.componentInstance.menuAbierto()).toBe(true);
    f.componentInstance.cerrarMenu();
    expect(f.componentInstance.menuAbierto()).toBe(false);
  });

  // --- Drawer condicional (CRITICAL a11y PR #34) ---
  // El drawer (y su SidebarAdmin con nav/logout) NO debe existir en el DOM
  // cuando está cerrado: un panel oculto solo con transform deja links/botones
  // focusables expuestos a teclado y screen readers. Render condicional es la
  // única garantía real de remoción del árbol de accesibilidad.

  it('drawer mobile, overlay, nav y logout están AUSENTES cuando el menú está cerrado', async () => {
    const f = await render();
    const el = f.nativeElement as HTMLElement;
    expect(el.querySelector('.drawer-overlay')).toBeNull();
    expect(el.querySelector('.drawer-mobile')).toBeNull();
    // El sidebar desktop sigue existiendo (otra landmark), pero el drawer
    // mobile no: no debe contener una segunda instancia de SidebarAdmin.
    const drawers = el.querySelectorAll('.drawer-mobile app-sidebar-admin');
    expect(drawers.length).toBe(0);
  });

  it('drawer mobile, overlay, nav y logout están PRESENTES cuando el menú está abierto', async () => {
    const f = await render();
    f.componentInstance.abrirMenu();
    f.detectChanges();
    const el = f.nativeElement as HTMLElement;
    const overlay = el.querySelector('.drawer-overlay');
    const drawer = el.querySelector('.drawer-mobile');
    expect(overlay).not.toBeNull();
    expect(drawer).not.toBeNull();
    const logoutBtn = drawer?.querySelector('.logout-btn') as HTMLButtonElement | null;
    expect(logoutBtn).not.toBeNull();
    expect(logoutBtn?.textContent).toContain('Cerrar sesión');
    const btn = el.querySelector('.menu-btn') as HTMLButtonElement | null;
    expect(btn?.getAttribute('aria-expanded')).toBe('true');
    // Cuando el drawer existe en el DOM, aria-controls apunta a su id.
    expect(btn?.getAttribute('aria-controls')).toBe('admin-drawer');
  });

  it('cerrarMenu remueve el drawer del DOM (no solo lo mueve off-screen)', async () => {
    const f = await render();
    f.componentInstance.abrirMenu();
    f.detectChanges();
    const el = f.nativeElement as HTMLElement;
    expect(el.querySelector('.drawer-mobile')).not.toBeNull();
    f.componentInstance.cerrarMenu();
    f.detectChanges();
    expect(el.querySelector('.drawer-mobile')).toBeNull();
    expect(el.querySelector('.drawer-overlay')).toBeNull();
  });

  it('logout sigue accesible desde el drawer mobile cuando está abierto', async () => {
    const f = await render();
    f.componentInstance.abrirMenu();
    f.detectChanges();
    const el = f.nativeElement as HTMLElement;
    const drawer = el.querySelector('.drawer-mobile') as HTMLElement;
    const logoutBtn = drawer.querySelector('.logout-btn') as HTMLButtonElement | null;
    expect(logoutBtn).not.toBeNull();
    expect(logoutBtn?.textContent).toContain('Cerrar sesión');
  });

  it('cerrar sesión llama a signOut y navega a /admin/login', async () => {
    const f = await render();
    const session = TestBed.inject(MOCK_SESSION);
    session.signIn();
    const router = TestBed.inject(Router);
    // ponytail: stub navigate para evitar NG04002 del harness con provideRouter([])
    const navSpy = spyOn(router, 'navigate').and.returnValue(
      Promise.resolve(true),
    );
    f.componentInstance.cerrarSesion();
    expect(session.hasSession()).toBe(false);
    expect(navSpy).toHaveBeenCalledWith(['/admin/login']);
  });
});