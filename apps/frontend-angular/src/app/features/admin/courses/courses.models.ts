// Modelos de cursos y fechas — admin frontend.
// Tipan el contrato backend (borrador/activo/cerrado/archivado).
// UI de listado usa solo activo/inactivo (paridad v0). Sin DNI/email/token.

/** Tamaño de página del listado admin de cursos (paridad alumnos/certificaciones). */
export const COURSES_PAGE_SIZE = 20;

export type EstadoCurso = 'borrador' | 'activo' | 'cerrado' | 'archivado';
/** Filtro visual del listado: activo vs resto (cerrado/borrador/archivado). */
export type FiltroEstadoCurso = 'activo' | 'inactivo';
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
  /** true = solo activos; false = no activos (cerrado/borrador/archivado). */
  readonly activo?: boolean;
  readonly q?: string; // texto libre sobre codigo/nombre
  readonly conFechas?: boolean;
}
