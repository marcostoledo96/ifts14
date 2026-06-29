// Fuente de validación reemplazable: mock ahora, HTTP después.
// El servicio depende de esta abstracción, no de HttpClient/httpResource directo.
import { InjectionToken } from '@angular/core';
import { ApiEnvelope, ApiErrorEnvelope, CertificateVerificationDto } from './dto';

export type ValidationSourceResult =
  | { ok: true; envelope: ApiEnvelope<CertificateVerificationDto> }
  | { ok: false; error: ApiErrorEnvelope | null };

// ponytail: interfaz mínima con una sola implementación por ahora.
// Se justifica porque habilita el swap mock→HTTP de Fase 3 sin tocar el servicio.
export interface ValidationSource {
  fetch(token: string, signal?: AbortSignal): Promise<ValidationSourceResult>;
}

export const VALIDATION_SOURCE = new InjectionToken<ValidationSource>('VALIDATION_SOURCE');