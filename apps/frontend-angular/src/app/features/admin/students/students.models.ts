export const STUDENTS_PAGE_SIZE = 5;

export interface Alumno {
  readonly id: number;
  readonly apellido: string;
  readonly nombre: string;
  readonly dniMostrar: string;
  readonly tieneEmail: boolean;
  readonly cursosConAsistencia: number;
  readonly certificacionesValidas: number;
}

export type EstadoCertCertificado = 'emitida' | 'pendiente' | 'en-curso';

export interface CursoPresente {
  readonly id: string;
  readonly nombre: string;
  readonly codigo: string;
  /** fechas con asistencia presente, en ISO */
  readonly presentes: readonly string[];
  readonly estadoCert: EstadoCertCertificado;
  /** id de la certificación emitida, si corresponde */
  readonly certificacionId: string | null;
}

export interface AlumnoDetalle extends Alumno {
  readonly ingreso: string;
  readonly cursos: readonly CursoPresente[];
}

