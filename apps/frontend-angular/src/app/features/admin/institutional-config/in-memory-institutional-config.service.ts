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
  institutionName: 'IFTS N.° 14',
  certificateText:
    'Se certifica la asistencia al curso indicado, con las fechas registradas por Bedelía.',
  rectorName: 'Nombre Apellido',
  rectorRole: 'Rector/a',
  advisorName: 'Nombre Apellido',
  advisorRole: 'Asesor/a pedagógico/a',
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
