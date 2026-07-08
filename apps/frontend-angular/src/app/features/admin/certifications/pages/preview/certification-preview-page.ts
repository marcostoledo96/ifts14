import { ChangeDetectionStrategy, Component, computed, inject, input, OnInit, signal } from '@angular/core';
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
export class CertificationPreviewPage implements OnInit {
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

  ngOnInit(): void {
    void this.cargar();
  }

  async cargar(): Promise<void> {
    this.cargando.set(true);
    this.error.set('');
    const cid = this.certId();
    if (cid === null) {
      this.error.set('Certificación no encontrada.');
      this.cargando.set(false);
      return;
    }
    try {
      const det = await this.certs.obtener(cid);
      this.detalle.set(det);
    } catch (e) {
      this.error.set((e as Error).message);
    } finally {
      this.cargando.set(false);
    }
  }
}