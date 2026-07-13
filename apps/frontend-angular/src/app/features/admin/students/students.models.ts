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
