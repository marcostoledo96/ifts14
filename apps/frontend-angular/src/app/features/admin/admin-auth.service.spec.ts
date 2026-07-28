import { TestBed } from '@angular/core/testing';
import {
  HttpTestingController,
  provideHttpClientTesting,
} from '@angular/common/http/testing';
import {
  provideHttpClient,
} from '@angular/common/http';
import {
  ADMIN_AUTH,
  HttpAdminAuthService,
  AdminAuthCredentials,
} from './admin-auth.service';
import { environment } from '../../../environments/environment';

function authEnvelope(data: { authenticated: boolean; csrfToken?: string }) {
  return { data, meta: { requestId: 'req_test' } };
}

describe('HttpAdminAuthService', () => {
  let service: HttpAdminAuthService;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
        { provide: ADMIN_AUTH, useClass: HttpAdminAuthService },
      ],
    });
    service = TestBed.inject(HttpAdminAuthService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('inicia sin csrfToken', () => {
    expect(service.csrfToken()).toBeNull();
  });

  it('login exitoso guarda csrfToken desde envelope.data', async () => {
    const creds: AdminAuthCredentials = { username: 'admin', password: 'clave123' };
    const promise = service.login(creds);
    const req = httpMock.expectOne(`${environment.apiBaseUrl}/admin/auth/login`);
    expect(req.request.method).toBe('POST');
    expect(req.request.body).toEqual(creds);
    req.flush(authEnvelope({ authenticated: true, csrfToken: 'csrf-abc' }));
    await promise;
    expect(service.csrfToken()).toBe('csrf-abc');
  });

  it('login 2xx sin sesión usable rechaza con status 502 y no guarda token', async () => {
    const creds: AdminAuthCredentials = { username: 'admin', password: 'clave123' };
    const promise = service.login(creds);
    const req = httpMock.expectOne(`${environment.apiBaseUrl}/admin/auth/login`);
    req.flush(authEnvelope({ authenticated: false }));
    await expectAsync(promise).toBeRejectedWith(jasmine.objectContaining({ status: 502 }));
    expect(service.csrfToken()).toBeNull();
  });

  it('login 2xx authenticated sin csrfToken también rechaza', async () => {
    const creds: AdminAuthCredentials = { username: 'admin', password: 'clave123' };
    const promise = service.login(creds);
    const req = httpMock.expectOne(`${environment.apiBaseUrl}/admin/auth/login`);
    req.flush(authEnvelope({ authenticated: true }));
    await expectAsync(promise).toBeRejectedWith(jasmine.objectContaining({ status: 502 }));
    expect(service.csrfToken()).toBeNull();
  });

  it('login con 401 lanza error y no guarda token', async () => {
    const creds: AdminAuthCredentials = { username: 'bad', password: 'wrong' };
    const promise = service.login(creds);
    const req = httpMock.expectOne(`${environment.apiBaseUrl}/admin/auth/login`);
    req.flush({ error: 'Credenciales inválidas' }, { status: 401, statusText: 'Unauthorized' });
    await expectAsync(promise).toBeRejected();
    expect(service.csrfToken()).toBeNull();
  });

  it('session retorna true cuando authenticated=true y guarda token', async () => {
    const promise = service.session();
    const req = httpMock.expectOne(`${environment.apiBaseUrl}/admin/auth/session`);
    expect(req.request.method).toBe('GET');
    req.flush(authEnvelope({ authenticated: true, csrfToken: 'csrf-session' }));
    const result = await promise;
    expect(result).toBe(true);
    expect(service.csrfToken()).toBe('csrf-session');
  });

  it('session retorna false si authenticated sin csrfToken', async () => {
    const promise = service.session();
    const req = httpMock.expectOne(`${environment.apiBaseUrl}/admin/auth/session`);
    req.flush(authEnvelope({ authenticated: true }));
    const result = await promise;
    expect(result).toBe(false);
    expect(service.csrfToken()).toBeNull();
  });

  it('session sin CSRF usable limpia un token previo en memoria', async () => {
    const loginPromise = service.login({ username: 'admin', password: 'clave123' });
    httpMock
      .expectOne(`${environment.apiBaseUrl}/admin/auth/login`)
      .flush(authEnvelope({ authenticated: true, csrfToken: 'csrf-prev' }));
    await loginPromise;
    expect(service.csrfToken()).toBe('csrf-prev');

    const sessionPromise = service.session();
    httpMock
      .expectOne(`${environment.apiBaseUrl}/admin/auth/session`)
      .flush(authEnvelope({ authenticated: true }));
    expect(await sessionPromise).toBe(false);
    expect(service.csrfToken()).toBeNull();
  });

  it('session retorna false cuando authenticated=false', async () => {
    const promise = service.session();
    const req = httpMock.expectOne(`${environment.apiBaseUrl}/admin/auth/session`);
    req.flush(authEnvelope({ authenticated: false }));
    const result = await promise;
    expect(result).toBe(false);
  });

  it('session retorna false en error de red', async () => {
    const promise = service.session();
    const req = httpMock.expectOne(`${environment.apiBaseUrl}/admin/auth/session`);
    req.error(new ProgressEvent('network error'));
    const result = await promise;
    expect(result).toBe(false);
  });

  it('logout limpia csrfToken', async () => {
    const loginPromise = service.login({ username: 'admin', password: 'clave123' });
    const loginReq = httpMock.expectOne(`${environment.apiBaseUrl}/admin/auth/login`);
    loginReq.flush(authEnvelope({ authenticated: true, csrfToken: 'csrf-xyz' }));
    await loginPromise;
    expect(service.csrfToken()).toBe('csrf-xyz');

    const logoutPromise = service.logout();
    const logoutReq = httpMock.expectOne(`${environment.apiBaseUrl}/admin/auth/logout`);
    expect(logoutReq.request.method).toBe('POST');
    logoutReq.flush(authEnvelope({ authenticated: false }));
    await logoutPromise;
    expect(service.csrfToken()).toBeNull();
  });

  it('clearSession limpia csrfToken sin red', () => {
    service.clearSession();
    expect(service.csrfToken()).toBeNull();
  });

  it('no escribe en storage durante login', async () => {
    const setItemSpy = spyOn(Storage.prototype, 'setItem').and.callThrough();
    const promise = service.login({ username: 'admin', password: 'clave123' });
    const req = httpMock.expectOne(`${environment.apiBaseUrl}/admin/auth/login`);
    req.flush(authEnvelope({ authenticated: true, csrfToken: 'csrf' }));
    await promise;
    expect(setItemSpy).not.toHaveBeenCalled();
  });
});
