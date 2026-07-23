import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { ATTENDANCE_SOURCE } from '../../../attendances/data/attendance.token';
import { Asistencia, AttendanceService } from '../../../attendances/models/attendance.types';
import { AlumnoDetalle, CursoPresente } from '../../students.models';
import { STUDENTS_SOURCE } from '../../students.service';
import { UiBackLink } from '../../../../../shared/ui/ui-back-link';
import { UiSpinner } from '../../../../../shared/ui/ui-spinner';

@Component({
  selector: 'app-student-detail-page',
  standalone: true,
  imports: [CommonModule, RouterModule, UiBackLink, UiSpinner],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './student-detail-page.html',
  styleUrl: './student-detail-page.css',
})
export class StudentDetailPage {
  private readonly route = inject(ActivatedRoute);
  private readonly studentsService = inject(STUDENTS_SOURCE);
  private readonly attendance = inject(ATTENDANCE_SOURCE) as AttendanceService;

  private loadGeneration = 0;
  private asistenciasGeneration = 0;
  readonly cargando = signal(true);
  readonly error = signal('');
  readonly alumno = signal<AlumnoDetalle | null>(null);

  readonly mostrarAsistencias = signal(false);
  readonly cargandoAsistencias = signal(false);
  readonly errorAsistencias = signal('');
  readonly asistencias = signal<readonly Asistencia[]>([]);

  readonly nombreCompleto = computed(() => {
    const a = this.alumno();
    return a ? `${a.nombre} ${a.apellido}` : '';
  });

  /** Sin fuente de revocadas en el detalle: siempre 0 (honesto). */
  readonly certificacionesRevocadas = computed(() => 0);

  constructor() {
    this.route.paramMap.subscribe((params) => {
      const idStr = params.get('id');
      if (idStr) {
        if (!/^\d+$/.test(idStr)) {
          this.cargando.set(false);
          this.error.set('Identificador de alumno inválido.');
        } else {
          const id = parseInt(idStr, 10);
          void this.cargar(id);
        }
      } else {
        this.cargando.set(false);
        this.error.set('No se especificó un identificador de alumno.');
      }
    });
  }

  private async cargar(id: number): Promise<void> {
    const generation = ++this.loadGeneration;
    this.cargando.set(true);
    this.error.set('');
    this.alumno.set(null);
    this.mostrarAsistencias.set(false);
    this.asistencias.set([]);
    this.errorAsistencias.set('');

    try {
      const data = await this.studentsService.obtener(id);
      if (generation !== this.loadGeneration) return;

      if (!data) {
        this.error.set('Alumno no encontrado.');
      } else {
        this.alumno.set(data);
      }
    } catch {
      if (generation !== this.loadGeneration) return;
      this.error.set('Error al cargar la información del alumno. Reintentá.');
    } finally {
      if (generation === this.loadGeneration) {
        this.cargando.set(false);
      }
    }
  }

  fechasCortas(presentes: readonly string[]): string {
    if (!presentes || presentes.length === 0) return 'Sin presentes';
    const fmtCorta = new Intl.DateTimeFormat('es-AR', { day: '2-digit', month: '2-digit' });
    return presentes
      .map((iso) => {
        const [y, m, d] = iso.split('-').map(Number);
        const date = new Date(y, m - 1, d);
        return fmtCorta.format(date);
      })
      .join(', ');
  }

  /** Query de emisión: curso solo si el id es numérico real. */
  queryEmitir(alumnoId: number, curso: CursoPresente): { alumno: number; curso?: string } {
    const q: { alumno: number; curso?: string } = { alumno: alumnoId };
    if (/^\d+$/.test(curso.id)) {
      q.curso = curso.id;
    }
    return q;
  }

  etiquetaCursoAsistencia(cursoId: number): string {
    const a = this.alumno();
    const match = a?.cursos.find((c) => c.id === String(cursoId));
    if (match) return `${match.codigo} — ${match.nombre}`;
    return `Curso #${cursoId}`;
  }

  async onToggleAsistencias(): Promise<void> {
    if (this.mostrarAsistencias()) {
      this.mostrarAsistencias.set(false);
      return;
    }
    this.mostrarAsistencias.set(true);
    await this.cargarAsistencias();
  }

  private async cargarAsistencias(): Promise<void> {
    const alumno = this.alumno();
    if (!alumno) return;
    const generation = ++this.asistenciasGeneration;
    this.cargandoAsistencias.set(true);
    this.errorAsistencias.set('');
    try {
      const list = await this.attendance.listarAsistenciasPorAlumno(alumno.id);
      if (generation !== this.asistenciasGeneration) return;
      this.asistencias.set(list);
    } catch {
      if (generation !== this.asistenciasGeneration) return;
      this.errorAsistencias.set('No se pudieron cargar las asistencias. Reintentá.');
    } finally {
      if (generation === this.asistenciasGeneration) {
        this.cargandoAsistencias.set(false);
      }
    }
  }

  onReintentarAsistencias(): void {
    void this.cargarAsistencias();
  }

  onReintentar(): void {
    const idStr = this.route.snapshot.paramMap.get('id');
    if (idStr) {
      const id = parseInt(idStr, 10);
      if (!isNaN(id)) {
        void this.cargar(id);
      }
    }
  }
}
