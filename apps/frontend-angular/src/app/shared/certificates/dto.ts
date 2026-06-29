// Contratos públicos del módulo de validación de certificados.
// Reflejan la respuesta de /certificados/api/certificados/{token}/verificacion.
// Sin DNI completo, token completo, hash, pepper ni nombres de tablas.

export interface ApiEnvelope<T> {
  data: T;
  meta: { requestId: string };
}

export interface ApiErrorEnvelope {
  error: { code: string; message: string; details: unknown[] };
  meta: { requestId: string };
}

// DTO público de verificación. Campos públicos seguros.
export interface CertificateVerificationDto {
  valid: true;
  status: 'vigente';
  certificateCode: string;
  student: { displayName: string; documentMasked: string };
  course: { name: string; issuedAt: string };
  verifiedAt: string;
}

// Estado de vista consumido por la UI pública.
// Regla pública: 404 CERTIFICATE_NOT_FOUND, revocado, expirado e inexistente
// colapsan a `not-verifiable`. `reason` es interno (logs), la UI no lo muestra.
// `technical-error` queda separado y sin detalles de infraestructura.
export type ValidationViewState =
  | { kind: 'valid'; certificate: CertificateVerificationDto; requestId: string }
  | { kind: 'not-verifiable'; reason: string; requestId?: string }
  | { kind: 'technical-error'; requestId?: string };