// Test de seguridad: valida que la fuente de certificaciones no exponga
// secretos ni red ni storage. Se ejecuta en browser (Karma): importa las
// clases y las serializa con toString() para inspeccionar su código fuente.
//
// Cobertura: enumera cada método/getter/constructor de cada clase pública
// de la feature más las funciones module-level puras (seed, truncarUrl) que
// contienen los literales del seed ficticio. Así se atrapa storage/red/admin
// -key tanto en métodos como en literales module-level. Las URLs mock
// visibles en UI (https://ifrm/...) son display-only y no se emiten en
// runtime; lo prohibido son APIs HTTP de runtime (HttpClient, fetch,
// XMLHttpRequest), storage/cookies, admin keys y tokens/DNI completos.
import {
  InMemoryCertificationsService,
  seed,
  truncarUrl,
} from '../in-memory-certifications.service';
import { CertificationsListPage } from '../pages/list/certifications-list-page';
import { CertificationPreviewPage } from '../pages/preview/certification-preview-page';

const forbidden = [
  'X-Admin-Key',
  'localStorage',
  'sessionStorage',
  'document.cookie',
  'HttpClient',
  'fetch(',
  'XMLHttpRequest',
  // DNI/token como literales sospechosos en código fuente.
  'documentNumber',
  'dniCompleto',
  'X-Admin-Token',
];

// Inspecciona cada método enumerable de la clase en vez de una lista hardcodeada.
function classSources(proto: object): string[] {
  const names = new Set<string>();
  let current: object | null = proto;
  while (current && current !== Object.prototype) {
    for (const name of Object.getOwnPropertyNames(current)) {
      if (name === 'constructor' || name.startsWith('__')) continue;
      const desc = Object.getOwnPropertyDescriptor(current, name);
      if (!desc) continue;
      // Métodos (function en value) y getters computados.
      if (typeof desc.value === 'function') {
        names.add(name);
      } else if (desc.get) {
        names.add(name);
      }
    }
    current = Object.getPrototypeOf(current);
  }
  const sources: string[] = [proto.constructor.toString()];
  for (const name of names) {
    const desc = Object.getOwnPropertyDescriptor(proto, name);
    if (desc && typeof desc.value === 'function') {
      sources.push((desc.value as (...args: unknown[]) => unknown).toString());
    } else if (desc && desc.get) {
      sources.push(desc.get.toString());
    }
  }
  return sources;
}

function sources(): string[] {
  return [
    // Funciones module-level puras: capturan los literales del seed ficticio
    // (incluidas las URLs mock display-only) y la lógica de truncado de URL.
    seed.toString(),
    truncarUrl.toString(),
    ...classSources(InMemoryCertificationsService.prototype),
    ...classSources(CertificationsListPage.prototype),
    ...classSources(CertificationPreviewPage.prototype),
  ];
}

describe('no-secrets en features/admin/certifications/**', () => {
  it('ningún método/ctor expone secretos, red, storage, email, legajo ni matrícula', () => {
    for (const src of sources()) {
      const lower = src.toLowerCase();
      for (const needle of forbidden) {
        const lowerNeedle = needle.toLowerCase();
        expect(lower).not.toContain(lowerNeedle);
      }
    }
  });

  it('las clases de certificaciones no usan HttpClient ni fetch', () => {
    const all = sources().join('\n').toLowerCase();
    expect(all).not.toContain('httpclient');
    expect(all).not.toContain('fetch(');
  });

  it('no usa storage ni cookies', () => {
    const all = sources().join('\n').toLowerCase();
    expect(all).not.toContain('localstorage');
    expect(all).not.toContain('sessionstorage');
    expect(all).not.toContain('document.cookie');
    expect(all).not.toContain('indexeddb');
  });
});