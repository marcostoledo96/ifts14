// Tokens de demo y fuente mock de validación.
// Ningún token corresponde a datos reales; son fixtures para desbloquear la UI.
// Los tokens `prefijo_demo_*-completo` alinean Copiar link (admin in-memory) con validación pública.
import { ApiEnvelope, ApiErrorEnvelope, CertificateVerificationDto } from './dto';
import { resolveMockAdminLiveEstado } from './mock-admin-bridge';
import { ValidationSource, ValidationSourceResult } from './validation-source';

export type MockToken =
  | 'demo-valido'
  | 'demo-revocado'
  | 'demo-expirado'
  | 'demo-inexistente'
  | 'demo-error-tecnico';

/** Sufijo del token público mock (misma regla que InMemoryCertificationsService). */
export const MOCK_PUBLIC_TOKEN_SUFFIX = '-completo';

/** Arma el path-token que Copiar link / QR usan en mock: `${tokenPrefix}-completo`. */
export function mockPublicValidationToken(tokenPrefix: string): string {
  return `${tokenPrefix}${MOCK_PUBLIC_TOKEN_SUFFIX}`;
}

/** Estado runtime de tokens admin seed para validación pública. */
export type MockAdminPublicStatus = 'vigente' | 'revocado' | 'expirado' | 'borrador';

const MOCK_ADMIN_PUBLIC_STATUS_STORAGE_KEY = 'ifts14.mockAdminPublicStatus.v1';

function readMockAdminPublicStatuses(): Record<string, MockAdminPublicStatus> {
  try {
    let raw: string | null = null;
    if (typeof localStorage !== 'undefined') {
      raw = localStorage.getItem(MOCK_ADMIN_PUBLIC_STATUS_STORAGE_KEY);
    }
    if (!raw && typeof sessionStorage !== 'undefined') {
      raw = sessionStorage.getItem(MOCK_ADMIN_PUBLIC_STATUS_STORAGE_KEY);
    }
    if (!raw) return {};
    const parsed: unknown = JSON.parse(raw);
    if (!parsed || typeof parsed !== 'object' || Array.isArray(parsed)) return {};

    return Object.fromEntries(
      Object.entries(parsed).filter(
        ([, status]) =>
          status === 'vigente' ||
          status === 'revocado' ||
          status === 'expirado' ||
          status === 'borrador',
      ),
    ) as Record<string, MockAdminPublicStatus>;
  } catch {
    return {};
  }
}

/** Borra el estado público mock persistido para que QA restaure el seed. */
export function resetMockAdminPublicStatus(): void {
  try {
    if (typeof localStorage !== 'undefined') {
      localStorage.removeItem(MOCK_ADMIN_PUBLIC_STATUS_STORAGE_KEY);
    }
    if (typeof sessionStorage !== 'undefined') {
      sessionStorage.removeItem(MOCK_ADMIN_PUBLIC_STATUS_STORAGE_KEY);
    }
  } catch {
    /* ignore */
  }
}

/** Persiste el estado público por token para conservarlo durante un F5 y entre pestañas. */
export function setMockAdminPublicStatus(
  tokenPrefix: string,
  status: MockAdminPublicStatus,
): void {
  try {
    const statuses = readMockAdminPublicStatuses();
    statuses[mockPublicValidationToken(tokenPrefix)] = status;
    const json = JSON.stringify(statuses);
    if (typeof localStorage !== 'undefined') {
      localStorage.setItem(MOCK_ADMIN_PUBLIC_STATUS_STORAGE_KEY, json);
    }
    if (typeof sessionStorage !== 'undefined') {
      sessionStorage.setItem(MOCK_ADMIN_PUBLIC_STATUS_STORAGE_KEY, json);
    }
  } catch {
    /* ignore */
  }
}

/** Obtiene el último estado persistido del token público mock. */
export function getMockAdminPublicStatus(token: string): MockAdminPublicStatus | undefined {
  return readMockAdminPublicStatuses()[token];
}

export function isMockToken(token: string): token is MockToken {
  return (
    token === 'demo-valido' ||
    token === 'demo-revocado' ||
    token === 'demo-expirado' ||
    token === 'demo-inexistente' ||
    token === 'demo-error-tecnico'
  );
}

