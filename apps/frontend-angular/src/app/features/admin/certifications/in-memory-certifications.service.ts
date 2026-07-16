// Implementación en memoria de CertificationsService.
// Seed ficticio, institucionalmente seguro: sin DNI, emails, tokens,
// matrículas ni nombres reales. Mutaciones viven solo en la instancia
// y se pierden al recargar. Ver spec admin-certifications-frontend.
import { Injectable } from '@angular/core';
import {
  AuditEvent,
  Certificacion,
  CertificacionDetalle,
  CertificacionesFiltros,
  EntregaManualDto,
  EstadoCertificado,
  PdfStatus,
  RegenerarPdfResult,
} from './certifications.models';
import { CertificationsService } from './certifications.service';

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
      documentMasked: '12****34',
      tokenPrefix: 'prefijo_demo_a1b',
      emitidoEn: '2026-03-01',
      venceEn: '2027-03-01',
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
      documentMasked: '34****56',
      tokenPrefix: 'prefijo_demo_c2d',
      emitidoEn: '2026-04-05',
      venceEn: '2027-04-05',
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
      documentMasked: '56****78',
      tokenPrefix: 'prefijo_demo_e3f',
      emitidoEn: null,
      venceEn: null,
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
      documentMasked: '78****90',
      tokenPrefix: 'prefijo_demo_g4h',
      emitidoEn: '2025-09-01',
      venceEn: '2026-09-01',
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
      documentMasked: '90****12',
      tokenPrefix: 'prefijo_demo_i5j',
      emitidoEn: '2025-06-10',
      venceEn: '2026-06-10',
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
      documentMasked: '23****45',
      tokenPrefix: 'prefijo_demo_k6l',
      emitidoEn: '2026-06-01',
      venceEn: '2027-06-01',
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

// Límite de visualización de la URL pública mock para no exponer el token completo.
export const URL_PUBLICA_MAX = 60;
// Espacio reservado para el ellipsis al truncar.
const URL_PUBLICA_SLICE = URL_PUBLICA_MAX - 3;

export function truncarUrl(url: string): string {
  return url.length <= URL_PUBLICA_MAX ? url : url.slice(0, URL_PUBLICA_SLICE) + '…';
}

@Injectable({ providedIn: 'root' })
export class InMemoryCertificationsService implements CertificationsService {
  private readonly certificados: CertificacionDetalle[] = clone(seed());

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
      publicValidationUrl: `https://ifts14.edu.ar/certificados/validar/${found.tokenPrefix}-completo`,
      pdfDownloadUrl: `${found.id}/pdf`,
      tokenPrefix: found.tokenPrefix,
      pdfAvailable: found.estado !== 'borrador',
      pdfStatus,
    });
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
      publicValidationUrl: `https://ifts14.edu.ar/certificados/validar/${found.tokenPrefix}-completo`,
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
        if (this.certificados[index].estado === 'revocado') {
          return reject(new Error('La certificación ya se encuentra revocada.'));
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
        resolve();
      }, 900);
    });
  }
}
