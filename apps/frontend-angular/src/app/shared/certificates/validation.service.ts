// Servicio de validación pública. Centraliza la obtención del resultado.
// Usa una ValidationSource inyectable (mock ahora, HTTP en Fase 3).
// La UI no conoce HTTP ni mocks: sólo consume ValidationViewState.
import { Injectable, inject } from '@angular/core';
import { ValidationViewState } from './dto';
import { VALIDATION_SOURCE } from './validation-source';
import { mapResponseToViewState } from './result-mapper';

@Injectable({ providedIn: 'root' })
export class ValidationService {
  private readonly source = inject(VALIDATION_SOURCE);

  async verify(token: string, signal?: AbortSignal): Promise<ValidationViewState> {
    let result;
    try {
      result = await this.source.fetch(token, signal);
    } catch {
      // La fuente rechaza (red caída, excepción inesperada): técnico genérico,
      // sin propagar el reject al resource/loader.
      return { kind: 'technical-error' };
    }
    return mapResponseToViewState(result);
  }
}