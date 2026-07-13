// Contrato del servicio de certificaciones (frontera admin frontend).
// Sin HTTP, storage ni claves. Implementación en memoria en
// in-memory-certifications.service.ts. Ver spec admin-certifications-frontend.
import { InjectionToken } from '@angular/core';
import {
  Certificacion,
  CertificacionDetalle,
  CertificacionesFiltros,
} from './certifications.models';

export interface CertificationsService {
  listar(filtros?: CertificacionesFiltros): Promise<readonly Certificacion[]>;
  obtener(id: number): Promise<CertificacionDetalle>;
  contar(): Promise<number>;
  revocar(id: number, motivo: string): Promise<void>;
}

// ponytail: token único para inyectar la implementación en memoria.
export const CERTIFICATIONS_SOURCE = new InjectionToken<CertificationsService>('CERTIFICATIONS_SOURCE');