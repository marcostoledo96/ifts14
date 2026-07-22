// Implementación en memoria de CertificationsService.
// Seed ficticio, institucionalmente seguro: DNI completo ficticio en UI admin,
// sin emails reales, tokens completos, matrículas ni nombres reales.
// La revocación pública se conserva por sesión para soportar QA con F5.
import { Injectable } from '@angular/core';
import {
  AuditEvent,
  Certificacion,
  CertificacionDetalle,
  CertificacionesFiltros,
  EmisionResult,
  EmitirCertificacionPayload,
  EntregaManualDto,
  EstadoCertificado,
  PdfStatus,
  RegenerarPdfResult,
} from './certifications.models';
import { CertificationsService } from './certifications.service';
import {
  getMockAdminPublicStatus,
  mockPublicValidationToken,
  resetMockAdminPublicStatus,
  setMockAdminPublicStatus,
} from '../../../shared/certificates/mock-tokens';
import { registerMockAdminLiveEstadoResolver } from '../../../shared/certificates/mock-admin-bridge';
import { qrPngBlobFromUrl } from './qr-png';
import { buildMockCertificatePdf } from './mock-certificate-pdf';
import { truncarUrl } from './url-publica';

export { URL_PUBLICA_MAX, truncarUrl } from './url-publica';

/** URL pública canónica mock (dominio de producción; en local reemplazar host). */
function mockPublicValidationUrl(tokenPrefix: string): string {
  return `https://ifts14.edu.ar/certificados/validar/${mockPublicValidationToken(tokenPrefix)}`;
}

// ponytail: seed estático module-level; la instancia lo clona en ctor
// para que cada test arranque con datos limpios sin compartir estado.
export function seed(): CertificacionDetalle[] {
  return [
    {
      id: 1,
      numero: 'IFTS14-CERT-0001',
      nombreAlumno: 'Alumno Demo Uno',
      cursoNombre: 'Curso de introducción a la gestión',
      estado: 'vigente',
      documentMasked: '12345678',
      tokenPrefix: 'prefijo_demo_a1b',
      emitidoEn: '2026-03-01',
      venceEn: '2027-03-01',
      alumnoId: 1,
      cursoId: 1,
      publicValidationUrl: 'https://ifrm/validar/prefijo_demo_a1b…',
      attendedDates: ['2026-03-02', '2026-03-09', '2026-03-16'],
      auditEvents: [
        { at: '2026-03-01', accion: 'emision', detalle: 'Emisión mock.' },
      ],
    },
    {
      id: 2,
      numero: 'IFTS14-CERT-0002',
      nombreAlumno: 'Alumno Demo Dos',
      cursoNombre: 'Curso de herramientas administrativas',
      estado: 'vigente',
      documentMasked: '23456789',
      tokenPrefix: 'prefijo_demo_c2d',
      emitidoEn: '2026-04-05',
      venceEn: '2027-04-05',
      alumnoId: 2,
      cursoId: 2,
      publicValidationUrl: 'https://ifrm/validar/prefijo_demo_c2d…',
      attendedDates: ['2026-04-05', '2026-04-12'],
      auditEvents: [
        { at: '2026-04-05', accion: 'emision', detalle: 'Emisión mock.' },
      ],
    },
    {
      id: 3,
      numero: 'IFTS14-CERT-0003',
      nombreAlumno: 'Alumno Demo Tres',
      cursoNombre: 'Curso de prácticas documentales',
      estado: 'borrador',
      documentMasked: '34567890',
      tokenPrefix: 'prefijo_demo_e3f',
      emitidoEn: null,
      venceEn: null,
      alumnoId: 3,
      cursoId: 3,
      publicValidationUrl: 'https://ifrm/validar/prefijo_demo_e3f…',
      attendedDates: ['2026-05-04'],
      auditEvents: [
        { at: '2026-05-01', accion: 'borrador', detalle: 'Borrador mock.' },
      ],
    },
    {
      id: 4,
      numero: 'IFTS14-CERT-0004',
      nombreAlumno: 'Alumno Demo Cuatro',
      cursoNombre: 'Curso de procedimientos básicos',
      estado: 'vencido',
      documentMasked: '45678901',
      tokenPrefix: 'prefijo_demo_g4h',
      emitidoEn: '2025-09-01',
      venceEn: '2026-09-01',
      alumnoId: 4,
      cursoId: 4,
      publicValidationUrl: 'https://ifrm/validar/prefijo_demo_g4h…',
      attendedDates: ['2025-09-01', '2025-09-08'],
      auditEvents: [
        { at: '2025-09-01', accion: 'emision', detalle: 'Emisión mock.' },
        { at: '2026-09-02', accion: 'vencimiento', detalle: 'Vencimiento automático.' },
      ],
    },
    {
      id: 5,
      numero: 'IFTS14-CERT-0005',
      nombreAlumno: 'Alumno Demo Cinco',
      cursoNombre: 'Curso de registros y archivo',
      estado: 'revocado',
      documentMasked: '56789012',
      tokenPrefix: 'prefijo_demo_i5j',
      emitidoEn: '2025-06-10',
      venceEn: '2026-06-10',
      alumnoId: 5,
      cursoId: 5,
      publicValidationUrl: 'https://ifrm/validar/prefijo_demo_i5j…',
      attendedDates: ['2025-06-10'],
      auditEvents: [
        { at: '2025-06-10', accion: 'emision', detalle: 'Emisión mock.' },
        { at: '2025-07-15', accion: 'revocacion', detalle: 'Revocación por solicitud.' },
      ],
    },
    {
      id: 6,
      numero: 'IFTS14-CERT-0006',
      nombreAlumno: 'Alumno Demo Seis',
      cursoNombre: 'Curso de atención al público',
      estado: 'vigente',
      documentMasked: '67890123',
      tokenPrefix: 'prefijo_demo_k6l',
      emitidoEn: '2026-06-01',
      venceEn: '2027-06-01',
      alumnoId: 6,
      cursoId: 6,
      publicValidationUrl: 'https://ifrm/validar/prefijo_demo_k6l…',
      attendedDates: ['2026-06-01', '2026-06-08', '2026-06-15'],
      auditEvents: [
        { at: '2026-06-01', accion: 'emision', detalle: 'Emisión mock.' },
      ],
    },
  ];
}

