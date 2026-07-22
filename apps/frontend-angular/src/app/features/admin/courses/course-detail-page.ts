import { ChangeDetectionStrategy, Component, computed, effect, inject, input, signal, untracked } from '@angular/core';
import { DatePipe } from '@angular/common';
import { RouterLink } from '@angular/router';
import { ATTENDANCE_SOURCE } from '../attendances/data/attendance.token';
import { COURSES_SOURCE } from './courses.service';
import { CursoDetalle } from './courses.models';
import { UiBackLink } from '../../../shared/ui/ui-back-link';
import { UiSpinner } from '../../../shared/ui/ui-spinner';

type AttendanceMetric =
  | { status: 'known'; present: number }
  | { status: 'unavailable'; reason: 'empty' | 'missing-seam' | 'failed' };

// Detalle de un curso: nombre, código, estado y fechas. Sin HTTP/storage.
@Component({
  selector: 'app-course-detail-page',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterLink, DatePipe, UiBackLink, UiSpinner],
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
      // Curso + asistencias en paralelo (un solo GET de asistencias del curso).
      let all: readonly unknown[] = [];
      let attendanceFailed = false;
      let det: CursoDetalle;

      if (this.attendance) {
        const [detSettled, attSettled] = await Promise.allSettled([
          this.courses.obtener(cid),
          // then() convierte throws síncronos del seam en rejected (no tumba el try).
          Promise.resolve().then(() => this.attendance!.listarAsistenciasDeCurso(cid)),
        ]);
        if (detSettled.status === 'rejected') throw detSettled.reason;
        det = detSettled.value;
        if (attSettled.status === 'fulfilled') {
          all = attSettled.value;
        } else {
          attendanceFailed = true;
        }
      } else {
        det = await this.courses.obtener(cid);
      }
      if (gen !== this.loadGen) return;
      this.detalle.set(det);

      const presentByFecha = new Map<number, number>();
      if (!attendanceFailed && this.attendance) {
        for (const raw of all) {
          if (
            raw != null &&
            typeof raw === 'object' &&
            (raw as { cursoId?: unknown }).cursoId === cid &&
            typeof (raw as { cursoFechaId?: unknown }).cursoFechaId === 'number'
          ) {
            const fechaId = (raw as { cursoFechaId: number }).cursoFechaId;
            presentByFecha.set(fechaId, (presentByFecha.get(fechaId) ?? 0) + 1);
          }
        }
      }

      this.metricas.set(
        new Map<number, AttendanceMetric>(
          det.fechas.map((f) => {
            if (!this.attendance) return [f.id, { status: 'unavailable', reason: 'missing-seam' }];
            if (attendanceFailed) return [f.id, { status: 'unavailable', reason: 'failed' }];
            const present = presentByFecha.get(f.id) ?? 0;
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

  /** Primera fecha usable para CTA “Cargar asistencias” (honesto: deep-link real). */
  primeraFechaAsistencia(detalle: CursoDetalle): number | null {
    const f = detalle.fechas.find(
      (fecha) => fecha.estado !== 'cancelada' && this.asistenciaDisponible(fecha.id),
    );
    return f?.id ?? null;
  }

  presentesPorFecha(fechaId: number): AttendanceMetric {
    return this.metricas().get(fechaId) ?? { status: 'unavailable', reason: 'missing-seam' };
  }

  accionPorFecha(fechaId: number): 'Cargar' | 'Ver y entregar' {
    const metric = this.presentesPorFecha(fechaId);
    return metric.status === 'known' && metric.present > 0 ? 'Ver y entregar' : 'Cargar';
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
