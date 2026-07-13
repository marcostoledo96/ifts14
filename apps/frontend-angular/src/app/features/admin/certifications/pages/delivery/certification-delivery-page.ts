import { ChangeDetectionStrategy, Component, computed, effect, inject, input, signal, untracked, HostListener } from '@angular/core';
import { Router } from '@angular/router';
import { CERTIFICATIONS_SOURCE } from '../../certifications.service';
import { CertificacionDetalle } from '../../certifications.models';

// F5-04: Entrega manual de certificación.
// El sistema no envía correos: Bedelía copia el link y/o descarga el PDF.
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
  readonly error = signal('');
  readonly cargando = signal(true);

  readonly copiado = signal(false);
  readonly descargado = signal(false);
  readonly descargando = signal(false);

  // URL pública mock: en MVP apunta a la validación de la app
  readonly VALIDACION_HOST = 'ifts14.edu.ar/certificados';
  readonly validarPath = computed(() => {
    const d = this.detalle();
    if (!d) return '';
    return d.publicValidationUrl;
  });
  
  readonly validarUrl = computed(() => {
    return `https://${this.VALIDACION_HOST}${this.validarPath()}`;
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
    this.error.set('');
    this.cargando.set(true);
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

  // Cierre al presionar Escape
  @HostListener('document:keydown.escape')
  volverAlExpediente(): void {
    void this.router.navigate(['/admin/certificaciones', this.id()]);
  }

  async copiarLink(): Promise<void> {
    try {
      if (navigator.clipboard) {
        await navigator.clipboard.writeText(this.validarUrl());
      }
    } catch {
      // Entorno sin portapapeles o mock
    }
    this.copiado.set(true);
    if (this.copiaTimer) clearTimeout(this.copiaTimer);
    this.copiaTimer = setTimeout(() => {
      this.copiado.set(false);
    }, 2600);
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
