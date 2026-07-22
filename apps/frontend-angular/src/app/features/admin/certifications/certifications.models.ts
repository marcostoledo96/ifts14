// Modelos de certificaciones — admin frontend.
// Mock-only: sin DNI real, token completo, email, legajo ni matrícula.
// documentMasked (D0): nombre histórico; en UI admin contiene DNI completo ficticio.
// tokenPrefix y URL truncada siguen siendo datos seguros parciales.

export type EstadoCertificado = 'borrador' | 'vigente' | 'revocado' | 'vencido';

export const PAGINA_TAMANO = 20;

// Certificación listable: campos seguros para el listado admin.
export interface Certificacion {
  readonly id: number;
  readonly numero: string;
  readonly nombreAlumno: string; // ficticio, no plausible
  readonly cursoNombre: string; // ficticio, no plausible
  readonly estado: EstadoCertificado;
  readonly documentMasked: string; // DNI completo ficticio (7-8 dígitos)
  readonly tokenPrefix: string; // prefijo_demo_xxx
  readonly emitidoEn: string | null; // ISO date
  readonly venceEn: string | null; // ISO date
  /** FK admin; null en seeds legacy sin par alumno/curso. */
  readonly alumnoId?: number | null;
  readonly cursoId?: number | null;
}

// Detalle de previsualización: añade auditoría mínima y URL pública truncada.
export interface CertificacionDetalle extends Certificacion {
  readonly publicValidationUrl: string; // truncada, sin token completo
  readonly attendedDates: readonly string[]; // ISO dates
  readonly auditEvents: readonly AuditEvent[];
}

export interface AuditEvent {
  readonly at: string; // ISO date
  readonly accion: string; // ej: 'emision', 'entrega', 'revocacion'
  readonly detalle: string;
}

export interface CertificacionesFiltros {
  readonly estado?: EstadoCertificado;
  readonly curso?: string;
  readonly q?: string; // texto libre sobre nombre/curso/alumno
  readonly cursoId?: number;
  readonly alumnoId?: number;
}

/** Body exacto de POST /admin/certificados. */
export interface EmitirCertificacionPayload {
  readonly alumnoId: number;
  readonly cursoId: number;
  readonly issuedAt: string; // YYYY-MM-DD
  readonly expiresAt: string | null;
}

/** data de respuesta 201 de emisión. */
export interface EmisionResult {
  readonly id: number;
  readonly certificateCode: string;
  readonly status: string;
  readonly student: { readonly displayName: string; readonly documentMasked: string };
  readonly course: { readonly name: string };
  readonly issuedAt: string;
  readonly expiresAt: string | null;
  readonly tokenPrefix: string;
  readonly publicValidationUrl: string;
  readonly pdfDownloadUrl: string;
}

// DTO de entrega manual: respuesta de GET /admin/certificados/{id}/entrega-manual.
// publicValidationUrl es la URL canónica construida por el backend (no hardcodear dominio).
export type PdfStatus = 'valid' | 'outdated' | 'missing';

export interface EntregaManualDto {
  readonly certificadoId: number;
  readonly publicValidationUrl: string;
  readonly pdfDownloadUrl: string;
  readonly tokenPrefix: string;
  readonly pdfAvailable: boolean;
  readonly pdfStatus: PdfStatus;
}

// Resultado de POST /admin/certificados/{id}/regenerar-pdf.
export interface RegenerarPdfResult {
  readonly regenerado: boolean;
  readonly mensaje?: string;
  readonly publicValidationUrl?: string;
  readonly pdfDownloadUrl?: string;
  readonly pdfStatus?: PdfStatus;
}
