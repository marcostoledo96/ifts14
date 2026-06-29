// Mapper del contrato backend al estado de vista público.
// Regla pública (gate): 404 CERTIFICATE_NOT_FOUND, revocado, expirado,
// inexistente y token ausente/mal formado (VALIDATION_ERROR) colapsan a
// { kind: 'not-verifiable' }. El reason es interno.
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
  const requestId = envelope.meta.requestId;
  // Defensiva: el contrato dice valid:true. Si llegara false, no es verificable.
  if (!dto.valid) {
    return { kind: 'not-verifiable', reason: 'valid:false', requestId };
  }
  // Guardia de forma: si el anuncio 200/valid:true trae un anidamiento
  // incompleto (student, course o strings requeridos ausentes), el template
  // lanzaría al renderizar. Colapsamos a technical-error en lugar de exponer
  // un certificado a medio armar.
  if (!hasValidCertificateShape(dto)) {
    return { kind: 'technical-error', requestId };
  }
  return { kind: 'valid', certificate: dto, requestId };
}

function isNonEmptyString(v: unknown): v is string {
  return typeof v === 'string' && v.trim().length > 0;
}

function hasValidCertificateShape(dto: Partial<CertificateVerificationDto> | null | undefined): boolean {
  if (!dto) return false;
  return (
    isNonEmptyString(dto.certificateCode) &&
    isNonEmptyString(dto.verifiedAt) &&
    !!dto.student &&
    isNonEmptyString(dto.student.displayName) &&
    isNonEmptyString(dto.student.documentMasked) &&
    !!dto.course &&
    isNonEmptyString(dto.course.name) &&
    isNonEmptyString(dto.course.issuedAt)
  );
}

export function mapErrorToViewState(error: ApiErrorEnvelope | null): ValidationViewState {
  if (!error) {
    // Sin envelope de error: falla de red o JSON inválido.
    return { kind: 'technical-error' };
  }

  const code = error.error?.code;
  const requestId = error.meta?.requestId;

  // Colapso público: 404, revocado, expirado, inexistente y token mal formado
  // al mismo bloque. El reason interno distingue causa para logs; la UI sólo
  // ve "no verificable".
  if (
    code === 'CERTIFICATE_NOT_FOUND' ||
    code === 'CERTIFICATE_REVOKED' ||
    code === 'CERTIFICATE_EXPIRED' ||
    code === 'CERTIFICATE_MISSING' ||
    code === 'VALIDATION_ERROR'
  ) {
    return { kind: 'not-verifiable', reason: code, requestId };
  }

  // Cualquier otro código de error → técnico.
  return { kind: 'technical-error', requestId };
}