import { TestBed } from '@angular/core/testing';
import { provideRouter, Router } from '@angular/router';
import { LoginPage } from './login-page';
import { MOCK_SESSION, InMemoryMockSession } from './mock-session';

describe('LoginPage', () => {
  async function render() {
    await TestBed.configureTestingModule({
      imports: [LoginPage],
      providers: [
        provideRouter([]),
        { provide: MOCK_SESSION, useClass: InMemoryMockSession },
      ],
    }).compileComponents();
    const fixture = TestBed.createComponent(LoginPage);
    fixture.detectChanges();
    return fixture;
  }

  it('muestra el subtítulo visible de simulación', async () => {
    const f = await render();
    const el = f.nativeElement as HTMLElement;
    expect(el.textContent).toContain(
      'Acceso simulado — la autenticación real se define en una fase posterior',
    );
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
    expect(el.querySelector('a.skip-link')?.getAttribute('href')).toBe(
      '#contenido',
    );
  });

  it('activa sesión y navega a /admin/dashboard en onAccesoSimulado', async () => {
    const f = await render();
    const session = TestBed.inject(MOCK_SESSION);
    const router = TestBed.inject(Router);
    // ponytail: stub navigate para evitar NG04002 del harness con provideRouter([])
    const navSpy = spyOn(router, 'navigate').and.returnValue(
      Promise.resolve(true),
    );
    f.componentInstance.onAccesoSimulado();
    expect(session.hasSession()).toBe(true);
    expect(navSpy).toHaveBeenCalledWith(['/admin/dashboard']);
  });

  it('no llama fetch al renderizar', async () => {
    const fetchSpy = spyOn(window, 'fetch').and.callThrough();
    await render();
    expect(fetchSpy).not.toHaveBeenCalled();
  });
});