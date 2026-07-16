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

  it('muestra subtítulo de acceso administrativo', async () => {
    const f = await render();
    const el = f.nativeElement as HTMLElement;
    expect(el.textContent).toContain('Acceso administrativo');
  });

  it('tiene role=main y un aside informativo', async () => {
    const f = await render();
    const el = f.nativeElement as HTMLElement;
    expect(el.querySelector('main[role="main"]')).not.toBeNull();
    expect(el.querySelector('aside[aria-label]')).not.toBeNull();
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
    await f.componentInstance.onAccesoSimulado(creds);
    expect(navSpy).toHaveBeenCalledWith(['/admin/dashboard']);
  });

  it('login con error 401 muestra mensaje de credenciales inválidas', async () => {
    const f = await render();
    const auth = TestBed.inject(ADMIN_AUTH) as FakeAdminAuthService;
    spyOn(auth, 'login').and.callFake(() => Promise.reject({ status: 401 }));
    await f.componentInstance.onAccesoSimulado({ username: 'bad', password: 'wrong' });
    expect(f.componentInstance.errorMsg()).toContain('Credenciales inválidas');
  });

  it('login con error 429 muestra mensaje de rate limit', async () => {
    const f = await render();
    const auth = TestBed.inject(ADMIN_AUTH) as FakeAdminAuthService;
    spyOn(auth, 'login').and.callFake(() => Promise.reject({ status: 429 }));
    await f.componentInstance.onAccesoSimulado({ username: 'x', password: 'y' });
    expect(f.componentInstance.errorMsg()).toContain('Demasiados intentos');
  });

  it('no llama fetch al renderizar', async () => {
    const fetchSpy = spyOn(window, 'fetch').and.callThrough();
    await render();
    expect(fetchSpy).not.toHaveBeenCalled();
  });
});