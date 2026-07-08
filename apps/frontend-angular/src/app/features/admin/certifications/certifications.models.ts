// Modelos de certificaciones — admin frontend.
// Mock-only: sin DNI completo, token completo, email, legajo ni matrícula.
// Los DTOs seguros (documentMasked, tokenPrefix, URL truncada) se usan en UI admin.

export type EstadoCertificado = 'borrador' | 'vigente' | 'revocado' | 'vencido';

// Certificación listable: campos seguros para el listado admin.
export interface Certificacion {
  readonly id: number;
  readonly nombreAlumno: string; // ficticio, no plausible
  readonly cursoNombre: string; // ficticio, no plausible
  readonly estado: EstadoCertificado;
  readonly documentMasked: string; // XX****XX
  readonly tokenPrefix: string; // prefijo_demo_xxx
  readonly emitidoEn: string | null; // ISO date
  readonly venceEn: string | null; // ISO date
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
  readonly q?: string; // texto libre sobre nombre/curso/alumno
}