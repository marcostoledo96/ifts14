import { TestBed } from '@angular/core/testing';
import { provideRouter, Router } from '@angular/router';
import { LoginPage } from './login-page';
import { ADMIN_AUTH, AdminAuthCredentials, FakeAdminAuthService } from './admin-auth.service';

describe('LoginPage', () => {
  async function render() {
    await TestBed.configureTestingModule({
      imports: [LoginPage],
      providers: [
        provideRouter([]),
        { provide: ADMIN_AUTH, useClass: FakeAdminAuthService },
      ],
    }).compileComponents();
    const fixture = TestBed.createComponent(LoginPage);
    fixture.detectChanges();
    return fixture;
  }

  it('muestra Panel de certificaciones y acceso autorizado', async () => {
    const f = await render();
    const el = f.nativeElement as HTMLElement;
    expect(el.textContent).toContain('Panel de certificaciones');
    expect(el.textContent).toContain('Acceso exclusivo para personal autorizado');
    expect(el.textContent).not.toContain('Acceso simulado');
  });

  it('tiene role=main, aside institucional y footer restringido', async () => {
    const f = await render();
    const el = f.nativeElement as HTMLElement;
    expect(el.querySelector('main[role="main"]')).not.toBeNull();
    expect(el.querySelector('aside[aria-label]')).not.toBeNull();
    expect(el.textContent).toContain('Bedelía Digital');
    expect(el.textContent).not.toContain('Estado del sistema');
    expect(el.textContent).not.toContain('Protocolo');
    expect(el.textContent).not.toContain('SHA-256 / SSL');
    expect(el.textContent).toContain('Acceso restringido');
    expect(el.textContent).toContain('Marcos Ezequiel Toledo');
    expect(el.textContent).toContain('Matías Ríos');
    expect(el.textContent).toContain('IFTS N.° 16');
    expect(el.querySelector('.aside-texture')).not.toBeNull();
    expect(el.querySelector('.main-texture')).not.toBeNull();
  });

  it('incluye skip link hacia #contenido', async () => {
    const f = await render();
    const el = f.nativeElement as HTMLElement;
    expect(el.querySelector('a.skip-link')?.getAttribute('href')).toBe('#contenido');
  });

  it('login exitoso navega a /admin/dashboard', async () => {
    const f = await render();
    const router = TestBed.inject(Router);
    const navSpy = spyOn(router, 'navigate').and.returnValue(Promise.resolve(true));
    const creds: AdminAuthCredentials = { username: 'admin', password: 'clave123' };
    await f.componentInstance.onLoginSubmitted(creds);
    expect(navSpy).toHaveBeenCalledWith(['/admin/dashboard']);
    expect(f.componentInstance.loading()).toBe(false);
  });

  it('activa loading durante el login asíncrono', async () => {
    const f = await render();
    const auth = TestBed.inject(ADMIN_AUTH) as FakeAdminAuthService;
    let resolveLogin!: () => void;
    spyOn(auth, 'login').and.returnValue(
      new Promise<void>((resolve) => {
        resolveLogin = resolve;
      }),
    );
    const pending = f.componentInstance.onLoginSubmitted({
      username: 'admin',
      password: 'clave123',
    });
    expect(f.componentInstance.loading()).toBe(true);
    resolveLogin();
    await pending;
    expect(f.componentInstance.loading()).toBe(false);
  });

  it('login con error 401 muestra mensaje de credenciales y no navega', async () => {
    const f = await render();
    const router = TestBed.inject(Router);
    const navSpy = spyOn(router, 'navigate').and.returnValue(Promise.resolve(true));
    const auth = TestBed.inject(ADMIN_AUTH) as FakeAdminAuthService;
    spyOn(auth, 'login').and.callFake(() => Promise.reject({ status: 401 }));
    await f.componentInstance.onLoginSubmitted({ username: 'bad', password: 'wrong' });
    f.detectChanges();
    expect(f.componentInstance.errorMsg()).toContain('no coinciden con un registro autorizado');
    expect(f.componentInstance.loading()).toBe(false);
    expect(navSpy).not.toHaveBeenCalled();
    const el = f.nativeElement as HTMLElement;
    expect(el.querySelector('.error-login')).toBeNull();
    expect(el.querySelector('#login-error[role="alert"]')?.textContent).toContain(
      'no coinciden con un registro autorizado',
    );
  });

  it('login con error 429 muestra mensaje de rate limit y no navega', async () => {
    const f = await render();
    const router = TestBed.inject(Router);
    const navSpy = spyOn(router, 'navigate').and.returnValue(Promise.resolve(true));
    const auth = TestBed.inject(ADMIN_AUTH) as FakeAdminAuthService;
    spyOn(auth, 'login').and.callFake(() => Promise.reject({ status: 429 }));
    await f.componentInstance.onLoginSubmitted({ username: 'x', password: 'y' });
    expect(f.componentInstance.errorMsg()).toContain('Demasiados intentos');
    expect(navSpy).not.toHaveBeenCalled();
  });

  it('login con error de red muestra mensaje de conexión y no navega', async () => {
    const f = await render();
    const router = TestBed.inject(Router);
    const navSpy = spyOn(router, 'navigate').and.returnValue(Promise.resolve(true));
    const auth = TestBed.inject(ADMIN_AUTH) as FakeAdminAuthService;
    spyOn(auth, 'login').and.callFake(() => Promise.reject({ status: 0 }));
    await f.componentInstance.onLoginSubmitted({ username: 'admin', password: 'clave123' });
    expect(f.componentInstance.errorMsg()).toContain('No se pudo conectar con el servidor');
    expect(navSpy).not.toHaveBeenCalled();
  });

  it('login con 5xx o payload inválido muestra mensaje genérico y no navega', async () => {
    const f = await render();
    const router = TestBed.inject(Router);
    const navSpy = spyOn(router, 'navigate').and.returnValue(Promise.resolve(true));
    const auth = TestBed.inject(ADMIN_AUTH) as FakeAdminAuthService;
    spyOn(auth, 'login').and.callFake(() => Promise.reject({ status: 502 }));
    await f.componentInstance.onLoginSubmitted({ username: 'admin', password: 'clave123' });
    expect(f.componentInstance.errorMsg()).toContain('No se pudo completar el acceso');
    expect(navSpy).not.toHaveBeenCalled();
  });

  it('rechazo sin status usa mensaje genérico (no lo trata como red)', async () => {
    const f = await render();
    const auth = TestBed.inject(ADMIN_AUTH) as FakeAdminAuthService;
    spyOn(auth, 'login').and.callFake(() => Promise.reject(new Error('boom')));
    await f.componentInstance.onLoginSubmitted({ username: 'admin', password: 'clave123' });
    expect(f.componentInstance.errorMsg()).toContain('No se pudo completar el acceso');
    expect(f.componentInstance.errorMsg()).not.toContain('conectar con el servidor');
  });

  it('no llama fetch al renderizar', async () => {
    const fetchSpy = spyOn(window, 'fetch').and.callThrough();
    await render();
    expect(fetchSpy).not.toHaveBeenCalled();
  });

  it('no contiene credenciales demo de la referencia React', async () => {
    const f = await render();
    const el = f.nativeElement as HTMLElement;
    expect(el.textContent).not.toContain('usuario.demo@example.invalid');
    expect(el.innerHTML).not.toContain('usuario.demo');
  });
});
