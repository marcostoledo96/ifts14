import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { CERTIFICATIONS_SOURCE } from './certifications/certifications.service';
import { COURSES_SOURCE } from './courses/courses.service';
import { STUDENTS_SOURCE } from './students/students.service';

type Metric = number | null;

export type PendienteTone = 'warning' | 'info' | 'destructive';

export interface PendienteFila {
  readonly id: string;
  readonly label: string;
  readonly detalle: string;
  readonly tone: PendienteTone;
  readonly iconId: 'calendar-x' | 'mail-warning' | 'send' | 'refresh';
  /** Página real donde revisar el pendiente. */
  readonly route: string;
  readonly sinFuente: string | null;
}

/** Filas de bandeja calcadas de v0. Solo `sin-fechas` tiene conteo real
 *  (derivado de cantidadFechas); el resto no tiene fuente en la API. */
export const DASHBOARD_PENDIENTES: readonly PendienteFila[] = [
  {
    id: 'sin-fechas',
    label: 'Cursos sin fechas asignadas',
    detalle: 'No se puede emitir certificado sin fecha de finalización.',
    tone: 'warning',
    iconId: 'calendar-x',
    route: '/admin/cursos',
    sinFuente: null,
  },
  {
    id: 'sin-email',
    label: 'Alumnos sin email registrado',
    detalle: 'Sin canal de contacto registrado para la entrega manual.',
    tone: 'warning',
    iconId: 'mail-warning',
    route: '/admin/alumnos',
    sinFuente: 'Conteo no disponible: el backend no expone email.',
  },
  {
    id: 'sin-entrega',
    label: 'Certificaciones pendientes de entrega',
    detalle: 'Emitidas y firmadas, aún no entregadas al alumno.',
    tone: 'info',
    iconId: 'send',
    route: '/admin/certificaciones',
    sinFuente: 'Conteo no disponible: no hay estado de entrega.',
  },
  {
    id: 're-entrega',
    label: 'Requieren nueva entrega por modificación',
    detalle: 'Datos editados luego de la emisión original.',
    tone: 'destructive',
    iconId: 'refresh',
    route: '/admin/certificaciones',
    sinFuente: 'Conteo no disponible: no hay listado de PDF desactualizado.',
  },
];

/** Columnas de la tabla de actividad (paridad v0). Sin API de bitácora:
 *  solo estructura + estado vacío, nunca eventos inventados. */
export const ACTIVIDAD_COLUMNAS = ['Hora', 'ID', 'Tipo', 'Detalle', 'Autor'] as const;

export interface FlujoPaso {
  readonly id: string;
  readonly titulo: string;
  readonly resumen: string;
  readonly route: string;
  /** Ancla en `/admin/guia` (sin #). */
  readonly guiaAncla: string;
}

/** Orden operativo Bedelía: mapa compacto en dashboard → detalle en /admin/guia. */
export const DASHBOARD_FLUJO_PASOS: readonly FlujoPaso[] = [
  {
    id: 'cursos',
    titulo: 'Cursos',
    resumen: 'Alta de comisión, carga y edición de fechas de cursada.',
    route: '/admin/cursos',
    guiaAncla: 'cursos',
  },
  {
    id: 'alumnos',
    titulo: 'Alumnos',
    resumen: 'Alta o actualización de fichas (documento visible en UI admin).',
    route: '/admin/alumnos',
    guiaAncla: 'alumnos',
  },
  {
    id: 'asistencias',
    titulo: 'Asistencias',
    resumen: 'Elegí curso y fecha, y registrá presentes de la clase.',
    route: '/admin/asistencias',
    guiaAncla: 'asistencias',
  },
  {
    id: 'certificaciones',
    titulo: 'Certificaciones',
    resumen: 'Listado, expediente, PDF/QR permanente y entrega manual.',
    route: '/admin/certificaciones',
    guiaAncla: 'certificaciones',
  },
  {
    id: 'configuracion',
    titulo: 'Configuración',
    resumen: 'Datos institucionales del folio (autoridades, textos, identidad).',
    route: '/admin/configuracion',
    guiaAncla: 'configuracion',
  },
];

