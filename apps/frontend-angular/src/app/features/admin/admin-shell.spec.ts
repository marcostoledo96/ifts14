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