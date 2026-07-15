// Fuente HTTP de certificaciones. Implementa CertificationsService contra la API PHP admin.
// GET /admin/certificados → envelope { data: { items: CertDto[] } }.
// Mapeo: certificateCode→numero, student.displayName→nombreAlumno, course.name→cursoNombre,
// status→estado, envio default 'pendiente-entrega' (backend sin campo envío).
// Filtro envio aplicado client-side.
import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { firstValueFrom } from 'rxjs';
import { environment } from '../../../../environments/environment';
import {
  Certificacion,
  CertificacionDetalle,
  CertificacionesFiltros,
  TipoEnvio,
} from './certifications.models';
import { CertificationsService } from './certifications.service';

interface CertListDto {
  id: number;
  certificateCode: string;
  status: string;
  student: { displayName: string; documentMasked: string };
  course: { id: number | null; name: string };
  alumnoId: number | null;
  cursoId: number | null;
  issuedAt: string;
  expiresAt: string | null;
  revokedAt: string | null;
  tokenPrefix: string | null;
}

interface CertDetailDto extends CertListDto {
  revocationReason: string | null;
  attendedDates: { fecha: string; descripcion: string | null; orden: number }[];
  auditEvents: { eventType: string; result: string; createdAt: string }[];
  links: { pdf: string; manualDelivery: string; qrPng: string };
}

interface ApiEnvelope<T> {
  data: T;
  meta: { requestId: string };
}

interface ListResponse { items: CertListDto[] }

@Injectable({ providedIn: 'root' })
export class HttpCertificationsService implements CertificationsService {
  private readonly http = inject(HttpClient);

  async listar(filtros?: CertificacionesFiltros): Promise<readonly Certificacion[]> {
    const url = `${environment.apiBaseUrl}/admin/certificados`;
    const envelope = await firstValueFrom(
      this.http.get<ApiEnvelope<ListResponse>>(url),
    );
    let list = envelope.data.items.map((dto) => this.toCertificacion(dto));
    // ponytail: filtro envio client-side; backend no conoce envio.
    if (filtros?.envio) {
      list = list.filter((c) => c.envio === filtros.envio);
    }
    if (filtros?.estado) {
      list = list.filter((c) => c.estado === filtros.estado);
    }
    if (filtros?.curso) {
      const q = filtros.curso.trim().toLowerCase();
      if (q) list = list.filter((c) => c.cursoNombre.toLowerCase().includes(q));
    }
    if (filtros?.q) {
      const q = filtros.q.trim().toLowerCase();
      if (q) {
        list = list.filter(
          (c) =>
            c.nombreAlumno.toLowerCase().includes(q) ||
            c.cursoNombre.toLowerCase().includes(q) ||
            c.numero.toLowerCase().includes(q),
        );
      }
    }
    return list;
  }

  async obtener(id: number): Promise<CertificacionDetalle> {
    const url = `${environment.apiBaseUrl}/admin/certificados/${id}`;
    const envelope = await firstValueFrom(
      this.http.get<ApiEnvelope<CertDetailDto>>(url),
    );
    return this.toCertificacionDetalle(envelope.data);
  }

  async contar(): Promise<number> {
    const url = `${environment.apiBaseUrl}/admin/certificados`;
    const envelope = await firstValueFrom(
      this.http.get<ApiEnvelope<ListResponse>>(url),
    );
    return envelope.data.items.length;
  }

  async revocar(id: number, motivo: string): Promise<void> {
    const url = `${environment.apiBaseUrl}/admin/certificados/${id}/revocar`;
    // ponytail: backend usa key `reason`, no `motivo`.
    await firstValueFrom(this.http.post<ApiEnvelope<unknown>>(url, { reason: motivo }));
  }

  private toCertificacion(dto: CertListDto): Certificacion {
    return {
      id: dto.id,
      numero: dto.certificateCode,
      nombreAlumno: dto.student.displayName,
      cursoNombre: dto.course.name,
      estado: dto.status as Certificacion['estado'],
      // ponytail: backend sin campo envío; default pendiente-entrega.
      envio: 'pendiente-entrega' as TipoEnvio,
      documentMasked: dto.student.documentMasked,
      tokenPrefix: dto.tokenPrefix ?? '',
      emitidoEn: dto.issuedAt,
      venceEn: dto.expiresAt,
    };
  }

  private toCertificacionDetalle(dto: CertDetailDto): CertificacionDetalle {
    return {
      ...this.toCertificacion(dto),
      publicValidationUrl: dto.links?.pdf ?? '',
      attendedDates: (dto.attendedDates ?? []).map((d) => d.fecha),
      auditEvents: (dto.auditEvents ?? []).map((e) => ({
        at: e.createdAt,
        accion: e.eventType,
        detalle: e.result,
      })),
    };
  }
}