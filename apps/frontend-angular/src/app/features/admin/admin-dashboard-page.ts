import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { CERTIFICATIONS_SOURCE } from './certifications/certifications.service';
import { COURSES_SOURCE } from './courses/courses.service';
import { STUDENTS_SOURCE } from './students/students.service';

type Metric = number | null;

export interface PendienteFila {
  readonly id: string;
  readonly label: string;
  readonly detalle: string;
}

/** Filas estructurales de bandeja: sin conteos inventados (API de pendientes inexistente). */
export const DASHBOARD_PENDIENTES: readonly PendienteFila[] = [
  {
    id: 'sin-fechas',
    label: 'Cursos sin fechas asignadas',
    detalle: 'Dato no disponible: falta fuente agregada en API.',
  },
  {
    id: 'sin-email',
    label: 'Alumnos sin email registrado',
    detalle: 'Dato no disponible: el backend no expone email.',
  },
  {
    id: 'sin-entrega',
    label: 'Certificaciones pendientes de entrega',
    detalle: 'Dato no disponible: no hay estado de entrega.',
  },
  {
    id: 're-entrega',
    label: 'Requieren nueva entrega por modificación',
    detalle: 'Dato no disponible: no hay listado de PDF desactualizado.',
  },
];

// Mesa de trabajo admin: acciones reales + resumen derivado de seams.
// Bandeja/actividad: placeholders honestos (sin endpoints de métricas/actividad).
@Component({
  selector: 'app-admin-dashboard-page',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterLink],
  templateUrl: './admin-dashboard-page.html',
  styleUrl: './admin-dashboard-page.css',
})
export class AdminDashboardPage {
  private readonly courses = inject(COURSES_SOURCE, { optional: true });
  private readonly students = inject(STUDENTS_SOURCE, { optional: true });
  private readonly certs = inject(CERTIFICATIONS_SOURCE, { optional: true });

  readonly pendientes = DASHBOARD_PENDIENTES;

  readonly cursosCargados = signal<Metric>(null);
  readonly alumnosRegistrados = signal<Metric>(null);
  readonly certificacionesEmitidas = signal<Metric>(null);
  readonly certificacionesRevocadas = signal<Metric>(null);
  readonly metricasCargando = signal(true);
  readonly errorMetricas = signal(false);

  constructor() {
    void this.cargarMetricas();
  }

  private async cargarMetricas(): Promise<void> {
    this.metricasCargando.set(true);
    this.errorMetricas.set(false);

    const coursesP = this.courses
      ? this.courses.listar()
      : Promise.reject(new Error('COURSES_SOURCE ausente'));
    const studentsP = this.students
      ? this.students.contar()
      : Promise.reject(new Error('STUDENTS_SOURCE ausente'));
    const certsP = this.certs
      ? this.certs.listar()
      : Promise.reject(new Error('CERTIFICATIONS_SOURCE ausente'));

    const [cursosR, alumnosR, certsR] = await Promise.allSettled([coursesP, studentsP, certsP]);

    let huboError = false;

    if (cursosR.status === 'fulfilled') {
      this.cursosCargados.set(cursosR.value.length);
    } else {
      this.cursosCargados.set(null);
      huboError = true;
    }

    if (alumnosR.status === 'fulfilled') {
      this.alumnosRegistrados.set(alumnosR.value);
    } else {
      this.alumnosRegistrados.set(null);
      huboError = true;
    }

    if (certsR.status === 'fulfilled') {
      const list = certsR.value;
      this.certificacionesEmitidas.set(
        list.filter((c) => c.estado === 'vigente' || c.estado === 'vencido').length,
      );
      this.certificacionesRevocadas.set(list.filter((c) => c.estado === 'revocado').length);
    } else {
      this.certificacionesEmitidas.set(null);
      this.certificacionesRevocadas.set(null);
      huboError = true;
    }

    this.errorMetricas.set(huboError);
    this.metricasCargando.set(false);
  }

  formatoMetrica(value: Metric): string {
    return value === null ? '—' : String(value);
  }
}