function clone<T>(value: T): T {
  return JSON.parse(JSON.stringify(value)) as T;
}

@Injectable({ providedIn: 'root' })
export class InMemoryCertificationsService implements CertificationsService {
  private readonly certificados: CertificacionDetalle[] = clone(seed());
  private nextId = 100;
  /** Pares alumnoId:cursoId con certificado vigente (para 409 mock). */
  private readonly vigentesPorPar = new Map<string, number>();

  constructor() {
    this.hydratePublicStatuses();
    this.reindexVigentes();
    // Validación pública consulta esta misma instancia (useExisting en admin).
    registerMockAdminLiveEstadoResolver((token) => this.estadoPorTokenPublico(token));
  }

  /** Restaura el seed original (QA: cert 2 vuelve a vigente). */
  resetToSeed(): void {
    resetMockAdminPublicStatus();
    const fresh = clone(seed());
    this.certificados.splice(0, this.certificados.length, ...fresh);
    this.nextId = 100;
    this.reindexVigentes();
    registerMockAdminLiveEstadoResolver((token) => this.estadoPorTokenPublico(token));
  }

  /** Aplica al seed los estados públicos persistidos durante esta sesión. */
  private hydratePublicStatuses(): void {
    for (const [index, certificado] of this.certificados.entries()) {
      const status = getMockAdminPublicStatus(
        mockPublicValidationToken(certificado.tokenPrefix),
      );
      if (status) {
        this.certificados[index] = {
          ...certificado,
          estado: status === 'expirado' ? 'vencido' : status,
        };
      }
    }
  }

  private reindexVigentes(): void {
    this.vigentesPorPar.clear();
    for (const c of this.certificados) {
      if (c.estado === 'vigente' && c.alumnoId != null && c.cursoId != null) {
        this.vigentesPorPar.set(this.pairKey(c.alumnoId, c.cursoId), c.id);
      }
    }
  }

