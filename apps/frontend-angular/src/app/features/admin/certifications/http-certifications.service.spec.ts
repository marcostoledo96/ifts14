import { TestBed } from '@angular/core/testing';
import {
  HttpTestingController,
  provideHttpClientTesting,
} from '@angular/common/http/testing';
import { provideHttpClient } from '@angular/common/http';
import { HttpErrorResponse } from '@angular/common/http';
import { environment } from '../../../../environments/environment';
import { CERTIFICATIONS_SOURCE } from './certifications.service';
import { HttpCertificationsService } from './http-certifications.service';

describe('HttpCertificationsService', () => {
  let service: HttpCertificationsService;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
        { provide: CERTIFICATIONS_SOURCE, useClass: HttpCertificationsService },
      ],
    });
    service = TestBed.inject(HttpCertificationsService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => httpMock.verify());

  const listDto = (overrides: Partial<Record<string, unknown>> = {}) => ({
    id: 1,
    certificateCode: 'CERT-2026-0001',
    status: 'vigente',
    student: { displayName: 'Juan Pérez', documentMasked: '12345678' },
    course: { id: 10, name: 'Curso Demo' },
    alumnoId: 1,
    cursoId: 10,
    issuedAt: '2026-01-01',
    expiresAt: null,
    revokedAt: null,
    tokenPrefix: 'prefijo_demo',
    ...overrides,
  });

  it('listar hace GET a /admin/certificados y mapea certificateCode→numero, student.displayName→nombreAlumno, status→estado', async () => {
    const p = service.listar();
    const req = httpMock.expectOne(`${environment.apiBaseUrl}/admin/certificados`);
    expect(req.request.method).toBe('GET');
    req.flush({ data: { items: [listDto()] }, meta: { requestId: 'r1' } });
    const result = await p;
    expect(result.length).toBe(1);
    expect(result[0].numero).toBe('CERT-2026-0001');
    expect(result[0].nombreAlumno).toBe('Juan Pérez');
    expect(result[0].cursoNombre).toBe('Curso Demo');
    expect(result[0].estado).toBe('vigente');
    expect(result[0].documentMasked).toBe('12345678');
    expect(result[0].tokenPrefix).toBe('prefijo_demo');
    expect(result[0].emitidoEn).toBe('2026-01-01');
    expect(result[0].venceEn).toBeNull();
  });

  it('listar envía query estado/cursoId/alumnoId cuando vienen', async () => {
    const p = service.listar({ estado: 'vigente', cursoId: 10, alumnoId: 3 });
    const req = httpMock.expectOne(
      `${environment.apiBaseUrl}/admin/certificados?estado=vigente&cursoId=10&alumnoId=3`,
    );
    expect(req.request.method).toBe('GET');
    req.flush({ data: { items: [listDto({ id: 2, status: 'vigente' })] }, meta: { requestId: 'r4' } });
    const result = await p;
    expect(result.length).toBe(1);
    expect(result[0].estado).toBe('vigente');
  });

  it('emitir hace POST a /admin/certificados con body exacto y mapea data', async () => {
    const payload = { alumnoId: 3, cursoId: 10, issuedAt: '2026-07-16', expiresAt: null };
    const p = service.emitir(payload);
    const req = httpMock.expectOne(`${environment.apiBaseUrl}/admin/certificados`);
    expect(req.request.method).toBe('POST');
    expect(req.request.body).toEqual(payload);
    req.flush({
      data: {
        id: 99,
        certificateCode: 'CERT-2026-0099',
        status: 'vigente',
        student: { displayName: 'Demo', documentMasked: '12345678' },
        course: { name: 'Curso Demo' },
        issuedAt: '2026-07-16',
        expiresAt: null,
        tokenPrefix: 'prefijo_demo_x9z',
        publicValidationUrl: 'https://example/validar/x',
        pdfDownloadUrl: '/admin/certificados/99/pdf',
      },
      meta: { requestId: 'r-emit' },
    });
    const result = await p;
    expect(result.id).toBe(99);
    expect(result.certificateCode).toBe('CERT-2026-0099');
  });

  it('emitir 409 rechaza con error', async () => {
    const p = service.emitir({ alumnoId: 1, cursoId: 2, issuedAt: '2026-07-16', expiresAt: null });
    const req = httpMock.expectOne(`${environment.apiBaseUrl}/admin/certificados`);
    req.flush(
      { error: { code: 'CERTIFICATE_ALREADY_EXISTS', message: 'Ya existe', details: [] }, meta: { requestId: 'r409' } },
      { status: 409, statusText: 'Conflict' },
    );
    await expectAsync(p).toBeRejected();
  });

  it('emitir 400 rechaza con error', async () => {
    const p = service.emitir({ alumnoId: 1, cursoId: 2, issuedAt: '2099-01-01', expiresAt: null });
    const req = httpMock.expectOne(`${environment.apiBaseUrl}/admin/certificados`);
    req.flush(
      { error: { code: 'VALIDATION_ERROR', message: 'Fecha inválida', details: [] }, meta: { requestId: 'r400' } },
      { status: 400, statusText: 'Bad Request' },
    );
    await expectAsync(p).toBeRejected();
  });

  it('emitir 500 rechaza con error', async () => {
    const p = service.emitir({ alumnoId: 1, cursoId: 2, issuedAt: '2026-07-16', expiresAt: null });
    const req = httpMock.expectOne(`${environment.apiBaseUrl}/admin/certificados`);
    req.flush('crash', { status: 500, statusText: 'Internal Server Error' });
    await expectAsync(p).toBeRejected();
  });

  it('obtener hace GET a /admin/certificados/:id y devuelve detalle con auditoría', async () => {
    const p = service.obtener(7);
    const req = httpMock.expectOne(`${environment.apiBaseUrl}/admin/certificados/7`);
    expect(req.request.method).toBe('GET');
    req.flush({
      data: {
        ...listDto({ id: 7 }),
        revocationReason: null,
        attendedDates: [{ fecha: '2026-03-10', descripcion: 'Clase 1', orden: 1 }],
        auditEvents: [{ eventType: 'emision', result: 'ok', createdAt: '2026-01-01T00:00:00Z' }],
        links: { pdf: '/admin/certificados/7/pdf', manualDelivery: '/admin/certificados/7/entrega-manual', qrPng: '/admin/certificados/7/qr.png' },
      },
      meta: { requestId: 'r5' },
    });
    const result = await p;
    expect(result.id).toBe(7);
    expect(result.attendedDates).toEqual(['2026-03-10']);
    expect(result.auditEvents.length).toBe(1);
    expect(result.auditEvents[0].accion).toBe('emision');
    expect(result.publicValidationUrl).toBe('/admin/certificados/7/pdf');
  });

  it('obtenerEntregaManual hace GET a /admin/certificados/:id/entrega-manual y mapea el DTO', async () => {
    const p = service.obtenerEntregaManual(7);
    const req = httpMock.expectOne(`${environment.apiBaseUrl}/admin/certificados/7/entrega-manual`);
    expect(req.request.method).toBe('GET');
    req.flush({
      data: {
        certificadoId: 7,
        publicValidationUrl: 'https://ifts14.edu.ar/certificados/validar/token-demo-123',
        pdfDownloadUrl: '/admin/certificados/7/pdf',
        tokenPrefix: 'prefijo_demo',
        pdfAvailable: true,
        pdfStatus: 'valid',
      },
      meta: { requestId: 'r-entrega' },
    });
    const result = await p;
    expect(result.certificadoId).toBe(7);
    expect(result.publicValidationUrl).toContain('ifts14.edu.ar');
    expect(result.pdfStatus).toBe('valid');
    expect(result.pdfAvailable).toBeTrue();
  });

  it('obtenerEntregaManual mapea pdfStatus outdated correctamente', async () => {
    const p = service.obtenerEntregaManual(4);
    const req = httpMock.expectOne(`${environment.apiBaseUrl}/admin/certificados/4/entrega-manual`);
    req.flush({
      data: {
        certificadoId: 4,
        publicValidationUrl: 'https://ifts14.edu.ar/certificados/validar/token-4',
        pdfDownloadUrl: '/admin/certificados/4/pdf',
        tokenPrefix: 'prefijo_demo_g4h',
        pdfAvailable: false,
        pdfStatus: 'outdated',
      },
      meta: { requestId: 'r-outdated' },
    });
    const result = await p;
    expect(result.pdfStatus).toBe('outdated');
    expect(result.pdfAvailable).toBeFalse();
  });

  it('obtenerEntregaManual 4xx rechaza con error', async () => {
    const p = service.obtenerEntregaManual(99);
    const req = httpMock.expectOne(`${environment.apiBaseUrl}/admin/certificados/99/entrega-manual`);
    req.flush(
      { error: { code: 'CERTIFICATE_NOT_FOUND', message: 'No encontrado', details: [] }, meta: { requestId: 'r404' } },
      { status: 404, statusText: 'Not Found' },
    );
    await expectAsync(p).toBeRejected();
  });

  it('descargarQrPng hace GET blob a /admin/certificados/:id/qr.png', async () => {
    const p = service.descargarQrPng(7);
    const req = httpMock.expectOne(`${environment.apiBaseUrl}/admin/certificados/7/qr.png`);
    expect(req.request.method).toBe('GET');
    expect(req.request.responseType).toBe('blob');
    req.flush(new Blob(['png'], { type: 'image/png' }));
    const blob = await p;
    expect(blob).toBeInstanceOf(Blob);
  });

  it('descargarPdf hace GET blob a /admin/certificados/:id/pdf', async () => {
    const p = service.descargarPdf(7);
    const req = httpMock.expectOne(`${environment.apiBaseUrl}/admin/certificados/7/pdf`);
    expect(req.request.method).toBe('GET');
    expect(req.request.responseType).toBe('blob');
    req.flush(new Blob(['%PDF'], { type: 'application/pdf' }));
    const blob = await p;
    expect(blob).toBeInstanceOf(Blob);
    expect(blob.type).toBe('application/pdf');
  });

  it('contar devuelve la longitud del listado', async () => {
    const p = service.contar();
    const req = httpMock.expectOne(`${environment.apiBaseUrl}/admin/certificados`);
    req.flush({ data: { items: [listDto({ id: 1 }), listDto({ id: 2 }), listDto({ id: 3 })] }, meta: { requestId: 'r6' } });
    expect(await p).toBe(3);
  });

  it('revocar hace POST a /admin/certificados/:id/revocar con body {reason}', async () => {
    const p = service.revocar(42, 'motivo de prueba');
    const req = httpMock.expectOne(`${environment.apiBaseUrl}/admin/certificados/42/revocar`);
    expect(req.request.method).toBe('POST');
    expect(req.request.body).toEqual({ reason: 'motivo de prueba' });
    req.flush({ data: { id: 42, status: 'revocado' }, meta: { requestId: 'r7' } });
    await expectAsync(p).toBeResolved();
  });

  it('listar 4xx rechaza con error', async () => {
    const p = service.listar();
    const req = httpMock.expectOne(`${environment.apiBaseUrl}/admin/certificados`);
    req.flush(
      { error: { code: 'UNAUTHORIZED', message: 'No auth', details: [] }, meta: { requestId: 'r401' } },
      { status: 401, statusText: 'Unauthorized' },
    );
    await expectAsync(p).toBeRejected();
    try { await p; } catch (e) { expect(e).toBeInstanceOf(HttpErrorResponse); }
  });

  it('listar 5xx rechaza con error', async () => {
    const p = service.listar();
    const req = httpMock.expectOne(`${environment.apiBaseUrl}/admin/certificados`);
    req.flush('crash', { status: 500, statusText: 'Internal Server Error' });
    await expectAsync(p).toBeRejected();
  });

  it('obtener 4xx rechaza con error', async () => {
    const p = service.obtener(99);
    const req = httpMock.expectOne(`${environment.apiBaseUrl}/admin/certificados/99`);
    req.flush(
      { error: { code: 'CERTIFICATE_NOT_FOUND', message: 'No encontrado', details: [] }, meta: { requestId: 'r404' } },
      { status: 404, statusText: 'Not Found' },
    );
    await expectAsync(p).toBeRejected();
  });

  it('revocar 5xx rechaza con error', async () => {
    const p = service.revocar(1, 'x');
    const req = httpMock.expectOne(`${environment.apiBaseUrl}/admin/certificados/1/revocar`);
    req.flush('crash', { status: 500, statusText: 'Internal Server Error' });
    await expectAsync(p).toBeRejected();
  });

  it('resuelve vía CERTIFICATIONS_SOURCE token', () => {
    expect(TestBed.inject(CERTIFICATIONS_SOURCE)).toBeInstanceOf(HttpCertificationsService);
  });
});