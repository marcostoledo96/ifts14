// Fuente HTTP de configuración institucional.
// GET /admin/configuracion-institucional → envelope { data: ConfigDto }.
// Mapeo: institutionName→nombre; direccion y logoUrl default null (backend sin campo).
import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { firstValueFrom } from 'rxjs';
import { environment } from '../../../../environments/environment';
import {
  InstitutionalConfig,
  InstitutionalConfigService,
} from './institutional-config.service';

interface InstitutionalConfigDto {
  institutionName: string;
  certificateText: string | null;
  rectorName: string | null;
  rectorRole: string | null;
  advisorName: string | null;
  advisorRole: string | null;
  updatedAt: string | null;
}

interface ApiEnvelope<T> {
  data: T;
  meta: { requestId: string };
}

@Injectable({ providedIn: 'root' })
export class HttpInstitutionalConfigService implements InstitutionalConfigService {
  private readonly http = inject(HttpClient);

  async obtener(): Promise<InstitutionalConfig> {
    const url = `${environment.apiBaseUrl}/admin/configuracion-institucional`;
    const envelope = await firstValueFrom(
      this.http.get<ApiEnvelope<InstitutionalConfigDto>>(url),
    );
    return {
      nombre: envelope.data.institutionName,
      // ponytail: backend no expone dirección ni logo; default null hasta que los agregue.
      direccion: null,
      logoUrl: null,
    };
  }
}