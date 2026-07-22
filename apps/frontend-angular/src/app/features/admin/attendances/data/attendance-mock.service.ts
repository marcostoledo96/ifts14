// Implementación en memoria de AttendanceService.
// Seed ficticio: 12–15 personas por curso, dniMostrar = DNI completo ficticio.
// Sin token, legajo ni matrícula. Mutaciones solo en instancia; se pierden al
// recargar. Ver spec admin-attendances-frontend.
import { Injectable, inject } from '@angular/core';
import {
  Asistencia,
  AsistenciaAlumno,
  AsistenciaMarcado,
  AttendanceService,
  EstadoAlumno,
  HubAsistencias,
} from '../models/attendance.types';
import { COURSES_SOURCE } from '../../courses/courses.service';

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
  // DNI ficticio completo (8 dígitos) para UI admin (D0 2026-07-20).
  return String(20_000_000 + (n % 10_000_000)).padStart(8, '0');
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
  private readonly courses = inject(COURSES_SOURCE);

  constructor() {
    this.state = this.freshState();
  }

  // Tests: __reset() para arrancar con estado limpio entre specs.
  __reset(): void {
    this.state = this.freshState();
  }

  /** Limpia asistencias seed (útil en marcado, donde el baseline vacío es el contrato). */
  __clearAsistencias(): void {
    this.state.asistencias = [];
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

  async listarAlumnos(cursoId: number): Promise<readonly AsistenciaAlumno[]> {
    let list = this.state.alumnos.get(cursoId);
    if (!list) {
      // Cursos creados en la sesión (más allá del seed 1..6): generar roster
      // solo si el curso existe en COURSES_SOURCE. Evita “Curso no encontrado”
      // al marcar asistencias en un curso nuevo del mock.
      try {
        await this.courses.obtener(cursoId);
      } catch {
        return Promise.reject(new Error(`Curso no encontrado: ${cursoId}`));
      }
      list = seedAlumnos(cursoId);
      this.state.alumnos.set(cursoId, list);
    }
    return Promise.resolve(clone(list));
  }

  listarAsistenciasDeCurso(cursoId: number): Promise<readonly Asistencia[]> {
    const list = this.state.asistencias.filter((a) => a.cursoId === cursoId);
    return Promise.resolve(clone(list));
  }

  async listarHub(): Promise<HubAsistencias> {
    const cursos = await this.courses.listar();
    const fechasNested = await Promise.all(cursos.map((c) => this.courses.listarFechas(c.id)));
    const fechas = fechasNested.flat();
    let alumnosActivos = 0;
    for (const c of cursos) {
      const alumnos = await this.listarAlumnos(c.id);
      alumnosActivos = Math.max(alumnosActivos, alumnos.filter((a) => a.estado === 'activo').length);
    }
    return {
      cursos: cursos.map((c) => ({
        id: c.id,
        codigo: c.codigo,
        nombre: c.nombre,
        estado: c.estado,
      })),
      fechas: fechas.map((f) => ({
        id: f.id,
        cursoId: f.cursoId,
        fecha: f.fecha,
        descripcion: f.descripcion,
        orden: f.orden,
        estado: f.estado,
      })),
      asistencias: clone(this.state.asistencias),
      alumnosActivos,
    };
  }

  listarAsistencias(cursoId: number, fechaId: number): Promise<readonly Asistencia[]> {
    const list = this.state.asistencias.filter(
      (a) => a.cursoId === cursoId && a.cursoFechaId === fechaId,
    );
    return Promise.resolve(clone(list));
  }

  listarAsistenciasPorPar(cursoId: number, alumnoId: number): Promise<readonly Asistencia[]> {
    const list = this.state.asistencias.filter(
      (a) => a.cursoId === cursoId && a.alumnoId === alumnoId,
    );
    return Promise.resolve(clone(list));
  }

  listarAsistenciasPorAlumno(alumnoId: number): Promise<readonly Asistencia[]> {
    const list = this.state.asistencias.filter((a) => a.alumnoId === alumnoId);
    return Promise.resolve(clone(list));
  }

  async marcar(
    cursoId: number,
    fechaId: number,
    marcados: readonly AsistenciaMarcado[],
  ): Promise<readonly Asistencia[]> {
    // Metadatos de fecha desde el estado vigente del curso (COURSES_SOURCE),
    // no desde una tabla estática: así las fechas creadas/editadas en la
    // sesión se reconocen y las canceladas se rechazan. Sin duplicar el
    // seed de fechas acá.
    const det = await this.courses.obtener(cursoId);
    const fecha = det.fechas.find((f) => f.id === fechaId);
    if (!fecha) {
      // No normaliza una fecha inexistente: rechaza con error controlado.
      return Promise.reject(
        new Error(`Fecha no encontrada para curso ${cursoId}: ${fechaId}`),
      );
    }
    if (fecha.estado === 'cancelada') {
      return Promise.reject(
        new Error(`No se puede marcar asistencia en una fecha cancelada: ${fechaId}`),
      );
    }
    // Eliminar asistencias existentes para esta fecha (reemplazo completo).
    this.state.asistencias = this.state.asistencias.filter(
      (a) => !(a.cursoId === cursoId && a.cursoFechaId === fechaId),
    );
    const presentes = marcados.filter((m) => m.presente);
    const nuevoEstado = await this.applyFechaEstado(
      cursoId,
      fechaId,
      fecha.fecha,
      presentes.length,
    );
    const nuevas: Asistencia[] = [];
    for (const m of presentes) {
      const a: Asistencia = {
        id: this.state.nextAsistenciaId++,
        alumnoId: m.alumnoId,
        cursoId,
        cursoFechaId: fechaId,
        fecha: fecha.fecha,
        fechaEstado: nuevoEstado,
        registradoEn: new Date().toISOString(),
      };
      this.state.asistencias.push(a);
      nuevas.push(a);
    }
    return Promise.resolve(clone(nuevas));
  }

  async anular(asistenciaId: number): Promise<void> {
    const idx = this.state.asistencias.findIndex((a) => a.id === asistenciaId);
    if (idx < 0) {
      return Promise.reject(new Error(`Asistencia no encontrada: ${asistenciaId}`));
    }
    const target = this.state.asistencias[idx];
    this.state.asistencias.splice(idx, 1);
    const det = await this.courses.obtener(target.cursoId);
    const fecha = det.fechas.find((f) => f.id === target.cursoFechaId);
    if (fecha && fecha.estado !== 'cancelada') {
      const restantes = this.state.asistencias.filter(
        (a) => a.cursoId === target.cursoId && a.cursoFechaId === target.cursoFechaId,
      );
      const nuevoEstado = await this.applyFechaEstado(
        target.cursoId,
        target.cursoFechaId,
        fecha.fecha,
        restantes.length,
      );
      this.state.asistencias = this.state.asistencias.map((a) =>
        a.cursoId === target.cursoId && a.cursoFechaId === target.cursoFechaId
          ? { ...a, fechaEstado: nuevoEstado }
          : a,
      );
    }
    return Promise.resolve();
  }

  /** Misma regla que AdminMasterDataService::refreshCourseDateEstado (TZ AR). */
  private hoyIsoAr(): string {
    return new Intl.DateTimeFormat('en-CA', {
      timeZone: 'America/Argentina/Buenos_Aires',
    }).format(new Date());
  }

  private async applyFechaEstado(
    cursoId: number,
    fechaId: number,
    fechaIso: string,
    activas: number,
  ): Promise<'programada' | 'realizada'> {
    const det = await this.courses.obtener(cursoId);
    const fecha = det.fechas.find((f) => f.id === fechaId);
    if (!fecha || fecha.estado === 'cancelada') {
      return 'programada';
    }
    const hoy = this.hoyIsoAr();
    const nuevoEstado: 'programada' | 'realizada' =
      activas >= 1 && fechaIso < hoy ? 'realizada' : 'programada';
    if (nuevoEstado !== fecha.estado) {
      await this.courses.guardarFecha(cursoId, {
        id: fecha.id,
        fecha: fecha.fecha,
        descripcion: fecha.descripcion,
        orden: fecha.orden,
        estado: nuevoEstado,
      });
    }
    return nuevoEstado;
  }
}

