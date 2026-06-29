import { mapErrorToViewState, mapResponseToViewState } from './result-mapper';
import { ApiEnvelope, ApiErrorEnvelope, CertificateVerificationDto } from './dto';
import { ValidationSourceResult } from './validation-source';

function validEnvelope(dto?: Partial<CertificateVerificationDto>): ApiEnvelope<CertificateVerificationDto> {
  return {
    data: {
      valid: true,
      status: 'vigente',
      certificateCode: 'CERT-2025-0001',
      student: { displayName: 'Juan Pérez', documentMasked: '12.345.**' },
      course: { name: 'Técnico Superior en Sistemas', issuedAt: '2025-03-15' },
      verifiedAt: '2025-06-29T10:00:00Z',
      ...dto,
    },
    meta: { requestId: 'req-1' },
  };
}

function errorEnvelope(code: string, requestId = 'req-err'): ApiErrorEnvelope {
  return { error: { code, message: 'x', details: [] }, meta: { requestId } };
}

describe('result-mapper', () => {
  describe('mapResponseToViewState', () => {
    it('mapea envelope válido a valid con requestId', () => {
      const result: ValidationSourceResult = { ok: true, envelope: validEnvelope() };
      const view = mapResponseToViewState(result);
      expect(view.kind).toBe('valid');
      if (view.kind === 'valid') {
        expect(view.certificate.certificateCode).toBe('CERT-2025-0001');
        expect(view.requestId).toBe('req-1');
      }
    });

    it('mapea valid:false a not-verifiable (defensiva)', () => {
      const result: ValidationSourceResult = {
        ok: true,
        envelope: validEnvelope({ valid: false as unknown as true }),
      };
      const view = mapResponseToViewState(result);
      expect(view.kind).toBe('not-verifiable');
      if (view.kind === 'not-verifiable') {
        expect(view.reason).toBe('valid:false');
      }
    });
  });

  describe('mapErrorToViewState — colapso público', () => {
    it('CERTIFICATE_NOT_FOUND (404) → not-verifiable', () => {
      const view = mapErrorToViewState(errorEnvelope('CERTIFICATE_NOT_FOUND'));
      expect(view.kind).toBe('not-verifiable');
    });

    it('CERTIFICATE_REVOKED → not-verifiable', () => {
      const view = mapErrorToViewState(errorEnvelope('CERTIFICATE_REVOKED'));
      expect(view.kind).toBe('not-verifiable');
    });

    it('CERTIFICATE_EXPIRED → not-verifiable', () => {
      const view = mapErrorToViewState(errorEnvelope('CERTIFICATE_EXPIRED'));
      expect(view.kind).toBe('not-verifiable');
    });

    it('CERTIFICATE_MISSING → not-verifiable', () => {
      const view = mapErrorToViewState(errorEnvelope('CERTIFICATE_MISSING'));
      expect(view.kind).toBe('not-verifiable');
    });

    it('VALIDATION_ERROR (token ausente/mal formado) → not-verifiable', () => {
      const view = mapErrorToViewState(errorEnvelope('VALIDATION_ERROR'));
      expect(view.kind).toBe('not-verifiable');
      if (view.kind === 'not-verifiable') {
        expect(view.reason).toBe('VALIDATION_ERROR');
      }
    });

    it('conserva reason interno para los cuatro colapsados', () => {
      expect((mapErrorToViewState(errorEnvelope('CERTIFICATE_NOT_FOUND')) as any).reason).toBe(
        'CERTIFICATE_NOT_FOUND',
      );
      expect((mapErrorToViewState(errorEnvelope('CERTIFICATE_REVOKED')) as any).reason).toBe(
        'CERTIFICATE_REVOKED',
      );
      expect((mapErrorToViewState(errorEnvelope('CERTIFICATE_EXPIRED')) as any).reason).toBe(
        'CERTIFICATE_EXPIRED',
      );
      expect((mapErrorToViewState(errorEnvelope('CERTIFICATE_MISSING')) as any).reason).toBe(
        'CERTIFICATE_MISSING',
      );
    });

    it('código desconocido → technical-error', () => {
      const view = mapErrorToViewState(errorEnvelope('INTERNAL_ERROR'));
      expect(view.kind).toBe('technical-error');
    });

    it('error null (red/JSON inválido) → technical-error sin requestId', () => {
      const view = mapErrorToViewState(null);
      expect(view.kind).toBe('technical-error');
      if (view.kind === 'technical-error') {
        expect(view.requestId).toBeUndefined();
      }
    });
  });
});