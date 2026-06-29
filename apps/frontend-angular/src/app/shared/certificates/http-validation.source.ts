// Fuente de validación HTTP real. Consume la API PHP futura:
// GET /certificados/api/certificados/{token}/verificacion
// Respeta el contrato de docs/backend/01-contrato-api-certificados.md.
// Implementa ValidationSource para que ValidationService y la UI no cambien.
//
// Mapeo de errores:
// - 4xx con envelope ApiErrorEnvelope → { ok: false, error } (mapper decide not-verifiable vs técnico).
// - 404 CERTIFICATE_NOT_FOUND cae a not-verifiable (regla pública del gate).
// - 5xx, red, JSON inválido, timeout → { ok: false, error: null } (technical-error).
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { firstValueFrom } from 'rxjs';
import { ApiEnvelope, ApiErrorEnvelope, CertificateVerificationDto } from './dto';
import { ValidationSource, ValidationSourceResult } from './validation-source';

// ponytail: HttpClient observable → Promise. No inventamos fetch paralelo.
// La API vive bajo /certificados/api/ en el deploy cPanel; la URL es relativa
// al dominio y resuelve contra la base del documento (no contra baseHref).
@Injectable({ providedIn: 'root' })
export class HttpValidationSource implements ValidationSource {
  private readonly http = inject(HttpClient);

  async fetch(token: string, signal?: AbortSignal): Promise<ValidationSourceResult> {
    const url = `/certificados/api/certificados/${encodeURIComponent(token)}/verificacion`;
    try {
      const envelope = await firstValueFrom(
        this.http.get<ApiEnvelope<CertificateVerificationDto>>(url),
      );
      return { ok: true, envelope };
    } catch (e) {
      return { ok: false, error: toErrorEnvelope(e) };
    }
  }
}

// HTTP error → envelope de error del contrato, o null si no es parseable.
// 5xx/red/JSON inválido devuelven null (technical-error en el mapper).
function toErrorEnvelope(error: unknown): ApiErrorEnvelope | null {
  if (!(error instanceof HttpErrorResponse)) {
    return null;
  }
  // Body ya parseado por HttpClient si la API respondió JSON con status de error.
  const body = error.error as ApiErrorEnvelope | null;
  if (body && typeof body === 'object' && 'error' in body && 'meta' in body) {
    return body;
  }
  return null;
}