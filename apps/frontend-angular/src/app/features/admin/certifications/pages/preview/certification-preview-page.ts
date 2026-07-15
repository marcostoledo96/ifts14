import { ChangeDetectionStrategy, Component, computed, effect, inject, input, signal, untracked } from '@angular/core';
import { RouterLink } from '@angular/router';
import { CERTIFICATIONS_SOURCE } from '../../certifications.service';
import { CertificacionDetalle, EstadoCertificado } from '../../certifications.models';

// Expediente administrativo mock-only de una certificación. Sin HTTP/storage.
// Paridad visual con muestra_pagina/components/admin/expediente-certificacion.tsx
// portada a Angular 20 con CSS local y tokens globales.
// CTAs de PDF/copiar link/entrega/regenerar/revocación deshabilitados con
// handoff explícito: F4-02 (PDF), F5-04 (entrega), F6-03 (link), F6-01 (revocación).
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

  readonly detalle = signal<CertificacionDetalle | null>(null);
  readonly error = signal('');
  readonly cargando = signal(true);

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

  // Handoffs explícitos por acción (una sola fuente de verdad para la UI).
  readonly handoffs = {
    pdf: 'F4-02',
    entrega: 'F5-04',
    link: 'F6-03',
    revocacion: 'F6-01',
  } as const;

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
    this.error.set('');
    this.cargando.set(true);
    if (cid === null) {
      if (gen === this.loadGen) this.error.set('Certificación no encontrada.');
      this.cargando.set(false);
      return;
    }
    try {
      const det = await this.certs.obtener(cid);
      if (gen !== this.loadGen) return; // carga stale, ignorar
      this.detalle.set(det);
    } catch (e) {
      if (gen === this.loadGen) this.error.set((e as Error).message);
    } finally {
      if (gen === this.loadGen) this.cargando.set(false);
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
