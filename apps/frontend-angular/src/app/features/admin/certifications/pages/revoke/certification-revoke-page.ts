import { ChangeDetectionStrategy, Component, computed, effect, inject, input, signal, untracked, ElementRef, viewChild, HostListener } from '@angular/core';
import { RouterLink, Router } from '@angular/router';
import { CERTIFICATIONS_SOURCE } from '../../certifications.service';
import { CertificacionDetalle } from '../../certifications.models';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-certification-revoke-page',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterLink, FormsModule],
  templateUrl: './certification-revoke-page.html',
  styleUrl: './certification-revoke-page.css',
})
export class CertificationRevokePage {
  readonly id = input<string>('');

  private readonly certs = inject(CERTIFICATIONS_SOURCE);
  private readonly router = inject(Router);

  readonly detalle = signal<CertificacionDetalle | null>(null);
  readonly error = signal('');
  readonly cargando = signal(true);

  readonly motivo = signal('');
  readonly confirmado = signal(false);
  readonly intentado = signal(false);
  readonly enviando = signal(false);

  readonly dialogRef = viewChild<ElementRef<HTMLDivElement>>('dialog');
  readonly motivoRef = viewChild<ElementRef<HTMLTextAreaElement>>('motivoInput');

  readonly MOTIVO_MIN = 12;
  readonly MOTIVO_MAX = 400;

  readonly certId = computed<number | null>(() => {
    const raw = this.id().trim();
    if (!raw) return null;
    if (!/^[1-9]\d*$/.test(raw)) return null;
    const n = Number(raw);
    return Number.isNaN(n) || n <= 0 ? null : n;
  });

  readonly numeroExpediente = computed(() => {
    const d = this.detalle();
    if (!d) return '';
    return d.numero;
  });

  readonly volverLink = computed(() => {
    const cid = this.id();
    return ['/admin/certificaciones', cid];
  });

  readonly motivoValido = computed(() => {
    return this.motivo().trim().length >= this.MOTIVO_MIN;
  });

  readonly esRevocable = computed(() => this.detalle()?.estado === 'vigente');

  readonly puedeRevocar = computed(() => {
    return this.esRevocable() && this.motivoValido() && this.confirmado() && !this.enviando();
  });

  readonly motivoError = computed(() => {
    if (this.intentado() && !this.motivoValido()) {
      return this.motivo().trim().length === 0
        ? 'Ingresá el motivo de la revocación.'
        : `Detallá el motivo con al menos ${this.MOTIVO_MIN} caracteres.`;
    }
    return '';
  });

  readonly confirmError = computed(() => {
    return this.intentado() && !this.confirmado();
  });

  private loadGen = 0;

  constructor() {
    effect(() => {
      this.id();
      untracked(() => void this.cargar());
    });
    effect(() => {
      if (this.detalle()) {
        const dialog = this.dialogRef();
        if (dialog?.nativeElement) {
          dialog.nativeElement.focus();
        }
      }
    });
  }

  async cargar(): Promise<void> {
    const gen = ++this.loadGen;
    const cid = this.certId();
    this.detalle.set(null);
    this.error.set('');
    this.cargando.set(true);
    this.motivo.set('');
    this.confirmado.set(false);
    this.intentado.set(false);
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

  // T5: focus trap — Tab/Shift+Tab se mantiene dentro del diálogo
  @HostListener('keydown.tab', ['$event'])
  @HostListener('keydown.shift.tab', ['$event'])
  onTab(e: KeyboardEvent): void {
    const dialog = this.dialogRef()?.nativeElement;
    if (!dialog) return;
    const focusable = dialog.querySelectorAll<HTMLElement>(
      'a[href], button:not(:disabled), textarea, input, [tabindex]:not([tabindex="-1"])',
    );
    if (focusable.length === 0) return;
    const first = focusable[0];
    const last = focusable[focusable.length - 1];
    const active = document.activeElement;
    if (e.shiftKey) {
      if (active === first || !dialog.contains(active)) {
        e.preventDefault();
        last.focus();
      }
    } else {
      if (active === last) {
        e.preventDefault();
        first.focus();
      }
    }
  }

  async onRevocar(): Promise<void> {
    if (!this.esRevocable()) return;

    this.intentado.set(true);
    
    if (!this.motivoValido()) {
      const ref = this.motivoRef();
      if (ref?.nativeElement) {
        ref.nativeElement.focus();
      }
      return;
    }
    if (!this.confirmado()) return;

    const cid = this.certId();
    if (cid === null) return;

    this.enviando.set(true);
    try {
      const sanitizedMotivo = this.motivo().trim()
        .replace(/\b\d{7,8}\b/g, '[DNI]')
        .replace(/\b[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}\b/gi, '[TOKEN]')
        .replace(/\b[\w.-]+@[\w.-]+\.\w+\b/g, '[EMAIL]');

      await this.certs.revocar(cid, sanitizedMotivo);
      await this.router.navigate(this.volverLink(), { queryParams: { revocada: 1 }});
    } catch (e) {
      this.error.set((e as Error).message);
    } finally {
      this.enviando.set(false);
    }
  }

  onMotivoChange(val: string): void {
    this.motivo.set(val.slice(0, this.MOTIVO_MAX));
  }
}
