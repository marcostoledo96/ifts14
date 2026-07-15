// Contrato del servicio de configuración institucional (frontera admin frontend).
// Sin HTTP, storage ni claves. Implementación HTTP en
// http-institutional-config.service.ts. Ver spec p5-02-frontend-http-angular.
import { InjectionToken } from '@angular/core';

export interface InstitutionalConfig {
  readonly nombre: string;
  readonly direccion: string | null;
  readonly logoUrl: string | null;
}

export interface InstitutionalConfigService {
  obtener(): Promise<InstitutionalConfig>;
}

// ponytail: token único para inyectar la implementación (mock o HTTP).
export const INSTITUTIONAL_CONFIG_SOURCE =
  new InjectionToken<InstitutionalConfigService>('INSTITUTIONAL_CONFIG_SOURCE');