// Seed de asistencias: algunas fechas realizadas ya tienen presentes.
// ponytail: seed mínimo para que listarAsistencias tenga datos en fechas realizadas.
function seedAsistencias(): Asistencia[] {
  const list: Asistencia[] = [];
  let id = 4000;
  // Curso 1, fechas 11, 12, 13: 3 presentes para alumnoId 1 (Persona Uno)
  const fechasCurso1 = [
    { fechaId: 11, fecha: '2026-03-02' },
    { fechaId: 12, fecha: '2026-03-09' },
    { fechaId: 13, fecha: '2026-03-16' },
  ];
  for (const f of fechasCurso1) {
    list.push({
      id: id++,
      alumnoId: 1,
      cursoId: 1,
      cursoFechaId: f.fechaId,
      fecha: f.fecha,
      fechaEstado: 'realizada',
      registradoEn: `${f.fecha}T12:00:00.000Z`,
    });
  }
  // Curso 2, fechas 21, 22: 2 presentes para alumnoId 2 (Persona Dos)
  const fechasCurso2 = [
    { fechaId: 21, fecha: '2026-04-05' },
    { fechaId: 22, fecha: '2026-04-12' },
  ];
  for (const f of fechasCurso2) {
    list.push({
      id: id++,
      alumnoId: 2,
      cursoId: 2,
      cursoFechaId: f.fechaId,
      fecha: f.fecha,
      fechaEstado: 'realizada',
      registradoEn: `${f.fecha}T12:00:00.000Z`,
    });
  }
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
