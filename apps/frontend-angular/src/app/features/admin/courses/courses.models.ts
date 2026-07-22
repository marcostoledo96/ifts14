// Modelos de cursos y fechas — admin frontend.
// Tipan el contrato backend actual (borrador/activo/cerrado/archivado)
// sin crear deuda de tipos. Sin DNI, email, token ni datos de estudiantes.

/** Tamaño de página del listado admin de cursos (paridad alumnos/certificaciones). */
export const COURSES_PAGE_SIZE = 20;

export type EstadoCurso = 'borrador' | 'activo' | 'cerrado' | 'archivado';
export type EstadoFecha = 'programada' | 'realizada' | 'cancelada';

export interface Curso {
  readonly id: number;
  readonly codigo: string;
  readonly nombre: string;
  readonly estado: EstadoCurso;
  readonly createdAt: string; // ISO date
  readonly updatedAt: string; // ISO date
  readonly cuatrimestre: string;
  readonly cantidadFechas: number;
  readonly alumnosPresentes?: number | null;
  readonly certificaciones?: number | null;
}

export interface CursoFecha {
  readonly id: number;
  readonly cursoId: number;
  readonly fecha: string; // ISO date
  readonly descripcion: string | null;
  readonly orden: number;
  readonly estado: EstadoFecha;
}

export interface CursoDetalle extends Curso {
  readonly fechas: readonly CursoFecha[];
}

export interface CursoDraft {
  readonly codigo: string;
  readonly nombre: string;
  readonly estado: EstadoCurso;
}

export interface CursoFechaDraft {
  readonly id: number | null; // null = nueva fecha
  readonly fecha: string;
  readonly descripcion: string | null;
  readonly orden: number;
  readonly estado: EstadoFecha;
}

export interface CursosFiltros {
  readonly estado?: EstadoCurso;
  readonly q?: string; // texto libre sobre codigo/nombre
  readonly conFechas?: boolean;
}
