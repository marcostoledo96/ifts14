import {
  ChangeDetectionStrategy,
  Component,
  computed,
  inject,
  input,
  resource,
  signal,
} from '@angular/core';
import {
  INSTITUTIONAL_BRAND,
  INSTITUTIONAL_PARTNER_LOGOS,
} from '../../shared/brand/institutional-brand';
import { ValidationService } from '../../shared/certificates/validation.service';
import {
  studentDocumentDisplay,
  ValidationViewState,
} from '../../shared/certificates/dto';
import { BandaEstado } from '../../shared/ui/banda-estado';
import { CampoDato } from '../../shared/ui/campo-dato';

// ponytail: resource() está en @angular/core desde v20, sin HttpClient.
// params lee tokenCertificacion(); loader llama al servicio async.
// idle/loading/resolved/error quedan cubiertos por el estado del resource.
@Component({
  selector: 'app-public-validation-page',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [BandaEstado, CampoDato],
  templateUrl: './public-validation-page.html',
  styleUrl: './public-validation-page.css',
})
export class PublicValidationPage {
  readonly tokenCertificacion = input.required<string>();
  private readonly validation = inject(ValidationService);

  readonly logoSrc = INSTITUTIONAL_BRAND.logoIfts;
  readonly partnerLogos = INSTITUTIONAL_PARTNER_LOGOS;

  readonly verification = resource<ValidationViewState, { token: string }>({
    params: () => ({ token: this.tokenCertificacion() }),
    loader: async ({ params, abortSignal }) =>
      this.validation.verify(params.token, abortSignal),
  });

  readonly view = computed<ValidationViewState | null>(() => {
    if (this.verification.hasValue()) {
      return this.verification.value();
    }
    return null;
  });
  readonly isLoading = computed(() => this.verification.isLoading());
  readonly hasError = computed(() => this.verification.error() !== undefined);

  // Error de resource (no del mapper) y technical-error del mapper → mismo bloque.
  readonly isTechnicalError = computed(
    () => this.hasError() || this.view()?.kind === 'technical-error',
  );

  readonly documentDisplay = studentDocumentDisplay;

  // Timestamp de consulta del cliente (no viene del backend). Se actualiza al reintentar.
  readonly consulta = signal(new Date());
  readonly consultaTimestamp = computed(() => this.formatConsulta(this.consulta()));
  readonly consultaHora = computed(() => this.formatHora(this.consulta()));

  readonly requestId = computed(() => {
    const v = this.view();
    if (!v) return '';
    if (v.kind === 'valid') return v.requestId;
    return v.requestId ?? '';
  });

  reintentar(): void {
    this.consulta.set(new Date());
    this.verification.reload();
  }

  isRevoked(v: ValidationViewState): boolean {
    return v.kind === 'not-verifiable' && v.reason === 'CERTIFICATE_REVOKED';
  }

  seqLabel(index: number): string {
    return String(index + 1).padStart(3, '0');
  }

  /** YYYY-MM-DD → dd/mm/yyyy es-AR; inválido → crudo. Paridad delivery `formatearFecha`. */
  formatearFechaFolio(iso: string): string {
    const parts = iso.split('-');
    if (parts.length !== 3) return iso;
    const d = new Date(Number(parts[0]), Number(parts[1]) - 1, Number(parts[2]));
    if (Number.isNaN(d.getTime())) return iso;
    return new Intl.DateTimeFormat('es-AR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    }).format(d);
  }

  private formatConsulta(fecha: Date): string {
    // dd/mm/yyyy · HH:MM ART
    const dd = String(fecha.getDate()).padStart(2, '0');
    const mm = String(fecha.getMonth() + 1).padStart(2, '0');
    const yyyy = fecha.getFullYear();
    const hh = String(fecha.getHours()).padStart(2, '0');
    const min = String(fecha.getMinutes()).padStart(2, '0');
    return `${dd}/${mm}/${yyyy} · ${hh}:${min} ART`;
  }

  private formatHora(fecha: Date): string {
    const hh = String(fecha.getHours()).padStart(2, '0');
    const min = String(fecha.getMinutes()).padStart(2, '0');
    const ss = String(fecha.getSeconds()).padStart(2, '0');
    return `${hh}:${min}:${ss} ART`;
  }
}
