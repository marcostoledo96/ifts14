import { TestBed } from '@angular/core/testing';
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
  InstitutionalConfigWrite,
} from './institutional-config.service';
import { HttpInstitutionalConfigService } from './http-institutional-config.service';
import { InMemoryInstitutionalConfigService } from './in-memory-institutional-config.service';

const API_URL = `${environment.apiBaseUrl}/admin/configuracion-institucional`;

const DTO = {
  institutionName: 'IFTS N.° 14',
  certificateText: 'texto certificado',
  rectorName: 'Rector Demo',
  rectorRole: 'Director',
  advisorName: 'Asesor Demo',
  advisorRole: 'Secretario Académico',
  updatedAt: '2026-01-01T00:00:00Z',
};

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

  it('obtener hace GET y mapea el DTO 1:1 (sin nombre/direccion/logoUrl)', async () => {
    const p = service.obtener();
    const req = httpMock.expectOne(API_URL);
    expect(req.request.method).toBe('GET');
    req.flush({ data: DTO, meta: { requestId: 'r1' } });
    const result = await p;
    expect(result.institutionName).toBe('IFTS N.° 14');
    expect(result.certificateText).toBe('texto certificado');
    expect(result.rectorName).toBe('Rector Demo');
    expect(result.rectorRole).toBe('Director');
    expect(result.advisorName).toBe('Asesor Demo');
    expect(result.advisorRole).toBe('Secretario Académico');
    expect(result.updatedAt).toBe('2026-01-01T00:00:00Z');
  });

  it('obtener normaliza campos null del backend a string vacío (updatedAt queda null)', async () => {
    const p = service.obtener();
    const req = httpMock.expectOne(API_URL);
    req.flush({
      data: {
        institutionName: 'Otra',
        certificateText: null,
        rectorName: null,
        rectorRole: null,
        advisorName: null,
        advisorRole: null,
        updatedAt: null,
      },
      meta: { requestId: 'r2' },
    });
    const result = await p;
    expect(result.institutionName).toBe('Otra');
    expect(result.certificateText).toBe('');
    expect(result.rectorName).toBe('');
    expect(result.rectorRole).toBe('');
    expect(result.advisorName).toBe('');
    expect(result.advisorRole).toBe('');
    expect(result.updatedAt).toBeNull();
  });

  it('guardar hace PUT con el payload del contrato y devuelve data de la respuesta', async () => {
    const payload: InstitutionalConfigWrite = {
      institutionName: 'IFTS N.° 14 editado',
      certificateText: 'nuevo texto',
      rectorName: 'Nuevo Rector',
      rectorRole: 'Directora',
      advisorName: 'Nueva Asesora',
      advisorRole: 'Secretaria',
    };
    const p = service.guardar(payload);
    const req = httpMock.expectOne(API_URL);
    expect(req.request.method).toBe('PUT');
    expect(req.request.body).toEqual(payload);
    req.flush({
      data: { ...payload, updatedAt: '2026-02-02T10:00:00Z' },
      meta: { requestId: 'r3' },
    });
    const result = await p;
    expect(result.institutionName).toBe('IFTS N.° 14 editado');
    expect(result.updatedAt).toBe('2026-02-02T10:00:00Z');
  });

  it('GET 4xx rechaza con HttpErrorResponse', async () => {
    const p = service.obtener();
    const req = httpMock.expectOne(API_URL);
    req.flush(
      { error: { code: 'UNAUTHORIZED', message: 'No autorizado', details: [] }, meta: { requestId: 'r401' } },
      { status: 401, statusText: 'Unauthorized' },
    );
    await expectAsync(p).toBeRejected();
    try { await p; } catch (e) { expect(e).toBeInstanceOf(HttpErrorResponse); }
  });

  it('GET 5xx rechaza con HttpErrorResponse', async () => {
    const p = service.obtener();
    const req = httpMock.expectOne(API_URL);
    req.flush('Server crash', { status: 500, statusText: 'Internal Server Error' });
    await expectAsync(p).toBeRejected();
    try { await p; } catch (e) { expect(e).toBeInstanceOf(HttpErrorResponse); }
  });

  it('PUT 4xx rechaza con HttpErrorResponse', async () => {
    const p = service.guardar({
      institutionName: 'X',
      certificateText: '',
      rectorName: '',
      rectorRole: '',
      advisorName: '',
      advisorRole: '',
    });
    const req = httpMock.expectOne(API_URL);
    req.flush(
      { error: { code: 'VALIDATION_ERROR', message: 'Inválido', details: [] }, meta: { requestId: 'r422' } },
      { status: 422, statusText: 'Unprocessable Entity' },
    );
    await expectAsync(p).toBeRejected();
    try { await p; } catch (e) { expect(e).toBeInstanceOf(HttpErrorResponse); }
  });

  it('PUT 5xx rechaza con HttpErrorResponse', async () => {
    const p = service.guardar({
      institutionName: 'X',
      certificateText: '',
      rectorName: '',
      rectorRole: '',
      advisorName: '',
      advisorRole: '',
    });
    const req = httpMock.expectOne(API_URL);
    req.flush('Server crash', { status: 500, statusText: 'Internal Server Error' });
    await expectAsync(p).toBeRejected();
    try { await p; } catch (e) { expect(e).toBeInstanceOf(HttpErrorResponse); }
  });

  it('resuelve vía INSTITUTIONAL_CONFIG_SOURCE token', () => {
    expect(service).toBeInstanceOf(HttpInstitutionalConfigService);
  });
});

describe('InMemoryInstitutionalConfigService', () => {
  let service: InMemoryInstitutionalConfigService;

  beforeEach(() => {
    service = new InMemoryInstitutionalConfigService();
  });

  it('obtener devuelve el seed con defaults institucionales', async () => {
    const config = await service.obtener();
    expect(config.institutionName).toBe('Instituto de Formación Técnica Superior N.° 14');
    expect(config.rectorRole).toBeTruthy();
    expect(config.advisorRole).toBeTruthy();
  });

  it('guardar muta el seed y setea updatedAt', async () => {
    const before = await service.obtener();
    const saved = await service.guardar({
      institutionName: 'Instituto editado',
      certificateText: 'texto editado',
      rectorName: 'Rector editado',
      rectorRole: 'Cargo editado',
      advisorName: 'Asesor editado',
      advisorRole: 'Cargo asesor editado',
    });
    expect(saved.institutionName).toBe('Instituto editado');
    expect(saved.updatedAt).not.toBe(before.updatedAt);
    const after = await service.obtener();
    expect(after.institutionName).toBe('Instituto editado');
    expect(after.certificateText).toBe('texto editado');
  });
});
