// Modelos de asistencias — admin frontend.
// Tipan el contrato de marcado por fecha. Sin DNI completo, email, token,
// legajo ni matrícula: dniMostrar es enmascarado (XX****XX).

import { EstadoFecha } from '../../courses/courses.models';

export type EstadoAlumno = 'activo' | 'inactivo';

export interface AsistenciaAlumno {
  readonly id: number;
  readonly apellidoNombre: string;
  readonly dniMostrar: string; // XX****XX
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

export interface AttendanceService {
  listarAlumnos(cursoId: number): Promise<readonly AsistenciaAlumno[]>;
  listarAsistencias(cursoId: number, fechaId: number): Promise<readonly Asistencia[]>;
  marcar(
    cursoId: number,
    fechaId: number,
    marcados: readonly AsistenciaMarcado[],
  ): Promise<readonly Asistencia[]>;
  anular(asistenciaId: number): Promise<void>;
}