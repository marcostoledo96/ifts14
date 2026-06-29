// Mapper del contrato backend al estado de vista público.
// Regla pública (gate): 404 CERTIFICATE_NOT_FOUND, revocado, expirado e
// inexistente colapsan a { kind: 'not-verifiable' }. El reason es interno.
// 500 / red / JSON inválido → technical-error, sin detalles.
import { ApiEnvelope, ApiErrorEnvelope, CertificateVerificationDto, ValidationViewState } from './dto';
import { ValidationSourceResult } from './validation-source';

export function mapResponseToViewState(
  result: ValidationSourceResult,
): ValidationViewState {
  if (result.ok) {
    return mapValid(result.envelope);
  }
  return mapErrorToViewState(result.error);
}

function mapValid(envelope: ApiEnvelope<CertificateVerificationDto>): ValidationViewState {
  const dto = envelope.data;
  // Defensiva: el contrato dice valid:true. Si llegara false, no es verificable.
  if (!dto.valid) {
    return { kind: 'not-verifiable', reason: 'valid:false', requestId: envelope.meta.requestId };
  }
  return { kind: 'valid', certificate: dto, requestId: envelope.meta.requestId };
}

export function mapErrorToViewState(error: ApiErrorEnvelope | null): ValidationViewState {
  if (!error) {
    // Sin envelope de error: falla de red o JSON inválido.
    return { kind: 'technical-error' };
  }

  const code = error.error?.code;
  const requestId = error.meta?.requestId;

  // Colapso público: 404, revocado, expirado e inexistente al mismo bloque.
  // El reason interno distingue causa para logs; la UI sólo ve "no verificable".
  if (
    code === 'CERTIFICATE_NOT_FOUND' ||
    code === 'CERTIFICATE_REVOKED' ||
    code === 'CERTIFICATE_EXPIRED' ||
    code === 'CERTIFICATE_MISSING'
  ) {
    return { kind: 'not-verifiable', reason: code, requestId };
  }

  // Cualquier otro código de error → técnico.
  return { kind: 'technical-error', requestId };
}