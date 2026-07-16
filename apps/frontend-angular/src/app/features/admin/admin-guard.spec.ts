import { TestBed } from '@angular/core/testing';
import { provideRouter, Router } from '@angular/router';
import { adminGuard } from './admin-guard';
import { ADMIN_AUTH, FakeAdminAuthService } from './admin-auth.service';

describe('adminGuard', () => {
  async function setup(authenticated: boolean) {
    await TestBed.configureTestingModule({
      providers: [
        provideRouter([]),
        { provide: ADMIN_AUTH, useClass: FakeAdminAuthService },
      ],
    }).compileComponents();
    const auth = TestBed.inject(ADMIN_AUTH) as FakeAdminAuthService;
    auth.setAuthenticated(authenticated);
    return TestBed.inject(Router);
  }

  it('permite acceso si hay sesión activa', async () => {
    await setup(true);
    const result = await TestBed.runInInjectionContext(() =>
      adminGuard({} as never, {} as never),
    );
    expect(result).toBe(true);
  });

  it('redirige a /admin/login si no hay sesión', async () => {
    await setup(false);
    const result = await TestBed.runInInjectionContext(() =>
      adminGuard({} as never, {} as never),
    );
    expect(result.toString()).toContain('/admin/login');
  });

  it('no invoca fetch al evaluar', async () => {
    const fetchSpy = spyOn(window, 'fetch').and.callThrough();
    await setup(true);
    await TestBed.runInInjectionContext(() => adminGuard({} as never, {} as never));
    expect(fetchSpy).not.toHaveBeenCalled();
  });
});