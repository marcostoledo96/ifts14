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
import { Observable } from 'rxjs';
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
    // ponytail: Angular 20 HttpClient no tiene opción `signal` nativa, pero
    // desuscribir el Observable aborta el request en curso (docs Angular 20).
    // Contrato abort: rechaza con AbortError como MockValidationSource;
    // ValidationService lo atrapa y colapsa a technical-error.
    if (signal?.aborted) {
      throw new DOMException('Aborted', 'AbortError');
    }
    try {
      const envelope = await cancellableFirst(
        this.http.get<ApiEnvelope<CertificateVerificationDto>>(url),
        signal,
      );
      return { ok: true, envelope };
    } catch (e) {
      if (e instanceof DOMException && e.name === 'AbortError') {
        throw e;
      }
      return { ok: false, error: toErrorEnvelope(e) };
    }
  }
}

// ponytail: suscripción manual + unsubscribe on abort. Mínimo viable para
// cancelar HTTP en Angular 20 sin fetch paralelo ni wrappers nuevos.
function cancellableFirst<T>(source$: Observable<T>, signal?: AbortSignal): Promise<T> {
  return new Promise<T>((resolve, reject) => {
    if (signal?.aborted) {
      reject(new DOMException('Aborted', 'AbortError'));
      return;
    }
    const sub = source$.subscribe({
      next: (v) => {
        cleanup();
        resolve(v);
      },
      error: (e) => {
        cleanup();
        reject(e);
      },
    });
    const onAbort = () => {
      sub.unsubscribe();
      reject(new DOMException('Aborted', 'AbortError'));
    };
    function cleanup() {
      signal?.removeEventListener('abort', onAbort);
    }
    signal?.addEventListener('abort', onAbort, { once: true });
  });
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