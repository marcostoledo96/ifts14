import { StudentDuplicateError } from './student-duplicate.error';
import { Alumno, AlumnoDetalle, AlumnoDraft, CursoPresente } from './students.models';
import { StudentsService } from './students.service';

interface SeedAlumnoRaw extends Alumno {
  readonly ingreso: string;
}

const initialSeed: readonly SeedAlumnoRaw[] = [
  { id: 1, apellido: 'Ficticia', nombre: 'Persona Uno', dniMostrar: '20111222', email: 'persona.uno@example.invalid', estado: 'activo', tieneEmail: true, cursosConAsistencia: 4, certificacionesValidas: 2, certificacionesRevocadas: 0, ingreso: '2021' },
  { id: 2, apellido: 'Ficticia', nombre: 'Persona Dos', dniMostrar: '20222333', email: null, estado: 'activo', tieneEmail: false, cursosConAsistencia: 1, certificacionesValidas: 0, certificacionesRevocadas: 0, ingreso: '2022' },
  { id: 3, apellido: 'Demostración', nombre: 'Estudiante Tres', dniMostrar: '20333444', email: 'estudiante.tres@example.invalid', estado: 'activo', tieneEmail: true, cursosConAsistencia: 6, certificacionesValidas: 3, certificacionesRevocadas: 0, ingreso: '2021' },
  { id: 4, apellido: 'Demostración', nombre: 'Estudiante Cuatro', dniMostrar: '20444555', email: null, estado: 'activo', tieneEmail: false, cursosConAsistencia: 3, certificacionesValidas: 1, certificacionesRevocadas: 0, ingreso: '2023' },
  { id: 5, apellido: 'Ejemplo', nombre: 'Alumno Cinco', dniMostrar: '20555666', email: 'alumno.cinco@example.invalid', estado: 'inactivo', tieneEmail: true, cursosConAsistencia: 2, certificacionesValidas: 0, certificacionesRevocadas: 1, ingreso: '2022' },
  { id: 6, apellido: 'Ejemplo', nombre: 'Alumno Seis', dniMostrar: '20666777', email: null, estado: 'activo', tieneEmail: false, cursosConAsistencia: 5, certificacionesValidas: 2, certificacionesRevocadas: 0, ingreso: '2021' },
  { id: 7, apellido: 'Muestra', nombre: 'Alumno Siete', dniMostrar: '20777888', email: 'alumno.siete@example.invalid', estado: 'activo', tieneEmail: true, cursosConAsistencia: 1, certificacionesValidas: 1, certificacionesRevocadas: 0, ingreso: '2024' },
];

/** Exportado solo para tests de seed / privacy checks. */
export const seed: readonly SeedAlumnoRaw[] = initialSeed;

const CURSOS_MOCK_MAP: Record<number, CursoPresente[]> = {
  1: [
    { id: '1', nombre: 'Curso de introducción a la gestión', codigo: 'CUR-001', presentes: ['2026-03-02', '2026-03-09', '2026-03-16'], estadoCert: 'emitida', certificacionId: '1' },
    { id: '2', nombre: 'Curso de herramientas administrativas', codigo: 'CUR-002', presentes: ['2026-04-05', '2026-04-12'], estadoCert: 'en-curso', certificacionId: null },
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

function normalizeEmail(email: string | null | undefined): string | null {
  const trimmed = (email ?? '').trim();
  return trimmed === '' ? null : trimmed;
}

export class InMemoryStudentsService implements StudentsService {
  private rows: SeedAlumnoRaw[] = initialSeed.map((r) => ({ ...r }));
  private nextId = Math.max(...initialSeed.map((r) => r.id)) + 1;

  async listar(): Promise<readonly Alumno[]> {
    return this.rows.map(
      ({
        id,
        apellido,
        nombre,
        dniMostrar,
        email,
        estado,
        tieneEmail,
        cursosConAsistencia,
        certificacionesValidas,
        certificacionesRevocadas,
      }) => ({
        id,
        apellido,
        nombre,
        dniMostrar,
        email,
        estado,
        tieneEmail,
        cursosConAsistencia,
        certificacionesValidas,
        certificacionesRevocadas,
      }),
    );
  }

  async contar(): Promise<number> {
    return this.rows.length;
  }

  async obtener(id: number): Promise<AlumnoDetalle | null> {
    const found = this.rows.find((alumno) => alumno.id === id);
    if (!found) return null;
    const cursos = CURSOS_MOCK_MAP[id] || [];
    return {
      id: found.id,
      apellido: found.apellido,
      nombre: found.nombre,
      dniMostrar: found.dniMostrar,
      email: found.email,
      estado: found.estado,
      tieneEmail: found.tieneEmail,
      cursosConAsistencia: found.cursosConAsistencia,
      certificacionesValidas: found.certificacionesValidas,
      certificacionesRevocadas: found.certificacionesRevocadas,
      ingreso: found.ingreso,
      cursos: JSON.parse(JSON.stringify(cursos)) as CursoPresente[],
    };
  }

  async crear(draft: AlumnoDraft): Promise<AlumnoDetalle> {
    const apellido = draft.apellido.trim();
    const nombre = draft.nombre.trim();
    const dni = draft.dni.trim().replace(/\D/g, '');
    if (!apellido || !nombre || !dni) {
      throw new Error('apellido, nombre y dni son requeridos');
    }
    const existente = this.rows.find((alumno) => alumno.dniMostrar === dni);
    if (existente) {
      throw new StudentDuplicateError(existente.id);
    }
    const email = normalizeEmail(draft.email);
    const id = this.nextId++;
    const row: SeedAlumnoRaw = {
      id,
      apellido,
      nombre,
      dniMostrar: dni,
      email,
      estado: draft.estado ?? 'activo',
      tieneEmail: email !== null,
      cursosConAsistencia: 0,
      certificacionesValidas: 0,
      certificacionesRevocadas: 0,
      ingreso: String(new Date().getFullYear()),
    };
    this.rows = [...this.rows, row];
    return {
      ...row,
      cursos: [],
    };
  }

  async actualizar(id: number, draft: AlumnoDraft): Promise<AlumnoDetalle> {
    const idx = this.rows.findIndex((alumno) => alumno.id === id);
    if (idx < 0) {
      throw new Error('Alumno no encontrado.');
    }
    const apellido = draft.apellido.trim();
    const nombre = draft.nombre.trim();
    const dni = draft.dni.trim().replace(/\D/g, '');
    if (!apellido || !nombre || !dni) {
      throw new Error('apellido, nombre y dni son requeridos');
    }
    const conflicto = this.rows.find((alumno) => alumno.dniMostrar === dni && alumno.id !== id);
    if (conflicto) {
      throw new StudentDuplicateError(conflicto.id);
    }
    const email = normalizeEmail(draft.email);
    const prev = this.rows[idx];
    const row: SeedAlumnoRaw = {
      ...prev,
      apellido,
      nombre,
      dniMostrar: dni,
      email,
      estado: draft.estado ?? prev.estado,
      tieneEmail: email !== null,
    };
    this.rows = this.rows.map((r, i) => (i === idx ? row : r));
    const cursos = CURSOS_MOCK_MAP[id] || [];
    return {
      ...row,
      cursos: JSON.parse(JSON.stringify(cursos)) as CursoPresente[],
    };
  }
}
