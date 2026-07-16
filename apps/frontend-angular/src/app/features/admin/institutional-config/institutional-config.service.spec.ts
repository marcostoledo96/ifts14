import { TestBed, inject } from '@angular/core/testing';
import {
  HttpTestingController,
  provideHttpClientTesting,
} from '@angular/common/http/testing';
import { provideHttpClient } from '@angular/common/http';
import { HttpErrorResponse } from '@angular/common/http';
import { environment } from '../../../../environments/environment';
import {
  INSTITUTIONAL_CONFIG_SOURCE,
  InstitutionalConfigService,
} from './institutional-config.service';
import { HttpInstitutionalConfigService } from './http-institutional-config.service';

describe('HttpInstitutionalConfigService', () => {
  let service: InstitutionalConfigService;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
        { provide: INSTITUTIONAL_CONFIG_SOURCE, useClass: HttpInstitutionalConfigService },
      ],
    });
    service = TestBed.inject(INSTITUTIONAL_CONFIG_SOURCE);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => httpMock.verify());

  it('obtener hace GET a /admin/configuracion-institucional y mapea institutionName→nombre', async () => {
    const p = service.obtener();
    const req = httpMock.expectOne(`${environment.apiBaseUrl}/admin/configuracion-institucional`);
    expect(req.request.method).toBe('GET');
    req.flush({
      data: {
        institutionName: 'IFTS N.° 14',
        certificateText: 'texto',
        rectorName: 'Rector',
        rectorRole: 'Director',
        advisorName: 'Asesor',
        advisorRole: 'Secretario',
        updatedAt: '2026-01-01T00:00:00Z',
      },
      meta: { requestId: 'r1' },
    });
    const result = await p;
    expect(result.nombre).toBe('IFTS N.° 14');
    expect(result.direccion).toBeNull();
    expect(result.logoUrl).toBeNull();
  });

  it('dirección y logoUrl default null cuando backend no los envía', async () => {
    const p = service.obtener();
    const req = httpMock.expectOne(`${environment.apiBaseUrl}/admin/configuracion-institucional`);
    req.flush({
      data: { institutionName: 'Otra', certificateText: null, rectorName: null, rectorRole: null, advisorName: null, advisorRole: null, updatedAt: null },
      meta: { requestId: 'r2' },
    });
    const result = await p;
    expect(result.direccion).toBeNull();
    expect(result.logoUrl).toBeNull();
  });

  it('4xx rechaza con error descriptivo', async () => {
    const p = service.obtener();
    const req = httpMock.expectOne(`${environment.apiBaseUrl}/admin/configuracion-institucional`);
    req.flush(
      { error: { code: 'UNAUTHORIZED', message: 'No autorizado', details: [] }, meta: { requestId: 'r401' } },
      { status: 401, statusText: 'Unauthorized' },
    );
    await expectAsync(p).toBeRejected();
    try { await p; } catch (e) { expect(e).toBeInstanceOf(HttpErrorResponse); }
  });

  it('5xx rechaza con error descriptivo', async () => {
    const p = service.obtener();
    const req = httpMock.expectOne(`${environment.apiBaseUrl}/admin/configuracion-institucional`);
    req.flush('Server crash', { status: 500, statusText: 'Internal Server Error' });
    await expectAsync(p).toBeRejected();
    try { await p; } catch (e) { expect(e).toBeInstanceOf(HttpErrorResponse); }
  });

  it('resuelve vía INSTITUTIONAL_CONFIG_SOURCE token', async () => {
    expect(service).toBeInstanceOf(HttpInstitutionalConfigService);
  });
});