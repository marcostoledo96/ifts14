// Fuente HTTP de certificaciones. Implementa CertificationsService contra la API PHP admin.
// GET /admin/certificados → envelope { data: { items: CertDto[] } }.
// Mapeo: certificateCode→numero, student.displayName→nombreAlumno, course.name→cursoNombre,
// status→estado.
import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { firstValueFrom } from 'rxjs';
import { environment } from '../../../../environments/environment';
import {
  Certificacion,
  CertificacionDetalle,
  CertificacionesFiltros,
  EmisionResult,
  EmitirCertificacionPayload,
  EntregaManualDto,
  PdfStatus,
  RegenerarPdfResult,
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

interface EntregaManualDtoResponse {
  certificadoId: number;
  publicValidationUrl: string;
  pdfDownloadUrl: string;
  tokenPrefix: string;
  pdfAvailable: boolean;
  pdfStatus: string;
}

interface RegenerarPdfResponse {
  regenerado: boolean;
  mensaje?: string;
  publicValidationUrl?: string;
  pdfDownloadUrl?: string;
  pdfStatus?: string;
}

@Injectable({ providedIn: 'root' })
export class HttpCertificationsService implements CertificationsService {
  private readonly http = inject(HttpClient);

  async listar(filtros?: CertificacionesFiltros): Promise<readonly Certificacion[]> {
    const params = new URLSearchParams();
    if (filtros?.estado) params.set('estado', filtros.estado);
    if (filtros?.cursoId != null) params.set('cursoId', String(filtros.cursoId));
    if (filtros?.alumnoId != null) params.set('alumnoId', String(filtros.alumnoId));
    const qs = params.toString();
    const url = `${environment.apiBaseUrl}/admin/certificados${qs ? `?${qs}` : ''}`;
    const envelope = await firstValueFrom(
      this.http.get<ApiEnvelope<ListResponse>>(url),
    );
    let list = envelope.data.items.map((dto) => this.toCertificacion(dto));
    // Filtros texto siguen client-side (backend no los expone).
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

  async obtenerEntregaManual(id: number): Promise<EntregaManualDto> {
    const url = `${environment.apiBaseUrl}/admin/certificados/${id}/entrega-manual`;
    const envelope = await firstValueFrom(
      this.http.get<ApiEnvelope<EntregaManualDtoResponse>>(url),
    );
    return {
      certificadoId: envelope.data.certificadoId,
      publicValidationUrl: envelope.data.publicValidationUrl,
      pdfDownloadUrl: envelope.data.pdfDownloadUrl,
      tokenPrefix: envelope.data.tokenPrefix,
      pdfAvailable: envelope.data.pdfAvailable,
      pdfStatus: envelope.data.pdfStatus as PdfStatus,
    };
  }

  async descargarQrPng(id: number): Promise<Blob> {
    const url = `${environment.apiBaseUrl}/admin/certificados/${id}/qr.png`;
    return firstValueFrom(this.http.get(url, { responseType: 'blob' }));
  }

  async descargarPdf(id: number): Promise<Blob> {
    const url = `${environment.apiBaseUrl}/admin/certificados/${id}/pdf`;
    return firstValueFrom(this.http.get(url, { responseType: 'blob' }));
  }

  async contar(): Promise<number> {
    const url = `${environment.apiBaseUrl}/admin/certificados`;
    const envelope = await firstValueFrom(
      this.http.get<ApiEnvelope<ListResponse>>(url),
    );
    return envelope.data.items.length;
  }

  async regenerarPdf(id: number): Promise<RegenerarPdfResult> {
    const url = `${environment.apiBaseUrl}/admin/certificados/${id}/regenerar-pdf`;
    const envelope = await firstValueFrom(
      this.http.post<ApiEnvelope<RegenerarPdfResponse>>(url, {}),
    );
    return {
      regenerado: envelope.data.regenerado,
      mensaje: envelope.data.mensaje,
      publicValidationUrl: envelope.data.publicValidationUrl,
      pdfDownloadUrl: envelope.data.pdfDownloadUrl,
      pdfStatus: envelope.data.pdfStatus as PdfStatus | undefined,
    };
  }

  async revocar(id: number, motivo: string): Promise<void> {
    const url = `${environment.apiBaseUrl}/admin/certificados/${id}/revocar`;
    // ponytail: backend usa key `reason`, no `motivo`.
    await firstValueFrom(this.http.post<ApiEnvelope<unknown>>(url, { reason: motivo }));
  }

  async emitir(payload: EmitirCertificacionPayload): Promise<EmisionResult> {
    const url = `${environment.apiBaseUrl}/admin/certificados`;
    const envelope = await firstValueFrom(
      this.http.post<ApiEnvelope<EmisionResult>>(url, {
        alumnoId: payload.alumnoId,
        cursoId: payload.cursoId,
        issuedAt: payload.issuedAt,
        expiresAt: payload.expiresAt,
      }),
    );
    return envelope.data;
  }

  private toCertificacion(dto: CertListDto): Certificacion {
    return {
      id: dto.id,
      numero: dto.certificateCode,
      nombreAlumno: dto.student.displayName,
      cursoNombre: dto.course.name,
      estado: dto.status as Certificacion['estado'],
      documentMasked: dto.student.documentMasked,
      tokenPrefix: dto.tokenPrefix ?? '',
      emitidoEn: dto.issuedAt,
      venceEn: dto.expiresAt,
      alumnoId: dto.alumnoId,
      cursoId: dto.cursoId ?? dto.course.id,
    };
  }

  private toCertificacionDetalle(dto: CertDetailDto): CertificacionDetalle {
    return {
      ...this.toCertificacion(dto),
      // La URL pública canónica sale de entrega-manual; links.pdf no es validación.
      publicValidationUrl: '',
      attendedDates: (dto.attendedDates ?? []).map((d) => d.fecha),
      auditEvents: (dto.auditEvents ?? []).map((e) => ({
        at: e.createdAt,
        accion: e.eventType,
        detalle: e.result,
      })),
    };
  }
}