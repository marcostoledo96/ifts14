import { Alumno, AlumnoDetalle, CursoPresente } from './students.models';
import { StudentsService } from './students.service';

interface SeedAlumnoRaw extends Alumno {
  readonly ingreso: string;
}

export const seed: readonly SeedAlumnoRaw[] = [
  { id: 1, apellido: 'Ficticia', nombre: 'Persona Uno', dniMostrar: '00****01', tieneEmail: true, cursosConAsistencia: 4, certificacionesValidas: 2, ingreso: '2021' },
  { id: 2, apellido: 'Ficticia', nombre: 'Persona Dos', dniMostrar: '00****02', tieneEmail: false, cursosConAsistencia: 1, certificacionesValidas: 0, ingreso: '2022' },
  { id: 3, apellido: 'Demostración', nombre: 'Estudiante Tres', dniMostrar: '00****03', tieneEmail: true, cursosConAsistencia: 6, certificacionesValidas: 3, ingreso: '2021' },
  { id: 4, apellido: 'Demostración', nombre: 'Estudiante Cuatro', dniMostrar: '00****04', tieneEmail: false, cursosConAsistencia: 3, certificacionesValidas: 1, ingreso: '2023' },
  { id: 5, apellido: 'Ejemplo', nombre: 'Alumno Cinco', dniMostrar: '00****05', tieneEmail: true, cursosConAsistencia: 2, certificacionesValidas: 0, ingreso: '2022' },
  { id: 6, apellido: 'Ejemplo', nombre: 'Alumno Seis', dniMostrar: '00****06', tieneEmail: false, cursosConAsistencia: 5, certificacionesValidas: 2, ingreso: '2021' },
  { id: 7, apellido: 'Muestra', nombre: 'Alumno Siete', dniMostrar: '00****07', tieneEmail: true, cursosConAsistencia: 1, certificacionesValidas: 1, ingreso: '2024' },
];

const CURSOS_MOCK_MAP: Record<number, CursoPresente[]> = {
  1: [
    { id: '1', nombre: 'Curso de introducción a la gestión', codigo: 'CUR-001', presentes: ['2026-03-02', '2026-03-09', '2026-03-16'], estadoCert: 'emitida', certificacionId: null },
    { id: '2', nombre: 'Curso de herramientas administrativas', codigo: 'CUR-002', presentes: ['2026-04-05', '2026-04-12'], estadoCert: 'emitida', certificacionId: null },
    { id: '3', nombre: 'Curso de prácticas documentales', codigo: 'CUR-003', presentes: ['2026-05-04'], estadoCert: 'pendiente', certificacionId: null },
    { id: '6', nombre: 'Curso de atención al público', codigo: 'CUR-006', presentes: ['2026-06-01'], estadoCert: 'en-curso', certificacionId: null },
  ],
  2: [
    { id: '3', nombre: 'Curso de prácticas documentales', codigo: 'CUR-003', presentes: ['2026-05-04'], estadoCert: 'pendiente', certificacionId: null },
  ],
  3: [
    { id: '1', nombre: 'Curso de introducción a la gestión', codigo: 'CUR-001', presentes: ['2026-03-02', '2026-03-09', '2026-03-16'], estadoCert: 'emitida', certificacionId: '1' },
    { id: '2', nombre: 'Curso de herramientas administrativas', codigo: 'CUR-002', presentes: ['2026-04-05', '2026-04-12'], estadoCert: 'emitida', certificacionId: '2' },
    { id: '3', nombre: 'Curso de prácticas documentales', codigo: 'CUR-003', presentes: ['2026-05-04'], estadoCert: 'pendiente', certificacionId: null },
    { id: '4', nombre: 'Curso de procedimientos básicos', codigo: 'CUR-004', presentes: ['2025-09-01', '2025-09-08'], estadoCert: 'emitida', certificacionId: '4' },
    { id: '5', nombre: 'Curso de registros y archivo', codigo: 'CUR-005', presentes: [], estadoCert: 'en-curso', certificacionId: null },
    { id: '6', nombre: 'Curso de atención al público', codigo: 'CUR-006', presentes: ['2026-06-01'], estadoCert: 'en-curso', certificacionId: null },
  ],
  4: [
    { id: '2', nombre: 'Curso de herramientas administrativas', codigo: 'CUR-002', presentes: ['2026-04-05'], estadoCert: 'pendiente', certificacionId: null },
    { id: '4', nombre: 'Curso de procedimientos básicos', codigo: 'CUR-004', presentes: ['2025-09-01', '2025-09-08'], estadoCert: 'emitida', certificacionId: '4' },
    { id: '6', nombre: 'Curso de atención al público', codigo: 'CUR-006', presentes: ['2026-06-01'], estadoCert: 'en-curso', certificacionId: null },
  ],
  5: [
    { id: '1', nombre: 'Curso de introducción a la gestión', codigo: 'CUR-001', presentes: ['2026-03-02'], estadoCert: 'en-curso', certificacionId: null },
    { id: '2', nombre: 'Curso de herramientas administrativas', codigo: 'CUR-002', presentes: ['2026-04-05'], estadoCert: 'en-curso', certificacionId: null },
  ],
  6: [
    { id: '1', nombre: 'Curso de introducción a la gestión', codigo: 'CUR-001', presentes: ['2026-03-02', '2026-03-09', '2026-03-16'], estadoCert: 'emitida', certificacionId: '1' },
    { id: '2', nombre: 'Curso de herramientas administrativas', codigo: 'CUR-002', presentes: ['2026-04-05'], estadoCert: 'pendiente', certificacionId: null },
    { id: '4', nombre: 'Curso de procedimientos básicos', codigo: 'CUR-004', presentes: ['2025-09-01'], estadoCert: 'pendiente', certificacionId: null },
    { id: '5', nombre: 'Curso de registros y archivo', codigo: 'CUR-005', presentes: [], estadoCert: 'en-curso', certificacionId: null },
    { id: '6', nombre: 'Curso de atención al público', codigo: 'CUR-006', presentes: ['2026-06-01', '2026-06-08', '2026-06-15'], estadoCert: 'emitida', certificacionId: '6' },
  ],
  7: [
    { id: '6', nombre: 'Curso de atención al público', codigo: 'CUR-006', presentes: ['2026-06-01', '2026-06-08', '2026-06-15'], estadoCert: 'emitida', certificacionId: '6' },
  ],
};

export class InMemoryStudentsService implements StudentsService {
  async listar(): Promise<readonly Alumno[]> {
    return seed.map(({ id, apellido, nombre, dniMostrar, tieneEmail, cursosConAsistencia, certificacionesValidas }) => ({
      id, apellido, nombre, dniMostrar, tieneEmail, cursosConAsistencia, certificacionesValidas
    }));
  }
  async contar(): Promise<number> { return seed.length; }

  async obtener(id: number): Promise<AlumnoDetalle | null> {
    const found = seed.find((alumno) => alumno.id === id);
    if (!found) return null;
    const cursos = CURSOS_MOCK_MAP[id] || [];
    return {
      id: found.id,
      apellido: found.apellido,
      nombre: found.nombre,
      dniMostrar: found.dniMostrar,
      tieneEmail: found.tieneEmail,
      cursosConAsistencia: found.cursosConAsistencia,
      certificacionesValidas: found.certificacionesValidas,
      ingreso: found.ingreso,
      cursos: JSON.parse(JSON.stringify(cursos)) as CursoPresente[],
    };
  }
}

