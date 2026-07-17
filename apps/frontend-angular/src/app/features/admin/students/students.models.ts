export const STUDENTS_PAGE_SIZE = 5;

export type EstadoAlumnoAdmin = 'activo' | 'inactivo';

export interface Alumno {
  readonly id: number;
  readonly apellido: string;
  readonly nombre: string;
  readonly dniMostrar: string;
  readonly estado: EstadoAlumnoAdmin;
  /** null = la API no aporta el booleano (no afirmar “sin email”). */
  readonly tieneEmail: boolean | null;
  /** null = sin dato en API. */
  readonly cursosConAsistencia: number | null;
  /** null = sin dato en API. */
  readonly certificacionesValidas: number | null;
}

/** Body exacto de POST /admin/alumnos (sin campos inventados). */
export interface AlumnoDraft {
  readonly apellidoNombre: string;
  readonly dni: string;
  readonly estado?: EstadoAlumnoAdmin;
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
