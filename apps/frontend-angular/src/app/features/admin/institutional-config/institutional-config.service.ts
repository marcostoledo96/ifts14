// Contrato del servicio de configuración institucional (frontera admin frontend).
// Modelo 1:1 con el DTO del backend PHP (GET/PUT /admin/configuracion-institucional).
// Sin HTTP, storage ni claves. Implementaciones: http-institutional-config.service.ts
// (API real) e in-memory-institutional-config.service.ts (demo useRealApi=false).
import { InjectionToken } from '@angular/core';

export interface InstitutionalConfig {
  readonly institutionName: string;
  readonly certificateText: string;
  readonly rectorName: string;
  readonly rectorRole: string;
  readonly advisorName: string;
  readonly advisorRole: string;
  // Solo lectura: la fija el backend al guardar.
  readonly updatedAt: string | null;
}

export type InstitutionalConfigWrite = Omit<InstitutionalConfig, 'updatedAt'>;

// Límites de longitud alineados con la validación del backend PHP.
export const INSTITUTIONAL_CONFIG_LIMITS = {
  name: 160,
  role: 80,
  certificateText: 255,
} as const;

export interface InstitutionalConfigService {
  obtener(): Promise<InstitutionalConfig>;
  guardar(payload: InstitutionalConfigWrite): Promise<InstitutionalConfig>;
}

// ponytail: token único para inyectar la implementación (mock o HTTP).
export const INSTITUTIONAL_CONFIG_SOURCE =
  new InjectionToken<InstitutionalConfigService>('INSTITUTIONAL_CONFIG_SOURCE');
