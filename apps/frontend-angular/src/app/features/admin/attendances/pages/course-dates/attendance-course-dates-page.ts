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
import { RouterLink } from '@angular/router';
import { UiSpinner } from '../../../../../shared/ui/ui-spinner';
import { ATTENDANCE_SOURCE } from '../../data/attendance.token';
import type { EstadoFecha } from '../../../courses/courses.models';

type EstadoFiltro = 'todas' | 'programada' | 'realizada';

interface FilaFechaCurso {
  readonly id: number;
  readonly cursoId: number;
  readonly fecha: string;
  readonly descripcion: string | null;
  readonly orden: number;
  readonly estado: EstadoFecha;
  readonly presentes: number;
}

const fmtFecha = new Intl.DateTimeFormat('es-AR', {
  weekday: 'short',
  day: '2-digit',
  month: 'short',
  year: 'numeric',
});

/** Intermedia: fechas asistibles de un curso → marcado. */
@Component({
  selector: 'app-attendance-course-dates-page',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterLink, UiSpinner],
  templateUrl: './attendance-course-dates-page.html',
  styleUrl: './attendance-course-dates-page.css',
})
export class AttendanceCourseDatesPage {
  readonly id = input<string>('');

  private readonly attendance = inject(ATTENDANCE_SOURCE);
  private loadGen = 0;

  readonly cursoNombre = signal('');
  readonly cursoCodigo = signal('');
  readonly filas = signal<readonly FilaFechaCurso[]>([]);
  readonly q = signal('');
  readonly estado = signal<EstadoFiltro>('todas');
  readonly cargando = signal(true);
  readonly error = signal('');
  readonly skeletonRows = [0, 1, 2, 3] as const;

  readonly estados: readonly EstadoFiltro[] = ['todas', 'programada', 'realizada'];
  readonly estadoChipLabel: Record<EstadoFiltro, string> = {
    todas: 'Todas',
    programada: 'Programadas',
    realizada: 'Realizadas',
  };

  readonly filtradas = computed<readonly FilaFechaCurso[]>(() => {
    const texto = this.q().trim().toLowerCase();
    const est = this.estado();
    return this.filas().filter((f) => {
      if (est !== 'todas' && f.estado !== est) return false;
      if (!texto) return true;
      return (
        f.fecha.includes(texto) ||
        (f.descripcion?.toLowerCase().includes(texto) ?? false)
      );
    });
  });

  readonly hayFiltrosActivos = computed(
    () => this.q().trim().length > 0 || this.estado() !== 'todas',
  );

  readonly mostrarResumen = computed(
    () => !this.cargando() && !this.error() && this.filas().length > 0,
  );

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

  readonly courseId = computed<number | null>(() => {
    const n = Number(this.id());
    return !this.id() || Number.isNaN(n) || n <= 0 ? null : n;
  });

  constructor() {
    effect(() => {
      const id = this.id();
      untracked(() => void this.cargar(id));
    });
  }

  async cargar(id: string = this.id()): Promise<void> {
    const gen = ++this.loadGen;
    this.cargando.set(true);
    this.error.set('');
    this.filas.set([]);
    this.cursoNombre.set('');
    this.cursoCodigo.set('');
    // Al cambiar de curso (ruta reutilizada) no arrastrar búsqueda/filtro previo.
    this.q.set('');
    this.estado.set('todas');

    const n = Number(id);
    const cid = !id || Number.isNaN(n) || n <= 0 ? null : n;
    if (cid === null) {
      if (gen === this.loadGen) {
        this.error.set('Curso no encontrado.');
        this.cargando.set(false);
      }
      return;
    }

    try {
      const hub = await this.attendance.listarHub();
      if (gen !== this.loadGen) return;

      const curso = hub.cursos.find((c) => c.id === cid);
      if (!curso) {
        this.error.set('Curso no encontrado.');
        return;
      }

      this.cursoNombre.set(curso.nombre);
      this.cursoCodigo.set(curso.codigo);

      const presentesPorFecha = new Map<number, number>();
      for (const a of hub.asistencias) {
        if (a.cursoId !== cid) continue;
        presentesPorFecha.set(
          a.cursoFechaId,
          (presentesPorFecha.get(a.cursoFechaId) ?? 0) + 1,
        );
      }

      const filas: FilaFechaCurso[] = hub.fechas
        .filter((f) => f.cursoId === cid && f.estado !== 'cancelada')
        .map((f) => ({
          id: f.id,
          cursoId: f.cursoId,
          fecha: f.fecha,
          descripcion: f.descripcion,
          orden: f.orden,
          estado: f.estado,
          presentes: presentesPorFecha.get(f.id) ?? 0,
        }));

      filas.sort((a, b) => {
        const prio = (e: string) => (e === 'programada' ? 0 : e === 'realizada' ? 1 : 2);
        const pe = prio(a.estado) - prio(b.estado);
        if (pe !== 0) return pe;
        return a.fecha.localeCompare(b.fecha);
      });
      this.filas.set(filas);
    } catch {
      if (gen === this.loadGen) {
        this.error.set('No se pudieron cargar las fechas. Reintentá.');
      }
    } finally {
      if (gen === this.loadGen) this.cargando.set(false);
    }
  }

  onSearch(event: Event): void {
    this.q.set((event.target as HTMLInputElement).value);
  }

  onEstado(e: EstadoFiltro): void {
    this.estado.set(this.estado() === e ? 'todas' : e);
  }

  onLimpiarFiltros(): void {
    this.q.set('');
    this.estado.set('todas');
  }

  onReintentar(): void {
    void this.cargar();
  }

  formatFecha(iso: string): string {
    const [y, m, d] = iso.split('-').map(Number);
    if (!y || !m || !d) return iso;
    return fmtFecha.format(new Date(y, m - 1, d));
  }

  etiquetaEstado(estado: string): string {
    if (estado === 'programada') return 'Programada';
    if (estado === 'realizada') return 'Realizada';
    return estado;
  }

  linkMarcado(fila: FilaFechaCurso): unknown[] {
    return ['/admin/cursos', fila.cursoId, 'fechas', fila.id, 'asistencias'];
  }

  linkDetalleCurso(): unknown[] {
    const cid = this.courseId();
    return cid === null ? ['/admin/cursos'] : ['/admin/cursos', cid];
  }
}
