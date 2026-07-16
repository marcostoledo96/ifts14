import {
  ChangeDetectionStrategy,
  Component,
  computed,
  effect,
  inject,
  input,
  signal,
  untracked,
} from '@angular/core';
import { RouterLink } from '@angular/router';
import { CERTIFICATIONS_SOURCE } from '../../certifications.service';
import { CertificacionDetalle, EstadoCertificado } from '../../certifications.models';

type EstadoPresentacion = {
  clave: Exclude<EstadoCertificado, 'vigente'>;
  marca: string;
  titulo: string;
  detalle: string;
};

// Vista previa imprimible mock-only. window.print() es la única API de
// impresión; el QR/token son permanentes (D0).
@Component({
  selector: 'app-certification-pdf-preview-page',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterLink],
  templateUrl: './certification-pdf-preview-page.html',
  styleUrl: './certification-pdf-preview-page.css',
})
export class CertificationPdfPreviewPage {
  readonly id = input<string>('');
  private readonly certs = inject(CERTIFICATIONS_SOURCE);

  readonly detalle = signal<CertificacionDetalle | null>(null);
  readonly error = signal('');
  readonly cargando = signal(true);
  readonly printFeedback = signal('');

  // Id numérico validado. Replica el patrón de F4-01: rechaza "0x1", "1e0",
  // "0", vacío y no decimales que Number() coercería (design.md decisión 2).
  readonly certId = computed<number | null>(() => {
    const raw = this.id().trim();
    if (!raw) return null;
    if (!/^[1-9]\d*$/.test(raw)) return null;
    const n = Number(raw);
    return Number.isNaN(n) || n <= 0 ? null : n;
  });

  readonly numeroExpediente = computed(() => {
    const id = this.certId();
    if (id === null) return '';
    return `IFTS14-CERT-${String(id).padStart(4, '0')}`;
  });

  readonly emisionLarga = computed(() => {
    const d = this.detalle();
    if (!d?.emitidoEn) return '';
    const fmt = new Intl.DateTimeFormat('es-AR', { day: 'numeric', month: 'long', year: 'numeric' });
    return fmt.format(parseISO(d.emitidoEn));
  });

  readonly estadoPresentacion = computed<EstadoPresentacion | null>(() => {
    switch (this.detalle()?.estado) {
      case 'borrador':
        return {
          clave: 'borrador',
          marca: 'BORRADOR',
          titulo: 'Certificado borrador.',
          detalle: 'Este documento aún no tiene validez.',
        };
      case 'vencido':
        return {
          clave: 'vencido',
          marca: 'VENCIDO',
          titulo: 'Certificado vencido.',
          detalle: 'La vigencia del documento finalizó.',
        };
      case 'revocado':
        return {
          clave: 'revocado',
          marca: 'REVOCADO',
          titulo: 'Certificación revocada.',
          detalle: 'El documento carece de validez.',
        };
      default:
        return null;
    }
  });

  formatearFechaAsistida(fecha: string): string {
    return fecha;
  }

  // QR decorativo: 64 celdas (8x8) sin datos personales (design.md decisión 3).
  readonly qrCells: readonly number[] = [
    1, 1, 1, 0, 1, 0, 1, 1, 1, 1, 0, 1, 1, 0, 0, 1, 0, 1, 1, 0, 1, 0, 1, 1, 0,
    1, 1, 0, 1, 1, 1, 0, 0, 1, 0, 0, 1, 0, 1, 1, 1, 0, 1, 0, 1, 1, 0, 1, 1, 0,
    1, 1, 1, 0, 1, 0, 0, 1, 1, 0, 1, 0, 1, 1,
  ];

  // ponytail: generación de carga para descartar stale en route reuse.
  private loadGen = 0;

  constructor() {
    effect(() => {
      this.id();
      untracked(() => void this.load());
    });
  }

  async load(): Promise<void> {
    const gen = ++this.loadGen;
    const cid = this.certId();
    this.detalle.set(null);
    this.error.set('');
    this.cargando.set(true);
    this.printFeedback.set('');
    if (cid === null) {
      if (gen === this.loadGen) this.error.set('Certificación no encontrada.');
      this.cargando.set(false);
      return;
    }
    try {
      const det = await this.certs.obtener(cid);
      if (gen !== this.loadGen) return;
      this.detalle.set(det);
    } catch (e) {
      if (gen === this.loadGen) this.error.set((e as Error).message);
    } finally {
      if (gen === this.loadGen) this.cargando.set(false);
    }
  }

  // Impresión nativa con guard de browser. Difiere window.print() al siguiente
  // frame vía requestAnimationFrame para que la live region se anuncie antes
  // del diálogo bloqueante. El chrome del AdminShell se oculta vía CSS
  // @media print en admin-shell.css (estable, no depende de manipulación DOM).
  imprimir(): void {
    if (typeof window === 'undefined' || typeof window.print !== 'function') {
      this.printFeedback.set('Impresión no disponible en este entorno.');
      return;
    }
    this.printFeedback.set('Documento listo para enviar a la impresora.');
    requestAnimationFrame(() => {
      try {
        window.print();
      } catch {
        this.printFeedback.set('No se pudo abrir el diálogo de impresión.');
      }
    });
  }
}

// parseISO: crea una Date en hora local desde 'YYYY-MM-DD' para evitar el
// drift UTC de new Date(isoString) en zonas horarias negativas. Mismo
// patrón que muestra_pagina/components/admin/vista-previa-pdf.tsx.
function parseISO(iso: string): Date {
  const [y, m, d] = iso.split('-').map(Number);
  return new Date(y, m - 1, d);
}
