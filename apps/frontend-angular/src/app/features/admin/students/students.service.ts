import { InjectionToken } from '@angular/core';
import { Alumno } from './students.models';

export interface StudentsService {
  listar(): Promise<readonly Alumno[]>;
  contar(): Promise<number>;
}

export const STUDENTS_SOURCE = new InjectionToken<StudentsService>('STUDENTS_SOURCE');
