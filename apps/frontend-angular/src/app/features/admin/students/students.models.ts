export const STUDENTS_PAGE_SIZE = 20;

export type EstadoAlumnoAdmin = 'activo' | 'inactivo';

export interface Alumno {
  readonly id: number;
  readonly apellido: string;
  readonly nombre: string;
  /** DNI completo en UI admin (D0 2026-07-20). */
  readonly dniMostrar: string;
  readonly estado: EstadoAlumnoAdmin;
  /** Email literal si existe; null = sin email. */
  readonly email: string | null;
  /** null = la API no aporta el booleano (no afirmar “sin email”). */
  readonly tieneEmail: boolean | null;
  /** null = sin dato en API. */
  readonly cursosConAsistencia: number | null;
  /** null = sin dato en API. */
  readonly certificacionesValidas: number | null;
}

/** Body de POST /admin/alumnos. */
export interface AlumnoDraft {
  readonly apellidoNombre: string;
  readonly dni: string;
  /** Email de contacto opcional. */
  readonly email?: string | null;
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
