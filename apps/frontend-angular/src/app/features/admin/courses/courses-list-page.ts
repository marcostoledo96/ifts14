import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { COURSES_SOURCE } from './courses.service';
import { Curso, CursosFiltros, EstadoCurso } from './courses.models';

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

// Listado de cursos con filtros y datos demo. Sin HTTP/storage.
@Component({
  selector: 'app-courses-list-page',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterLink],
  templateUrl: './courses-list-page.html',
  styleUrl: './courses-list-page.css',
})
export class CoursesListPage {
  private readonly courses = inject(COURSES_SOURCE);
  // ponytail: contador local; descarta respuestas de filtros que ya no están activos.
  private loadGeneration = 0;

  readonly estados: readonly EstadoCurso[] = ['borrador', 'activo', 'cerrado', 'archivado'];
  readonly estadoChipLabel = ESTADO_CHIP_LABEL;

  // Filtros locales. Inician sin filtro para mostrar todo el seed.
  readonly q = signal('');
  readonly estado = signal<EstadoCurso | 'todos'>('todos');
  readonly conFechas = signal<boolean | null>(null);

  readonly cursos = signal<readonly Curso[]>([]);
  readonly cargando = signal(true);
  readonly error = signal('');
  readonly hayFiltrosActivos = computed(
    () => !!this.q().trim() || this.estado() !== 'todos' || this.conFechas() !== null,
  );
  readonly vacioTotal = computed(
    () => !this.cargando() && !this.error() && this.cursos().length === 0 && !this.hayFiltrosActivos(),
  );
  readonly sinCoincidencias = computed(
    () => !this.cargando() && !this.error() && this.cursos().length === 0 && this.hayFiltrosActivos(),
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

  async recargar(): Promise<void> {
    const generation = ++this.loadGeneration;
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
    void this.recargar();
  }

  onEstado(value: EstadoCurso): void {
    this.estado.update((current) => (current === value ? 'todos' : value));
    void this.recargar();
  }

  onConFechas(value: boolean): void {
    this.conFechas.update((current) => (current === value ? null : value));
    void this.recargar();
  }

  onLimpiarFiltros(): void {
    this.q.set('');
    this.estado.set('todos');
    this.conFechas.set(null);
    void this.recargar();
  }

  onReintentar(): void {
    void this.recargar();
  }
}
