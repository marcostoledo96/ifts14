// Fuente en memoria para demo/offline (environment.useRealApi=false).
// Seed con los defaults del backend PHP; guardar muta el estado local
// y actualiza updatedAt como haría la API real.
import { Injectable } from '@angular/core';
import {
  InstitutionalConfig,
  InstitutionalConfigService,
  InstitutionalConfigWrite,
} from './institutional-config.service';

const SEED: InstitutionalConfig = {
  institutionName: 'Instituto de Formación Técnica Superior N.° 14',
  certificateText:
    'Se certifica que la persona mencionada ha aprobado satisfactoriamente el curso detallado, cumpliendo con la asistencia y las evaluaciones requeridas.',
  rectorName: '',
  rectorRole: 'Rectora del IFTS N.° 14',
  advisorName: '',
  advisorRole: 'Asesora Pedagógica del IFTS N.° 14',
  updatedAt: '2026-01-01T00:00:00Z',
};

@Injectable({ providedIn: 'root' })
export class InMemoryInstitutionalConfigService implements InstitutionalConfigService {
  private config: InstitutionalConfig = { ...SEED };

  async obtener(): Promise<InstitutionalConfig> {
    return { ...this.config };
  }

  async guardar(payload: InstitutionalConfigWrite): Promise<InstitutionalConfig> {
    this.config = { ...payload, updatedAt: new Date().toISOString() };
    return { ...this.config };
  }
}
