import { mapErrorToViewState, mapResponseToViewState } from './result-mapper';
import { ApiEnvelope, ApiErrorEnvelope, CertificateVerificationDto } from './dto';
import { ValidationSourceResult } from './validation-source';
import { LEGACY_VALID_DTO, VALID_VALID_DTO } from './mock-tokens';

function validEnvelope(dto?: Partial<CertificateVerificationDto>): ApiEnvelope<CertificateVerificationDto> {
  return {
    data: {
      ...VALID_VALID_DTO,
      ...dto,
    },
    meta: { requestId: 'req-1' },
  };
}

function envelopeWithData(data: CertificateVerificationDto): ApiEnvelope<CertificateVerificationDto> {
  return { data, meta: { requestId: 'req-1' } };
}

function errorEnvelope(code: string, requestId = 'req-err'): ApiErrorEnvelope {
  return { error: { code, message: 'x', details: [] }, meta: { requestId } };
}

describe('result-mapper', () => {
  describe('mapResponseToViewState', () => {
    it('mapea envelope D0 a valid con requestId', () => {
      const result: ValidationSourceResult = { ok: true, envelope: validEnvelope() };
      const view = mapResponseToViewState(result);
      expect(view.kind).toBe('valid');
      if (view.kind === 'valid') {
        expect(view.certificate.certificateCode).toBe('CERT-2025-0001');
        expect(view.certificate.student.documentNumber).toBe('12345678');
        expect(view.certificate.course.attendedDates).toEqual(['2025-03-10', '2025-03-12']);
        expect(view.requestId).toBe('req-1');
      }
    });

    it('mapea envelope legado con documentMasked a valid', () => {
      const result: ValidationSourceResult = {
        ok: true,
        envelope: { data: LEGACY_VALID_DTO, meta: { requestId: 'req-legacy' } },
      };
      const view = mapResponseToViewState(result);
      expect(view.kind).toBe('valid');
      if (view.kind === 'valid') {
        expect(view.certificate.student.documentMasked).toBe('12.345.**');
        expect(view.certificate.course.attendedDates).toBeUndefined();
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

  describe('mapResponseToViewState — envolturas válidas malformadas', () => {
    it('student ausente → technical-error (no rompe template)', () => {
      const result: ValidationSourceResult = {
        ok: true,
        envelope: envelopeWithData({
          ...VALID_VALID_DTO,
          student: undefined as unknown as CertificateVerificationDto['student'],
        }),
      };
      const view = mapResponseToViewState(result);
      expect(view.kind).toBe('technical-error');
    });

    it('course ausente → technical-error', () => {
      const result: ValidationSourceResult = {
        ok: true,
        envelope: envelopeWithData({
          ...VALID_VALID_DTO,
          course: undefined as unknown as CertificateVerificationDto['course'],
        }),
      };
      const view = mapResponseToViewState(result);
      expect(view.kind).toBe('technical-error');
    });

    it('student.displayName vacío → technical-error', () => {
      const result: ValidationSourceResult = {
        ok: true,
        envelope: validEnvelope({
          student: { displayName: '   ', documentNumber: '12345678' },
        }),
      };
      const view = mapResponseToViewState(result);
      expect(view.kind).toBe('technical-error');
    });

    it('D0 sin attendedDates → technical-error', () => {
      const result: ValidationSourceResult = {
        ok: true,
        envelope: envelopeWithData({
          ...VALID_VALID_DTO,
          course: { name: 'Curso', issuedAt: '2025-01-01' },
        }),
      };
      const view = mapResponseToViewState(result);
      expect(view.kind).toBe('technical-error');
    });

    it('D0 con attendedDates vacío → technical-error', () => {
      const result: ValidationSourceResult = {
        ok: true,
        envelope: envelopeWithData({
          ...VALID_VALID_DTO,
          course: { name: 'Curso', issuedAt: '2025-01-01', attendedDates: [] },
        }),
      };
      const view = mapResponseToViewState(result);
      expect(view.kind).toBe('technical-error');
    });

    it('sin documentNumber ni documentMasked → technical-error', () => {
      const result: ValidationSourceResult = {
        ok: true,
        envelope: envelopeWithData({
          ...VALID_VALID_DTO,
          student: { displayName: 'Juan Pérez' },
        }),
      };
      const view = mapResponseToViewState(result);
      expect(view.kind).toBe('technical-error');
    });

    it('course.issuedAt ausente → technical-error', () => {
      const result: ValidationSourceResult = {
        ok: true,
        envelope: validEnvelope({
          course: { name: 'Curso', issuedAt: '' },
        }),
      };
      const view = mapResponseToViewState(result);
      expect(view.kind).toBe('technical-error');
    });

    it('certificateCode ausente → technical-error', () => {
      const result: ValidationSourceResult = {
        ok: true,
        envelope: validEnvelope({ certificateCode: '' }),
      };
      const view = mapResponseToViewState(result);
      expect(view.kind).toBe('technical-error');
    });

    it('mantiene requestId en technical-error por mala forma', () => {
      const result: ValidationSourceResult = {
        ok: true,
        envelope: envelopeWithData({
          ...VALID_VALID_DTO,
          course: undefined as unknown as CertificateVerificationDto['course'],
        }),
      };
      const view = mapResponseToViewState(result);
      if (view.kind === 'technical-error') {
        expect(view.requestId).toBe('req-1');
      }
    });
  });

  // Codex PR #10: 200/ok con JSON malformado debe ser technical-error antes
  // de desreferenciar data/meta/valid. No debe colapsar falsamente a
  // not-verifiable (que expondría "no verificable" ante un backend roto).
  describe('mapResponseToViewState — envoltura 200 malformada', () => {
    it('envelope sin data → technical-error', () => {
      const result: ValidationSourceResult = {
        ok: true,
        envelope: { meta: { requestId: 'req-x' } } as unknown as ApiEnvelope<CertificateVerificationDto>,
      };
      const view = mapResponseToViewState(result);
      expect(view.kind).toBe('technical-error');
      if (view.kind === 'technical-error') {
        expect(view.requestId).toBe('req-x');
      }
    });

    it('envelope sin meta → technical-error sin requestId', () => {
      const result: ValidationSourceResult = {
        ok: true,
        envelope: { data: VALID_VALID_DTO } as unknown as ApiEnvelope<CertificateVerificationDto>,
      };
      const view = mapResponseToViewState(result);
      expect(view.kind).toBe('technical-error');
      if (view.kind === 'technical-error') {
        expect(view.requestId).toBeUndefined();
      }
    });

    it('meta sin requestId → technical-error sin requestId', () => {
      const result: ValidationSourceResult = {
        ok: true,
        envelope: {
          data: VALID_VALID_DTO,
          meta: {} as { requestId: string },
        } as unknown as ApiEnvelope<CertificateVerificationDto>,
      };
      const view = mapResponseToViewState(result);
      expect(view.kind).toBe('technical-error');
      if (view.kind === 'technical-error') {
        expect(view.requestId).toBeUndefined();
      }
    });

    it('data sin valid (ausente) → technical-error (no not-verifiable)', () => {
      const dto = { ...VALID_VALID_DTO } as Partial<CertificateVerificationDto>;
      delete (dto as { valid?: unknown }).valid;
      const result: ValidationSourceResult = {
        ok: true,
        envelope: { data: dto, meta: { requestId: 'req-x' } } as unknown as ApiEnvelope<CertificateVerificationDto>,
      };
      const view = mapResponseToViewState(result);
      expect(view.kind).toBe('technical-error');
      if (view.kind === 'technical-error') {
        expect(view.requestId).toBe('req-x');
      }
    });

    it('data.valid no-boolean → technical-error (no not-verifiable)', () => {
      const result: ValidationSourceResult = {
        ok: true,
        envelope: {
          data: { ...VALID_VALID_DTO, valid: 'true' as unknown as true },
          meta: { requestId: 'req-x' },
        } as unknown as ApiEnvelope<CertificateVerificationDto>,
      };
      const view = mapResponseToViewState(result);
      expect(view.kind).toBe('technical-error');
    });

    it('data null → technical-error', () => {
      const result: ValidationSourceResult = {
        ok: true,
        envelope: { data: null, meta: { requestId: 'req-x' } } as unknown as ApiEnvelope<CertificateVerificationDto>,
      };
      const view = mapResponseToViewState(result);
      expect(view.kind).toBe('technical-error');
    });

    it('valid:false con meta.requestId válido → not-verifiable (mantiene comportamiento)', () => {
      const result: ValidationSourceResult = {
        ok: true,
        envelope: {
          data: { ...VALID_VALID_DTO, valid: false as unknown as true },
          meta: { requestId: 'req-1' },
        } as unknown as ApiEnvelope<CertificateVerificationDto>,
      };
      const view = mapResponseToViewState(result);
      expect(view.kind).toBe('not-verifiable');
      if (view.kind === 'not-verifiable') {
        expect(view.reason).toBe('valid:false');
        expect(view.requestId).toBe('req-1');
      }
    });

    it('envelope null → technical-error', () => {
      const result: ValidationSourceResult = {
        ok: true,
        envelope: null as unknown as ApiEnvelope<CertificateVerificationDto>,
      };
      const view = mapResponseToViewState(result);
      expect(view.kind).toBe('technical-error');
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
