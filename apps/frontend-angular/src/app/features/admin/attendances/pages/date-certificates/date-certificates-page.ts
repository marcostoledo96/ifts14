import {
  ChangeDetectionStrategy,
  Component,
  computed,
  effect,
  inject,
  input,
  signal,
  untracked,
} from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { Certificacion } from '../../../certifications/certifications.models';
import { CERTIFICATIONS_SOURCE } from '../../../certifications/certifications.service';
import { COURSES_SOURCE } from '../../../courses/courses.service';
import { CursoDetalle } from '../../../courses/courses.models';
import { UiBackLink } from '../../../../../shared/ui/ui-back-link';
import { UiSpinner } from '../../../../../shared/ui/ui-spinner';

export interface ResumenGeneracionNav {
  readonly emitidos: number;
  readonly actualizados: number;
  readonly fallidos: number;
}

export interface DateCertificatesNavState {
  readonly resumenGen?: ResumenGeneracionNav;
  readonly mensaje?: string;
}

// Listado completo de certificados del curso (entrega: link, QR, PDF).
@Component({
  selector: 'app-date-certificates-page',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterLink, UiBackLink, UiSpinner],
  templateUrl: './date-certificates-page.html',
  styleUrl: './date-certificates-page.css',
})
export class DateCertificatesPage {
  readonly id = input<string>('');
  readonly fechaId = input<string>('');

  private readonly courses = inject(COURSES_SOURCE);
  private readonly certs = inject(CERTIFICATIONS_SOURCE);
  private readonly router = inject(Router);

  readonly detalle = signal<CursoDetalle | null>(null);
  readonly certificados = signal<readonly Certificacion[]>([]);
  readonly cargando = signal(true);
  readonly error = signal('');
  readonly mensajeOk = signal('');
  readonly resumenGen = signal<ResumenGeneracionNav | null>(null);
  readonly copiadoId = signal<number | null>(null);
  readonly accionCertId = signal<number | null>(null);

  readonly courseId = computed<number | null>(() => this.parseId(this.id()));
  readonly fechaIdNumber = computed<number | null>(() => this.parseId(this.fechaId()));

  readonly fechaActual = computed(() => {
    const d = this.detalle();
    const fid = this.fechaIdNumber();
    if (!d || fid === null) return null;
    return d.fechas.find((f) => f.id === fid) || null;
  });

  private loadGen = 0;

  constructor() {
    const navState = this.readNavState();
    if (navState?.mensaje) this.mensajeOk.set(navState.mensaje);
    if (navState?.resumenGen) this.resumenGen.set(navState.resumenGen);

    effect(() => {
      const id = this.id();
      untracked(() => void this.cargar(id));
    });
  }

  private readNavState(): DateCertificatesNavState | null {
    const fromNav = this.router.currentNavigation()?.extras?.state as
      | DateCertificatesNavState
      | undefined;
    if (fromNav?.resumenGen || fromNav?.mensaje) return fromNav;
    const hist = history.state as DateCertificatesNavState | null;
    if (hist?.resumenGen || hist?.mensaje) return hist;
    return null;
  }

  private parseId(s: string): number | null {
    const n = Number(s);
    return !s || Number.isNaN(n) || n <= 0 ? null : n;
  }

  private async cargar(idStr: string): Promise<void> {
    const gen = ++this.loadGen;
    const cid = this.parseId(idStr);
    this.detalle.set(null);
    this.certificados.set([]);
    this.error.set('');
    this.cargando.set(true);
    if (cid === null) {
      if (gen === this.loadGen) this.error.set('Curso no encontrado.');
      this.cargando.set(false);
      return;
    }
    try {
      const [det, list] = await Promise.all([
        this.courses.obtener(cid),
        this.certs.listar({ cursoId: cid }),
      ]);
      if (gen !== this.loadGen) return;
      this.detalle.set(det);
      this.certificados.set(list);
    } catch (e) {
      if (gen === this.loadGen) this.error.set((e as Error).message);
    } finally {
      if (gen === this.loadGen) this.cargando.set(false);
    }
  }

  etiquetaEstado(estado: Certificacion['estado']): string {
    if (estado === 'vigente') return 'Válida';
    if (estado === 'revocado') return 'Revocado';
    return estado;
  }

  formatFechaCorta(iso: string): string {
    const [y, m, d] = iso.split('-').map(Number);
    if (!y || !m || !d) return iso;
    return new Intl.DateTimeFormat('es-AR', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    }).format(new Date(y, m - 1, d));
  }

  puedeEntregar(c: Certificacion): boolean {
    return c.estado === 'vigente';
  }

  async copiarLink(certId: number): Promise<void> {
    this.accionCertId.set(certId);
    this.error.set('');
    try {
      const entrega = await this.certs.obtenerEntregaManual(certId);
      const url = entrega.publicValidationUrl;
      if (navigator.clipboard?.writeText) {
        await navigator.clipboard.writeText(url);
      } else {
        this.clipboardFallback(url);
      }
      this.copiadoId.set(certId);
      window.setTimeout(() => {
        if (this.copiadoId() === certId) this.copiadoId.set(null);
      }, 2000);
    } catch (e) {
      this.error.set((e as Error).message || 'No se pudo copiar el link.');
    } finally {
      this.accionCertId.set(null);
    }
  }

  async descargarQr(cert: Certificacion): Promise<void> {
    this.accionCertId.set(cert.id);
    this.error.set('');
    try {
      const blob = await this.certs.descargarQrPng(cert.id);
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${cert.numero}-qr.png`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (e) {
      this.error.set((e as Error).message || 'No se pudo descargar el QR.');
    } finally {
      this.accionCertId.set(null);
    }
  }

  async descargarPdf(cert: Certificacion): Promise<void> {
    // Mismo folio institucional que /admin/certificaciones/:id/pdf (no TCPDF backend).
    this.accionCertId.set(cert.id);
    this.error.set('');
    try {
      await this.router.navigate(['/admin/certificaciones', cert.id, 'pdf'], {
        queryParams: { descargar: '1' },
      });
    } catch (e) {
      this.error.set((e as Error).message || 'No se pudo abrir el PDF.');
      this.accionCertId.set(null);
    }
  }

  private clipboardFallback(text: string): void {
    const ta = document.createElement('textarea');
    ta.value = text;
    ta.setAttribute('readonly', '');
    ta.style.position = 'fixed';
    ta.style.left = '-9999px';
    document.body.appendChild(ta);
    ta.select();
    document.execCommand('copy');
    document.body.removeChild(ta);
  }
}