  private pairKey(alumnoId: number, cursoId: number): string {
    return `${alumnoId}:${cursoId}`;
  }

  /**
   * Estado vivo del seed admin por token público (`prefijo_…-completo`).
   * Lo usa MockValidationSource para alinear validación pública con revocaciones.
   */
  estadoPorTokenPublico(token: string): EstadoCertificado | null {
    const normalized = token.trim();
    const found = this.certificados.find(
      (c) => mockPublicValidationToken(c.tokenPrefix) === normalized,
    );
    return found?.estado ?? null;
  }

  listar(filtros?: CertificacionesFiltros): Promise<readonly Certificacion[]> {
    let list: Certificacion[] = this.certificados.map(
      ({ auditEvents: _a, publicValidationUrl: _u, attendedDates: _d, ...c }) => c,
    );
    if (filtros?.estado) {
      list = list.filter((c) => c.estado === filtros.estado);
    }
    if (filtros?.curso) {
      list = list.filter((c) => c.cursoNombre === filtros.curso);
    }
    if (filtros?.cursoId != null) {
      list = list.filter((c) => c.cursoId === filtros.cursoId);
    }
    if (filtros?.alumnoId != null) {
      list = list.filter((c) => c.alumnoId === filtros.alumnoId);
    }
    if (filtros?.q) {
      const q = filtros.q.trim().toLowerCase();
      if (q) {
        list = list.filter(
          (c) =>
            c.nombreAlumno.toLowerCase().includes(q) ||
            c.cursoNombre.toLowerCase().includes(q) ||
            c.documentMasked.toLowerCase().includes(q) ||
            c.numero.toLowerCase().includes(q),
        );
      }
    }
    return Promise.resolve(list);
  }

  obtener(id: number): Promise<CertificacionDetalle> {
    const found = this.certificados.find((c) => c.id === id);
    if (!found) {
      return Promise.reject(new Error(`Certificación no encontrada: ${id}`));
    }
    return Promise.resolve({
      ...clone(found),
      publicValidationUrl: truncarUrl(found.publicValidationUrl),
      auditEvents: clone(found.auditEvents),
      attendedDates: clone(found.attendedDates),
    });
  }

  obtenerEntregaManual(id: number): Promise<EntregaManualDto> {
    const found = this.certificados.find((c) => c.id === id);
    if (!found) {
      return Promise.reject(new Error(`Certificación no encontrada: ${id}`));
    }
    // ponytail: mock construye URL canónica a partir del seed; pdfStatus 'valid' salvo id 4 (vencido).
    const pdfStatus: PdfStatus = found.id === 4 ? 'outdated' : 'valid';
    return Promise.resolve({
      certificadoId: found.id,
      publicValidationUrl: mockPublicValidationUrl(found.tokenPrefix),
      pdfDownloadUrl: `${found.id}/pdf`,
      tokenPrefix: found.tokenPrefix,
      pdfAvailable: found.estado !== 'borrador',
      pdfStatus,
    });
  }

  async descargarQrPng(id: number): Promise<Blob> {
    const found = this.certificados.find((c) => c.id === id);
    if (!found) {
      return Promise.reject(new Error(`Certificación no encontrada: ${id}`));
    }
    // Misma URL canónica que entrega-manual; PNG escaneable (no stub 1×1).
    return qrPngBlobFromUrl(mockPublicValidationUrl(found.tokenPrefix));
  }

  descargarPdf(id: number): Promise<Blob> {
    const found = this.certificados.find((c) => c.id === id);
    if (!found) {
      return Promise.reject(new Error(`Certificación no encontrada: ${id}`));
    }
    // PDF abríble para QA local (no stub inválido).
    return Promise.resolve(
      buildMockCertificatePdf({
        numero: found.numero,
        nombreAlumno: found.nombreAlumno,
        cursoNombre: found.cursoNombre,
        documentMasked: found.documentMasked,
        emitidoEn: found.emitidoEn,
        validationUrl: mockPublicValidationUrl(found.tokenPrefix),
      }),
    );
  }

