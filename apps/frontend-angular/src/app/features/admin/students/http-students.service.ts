/**
 * HTTP real: GET/POST/PATCH /admin/alumnos.
 * DTO: apellido + nombre (+ apellidoNombre compuesto de compat).
 */
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { firstValueFrom } from 'rxjs';
import { environment } from '../../../../environments/environment';
import { StudentDuplicateError } from './student-duplicate.error';
import { Alumno, AlumnoDetalle, AlumnoDraft } from './students.models';
import { StudentsService } from './students.service';

interface AlumnoDto {
  id: number;
  apellido?: string;
  nombre?: string;
  apellidoNombre?: string;
  dniMostrar: string;
  email?: string | null;
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

  async crear(draft: AlumnoDraft): Promise<AlumnoDetalle> {
    const url = `${environment.apiBaseUrl}/admin/alumnos`;
    const body: { apellido: string; nombre: string; dni: string; email?: string; estado?: string } = {
      apellido: draft.apellido,
      nombre: draft.nombre,
      dni: draft.dni,
    };
    const email = (draft.email ?? '').trim();
    if (email !== '') {
      body.email = email;
    }
    if (draft.estado !== undefined) {
      body.estado = draft.estado;
    }
    try {
      const envelope = await firstValueFrom(
        this.http.post<ApiEnvelope<AlumnoDto>>(url, body),
      );
      return this.toAlumnoDetalle(envelope.data);
    } catch (err) {
      if (err instanceof HttpErrorResponse && err.status === 409) {
        const fromApi = this.existingIdFromConflict(err);
        if (fromApi !== null) {
          throw new StudentDuplicateError(fromApi);
        }
        const dni = draft.dni.trim().replace(/\D/g, '');
        const fromList = await this.findIdByDni(dni);
        if (fromList !== null) {
          throw new StudentDuplicateError(fromList);
        }
      }
      throw err;
    }
  }

  async actualizar(id: number, draft: AlumnoDraft): Promise<AlumnoDetalle> {
    const url = `${environment.apiBaseUrl}/admin/alumnos/${id}`;
    const body: {
      apellido: string;
      nombre: string;
      dni: string;
      email: string | null;
      estado?: string;
    } = {
      apellido: draft.apellido,
      nombre: draft.nombre,
      dni: draft.dni,
      email: (draft.email ?? '').trim() === '' ? null : (draft.email ?? '').trim(),
    };
    if (draft.estado !== undefined) {
      body.estado = draft.estado;
    }
    try {
      const envelope = await firstValueFrom(
        this.http.patch<ApiEnvelope<AlumnoDto>>(url, body),
      );
      return this.toAlumnoDetalle(envelope.data);
    } catch (err) {
      if (err instanceof HttpErrorResponse && err.status === 409) {
        const fromApi = this.existingIdFromConflict(err);
        if (fromApi !== null) {
          throw new StudentDuplicateError(fromApi);
        }
      }
      throw err;
    }
  }

  private existingIdFromConflict(err: HttpErrorResponse): number | null {
    const details = (err.error as { error?: { details?: { existingStudentId?: unknown } } } | null)
      ?.error?.details;
    const id = details?.existingStudentId;
    return typeof id === 'number' && Number.isInteger(id) && id > 0 ? id : null;
  }

  /** Fallback si el 409 no trae existingStudentId. */
  private async findIdByDni(dni: string): Promise<number | null> {
    if (!dni) return null;
    try {
      const list = await this.listar();
      const found = list.find((a) => a.dniMostrar === dni);
      return found?.id ?? null;
    } catch {
      return null;
    }
  }

  private splitApellidoNombre(apellidoNombre: string): { apellido: string; nombre: string } {
    const trimmed = apellidoNombre.trim();
    const commaIdx = trimmed.indexOf(',');
    if (commaIdx !== -1) {
      return {
        apellido: trimmed.slice(0, commaIdx).trim(),
        nombre: trimmed.slice(commaIdx + 1).trim(),
      };
    }
    const idx = trimmed.indexOf(' ');
    if (idx === -1) {
      return { apellido: trimmed, nombre: '' };
    }
    return { apellido: trimmed.slice(0, idx), nombre: trimmed.slice(idx + 1).trim() };
  }

  private toAlumno(dto: AlumnoDto): Alumno {
    let apellido = typeof dto.apellido === 'string' ? dto.apellido.trim() : '';
    let nombre = typeof dto.nombre === 'string' ? dto.nombre.trim() : '';
    if (apellido === '' && nombre === '' && typeof dto.apellidoNombre === 'string') {
      const split = this.splitApellidoNombre(dto.apellidoNombre);
      apellido = split.apellido;
      nombre = split.nombre;
    }
    const email =
      typeof dto.email === 'string' && dto.email.trim() !== '' ? dto.email.trim() : null;
    return {
      id: dto.id,
      apellido,
      nombre,
      dniMostrar: dto.dniMostrar,
      email,
      estado: dto.estado === 'inactivo' ? 'inactivo' : 'activo',
      tieneEmail: email !== null,
      cursosConAsistencia: null,
      certificacionesValidas: null,
    };
  }

  private toAlumnoDetalle(dto: AlumnoDto): AlumnoDetalle {
    return {
      ...this.toAlumno(dto),
      ingreso: '',
      cursos: [],
    };
  }
}