// Exportado para reuso en tests del adapter HTTP (sin duplicar el fixture).
export const VALID_VALID_DTO: CertificateVerificationDto = {
  valid: true,
  status: 'vigente',
  certificateCode: 'CERT-2025-0001',
  student: { displayName: 'Juan Pérez', documentNumber: '12345678' },
  course: {
    name: 'Técnico Superior en Sistemas',
    issuedAt: '2025-03-15',
    attendedDates: ['2025-03-10', '2025-03-12'],
  },
  verifiedAt: '2025-06-29T10:00:00Z',
};

/** Fixture legado sin attendedDates ni documentNumber (certificados previos al modelo curso/alumno). */
export const LEGACY_VALID_DTO: CertificateVerificationDto = {
  valid: true,
  status: 'vigente',
  certificateCode: 'CERT-LEGACY-0001',
  student: { displayName: 'Persona Legado', documentMasked: '12.345.**' },
  course: { name: 'Curso histórico', issuedAt: '2024-01-10' },
  verifiedAt: '2025-06-29T10:00:00Z',
};

/** Cert id 1 del seed admin (Demo Uno) — token de Copiar link en mock. */
export const ADMIN_SEED_CERT1_DTO: CertificateVerificationDto = {
  valid: true,
  status: 'vigente',
  certificateCode: 'IFTS14-CERT-0001',
  student: { displayName: 'Alumno Demo Uno', documentNumber: '12345678' },
  course: {
    name: 'Curso de introducción a la gestión',
    issuedAt: '2026-03-01',
    attendedDates: ['2026-03-02', '2026-03-09', '2026-03-16'],
  },
  verifiedAt: '2026-07-21T10:00:00Z',
};

const ADMIN_SEED_CERT2_DTO: CertificateVerificationDto = {
  valid: true,
  status: 'vigente',
  certificateCode: 'IFTS14-CERT-0002',
  student: { displayName: 'Alumno Demo Dos', documentNumber: '23456789' },
  course: {
    name: 'Curso de herramientas administrativas',
    issuedAt: '2026-04-05',
    attendedDates: ['2026-04-05', '2026-04-12'],
  },
  verifiedAt: '2026-07-21T10:00:00Z',
};

const ADMIN_SEED_CERT6_DTO: CertificateVerificationDto = {
  valid: true,
  status: 'vigente',
  certificateCode: 'IFTS14-CERT-0006',
  student: { displayName: 'Alumno Demo Seis', documentNumber: '67890123' },
  course: {
    name: 'Curso de atención al público',
    issuedAt: '2026-06-01',
    attendedDates: ['2026-06-01', '2026-06-08', '2026-06-15'],
  },
  verifiedAt: '2026-07-21T10:00:00Z',
};

function envelope<T>(data: T, requestId: string): ApiEnvelope<T> {
  return { data, meta: { requestId } };
}

function errorEnvelope(code: string, message: string, requestId: string): ApiErrorEnvelope {
  return { error: { code, message, details: [] }, meta: { requestId } };
}

export function delay(ms: number, signal?: AbortSignal): Promise<void> {
  return new Promise((resolve, reject) => {
    if (signal?.aborted) {
      reject(new DOMException('Aborted', 'AbortError'));
      return;
    }
    const t = setTimeout(resolve, ms);
    signal?.addEventListener(
      'abort',
      () => {
        clearTimeout(t);
        reject(new DOMException('Aborted', 'AbortError'));
      },
      { once: true },
    );
  });
}

/**
 * Une estado vivo (puente InMemory) + sessionStorage.
 * No usar `??`: un live `vigente` (instancia desfasada) taparía un `revocado` persistido.
 */
function coalesceAdminPublicEstado(
  liveEstado: string | null | undefined,
  token: string,
): string | undefined {
  const stored = getMockAdminPublicStatus(token);
  if (liveEstado === 'revocado' || stored === 'revocado') return 'revocado';
  if (
    liveEstado === 'vencido' ||
    liveEstado === 'expirado' ||
    stored === 'expirado'
  ) {
    return 'expirado';
  }
  if (liveEstado === 'borrador' || stored === 'borrador') return 'borrador';
  return liveEstado ?? stored;
}

