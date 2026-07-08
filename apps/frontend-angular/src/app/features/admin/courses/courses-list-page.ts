import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { DatePipe } from '@angular/common';
import { RouterLink } from '@angular/router';
import { COURSES_SOURCE } from './courses.service';
import { Curso, EstadoCurso } from './courses.models';

// Listado de cursos con filtros y datos demo. Sin HTTP/storage.
@Component({
  selector: 'app-courses-list-page',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterLink, DatePipe],
  templateUrl: './courses-list-page.html',
  styleUrl: './courses-list-page.css',
})
export class CoursesListPage {
  private readonly courses = inject(COURSES_SOURCE);

  readonly estados: readonly EstadoCurso[] = ['borrador', 'activo', 'cerrado', 'archivado'];

  // Filtros locales. Inician sin filtro para mostrar todo el seed.
  readonly q = signal('');
  readonly estado = signal<EstadoCurso | 'todos'>('todos');

  readonly cursos = signal<readonly Curso[]>([]);
  readonly cargando = signal(true);
  readonly error = signal('');

  constructor() {
    void this.recargar();
  }

  async recargar(): Promise<void> {
    this.cargando.set(true);
    this.error.set('');
    try {
      const filtros: { estado?: EstadoCurso; q?: string } = {};
      if (this.estado() !== 'todos') {
        filtros.estado = this.estado() as EstadoCurso;
      }
      const texto = this.q().trim();
      if (texto) {
        filtros.q = texto;
      }
      const list = await this.courses.listar(filtros);
      this.cursos.set(list);
    } catch (e) {
      this.error.set((e as Error).message);
    } finally {
      this.cargando.set(false);
    }
  }

  onSearch(event: Event): void {
    const value = (event.target as HTMLInputElement).value;
    this.q.set(value);
    void this.recargar();
  }

  onEstado(event: Event): void {
    const value = (event.target as HTMLSelectElement).value as EstadoCurso | 'todos';
    this.estado.set(value);
    void this.recargar();
  }
}