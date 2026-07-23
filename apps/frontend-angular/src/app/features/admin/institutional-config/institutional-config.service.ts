// Contrato del servicio de configuración institucional (frontera admin frontend).
// Modelo 1:1 con el DTO del backend PHP (GET/PUT /admin/configuracion-institucional).
// Sin HTTP, storage ni claves. Implementaciones: http-institutional-config.service.ts
// (API real) e in-memory-institutional-config.service.ts (demo useRealApi=false).
import { InjectionToken } from '@angular/core';

export type SystemParameterType = 'texto' | 'textarea' | 'url' | 'email';
export type SystemParameterGroup = 'identidad' | 'certificados' | 'contacto' | 'validacion';

export type SystemParameterKey =
  | 'texto_institucional'
  | 'titulo_certificado'
  | 'texto_qr'
  | 'email_contacto'
  | 'texto_validacion'
  | 'sitio_instituto'
  | 'msg_valido'
  | 'msg_revocado'
  | 'msg_no_encontrado';

export interface SystemParameterEntry {
  readonly value: string;
  readonly type: SystemParameterType;
  readonly group: SystemParameterGroup;
  readonly label: string;
}

export const SYSTEM_PARAMETER_KEYS: readonly SystemParameterKey[] = [
  'texto_institucional',
  'titulo_certificado',
  'texto_qr',
  'email_contacto',
  'texto_validacion',
  'sitio_instituto',
  'msg_valido',
  'msg_revocado',
  'msg_no_encontrado',
] as const;

/** Defaults alineados al catálogo activo (migración 013; sin formato_numero/link_validacion). */
export const SYSTEM_PARAMETER_DEFAULTS: Readonly<
  Record<SystemParameterKey, SystemParameterEntry>
> = {
  texto_institucional: {
    value:
      'El Instituto de Formación Técnica Superior N.° 14 depende de la Dirección de Formación Técnica Superior del Gobierno de la Ciudad de Buenos Aires.',
    type: 'textarea',
    group: 'identidad',
    label: 'Texto institucional base',
  },
  titulo_certificado: {
    value: 'Certificado de Aprobación',
    type: 'texto',
    group: 'certificados',
    label: 'Título del certificado',
  },
  texto_qr: {
    value:
      'Escaneá el código para verificar la autenticidad de este certificado en el sitio oficial del IFTS N.° 14.',
    type: 'textarea',
    group: 'certificados',
    label: 'Texto de validación QR',
  },
  email_contacto: {
    value: 'contacto@example.invalid',
    type: 'email',
    group: 'contacto',
    label: 'Email de contacto institucional',
  },
  texto_validacion: {
    value:
      'Este espacio permite verificar la validez de los certificados emitidos por el IFTS N.° 14.',
    type: 'textarea',
    group: 'contacto',
    label: 'Texto aclaratorio (validación pública)',
  },
  sitio_instituto: {
    value: 'www.ifts14.edu.ar',
    type: 'url',
    group: 'contacto',
    label: 'Enlace al sitio del instituto',
  },
  msg_valido: {
    value: 'Certificado válido y vigente, emitido por el IFTS N.° 14.',
    type: 'textarea',
    group: 'validacion',
    label: 'Mensaje — Certificado válido',
  },
  msg_revocado: {
    value: 'Este certificado fue revocado por la institución y ya no es válido.',
    type: 'textarea',
    group: 'validacion',
    label: 'Mensaje — Certificado revocado',
  },
  msg_no_encontrado: {
    value: 'No se encontró ningún certificado asociado a este código.',
    type: 'textarea',
    group: 'validacion',
    label: 'Mensaje — Token no encontrado',
  },
};

export interface InstitutionalConfig {
  readonly institutionName: string;
  readonly certificateText: string;
  readonly rectorName: string;
  readonly rectorRole: string;
  readonly advisorName: string;
  readonly advisorRole: string;
  readonly rectorSignaturePresent: boolean;
  readonly advisorSignaturePresent: boolean;
  readonly parameters: Readonly<Record<SystemParameterKey, SystemParameterEntry>>;
  // Solo lectura: la fija el backend al guardar.
  readonly updatedAt: string | null;
}

/** Body de escritura: parámetros como mapa plano clave → valor. */
export interface InstitutionalConfigWrite {
  readonly institutionName: string;
  readonly certificateText: string;
  readonly rectorName: string;
  readonly rectorRole: string;
  readonly advisorName: string;
  readonly advisorRole: string;
  readonly parameters: Readonly<Partial<Record<SystemParameterKey, string>>>;
}

// Límites de longitud alineados con la validación del backend PHP.
export const INSTITUTIONAL_CONFIG_LIMITS = {
  name: 160,
  role: 80,
  certificateText: 255,
  parameterText: 500,
  parameterTextarea: 2000,
} as const;

export function emptyParameters(): Record<SystemParameterKey, SystemParameterEntry> {
  const out = {} as Record<SystemParameterKey, SystemParameterEntry>;
  for (const key of SYSTEM_PARAMETER_KEYS) {
    out[key] = { ...SYSTEM_PARAMETER_DEFAULTS[key] };
  }
  return out;
}

export function flattenParameterValues(
  parameters: Readonly<Record<SystemParameterKey, SystemParameterEntry>>,
): Record<SystemParameterKey, string> {
  const out = {} as Record<SystemParameterKey, string>;
  for (const key of SYSTEM_PARAMETER_KEYS) {
    out[key] = parameters[key].value;
  }
  return out;
}

export type SignatureRole = 'rector' | 'asesor';

export interface InstitutionalConfigService {
  obtener(): Promise<InstitutionalConfig>;
  guardar(payload: InstitutionalConfigWrite): Promise<InstitutionalConfig>;
  /** POST multipart inmediato (Opción A); no marca dirty del formulario de textos. */
  subirFirma(role: SignatureRole, file: File): Promise<InstitutionalConfig>;
  quitarFirma(role: SignatureRole): Promise<InstitutionalConfig>;
  /** Preview autenticado; el llamador debe revocar el object URL. */
  previewFirma(role: SignatureRole): Promise<Blob>;
}

// ponytail: token único para inyectar la implementación (mock o HTTP).
export const INSTITUTIONAL_CONFIG_SOURCE =
  new InjectionToken<InstitutionalConfigService>('INSTITUTIONAL_CONFIG_SOURCE');