/** Resuelve tokens del seed admin (`prefijo_demo_*-completo`). Null = no es token de seed. */
function fetchAdminSeedToken(
  token: string,
  liveEstado: string | null | undefined,
): ValidationSourceResult | null {
  const estado = coalesceAdminPublicEstado(liveEstado, token);
  if (estado === 'revocado') {
    return {
      ok: false,
      error: errorEnvelope('CERTIFICATE_REVOKED', 'revocado', 'req-admin-live-revoked'),
    };
  }
  if (estado === 'vencido' || estado === 'expirado') {
    return {
      ok: false,
      error: errorEnvelope('CERTIFICATE_EXPIRED', 'expirado', 'req-admin-live-expired'),
    };
  }
  if (estado === 'borrador') {
    return {
      ok: false,
      error: errorEnvelope('CERTIFICATE_NOT_FOUND', 'no encontrado', 'req-admin-live-draft'),
    };
  }

  switch (token) {
    case mockPublicValidationToken('prefijo_demo_a1b'):
      return { ok: true, envelope: envelope(ADMIN_SEED_CERT1_DTO, 'req-admin-a1b') };
    case mockPublicValidationToken('prefijo_demo_c2d'):
      return { ok: true, envelope: envelope(ADMIN_SEED_CERT2_DTO, 'req-admin-c2d') };
    case mockPublicValidationToken('prefijo_demo_e3f'):
      // Borrador: sin emisión pública.
      return {
        ok: false,
        error: errorEnvelope('CERTIFICATE_NOT_FOUND', 'no encontrado', 'req-admin-e3f'),
      };
    case mockPublicValidationToken('prefijo_demo_g4h'):
      return {
        ok: false,
        error: errorEnvelope('CERTIFICATE_EXPIRED', 'expirado', 'req-admin-g4h'),
      };
    case mockPublicValidationToken('prefijo_demo_i5j'):
      return {
        ok: false,
        error: errorEnvelope('CERTIFICATE_REVOKED', 'revocado', 'req-admin-i5j'),
      };
    case mockPublicValidationToken('prefijo_demo_k6l'):
      return { ok: true, envelope: envelope(ADMIN_SEED_CERT6_DTO, 'req-admin-k6l') };
    default:
      return null;
  }
}

// ponytail: clase concreta en lugar de factory; una sola implementación.
// Fase 3 añadió HttpValidationSource sin tocar ValidationService.
export class MockValidationSource implements ValidationSource {
  async fetch(token: string, signal?: AbortSignal): Promise<ValidationSourceResult> {
    // Simula latencia de red sin inventar HTTP real.
    await delay(0, signal);
    const normalized = token.trim();

    switch (normalized) {
      case 'demo-valido':
        return { ok: true, envelope: envelope(VALID_VALID_DTO, 'req-valido') };
      case 'demo-revocado':
        return {
          ok: false,
          error: errorEnvelope('CERTIFICATE_REVOKED', 'revocado', 'req-revocado'),
        };
      case 'demo-expirado':
        return {
          ok: false,
          error: errorEnvelope('CERTIFICATE_EXPIRED', 'expirado', 'req-expirado'),
        };
      case 'demo-inexistente':
        return {
          ok: false,
          error: errorEnvelope('CERTIFICATE_NOT_FOUND', 'no encontrado', 'req-inexistente'),
        };
      case 'demo-error-tecnico':
        // Sin envelope: simula falla de red / JSON inválido.
        return { ok: false, error: null };
      default: {
        const liveEstado = resolveMockAdminLiveEstado(normalized);
        const admin = fetchAdminSeedToken(normalized, liveEstado);
        if (admin) return admin;
        // Token desconocido tratado como no encontrado (no verificable).
        return {
          ok: false,
          error: errorEnvelope('CERTIFICATE_NOT_FOUND', 'token desconocido', 'req-default'),
        };
      }
    }
  }
}
