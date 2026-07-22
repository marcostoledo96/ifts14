import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { UiSpinner } from '../../../../../shared/ui/ui-spinner';
import { ATTENDANCE_SOURCE } from '../../data/attendance.token';

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

  readonly q = signal('');
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
    this.cargando.set(true);
    this.error.set('');
    try {
      const hub = await this.attendance.listarHub();
      const fechasPorCurso = new Map<number, number>();
      const fechasConPresentes = new Map<number, Set<number>>();

      for (const f of hub.fechas) {
        if (f.estado === 'cancelada') continue;
        fechasPorCurso.set(f.cursoId, (fechasPorCurso.get(f.cursoId) ?? 0) + 1);
      }
      for (const a of hub.asistencias) {
        const set = fechasConPresentes.get(a.cursoId) ?? new Set<number>();
        set.add(a.cursoFechaId);
        fechasConPresentes.set(a.cursoId, set);
      }

      const filas: FilaCurso[] = hub.cursos.map((c) => {
        const asistibles = fechasPorCurso.get(c.id) ?? 0;
        const conPresentes = [...(fechasConPresentes.get(c.id) ?? [])].filter((fechaId) =>
          hub.fechas.some(
            (f) => f.id === fechaId && f.cursoId === c.id && f.estado !== 'cancelada',
          ),
        ).length;
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
    } catch (e) {
      this.error.set((e as Error).message || 'No se pudo cargar el registro de asistencias.');
    } finally {
      this.cargando.set(false);
    }
  }

  onSearch(event: Event): void {
    this.q.set((event.target as HTMLInputElement).value);
  }

  onLimpiarFiltros(): void {
    this.q.set('');
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
