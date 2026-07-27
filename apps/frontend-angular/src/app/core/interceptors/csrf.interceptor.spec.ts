import { TestBed } from '@angular/core/testing';
import {
  HttpClient,
  provideHttpClient,
  withInterceptors,
} from '@angular/common/http';
import {
  HttpTestingController,
  provideHttpClientTesting,
} from '@angular/common/http/testing';
import { provideRouter, Router } from '@angular/router';
import { firstValueFrom } from 'rxjs';
import {
  ADMIN_AUTH,
  FakeAdminAuthService,
} from '../../features/admin/admin-auth.service';
import {
  csrfInterceptor,
  resetCsrfInterceptorRedirectLatchForTests,
} from './csrf.interceptor';

describe('csrfInterceptor', () => {
  let http: HttpClient;
  let httpMock: HttpTestingController;
  let auth: FakeAdminAuthService;
  let router: Router;

  beforeEach(() => {
    resetCsrfInterceptorRedirectLatchForTests();
    TestBed.configureTestingModule({
      providers: [
        provideRouter([{ path: 'admin/login', children: [] }]),
        provideHttpClient(withInterceptors([csrfInterceptor])),
        provideHttpClientTesting(),
        { provide: ADMIN_AUTH, useClass: FakeAdminAuthService },
      ],
    });
    http = TestBed.inject(HttpClient);
    httpMock = TestBed.inject(HttpTestingController);
    auth = TestBed.inject(ADMIN_AUTH) as FakeAdminAuthService;
    router = TestBed.inject(Router);
    auth.setAuthenticated(true);
    spyOn(router, 'navigateByUrl').and.resolveTo(true);
  });

  afterEach(() => {
    httpMock.verify();
    resetCsrfInterceptorRedirectLatchForTests();
  });

  it('en 401 de API admin limpia sesión, redirige a login y no propaga error', async () => {
    const pending = firstValueFrom(http.get('/certificados_staging/api/admin/cursos'));
    const req = httpMock.expectOne('/certificados_staging/api/admin/cursos');
    req.flush(
      { error: { code: 'UNAUTHORIZED', message: 'No autorizado.' } },
      { status: 401, statusText: 'Unauthorized' },
    );

    // NEVER: firstValueFrom no resuelve; damos un tick y verificamos side-effects.
    let settled = false;
    void pending.then(
      () => {
        settled = true;
      },
      () => {
        settled = true;
      },
    );
    await Promise.resolve();
    expect(settled).toBeFalse();
    expect(auth.csrfToken()).toBeNull();
    expect(router.navigateByUrl).toHaveBeenCalledWith('/admin/login');
  });

  it('en 401 de login propaga el error (sin redirect latch de sesión)', async () => {
    const pending = firstValueFrom(
      http.post('/certificados_staging/api/admin/auth/login', {
        username: 'x',
        password: 'yyyyyy',
      }),
    );
    const req = httpMock.expectOne('/certificados_staging/api/admin/auth/login');
    req.flush(
      { error: { code: 'UNAUTHORIZED', message: 'No autorizado.' } },
      { status: 401, statusText: 'Unauthorized' },
    );

    await expectAsync(pending).toBeRejected();
    expect(router.navigateByUrl).not.toHaveBeenCalled();
  });
});
