import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { COURSES_SOURCE } from '../../../courses/courses.service';
import { Curso, CursoFecha } from '../../../courses/courses.models';
import { ATTENDANCE_SOURCE } from '../../data/attendance.token';

interface FilaAsistencia {
  readonly curso: Curso;
  readonly fecha: CursoFecha;
  // Conteos demostrativos por fecha (derivados del mock en memoria).
  readonly presentes: number;
  readonly total: number;
}

// Lista de cursos/fechas asistibles. Sin HTTP/storage. Datos demo en memoria.
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
  readonly filas = signal<readonly FilaAsistencia[]>([]);
  readonly cargando = signal(true);
  readonly error = signal('');

  // Filtrado local por nombre de curso o fecha.
  readonly filtradas = computed<readonly FilaAsistencia[]>(() => {
    const texto = this.q().trim().toLowerCase();
    if (!texto) return this.filas();
    return this.filas().filter(
      (f) =>
        f.curso.nombre.toLowerCase().includes(texto) ||
        f.curso.codigo.toLowerCase().includes(texto) ||
        f.fecha.fecha.includes(texto),
    );
  });

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
        // Filtrar fechas asistibles antes de cargar alumnos: un curso sin
        // fechas marcables (nuevo o solo canceladas) no genera error y no
        // llama listarAlumnos (que rechaza para cursoId sin seed).
        const asistibles = det.fechas.filter((f) => f.estado !== 'cancelada');
        if (asistibles.length === 0) continue;
        const alumnos = await this.attendance.listarAlumnos(c.id);
        const total = alumnos.length;
        for (const f of asistibles) {
          // Conteo demostrativo: presentes ya registrados para esta fecha.
          const asistencias = await this.attendance.listarAsistencias(c.id, f.id);
          filas.push({ curso: c, fecha: f, presentes: asistencias.length, total });
        }
      }
      // Orden: estado prioritario (programada > realizada), luego por curso/fecha.
      filas.sort((a, b) => {
        const prio = (e: string) => (e === 'programada' ? 0 : e === 'realizada' ? 1 : 2);
        const pe = prio(a.fecha.estado) - prio(b.fecha.estado);
        if (pe !== 0) return pe;
        return a.fecha.fecha.localeCompare(b.fecha.fecha);
      });
      this.filas.set(filas);
    } catch (e) {
      this.error.set((e as Error).message);
    } finally {
      this.cargando.set(false);
    }
  }

  onSearch(event: Event): void {
    const value = (event.target as HTMLInputElement).value;
    this.q.set(value);
  }

  // Enlace al marcado de la fecha.
  linkMarcado(fila: FilaAsistencia): unknown[] {
    return ['/admin/cursos', fila.curso.id, 'fechas', fila.fecha.id, 'asistencias'];
  }
}