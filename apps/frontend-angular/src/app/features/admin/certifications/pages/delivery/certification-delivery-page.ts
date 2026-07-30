import {
  ChangeDetectionStrategy,
  Component,
  computed,
  effect,
  inject,
  input,
  signal,
  untracked,
  HostListener,
  ElementRef,
  viewChild,
} from '@angular/core';
import { HttpErrorResponse } from '@angular/common/http';
import { Router } from '@angular/router';
import { trapTabKey } from '../../../../../shared/util/trap-tab';
import { CERTIFICATIONS_SOURCE } from '../../certifications.service';
import { CertificacionDetalle, EntregaManualDto } from '../../certifications.models';

/** Copy bedelía operable para 409 / TOKEN_NOT_RECOVERABLE (sin jargon de claves). */
const MSG_409_ENTREGA =
  'No se pudo recuperar el enlace de validación de este certificado. El QR no se regenera solo; contactá a sistemas.';

// P6-01 + Ciclo 13 + P20: Entrega manual funcional.
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
  /** Soft error de entrega-manual (409 operable); no tumba la ficha. */
  readonly entregaError = signal('');
  /** Solo hard de carga de detalle — nunca QR/PDF/regen/409. */
  readonly errorRecuperable = signal(false);
  readonly cargando = signal(true);

  readonly copiado = signal(false);
  readonly descargado = signal(false);
  readonly descargando = signal(false);
  readonly qrDescargando = signal(false);
  readonly qrError = signal('');
  readonly regenerarMsg = signal('');
  readonly regenerando = signal(false);

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
    // Foco inicial en #dialog (éxito o error) — soft; Esc vuelve al expediente.
    effect(() => {
      const hasDialog = !!(this.detalle() || this.error()) && !this.cargando();
      if (!hasDialog) return;
      queueMicrotask(() => {
        this.dialogRef()?.nativeElement?.focus();
      });
    });
  }

  async cargar(): Promise<void> {
    const gen = ++this.loadGen;
    const cid = this.certId();
    this.detalle.set(null);
    this.entrega.set(null);
    this.error.set('');
    this.entregaError.set('');
    this.qrError.set('');
    this.regenerarMsg.set('');
    this.errorRecuperable.set(false);
    this.regenerando.set(false);
    this.cargando.set(true);
    if (cid === null) {
      if (gen === this.loadGen) {
        this.error.set('Certificación no encontrada.');
        this.errorRecuperable.set(false);
      }
      this.cargando.set(false);
      return;
    }
    try {
      // Detalle hard; entrega soft (P20 allSettled).
      const [detR, entR] = await Promise.allSettled([
        this.certs.obtener(cid),
        this.certs.obtenerEntregaManual(cid),
      ]);
      if (gen !== this.loadGen) return;

      if (detR.status === 'rejected') {
        this.aplicarErrorCarga(detR.reason);
        return;
      }
      this.detalle.set(detR.value);
      this.errorRecuperable.set(false);
      this.aplicarEntrega(entR);
    } catch (e) {
      if (gen === this.loadGen) this.aplicarErrorCarga(e);
    } finally {
      if (gen === this.loadGen) this.cargando.set(false);
    }
  }

  onReintentar(): void {
    if (!this.errorRecuperable()) return;
    void this.cargar();
  }

  /** Not-found (404 / mensaje) vs hard recuperable — sin raw Error.message en UI. */
  private aplicarErrorCarga(reason: unknown): void {
    const status = reason instanceof HttpErrorResponse ? reason.status : null;
    const raw = reason instanceof Error ? reason.message : '';
    const notFound = status === 404 || /no encontrad/i.test(raw);
    if (notFound) {
      this.error.set('Certificación no encontrada.');
      this.errorRecuperable.set(false);
      return;
    }
    this.error.set('No se pudo cargar la certificación.');
    this.errorRecuperable.set(true);
  }

  /** Envelope API message o fallback es-AR (sin raw Error.message). P15-strict. */
  private mensajeErrorApi(err: unknown, fallback: string): string {
    if (err instanceof HttpErrorResponse) {
      const msg = (err.error as { error?: { message?: string } } | null)?.error?.message;
      if (typeof msg === 'string' && msg.trim()) return msg.trim();
    }
    return fallback;
  }

  private aplicarEntrega(entR: PromiseSettledResult<EntregaManualDto>): void {
    if (entR.status === 'rejected') {
      this.entrega.set(null);
      const reason = entR.reason as {
        status?: number;
        error?: { code?: string; error?: { code?: string } };
        message?: string;
      };
      const code = reason?.error?.error?.code ?? reason?.error?.code ?? '';
      if (code === 'TOKEN_NOT_RECOVERABLE' || reason?.status === 409) {
        this.entregaError.set(MSG_409_ENTREGA);
      } else if (this.detalle()?.estado !== 'vigente') {
        this.entregaError.set(
          'Copiar link y QR solo están disponibles para certificaciones válidas.',
        );
      } else {
        this.entregaError.set(
          'No se pudo obtener el enlace de validación. Verificá que el certificado tenga token activo y que public_base_url esté configurada.',
        );
      }
      return;
    }
    const ent = entR.value;
    const url = (ent.publicValidationUrl ?? '').trim();
    if (!url) {
      this.entrega.set(null);
      this.entregaError.set(
        'El servidor no devolvió URL de validación. Configurá public_base_url (ej. https://staging.example.edu.ar/certificados_staging).',
      );
      return;
    }
    this.entrega.set(ent);
    this.entregaError.set('');
  }

  // Cierre al presionar Escape
  @HostListener('document:keydown.escape')
  volverAlExpediente(): void {
    void this.router.navigate(['/admin/certificaciones', this.id()]);
  }

  // T5 / REQ-DEL-007: focus trap vía helper compartido
  @HostListener('keydown.tab', ['$event'])
  @HostListener('keydown.shift.tab', ['$event'])
  onTab(e: Event): void {
    const dialog = this.dialogRef()?.nativeElement;
    if (!dialog) return;
    trapTabKey(e as KeyboardEvent, dialog);
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
    if (cid === null || !this.validarUrl()) return;
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
      this.qrError.set(this.mensajeErrorApi(e, 'No se pudo descargar el QR.'));
    } finally {
      this.qrDescargando.set(false);
    }
  }

  /**
   * Handoff al folio institucional `…/pdf?descargar=1` (no Blob TCPDF).
   * `navigate: false` — solo serializa URL (seam de test; no muta location).
   */
  async descargarPdf(options: { navigate?: boolean } = {}): Promise<string | null> {
    const cid = this.certId();
    if (cid === null || this.descargando()) return null;
    this.descargando.set(true);
    this.qrError.set('');
    try {
      const commands = ['/admin/certificaciones', cid, 'pdf'] as const;
      const queryParams = { descargar: '1' };
      const tree = this.router.createUrlTree([...commands], { queryParams });
      const url = this.router.serializeUrl(tree);
      if (options.navigate !== false) {
        await this.router.navigate([...commands], { queryParams });
      }
      this.descargado.set(true);
      return url;
    } catch (e) {
      this.qrError.set(this.mensajeErrorApi(e, 'No se pudo descargar el PDF.'));
      this.descargado.set(false);
      return null;
    } finally {
      this.descargando.set(false);
    }
  }

  /** Wire regenerarPdf + re-fetch entrega. D0: no rota token; no muestra publicValidationUrl. */
  async volverARegenerarPdf(): Promise<void> {
    const cid = this.certId();
    const gen = this.loadGen;
    if (cid === null || this.regenerando()) return;
    this.regenerando.set(true);
    this.regenerarMsg.set('');
    this.qrError.set('');
    try {
      await this.certs.regenerarPdf(cid);
      if (gen !== this.loadGen || this.certId() !== cid) return;
      this.regenerarMsg.set('El PDF se regeneró correctamente.');
      try {
        const ent = await this.certs.obtenerEntregaManual(cid);
        if (gen !== this.loadGen || this.certId() !== cid) return;
        // D0: omitir result.publicValidationUrl; soft-path vía aplicarEntrega.
        this.aplicarEntrega({ status: 'fulfilled', value: ent });
      } catch (e) {
        if (gen !== this.loadGen || this.certId() !== cid) return;
        this.aplicarEntrega({ status: 'rejected', reason: e });
      }
    } catch (e) {
      if (gen !== this.loadGen || this.certId() !== cid) return;
      this.regenerarMsg.set(this.mensajeErrorApi(e, 'No se pudo regenerar el PDF.'));
    } finally {
      if (gen === this.loadGen) this.regenerando.set(false);
    }
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
