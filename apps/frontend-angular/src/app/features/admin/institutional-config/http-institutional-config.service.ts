// Fuente HTTP de configuración institucional.
// GET/PUT /admin/configuracion-institucional → envelope { data: ConfigDto }.
// Mapeo 1:1 con el DTO backend; strings null se normalizan a vacío para el form.
import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { firstValueFrom } from 'rxjs';
import { environment } from '../../../../environments/environment';
import {
  InstitutionalConfig,
  InstitutionalConfigService,
  InstitutionalConfigWrite,
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

function fromDto(dto: InstitutionalConfigDto): InstitutionalConfig {
  return {
    institutionName: dto.institutionName ?? '',
    certificateText: dto.certificateText ?? '',
    rectorName: dto.rectorName ?? '',
    rectorRole: dto.rectorRole ?? '',
    advisorName: dto.advisorName ?? '',
    advisorRole: dto.advisorRole ?? '',
    updatedAt: dto.updatedAt,
  };
}

@Injectable({ providedIn: 'root' })
export class HttpInstitutionalConfigService implements InstitutionalConfigService {
  private readonly http = inject(HttpClient);
  private readonly url = `${environment.apiBaseUrl}/admin/configuracion-institucional`;

  async obtener(): Promise<InstitutionalConfig> {
    const envelope = await firstValueFrom(
      this.http.get<ApiEnvelope<InstitutionalConfigDto>>(this.url),
    );
    return fromDto(envelope.data);
  }

  async guardar(payload: InstitutionalConfigWrite): Promise<InstitutionalConfig> {
    const envelope = await firstValueFrom(
      this.http.put<ApiEnvelope<InstitutionalConfigDto>>(this.url, payload),
    );
    return fromDto(envelope.data);
  }
}
