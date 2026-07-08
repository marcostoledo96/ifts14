// Implementación en memoria de AttendanceService.
// Seed ficticio: 12–15 personas por curso, dniMostrar enmascarado (XX****XX).
// Sin email, DNI completo, token, legajo ni matrícula. Mutaciones solo en
// instancia; se pierden al recargar. Ver spec admin-attendances-frontend.
import { Injectable } from '@angular/core';
import {
  Asistencia,
  AsistenciaAlumno,
  AsistenciaMarcado,
  AttendanceService,
  EstadoAlumno,
} from '../models/attendance.types';
import { EstadoFecha } from '../../courses/courses.models';

// ponytail: nombres institucionmente neutros, no plausibles como reales.
// Evitar nombres propios comunes que parezcan datos reales de estudiantes.
const APellidos = [
  'A1', 'A2', 'A3', 'A4', 'A5', 'A6', 'A7', 'A8', 'A9', 'A10',
  'A11', 'A12', 'A13', 'A14', 'A15',
];
const Nombres = [
  'B1', 'B2', 'B3', 'B4', 'B5', 'B6', 'B7', 'B8', 'B9', 'B10',
  'B11', 'B12', 'B13', 'B14', 'B15',
];

function dniMostrar(n: number): string {
  // XX****XX: 2 dígitos, 4 asteriscos, 2 dígitos. Sin DNI completo.
  const s = String(n).padStart(8, '0');
  return `${s.slice(0, 2)}****${s.slice(-2)}`;
}

function seedAlumnos(cursoId: number): AsistenciaAlumno[] {
  const base = (cursoId - 1) * 15;
  const count = 12 + (cursoId % 4); // 12–15 personas
  const list: AsistenciaAlumno[] = [];
  for (let i = 0; i < count; i++) {
    const idx = base + i + 1;
    list.push({
      id: idx,
      // apellidoNombre neutro, no plausible como nombre real de estudiante.
      apellidoNombre: `${APellidos[i % APellidos.length]} ${Nombres[i % Nombres.length]}`,
      dniMostrar: dniMostrar(idx),
      estado: (i % 10 === 9 ? 'inactivo' : 'activo') as EstadoAlumno,
    });
  }
  return list;
}

interface State {
  alumnos: Map<number, AsistenciaAlumno[]>; // cursoId → alumnos
  asistencias: Asistencia[]; // todas las asistencias registradas
  nextAsistenciaId: number;
}

function clone<T>(value: T): T {
  return JSON.parse(JSON.stringify(value)) as T;
}

@Injectable({ providedIn: 'root' })
export class AttendanceMockService implements AttendanceService {
  private state: State;

  constructor() {
    this.state = this.freshState();
  }

  // Tests: __reset() para arrancar con estado limpio entre specs.
  __reset(): void {
    this.state = this.freshState();
  }

  private freshState(): State {
    // Alumnos seed para los cursos 1..6 del seed de InMemoryCoursesService.
    const alumnos = new Map<number, AsistenciaAlumno[]>();
    for (let cid = 1; cid <= 6; cid++) {
      alumnos.set(cid, clone(seedAlumnos(cid)));
    }
    return {
      alumnos,
      asistencias: clone(seedAsistencias()),
      nextAsistenciaId: 5000,
    };
  }

  listarAlumnos(cursoId: number): Promise<readonly AsistenciaAlumno[]> {
    const list = this.state.alumnos.get(cursoId);
    if (!list) {
      return Promise.reject(new Error(`Curso no encontrado: ${cursoId}`));
    }
    return Promise.resolve(clone(list));
  }

  listarAsistencias(cursoId: number, fechaId: number): Promise<readonly Asistencia[]> {
    const list = this.state.asistencias.filter(
      (a) => a.cursoId === cursoId && a.cursoFechaId === fechaId,
    );
    return Promise.resolve(clone(list));
  }

