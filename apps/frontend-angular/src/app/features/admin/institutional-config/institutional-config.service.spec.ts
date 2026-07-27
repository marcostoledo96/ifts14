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
  rectorSignaturePresent: true,
  advisorSignaturePresent: false,
  updatedAt: '2026-01-01T00:00:00Z',
  parameters: {
    titulo_certificado: {
      value: 'Certificado de Aprobación',
      type: 'texto',
      group: 'certificados',
      label: 'Título del certificado',
    },
  },
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
    expect(result.rectorSignaturePresent).toBeTrue();
    expect(result.advisorSignaturePresent).toBeFalse();
    expect(result.parameters.titulo_certificado.value).toBe('Certificado de Aprobación');
    expect(result.parameters.email_contacto.value).toContain('@');
  });

  it('obtener normaliza flags de firma ausentes a false', async () => {
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
      meta: { requestId: 'r-flags' },
    });
    const result = await p;
    expect(result.rectorSignaturePresent).toBeFalse();
    expect(result.advisorSignaturePresent).toBeFalse();
  });

  it('subirFirma hace POST multipart a /firmas/{rol}', async () => {
    const file = new File([new Uint8Array([1, 2, 3])], 'firma.png', { type: 'image/png' });
    const p = service.subirFirma('rector', file);
    const req = httpMock.expectOne(`${API_URL}/firmas/rector`);
    expect(req.request.method).toBe('POST');
    expect(req.request.body).toBeInstanceOf(FormData);
    req.flush({
      data: { ...DTO, rectorSignaturePresent: true },
      meta: { requestId: 'up1' },
    });
    const result = await p;
    expect(result.rectorSignaturePresent).toBeTrue();
  });

  it('quitarFirma hace DELETE a /firmas/{rol}', async () => {
    const p = service.quitarFirma('asesor');
    const req = httpMock.expectOne(`${API_URL}/firmas/asesor`);
    expect(req.request.method).toBe('DELETE');
    req.flush({
      data: { ...DTO, advisorSignaturePresent: false },
      meta: { requestId: 'del1' },
    });
    const result = await p;
    expect(result.advisorSignaturePresent).toBeFalse();
  });

  it('previewFirma hace GET blob a /firmas/{rol}', async () => {
    const p = service.previewFirma('rector');
    const req = httpMock.expectOne(`${API_URL}/firmas/rector`);
    expect(req.request.method).toBe('GET');
    expect(req.request.responseType).toBe('blob');
    req.flush(new Blob([new Uint8Array([9, 8, 7])], { type: 'image/png' }));
    const blob = await p;
    expect(blob.size).toBe(3);
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
    expect(result.parameters.titulo_certificado.value).toBe('Certificado de Aprobación');
  });

  it('guardar hace PUT con el payload del contrato y devuelve data de la respuesta', async () => {
    const payload: InstitutionalConfigWrite = {
      institutionName: 'IFTS N.° 14 editado',
      certificateText: 'nuevo texto',
      rectorName: 'Nuevo Rector',
      rectorRole: 'Directora',
      advisorName: 'Nueva Asesora',
      advisorRole: 'Secretaria',
      parameters: { titulo_certificado: 'Título editado' },
    };
    const p = service.guardar(payload);
    const req = httpMock.expectOne(API_URL);
    expect(req.request.method).toBe('PUT');
    expect(req.request.body).toEqual(payload);
    req.flush({
      data: {
        ...payload,
        parameters: {
          titulo_certificado: {
            value: 'Título editado',
            type: 'texto',
            group: 'certificados',
            label: 'Título del certificado',
          },
        },
        updatedAt: '2026-02-02T10:00:00Z',
      },
      meta: { requestId: 'r3' },
    });
    const result = await p;
    expect(result.institutionName).toBe('IFTS N.° 14 editado');
    expect(result.parameters.titulo_certificado.value).toBe('Título editado');
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
      parameters: {},
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
      parameters: {},
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
    expect(config.rectorName).toBe('');
    expect(config.advisorName).toBe('');
    expect(config.rectorRole).toBeTruthy();
    expect(config.advisorRole).toBeTruthy();
    expect(config.rectorSignaturePresent).toBeTrue();
    expect(config.advisorSignaturePresent).toBeTrue();
    expect(config.parameters.titulo_certificado.value).toBe('Certificado de Aprobación');
  });

  it('subirFirma y quitarFirma actualizan flags en memoria', async () => {
    const up = await service.subirFirma(
      'rector',
      new File([new Uint8Array([1])], 'r.png', { type: 'image/png' }),
    );
    expect(up.rectorSignaturePresent).toBeTrue();
    const down = await service.quitarFirma('rector');
    expect(down.rectorSignaturePresent).toBeFalse();
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
      parameters: { titulo_certificado: 'Título mock' },
    });
    expect(saved.institutionName).toBe('Instituto editado');
    expect(saved.parameters.titulo_certificado.value).toBe('Título mock');
    expect(saved.updatedAt).not.toBe(before.updatedAt);
    const after = await service.obtener();
    expect(after.institutionName).toBe('Instituto editado');
    expect(after.certificateText).toBe('texto editado');
    expect(after.parameters.titulo_certificado.value).toBe('Título mock');
  });
});
