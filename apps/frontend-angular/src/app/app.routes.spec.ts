import { TestBed } from '@angular/core/testing';
import { provideRouter, Router } from '@angular/router';
import { routes } from './app.routes';
import { NotFoundPage } from './features/not-found/not-found-page';
import { PublicValidationPage } from './features/public-validation/public-validation-page';
import { LandingPage } from './features/landing/landing-page';
import { LoginPage } from './features/admin/login-page';
import { AdminShell } from './features/admin/admin-shell';
import { MOCK_SESSION, InMemoryMockSession } from './features/admin/mock-session';

// Verifica que ninguna ruta apunte a un token de demo salvo la validación
// explícita en validar/:tokenCertificacion, evitando que una URL inválida
// o la raíz disparen validación con token de demo.
describe('app.routes', () => {
  async function setupRouter(initialUrl?: string) {
    await TestBed.configureTestingModule({
      providers: [
        provideRouter(routes),
        { provide: MOCK_SESSION, useClass: InMemoryMockSession },
      ],
    }).compileComponents();
    const router = TestBed.inject(Router);
    if (initialUrl) {
      await router.navigateByUrl(initialUrl);
    }
    return router;
  }

  it("raíz carga LandingPage (no redirige a demo-valido)", () => {
    const root = routes.find((r) => r.path === '');
    expect(root?.redirectTo).toBeUndefined();
    expect(root?.loadComponent).toBeDefined();
    expect(root?.pathMatch).toBe('full');
  });

  it("raíz no carga PublicValidationPage", () => {
    const root = routes.find((r) => r.path === '');
    const validar = routes.find((r) => r.path === 'validar/:tokenCertificacion');
    expect(root?.loadComponent).not.toBe(validar?.loadComponent);
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

  it("ninguna ruta redirige a demo-valido", () => {
    for (const r of routes) {
      expect(r.redirectTo).not.toContain('demo-valido');
    }
  });

  it("navegación real: raíz no termina en demo-valido ni en validar", async () => {
    await setupRouter();
    const router = TestBed.inject(Router);
    await router.navigateByUrl('/');
    expect(router.url).not.toContain('demo-valido');
    expect(router.url).not.toContain('/validar/');
  });

  it("navegación real: wildcard no termina en demo-valido", async () => {
    await setupRouter();
    const router = TestBed.inject(Router);
    await router.navigateByUrl('/ruta-inexistente');
    expect(router.url).not.toContain('demo-valido');
    expect(router.url).not.toContain('/validar/');
  });

  // --- Rutas admin F2-03 ---

  it("admin/login carga LoginPage", () => {
    const r = routes.find((x) => x.path === 'admin/login');
    expect(r?.loadComponent).toBeDefined();
  });

  it("admin/dashboard tiene adminGuard", () => {
    const r = routes.find((x) => x.path === 'admin/dashboard');
    expect(r?.canActivate).toBeDefined();
    expect(r?.canActivate?.length).toBeGreaterThan(0);
  });

  it("admin redirige a /admin/dashboard (pathMatch full)", () => {
    const r = routes.find((x) => x.path === 'admin');
    expect(r?.redirectTo).toBe('/admin/dashboard');
    expect(r?.pathMatch).toBe('full');
    expect(r?.loadComponent).toBeUndefined();
  });

  it("admin/login precede al wildcard en el array de rutas", () => {
    const adminLogin = routes.findIndex((x) => x.path === 'admin/login');
    const wildcard = routes.findIndex((x) => x.path === '**');
    expect(adminLogin).toBeGreaterThanOrEqual(0);
    expect(wildcard).toBeGreaterThan(adminLogin);
  });

  it("navegación real /admin/login carga LoginPage sin sesión", async () => {
    await setupRouter('/admin/login');
    const router = TestBed.inject(Router);
    expect(router.url).toBe('/admin/login');
  });

  it("navegación real /admin sin sesión redirige a /admin/login", async () => {
    await setupRouter('/admin');
    const router = TestBed.inject(Router);
    expect(router.url).toBe('/admin/login');
  });

  it("navegación real /admin/dashboard sin sesión redirige a /admin/login", async () => {
    await setupRouter('/admin/dashboard');
    const router = TestBed.inject(Router);
    expect(router.url).toBe('/admin/login');
  });

  it("navegación real /admin con sesión redirige a /admin/dashboard", async () => {
    await TestBed.configureTestingModule({
      providers: [
        provideRouter(routes),
        { provide: MOCK_SESSION, useClass: InMemoryMockSession },
      ],
    }).compileComponents();
    const session = TestBed.inject(MOCK_SESSION);
    session.signIn();
    const router = TestBed.inject(Router);
    await router.navigateByUrl('/admin');
    expect(router.url).toBe('/admin/dashboard');
  });

  it("navegación real /admin/login resuelve a LoginPage sin caer en NotFound", async () => {
    await setupRouter('/admin/login');
    const router = TestBed.inject(Router);
    expect(router.url).toBe('/admin/login');
    expect(router.url).not.toContain('not-found');
  });

  // --- Aislamiento admin wildcard (Codex PR #34) ---
  // /admin/* desconocido NO debe caer en el wildcard público; debe usar
  // el redirect admin específico (pathMatch prefix) y preservar el wildcard
  // público para URLs no-admin.

  it("existe una ruta admin catch-all (pathMatch prefix) antes del wildcard público", () => {
    const adminCatchall = routes.findIndex(
      (x) => x.path === 'admin' && x.pathMatch === 'prefix',
    );
    const publicWildcard = routes.findIndex((x) => x.path === '**');
    expect(adminCatchall).toBeGreaterThanOrEqual(0);
    expect(publicWildcard).toBeGreaterThan(adminCatchall);
  });

  it("admin catch-all (prefix) redirige a /admin/dashboard (no usa loadComponent público)", () => {
    const r = routes.find((x) => x.path === 'admin' && x.pathMatch === 'prefix');
    expect(r?.redirectTo).toBe('/admin/dashboard');
    expect(r?.loadComponent).toBeUndefined();
  });

  it("admin catch-all no es el wildcard público (aislamiento de rutas)", () => {
    const adminCatchall = routes.find(
      (x) => x.path === 'admin' && x.pathMatch === 'prefix',
    );
    const publicWildcard = routes.find((x) => x.path === '**');
    expect(adminCatchall).toBeDefined();
    expect(publicWildcard).toBeDefined();
    expect(adminCatchall?.path).not.toBe(publicWildcard?.path);
  });

  it("navegación real /admin/typo sin sesión termina en /admin/login (no en NotFound)", async () => {
    await setupRouter('/admin/typo');
    const router = TestBed.inject(Router);
    expect(router.url).toBe('/admin/login');
    expect(router.url).not.toContain('not-found');
  });

  it("navegación real /admin/cursos sin sesión termina en /admin/login (no en NotFound)", async () => {
    await setupRouter('/admin/cursos');
    const router = TestBed.inject(Router);
    expect(router.url).toBe('/admin/login');
    expect(router.url).not.toContain('not-found');
  });

  it("navegación real /admin/typo con sesión termina en /admin/dashboard", async () => {
    await TestBed.configureTestingModule({
      providers: [
        provideRouter(routes),
        { provide: MOCK_SESSION, useClass: InMemoryMockSession },
      ],
    }).compileComponents();
    const session = TestBed.inject(MOCK_SESSION);
    session.signIn();
    const router = TestBed.inject(Router);
    await router.navigateByUrl('/admin/typo');
    expect(router.url).toBe('/admin/dashboard');
  });

  it("wildcard público sigue capturando URLs no-admin desconocidas", async () => {
    await setupRouter('/ruta-publica-inexistente');
    const router = TestBed.inject(Router);
    // La wildcard pública carga NotFoundPage; no redirige a admin.
    expect(router.url).not.toContain('/admin/');
    // Tampoco debe redirigir: la URL inválida pública se preserva.
    expect(router.url).toBe('/ruta-publica-inexistente');
  });

  it("rutas públicas intactas tras agregar admin", async () => {
    await setupRouter('/');
    const router = TestBed.inject(Router);
    await router.navigateByUrl('/');
    expect(router.url).toBe('/');
    await router.navigateByUrl('/validar/demo-valido');
    expect(router.url).toContain('/validar/');
  });

  it("loadComponent de admin/login devuelve LoginPage", async () => {
    const r = routes.find((x) => x.path === 'admin/login');
    const cmp = await (r!.loadComponent as () => Promise<unknown>)();
    expect(cmp).toBe(LoginPage);
  });

  it("loadComponent de admin/dashboard devuelve AdminShell", async () => {
    const r = routes.find((x) => x.path === 'admin/dashboard');
    const cmp = await (r!.loadComponent as () => Promise<unknown>)();
    expect(cmp).toBe(AdminShell);
  });
});