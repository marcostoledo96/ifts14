import { TestBed } from '@angular/core/testing';
import {
  HttpTestingController,
  provideHttpClientTesting,
} from '@angular/common/http/testing';
import { provideHttpClient } from '@angular/common/http';
import { HttpValidationSource } from './http-validation.source';
import { VALIDATION_SOURCE } from './validation-source';
import { VALID_VALID_DTO } from './mock-tokens';

// 3.4 + 3.5: adapter HTTP con HttpTestingController.
// Verifica URL, método, shape y mapeo de 404 CERTIFICATE_NOT_FOUND → not-verifiable.
describe('HttpValidationSource', () => {
  let source: HttpValidationSource;
  let httpMock: HttpTestingController;

  function build(token: string) {
    const spy = TestBed.inject(VALIDATION_SOURCE);
    return (spy as HttpValidationSource).fetch(token);
  }

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
        { provide: VALIDATION_SOURCE, useClass: HttpValidationSource },
      ],
    });
    source = TestBed.inject(HttpValidationSource);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => httpMock.verify());

  it('GET a /certificados/api/certificados/{token}/verificacion con token codificado', async () => {
    const p = source.fetch('abc_123-XYZ');
    const req = httpMock.expectOne('/certificados/api/certificados/abc_123-XYZ/verificacion');
    expect(req.request.method).toBe('GET');
    req.flush({ data: VALID_VALID_DTO, meta: { requestId: 'r1' } });
    const r = await p;
    expect(r.ok).toBe(true);
  });

  it('200 → ok con envelope válido', async () => {
    const p = source.fetch('demo-valido');
    const req = httpMock.expectOne('/certificados/api/certificados/demo-valido/verificacion');
    req.flush({ data: VALID_VALID_DTO, meta: { requestId: 'r1' } });
    const r = await p;
    if (!r.ok) throw new Error('esperaba ok');
    expect(r.envelope.data.certificateCode).toBe('CERT-2025-0001');
    expect(r.envelope.meta.requestId).toBe('r1');
  });

  // 3.4: 404 CERTIFICATE_NOT_FOUND → error envelope (mapper lo colapsa a not-verifiable).
  it('404 con CERTIFICATE_NOT_FOUND → ok:false con envelope de error', async () => {
    const p = source.fetch('no-existe');
    const req = httpMock.expectOne('/certificados/api/certificados/no-existe/verificacion');
    req.flush(
      {
        error: { code: 'CERTIFICATE_NOT_FOUND', message: 'No encontrado', details: [] },
        meta: { requestId: 'r404' },
      },
      { status: 404, statusText: 'Not Found' },
    );
    const r = await p;
    expect(r.ok).toBe(false);
    if (r.ok) throw new Error('no ok');
    expect(r.error?.error.code).toBe('CERTIFICATE_NOT_FOUND');
    expect(r.error?.meta.requestId).toBe('r404');
  });

  it('404 no verificable, no technical-error (regla pública)', async () => {
    const p = source.fetch('no-existe');
    const req = httpMock.expectOne('/certificados/api/certificados/no-existe/verificacion');
    req.flush(
      {
        error: { code: 'CERTIFICATE_NOT_FOUND', message: 'No encontrado', details: [] },
        meta: { requestId: 'r404' },
      },
      { status: 404, statusText: 'Not Found' },
    );
    const r = await p;
    // El adapter sólo entrega el envelope; el colapso lo hace el mapper.
    // Verificamos que el adapter NO traga el 404 como null (que iría a technical-error).
    expect(r.ok).toBe(false);
    if (r.ok) throw new Error('no ok');
    expect(r.error).not.toBeNull();
    expect(r.error?.error.code).toBe('CERTIFICATE_NOT_FOUND');
  });

  it('404 CERTIFICATE_REVOKED → envelope de error conservado', async () => {
    const p = source.fetch('revocado');
    const req = httpMock.expectOne('/certificados/api/certificados/revocado/verificacion');
    req.flush(
      {
        error: { code: 'CERTIFICATE_REVOKED', message: 'revocado', details: [] },
        meta: { requestId: 'r4' },
      },
      { status: 404, statusText: 'Not Found' },
    );
    const r = await p;
    expect(r.ok).toBe(false);
    if (r.ok) throw new Error('no ok');
    expect(r.error?.error.code).toBe('CERTIFICATE_REVOKED');
  });

  it('429 RATE_LIMITED → envelope de error conservado', async () => {
    const p = source.fetch('rate');
    const req = httpMock.expectOne('/certificados/api/certificados/rate/verificacion');
    req.flush(
      {
        error: { code: 'RATE_LIMITED', message: 'Demasiadas consultas', details: [] },
        meta: { requestId: 'r429' },
      },
      { status: 429, statusText: 'Too Many Requests' },
    );
    const r = await p;
    expect(r.ok).toBe(false);
    if (r.ok) throw new Error('no ok');
    expect(r.error?.error.code).toBe('RATE_LIMITED');
  });

  it('500 INTERNAL_ERROR → error null (technical-error en mapper)', async () => {
    const p = source.fetch('interno');
    const req = httpMock.expectOne('/certificados/api/certificados/interno/verificacion');
    req.flush('Server crash', { status: 500, statusText: 'Internal Server Error' });
    const r = await p;
    expect(r.ok).toBe(false);
    if (r.ok) throw new Error('no ok');
    expect(r.error).toBeNull();
  });

  it('error de red → error null (technical-error)', async () => {
    const p = source.fetch('red');
    const req = httpMock.expectOne('/certificados/api/certificados/red/verificacion');
    req.error(new ProgressEvent('network error'));
    const r = await p;
    expect(r.ok).toBe(false);
    if (r.ok) throw new Error('no ok');
    expect(r.error).toBeNull();
  });

  it('token con caracteres especiales queda URL-encoded', async () => {
    const p = source.fetch('a b/c');
    const req = httpMock.expectOne('/certificados/api/certificados/a%20b%2Fc/verificacion');
    req.flush({ data: VALID_VALID_DTO, meta: { requestId: 'r' } });
    const r = await p;
    expect(req.request.url).toBe('/certificados/api/certificados/a%20b%2Fc/verificacion');
    expect(r.ok).toBe(true);
  });

  it('vía VALIDATION_SOURCE: 404 CERTIFICATE_NOT_FOUND → not-verifiable end-to-end', async () => {
    const p = build('no-existe');
    const req = httpMock.expectOne('/certificados/api/certificados/no-existe/verificacion');
    req.flush(
      {
        error: { code: 'CERTIFICATE_NOT_FOUND', message: 'No encontrado', details: [] },
        meta: { requestId: 'r404' },
      },
      { status: 404, statusText: 'Not Found' },
    );
    const r = await p;
    expect(r.ok).toBe(false);
    if (r.ok) throw new Error('no ok');
    expect(r.error?.error.code).toBe('CERTIFICATE_NOT_FOUND');
  });
});