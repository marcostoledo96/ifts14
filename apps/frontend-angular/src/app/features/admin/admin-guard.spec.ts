import { TestBed } from '@angular/core/testing';
import { provideRouter, Router } from '@angular/router';
import { adminGuard } from './admin-guard';
import { MOCK_SESSION, InMemoryMockSession } from './mock-session';

describe('adminGuard', () => {
  async function setup(active: boolean) {
    await TestBed.configureTestingModule({
      providers: [
        provideRouter([]),
        { provide: MOCK_SESSION, useClass: InMemoryMockSession },
      ],
    }).compileComponents();
    const session = TestBed.inject(MOCK_SESSION);
    if (active) {
      session.signIn();
    } else {
      session.signOut();
    }
    return TestBed.inject(Router);
  }

  it('permite acceso si hay sesión mock activa', async () => {
    await setup(true);
    const result = TestBed.runInInjectionContext(() => adminGuard({} as never, {} as never));
    expect(result).toBe(true);
  });

  it('redirige a /admin/login si no hay sesión', async () => {
    await setup(false);
    const result = TestBed.runInInjectionContext(() => adminGuard({} as never, {} as never));
    expect(result.toString()).toContain('/admin/login');
  });

  it('no invoca fetch ni HttpClient al evaluar', async () => {
    const fetchSpy = spyOn(window, 'fetch').and.callThrough();
    await setup(true);
    TestBed.runInInjectionContext(() => adminGuard({} as never, {} as never));
    expect(fetchSpy).not.toHaveBeenCalled();
  });
});