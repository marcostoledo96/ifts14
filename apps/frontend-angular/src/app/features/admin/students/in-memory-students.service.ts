import { Alumno, AlumnoDetalle, AlumnoDraft, CursoPresente } from './students.models';
import { StudentsService } from './students.service';

interface SeedAlumnoRaw extends Alumno {
  readonly ingreso: string;
}

const initialSeed: readonly SeedAlumnoRaw[] = [
  { id: 1, apellido: 'Ficticia', nombre: 'Persona Uno', dniMostrar: '00****01', estado: 'activo', tieneEmail: true, cursosConAsistencia: 4, certificacionesValidas: 2, ingreso: '2021' },
  { id: 2, apellido: 'Ficticia', nombre: 'Persona Dos', dniMostrar: '00****02', estado: 'activo', tieneEmail: false, cursosConAsistencia: 1, certificacionesValidas: 0, ingreso: '2022' },
  { id: 3, apellido: 'Demostración', nombre: 'Estudiante Tres', dniMostrar: '00****03', estado: 'activo', tieneEmail: true, cursosConAsistencia: 6, certificacionesValidas: 3, ingreso: '2021' },
  { id: 4, apellido: 'Demostración', nombre: 'Estudiante Cuatro', dniMostrar: '00****04', estado: 'activo', tieneEmail: false, cursosConAsistencia: 3, certificacionesValidas: 1, ingreso: '2023' },
  { id: 5, apellido: 'Ejemplo', nombre: 'Alumno Cinco', dniMostrar: '00****05', estado: 'inactivo', tieneEmail: true, cursosConAsistencia: 2, certificacionesValidas: 0, ingreso: '2022' },
  { id: 6, apellido: 'Ejemplo', nombre: 'Alumno Seis', dniMostrar: '00****06', estado: 'activo', tieneEmail: false, cursosConAsistencia: 5, certificacionesValidas: 2, ingreso: '2021' },
  { id: 7, apellido: 'Muestra', nombre: 'Alumno Siete', dniMostrar: '00****07', estado: 'activo', tieneEmail: true, cursosConAsistencia: 1, certificacionesValidas: 1, ingreso: '2024' },
];

/** Exportado solo para tests de seed / privacy checks. */
export const seed: readonly SeedAlumnoRaw[] = initialSeed;

const CURSOS_MOCK_MAP: Record<number, CursoPresente[]> = {
  1: [
    // certificacionId numérico → enlace real a /admin/certificaciones/:id (seed certs).
    { id: '1', nombre: 'Curso de introducción a la gestión', codigo: 'CUR-001', presentes: ['2026-03-02', '2026-03-09', '2026-03-16'], estadoCert: 'emitida', certificacionId: '1' },
    { id: '2', nombre: 'Curso de herramientas administrativas', codigo: 'CUR-002', presentes: ['2026-04-05', '2026-04-12'], estadoCert: 'emitida', certificacionId: '2' },
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

function maskDni(dni: string): string {
  const digits = dni.replace(/\D/g, '');
  if (digits.length < 4) {
    return '00****00';
  }
  return `${digits.slice(0, 2)}****${digits.slice(-2)}`;
}

function splitApellidoNombre(apellidoNombre: string): { apellido: string; nombre: string } {
  const trimmed = apellidoNombre.trim();
  const idx = trimmed.indexOf(' ');
  if (idx === -1) {
    return { apellido: trimmed, nombre: '' };
  }
  return { apellido: trimmed.slice(0, idx), nombre: trimmed.slice(idx + 1).trim() };
}

export class InMemoryStudentsService implements StudentsService {
  private rows: SeedAlumnoRaw[] = initialSeed.map((r) => ({ ...r }));
  private nextId = Math.max(...initialSeed.map((r) => r.id)) + 1;

  async listar(): Promise<readonly Alumno[]> {
    return this.rows.map(({ id, apellido, nombre, dniMostrar, estado, tieneEmail, cursosConAsistencia, certificacionesValidas }) => ({
      id, apellido, nombre, dniMostrar, estado, tieneEmail, cursosConAsistencia, certificacionesValidas,
    }));
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
      estado: found.estado,
      tieneEmail: found.tieneEmail,
      cursosConAsistencia: found.cursosConAsistencia,
      certificacionesValidas: found.certificacionesValidas,
      ingreso: found.ingreso,
      cursos: JSON.parse(JSON.stringify(cursos)) as CursoPresente[],
    };
  }

  async crear(draft: AlumnoDraft): Promise<AlumnoDetalle> {
    const apellidoNombre = draft.apellidoNombre.trim();
    const dni = draft.dni.trim();
    if (!apellidoNombre || !dni) {
      throw new Error('apellidoNombre y dni son requeridos');
    }
    const dniMostrar = maskDni(dni);
    const { apellido, nombre } = splitApellidoNombre(apellidoNombre);
    const id = this.nextId++;
    const row: SeedAlumnoRaw = {
      id,
      apellido,
      nombre,
      dniMostrar,
      estado: draft.estado ?? 'activo',
      tieneEmail: false,
      cursosConAsistencia: 0,
      certificacionesValidas: 0,
      ingreso: String(new Date().getFullYear()),
    };
    this.rows = [...this.rows, row];
    return {
      ...row,
      cursos: [],
    };
  }
}
