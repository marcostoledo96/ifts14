import { ChangeDetectionStrategy, Component, computed, effect, inject, input, signal, untracked, HostListener } from '@angular/core';
import { Router } from '@angular/router';
import { CERTIFICATIONS_SOURCE } from '../../certifications.service';
import { CertificacionDetalle, EntregaManualDto } from '../../certifications.models';
import { environment } from '../../../../../../environments/environment';

// P6-01: Entrega manual funcional.
// Consume GET /admin/certificados/{id}/entrega-manual → EntregaManualDto.
// QR descargable vía Blob desde qr.png. Clipboard con fallback. PDF outdated detectado.
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
  readonly regenerarMsg = signal('');

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
    const id = this.certId();
    if (id === null) return '';
    return `IFTS14-CERT-${String(id).padStart(4, '0')}`;
  });

  // Regla D0: el DNI ya viene enmascarado del DTO
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
    try {
      const url = `${environment.apiBaseUrl}/admin/certificados/${cid}/qr.png`;
      const res = await fetch(url);
      if (!res.ok) throw new Error(`QR no disponible: ${res.status}`);
      const blob = await res.blob();
      const objUrl = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = objUrl;
      a.download = `${this.numeroExpediente()}-qr.png`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(objUrl);
    } catch (e) {
      this.error.set((e as Error).message);
    } finally {
      this.qrDescargando.set(false);
    }
  }

  async descargarPdf(): Promise<void> {
    this.descargando.set(true);
    // Simula demora
    await new Promise((r) => setTimeout(r, 700));

    // Abrir el PDF (F4-02) en una pestaña nueva
    const url = this.router.serializeUrl(
      this.router.createUrlTree(['/admin/certificaciones', this.id(), 'pdf'])
    );
    window.open(url, '_blank');

    this.descargando.set(false);
    this.descargado.set(true);
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