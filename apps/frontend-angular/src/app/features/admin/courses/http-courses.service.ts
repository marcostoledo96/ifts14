// Fuente HTTP de cursos. Implementa CoursesService contra la API PHP admin.
// GET /admin/cursos → envelope { data: { items: CursoDto[] } }.
// Filtros q y conFechas aplicados client-side (conFechas requiere listarFechas por curso).
// reemplazarFechas: backend sin DELETE de fecha → PATCH estado='cancelada' como fallback.
import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { firstValueFrom } from 'rxjs';
import { environment } from '../../../../environments/environment';
import {
  Curso,
  CursoDetalle,
  CursoDraft,
  CursoFecha,
  CursoFechaDraft,
  CursosFiltros,
  EstadoCurso,
} from './courses.models';
import { CoursesService } from './courses.service';

interface CursoDto {
  id: number;
  codigo: string;
  nombre: string;
  estado: string;
  createdAt: string;
  updatedAt: string;
}

interface CursoFechaDto {
  id: number;
  cursoId: number;
  fecha: string;
  descripcion: string | null;
  orden: number;
  estado: string;
}

interface ApiEnvelope<T> {
  data: T;
  meta: { requestId: string };
}

interface ListResponse { items: CursoDto[] }
interface FechasResponse { items: CursoFechaDto[] }

@Injectable({ providedIn: 'root' })
export class HttpCoursesService implements CoursesService {
  private readonly http = inject(HttpClient);

  async listar(filtros?: CursosFiltros): Promise<readonly Curso[]> {
    const url = `${environment.apiBaseUrl}/admin/cursos`;
    const envelope = await firstValueFrom(
      this.http.get<ApiEnvelope<ListResponse>>(url),
    );
    let list = envelope.data.items.map((dto) => this.toCurso(dto, 0));
    if (filtros?.estado) {
      list = list.filter((c) => c.estado === filtros.estado);
    }
    if (filtros?.q) {
      const q = filtros.q.trim().toLowerCase();
      if (q) {
        list = list.filter(
          (c) => c.codigo.toLowerCase().includes(q) || c.nombre.toLowerCase().includes(q),
        );
      }
    }
    // ponytail: conFechas requiere fetch de fechas por curso; sin link table, omitimos.
    if (filtros?.conFechas !== undefined) {
      const withFechas = await Promise.all(
        list.map(async (c) => {
          const fechas = await this.listarFechas(c.id);
          return { curso: { ...c, cantidadFechas: fechas.length }, tiene: fechas.length > 0 };
        }),
      );
      list = withFechas
        .filter((r) => r.tiene === filtros.conFechas)
        .map((r) => r.curso);
    }
    return list;
  }

  async obtener(id: number): Promise<CursoDetalle> {
    const base = `${environment.apiBaseUrl}/admin/cursos/${id}`;
    const [cursoEnv, fechasEnv] = await Promise.all([
      firstValueFrom(this.http.get<ApiEnvelope<CursoDto>>(base)),
      firstValueFrom(this.http.get<ApiEnvelope<FechasResponse>>(`${base}/fechas`)),
    ]);
    return {
      ...this.toCurso(cursoEnv.data, fechasEnv.data.items.length),
      fechas: fechasEnv.data.items.map((f) => this.toCursoFecha(f)),
    };
  }

  async crear(dto: CursoDraft): Promise<CursoDetalle> {
    const url = `${environment.apiBaseUrl}/admin/cursos`;
    const envelope = await firstValueFrom(
      this.http.post<ApiEnvelope<CursoDto>>(url, {
        codigo: dto.codigo,
        nombre: dto.nombre,
        estado: dto.estado,
      }),
    );
    return { ...this.toCurso(envelope.data, 0), fechas: [] };
  }

  async actualizarEstado(id: number, estado: EstadoCurso): Promise<CursoDetalle> {
    const url = `${environment.apiBaseUrl}/admin/cursos/${id}/estado`;
    const envelope = await firstValueFrom(
      this.http.patch<ApiEnvelope<CursoDto>>(url, { estado }),
    );
    return { ...this.toCurso(envelope.data, 0), fechas: [] };
  }

  async listarFechas(cursoId: number): Promise<readonly CursoFecha[]> {
    const url = `${environment.apiBaseUrl}/admin/cursos/${cursoId}/fechas`;
    const envelope = await firstValueFrom(
      this.http.get<ApiEnvelope<FechasResponse>>(url),
    );
    return envelope.data.items.map((f) => this.toCursoFecha(f));
  }

  async guardarFecha(cursoId: number, dto: CursoFechaDraft): Promise<CursoFecha> {
    if (dto.id === null) {
      const url = `${environment.apiBaseUrl}/admin/cursos/${cursoId}/fechas`;
      const envelope = await firstValueFrom(
        this.http.post<ApiEnvelope<CursoFechaDto>>(url, {
          fecha: dto.fecha,
          descripcion: dto.descripcion,
          orden: dto.orden,
          estado: dto.estado,
        }),
      );
      return this.toCursoFecha(envelope.data);
    }
    const url = `${environment.apiBaseUrl}/admin/cursos/${cursoId}/fechas/${dto.id}`;
    const envelope = await firstValueFrom(
      this.http.patch<ApiEnvelope<CursoFechaDto>>(url, {
        fecha: dto.fecha,
        descripcion: dto.descripcion,
        orden: dto.orden,
        estado: dto.estado,
      }),
    );
    return this.toCursoFecha(envelope.data);
  }

  async reemplazarFechas(cursoId: number, dtos: CursoFechaDraft[]): Promise<readonly CursoFecha[]> {
    // 1. GET fechas actuales.
    const current = await this.listarFechas(cursoId);
    const currentIds = new Set(current.map((f) => f.id));
    const dtoIds = new Set(dtos.filter((d) => d.id !== null).map((d) => d.id as number));

    // 2. Diff.
    const toDelete = current.filter((f) => !dtoIds.has(f.id));
    const toPatch = dtos.filter((d) => d.id !== null) as (CursoFechaDraft & { id: number })[];
    const toPost = dtos.filter((d) => d.id === null);

    // 3. Ejecutar en secuencia; cualquier fallo rechaza toda la operación.
    // ponytail: backend sin DELETE de fecha → PATCH estado='cancelada' como fallback.
    for (const f of toDelete) {
      await this.guardarFecha(cursoId, {
        id: f.id,
        fecha: f.fecha,
        descripcion: f.descripcion,
        orden: f.orden,
        estado: 'cancelada',
      });
    }
    for (const d of toPatch) {
      await this.guardarFecha(cursoId, d);
    }
    for (const d of toPost) {
      await this.guardarFecha(cursoId, d);
    }

    // 4. Re-read para estado consistente.
    return this.listarFechas(cursoId);
  }

  private toCurso(dto: CursoDto, cantidadFechas: number): Curso {
    return {
      id: dto.id,
      codigo: dto.codigo,
      nombre: dto.nombre,
      estado: dto.estado as Curso['estado'],
      createdAt: dto.createdAt,
      updatedAt: dto.updatedAt,
      // ponytail: backend sin cuatrimestre; default 'Sin programar' para matchear modelo.
      cuatrimestre: 'Sin programar',
      cantidadFechas,
      alumnosPresentes: null,
      certificaciones: null,
    };
  }

  private toCursoFecha(dto: CursoFechaDto): CursoFecha {
    return {
      id: dto.id,
      cursoId: dto.cursoId,
      fecha: dto.fecha,
      descripcion: dto.descripcion,
      orden: dto.orden,
      estado: dto.estado as CursoFecha['estado'],
    };
  }
}