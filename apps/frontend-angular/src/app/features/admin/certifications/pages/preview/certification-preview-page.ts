import { ChangeDetectionStrategy, Component, computed, effect, inject, input, signal, untracked } from '@angular/core';
import { RouterLink } from '@angular/router';
import { CERTIFICATIONS_SOURCE } from '../../certifications.service';
import { CertificacionDetalle, EstadoCertificado, RegenerarPdfResult } from '../../certifications.models';
import {
  INSTITUTIONAL_CONFIG_SOURCE,
  InstitutionalConfig,
} from '../../../institutional-config/institutional-config.service';

type AutoridadesVista = {
  rectorName: string;
  rectorRole: string;
  advisorName: string;
  advisorRole: string;
};

// Expediente administrativo de una certificación.
// Paridad visual con muestra_pagina/components/admin/expediente-certificacion.tsx
// portada a Angular 20 con CSS local y tokens globales.
// Copiar/Compartir usan URL canónica de obtenerEntregaManual(); autoridades
// desde INSTITUTIONAL_CONFIG_SOURCE (REQ-CPREV-001…007).
@Component({
  selector: 'app-certification-preview-page',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterLink],
  templateUrl: './certification-preview-page.html',
  styleUrl: './certification-preview-page.css',
})
export class CertificationPreviewPage {
  // withComponentInputBinding() pasa los route params como strings.
  readonly id = input<string>('');

  private readonly certs = inject(CERTIFICATIONS_SOURCE);
  private readonly config = inject(INSTITUTIONAL_CONFIG_SOURCE);

  readonly detalle = signal<CertificacionDetalle | null>(null);
  readonly error = signal('');
  readonly cargando = signal(true);

  // URL canónica desde entrega-manual (nunca detalle.publicValidationUrl).
  readonly entregaUrl = signal<string | null>(null);
  readonly configPendiente = signal(false);
  readonly autoridades = signal<AutoridadesVista | null>(null);
  readonly copiado = signal(false);

  // Estado de regeneración de PDF.
  readonly regenerando = signal(false);
  readonly regeneracionResultado = signal<RegenerarPdfResult | null>(null);
  readonly regeneracionError = signal('');

  // Id numérico validado. Acepta solo enteros decimales positivos: rechaza
  // formas coercibles como "0x1" (hex) o "1e0" (notación científica) que
  // Number() convertiría a 1. NaN, vacío, <= 0 o no decimal → null.
  readonly certId = computed<number | null>(() => {
    const raw = this.id().trim();
    if (!raw) return null;
    if (!/^[1-9]\d*$/.test(raw)) return null;
    const n = Number(raw);
    return Number.isNaN(n) || n <= 0 ? null : n;
  });

  // Número visual del expediente derivado del id (sin contrato nuevo).
  readonly numeroExpediente = computed(() => {
    const id = this.certId();
    if (id === null) return '';
    return `IFTS14-CERT-${String(id).padStart(4, '0')}`;
  });

  // Formatea un índice como secuencia de dos dígitos (01, 02, ...).
  seq2(i: number): string {
    return String(i + 1).padStart(2, '0');
  }

  // Formatea un índice como secuencia de tres dígitos (001, 002, ...).
  seq3(i: number): string {
    return String(i + 1).padStart(3, '0');
  }

  // Etiquetas legibles de estado para paridad visual.
  readonly estadoLabel = computed<string>(() => {
    const d = this.detalle();
    if (!d) return '';
    return estadoToLabel(d.estado);
  });

  readonly estadoRevocado = computed<boolean>(() => this.detalle()?.estado === 'revocado');
  readonly esRevocable = computed<boolean>(() => this.detalle()?.estado === 'vigente');

  readonly puedeCopiarCompartir = computed(
    () => !this.estadoRevocado() && !!this.entregaUrl()?.trim(),
  );

  // QR decorativo: 64 celdas (8x8) sin datos personales. Patrón fijo de
  // muestra_pagina, portado como intención visual sin dependencias.
  readonly qrCells: readonly number[] = [
    1, 1, 1, 0, 1, 0, 1, 1, 1, 1, 0, 1, 1, 0, 0, 1, 0, 1, 1, 0, 1, 0, 1, 1, 0,
    1, 1, 0, 1, 1, 1, 0, 0, 1, 0, 0, 1, 0, 1, 1, 1, 0, 1, 0, 1, 1, 0, 1, 1, 0,
    1, 1, 1, 0, 1, 0, 0, 1, 1, 0, 1, 0, 1, 1,
  ];

  // ponytail: generación de carga para descartar resultados stale cuando el
  // id cambia antes de que termine la carga anterior (route reuse).
  private loadGen = 0;
  private copiaTimer: ReturnType<typeof setTimeout> | null = null;

