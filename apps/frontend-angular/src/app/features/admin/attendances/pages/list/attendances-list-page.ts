import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { COURSES_SOURCE } from '../../../courses/courses.service';
import { Curso, CursoFecha } from '../../../courses/courses.models';
import { ATTENDANCE_SOURCE } from '../../data/attendance.token';

type EstadoFiltro = 'todas' | 'programada' | 'realizada';

interface FilaAsistencia {
  readonly curso: Curso;
  readonly fecha: CursoFecha;
  /** Conteos demostrativos por fecha (derivados del mock en memoria). */
  readonly presentes: number;
  readonly total: number;
}

const fmtFecha = new Intl.DateTimeFormat('es-AR', {
  weekday: 'short',
  day: '2-digit',
  month: 'short',
  year: 'numeric',
});

/** Hub de fechas asistibles → marcado. Sin HTTP/storage. */
@Component({
  selector: 'app-attendances-list-page',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterLink],
  templateUrl: './attendances-list-page.html',
  styleUrl: './attendances-list-page.css',
})
export class AttendancesListPage {
  private readonly courses = inject(COURSES_SOURCE);
  private readonly attendance = inject(ATTENDANCE_SOURCE);

  readonly q = signal('');
  readonly estado = signal<EstadoFiltro>('todas');
  readonly filas = signal<readonly FilaAsistencia[]>([]);
  readonly cargando = signal(true);
  readonly error = signal('');
  readonly skeletonRows = [0, 1, 2, 3, 4] as const;

  readonly estados: readonly EstadoFiltro[] = ['todas', 'programada', 'realizada'];
  readonly estadoChipLabel: Record<EstadoFiltro, string> = {
    todas: 'Todas',
    programada: 'Programadas',
    realizada: 'Realizadas',
  };

  readonly filtradas = computed<readonly FilaAsistencia[]>(() => {
    const texto = this.q().trim().toLowerCase();
    const est = this.estado();
    return this.filas().filter((f) => {
      if (est !== 'todas' && f.fecha.estado !== est) return false;
      if (!texto) return true;
      return (
        f.curso.nombre.toLowerCase().includes(texto) ||
        f.curso.codigo.toLowerCase().includes(texto) ||
        f.fecha.fecha.includes(texto) ||
        (f.fecha.descripcion?.toLowerCase().includes(texto) ?? false)
      );
    });
  });

  readonly hayFiltrosActivos = computed(
    () => this.q().trim().length > 0 || this.estado() !== 'todas',
  );

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
    this.cargando.set(true);
    this.error.set('');
    try {
      const list = await this.courses.listar();
      const filas: FilaAsistencia[] = [];
      for (const c of list) {
        const det = await this.courses.obtener(c.id);
        const asistibles = det.fechas.filter((f) => f.estado !== 'cancelada');
        if (asistibles.length === 0) continue;
        const alumnos = await this.attendance.listarAlumnos(c.id);
        const total = alumnos.length;
        for (const f of asistibles) {
          const asistencias = await this.attendance.listarAsistencias(c.id, f.id);
          filas.push({ curso: c, fecha: f, presentes: asistencias.length, total });
        }
      }
      filas.sort((a, b) => {
        const prio = (e: string) => (e === 'programada' ? 0 : e === 'realizada' ? 1 : 2);
        const pe = prio(a.fecha.estado) - prio(b.fecha.estado);
        if (pe !== 0) return pe;
        return a.fecha.fecha.localeCompare(b.fecha.fecha);
      });
      this.filas.set(filas);
    } catch (e) {
      this.error.set((e as Error).message || 'No se pudo cargar el registro de asistencias.');
    } finally {
      this.cargando.set(false);
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

  linkMarcado(fila: FilaAsistencia): unknown[] {
    return ['/admin/cursos', fila.curso.id, 'fechas', fila.fecha.id, 'asistencias'];
  }
}