  marcar(
    cursoId: number,
    fechaId: number,
    marcados: readonly AsistenciaMarcado[],
  ): Promise<readonly Asistencia[]> {
    const fechaMeta = fechaMetaFor(cursoId, fechaId);
    if (!fechaMeta) {
      // No normaliza una fecha inexistente: rechaza con error controlado.
      return Promise.reject(
        new Error(`Fecha no encontrada para curso ${cursoId}: ${fechaId}`),
      );
    }
    // Eliminar asistencias existentes para esta fecha (reemplazo completo).
    this.state.asistencias = this.state.asistencias.filter(
      (a) => !(a.cursoId === cursoId && a.cursoFechaId === fechaId),
    );
    const nuevas: Asistencia[] = [];
    for (const m of marcados) {
      if (!m.presente) continue; // solo registrar presentes
      const a: Asistencia = {
        id: this.state.nextAsistenciaId++,
        alumnoId: m.alumnoId,
        cursoId,
        cursoFechaId: fechaId,
        fecha: fechaMeta.fecha,
        fechaEstado: fechaMeta.estado,
        registradoEn: new Date().toISOString(),
      };
      this.state.asistencias.push(a);
      nuevas.push(a);
    }
    return Promise.resolve(clone(nuevas));
  }

  anular(asistenciaId: number): Promise<void> {
    const idx = this.state.asistencias.findIndex((a) => a.id === asistenciaId);
    if (idx < 0) {
      return Promise.reject(new Error(`Asistencia no encontrada: ${asistenciaId}`));
    }
    this.state.asistencias.splice(idx, 1);
    return Promise.resolve();
  }
}

// Metadatos de fecha para construir Asistencia al marcar.
// ponytail: tabla estática alineada con el seed de InMemoryCoursesService.
// Retorna null para fechaId desconocido: no normaliza una fecha inexistente.
function fechaMetaFor(
  cursoId: number,
  fechaId: number,
): { fecha: string; estado: EstadoFecha } | null {
  const meta = FECHA_META.find((f) => f.cursoId === cursoId && f.fechaId === fechaId);
  return meta ? { fecha: meta.fecha, estado: meta.estado } : null;
}

const FECHA_META: { cursoId: number; fechaId: number; fecha: string; estado: EstadoFecha }[] = [
  { cursoId: 1, fechaId: 11, fecha: '2026-03-02', estado: 'programada' },
  { cursoId: 1, fechaId: 12, fecha: '2026-03-09', estado: 'programada' },
  { cursoId: 1, fechaId: 13, fecha: '2026-03-16', estado: 'programada' },
  { cursoId: 2, fechaId: 21, fecha: '2026-04-05', estado: 'programada' },
  { cursoId: 2, fechaId: 22, fecha: '2026-04-12', estado: 'programada' },
  { cursoId: 3, fechaId: 31, fecha: '2026-05-04', estado: 'programada' },
  { cursoId: 4, fechaId: 41, fecha: '2025-09-01', estado: 'realizada' },
  { cursoId: 4, fechaId: 42, fecha: '2025-09-08', estado: 'realizada' },
  { cursoId: 5, fechaId: 51, fecha: '2025-06-10', estado: 'cancelada' },
  { cursoId: 6, fechaId: 61, fecha: '2026-06-01', estado: 'programada' },
  { cursoId: 6, fechaId: 62, fecha: '2026-06-08', estado: 'programada' },
  { cursoId: 6, fechaId: 63, fecha: '2026-06-15', estado: 'programada' },
];

// Seed de asistencias: algunas fechas realizadas ya tienen presentes.
// ponytail: seed mínimo para que listarAsistencias tenga datos en fechas realizadas.
function seedAsistencias(): Asistencia[] {
  const list: Asistencia[] = [];
  let id = 4000;
  // Curso 4 (cerrado), fecha 41 (realizada): 8 presentes
  for (let i = 1; i <= 8; i++) {
    list.push({
      id: id++,
      alumnoId: (4 - 1) * 15 + i,
      cursoId: 4,
      cursoFechaId: 41,
      fecha: '2025-09-01',
      fechaEstado: 'realizada',
      registradoEn: '2025-09-01T12:00:00.000Z',
    });
  }
  // Curso 4, fecha 42 (realizada): 7 presentes
  for (let i = 1; i <= 7; i++) {
    list.push({
      id: id++,
      alumnoId: (4 - 1) * 15 + i,
      cursoId: 4,
      cursoFechaId: 42,
      fecha: '2025-09-08',
      fechaEstado: 'realizada',
      registradoEn: '2025-09-08T12:00:00.000Z',
    });
  }
  return list;
}