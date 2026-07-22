// Fuente HTTP de asistencias. Implementa AttendanceService contra la API PHP admin.
// listarAlumnos: GET /admin/alumnos (sin link table curso-alumno → devuelve todos los activos).
// listarAsistencias: GET /admin/asistencias?cursoId=:cursoId, filtra por fechaId client-side.
// marcar: orquestación DELETE existing + POST present, all-or-nothing.
// anular: DELETE /admin/asistencias/:id.
import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { firstValueFrom } from 'rxjs';
import { environment } from '../../../../../environments/environment';
import {
  Asistencia,
  AsistenciaAlumno,
  AsistenciaMarcado,
  AttendanceService,
  HubAsistencias,
} from '../models/attendance.types';
import { EstadoFecha } from '../../courses/courses.models';

interface AlumnoDto {
  id: number;
  apellido?: string;
  nombre?: string;
  apellidoNombre?: string;
  dniMostrar: string;
  estado: string;
}

interface AsistenciaDto {
  id: number;
  alumnoId: number;
  cursoId: number;
  cursoFechaId: number;
  fecha: string;
  fechaEstado: string;
  registradoEn: string;
}

interface ApiEnvelope<T> {
  data: T;
  meta: { requestId: string };
}

interface AlumnosListResponse { items: AlumnoDto[] }
interface AsistenciasListResponse { items: AsistenciaDto[] }

interface HubCursoDto {
  id: number;
  codigo: string;
  nombre: string;
  estado: string;
}

interface HubFechaDto {
  id: number;
  cursoId: number;
  fecha: string;
  descripcion: string | null;
  orden: number;
  estado: string;
}

interface HubResponse {
  cursos: HubCursoDto[];
  fechas: HubFechaDto[];
  asistencias: AsistenciaDto[];
  alumnosActivos: number;
}

@Injectable({ providedIn: 'root' })
export class HttpAttendanceService implements AttendanceService {
  private readonly http = inject(HttpClient);
  /** Cache de roster global (HTTP ignora cursoId); evita N GET /admin/alumnos idénticos. */
  private alumnosActivosCache: Promise<readonly AsistenciaAlumno[]> | null = null;
  /** Coalescing por curso: evita GET duplicados en la misma sesión de carga. */
  private asistenciasPorCurso = new Map<number, Promise<readonly Asistencia[]>>();

  async listarAlumnos(cursoId: number): Promise<readonly AsistenciaAlumno[]> {
    // ponytail: backend sin link table curso-alumno; devolvemos todos los activos.
    void cursoId;
    this.alumnosActivosCache ??= this.fetchAlumnosActivos();
    return this.alumnosActivosCache;
  }

  private async fetchAlumnosActivos(): Promise<readonly AsistenciaAlumno[]> {
    const url = `${environment.apiBaseUrl}/admin/alumnos`;
    const envelope = await firstValueFrom(
      this.http.get<ApiEnvelope<AlumnosListResponse>>(url),
    );
    return envelope.data.items
      .filter((d) => d.estado === 'activo')
      .map((d) => ({
        id: d.id,
        apellidoNombre:
          (d.apellidoNombre ?? `${d.apellido ?? ''} ${d.nombre ?? ''}`.trim()).trim(),
        dniMostrar: d.dniMostrar,
        estado: d.estado as AsistenciaAlumno['estado'],
      }));
  }

  async listarAsistenciasDeCurso(cursoId: number): Promise<readonly Asistencia[]> {
    let pending = this.asistenciasPorCurso.get(cursoId);
    if (!pending) {
      pending = this.fetchAsistenciasDeCurso(cursoId).catch((err) => {
        this.asistenciasPorCurso.delete(cursoId);
        throw err;
      });
      this.asistenciasPorCurso.set(cursoId, pending);
    }
    return pending;
  }

  private async fetchAsistenciasDeCurso(cursoId: number): Promise<readonly Asistencia[]> {
    const url = `${environment.apiBaseUrl}/admin/asistencias?cursoId=${cursoId}`;
    const envelope = await firstValueFrom(
      this.http.get<ApiEnvelope<AsistenciasListResponse>>(url),
    );
    return envelope.data.items.map((a) => this.toAsistencia(a));
  }

  async listarAsistencias(cursoId: number, fechaId: number): Promise<readonly Asistencia[]> {
    // ponytail: backend filtra solo por cursoId; fechaId se filtra client-side.
    const all = await this.listarAsistenciasDeCurso(cursoId);
    return all.filter((a) => a.cursoFechaId === fechaId);
  }

