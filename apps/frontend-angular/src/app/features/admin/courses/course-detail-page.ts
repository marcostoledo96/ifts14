import { ChangeDetectionStrategy, Component, computed, effect, inject, input, signal, untracked } from '@angular/core';
import { DatePipe } from '@angular/common';
import { RouterLink } from '@angular/router';
import { ATTENDANCE_SOURCE } from '../attendances/data/attendance.token';
import { COURSES_SOURCE } from './courses.service';
import { CursoDetalle } from './courses.models';

type AttendanceMetric =
  | { status: 'known'; present: number }
  | { status: 'unavailable'; reason: 'empty' | 'missing-seam' | 'failed' };

// Detalle de un curso: nombre, código, estado y fechas. Sin HTTP/storage.
@Component({
  selector: 'app-course-detail-page',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterLink, DatePipe],
  templateUrl: './course-detail-page.html',
  styleUrl: './course-detail-page.css',
})
export class CourseDetailPage {
  // withComponentInputBinding() pasa los route params como strings; el
  // input se declara string y el id numérico se computa con courseId().
  readonly id = input<string>('');

  private readonly courses = inject(COURSES_SOURCE);
  private readonly attendance = inject(ATTENDANCE_SOURCE, { optional: true });
  // ponytail: contador local para ignorar respuestas de una ruta ya reemplazada.
  private loadGen = 0;

  readonly detalle = signal<CursoDetalle | null>(null);
  readonly metricas = signal<ReadonlyMap<number, AttendanceMetric>>(new Map());
  readonly error = signal('');
  readonly cargando = signal(true);

  // Id numérico validado. NaN, vacío o <= 0 → null (tratado como no encontrado).
  readonly courseId = computed<number | null>(() => {
    const n = Number(this.id());
    return !this.id() || Number.isNaN(n) || n <= 0 ? null : n;
  });

  readonly resumen = computed(() => {
    if (this.cargando()) return 'Cargando curso…';
    if (this.error()) return this.error();
    const detail = this.detalle();
    if (!detail) return 'Curso no encontrado.';
    if (detail.fechas.length === 0) return 'Este curso no tiene fechas programadas.';
    const known = [...this.metricas().values()].filter((metric) => metric.status === 'known' && metric.present > 0).length;
    return `${detail.fechas.length} fechas de cursada. ${known} con asistencias cargadas.`;
  });

  constructor() {
    effect(() => {
      const id = this.id();
      untracked(() => void this.cargar(id));
    });
  }

  async cargar(id: string = this.id()): Promise<void> {
    const gen = ++this.loadGen;
    this.detalle.set(null);
    this.metricas.set(new Map());
    this.cargando.set(true);
    this.error.set('');
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
      const det = await this.courses.obtener(cid);
      if (gen !== this.loadGen) return;
      this.detalle.set(det);
      const settled = await Promise.allSettled(
        det.fechas.map((f) =>
          this.attendance
            ? Promise.resolve().then(() => this.attendance!.listarAsistencias(cid, f.id))
            : Promise.resolve([]),
        ),
      );
      if (gen !== this.loadGen) return;
      this.metricas.set(
        new Map<number, AttendanceMetric>(
          det.fechas.map((f, index) => {
            const result = settled[index];
            if (!this.attendance) return [f.id, { status: 'unavailable', reason: 'missing-seam' }];
            if (result.status === 'rejected') return [f.id, { status: 'unavailable', reason: 'failed' }];
            const present = result.value.filter(
              (attendance) =>
                attendance != null &&
                typeof attendance === 'object' &&
                attendance.cursoId === cid &&
                attendance.cursoFechaId === f.id,
            ).length;
            return present > 0
              ? [f.id, { status: 'known', present }]
              : [f.id, { status: 'unavailable', reason: 'empty' }];
          }),
        ),
      );
    } catch (e) {
      if (gen === this.loadGen) this.error.set((e as Error).message);
    } finally {
      if (gen === this.loadGen) this.cargando.set(false);
    }
  }

  presentesPorFecha(fechaId: number): AttendanceMetric {
    return this.metricas().get(fechaId) ?? { status: 'unavailable', reason: 'missing-seam' };
  }

  accionPorFecha(fechaId: number): 'Cargar' | 'Ver' {
    const metric = this.presentesPorFecha(fechaId);
    return metric.status === 'known' && metric.present > 0 ? 'Ver' : 'Cargar';
  }

  estadoAsistencia(fechaId: number): string {
    const metric = this.presentesPorFecha(fechaId);
    if (metric.status === 'unavailable' && metric.reason !== 'empty') return 'No disponible';
    return metric.status === 'known' && metric.present > 0 ? `${metric.present} presentes` : 'Pendiente';
  }

  conteoAsistencia(fechaId: number): number | null {
    const metric = this.presentesPorFecha(fechaId);
    return metric.status === 'known' ? metric.present : null;
  }

  asistenciaDisponible(fechaId: number): boolean {
    const metric = this.presentesPorFecha(fechaId);
    return metric.status === 'known' || metric.reason === 'empty';
  }
}
