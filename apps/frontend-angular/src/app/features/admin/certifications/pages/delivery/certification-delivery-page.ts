import { ChangeDetectionStrategy, Component, computed, effect, inject, input, signal, untracked, HostListener, ElementRef, viewChild } from '@angular/core';
import { Router } from '@angular/router';
import { CERTIFICATIONS_SOURCE } from '../../certifications.service';
import { CertificacionDetalle, EntregaManualDto } from '../../certifications.models';

// P6-01 + Ciclo 13: Entrega manual funcional.
// Consume GET /admin/certificados/{id}/entrega-manual → EntregaManualDto.
// QR vía CertificationsService.descargarQrPng (HttpClient / mock). Clipboard con fallback.
@Component({
  selector: 'app-certification-delivery-page',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [],
  templateUrl: './certification-delivery-page.html',
  styleUrl: './certification-delivery-page.css',
})
export class CertificationDeliveryPage {
  // withComponentInputBinding pasa los params como input
  readonly id = input<string>('');

  private readonly certs = inject(CERTIFICATIONS_SOURCE);
  private readonly router = inject(Router);

  readonly detalle = signal<CertificacionDetalle | null>(null);
  // ponytail: entrega guarda el DTO canónico del backend (URL real, pdfStatus).
  readonly entrega = signal<EntregaManualDto | null>(null);
  readonly error = signal('');
  readonly cargando = signal(true);

  readonly copiado = signal(false);
  readonly descargado = signal(false);
  readonly descargando = signal(false);
  readonly qrDescargando = signal(false);
  readonly qrError = signal('');
  readonly regenerarMsg = signal('');

  // T5: ref al diálogo para focus trap
  readonly dialogRef = viewChild<ElementRef<HTMLDivElement>>('dialog');

  // URL canónica desde el backend (no hardcodea dominio).
  readonly validarUrl = computed(() => {
    const e = this.entrega();
    return e ? e.publicValidationUrl : '';
  });

  // PDF desactualizado: muestra alert + botón "Volver a generar".
  readonly pdfOutdated = computed(() => {
    const e = this.entrega();
    return e?.pdfStatus === 'outdated';
  });

  // Id numérico
  readonly certId = computed<number | null>(() => {
    const raw = this.id().trim();
    if (!raw) return null;
    if (!/^[1-9]\d*$/.test(raw)) return null;
    const n = Number(raw);
    return Number.isNaN(n) || n <= 0 ? null : n;
  });

  readonly numeroExpediente = computed(() => {
    const d = this.detalle();
    if (d?.numero?.trim()) return d.numero.trim();
    const id = this.certId();
    if (id === null) return '';
    return `IFTS14-CERT-${String(id).padStart(4, '0')}`;
  });

  /** Filename semántico Ciclo 13: cert-{codigo}-qr.png */
  readonly qrFilename = computed(() => {
    const raw = this.numeroExpediente() || 'certificado';
    const safe = raw.replace(/[^A-Za-z0-9._-]+/g, '-').replace(/^-+|-+$/g, '') || 'certificado';
    return `cert-${safe}-qr.png`;
  });

  /** Filename PDF: cert-{codigo}.pdf */
  readonly pdfFilename = computed(() => {
    const raw = this.numeroExpediente() || 'certificado';
    const safe = raw.replace(/[^A-Za-z0-9._-]+/g, '-').replace(/^-+|-+$/g, '') || 'certificado';
    return `cert-${safe}.pdf`;
  });

  // Regla D0: documentMasked contiene DNI completo ficticio en UI admin
  readonly alumnoDniEnmascarado = computed(() => {
    const d = this.detalle();
    if (!d) return '';
    return d.documentMasked;
  });

  // QR Cells (Decorativo)
  readonly qrCells: readonly number[] = [
    1, 1, 1, 0, 1, 0, 1, 1, 1, 1, 0, 1, 1, 0, 0, 1, 0, 1, 1, 0, 1, 0, 1, 1, 0,
    1, 1, 0, 1, 1, 1, 0, 0, 1, 0, 0, 1, 0, 1, 1, 1, 0, 1, 0, 1, 1, 0, 1, 1, 0,
    1, 1, 1, 0, 1, 0, 0, 1, 1, 0, 1, 0, 1, 1,
  ];

  private loadGen = 0;
  private copiaTimer: ReturnType<typeof setTimeout> | null = null;

  constructor() {
    effect(() => {
      this.id();
      untracked(() => void this.cargar());
    });
  }

