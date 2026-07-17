// Contratos públicos del módulo de validación de certificados.
// Reflejan la respuesta de /certificados/api/certificados/{token}/verificacion.
// D0: DNI completo visible (documentNumber) y fechas asistidas (attendedDates).

export interface ApiEnvelope<T> {
  data: T;
  meta: { requestId: string };
}

export interface ApiErrorEnvelope {
  error: { code: string; message: string; details: unknown[] };
  meta: { requestId: string };
}

export interface CertificateStudentDto {
  displayName: string;
  /** DNI completo visible en validación pública (D0). */
  documentNumber?: string;
  /** Solo certificados legados sin alumno/curso vinculado. */
  documentMasked?: string;
}

export interface CertificateCourseDto {
  name: string;
  issuedAt: string;
  /** Fechas del curso a las que asistió el alumno (D0). */
  attendedDates?: string[];
}

// DTO público de verificación. Campos públicos seguros.
export interface CertificateVerificationDto {
  valid: true;
  status: 'vigente';
  certificateCode: string;
  student: CertificateStudentDto;
  course: CertificateCourseDto;
  verifiedAt: string;
}

/** Texto de documento para la UI pública: D0 primero, legado enmascarado como fallback. */
export function studentDocumentDisplay(student: CertificateStudentDto): string {
  const documentNumber = student.documentNumber?.trim();
  if (documentNumber) {
    return documentNumber;
  }
  return student.documentMasked?.trim() ?? '';
}

// Estado de vista consumido por la UI pública.
// Regla pública: 404, revocado, expirado e inexistente colapsan a `not-verifiable`
// con `reason` interno. La UI puede ramificar chrome de revocada solo cuando
// reason === CERTIFICATE_REVOKED (mock/futuro); el resto usa no-encontrada.
// `technical-error` queda separado y sin detalles de infraestructura.
export type ValidationViewState =
  | { kind: 'valid'; certificate: CertificateVerificationDto; requestId: string }
  | { kind: 'not-verifiable'; reason: string; requestId?: string }
  | { kind: 'technical-error'; requestId?: string };