  async listarHub(): Promise<HubAsistencias> {
    const url = `${environment.apiBaseUrl}/admin/hub/asistencias`;
    const envelope = await firstValueFrom(this.http.get<ApiEnvelope<HubResponse>>(url));
    const data = envelope.data;
    const byCurso = new Map<number, Asistencia[]>();
    for (const a of data.asistencias) {
      const mapped = this.toAsistencia(a);
      const list = byCurso.get(mapped.cursoId) ?? [];
      list.push(mapped);
      byCurso.set(mapped.cursoId, list);
    }
    for (const [cursoId, list] of byCurso) {
      this.asistenciasPorCurso.set(cursoId, Promise.resolve(list));
    }
    return {
      cursos: data.cursos.map((c) => ({
        id: c.id,
        codigo: c.codigo,
        nombre: c.nombre,
        estado: c.estado,
      })),
      fechas: data.fechas.map((f) => ({
        id: f.id,
        cursoId: f.cursoId,
        fecha: f.fecha,
        descripcion: f.descripcion,
        orden: f.orden,
        estado: f.estado as EstadoFecha,
      })),
      asistencias: data.asistencias.map((a) => this.toAsistencia(a)),
      alumnosActivos: data.alumnosActivos,
    };
  }

  private invalidateAsistencias(cursoId?: number): void {
    if (cursoId === undefined) {
      this.asistenciasPorCurso.clear();
      return;
    }
    this.asistenciasPorCurso.delete(cursoId);
  }

  async listarAsistenciasPorPar(cursoId: number, alumnoId: number): Promise<readonly Asistencia[]> {
    const params = new URLSearchParams({
      cursoId: String(cursoId),
      alumnoId: String(alumnoId),
    });
    const url = `${environment.apiBaseUrl}/admin/asistencias?${params.toString()}`;
    const envelope = await firstValueFrom(
      this.http.get<ApiEnvelope<AsistenciasListResponse>>(url),
    );
    return envelope.data.items.map((a) => this.toAsistencia(a));
  }

  async listarAsistenciasPorAlumno(alumnoId: number): Promise<readonly Asistencia[]> {
    const params = new URLSearchParams({ alumnoId: String(alumnoId) });
    const url = `${environment.apiBaseUrl}/admin/asistencias?${params.toString()}`;
    const envelope = await firstValueFrom(
      this.http.get<ApiEnvelope<AsistenciasListResponse>>(url),
    );
    return envelope.data.items.map((a) => this.toAsistencia(a));
  }

  async marcar(
    cursoId: number,
    fechaId: number,
    marcados: readonly AsistenciaMarcado[],
  ): Promise<readonly Asistencia[]> {
    // 1. GET asistencias existentes del curso.
    const existing = await this.listarAsistencias(cursoId, fechaId);

    // 2. DELETE cada asistencia existente para esa fecha.
    for (const a of existing) {
      const url = `${environment.apiBaseUrl}/admin/asistencias/${a.id}`;
      await firstValueFrom(this.http.delete<ApiEnvelope<unknown>>(url));
    }

    // 3. POST cada marcado presente.
    const creadas: Asistencia[] = [];
    for (const m of marcados) {
      if (!m.presente) continue;
      const url = `${environment.apiBaseUrl}/admin/asistencias`;
      const envelope = await firstValueFrom(
        this.http.post<ApiEnvelope<AsistenciaDto>>(url, {
          alumnoId: m.alumnoId,
          cursoId,
          cursoFechaId: fechaId,
        }),
      );
      creadas.push(this.toAsistencia(envelope.data));
    }

    this.invalidateAsistencias(cursoId);
    return creadas;
  }

  async anular(asistenciaId: number): Promise<void> {
    const url = `${environment.apiBaseUrl}/admin/asistencias/${asistenciaId}`;
    await firstValueFrom(this.http.delete<ApiEnvelope<unknown>>(url));
    // Sin cursoId en la firma: invalidar todo el coalescing de lecturas.
    this.invalidateAsistencias();
  }

  private toAsistencia(dto: AsistenciaDto): Asistencia {
    return {
      id: dto.id,
      alumnoId: dto.alumnoId,
      cursoId: dto.cursoId,
      cursoFechaId: dto.cursoFechaId,
      fecha: dto.fecha,
      fechaEstado: dto.fechaEstado as Asistencia['fechaEstado'],
      registradoEn: dto.registradoEn,
    };
  }
}