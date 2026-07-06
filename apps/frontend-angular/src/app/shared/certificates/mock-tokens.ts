// Tokens de demo y fuente mock de validación.
// Ningún token corresponde a datos reales; son fixtures para desbloquear la UI.
import { ApiEnvelope, ApiErrorEnvelope, CertificateVerificationDto } from './dto';
import { ValidationSource, ValidationSourceResult } from './validation-source';

export type MockToken =
  | 'demo-valido'
  | 'demo-revocado'
  | 'demo-expirado'
  | 'demo-inexistente'
  | 'demo-error-tecnico';

export function isMockToken(token: string): token is MockToken {
  return (
    token === 'demo-valido' ||
    token === 'demo-revocado' ||
    token === 'demo-expirado' ||
    token === 'demo-inexistente' ||
    token === 'demo-error-tecnico'
  );
}

// Exportado para reuso en tests del adapter HTTP (sin duplicar el fixture).
export const VALID_VALID_DTO: CertificateVerificationDto = {
  valid: true,
  status: 'vigente',
  certificateCode: 'CERT-2025-0001',
  student: { displayName: 'Juan Pérez', documentNumber: '12345678' },
  course: {
    name: 'Técnico Superior en Sistemas',
    issuedAt: '2025-03-15',
    attendedDates: ['2025-03-10', '2025-03-12'],
  },
  verifiedAt: '2025-06-29T10:00:00Z',
};

/** Fixture legado sin attendedDates ni documentNumber (certificados previos al modelo curso/alumno). */
export const LEGACY_VALID_DTO: CertificateVerificationDto = {
  valid: true,
  status: 'vigente',
  certificateCode: 'CERT-LEGACY-0001',
  student: { displayName: 'Persona Legado', documentMasked: '12.345.**' },
  course: { name: 'Curso histórico', issuedAt: '2024-01-10' },
  verifiedAt: '2025-06-29T10:00:00Z',
};

function envelope<T>(data: T, requestId: string): ApiEnvelope<T> {
  return { data, meta: { requestId } };
}

function errorEnvelope(code: string, message: string, requestId: string): ApiErrorEnvelope {
  return { error: { code, message, details: [] }, meta: { requestId } };
}

export function delay(ms: number, signal?: AbortSignal): Promise<void> {
  return new Promise((resolve, reject) => {
    if (signal?.aborted) {
      reject(new DOMException('Aborted', 'AbortError'));
      return;
    }
    const t = setTimeout(resolve, ms);
    signal?.addEventListener(
      'abort',
      () => {
        clearTimeout(t);
        reject(new DOMException('Aborted', 'AbortError'));
      },
      { once: true },
    );
  });
}

// ponytail: clase concreta en lugar de factory; una sola implementación.
// Fase 3 añadirá HttpValidationSource sin tocar ValidationService.
export class MockValidationSource implements ValidationSource {
  async fetch(token: string, signal?: AbortSignal): Promise<ValidationSourceResult> {
    // Simula latencia de red sin inventar HTTP real.
    await delay(0, signal);

    switch (token) {
      case 'demo-valido':
        return { ok: true, envelope: envelope(VALID_VALID_DTO, 'req-valido') };
      case 'demo-revocado':
        return {
          ok: false,
          error: errorEnvelope('CERTIFICATE_REVOKED', 'revocado', 'req-revocado'),
        };
      case 'demo-expirado':
        return {
          ok: false,
          error: errorEnvelope('CERTIFICATE_EXPIRED', 'expirado', 'req-expirado'),
        };
      case 'demo-inexistente':
        return {
          ok: false,
          error: errorEnvelope('CERTIFICATE_NOT_FOUND', 'no encontrado', 'req-inexistente'),
        };
      case 'demo-error-tecnico':
        // Sin envelope: simula falla de red / JSON inválido.
        return { ok: false, error: null };
      default:
        // Token desconocido tratado como no encontrado (no verificable).
        return {
          ok: false,
          error: errorEnvelope('CERTIFICATE_NOT_FOUND', 'token desconocido', 'req-default'),
        };
    }
  }
}