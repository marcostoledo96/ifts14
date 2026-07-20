/** Rutas públicas de marca institucional (archivos en `public/brand/`). */
export const INSTITUTIONAL_BRAND = {
  logoIfts: 'brand/logo-ifts.webp',
  buenosAiresAprende: 'brand/buenos-aires-aprende.webp',
  buenosAiresCiudad: 'brand/buenos-aires-ciudad.webp',
  escudoCaba: 'brand/escudo-caba.webp',
} as const;

export interface InstitutionalLogo {
  readonly id: string;
  readonly nombre: string;
  readonly detalle: string;
  readonly src: string;
}

/** Logos fijos del sistema: sin carga ni edición desde Configuración. */
export const INSTITUTIONAL_LOGOS: readonly InstitutionalLogo[] = [
  {
    id: 'ifts',
    nombre: 'Logo IFTS N.° 14',
    detalle: 'Marca principal del instituto',
    src: INSTITUTIONAL_BRAND.logoIfts,
  },
  {
    id: 'ba-aprende',
    nombre: 'Buenos Aires Aprende',
    detalle: 'Programa de formación',
    src: INSTITUTIONAL_BRAND.buenosAiresAprende,
  },
  {
    id: 'ba-ciudad',
    nombre: 'Ciudad de Buenos Aires',
    detalle: 'Gobierno de la Ciudad',
    src: INSTITUTIONAL_BRAND.buenosAiresCiudad,
  },
  {
    id: 'escudo-caba',
    nombre: 'Escudo CABA',
    detalle: 'Escudo de la Ciudad Autónoma',
    src: INSTITUTIONAL_BRAND.escudoCaba,
  },
];

/** Logos de acompañamiento (sin el monograma IFTS). */
export const INSTITUTIONAL_PARTNER_LOGOS: readonly InstitutionalLogo[] =
  INSTITUTIONAL_LOGOS.filter((logo) => logo.id !== 'ifts');
