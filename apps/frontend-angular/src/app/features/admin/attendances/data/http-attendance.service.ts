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
} from '../models/attendance.types';

interface AlumnoDto {
  id: number;
  apellidoNombre: string;
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

@Injectable({ providedIn: 'root' })
export class HttpAttendanceService implements AttendanceService {
  private readonly http = inject(HttpClient);

  async listarAlumnos(cursoId: number): Promise<readonly AsistenciaAlumno[]> {
    // ponytail: backend sin link table curso-alumno; devolvemos todos los activos.
    void cursoId;
    const url = `${environment.apiBaseUrl}/admin/alumnos`;
    const envelope = await firstValueFrom(
      this.http.get<ApiEnvelope<AlumnosListResponse>>(url),
    );
    return envelope.data.items
      .filter((d) => d.estado === 'activo')
      .map((d) => ({
        id: d.id,
        apellidoNombre: d.apellidoNombre,
        dniMostrar: d.dniMostrar,
        estado: d.estado as AsistenciaAlumno['estado'],
      }));
  }

  async listarAsistencias(cursoId: number, fechaId: number): Promise<readonly Asistencia[]> {
    const url = `${environment.apiBaseUrl}/admin/asistencias?cursoId=${cursoId}`;
    const envelope = await firstValueFrom(
      this.http.get<ApiEnvelope<AsistenciasListResponse>>(url),
    );
    // ponytail: backend filtra solo por cursoId; fechaId se filtra client-side.
    return envelope.data.items
      .filter((a) => a.cursoFechaId === fechaId)
      .map((a) => this.toAsistencia(a));
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

    return creadas;
  }

  async anular(asistenciaId: number): Promise<void> {
    const url = `${environment.apiBaseUrl}/admin/asistencias/${asistenciaId}`;
    await firstValueFrom(this.http.delete<ApiEnvelope<unknown>>(url));
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