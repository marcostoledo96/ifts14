import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { UiSpinner } from '../../../../../shared/ui/ui-spinner';
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
  imports: [RouterLink, UiSpinner],
  templateUrl: './attendances-list-page.html',
  styleUrl: './attendances-list-page.css',
})
export class AttendancesListPage {
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
      // Un solo GET /admin/hub/asistencias (mock: arma el hub en memoria).
      const hub = await this.attendance.listarHub();
      const total = hub.alumnosActivos;
      const cursoById = new Map(hub.cursos.map((c) => [c.id, c]));
      const presentesPorFecha = new Map<number, number>();
      for (const a of hub.asistencias) {
        presentesPorFecha.set(
          a.cursoFechaId,
          (presentesPorFecha.get(a.cursoFechaId) ?? 0) + 1,
        );
      }
      const filas: FilaAsistencia[] = [];
      for (const f of hub.fechas) {
        if (f.estado === 'cancelada') continue;
        const c = cursoById.get(f.cursoId);
        if (!c) continue;
        filas.push({
          curso: {
            id: c.id,
            codigo: c.codigo,
            nombre: c.nombre,
            estado: c.estado as Curso['estado'],
            createdAt: '',
            updatedAt: '',
            cuatrimestre: 'Sin programar',
            cantidadFechas: 0,
            alumnosPresentes: null,
            certificaciones: null,
          },
          fecha: {
            id: f.id,
            cursoId: f.cursoId,
            fecha: f.fecha,
            descripcion: f.descripcion,
            orden: f.orden,
            estado: f.estado,
          },
          presentes: presentesPorFecha.get(f.id) ?? 0,
          total,
        });
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
