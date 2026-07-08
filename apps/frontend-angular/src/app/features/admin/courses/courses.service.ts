// Contrato del servicio de cursos (frontera admin frontend).
// Sin HTTP, storage ni claves. Implementación en memoria en
// in-memory-courses.service.ts. Ver spec admin-courses-frontend.
import { InjectionToken } from '@angular/core';
import {
  Curso,
  CursoDetalle,
  CursoDraft,
  CursoFecha,
  CursoFechaDraft,
  CursosFiltros,
  EstadoCurso,
} from './courses.models';

export interface CoursesService {
  listar(filtros?: CursosFiltros): Promise<readonly Curso[]>;
  obtener(id: number): Promise<CursoDetalle>;
  crear(dto: CursoDraft): Promise<CursoDetalle>;
  actualizarEstado(id: number, estado: EstadoCurso): Promise<CursoDetalle>;
  listarFechas(cursoId: number): Promise<readonly CursoFecha[]>;
  guardarFecha(cursoId: number, dto: CursoFechaDraft): Promise<CursoFecha>;
  // Reemplazo completo del set de fechas: elimina las fechas existentes que
  // no estén en dtos, crea las nuevas (id null) y actualiza las restantes.
  // ponytail: reemplazo completo del set en memoria; sin delete individual.
  reemplazarFechas(cursoId: number, dtos: CursoFechaDraft[]): Promise<readonly CursoFecha[]>;
}

// ponytail: token único para inyectar la implementación en memoria.
export const COURSES_SOURCE = new InjectionToken<CoursesService>('COURSES_SOURCE');
