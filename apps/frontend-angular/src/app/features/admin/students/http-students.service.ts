// Fuente HTTP de alumnos. Implementa StudentsService contra la API PHP admin.
// GET /admin/alumnos → envelope { data: { items: AlumnoDto[] } }.
// Mapeo: apellidoNombre se divide en apellido+nombre (primer espacio).
// tieneEmail default false (backend no expone email). ingreso y cursos default null/[].
import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { firstValueFrom } from 'rxjs';
import { environment } from '../../../../environments/environment';
import { Alumno, AlumnoDetalle } from './students.models';
import { StudentsService } from './students.service';

interface AlumnoDto {
  id: number;
  apellidoNombre: string;
  dniMostrar: string;
  estado: string;
}

interface ApiEnvelope<T> {
  data: T;
  meta: { requestId: string };
}

interface ListResponse { items: AlumnoDto[] }

@Injectable({ providedIn: 'root' })
export class HttpStudentsService implements StudentsService {
  private readonly http = inject(HttpClient);

  async listar(): Promise<readonly Alumno[]> {
    const url = `${environment.apiBaseUrl}/admin/alumnos`;
    const envelope = await firstValueFrom(
      this.http.get<ApiEnvelope<ListResponse>>(url),
    );
    return envelope.data.items.map((dto) => this.toAlumno(dto));
  }

  async contar(): Promise<number> {
    const url = `${environment.apiBaseUrl}/admin/alumnos`;
    const envelope = await firstValueFrom(
      this.http.get<ApiEnvelope<ListResponse>>(url),
    );
    return envelope.data.items.length;
  }

  async obtener(id: number): Promise<AlumnoDetalle | null> {
    const url = `${environment.apiBaseUrl}/admin/alumnos/${id}`;
    try {
      const envelope = await firstValueFrom(
        this.http.get<ApiEnvelope<AlumnoDto>>(url),
      );
      return this.toAlumnoDetalle(envelope.data);
    } catch (e) {
      // ponytail: 404 → null (spec permite null). Otros errores propagan.
      if (e instanceof Object && 'status' in e && (e as { status: number }).status === 404) {
        return null;
      }
      throw e;
    }
  }

  private splitApellidoNombre(apellidoNombre: string): { apellido: string; nombre: string } {
    const trimmed = apellidoNombre.trim();
    const idx = trimmed.indexOf(' ');
    if (idx === -1) {
      return { apellido: trimmed, nombre: '' };
    }
    return { apellido: trimmed.slice(0, idx), nombre: trimmed.slice(idx + 1).trim() };
  }

  private toAlumno(dto: AlumnoDto): Alumno {
    const { apellido, nombre } = this.splitApellidoNombre(dto.apellidoNombre);
    return {
      id: dto.id,
      apellido,
      nombre,
      dniMostrar: dto.dniMostrar,
      // ponytail: backend no expone email; default false hasta que lo agregue.
      tieneEmail: false,
      cursosConAsistencia: 0,
      certificacionesValidas: 0,
    };
  }

  private toAlumnoDetalle(dto: AlumnoDto): AlumnoDetalle {
    const { apellido, nombre } = this.splitApellidoNombre(dto.apellidoNombre);
    return {
      id: dto.id,
      apellido,
      nombre,
      dniMostrar: dto.dniMostrar,
      tieneEmail: false,
      cursosConAsistencia: 0,
      certificacionesValidas: 0,
      // ponytail: backend sin campo ingreso ni asociación curso-alumno.
      ingreso: '',
      cursos: [],
    };
  }
}