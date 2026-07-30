// Fuente HTTP de configuración institucional.
// GET/PUT /admin/configuracion-institucional → envelope { data: ConfigDto }.
// Firmas: POST|DELETE|GET …/firmas/{rector|asesor} (multipart / bytes).
import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { firstValueFrom } from 'rxjs';
import { environment } from '../../../../environments/environment';
import {
  emptyParameters,
  InstitutionalConfig,
  InstitutionalConfigService,
  InstitutionalConfigWrite,
  SignatureRole,
  SYSTEM_PARAMETER_DEFAULTS,
  SYSTEM_PARAMETER_KEYS,
  SystemParameterEntry,
  SystemParameterKey,
} from './institutional-config.service';

interface ParameterDto {
  value?: string | null;
  type?: string | null;
  group?: string | null;
  label?: string | null;
}

interface InstitutionalConfigDto {
  institutionName: string;
  certificateText: string | null;
  rectorName: string | null;
  rectorRole: string | null;
  advisorName: string | null;
  advisorRole: string | null;
  rectorSignaturePresent?: boolean | null;
  advisorSignaturePresent?: boolean | null;
  updatedAt: string | null;
  parameters?: Partial<Record<SystemParameterKey, ParameterDto>> | null;
}

interface ApiEnvelope<T> {
  data: T;
  meta: { requestId: string };
}

function mapParameters(
  raw: InstitutionalConfigDto['parameters'],
): Record<SystemParameterKey, SystemParameterEntry> {
  const base = emptyParameters();
  if (!raw || typeof raw !== 'object') return base;
  for (const key of SYSTEM_PARAMETER_KEYS) {
    const entry = raw[key];
    if (!entry || typeof entry !== 'object') continue;
    const def = SYSTEM_PARAMETER_DEFAULTS[key];
    base[key] = {
      value: typeof entry.value === 'string' ? entry.value : def.value,
      type: (entry.type as SystemParameterEntry['type']) || def.type,
      group: (entry.group as SystemParameterEntry['group']) || def.group,
      label: typeof entry.label === 'string' && entry.label ? entry.label : def.label,
    };
  }
  return base;
}

function fromDto(dto: InstitutionalConfigDto): InstitutionalConfig {
  return {
    institutionName: dto.institutionName ?? '',
    certificateText: dto.certificateText ?? '',
    rectorName: dto.rectorName ?? '',
    rectorRole: dto.rectorRole ?? '',
    advisorName: dto.advisorName ?? '',
    advisorRole: dto.advisorRole ?? '',
    rectorSignaturePresent: dto.rectorSignaturePresent === true,
    advisorSignaturePresent: dto.advisorSignaturePresent === true,
    parameters: mapParameters(dto.parameters),
    updatedAt: dto.updatedAt,
  };
}

@Injectable({ providedIn: 'root' })
export class HttpInstitutionalConfigService implements InstitutionalConfigService {
  private readonly http = inject(HttpClient);
  private readonly url = `${environment.apiBaseUrl}/admin/configuracion-institucional`;
  /** Coalesce/cache de obtener() hasta mutación (guardar / firmas). */
  private obtenerPending: Promise<InstitutionalConfig> | null = null;
  /** Cache de sesión por rol: evita GET blob duplicados de previewFirma. */
  private firmaPreviewByRole = new Map<SignatureRole, Promise<Blob>>();

  obtener(): Promise<InstitutionalConfig> {
    if (!this.obtenerPending) {
      this.obtenerPending = this.fetchObtener().catch((err) => {
        this.obtenerPending = null;
        throw err;
      });
    }
    return this.obtenerPending;
  }

  private async fetchObtener(): Promise<InstitutionalConfig> {
    const envelope = await firstValueFrom(
      this.http.get<ApiEnvelope<InstitutionalConfigDto>>(this.url),
    );
    return fromDto(envelope.data);
  }

  async guardar(payload: InstitutionalConfigWrite): Promise<InstitutionalConfig> {
    const envelope = await firstValueFrom(
      this.http.put<ApiEnvelope<InstitutionalConfigDto>>(this.url, payload),
    );
    this.invalidateSessionCaches();
    return fromDto(envelope.data);
  }

  async subirFirma(role: SignatureRole, file: File): Promise<InstitutionalConfig> {
    const body = new FormData();
    body.append('file', file, file.name);
    const envelope = await firstValueFrom(
      this.http.post<ApiEnvelope<InstitutionalConfigDto>>(
        `${this.url}/firmas/${role}`,
        body,
      ),
    );
    this.invalidateSessionCaches();
    return fromDto(envelope.data);
  }

  async quitarFirma(role: SignatureRole): Promise<InstitutionalConfig> {
    const envelope = await firstValueFrom(
      this.http.delete<ApiEnvelope<InstitutionalConfigDto>>(
        `${this.url}/firmas/${role}`,
      ),
    );
    this.invalidateSessionCaches();
    return fromDto(envelope.data);
  }

  previewFirma(role: SignatureRole): Promise<Blob> {
    let pending = this.firmaPreviewByRole.get(role);
    if (!pending) {
      pending = firstValueFrom(
        this.http.get(`${this.url}/firmas/${role}`, { responseType: 'blob' }),
      ).catch((err) => {
        this.firmaPreviewByRole.delete(role);
        throw err;
      });
      this.firmaPreviewByRole.set(role, pending);
    }
    return pending;
  }

  /** Sin seam de logout trivial: invalidación solo por mutaciones. */
  private invalidateSessionCaches(): void {
    this.obtenerPending = null;
    this.firmaPreviewByRole.clear();
  }
}
