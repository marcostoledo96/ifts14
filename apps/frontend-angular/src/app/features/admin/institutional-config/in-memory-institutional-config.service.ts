// Fuente en memoria para demo/offline (environment.useRealApi=false).
// Seed con los defaults del backend PHP; guardar muta el estado local
// y actualiza updatedAt como haría la API real.
import { Injectable } from '@angular/core';
import {
  emptyParameters,
  flattenParameterValues,
  InstitutionalConfig,
  InstitutionalConfigService,
  InstitutionalConfigWrite,
  SYSTEM_PARAMETER_KEYS,
  SystemParameterKey,
} from './institutional-config.service';

const SEED: InstitutionalConfig = {
  institutionName: 'Instituto de Formación Técnica Superior N.° 14',
  certificateText:
    'Se certifica que la persona mencionada ha aprobado satisfactoriamente el curso detallado, cumpliendo con la asistencia y las evaluaciones requeridas.',
  rectorName: '',
  rectorRole: 'Rectora del IFTS N.° 14',
  advisorName: '',
  advisorRole: 'Asesora Pedagógica del IFTS N.° 14',
  parameters: emptyParameters(),
  updatedAt: '2026-01-01T00:00:00Z',
};

@Injectable({ providedIn: 'root' })
export class InMemoryInstitutionalConfigService implements InstitutionalConfigService {
  private config: InstitutionalConfig = {
    ...SEED,
    parameters: emptyParameters(),
  };

  async obtener(): Promise<InstitutionalConfig> {
    return this.clone(this.config);
  }

  async guardar(payload: InstitutionalConfigWrite): Promise<InstitutionalConfig> {
    const nextParams = emptyParameters();
    const current = flattenParameterValues(this.config.parameters);
    for (const key of SYSTEM_PARAMETER_KEYS) {
      const incoming = payload.parameters[key];
      const value = typeof incoming === 'string' ? incoming : current[key];
      nextParams[key] = { ...nextParams[key], value };
    }
    this.config = {
      institutionName: payload.institutionName,
      certificateText: payload.certificateText,
      rectorName: payload.rectorName,
      rectorRole: payload.rectorRole,
      advisorName: payload.advisorName,
      advisorRole: payload.advisorRole,
      parameters: nextParams,
      updatedAt: new Date().toISOString(),
    };
    return this.clone(this.config);
  }

  private clone(config: InstitutionalConfig): InstitutionalConfig {
    const parameters = {} as InstitutionalConfig['parameters'];
    for (const key of SYSTEM_PARAMETER_KEYS) {
      (parameters as Record<SystemParameterKey, (typeof config.parameters)[SystemParameterKey]>)[key] =
        { ...config.parameters[key] };
    }
    return { ...config, parameters };
  }
}
