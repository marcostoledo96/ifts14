import {
  ChangeDetectionStrategy,
  Component,
  computed,
  DestroyRef,
  effect,
  inject,
  input,
  signal,
  untracked,
} from '@angular/core';
import { RouterLink } from '@angular/router';
import { CERTIFICATIONS_SOURCE } from '../../certifications.service';
import { CertificacionDetalle, EstadoCertificado, RegenerarPdfResult } from '../../certifications.models';
import {
  INSTITUTIONAL_CONFIG_SOURCE,
  InstitutionalConfig,
} from '../../../institutional-config/institutional-config.service';
import {
  INSTITUTIONAL_BRAND,
  INSTITUTIONAL_PARTNER_LOGOS,
} from '../../../../../shared/brand/institutional-brand';
import { qrPngBlobFromUrl } from '../../qr-png';
import { UiSpinner } from '../../../../../shared/ui/ui-spinner';

type AutoridadesVista = {
  rectorName: string;
  rectorRole: string;
  advisorName: string;
  advisorRole: string;
};

// Expediente administrativo de una certificación.
// Paridad visual con muestra_pagina/components/admin/expediente-certificacion.tsx
// portada a Angular 20 con CSS local y tokens globales.
// Copiar link usa URL canónica de obtenerEntregaManual(); Descargar QR vía
// descargarQrPng. Autoridades de la réplica desde configuración institucional
// (REQ-CPREV-001…007).
@Component({
  selector: 'app-certification-preview-page',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterLink, UiSpinner],
  templateUrl: './certification-preview-page.html',
  styleUrl: './certification-preview-page.css',
})
export class CertificationPreviewPage {
  // withComponentInputBinding() pasa los route params como strings.
  readonly id = input<string>('');

  private readonly certs = inject(CERTIFICATIONS_SOURCE);
  private readonly config = inject(INSTITUTIONAL_CONFIG_SOURCE);
  private readonly destroyRef = inject(DestroyRef);

  readonly logoSrc = INSTITUTIONAL_BRAND.logoIfts;
  readonly partnerLogos = INSTITUTIONAL_PARTNER_LOGOS;

  readonly detalle = signal<CertificacionDetalle | null>(null);
  readonly error = signal('');
  readonly cargando = signal(true);

  // URL canónica desde entrega-manual (nunca detalle.publicValidationUrl).
  readonly entregaUrl = signal<string | null>(null);
  /** Motivo visible si Copiar link / QR no están disponibles. */
  readonly entregaError = signal('');
  readonly configPendiente = signal(false);
  readonly autoridades = signal<AutoridadesVista | null>(null);
  readonly copiado = signal(false);
  readonly qrDescargando = signal(false);
  readonly qrError = signal('');

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

  /** Reemisión: nuevo certificado (código/QR nuevos). No restaura el revocado. */
  readonly puedeReemitir = computed(() => {
    const d = this.detalle();
    if (!d) return false;
    if (d.estado !== 'revocado' && d.estado !== 'vencido') return false;
    return d.alumnoId != null && d.cursoId != null;
  });

  readonly reemitQueryParams = computed<{ alumno: number; curso: number } | null>(() => {
    const d = this.detalle();
    if (!d || d.alumnoId == null || d.cursoId == null) return null;
    return { alumno: d.alumnoId, curso: d.cursoId };
  });

  readonly puedeCopiarCompartir = computed(
    () => !this.estadoRevocado() && !!this.entregaUrl()?.trim(),
  );

  /** Object URL del QR real (misma URL canónica que Copiar link). */
  readonly qrSrc = signal<string | null>(null);

  // ponytail: generación de carga para descartar resultados stale cuando el
  // id cambia antes de que termine la carga anterior (route reuse).
  private loadGen = 0;
  private copiaTimer: ReturnType<typeof setTimeout> | null = null;
  private qrObjectUrl: string | null = null;

