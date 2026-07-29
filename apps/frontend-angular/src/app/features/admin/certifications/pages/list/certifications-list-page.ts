import { ChangeDetectionStrategy, Component, computed, inject, InjectionToken, isDevMode, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { UiSpinner } from '../../../../../shared/ui/ui-spinner';
import { CERTIFICATIONS_SOURCE } from '../../certifications.service';
import {
  Certificacion,
  EstadoCertificado,
  PAGINA_TAMANO,
} from '../../certifications.models';

type VistaQa = 'datos' | 'cargando' | 'error' | 'vacio-total';

const ESTADO_LABEL: Record<EstadoCertificado, string> = {
  vigente: 'Válida',
  revocado: 'Revocado',
};

export const CERTIFICATIONS_QA_ENABLED = new InjectionToken<boolean>('CERTIFICATIONS_QA_ENABLED', {
  factory: isDevMode,
});

@Component({
  selector: 'app-certifications-list-page',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterLink, UiSpinner],
  templateUrl: './certifications-list-page.html',
  styleUrl: './certifications-list-page.css',
})
export class CertificationsListPage {
  private readonly certs = inject(CERTIFICATIONS_SOURCE);
  readonly qaEnabled = inject(CERTIFICATIONS_QA_ENABLED);
  // ponytail: descarta respuestas de filtros que ya no son la generación activa.
  private loadGeneration = 0;

  readonly estados: readonly EstadoCertificado[] = ['vigente', 'revocado'];
  readonly estadoLabel = ESTADO_LABEL;
  readonly q = signal('');
  readonly estado = signal<EstadoCertificado | 'todos'>('todos');
  readonly curso = signal('todos');
  readonly pagina = signal(1);
  readonly vistaQA = signal<VistaQa>('datos');
  readonly certificados = signal<readonly Certificacion[]>([]);
  readonly cargando = signal(true);
  readonly error = signal('');
  readonly cursos = computed(() => [...new Set(this.certificados().map((c) => c.cursoNombre))]);
  readonly hayFiltrosActivos = computed(
    () => !!this.q().trim() || this.estado() !== 'todos' || this.curso() !== 'todos',
  );
  readonly resultadosFiltrados = computed(() => {
    const texto = this.q().trim().toLowerCase();
    return this.certificados().filter(
      (c) =>
        (this.estado() === 'todos' || c.estado === this.estado()) &&
        (this.curso() === 'todos' || c.cursoNombre === this.curso()) &&
        (!texto ||
          c.nombreAlumno.toLowerCase().includes(texto) ||
          c.cursoNombre.toLowerCase().includes(texto) ||
          c.documentMasked.toLowerCase().includes(texto) ||
          c.numero.toLowerCase().includes(texto)),
    );
  });
  readonly totalPaginas = computed(() => Math.max(1, Math.ceil(this.resultadosFiltrados().length / PAGINA_TAMANO)));
  readonly paginaSegura = computed(() => Math.min(this.pagina(), this.totalPaginas()));
  readonly itemsVisibles = computed(() => {
    if (this.vistaQA() !== 'datos') return [];
    const page = this.paginaSegura();
    return this.resultadosFiltrados().slice((page - 1) * PAGINA_TAMANO, page * PAGINA_TAMANO);
  });
  readonly paginasVisibles = computed(() => {
    const total = this.totalPaginas();
    const actual = this.paginaSegura();
    if (total <= 5) return Array.from({ length: total }, (_, i) => i + 1);
    if (actual <= 3) return [1, 2, 3, 4, 5];
    if (actual >= total - 2) return [total - 4, total - 3, total - 2, total - 1, total];
    return [actual - 2, actual - 1, actual, actual + 1, actual + 2];
  });
  readonly mostrarResumen = computed(
    () => this.vistaQA() === 'datos' && !this.cargando() && !this.error(),
  );
  readonly vacioTotal = computed(() => this.vistaQA() === 'vacio-total' || (!this.cargando() && !this.error() && !this.hayFiltrosActivos() && this.certificados().length === 0));
  readonly sinCoincidencias = computed(() => !this.cargando() && !this.error() && this.vistaQA() === 'datos' && this.hayFiltrosActivos() && this.resultadosFiltrados().length === 0);

  constructor() { void this.recargar(); }

  etiquetaEstado(estado: EstadoCertificado): string {
    return ESTADO_LABEL[estado];
  }

  formatEmision(iso: string | null): string {
    if (!iso) return '—';
    const [y, m, d] = iso.split('-').map(Number);
    if (!y || !m || !d) return iso;
    return new Intl.DateTimeFormat('es-AR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    }).format(new Date(y, m - 1, d));
  }

  readonly skeletonRows = [0, 1, 2, 3, 4] as const;

  async recargar(): Promise<void> {
    if (this.vistaQA() !== 'datos') return;
    const generation = ++this.loadGeneration;
    this.cargando.set(true);
    this.error.set('');
    try {
      const list = await this.certs.listar();
      if (generation !== this.loadGeneration) return;
      this.certificados.set(list);
      this.pagina.set(Math.min(this.pagina(), this.totalPaginas()));
    } catch {
      if (generation !== this.loadGeneration) return;
      this.error.set('No se pudo cargar el listado de certificaciones. Reintentá.');
    } finally {
      if (generation === this.loadGeneration) this.cargando.set(false);
    }
  }

  onSearch(event: Event): void { this.q.set((event.target as HTMLInputElement).value); this.pagina.set(1); }
  onEstado(value: EstadoCertificado): void { this.estado.update((current) => current === value ? 'todos' : value); this.pagina.set(1); }
  onCurso(event: Event): void { this.curso.set((event.target as HTMLSelectElement).value); this.pagina.set(1); }
  onLimpiarFiltros(): void { this.q.set(''); this.estado.set('todos'); this.curso.set('todos'); this.pagina.set(1); }
  onPagina(page: number): void { this.pagina.set(Math.min(Math.max(1, page), this.totalPaginas())); }
  onVistaQA(value: VistaQa): void { if (!this.qaEnabled) return; this.vistaQA.set(value); this.pagina.set(1); if (value === 'datos') void this.recargar(); }
  onReintentar(): void { if (this.qaEnabled && this.vistaQA() !== 'datos') { this.vistaQA.set('datos'); this.pagina.set(1); } void this.recargar(); }
}
