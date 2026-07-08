import { ChangeDetectionStrategy, Component, computed, effect, inject, input, signal, untracked } from '@angular/core';
import { RouterLink } from '@angular/router';
import { CERTIFICATIONS_SOURCE } from '../../certifications.service';
import { CertificacionDetalle } from '../../certifications.models';

// Previsualización segura de una certificación mock. Sin HTTP/storage.
// CTAs de emisión/PDF/entrega/revocación/listado real deshabilitados (handoff F4-F6).
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