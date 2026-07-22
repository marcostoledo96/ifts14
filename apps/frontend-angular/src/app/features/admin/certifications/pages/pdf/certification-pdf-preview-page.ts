import {
  ChangeDetectionStrategy,
  Component,
  computed,
  DestroyRef,
  effect,
  ElementRef,
  inject,
  input,
  signal,
  untracked,
  viewChild,
} from '@angular/core';
import { RouterLink } from '@angular/router';
import html2canvas from 'html2canvas-pro';
import { jsPDF } from 'jspdf';
import { INSTITUTIONAL_BRAND } from '../../../../../shared/brand/institutional-brand';
import { CERTIFICATIONS_SOURCE } from '../../certifications.service';
import { CertificacionDetalle, EstadoCertificado } from '../../certifications.models';
import { truncarUrl } from '../../url-publica';
import { qrPngBlobFromUrl } from '../../qr-png';
import { UiSpinner } from '../../../../../shared/ui/ui-spinner';

type EstadoPresentacion = {
  clave: Exclude<EstadoCertificado, 'vigente'>;
  marca: string;
  titulo: string;
  detalle: string;
};

// Vista previa imprimible. Impresión nativa + descarga PDF del folio visible
// (misma apariencia que la previsualización). QR real vía descargarQrPng.
@Component({
  selector: 'app-certification-pdf-preview-page',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterLink, UiSpinner],
  templateUrl: './certification-pdf-preview-page.html',
  styleUrl: './certification-pdf-preview-page.css',
})
export class CertificationPdfPreviewPage {
  readonly id = input<string>('');
  private readonly certs = inject(CERTIFICATIONS_SOURCE);
  private readonly destroyRef = inject(DestroyRef);
  private readonly host = inject(ElementRef<HTMLElement>);

  /** Folio visible a exportar con Descargar PDF (ElementRef nativo). */
  readonly folioRef = viewChild<ElementRef<HTMLElement>>('folio');

  readonly brand = INSTITUTIONAL_BRAND;

  readonly detalle = signal<CertificacionDetalle | null>(null);
  readonly error = signal('');
  readonly cargando = signal(true);
  readonly printFeedback = signal('');
  readonly descargando = signal(false);
  readonly downloadFeedback = signal('');

  /** Object URL del PNG de validación (revocado en destroy / reload). */
  readonly qrSrc = signal<string | null>(null);
  /** URL canónica de validación (entrega-manual), no la truncada del detalle. */
  readonly validacionUrl = signal('');
  /** Vista truncada para UI; QR usa la canónica completa. */
  readonly validacionUrlMostrada = computed(() => {
    const canonica = this.validacionUrl().trim();
    if (canonica) return truncarUrl(canonica);
    const detalleUrl = this.detalle()?.publicValidationUrl?.trim() ?? '';
    return detalleUrl ? truncarUrl(detalleUrl) : '';
  });
  readonly qrError = signal('');

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