  constructor() {
    // Reacciona a cambios de id() tras la ligadura inicial y cuando Angular
    // reutiliza la misma instancia al navegar entre URLs de previsualización.
    // ngOnInit no vuelve a correr en route reuse, pero el effect sí.
    effect(() => {
      this.id();
      untracked(() => void this.cargar());
    });
  }

  async cargar(): Promise<void> {
    const gen = ++this.loadGen;
    const cid = this.certId();
    // Reset stale antes de cargar.
    this.detalle.set(null);
    this.entregaUrl.set(null);
    this.autoridades.set(null);
    this.configPendiente.set(false);
    this.error.set('');
    this.copiado.set(false);
    this.cargando.set(true);
    if (cid === null) {
      if (gen === this.loadGen) this.error.set('Certificación no encontrada.');
      this.cargando.set(false);
      return;
    }
    try {
      // Detalle hard; config y entrega-manual soft (REQ-CPREV-001).
      const [detR, cfgR, entR] = await Promise.allSettled([
        this.certs.obtener(cid),
        this.config.obtener(),
        this.certs.obtenerEntregaManual(cid),
      ]);
      if (gen !== this.loadGen) return;

      if (detR.status === 'rejected') {
        this.error.set((detR.reason as Error)?.message || 'Certificación no encontrada.');
        return;
      }
      this.detalle.set(detR.value);
      this.aplicarConfig(cfgR);
      this.aplicarEntrega(entR);
    } catch (e) {
      if (gen === this.loadGen) this.error.set((e as Error).message);
    } finally {
      if (gen === this.loadGen) this.cargando.set(false);
    }
  }

  private aplicarConfig(cfgR: PromiseSettledResult<InstitutionalConfig>): void {
    if (cfgR.status === 'rejected') {
      this.configPendiente.set(true);
      this.autoridades.set(null);
      return;
    }
    const cfg = cfgR.value;
    const rectorName = (cfg.rectorName ?? '').trim();
    const advisorName = (cfg.advisorName ?? '').trim();
    // Lock: pendiente si ambos nombres vacíos tras trim.
    const pendiente = !rectorName && !advisorName;
    this.configPendiente.set(pendiente);
    if (pendiente) {
      this.autoridades.set(null);
      return;
    }
    this.autoridades.set({
      rectorName: cfg.rectorName ?? '',
      rectorRole: cfg.rectorRole ?? '',
      advisorName: cfg.advisorName ?? '',
      advisorRole: cfg.advisorRole ?? '',
    });
  }

  private aplicarEntrega(
    entR: PromiseSettledResult<{ publicValidationUrl?: string }>,
  ): void {
    if (entR.status === 'rejected') {
      this.entregaUrl.set(null);
      return;
    }
    const url = (entR.value.publicValidationUrl ?? '').trim();
    this.entregaUrl.set(url || null);
  }

  async copiarLink(): Promise<void> {
    if (!this.puedeCopiarCompartir()) return;
    const url = this.entregaUrl()?.trim();
    if (!url) return;
    await this.escribirClipboard(url);
    this.mostrarCopiado();
  }

  async compartir(): Promise<void> {
    if (!this.puedeCopiarCompartir()) return;
    const url = this.entregaUrl()?.trim();
    if (!url) return;
    const alumno = this.detalle()?.nombreAlumno;
    const title = alumno ? `Certificado — ${alumno}` : 'Certificado IFTS 14';

    const shareFn = navigator.share?.bind(navigator);
    if (typeof shareFn === 'function') {
      try {
        await shareFn({ url, title });
        return;
      } catch (e) {
        // AbortError = cancelación del usuario: silencio, sin clipboard.
        if ((e as Error)?.name === 'AbortError') return;
      }
    }
    await this.escribirClipboard(url);
    this.mostrarCopiado();
  }

  private async escribirClipboard(url: string): Promise<void> {
    try {
      if (navigator.clipboard?.writeText) {
        await navigator.clipboard.writeText(url);
      } else {
        this.clipboardFallback(url);
      }
    } catch {
      this.clipboardFallback(url);
    }
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

  private mostrarCopiado(): void {
    this.copiado.set(true);
    if (this.copiaTimer) clearTimeout(this.copiaTimer);
    this.copiaTimer = setTimeout(() => {
      this.copiado.set(false);
    }, 2600);
  }

  async regenerarPdf(): Promise<void> {
    const cid = this.certId();
    if (cid === null) return;
    this.regenerando.set(true);
    this.regeneracionResultado.set(null);
    this.regeneracionError.set('');
    try {
      const result = await this.certs.regenerarPdf(cid);
      this.regeneracionResultado.set(result);
    } catch (e) {
      this.regeneracionError.set((e as Error).message);
    } finally {
      this.regenerando.set(false);
    }
  }
}

function estadoToLabel(e: EstadoCertificado): string {
  switch (e) {
    case 'vigente':
      return 'Válida';
    case 'borrador':
      return 'Borrador';
    case 'revocado':
      return 'Revocada';
    case 'vencido':
      return 'Vencida';
    default:
      return e;
  }
}
