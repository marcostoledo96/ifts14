import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { UiSpinner } from '../../../../../shared/ui/ui-spinner';
import { paginasVisiblesWindow } from '../../../../../shared/util/paginas-visibles-window';
import { ATTENDANCE_SOURCE } from '../../data/attendance.token';
import { ATTENDANCES_PAGE_SIZE } from '../../models/attendance.types';

interface FilaCurso {
  readonly id: number;
  readonly codigo: string;
  readonly nombre: string;
  readonly estado: string;
  readonly fechasAsistibles: number;
  readonly fechasConPresentes: number;
}

const ESTADO_CURSO_LABEL: Record<string, string> = {
  borrador: 'Borrador',
  activo: 'Activo',
  cerrado: 'Cerrado',
  archivado: 'Archivado',
};

/** Hub de cursos → intermedia de fechas. Sin HTTP/storage. */
@Component({
  selector: 'app-attendances-list-page',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterLink, UiSpinner],
  templateUrl: './attendances-list-page.html',
  styleUrl: './attendances-list-page.css',
})
export class AttendancesListPage {
  private readonly attendance = inject(ATTENDANCE_SOURCE);
  /** Descarta respuestas obsoletas si hay reintentos solapados. */
  private loadGen = 0;

  readonly q = signal('');
  readonly pagina = signal(1);
  readonly filas = signal<readonly FilaCurso[]>([]);
  readonly cargando = signal(true);
  readonly error = signal('');
  readonly skeletonRows = [0, 1, 2, 3, 4] as const;

  readonly filtradas = computed<readonly FilaCurso[]>(() => {
    const texto = this.q().trim().toLowerCase();
    if (!texto) return this.filas();
    return this.filas().filter(
      (f) =>
        f.nombre.toLowerCase().includes(texto) || f.codigo.toLowerCase().includes(texto),
    );
  });

  readonly totalPaginas = computed(() =>
    Math.max(1, Math.ceil(this.filtradas().length / ATTENDANCES_PAGE_SIZE)),
  );
  readonly paginaSegura = computed(() => Math.min(this.pagina(), this.totalPaginas()));
  readonly itemsVisibles = computed(() => {
    const page = this.paginaSegura();
    return this.filtradas().slice(
      (page - 1) * ATTENDANCES_PAGE_SIZE,
      page * ATTENDANCES_PAGE_SIZE,
    );
  });
  /** Páginas visibles en el pager numerado (máx. 5 botones + elipsis). */
  readonly paginasVisibles = computed(() =>
    paginasVisiblesWindow(this.totalPaginas(), this.paginaSegura()),
  );

  readonly hayFiltrosActivos = computed(() => this.q().trim().length > 0);

  readonly mostrarResumen = computed(() => !this.cargando() && !this.error());

  readonly vacioTotal = computed(
    () => !this.cargando() && !this.error() && this.filas().length === 0,
  );

  readonly vacioFiltro = computed(
    () =>
      !this.cargando() &&
      !this.error() &&
      this.filas().length > 0 &&
      this.filtradas().length === 0,
  );

  constructor() {
    void this.cargar();
  }

  async cargar(): Promise<void> {
    const gen = ++this.loadGen;
    this.cargando.set(true);
    this.error.set('');
    try {
      const hub = await this.attendance.listarHub();
      if (gen !== this.loadGen) return;

      // Índices lineales: N = asistibles ≠ cancelada; M = presentes ∩ asistibles del curso.
      const asistibleById = new Map<number, number>();
      const fechasPorCurso = new Map<number, number>();
      const presentesPorCurso = new Map<number, Set<number>>();

      for (const f of hub.fechas) {
        if (f.estado === 'cancelada') continue;
        asistibleById.set(f.id, f.cursoId);
        fechasPorCurso.set(f.cursoId, (fechasPorCurso.get(f.cursoId) ?? 0) + 1);
      }
      for (const a of hub.asistencias) {
        const set = presentesPorCurso.get(a.cursoId) ?? new Set<number>();
        set.add(a.cursoFechaId);
        presentesPorCurso.set(a.cursoId, set);
      }

      const filas: FilaCurso[] = hub.cursos.map((c) => {
        const asistibles = fechasPorCurso.get(c.id) ?? 0;
        let conPresentes = 0;
        for (const fechaId of presentesPorCurso.get(c.id) ?? []) {
          if (asistibleById.get(fechaId) === c.id) conPresentes += 1;
        }
        return {
          id: c.id,
          codigo: c.codigo,
          nombre: c.nombre,
          estado: c.estado,
          fechasAsistibles: asistibles,
          fechasConPresentes: conPresentes,
        };
      });

      filas.sort((a, b) => a.codigo.localeCompare(b.codigo));
      this.filas.set(filas);
      this.pagina.set(Math.min(this.pagina(), this.totalPaginas()));
    } catch {
      if (gen !== this.loadGen) return;
      this.error.set('No se pudo cargar el registro de asistencias. Reintentá.');
    } finally {
      if (gen === this.loadGen) this.cargando.set(false);
    }
  }

  onSearch(event: Event): void {
    this.q.set((event.target as HTMLInputElement).value);
    this.pagina.set(1);
  }

  onPagina(page: number): void {
    this.pagina.set(Math.min(Math.max(1, page), this.totalPaginas()));
  }

  onLimpiarFiltros(): void {
    this.q.set('');
    this.pagina.set(1);
  }

  onReintentar(): void {
    void this.cargar();
  }

  etiquetaEstado(estado: string): string {
    return ESTADO_CURSO_LABEL[estado] ?? estado;
  }

  linkIntermedia(fila: FilaCurso): unknown[] {
    return ['/admin/asistencias/curso', fila.id];
  }

  textoMetricas(fila: FilaCurso): string {
    const n = fila.fechasAsistibles;
    const m = fila.fechasConPresentes;
    const fechas = n === 1 ? '1 fecha asistible' : `${n} fechas asistibles`;
    if (m === 0) return fechas;
    return `${fechas} · ${m} con presentes`;
  }
}
