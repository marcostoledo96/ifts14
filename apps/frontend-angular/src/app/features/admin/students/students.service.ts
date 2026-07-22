import { InjectionToken } from '@angular/core';
import { Alumno, AlumnoDetalle, AlumnoDraft } from './students.models';

export interface StudentsService {
  listar(): Promise<readonly Alumno[]>;
  contar(): Promise<number>;
  obtener(id: number): Promise<AlumnoDetalle | null>;
  crear(draft: AlumnoDraft): Promise<AlumnoDetalle>;
  actualizar(id: number, draft: AlumnoDraft): Promise<AlumnoDetalle>;
}

export const STUDENTS_SOURCE = new InjectionToken<StudentsService>('STUDENTS_SOURCE');