  async cargar(): Promise<void> {
    const gen = ++this.loadGen;
    const cid = this.certId();
    this.detalle.set(null);
    this.entrega.set(null);
    this.error.set('');
    this.qrError.set('');
    this.cargando.set(true);
    if (cid === null) {
      if (gen === this.loadGen) this.error.set('Certificación no encontrada.');
      this.cargando.set(false);
      return;
    }
    try {
      // Carga detalle y entrega manual en paralelo.
      const [det, ent] = await Promise.all([
        this.certs.obtener(cid),
        this.certs.obtenerEntregaManual(cid),
      ]);
      if (gen !== this.loadGen) return;
      this.detalle.set(det);
      this.entrega.set(ent);
    } catch (e) {
      if (gen === this.loadGen) this.error.set((e as Error).message);
    } finally {
      if (gen === this.loadGen) this.cargando.set(false);
    }
  }

  // Cierre al presionar Escape
  @HostListener('document:keydown.escape')
  volverAlExpediente(): void {
    void this.router.navigate(['/admin/certificaciones', this.id()]);
  }

  // T5: focus trap — Tab/Shift+Tab se mantiene dentro del diálogo
  @HostListener('keydown.tab', ['$event'])
  @HostListener('keydown.shift.tab', ['$event'])
  onTab(e: Event): void {
    const ke = e as KeyboardEvent;
    const dialog = this.dialogRef()?.nativeElement;
    if (!dialog) return;
    const focusable = dialog.querySelectorAll<HTMLElement>(
      'a[href], button:not(:disabled), textarea, input, [tabindex]:not([tabindex="-1"])',
    );
    if (focusable.length === 0) return;
    const first = focusable[0];
    const last = focusable[focusable.length - 1];
    const active = document.activeElement;
    if (ke.shiftKey) {
      if (active === first || !dialog.contains(active)) {
        ke.preventDefault();
        last.focus();
      }
    } else {
      if (active === last) {
        ke.preventDefault();
        first.focus();
      }
    }
  }

  async copiarLink(): Promise<void> {
    const url = this.validarUrl();
    if (!url) return;
    try {
      if (navigator.clipboard?.writeText) {
        await navigator.clipboard.writeText(url);
      } else {
        this.clipboardFallback(url);
      }
    } catch {
      this.clipboardFallback(url);
    }
    this.copiado.set(true);
    if (this.copiaTimer) clearTimeout(this.copiaTimer);
    this.copiaTimer = setTimeout(() => {
      this.copiado.set(false);
    }, 2600);
  }

  // ponytail: execCommand deprecated pero funcional como fallback de clipboard.
  private clipboardFallback(text: string): void {
    const ta = document.createElement('textarea');
    ta.value = text;
    ta.setAttribute('readonly', '');
    ta.style.position = 'absolute';
    ta.style.left = '-9999px';
    document.body.appendChild(ta);
    ta.select();
    try {
      document.execCommand('copy');
    } catch {
      // ignorar: sin portapapeles disponible
    }
    document.body.removeChild(ta);
  }

  async descargarQr(): Promise<void> {
    const cid = this.certId();
    if (cid === null) return;
    this.qrDescargando.set(true);
    this.qrError.set('');
    try {
      const blob = await this.certs.descargarQrPng(cid);
      const objUrl = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = objUrl;
      a.download = this.qrFilename();
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(objUrl);
    } catch (e) {
      this.qrError.set((e as Error).message || 'No se pudo descargar el QR.');
    } finally {
      this.qrDescargando.set(false);
    }
  }

  async descargarPdf(): Promise<void> {
    const cid = this.certId();
    if (cid === null || this.descargando()) return;
    this.descargando.set(true);
    this.qrError.set('');
    try {
      const blob = await this.certs.descargarPdf(cid);
      const objUrl = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = objUrl;
      a.download = this.pdfFilename();
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(objUrl);
      this.descargado.set(true);
    } catch (e) {
      this.qrError.set((e as Error).message || 'No se pudo descargar el PDF.');
      this.descargado.set(false);
    } finally {
      this.descargando.set(false);
    }
  }

  // MVP: no hay endpoint POST /regenerar; mostrar mensaje informativo.
  volverARegenerarPdf(): void {
    this.regenerarMsg.set(
      'La regeneración de PDF requiere acción del backend. Contactar al administrador.',
    );
  }

  formatearFecha(iso: string): string {
    const parts = iso.split('-');
    if (parts.length !== 3) return iso;
    const d = new Date(Number(parts[0]), Number(parts[1]) - 1, Number(parts[2]));
    return new Intl.DateTimeFormat('es-AR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    }).format(d);
  }
}
