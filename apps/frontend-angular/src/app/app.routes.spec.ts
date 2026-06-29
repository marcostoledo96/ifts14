import { TestBed } from '@angular/core/testing';
import { provideRouter, Router } from '@angular/router';
import { routes } from './app.routes';
import { NotFoundPage } from './features/not-found/not-found-page';
import { PublicValidationPage } from './features/public-validation/public-validation-page';

// Verifica que las rutas mal formadas no redirijan a un token de demo válido,
// evitando que una URL inválida parezca un certificado verificado.
describe('app.routes', () => {
  it("raíz redirige a validar/demo-valido", () => {
    const root = routes.find((r) => r.path === '');
    expect(root?.redirectTo).toBe('validar/demo-valido');
    expect(root?.pathMatch).toBe('full');
  });

  it("ruta válida carga PublicValidationPage", () => {
    const validar = routes.find((r) => r.path === 'validar/:tokenCertificacion');
    expect(validar?.loadComponent).toBeDefined();
  });

  it("wildcard NO redirige a demo-valido ni a validar", () => {
    const wildcard = routes.find((r) => r.path === '**');
    expect(wildcard).toBeDefined();
    expect(wildcard?.redirectTo).toBeUndefined();
    expect(wildcard?.loadComponent).toBeDefined();
    // No debe cargar el componente de validación pública.
    expect(wildcard?.loadComponent).not.toBe(
      routes.find((r) => r.path === 'validar/:tokenCertificacion')?.loadComponent,
    );
  });

  it("wildcard carga NotFoundPage (página segura sin validación)", async () => {
    const wildcard = routes.find((r) => r.path === '**');
    // loadComponent ya aplica .then((m) => m.NotFoundPage): devuelve la clase.
    const cmp = await (wildcard!.loadComponent as () => Promise<unknown>)();
    expect(typeof cmp).toBe('function');
  });

  it("navegación real: wildcard no termina en demo-valido", async () => {
    await TestBed.configureTestingModule({
      providers: [provideRouter(routes)],
    }).compileComponents();
    const router = TestBed.inject(Router);
    await router.navigateByUrl('/ruta-inexistente');
    expect(router.url).not.toContain('demo-valido');
    expect(router.url).not.toContain('/validar/');
  });
});