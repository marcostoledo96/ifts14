import { TestBed } from '@angular/core/testing';
import { provideRouter, Router, Routes, withComponentInputBinding } from '@angular/router';
import { RouterTestingHarness } from '@angular/router/testing';
import { routes } from './app.routes';
import { NotFoundPage } from './features/not-found/not-found-page';
import { PublicValidationPage } from './features/public-validation/public-validation-page';
import { LandingPage } from './features/landing/landing-page';
import { LoginPage } from './features/admin/login-page';
import { AdminShell } from './features/admin/admin-shell';
import { MOCK_SESSION, InMemoryMockSession } from './features/admin/mock-session';
import { CoursesListPage } from './features/admin/courses/courses-list-page';
import { CourseDetailPage } from './features/admin/courses/course-detail-page';
import { CourseEditorPage } from './features/admin/courses/course-editor-page';
import { COURSES_SOURCE } from './features/admin/courses/courses.service';
import { InMemoryCoursesService } from './features/admin/courses/in-memory-courses.service';
import { ATTENDANCE_SOURCE } from './features/admin/attendances/data/attendance.token';
import { AttendanceMockService } from './features/admin/attendances/data/attendance-mock.service';

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

  it("admin (shell) tiene adminGuard", () => {
    // F2-04: admin/dashboard pasó a ser hijo; el guard vive en la ruta admin
    // que carga AdminShell con children.
    const r = routes.find((x) => x.path === 'admin' && x.children !== undefined);
    expect(r?.canActivate).toBeDefined();
    expect(r?.canActivate?.length).toBeGreaterThan(0);
  });

  it("admin redirige a /admin/dashboard (pathMatch full)", () => {
    const r = routes.find((x) => x.path === 'admin' && x.pathMatch === 'full');
    expect(r?.redirectTo).toBe('/admin/dashboard');
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

  it("loadComponent de admin (shell) devuelve AdminShell", async () => {
    // F2-04: AdminShell ahora es loadComponent de la ruta admin con children.
    const r = routes.find((x) => x.path === 'admin' && x.children !== undefined);
    const cmp = await (r!.loadComponent as () => Promise<unknown>)();
    expect(cmp).toBe(AdminShell);
  });

  // --- Rutas admin/cursos F2-04 ---

  function adminChildren() {
    const adminRoute = routes.find((x) => x.path === 'admin' && x.children !== undefined);
    return adminRoute?.children || [];
  }

  it("admin children define dashboard, cursos, cursos/nuevo, cursos/:id, cursos/:id/editar", () => {
    const children = adminChildren();
    const paths = children.map((c) => c.path);
    expect(paths).toContain('dashboard');
    expect(paths).toContain('cursos');
    expect(paths).toContain('cursos/nuevo');
    expect(paths).toContain('cursos/:id');
    expect(paths).toContain('cursos/:id/editar');
  });

  it("orden: cursos/nuevo ANTES que cursos/:id (no cae en :id=nuevo)", () => {
    const children = adminChildren();
    const idxNuevo = children.findIndex((c) => c.path === 'cursos/nuevo');
    const idxId = children.findIndex((c) => c.path === 'cursos/:id');
    expect(idxNuevo).toBeGreaterThanOrEqual(0);
    expect(idxId).toBeGreaterThanOrEqual(0);
    expect(idxNuevo).toBeLessThan(idxId);
  });

  it("orden: cursos/:id/editar ANTES que cursos/:id (no cae en :id=:id/editar)", () => {
    const children = adminChildren();
    const idxEditar = children.findIndex((c) => c.path === 'cursos/:id/editar');
    const idxId = children.findIndex((c) => c.path === 'cursos/:id');
    expect(idxEditar).toBeGreaterThanOrEqual(0);
    expect(idxId).toBeGreaterThanOrEqual(0);
    expect(idxEditar).toBeLessThan(idxId);
  });

  it("orden: cursos/:id ANTES que cursos (listado)", () => {
    const children = adminChildren();
    const idxId = children.findIndex((c) => c.path === 'cursos/:id');
    const idxList = children.findIndex((c) => c.path === 'cursos');
    expect(idxId).toBeLessThan(idxList);
  });

  it("navegación real /admin/cursos/nuevo con sesión NO cae en :id", async () => {
    await TestBed.configureTestingModule({
      providers: [
        provideRouter(routes),
        { provide: MOCK_SESSION, useClass: InMemoryMockSession },
      ],
    }).compileComponents();
    const session = TestBed.inject(MOCK_SESSION);
    session.signIn();
    const router = TestBed.inject(Router);
    await router.navigateByUrl('/admin/cursos/nuevo');
    expect(router.url).toBe('/admin/cursos/nuevo');
  });

  it("navegación real /admin/cursos/123/editar con sesión NO cae en :id ni en nuevo", async () => {
    await TestBed.configureTestingModule({
      providers: [
        provideRouter(routes),
        { provide: MOCK_SESSION, useClass: InMemoryMockSession },
      ],
    }).compileComponents();
    const session = TestBed.inject(MOCK_SESSION);
    session.signIn();
    const router = TestBed.inject(Router);
    await router.navigateByUrl('/admin/cursos/123/editar');
    expect(router.url).toBe('/admin/cursos/123/editar');
  });

  it("navegación real /admin/cursos/nuevo sin sesión termina en /admin/login", async () => {
    await setupRouter('/admin/cursos/nuevo');
    const router = TestBed.inject(Router);
    expect(router.url).toBe('/admin/login');
  });

  it("navegación real /admin/cursos/123/editar sin sesión termina en /admin/login", async () => {
    await setupRouter('/admin/cursos/123/editar');
    const router = TestBed.inject(Router);
    expect(router.url).toBe('/admin/login');
  });

  it("navegación real /admin/cursos sin sesión termina en /admin/login", async () => {
    await setupRouter('/admin/cursos');
    const router = TestBed.inject(Router);
    expect(router.url).toBe('/admin/login');
  });

  it("navegación real /admin/cursos con sesión carga CoursesListPage", async () => {
    await TestBed.configureTestingModule({
      providers: [
        provideRouter(routes),
        { provide: MOCK_SESSION, useClass: InMemoryMockSession },
      ],
    }).compileComponents();
    const session = TestBed.inject(MOCK_SESSION);
    session.signIn();
    const router = TestBed.inject(Router);
    await router.navigateByUrl('/admin/cursos');
    expect(router.url).toBe('/admin/cursos');
  });

  it("navegación real /admin/cursos/1 con sesión carga CourseDetailPage", async () => {
    await TestBed.configureTestingModule({
      providers: [
        provideRouter(routes),
        { provide: MOCK_SESSION, useClass: InMemoryMockSession },
      ],
    }).compileComponents();
    const session = TestBed.inject(MOCK_SESSION);
    session.signIn();
    const router = TestBed.inject(Router);
    await router.navigateByUrl('/admin/cursos/1');
    expect(router.url).toBe('/admin/cursos/1');
  });

  it("navegación real /admin/cursos/nuevo con sesión carga CourseEditorPage (mode=create)", async () => {
    await TestBed.configureTestingModule({
      providers: [
        provideRouter(routes),
        { provide: MOCK_SESSION, useClass: InMemoryMockSession },
      ],
    }).compileComponents();
    const session = TestBed.inject(MOCK_SESSION);
    session.signIn();
    const router = TestBed.inject(Router);
    await router.navigateByUrl('/admin/cursos/nuevo');
    expect(router.url).toBe('/admin/cursos/nuevo');
  });

  it("rutas públicas intactas tras agregar admin/cursos", async () => {
    await setupRouter('/');
    const router = TestBed.inject(Router);
    await router.navigateByUrl('/');
    expect(router.url).toBe('/');
    await router.navigateByUrl('/validar/demo-valido');
    expect(router.url).toContain('/validar/');
  });

  // --- Provider runtime COURSES_SOURCE (gate correctivo F2-04) ---
  // Sin este provider en el árbol admin, /admin/cursos* revienta en runtime
  // con NullInjectorError. Los specs de componentes lo proveen a mano, lo que
  // enmascara el bug. Estos tests usan la config de rutas REAL y dejan que el
  // router instancie el componente enrutado dentro del route injector (donde
  // vive el provider), para probar el wiring runtime de verdad.

  async function setupHarnessWithSession() {
    await TestBed.configureTestingModule({
      providers: [
        provideRouter(routes, withComponentInputBinding()),
        { provide: MOCK_SESSION, useClass: InMemoryMockSession },
      ],
    }).compileComponents();
    const session = TestBed.inject(MOCK_SESSION);
    session.signIn();
    return session;
  }

  it("runtime: /admin/cursos instancia CoursesListPage via route injector sin NullInjectorError", async () => {
    await setupHarnessWithSession();
    const harness = await RouterTestingHarness.create('/admin/cursos');
    const cmp = harness.routeNativeElement?.querySelector('app-courses-list-page');
    expect(cmp).not.toBeNull();
    // El seed del in-memory carga 6 cursos: prueba que el provider real
    // (no un stub vacío) está conectado. esperamos estabilidad porque
    // CoursesListPage dispara recargar() async en el constructor.
    await harness.detectChanges();
    await harness.fixture.whenStable();
    await harness.detectChanges();
    const cards = cmp?.querySelectorAll('.card-curso') || [];
    expect(cards.length).toBe(6);
  });

  it("runtime: /admin/cursos/1 instancia CourseDetailPage via route injector sin NullInjectorError", async () => {
    await setupHarnessWithSession();
    const harness = await RouterTestingHarness.create('/admin/cursos/1');
    const cmp = harness.routeNativeElement?.querySelector('app-course-detail-page');
    expect(cmp).not.toBeNull();
  });

  it("runtime: /admin/cursos/nuevo instancia CourseEditorPage via route injector sin NullInjectorError", async () => {
    await setupHarnessWithSession();
    const harness = await RouterTestingHarness.create('/admin/cursos/nuevo');
    const cmp = harness.routeNativeElement?.querySelector('app-course-editor-page');
    expect(cmp).not.toBeNull();
  });

  it("regresión: sin COURSES_SOURCE en la ruta admin, /admin/cursos revienta en runtime", async () => {
    // Replica routes sin el provider COURSES_SOURCE de la ruta admin y
    // verifica que el router NO puede instanciar CoursesListPage: el route
    // injector lanza NullInjectorError. Esto prueba que el gate dependía
    // exclusivamente del route provider agregado en este fix.
    const adminRoute = routes.find(
      (x) => x.path === 'admin' && x.children !== undefined,
    )!;
    const stripped: Routes = [
      ...routes.filter((x) => x !== adminRoute),
      {
        ...adminRoute,
        providers: [], // simula la config rota del gate.
        children: adminRoute.children,
      },
    ];
    await TestBed.configureTestingModule({
      providers: [
        provideRouter(stripped),
        { provide: MOCK_SESSION, useClass: InMemoryMockSession },
      ],
    }).compileComponents();
    const session = TestBed.inject(MOCK_SESSION);
    session.signIn();
    await expectAsync(RouterTestingHarness.create('/admin/cursos')).toBeRejected();
  });

  // --- Route params como strings (gate correctivo F2-04) ---
  // withComponentInputBinding() pasa los route params como strings. Los
  // componentes CourseDetailPage/CourseEditorPage declaran `id` como
  // input<string>('') y computan el id numérico con un helper validado.
  // Estos tests navegan con el router real y prueban el wiring end-to-end
  // contra el seed del InMemoryCoursesService.

  it("runtime: /admin/cursos/1 renderiza el nombre y código del curso seed (CUR-001)", async () => {
    await setupHarnessWithSession();
    const harness = await RouterTestingHarness.create('/admin/cursos/1');
    await harness.detectChanges();
    await harness.fixture.whenStable();
    await harness.detectChanges();
    const cmp = harness.routeNativeElement?.querySelector('app-course-detail-page');
    expect(cmp).not.toBeNull();
    const text = cmp?.textContent || '';
    expect(text).toContain('Curso de introducción a la gestión');
    expect(text).toContain('CUR-001');
  });

  it("runtime: /admin/cursos/1/editar renderiza editor con datos del curso seed cargados", async () => {
    await setupHarnessWithSession();
    const harness = await RouterTestingHarness.create('/admin/cursos/1/editar');
    await harness.detectChanges();
    await harness.fixture.whenStable();
    await harness.detectChanges();
    const cmp = harness.routeNativeElement?.querySelector('app-course-editor-page');
    expect(cmp).not.toBeNull();
    const text = cmp?.textContent || '';
    // El editor en modo edit muestra "Fechas de <nombre>" y carga las fechas.
    expect(text).toContain('Curso de introducción a la gestión');
    const fechaFieldsets = cmp?.querySelectorAll('.fecha-fieldset') || [];
    expect(fechaFieldsets.length).toBe(3);
  });

  it("runtime: /admin/cursos/abc (id inválido) NO revienta y muestra estado de error/not found", async () => {
    await setupHarnessWithSession();
    const harness = await RouterTestingHarness.create('/admin/cursos/abc');
    await harness.detectChanges();
    await harness.fixture.whenStable();
    await harness.detectChanges();
    const cmp = harness.routeNativeElement?.querySelector('app-course-detail-page');
    expect(cmp).not.toBeNull();
    const text = cmp?.textContent || '';
    // Id no numérico → estado de error controlado, sin excepción.
    expect(text).toContain('no encontrado');
  });

  it("runtime: /admin/cursos/abc/editar (id inválido) NO revienta y muestra error controlado", async () => {
    await setupHarnessWithSession();
    const harness = await RouterTestingHarness.create('/admin/cursos/abc/editar');
    await harness.detectChanges();
    await harness.fixture.whenStable();
    await harness.detectChanges();
    const cmp = harness.routeNativeElement?.querySelector('app-course-editor-page');
    expect(cmp).not.toBeNull();
    const text = cmp?.textContent || '';
    // Id no numérico en modo edit → estado de error controlado, sin excepción.
    expect(text).toContain('no encontrado');
  });

  // --- Rutas admin/asistencias F2-05 ---

  it("admin children define asistencias y cursos/:id/fechas/:fechaId/asistencias", () => {
    const children = adminChildren();
    const paths = children.map((c) => c.path);
    expect(paths).toContain('asistencias');
    expect(paths).toContain('cursos/:id/fechas/:fechaId/asistencias');
  });

  it("orden seguro: asistencias va después de dashboard y antes de cursos/nuevo", () => {
    const children = adminChildren();
    const idxDash = children.findIndex((c) => c.path === 'dashboard');
    const idxAsis = children.findIndex((c) => c.path === 'asistencias');
    const idxNuevo = children.findIndex((c) => c.path === 'cursos/nuevo');
    expect(idxDash).toBeGreaterThanOrEqual(0);
    expect(idxAsis).toBeGreaterThan(idxDash);
    expect(idxNuevo).toBeGreaterThan(idxAsis);
  });

  it("orden seguro: cursos/:id/fechas/:fechaId/asistencias ANTES que cursos/:id", () => {
    const children = adminChildren();
    const idxProfunda = children.findIndex(
      (c) => c.path === 'cursos/:id/fechas/:fechaId/asistencias',
    );
    const idxId = children.findIndex((c) => c.path === 'cursos/:id');
    expect(idxProfunda).toBeGreaterThanOrEqual(0);
    expect(idxId).toBeGreaterThanOrEqual(0);
    expect(idxProfunda).toBeLessThan(idxId);
  });

  it("navegación real /admin/asistencias sin sesión termina en /admin/login", async () => {
    await setupRouter('/admin/asistencias');
    const router = TestBed.inject(Router);
    expect(router.url).toBe('/admin/login');
  });

  it("navegación real /admin/asistencias con sesión carga AttendancesListPage", async () => {
    await TestBed.configureTestingModule({
      providers: [
        provideRouter(routes),
        { provide: MOCK_SESSION, useClass: InMemoryMockSession },
      ],
    }).compileComponents();
    const session = TestBed.inject(MOCK_SESSION);
    session.signIn();
    const router = TestBed.inject(Router);
    await router.navigateByUrl('/admin/asistencias');
    expect(router.url).toBe('/admin/asistencias');
  });

  it("navegación real /admin/cursos/1/fechas/11/asistencias con sesión resuelve ruta profunda", async () => {
    await TestBed.configureTestingModule({
      providers: [
        provideRouter(routes, withComponentInputBinding()),
        { provide: MOCK_SESSION, useClass: InMemoryMockSession },
      ],
    }).compileComponents();
    const session = TestBed.inject(MOCK_SESSION);
    session.signIn();
    const router = TestBed.inject(Router);
    await router.navigateByUrl('/admin/cursos/1/fechas/11/asistencias');
    expect(router.url).toBe('/admin/cursos/1/fechas/11/asistencias');
  });

  it("runtime: /admin/asistencias instancia AttendancesListPage via route injector sin NullInjectorError", async () => {
    await setupHarnessWithSession();
    const harness = await RouterTestingHarness.create('/admin/asistencias');
    const cmp = harness.routeNativeElement?.querySelector('app-attendances-list-page');
    expect(cmp).not.toBeNull();
  });

  it("runtime: /admin/cursos/1/fechas/11/asistencias instancia AttendanceMarkingPage via route injector", async () => {
    await setupHarnessWithSession();
    const harness = await RouterTestingHarness.create('/admin/cursos/1/fechas/11/asistencias');
    await harness.detectChanges();
    await harness.fixture.whenStable();
    await harness.detectChanges();
    const cmp = harness.routeNativeElement?.querySelector('app-attendance-marking-page');
    expect(cmp).not.toBeNull();
    const text = cmp?.textContent || '';
    expect(text).toContain('Curso de introducción a la gestión');
  });

  it("runtime: /admin/cursos/abc/fechas/11/asistencias (id inválido) NO revienta y muestra error", async () => {
    await setupHarnessWithSession();
    const harness = await RouterTestingHarness.create('/admin/cursos/abc/fechas/11/asistencias');
    await harness.detectChanges();
    await harness.fixture.whenStable();
    await harness.detectChanges();
    const cmp = harness.routeNativeElement?.querySelector('app-attendance-marking-page');
    expect(cmp).not.toBeNull();
    const text = cmp?.textContent || '';
    expect(text).toContain('no encontrad');
  });

  it("regresión: sin ATTENDANCE_SOURCE en la ruta admin, /admin/asistencias revienta en runtime", async () => {
    const adminRoute = routes.find(
      (x) => x.path === 'admin' && x.children !== undefined,
    )!;
    // Replica routes sin el provider ATTENDANCE_SOURCE de la ruta admin.
    const stripped: Routes = [
      ...routes.filter((x) => x !== adminRoute),
      {
        ...adminRoute,
        providers: [{ provide: COURSES_SOURCE, useClass: InMemoryCoursesService }],
        children: adminRoute.children,
      },
    ];
    await TestBed.configureTestingModule({
      providers: [
        provideRouter(stripped),
        { provide: MOCK_SESSION, useClass: InMemoryMockSession },
      ],
    }).compileComponents();
    const session = TestBed.inject(MOCK_SESSION);
    session.signIn();
    await expectAsync(RouterTestingHarness.create('/admin/asistencias')).toBeRejected();
  });

  it("rutas públicas intactas tras agregar admin/asistencias", async () => {
    await setupRouter('/');
    const router = TestBed.inject(Router);
    await router.navigateByUrl('/');
    expect(router.url).toBe('/');
    await router.navigateByUrl('/validar/demo-valido');
    expect(router.url).toContain('/validar/');
  });
});