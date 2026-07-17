import { TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { provideRouter, Router } from '@angular/router';
import { AdminShell } from './admin-shell';
import { SidebarAdmin } from './sidebar-admin';
import { ADMIN_AUTH, FakeAdminAuthService } from './admin-auth.service';

describe('AdminShell', () => {
  async function render() {
    await TestBed.configureTestingModule({
      imports: [AdminShell],
      providers: [
        provideRouter([]),
        { provide: ADMIN_AUTH, useClass: FakeAdminAuthService },
      ],
    }).compileComponents();
    const fixture = TestBed.createComponent(AdminShell);
    fixture.detectChanges();
    return fixture;
  }

  async function renderWithRoutes(initialUrl: string) {
    await TestBed.configureTestingModule({
      imports: [AdminShell],
      providers: [
        provideRouter([
          { path: 'admin/dashboard', component: AdminShell },
          { path: 'admin/cursos', component: AdminShell },
          { path: 'admin/cursos/:id', component: AdminShell },
          { path: '**', redirectTo: 'admin/dashboard' },
        ]),
        { provide: ADMIN_AUTH, useClass: FakeAdminAuthService },
      ],
    }).compileComponents();
    const router = TestBed.inject(Router);
    await router.navigateByUrl(initialUrl);
    const fixture = TestBed.createComponent(AdminShell);
    fixture.detectChanges();
    await fixture.whenStable();
    fixture.detectChanges();
    return fixture;
  }

  it('renderiza banner móvil (role=banner) sin duplicar main ni contentinfo del root', async () => {
    const f = await render();
    const el = f.nativeElement as HTMLElement;
    expect(el.querySelectorAll('[role="banner"]').length).toBe(1);
    expect(el.querySelector('.mobile-nav')).not.toBeNull();
    expect(el.querySelector('.topbar')).toBeNull();
    expect(el.querySelectorAll('[role="main"]').length).toBe(1);
    expect(el.querySelectorAll('[role="contentinfo"]').length).toBe(1);
  });

  it('expone <router-outlet> y NO renderiza el dashboard inline', async () => {
    const f = await render();
    const el = f.nativeElement as HTMLElement;
    expect(el.querySelector('router-outlet')).not.toBeNull();
    expect(el.querySelector('app-admin-dashboard-page')).toBeNull();
  });

  it('NO muestra search, sync, ayuda, notificaciones ni avatar en el chrome', async () => {
    const f = await render();
    const el = f.nativeElement as HTMLElement;
    expect(el.querySelector('.topbar-search')).toBeNull();
    expect(el.querySelector('input[type="search"]')).toBeNull();
    expect(el.querySelector('.topbar-sync')).toBeNull();
    expect(el.textContent).not.toContain('Sincronizado');
    expect(el.querySelector('[aria-label="Ayuda"]')).toBeNull();
    expect(el.querySelector('[aria-label="Notificaciones"]')).toBeNull();
    expect(el.querySelector('.topbar-avatar')).toBeNull();
    expect(el.textContent).not.toContain('Sesión activa');
    expect(el.textContent).not.toContain('IFTS N.° 14 — Admin');
  });

  it('incluye skip link hacia #contenido', async () => {
    const f = await render();
    const el = f.nativeElement as HTMLElement;
    expect(el.querySelector('a.skip-link')?.getAttribute('href')).toBe('#contenido');
  });

  it('expone control de navegación mobile (botón menú)', async () => {
    const f = await render();
    const el = f.nativeElement as HTMLElement;
    const btn = el.querySelector('.menu-btn') as HTMLButtonElement | null;
    expect(btn).not.toBeNull();
    expect(btn?.getAttribute('aria-label')).toContain('navegación');
    expect(btn?.getAttribute('aria-controls')).toBeNull();
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

  it('drawer mobile, overlay, nav y logout están AUSENTES cuando el menú está cerrado', async () => {
    const f = await render();
    const el = f.nativeElement as HTMLElement;
    expect(el.querySelector('.drawer-overlay')).toBeNull();
    expect(el.querySelector('.drawer-mobile')).toBeNull();
    const drawers = el.querySelectorAll('.drawer-mobile app-sidebar-admin');
    expect(drawers.length).toBe(0);
  });

  it('drawer mobile, overlay, nav y logout quedan PRESENTES cuando el menú está abierto', async () => {
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

  it('cerrar sesión llama logout y navega a /admin/login', async () => {
    const f = await render();
    const auth = TestBed.inject(ADMIN_AUTH) as FakeAdminAuthService;
    auth.setAuthenticated(true);
    const router = TestBed.inject(Router);
    const navSpy = spyOn(router, 'navigate').and.returnValue(Promise.resolve(true));
    const logoutSpy = spyOn(auth, 'logout').and.callThrough();
    await f.componentInstance.cerrarSesion();
    expect(logoutSpy).toHaveBeenCalled();
    expect(navSpy).toHaveBeenCalledWith(['/admin/login']);
  });

  it('rutaActual refleja la URL inicial del router', async () => {
    const f = await renderWithRoutes('/admin/cursos');
    expect(f.componentInstance.rutaActual()).toContain('/admin/cursos');
  });

  it('pasa [active] al SidebarAdmin desktop con la ruta actual', async () => {
    const f = await renderWithRoutes('/admin/cursos');
    f.detectChanges();
    const de = f.debugElement.query(By.css('.sidebar-desktop app-sidebar-admin'));
    expect(de).not.toBeNull();
    const sidebar = de.componentInstance as SidebarAdmin;
    expect(sidebar.active()).toContain('/admin/cursos');
  });

  it('al navegar a /admin/cursos/1, marca Cursos como activo en el sidebar', async () => {
    const f = await renderWithRoutes('/admin/cursos/1');
    f.detectChanges();
    await f.whenStable();
    f.detectChanges();
    const el = f.nativeElement as HTMLElement;
    const cursosLink = el.querySelector('.sidebar-desktop a.active') as HTMLAnchorElement | null;
    expect(cursosLink).not.toBeNull();
    expect(cursosLink?.textContent).toContain('Cursos');
  });
});
