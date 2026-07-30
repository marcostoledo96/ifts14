import {
  ChangeDetectionStrategy,
  Component,
  computed,
  inject,
  InjectionToken,
  isDevMode,
  signal,
} from '@angular/core';
import { RouterModule } from '@angular/router';
import { UiSpinner } from '../../../../../shared/ui/ui-spinner';
import { paginasVisiblesWindow } from '../../../../../shared/util/paginas-visibles-window';
import { Alumno, STUDENTS_PAGE_SIZE } from '../../students.models';
import { STUDENTS_SOURCE } from '../../students.service';

type VistaQa = 'datos' | 'cargando' | 'error' | 'vacio-total';
/** Solo "sin-email" en chips (paridad v0); "con-email" queda disponible vía código si se necesita. */
type Contacto = 'todos' | 'con-email' | 'sin-email';
type Certificacion = 'todos' | 'con-cert' | 'sin-cert';

const VISTA_QA_LABEL: Record<VistaQa, string> = {
  datos: 'Con datos',
  cargando: 'Cargando',
  error: 'Error',
  'vacio-total': 'Sin registros',
};

export const STUDENTS_QA_ENABLED = new InjectionToken<boolean>('STUDENTS_QA_ENABLED', {
  factory: isDevMode,
});

@Component({
  selector: 'app-students-list-page',
  standalone: true,
  imports: [RouterModule, UiSpinner],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './students-list-page.html',
  styleUrl: './students-list-page.css',
})
export class StudentsListPage {
  private readonly students = inject(STUDENTS_SOURCE);
  readonly qaEnabled = inject(STUDENTS_QA_ENABLED);
  private loadGeneration = 0;

  readonly vistasQa: readonly VistaQa[] = ['datos', 'cargando', 'error', 'vacio-total'];
  readonly vistaQaLabel = VISTA_QA_LABEL;
  readonly skeletonRows = [1, 2, 3, 4, 5] as const;

  readonly q = signal('');
  readonly contacto = signal<Contacto>('todos');
  readonly certificacion = signal<Certificacion>('todos');
  readonly pagina = signal(1);
  readonly vistaQA = signal<VistaQa>('datos');
  readonly alumnos = signal<readonly Alumno[]>([]);
  readonly cargando = signal(true);
  readonly error = signal('');

  readonly hayFiltrosActivos = computed(
    () => !!this.q().trim() || this.contacto() !== 'todos' || this.certificacion() !== 'todos',
  );

  readonly resultadosFiltrados = computed(() => {
    const q = this.q().trim().toLowerCase();
    return this.alumnos().filter((alumno) => {
      const nombreCompleto = `${alumno.apellido} ${alumno.nombre}`.toLowerCase();
      const nombreInvertido = `${alumno.nombre} ${alumno.apellido}`.toLowerCase();
      const matchTexto =
        !q ||
        alumno.nombre.toLowerCase().includes(q) ||
        alumno.apellido.toLowerCase().includes(q) ||
        nombreCompleto.includes(q) ||
        nombreInvertido.includes(q) ||
        alumno.dniMostrar.toLowerCase().includes(q);
      const matchContacto =
        this.contacto() === 'todos' ||
        (this.contacto() === 'con-email' && alumno.tieneEmail === true) ||
        (this.contacto() === 'sin-email' && alumno.tieneEmail === false);
      const matchCert =
        this.certificacion() === 'todos' ||
        (this.certificacion() === 'con-cert' &&
          alumno.certificacionesValidas != null &&
          alumno.certificacionesValidas > 0) ||
        (this.certificacion() === 'sin-cert' &&
          alumno.certificacionesValidas != null &&
          alumno.certificacionesValidas === 0);
      return matchTexto && matchContacto && matchCert;
    });
  });

  readonly totalPaginas = computed(() =>
    Math.max(1, Math.ceil(this.resultadosFiltrados().length / STUDENTS_PAGE_SIZE)),
  );
  readonly paginaSegura = computed(() => Math.min(this.pagina(), this.totalPaginas()));
  readonly itemsVisibles = computed(() => {
    if (this.vistaQA() !== 'datos') return [];
    const page = this.paginaSegura();
    return this.resultadosFiltrados().slice(
      (page - 1) * STUDENTS_PAGE_SIZE,
      page * STUDENTS_PAGE_SIZE,
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
        !this.hayFiltrosActivos() &&
        this.alumnos().length === 0),
  );
  readonly sinCoincidencias = computed(
    () =>
      this.vistaQA() === 'datos' &&
      !this.cargando() &&
      !this.error() &&
      this.hayFiltrosActivos() &&
      this.resultadosFiltrados().length === 0,
  );
  readonly mostrarResumen = computed(
    () => this.vistaQA() === 'datos' && !this.cargando() && !this.error(),
  );

  constructor() {
    void this.recargar();
  }

  async recargar(): Promise<void> {
    const generation = ++this.loadGeneration;
    if (this.vistaQA() !== 'datos') return;
    this.cargando.set(true);
    this.error.set('');
    try {
      const list = await this.students.listar();
      if (generation !== this.loadGeneration) return;
      this.alumnos.set(list);
      this.pagina.set(Math.min(this.pagina(), this.totalPaginas()));
    } catch {
      if (generation !== this.loadGeneration) return;
      this.error.set('No se pudo cargar el listado de alumnos. Reintentá.');
    } finally {
      if (generation === this.loadGeneration) this.cargando.set(false);
    }
  }

  onSearch(event: Event): void {
    this.q.set((event.target as HTMLInputElement).value);
    this.pagina.set(1);
  }

  onContacto(value: Exclude<Contacto, 'todos'>): void {
    this.contacto.update((current) => (current === value ? 'todos' : value));
    this.pagina.set(1);
  }

  onCertificacion(value: Exclude<Certificacion, 'todos'>): void {
    this.certificacion.update((current) => {
      if (current === value) return 'todos';
      return value;
    });
    this.pagina.set(1);
  }

  onPagina(page: number): void {
    this.pagina.set(Math.min(Math.max(1, page), this.totalPaginas()));
  }

  onLimpiar(): void {
    this.q.set('');
    this.contacto.set('todos');
    this.certificacion.set('todos');
    this.pagina.set(1);
  }

  onForzarEstado(value: VistaQa): void {
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

  etiquetaContacto(alumno: Alumno): string {
    if (alumno.tieneEmail === true) return 'Contacto disponible';
    if (alumno.tieneEmail === false) return 'Sin email';
    return 'Sin dato';
  }

  mostrarWarningSinEmail(alumno: Alumno): boolean {
    return alumno.tieneEmail === false;
  }

  formatoMetrica(value: number | null): string {
    return value == null ? '—' : String(value);
  }

  mostrarShield(alumno: Alumno): boolean {
    return alumno.certificacionesValidas != null;
  }

  mostrarBook(alumno: Alumno): boolean {
    return alumno.cursosConAsistencia != null;
  }
}