// Mesa de trabajo admin: acciones reales + resumen derivado de seams.
// Bandeja con conteo real solo donde hay fuente; actividad sin eventos seed.
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
  readonly flujoPasos = DASHBOARD_FLUJO_PASOS;
  readonly actividadColumnas = ACTIVIDAD_COLUMNAS;

  readonly cursosCargados = signal<Metric>(null);
  readonly cursosSinFechas = signal<Metric>(null);
  readonly alumnosRegistrados = signal<Metric>(null);
  readonly certificacionesEmitidas = signal<Metric>(null);
  readonly certificacionesRevocadas = signal<Metric>(null);
  readonly metricasCargando = signal(true);
  readonly errorMetricas = signal(false);
  /** Descarta resultados de un reintento anterior si ya hay una carga más nueva. */
  private loadGeneration = 0;

  constructor() {
    void this.cargarMetricas();
  }

  onReintentarMetricas(): void {
    if (this.metricasCargando()) return;
    void this.cargarMetricas();
  }

  private async cargarMetricas(): Promise<void> {
    const generation = ++this.loadGeneration;
    this.metricasCargando.set(true);

    const coursesP = this.courses
      ? this.courses.listar()
      : Promise.reject(new Error('COURSES_SOURCE ausente'));
    const studentsP = this.students
      ? this.students.contar()
      : Promise.reject(new Error('STUDENTS_SOURCE ausente'));
    const certsP = this.certs
      ? this.certs.listar()
      : Promise.reject(new Error('CERTIFICATIONS_SOURCE ausente'));

    try {
      const [cursosR, alumnosR, certsR] = await Promise.allSettled([
        conTimeout(coursesP),
        conTimeout(studentsP),
        conTimeout(certsP),
      ]);
      // Si llegó un reintento más nuevo, no tocar señales ni el flag de carga:
      // esa generación es dueña del finally.
      if (generation !== this.loadGeneration) return;

      let huboError = false;

      if (cursosR.status === 'fulfilled') {
        this.cursosCargados.set(cursosR.value.length);
        this.cursosSinFechas.set(cursosR.value.filter((c) => c.cantidadFechas === 0).length);
      } else {
        this.cursosCargados.set(null);
        this.cursosSinFechas.set(null);
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
        this.certificacionesEmitidas.set(list.filter((c) => c.estado === 'vigente').length);
        this.certificacionesRevocadas.set(list.filter((c) => c.estado === 'revocado').length);
      } else {
        this.certificacionesEmitidas.set(null);
        this.certificacionesRevocadas.set(null);
        huboError = true;
      }

      this.errorMetricas.set(huboError);
    } finally {
      if (generation === this.loadGeneration) {
        this.metricasCargando.set(false);
      }
    }
  }

  formatoMetrica(value: Metric): string {
    return value === null ? '—' : String(value);
  }

  /** Badge por fila: solo `sin-fechas` tiene conteo real. */
  badgePendiente(item: PendienteFila): string {
    if (item.id !== 'sin-fechas') return '—';
    return this.formatoMetrica(this.cursosSinFechas());
  }
}

/** Tope de espera por seam de métricas; evita skeletons eternos sin AbortSignal en el HTTP. */
export const METRICAS_SEAM_TIMEOUT_MS = 15_000;

/** Evita skeletons eternos si un seam HTTP no resuelve. */
function conTimeout<T>(promise: Promise<T>, ms = METRICAS_SEAM_TIMEOUT_MS): Promise<T> {
  return new Promise<T>((resolve, reject) => {
    const t = setTimeout(() => reject(new Error('timeout')), ms);
    promise.then(
      (v) => {
        clearTimeout(t);
        resolve(v);
      },
      (e) => {
        clearTimeout(t);
        reject(e);
      },
    );
  });
}
