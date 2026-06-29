import { TestBed } from '@angular/core/testing';
import { VALIDATION_SOURCE } from './validation-source';
import { ValidationSource, ValidationSourceResult } from './validation-source';
import { ValidationService } from './validation.service';
import { ApiEnvelope, ApiErrorEnvelope, CertificateVerificationDto } from './dto';

function validResult(requestId = 'req-v'): ValidationSourceResult {
  const dto: CertificateVerificationDto = {
    valid: true,
    status: 'vigente',
    certificateCode: 'C-1',
    student: { displayName: 'A', documentMasked: '12.***' },
    course: { name: 'Curso', issuedAt: '2025-01-01' },
    verifiedAt: '2025-06-29T00:00:00Z',
  };
  const env: ApiEnvelope<CertificateVerificationDto> = { data: dto, meta: { requestId } };
  return { ok: true, envelope: env };
}

function errorResult(code: string, requestId = 'req-e'): ValidationSourceResult {
  const err: ApiErrorEnvelope = {
    error: { code, message: 'x', details: [] },
    meta: { requestId },
  };
  return { ok: false, error: err };
}

function nullErrorResult(): ValidationSourceResult {
  return { ok: false, error: null };
}

class StubSource implements ValidationSource {
  constructor(private readonly result: ValidationSourceResult) {}
  async fetch(_token: string, _signal?: AbortSignal): Promise<ValidationSourceResult> {
    return this.result;
  }
}

describe('ValidationService', () => {
  function configure(result: ValidationSourceResult): ValidationService {
    TestBed.configureTestingModule({
      providers: [
        ValidationService,
        { provide: VALIDATION_SOURCE, useValue: new StubSource(result) },
      ],
    });
    return TestBed.inject(ValidationService);
  }

  it('demo-valido → valid', async () => {
    const service = configure(validResult());
    const view = await service.verify('demo-valido');
    expect(view.kind).toBe('valid');
    if (view.kind === 'valid') {
      expect(view.certificate.certificateCode).toBe('C-1');
      expect(view.requestId).toBe('req-v');
    }
  });

  it('CERTIFICATE_NOT_FOUND → not-verifiable', async () => {
    const view = await configure(errorResult('CERTIFICATE_NOT_FOUND')).verify('demo-inexistente');
    expect(view.kind).toBe('not-verifiable');
  });

  it('CERTIFICATE_REVOKED → not-verifiable', async () => {
    const view = await configure(errorResult('CERTIFICATE_REVOKED')).verify('demo-revocado');
    expect(view.kind).toBe('not-verifiable');
  });

  it('CERTIFICATE_EXPIRED → not-verifiable', async () => {
    const view = await configure(errorResult('CERTIFICATE_EXPIRED')).verify('demo-expirado');
    expect(view.kind).toBe('not-verifiable');
  });

  it('INTERNAL_ERROR → technical-error', async () => {
    const view = await configure(errorResult('INTERNAL_ERROR')).verify('demo-error-tecnico');
    expect(view.kind).toBe('technical-error');
  });

  it('error null (red/JSON inválido) → technical-error', async () => {
    const view = await configure(nullErrorResult()).verify('demo-error-tecnico');
    expect(view.kind).toBe('technical-error');
  });

  it('fuente que rechaza (fetch throw) → technical-error, no propaga el reject', async () => {
    class ThrowingSource implements ValidationSource {
      async fetch(_token: string, _signal?: AbortSignal): Promise<ValidationSourceResult> {
        throw new Error('network down');
      }
    }
    TestBed.configureTestingModule({
      providers: [
        ValidationService,
        { provide: VALIDATION_SOURCE, useValue: new ThrowingSource() },
      ],
    });
    const service = TestBed.inject(ValidationService);
    const view = await service.verify('demo-valido');
    expect(view.kind).toBe('technical-error');
  });
});