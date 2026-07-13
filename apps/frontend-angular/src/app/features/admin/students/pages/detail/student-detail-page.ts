import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { AlumnoDetalle, CursoPresente } from '../../students.models';
import { STUDENTS_SOURCE } from '../../students.service';

@Component({
  selector: 'app-student-detail-page',
  standalone: true,
  imports: [CommonModule, RouterModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './student-detail-page.html',
  styleUrl: './student-detail-page.css',
})
export class StudentDetailPage {
  private readonly route = inject(ActivatedRoute);
  private readonly studentsService = inject(STUDENTS_SOURCE);

  private loadGeneration = 0;
  readonly cargando = signal(true);
  readonly error = signal('');
  readonly alumno = signal<AlumnoDetalle | null>(null);

  readonly nombreCompleto = computed(() => {
    const a = this.alumno();
    return a ? `${a.nombre} ${a.apellido}` : '';
  });

  readonly certificacionesRevocadas = computed(() => {
    // Calculado consistentemente a partir de los cursos asociados.
    const a = this.alumno();
    if (!a) return 0;
    return a.cursos.filter((c) => c.estadoCert === 'en-curso' && c.certificacionId === 'revocado').length; // O 0 para mock base
  });

  constructor() {
    this.route.paramMap.subscribe((params) => {
      const idStr = params.get('id');
      if (idStr) {
        const id = parseInt(idStr, 10);
        if (isNaN(id)) {
          this.cargando.set(false);
          this.error.set('Identificador de alumno inválido.');
        } else {
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
