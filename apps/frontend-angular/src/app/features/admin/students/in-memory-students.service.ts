import { Alumno } from './students.models';
import { StudentsService } from './students.service';

export const seed: readonly Alumno[] = [
  { id: 1, apellido: 'Ficticia', nombre: 'Persona Uno', dniMostrar: '00****01', tieneEmail: true, cursosConAsistencia: 4, certificacionesValidas: 2 },
  { id: 2, apellido: 'Ficticia', nombre: 'Persona Dos', dniMostrar: '00****02', tieneEmail: false, cursosConAsistencia: 1, certificacionesValidas: 0 },
  { id: 3, apellido: 'Demostración', nombre: 'Estudiante Tres', dniMostrar: '00****03', tieneEmail: true, cursosConAsistencia: 6, certificacionesValidas: 3 },
  { id: 4, apellido: 'Demostración', nombre: 'Estudiante Cuatro', dniMostrar: '00****04', tieneEmail: false, cursosConAsistencia: 3, certificacionesValidas: 1 },
  { id: 5, apellido: 'Ejemplo', nombre: 'Alumno Cinco', dniMostrar: '00****05', tieneEmail: true, cursosConAsistencia: 2, certificacionesValidas: 0 },
  { id: 6, apellido: 'Ejemplo', nombre: 'Alumno Seis', dniMostrar: '00****06', tieneEmail: false, cursosConAsistencia: 5, certificacionesValidas: 2 },
  { id: 7, apellido: 'Muestra', nombre: 'Alumno Siete', dniMostrar: '00****07', tieneEmail: true, cursosConAsistencia: 1, certificacionesValidas: 1 },
];

export class InMemoryStudentsService implements StudentsService {
  async listar(): Promise<readonly Alumno[]> { return seed.map((alumno) => ({ ...alumno })); }
  async contar(): Promise<number> { return seed.length; }
}
