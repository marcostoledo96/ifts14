import {
  ChangeDetectionStrategy,
  Component,
  computed,
  inject,
  InjectionToken,
  isDevMode,
  signal,
} from '@angular/core';
import { RouterLink } from '@angular/router';
import { UiSpinner } from '../../../shared/ui/ui-spinner';
import { COURSES_SOURCE } from './courses.service';
import { COURSES_PAGE_SIZE, Curso, CursosFiltros, EstadoCurso } from './courses.models';

type VistaQa = 'datos' | 'cargando' | 'error' | 'vacio-total';

const ESTADO_LABEL: Record<EstadoCurso, string> = {
  borrador: 'Borrador',
  activo: 'Activo',
  cerrado: 'Cerrado',
  archivado: 'Archivado',
};

const ESTADO_CHIP_LABEL: Record<EstadoCurso, string> = {
  borrador: 'Borrador',
  activo: 'Activos',
  cerrado: 'Cerrados',
  archivado: 'Archivados',
};

const VISTA_QA_LABEL: Record<VistaQa, string> = {
  datos: 'Con datos',
  cargando: 'Cargando',
  error: 'Error',
  'vacio-total': 'Sin cursos',
};

/** Toggle QA de estados de pantalla (paridad v0). Solo en desarrollo. */
export const COURSES_QA_ENABLED = new InjectionToken<boolean>('COURSES_QA_ENABLED', {
  factory: isDevMode,
});

// Listado de cursos: filtros reales + estados de UI (skeleton/vacío/error).
// Estados de curso: contrato backend (4 valores), no el binario activo/inactivo de v0.
@Component({
  selector: 'app-courses-list-page',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterLink, UiSpinner],
  templateUrl: './courses-list-page.html',
  styleUrl: './courses-list-page.css',
})
export class CoursesListPage {
  private readonly courses = inject(COURSES_SOURCE);
  readonly qaEnabled = inject(COURSES_QA_ENABLED);
  // ponytail: contador local; descarta respuestas de filtros que ya no están activos.
  private loadGeneration = 0;

  readonly estados: readonly EstadoCurso[] = ['borrador', 'activo', 'cerrado', 'archivado'];
  readonly vistasQa: readonly VistaQa[] = ['datos', 'cargando', 'error', 'vacio-total'];
  readonly estadoChipLabel = ESTADO_CHIP_LABEL;
  readonly vistaQaLabel = VISTA_QA_LABEL;

  readonly q = signal('');
  readonly estado = signal<EstadoCurso | 'todos'>('todos');
  readonly conFechas = signal<boolean | null>(null);
  readonly pagina = signal(1);
  readonly vistaQA = signal<VistaQa>('datos');

  readonly cursos = signal<readonly Curso[]>([]);
  readonly cargando = signal(true);
  readonly error = signal('');
  readonly hayFiltrosActivos = computed(
    () => !!this.q().trim() || this.estado() !== 'todos' || this.conFechas() !== null,
  );
  readonly totalPaginas = computed(() =>
    Math.max(1, Math.ceil(this.cursos().length / COURSES_PAGE_SIZE)),
  );
  readonly paginaSegura = computed(() => Math.min(this.pagina(), this.totalPaginas()));
  readonly itemsVisibles = computed(() => {
    if (this.vistaQA() !== 'datos') return [];
    const page = this.paginaSegura();
    return this.cursos().slice((page - 1) * COURSES_PAGE_SIZE, page * COURSES_PAGE_SIZE);
  });
  /** Páginas visibles en el pager numerado (máx. 5 botones + elipsis). */
  readonly paginasVisibles = computed(() => {
    const total = this.totalPaginas();
    const actual = this.paginaSegura();
    if (total <= 5) return Array.from({ length: total }, (_, i) => i + 1);
    if (actual <= 3) return [1, 2, 3, 4, 5];
    if (actual >= total - 2) return [total - 4, total - 3, total - 2, total - 1, total];
    return [actual - 2, actual - 1, actual, actual + 1, actual + 2];
  });
  readonly mostrandoCarga = computed(
    () => this.vistaQA() === 'cargando' || (this.vistaQA() === 'datos' && this.cargando()),
  );
  readonly mostrandoError = computed(
    () => this.vistaQA() === 'error' || (this.vistaQA() === 'datos' && !!this.error()),
  );
  readonly vacioTotal = computed(
    () =>
      this.vistaQA() === 'vacio-total' ||
      (this.vistaQA() === 'datos' &&
        !this.cargando() &&
        !this.error() &&
        this.cursos().length === 0 &&
        !this.hayFiltrosActivos()),
  );
  readonly sinCoincidencias = computed(
    () =>
      this.vistaQA() === 'datos' &&
      !this.cargando() &&
      !this.error() &&
      this.cursos().length === 0 &&
      this.hayFiltrosActivos(),
  );
  readonly mostrarResumen = computed(
    () => this.vistaQA() === 'datos' && !this.cargando() && !this.error(),
  );

  constructor() {
    void this.recargar();
  }

  etiquetaEstado(estado: EstadoCurso): string {
    return ESTADO_LABEL[estado];
  }

  formatoMetrica(valor: number | null | undefined): string {
    return valor == null ? '—' : String(valor);
  }

  esInactivoVisual(estado: EstadoCurso): boolean {
    return estado !== 'activo';
  }

  async recargar(): Promise<void> {
    const generation = ++this.loadGeneration;
    if (this.vistaQA() !== 'datos') return;
    this.cargando.set(true);
    this.error.set('');
    try {
      const texto = this.q().trim();
      const filtros: CursosFiltros = {
        ...(this.estado() !== 'todos' ? { estado: this.estado() as EstadoCurso } : {}),
        ...(texto ? { q: texto } : {}),
        ...(this.conFechas() !== null ? { conFechas: this.conFechas() as boolean } : {}),
      };
      const list = await this.courses.listar(filtros);
      if (generation !== this.loadGeneration) return;
      this.cursos.set(list);
      this.pagina.set(Math.min(this.pagina(), this.totalPaginas()));
    } catch {
      if (generation !== this.loadGeneration) return;
      this.error.set('No se pudo cargar el listado de cursos. Reintentá.');
    } finally {
      if (generation !== this.loadGeneration) return;
      this.cargando.set(false);
    }
  }

  onSearch(event: Event): void {
    const value = (event.target as HTMLInputElement).value;
    this.q.set(value);
    this.pagina.set(1);
    void this.recargar();
  }

  onEstado(value: EstadoCurso): void {
    this.estado.update((current) => (current === value ? 'todos' : value));
    this.pagina.set(1);
    void this.recargar();
  }

  onConFechas(value: boolean): void {
    this.conFechas.update((current) => (current === value ? null : value));
    this.pagina.set(1);
    void this.recargar();
  }

  onPagina(page: number): void {
    this.pagina.set(Math.min(Math.max(1, page), this.totalPaginas()));
  }

  onLimpiarFiltros(): void {
    this.q.set('');
    this.estado.set('todos');
    this.conFechas.set(null);
    this.pagina.set(1);
    void this.recargar();
  }

  onVistaQA(value: VistaQa): void {
    if (!this.qaEnabled) return;
    this.vistaQA.set(value);
    this.pagina.set(1);
    if (value === 'datos') void this.recargar();
  }

  onReintentar(): void {
    if (this.qaEnabled && this.vistaQA() !== 'datos') {
      this.vistaQA.set('datos');
      this.pagina.set(1);
    }
    void this.recargar();
  }
}
