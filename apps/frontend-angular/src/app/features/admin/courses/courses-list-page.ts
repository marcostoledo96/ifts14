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
import { paginasVisiblesWindow } from '../../../shared/util/paginas-visibles-window';
import { COURSES_SOURCE } from './courses.service';
import {
  COURSES_PAGE_SIZE,
  Curso,
  CUATRIMESTRE_PLACEHOLDER,
  EstadoCurso,
  FiltroEstadoCurso,
} from './courses.models';

type VistaQa = 'datos' | 'cargando' | 'error' | 'vacio-total';

const ESTADO_LABEL: Record<FiltroEstadoCurso, string> = {
  activo: 'Activo',
  inactivo: 'Inactivo',
};

const ESTADO_CHIP_LABEL: Record<FiltroEstadoCurso, string> = {
  activo: 'Activos',
  inactivo: 'Inactivos',
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

// Listado de cursos: una carga HTTP + filtros locales (paridad alumnos).
// Filtro visual activo/inactivo (paridad v0); backend conserva 4 estados.
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
  /** Descarta respuestas de un reintento anterior si ya hay una carga más nueva. */
  private loadGeneration = 0;

  readonly estados: readonly FiltroEstadoCurso[] = ['activo', 'inactivo'];
  readonly vistasQa: readonly VistaQa[] = ['datos', 'cargando', 'error', 'vacio-total'];
  readonly estadoChipLabel = ESTADO_CHIP_LABEL;
  readonly vistaQaLabel = VISTA_QA_LABEL;

  readonly q = signal('');
  readonly estado = signal<FiltroEstadoCurso | 'todos'>('todos');
  readonly conFechas = signal<boolean | null>(null);
  readonly pagina = signal(1);
  readonly vistaQA = signal<VistaQa>('datos');

  /** Archivo completo cargado del seam (sin filtros). */
  readonly cursos = signal<readonly Curso[]>([]);
  readonly cargando = signal(true);
  readonly error = signal('');
  readonly hayFiltrosActivos = computed(
    () => !!this.q().trim() || this.estado() !== 'todos' || this.conFechas() !== null,
  );

  readonly resultadosFiltrados = computed(() => {
    const q = this.q().trim().toLowerCase();
    const filtroEstado = this.estado();
    const conFechas = this.conFechas();
    return this.cursos().filter((c) => {
      const matchTexto =
        !q || c.codigo.toLowerCase().includes(q) || c.nombre.toLowerCase().includes(q);
      const matchEstado =
        filtroEstado === 'todos' ||
        (filtroEstado === 'activo' && c.estado === 'activo') ||
        (filtroEstado === 'inactivo' && c.estado !== 'activo');
      const matchFechas =
        conFechas === null || (c.cantidadFechas > 0) === conFechas;
      return matchTexto && matchEstado && matchFechas;
    });
  });

  readonly totalPaginas = computed(() =>
    Math.max(1, Math.ceil(this.resultadosFiltrados().length / COURSES_PAGE_SIZE)),
  );
  readonly paginaSegura = computed(() => Math.min(this.pagina(), this.totalPaginas()));
  readonly itemsVisibles = computed(() => {
    if (this.vistaQA() !== 'datos') return [];
    const page = this.paginaSegura();
    return this.resultadosFiltrados().slice(
      (page - 1) * COURSES_PAGE_SIZE,
      page * COURSES_PAGE_SIZE,
    );
  });
  /** Páginas visibles en el pager numerado (máx. 5 botones + elipsis). */
  readonly paginasVisibles = computed(() =>
    paginasVisiblesWindow(this.totalPaginas(), this.paginaSegura()),
  );
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
      this.resultadosFiltrados().length === 0 &&
      this.hayFiltrosActivos(),
  );
  readonly mostrarResumen = computed(
    () => this.vistaQA() === 'datos' && !this.cargando() && !this.error(),
  );

  constructor() {
    void this.recargar();
  }

  etiquetaEstado(estado: EstadoCurso): string {
    return ESTADO_LABEL[estado === 'activo' ? 'activo' : 'inactivo'];
  }

  /** Clase CSS del badge: activo vs inactivo (agrupa cerrado/borrador/archivado). */
  claseEstado(estado: EstadoCurso): FiltroEstadoCurso {
    return estado === 'activo' ? 'activo' : 'inactivo';
  }

  formatoMetrica(valor: number | null | undefined): string {
    return valor == null ? '—' : String(valor);
  }

  /** Oculta el placeholder hasta que exista cuatrimestre real en API. */
  etiquetaCodigo(curso: Curso): string {
    const c = curso.cuatrimestre?.trim();
    if (!c || c === CUATRIMESTRE_PLACEHOLDER) return curso.codigo;
    return `${curso.codigo} · ${c}`;
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
      const list = await this.courses.listar();
      if (generation !== this.loadGeneration) return;
      this.cursos.set(list);
      this.pagina.set(Math.min(this.pagina(), this.totalPaginas()));
    } catch {
      if (generation !== this.loadGeneration) return;
      this.error.set('No pudimos cargar el listado de cursos. Reintentá.');
    } finally {
      if (generation !== this.loadGeneration) return;
      this.cargando.set(false);
    }
  }

  onSearch(event: Event): void {
    const value = (event.target as HTMLInputElement).value;
    this.q.set(value);
    this.pagina.set(1);
  }

  onEstado(value: FiltroEstadoCurso): void {
    this.estado.update((current) => (current === value ? 'todos' : value));
    this.pagina.set(1);
  }

  onConFechas(value: boolean): void {
    this.conFechas.update((current) => (current === value ? null : value));
    this.pagina.set(1);
  }

  onPagina(page: number): void {
    this.pagina.set(Math.min(Math.max(1, page), this.totalPaginas()));
  }

  onLimpiarFiltros(): void {
    this.q.set('');
    this.estado.set('todos');
    this.conFechas.set(null);
    this.pagina.set(1);
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
