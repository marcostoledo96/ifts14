import { InjectionToken } from '@angular/core';
import { Alumno, AlumnoDetalle } from './students.models';

export interface StudentsService {
  listar(): Promise<readonly Alumno[]>;
  contar(): Promise<number>;
  obtener(id: number): Promise<AlumnoDetalle | null>;
}

export const STUDENTS_SOURCE = new InjectionToken<StudentsService>('STUDENTS_SOURCE');