  constructor() {
    this.destroyRef.onDestroy(() => this.revokeQrUrl());
    // Reacciona a cambios de id() tras la ligadura inicial y cuando Angular
    // reutiliza la misma instancia al navegar entre URLs de previsualización.
    // ngOnInit no vuelve a correr en route reuse, pero el effect sí.
    effect(() => {
      this.id();
      untracked(() => void this.cargar());
    });
  }

  private revokeQrUrl(): void {
    if (this.qrObjectUrl) {
      URL.revokeObjectURL(this.qrObjectUrl);
      this.qrObjectUrl = null;
    }
    this.qrSrc.set(null);
  }

  private async cargarQr(cid: number, gen: number, urlCanonica: string | null): Promise<void> {
    const url = urlCanonica?.trim();
    if (!url) return;
    try {
      let blob: Blob | null = null;
      try {
        const fromSvc = await this.certs.descargarQrPng(cid);
        if (fromSvc.size >= 200) blob = fromSvc;
      } catch {
        blob = null;
      }
      if (!blob) blob = await qrPngBlobFromUrl(url);
      if (gen !== this.loadGen) return;
      this.revokeQrUrl();
      this.qrObjectUrl = URL.createObjectURL(blob);
      this.qrSrc.set(this.qrObjectUrl);
    } catch {
      // Soft: el expediente sigue útil sin PNG.
    }
  }

  async cargar(): Promise<void> {
    const gen = ++this.loadGen;
    const cid = this.certId();
    // Reset stale antes de cargar.
    this.detalle.set(null);
    this.entregaUrl.set(null);
    this.entregaError.set('');
    this.autoridades.set(null);
    this.configPendiente.set(false);
    this.error.set('');
    this.copiado.set(false);
    this.qrDescargando.set(false);
    this.qrError.set('');
    this.revokeQrUrl();
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
      const urlQr =
        entR.status === 'fulfilled' ? entR.value.publicValidationUrl?.trim() || null : null;
      void this.cargarQr(cid, gen, urlQr);
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
      const reason = entR.reason as {
        status?: number;
        error?: { code?: string; error?: { code?: string } };
        message?: string;
      };
      const code =
        reason?.error?.error?.code ??
        reason?.error?.code ??
        '';
      if (code === 'TOKEN_NOT_RECOVERABLE' || reason?.status === 409) {
        this.entregaError.set(
          'No se pudo recuperar el token de validación. Revisá token_cipher_key en la configuración del servidor.',
        );
      } else if (this.detalle()?.estado !== 'vigente') {
        this.entregaError.set(
          'Copiar link y QR solo están disponibles para certificaciones vigentes.',
        );
      } else {
        this.entregaError.set(
          'No se pudo obtener el enlace de validación. Verificá que el certificado tenga token activo y que public_base_url esté configurada.',
        );
      }
      return;
    }
    const url = (entR.value.publicValidationUrl ?? '').trim();
    if (!url) {
      this.entregaUrl.set(null);
      this.entregaError.set(
        'El servidor no devolvió URL de validación. Configurá public_base_url (ej. https://certificados-qa.ifts14.com.ar/certificados_staging).',
      );
      return;
    }
    this.entregaUrl.set(url);
    this.entregaError.set('');
  }

  async copiarLink(): Promise<void> {
    if (!this.puedeCopiarCompartir()) return;
    const url = this.entregaUrl()?.trim();
    if (!url) return;
    await this.escribirClipboard(url);
    this.mostrarCopiado();
  }

  /** Filename semántico: cert-{codigo}-qr.png */
  readonly qrFilename = computed(() => {
    const raw = this.numeroExpediente() || this.detalle()?.numero?.trim() || 'certificado';
    const safe = raw.replace(/[^A-Za-z0-9._-]+/g, '-').replace(/^-+|-+$/g, '') || 'certificado';
    return `cert-${safe}-qr.png`;
  });

  async descargarQr(): Promise<void> {
    const cid = this.certId();
    if (cid === null || !this.puedeCopiarCompartir() || this.qrDescargando()) return;
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
