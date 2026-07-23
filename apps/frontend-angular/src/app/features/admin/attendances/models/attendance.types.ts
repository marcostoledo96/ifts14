// Modelos de asistencias — admin frontend.
// Tipan el contrato de marcado por fecha. Sin email, token,
// legajo ni matrícula: dniMostrar es DNI completo ficticio en UI admin (D0 2026-07-20).

import { EstadoFecha } from '../../courses/courses.models';

/** Tamaño de página del listado hub de asistencias (paridad alumnos/cursos). */
export const ATTENDANCES_PAGE_SIZE = 20;

export type EstadoAlumno = 'activo' | 'inactivo';

export interface AsistenciaAlumno {
  readonly id: number;
  readonly apellidoNombre: string;
  readonly dniMostrar: string; // DNI completo ficticio (7–8 dígitos)
  readonly estado: EstadoAlumno;
}

export interface Asistencia {
  readonly id: number;
  readonly alumnoId: number;
  readonly cursoId: number;
  readonly cursoFechaId: number;
  readonly fecha: string; // ISO date
  readonly fechaEstado: EstadoFecha;
  readonly registradoEn: string; // ISO timestamp
}

export interface AsistenciaMarcado {
  readonly alumnoId: number;
  readonly presente: boolean;
}

/** Payload de GET /admin/hub/asistencias (un round-trip para el listado admin). */
export interface HubAsistencias {
  readonly cursos: readonly {
    readonly id: number;
    readonly codigo: string;
    readonly nombre: string;
    readonly estado: string;
  }[];
  readonly fechas: readonly {
    readonly id: number;
    readonly cursoId: number;
    readonly fecha: string;
    readonly descripcion: string | null;
    readonly orden: number;
    readonly estado: EstadoFecha;
  }[];
  readonly asistencias: readonly Asistencia[];
  readonly alumnosActivos: number;
}

export interface AttendanceService {
  listarAlumnos(cursoId: number): Promise<readonly AsistenciaAlumno[]>;
  listarAsistencias(cursoId: number, fechaId: number): Promise<readonly Asistencia[]>;
  /** Todas las asistencias de un curso (un solo GET; el hub de fechas agrupa client-side). */
  listarAsistenciasDeCurso(cursoId: number): Promise<readonly Asistencia[]>;
  /** Hub consolidado: cursos + fechas + asistencias + conteo alumnos activos. */
  listarHub(): Promise<HubAsistencias>;
  /** Asistencias del par curso+alumno (backend filtra por query). */
  listarAsistenciasPorPar(cursoId: number, alumnoId: number): Promise<readonly Asistencia[]>;
  /** Asistencias de un alumno (GET /admin/asistencias?alumnoId=). */
  listarAsistenciasPorAlumno(alumnoId: number): Promise<readonly Asistencia[]>;
  marcar(
    cursoId: number,
    fechaId: number,
    marcados: readonly AsistenciaMarcado[],
  ): Promise<readonly Asistencia[]>;
  anular(asistenciaId: number): Promise<void>;
}