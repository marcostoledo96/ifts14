import { ChangeDetectionStrategy, Component, computed, inject, input, OnInit, signal } from '@angular/core';
import { DatePipe } from '@angular/common';
import { RouterLink } from '@angular/router';
import { COURSES_SOURCE } from './courses.service';
import { CursoDetalle } from './courses.models';

// Detalle de un curso: nombre, código, estado y fechas. Sin HTTP/storage.
@Component({
  selector: 'app-course-detail-page',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterLink, DatePipe],
  templateUrl: './course-detail-page.html',
  styleUrl: './course-detail-page.css',
})
export class CourseDetailPage implements OnInit {
  // withComponentInputBinding() pasa los route params como strings; el
  // input se declara string y el id numérico se computa con courseId().
  readonly id = input<string>('');

  private readonly courses = inject(COURSES_SOURCE);

  readonly detalle = signal<CursoDetalle | null>(null);
  readonly error = signal('');
  readonly cargando = signal(true);

  // Id numérico validado. NaN, vacío o <= 0 → null (tratado como no encontrado).
  readonly courseId = computed<number | null>(() => {
    const n = Number(this.id());
    return !this.id() || Number.isNaN(n) || n <= 0 ? null : n;
  });

  // ngOnInit: las signals de input() no están disponibles en el ctor;
  // se setean antes del primer detectChanges. OnInit corre con inputs ya
  // ligados, por eso la carga se hace acá y no en el constructor.
  ngOnInit(): void {
    void this.cargar();
  }

  async cargar(): Promise<void> {
    this.cargando.set(true);
    this.error.set('');
    const cid = this.courseId();
    if (cid === null) {
      this.error.set('Curso no encontrado.');
      this.cargando.set(false);
      return;
    }
    try {
      const det = await this.courses.obtener(cid);
      this.detalle.set(det);
    } catch (e) {
      this.error.set((e as Error).message);
    } finally {
      this.cargando.set(false);
    }
  }
}