  /** Filename semántico: cert-{codigo}.pdf */
  readonly pdfFilename = computed(() => {
    const raw = this.numeroExpediente() || 'certificado';
    const safe = raw.replace(/[^A-Za-z0-9._-]+/g, '-').replace(/^-+|-+$/g, '') || 'certificado';
    return `cert-${safe}.pdf`;
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

  // ponytail: generación de carga para descartar stale en route reuse.
  private loadGen = 0;
  private downloadTimer: ReturnType<typeof setTimeout> | null = null;
  private qrObjectUrl: string | null = null;

  constructor() {
    this.destroyRef.onDestroy(() => this.revokeQrUrl());
    effect(() => {
      this.id();
      untracked(() => void this.load());
    });
  }

  private revokeQrUrl(): void {
    if (this.qrObjectUrl) {
      URL.revokeObjectURL(this.qrObjectUrl);
      this.qrObjectUrl = null;
    }
    this.qrSrc.set(null);
  }

  async load(): Promise<void> {
    const gen = ++this.loadGen;
    const cid = this.certId();
    this.detalle.set(null);
    this.error.set('');
    this.cargando.set(true);
    this.printFeedback.set('');
    this.downloadFeedback.set('');
    this.qrError.set('');
    this.validacionUrl.set('');
    this.revokeQrUrl();
    if (cid === null) {
      if (gen === this.loadGen) this.error.set('Certificación no encontrada.');
      this.cargando.set(false);
      return;
    }
    try {
      const det = await this.certs.obtener(cid);
      if (gen !== this.loadGen) return;
      this.detalle.set(det);
      // URL + QR desde entrega-manual (detalle no trae URL pública canónica).
      void this.cargarValidacion(cid, gen, '');
    } catch (e) {
      if (gen === this.loadGen) this.error.set((e as Error).message);
    } finally {
      if (gen === this.loadGen) this.cargando.set(false);
    }
  }

  private async cargarValidacion(
    cid: number,
    gen: number,
    urlDetalle: string,
  ): Promise<void> {
    let url = urlDetalle.trim();
    // QR del servicio en paralelo con entrega-manual (no esperar en serie).
    const qrSvcPromise = this.certs.descargarQrPng(cid).catch(() => null as Blob | null);

    try {
      const ent = await this.certs.obtenerEntregaManual(cid);
      const canonica = ent.publicValidationUrl?.trim();
      if (canonica) url = canonica;
    } catch {
      // Mantener URL del detalle si entrega-manual falla.
    }
    if (gen !== this.loadGen) return;
    this.validacionUrl.set(url);

    try {
      let blob: Blob | null = null;
      const fromSvc = await qrSvcPromise;
      if (fromSvc && fromSvc.size >= 200) blob = fromSvc;
      if (!blob && url) {
        blob = await qrPngBlobFromUrl(url);
      }
      if (gen !== this.loadGen) return;
      if (!blob) {
        this.qrError.set('No se pudo cargar el código QR.');
        return;
      }
      this.revokeQrUrl();
      this.qrObjectUrl = URL.createObjectURL(blob);
      this.qrSrc.set(this.qrObjectUrl);
      this.qrError.set('');
    } catch {
      if (gen === this.loadGen) this.qrError.set('No se pudo cargar el código QR.');
    }
  }

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

  /**
   * Exporta el folio visible a PDF A4 apaisado (misma apariencia que la
   * previsualización / impresión). No usa el stub/API binario en esta pantalla.
   */
  async descargarPdf(): Promise<void> {
    if (this.descargando()) return;
    this.descargando.set(true);
    this.downloadFeedback.set('');
    try {
      await this.exportarFolioVisibleComoPdf();
      this.downloadFeedback.set('Se descargó el PDF en formato A4 (apaisado).');
      if (this.downloadTimer) clearTimeout(this.downloadTimer);
      this.downloadTimer = setTimeout(() => this.downloadFeedback.set(''), 3000);
    } catch (e) {
      this.downloadFeedback.set((e as Error).message || 'No se pudo generar el PDF.');
    } finally {
      this.descargando.set(false);
    }
  }

  /**
   * Exporta el folio visible a PDF A4 apaisado (297×210 mm).
   * Temporalmente fuerza el tamaño A4 para que la captura coincida
   * con el formato de impresión (@page size: A4 landscape).
   */
  async exportarFolioVisibleComoPdf(): Promise<void> {
    const folio = this.resolverFolioElement();
    if (!folio) {
      throw new Error('No se encontró el folio del certificado para exportar.');
    }
    await waitForImages(folio);

    const restore = applyA4LandscapeForCapture(folio);
    try {
      await nextFrame();
      await nextFrame();

      // windowWidth alto fuerza breakpoints desktop del folio (firmas 3 col).
      const canvas = await html2canvas(folio, {
        scale: 2,
        useCORS: true,
        allowTaint: true,
        backgroundColor: '#ffffff',
        logging: false,
        imageTimeout: 15_000,
        width: folio.offsetWidth,
        height: folio.offsetHeight,
        windowWidth: Math.max(folio.scrollWidth, 1280),
        windowHeight: Math.max(folio.scrollHeight, 900),
      });

      const pdf = new jsPDF({
        orientation: 'landscape',
        unit: 'mm',
        format: 'a4',
        compress: true,
      });
      // Página completa A4 landscape: 297 × 210 mm.
      const pageW = pdf.internal.pageSize.getWidth();
      const pageH = pdf.internal.pageSize.getHeight();
      const imgData = canvas.toDataURL('image/png');
      pdf.addImage(imgData, 'PNG', 0, 0, pageW, pageH, undefined, 'FAST');
      pdf.save(this.pdfFilename());
    } finally {
      restore();
    }
  }

  /** viewChild('folio') puede devolver ElementRef o el nodo; normalizamos. */
  private resolverFolioElement(): HTMLElement | null {
    const ref = this.folioRef();
    if (ref) {
      const el = unwrapDomElement(ref);
      if (el) return el;
    }
    return this.host.nativeElement.querySelector('.certificado-folio');
  }
}

function unwrapDomElement(value: unknown): HTMLElement | null {
  if (!value) return null;
  if (value instanceof HTMLElement) return value;
  if (typeof value === 'object' && 'nativeElement' in value) {
    const native = (value as ElementRef<unknown>).nativeElement;
    if (native instanceof HTMLElement) return native;
  }
  return null;
}

/** A4 landscape en mm (misma orientación que @page print). */
const A4_LANDSCAPE = { width: '297mm', height: '210mm' } as const;

/**
 * Fuerza el folio a tamaño A4 landscape para la captura y restaura
 * estilos inline al terminar.
 */
function applyA4LandscapeForCapture(folio: HTMLElement): () => void {
  const prev = {
    width: folio.style.width,
    height: folio.style.height,
    maxWidth: folio.style.maxWidth,
    minHeight: folio.style.minHeight,
    borderRadius: folio.style.borderRadius,
    boxShadow: folio.style.boxShadow,
    border: folio.style.border,
    margin: folio.style.margin,
    overflow: folio.style.overflow,
    boxSizing: folio.style.boxSizing,
  };
  folio.classList.add('folio-export-a4');
  folio.style.boxSizing = 'border-box';
  folio.style.width = A4_LANDSCAPE.width;
  folio.style.height = A4_LANDSCAPE.height;
  folio.style.maxWidth = A4_LANDSCAPE.width;
  folio.style.minHeight = A4_LANDSCAPE.height;
  folio.style.borderRadius = '0';
  folio.style.boxShadow = 'none';
  folio.style.border = 'none';
  folio.style.margin = '0';
  folio.style.overflow = 'hidden';

  return () => {
    folio.classList.remove('folio-export-a4');
    folio.style.width = prev.width;
    folio.style.height = prev.height;
    folio.style.maxWidth = prev.maxWidth;
    folio.style.minHeight = prev.minHeight;
    folio.style.borderRadius = prev.borderRadius;
    folio.style.boxShadow = prev.boxShadow;
    folio.style.border = prev.border;
    folio.style.margin = prev.margin;
    folio.style.overflow = prev.overflow;
    folio.style.boxSizing = prev.boxSizing;
  };
}

function nextFrame(): Promise<void> {
  return new Promise((resolve) => requestAnimationFrame(() => resolve()));
}

function parseISO(iso: string): Date {
  const [y, m, d] = iso.split('-').map(Number);
  return new Date(y, m - 1, d);
}

async function waitForImages(root: HTMLElement): Promise<void> {
  const imgs = Array.from(root.querySelectorAll('img'));
  await Promise.all(
    imgs.map(
      (img) =>
        new Promise<void>((resolve) => {
          if (img.complete && img.naturalWidth > 0) {
            resolve();
            return;
          }
          const done = () => resolve();
          img.addEventListener('load', done, { once: true });
          img.addEventListener('error', done, { once: true });
          // Timeout corto para no colgar la descarga.
          window.setTimeout(done, 8_000);
        }),
    ),
  );
}