  contar(): Promise<number> {
    return Promise.resolve(this.certificados.length);
  }

  regenerarPdf(id: number): Promise<RegenerarPdfResult> {
    const found = this.certificados.find((c) => c.id === id);
    if (!found) {
      return Promise.reject(new Error(`Certificación no encontrada: ${id}`));
    }
    // ponytail: mock simula regeneración exitosa. Marca pdfStatus 'valid'
    // y devuelve los datos de entrega como entregaManual.
    return Promise.resolve({
      regenerado: true,
      publicValidationUrl: mockPublicValidationUrl(found.tokenPrefix),
      pdfDownloadUrl: `${found.id}/pdf`,
      pdfStatus: 'valid' as PdfStatus,
    });
  }

  revocar(id: number, motivo: string): Promise<void> {
    return new Promise((resolve, reject) => {
      // Simular latencia de red/operación costosa (900ms para mock, según v0)
      setTimeout(() => {
        const index = this.certificados.findIndex((c) => c.id === id);
        if (index === -1) {
          return reject(new Error(`Certificación no encontrada: ${id}`));
        }
        if (this.certificados[index].estado !== 'vigente') {
          return reject(new Error('Certificado no revocable.'));
        }
        const found = clone(this.certificados[index]) as any;
        found.estado = 'revocado';
        
        const now = new Date();
        const year = now.getFullYear();
        const month = String(now.getMonth() + 1).padStart(2, '0');
        const day = String(now.getDate()).padStart(2, '0');
        
        found.auditEvents = [
          {
            at: `${year}-${month}-${day}`, // As in mock seed
            accion: 'revocacion',
            detalle: motivo
          },
          ...found.auditEvents
        ];
        
        this.certificados[index] = found;
        setMockAdminPublicStatus(found.tokenPrefix, found.estado);
        for (const [key, certId] of this.vigentesPorPar) {
          if (certId === id) this.vigentesPorPar.delete(key);
        }
        resolve();
      }, 900);
    });
  }

  emitir(payload: EmitirCertificacionPayload): Promise<EmisionResult> {
    const key = this.pairKey(payload.alumnoId, payload.cursoId);
    if (this.vigentesPorPar.has(key)) {
      return Promise.reject(
        Object.assign(new Error('Ya existe un certificado vigente para este alumno y curso.'), {
          status: 409,
          error: { code: 'CERTIFICATE_ALREADY_EXISTS' },
        }),
      );
    }
    const id = this.nextId++;
    const code = `IFTS14-CERT-${String(id).padStart(4, '0')}`;
    const tokenPrefix = `prefijo_demo_${id.toString(36).padStart(3, '0').slice(-3)}`;
    const displayName = `Alumno Demo ${id}`;
    const documentMasked = '11999888';
    const courseName = `Curso mock ${payload.cursoId}`;
    const detalle: CertificacionDetalle = {
      id,
      numero: code,
      nombreAlumno: displayName,
      cursoNombre: courseName,
      estado: 'vigente',
      documentMasked,
      tokenPrefix,
      emitidoEn: payload.issuedAt,
      venceEn: payload.expiresAt,
      alumnoId: payload.alumnoId,
      cursoId: payload.cursoId,
      publicValidationUrl: truncarUrl(`https://ifrm/validar/${tokenPrefix}…`),
      attendedDates: [],
      auditEvents: [{ at: payload.issuedAt, accion: 'emision', detalle: 'Emisión mock.' }],
    };
    this.certificados.push(detalle);
    this.vigentesPorPar.set(key, id);
    return Promise.resolve({
      id,
      certificateCode: code,
      status: 'vigente',
      student: { displayName, documentMasked },
      course: { name: courseName },
      issuedAt: payload.issuedAt,
      expiresAt: payload.expiresAt,
      tokenPrefix,
      publicValidationUrl: mockPublicValidationUrl(tokenPrefix),
      pdfDownloadUrl: `/admin/certificados/${id}/pdf`,
    });
  }
}
