// Puente mock admin ↔ validación pública (sin dependencia circular de módulos).
// InMemory registra el resolver; MockValidationSource lo consulta.

export type MockAdminLiveEstado = 'vigente' | 'revocado' | 'vencido' | 'borrador';

type Resolver = (token: string) => MockAdminLiveEstado | null;

let liveEstadoResolver: Resolver | null = null;

/** Lo llama el ctor de InMemoryCertificationsService (instancia root). */
export function registerMockAdminLiveEstadoResolver(resolver: Resolver): void {
  liveEstadoResolver = resolver;
}

/** Lo llama MockValidationSource al resolver tokens `prefijo_*-completo`. */
export function resolveMockAdminLiveEstado(token: string): MockAdminLiveEstado | null {
  try {
    return liveEstadoResolver?.(token) ?? null;
  } catch {
    return null;
  }
}

/** Tests. */
export function clearMockAdminLiveEstadoResolver(): void {
  liveEstadoResolver = null;
}
