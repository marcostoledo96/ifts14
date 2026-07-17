// Contrato del servicio de certificaciones (frontera admin frontend).
// Sin HTTP, storage ni claves. Implementación en memoria en
// in-memory-certifications.service.ts. Ver spec admin-certifications-frontend.
import { InjectionToken } from '@angular/core';
import {
  Certificacion,
  CertificacionDetalle,
  CertificacionesFiltros,
  EmisionResult,
  EmitirCertificacionPayload,
  EntregaManualDto,
  RegenerarPdfResult,
} from './certifications.models';

export interface CertificationsService {
  listar(filtros?: CertificacionesFiltros): Promise<readonly Certificacion[]>;
  obtener(id: number): Promise<CertificacionDetalle>;
  obtenerEntregaManual(id: number): Promise<EntregaManualDto>;
  /** PNG del QR permanente; HttpClient con sesión (no fetch crudo). */
  descargarQrPng(id: number): Promise<Blob>;
  /** PDF institucional; HttpClient blob (GET /admin/certificados/{id}/pdf). */
  descargarPdf(id: number): Promise<Blob>;
  regenerarPdf(id: number): Promise<RegenerarPdfResult>;
  contar(): Promise<number>;
  revocar(id: number, motivo: string): Promise<void>;
  emitir(payload: EmitirCertificacionPayload): Promise<EmisionResult>;
}

// ponytail: token único para inyectar la implementación en memoria.
export const CERTIFICATIONS_SOURCE = new InjectionToken<CertificationsService>('CERTIFICATIONS_SOURCE');