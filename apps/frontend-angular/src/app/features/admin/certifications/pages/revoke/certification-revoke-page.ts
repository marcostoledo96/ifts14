import { ChangeDetectionStrategy, Component, computed, effect, inject, input, signal, untracked, ElementRef, viewChild, HostListener } from '@angular/core';
import { HttpErrorResponse } from '@angular/common/http';
import { RouterLink, Router } from '@angular/router';
import { CERTIFICATIONS_SOURCE } from '../../certifications.service';
import { CertificacionDetalle } from '../../certifications.models';
import { FormsModule } from '@angular/forms';
import { UiBackLink } from '../../../../../shared/ui/ui-back-link';
import { UiSpinner } from '../../../../../shared/ui/ui-spinner';
import { trapTabKey } from '../../../../../shared/util/trap-tab';

@Component({
  selector: 'app-certification-revoke-page',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterLink, FormsModule, UiBackLink, UiSpinner],
  templateUrl: './certification-revoke-page.html',
  styleUrl: './certification-revoke-page.css',
})
export class CertificationRevokePage {
  readonly id = input<string>('');

  private readonly certs = inject(CERTIFICATIONS_SOURCE);
  private readonly router = inject(Router);

  readonly detalle = signal<CertificacionDetalle | null>(null);
  /** Load overlay only — never submit failures. */
  readonly error = signal('');
  /** Load-only: gates Reintentar. Submit must never set this. */
  readonly errorRecuperable = signal(false);
  /** Submit failure — inline in dialog (not load overlay). */
  readonly errorAccion = signal('');
  readonly cargando = signal(true);

  readonly motivo = signal('');
  readonly confirmado = signal(false);
  readonly intentado = signal(false);
  readonly enviando = signal(false);

  readonly dialogRef = viewChild<ElementRef<HTMLDivElement>>('dialog');
  readonly motivoRef = viewChild<ElementRef<HTMLTextAreaElement>>('motivoInput');

  readonly MOTIVO_MIN = 12;
  readonly MOTIVO_MAX = 180;

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
    this.errorAccion.set('');
    this.errorRecuperable.set(false);
    this.cargando.set(true);
    this.motivo.set('');
    this.confirmado.set(false);
    this.intentado.set(false);
    this.enviando.set(false);
    if (cid === null) {
      if (gen === this.loadGen) {
        this.error.set('Certificación no encontrada.');
        this.errorRecuperable.set(false);
        this.cargando.set(false);
      }
      return;
    }
    try {
      const det = await this.certs.obtener(cid);
      if (gen !== this.loadGen) return;
      this.detalle.set(det);
      this.errorRecuperable.set(false);
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

  /** Envelope API message o fallback es-AR (sin raw Error.message). */
  private mensajeErrorApi(err: unknown, fallback: string): string {
    if (err instanceof HttpErrorResponse) {
      const msg = (err.error as { error?: { message?: string } } | null)?.error?.message;
      if (typeof msg === 'string' && msg.trim()) return msg.trim();
    }
    return fallback;
  }

  // Cierre al presionar Escape (paridad v0)
  @HostListener('document:keydown.escape')
  volverAlExpediente(): void {
    void this.router.navigate(this.volverLink());
  }

  // T5 / SHELL-A11Y-03: focus trap vía helper compartido
  @HostListener('keydown.tab', ['$event'])
  @HostListener('keydown.shift.tab', ['$event'])
  onTab(e: Event): void {
    const dialog = this.dialogRef()?.nativeElement;
    if (!dialog) return;
    trapTabKey(e as KeyboardEvent, dialog);
  }

  async onRevocar(): Promise<void> {
    if (!this.esRevocable()) return;

    this.intentado.set(true);
    this.errorAccion.set('');

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
    const gen = this.loadGen;

    this.enviando.set(true);
    try {
      const sanitizedMotivo = this.motivo().trim()
        .replace(/\b\d{7,8}\b/g, '[DNI]')
        .replace(/\b[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}\b/gi, '[TOKEN]')
        .replace(/\b[\w.-]+@[\w.-]+\.\w+\b/g, '[EMAIL]');

      await this.certs.revocar(cid, sanitizedMotivo);
      if (gen !== this.loadGen || this.certId() !== cid) return;
      await this.router.navigate(this.volverLink(), { queryParams: { revocada: 1 }});
    } catch (e) {
      if (gen !== this.loadGen || this.certId() !== cid) return;
      this.errorAccion.set(
        this.mensajeErrorApi(e, 'No se pudo revocar la certificación.'),
      );
    } finally {
      if (gen === this.loadGen) this.enviando.set(false);
    }
  }

  onMotivoChange(val: string): void {
    this.motivo.set(val.slice(0, this.MOTIVO_MAX));
  }
}
