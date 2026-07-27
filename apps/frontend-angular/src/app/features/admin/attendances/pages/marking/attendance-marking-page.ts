import { HttpErrorResponse } from '@angular/common/http';
import {
  ChangeDetectionStrategy,
  Component,
  computed,
  effect,
  inject,
  input,
  signal,
  untracked,
} from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { CERTIFICATIONS_SOURCE } from '../../../certifications/certifications.service';
import { COURSES_SOURCE } from '../../../courses/courses.service';
import { CursoDetalle } from '../../../courses/courses.models';
import { ATTENDANCE_SOURCE } from '../../data/attendance.token';
import { AsistenciaAlumno } from '../../models/attendance.types';
import type { ResumenGeneracionNav } from '../date-certificates/date-certificates-page';
import { UiBackLink } from '../../../../../shared/ui/ui-back-link';
import { UiSpinner } from '../../../../../shared/ui/ui-spinner';

export type ResumenGeneracion = ResumenGeneracionNav;

// Hub de fecha: marcar presentes + generar certificados; entrega en página dedicada.
// effect() + loadGen descartan cargas stale en route reuse.
@Component({
  selector: 'app-attendance-marking-page',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [FormsModule, RouterLink, UiBackLink, UiSpinner],
  templateUrl: './attendance-marking-page.html',
  styleUrl: './attendance-marking-page.css',
})
export class AttendanceMarkingPage {
  readonly id = input<string>('');
  readonly fechaId = input<string>('');

  private readonly courses = inject(COURSES_SOURCE);
  private readonly attendance = inject(ATTENDANCE_SOURCE);
  private readonly certs = inject(CERTIFICATIONS_SOURCE);
  private readonly router = inject(Router);

  readonly detalle = signal<CursoDetalle | null>(null);
  readonly alumnos = signal<readonly AsistenciaAlumno[]>([]);
  readonly baseline = signal<Set<number>>(new Set());
  readonly seleccion = signal<Set<number>>(new Set());
  readonly cargando = signal(true);
  readonly guardando = signal(false);
  readonly error = signal('');
  readonly ok = signal('');
  readonly resumenGen = signal<ResumenGeneracion | null>(null);

  readonly q = signal('');

  readonly courseId = computed<number | null>(() => {
    const n = Number(this.id());
    return !this.id() || Number.isNaN(n) || n <= 0 ? null : n;
  });
  readonly fechaIdNumber = computed<number | null>(() => {
    const n = Number(this.fechaId());
    return !this.fechaId() || Number.isNaN(n) || n <= 0 ? null : n;
  });

  readonly fechaActual = computed(() => {
    const d = this.detalle();
    const fid = this.fechaIdNumber();
    if (!d || fid === null) return null;
    return d.fechas.find((f) => f.id === fid) || null;
  });

  readonly fechaNoEncontrada = computed(() => {
    if (this.cargando() || this.error()) return false;
    const d = this.detalle();
    const fid = this.fechaIdNumber();
    if (!d || fid === null) return false;
    return !d.fechas.some((f) => f.id === fid);
  });

  readonly marcadosCount = computed(() => this.seleccion().size);

  readonly agregados = computed(() => {
    const base = this.baseline();
    let n = 0;
    for (const id of this.seleccion()) if (!base.has(id)) n++;
    return n;
  });
  readonly quitados = computed(() => {
    const sel = this.seleccion();
    let n = 0;
    for (const id of this.baseline()) if (!sel.has(id)) n++;
    return n;
  });
  readonly cambios = computed(() => this.agregados() + this.quitados());
  readonly dirty = computed(() => this.cambios() > 0);

  /** Selector de fechas: siempre más antigua → más reciente. */
  readonly fechasOrdenadas = computed(() => {
    const list = this.detalle()?.fechas ?? [];
    return [...list].sort((a, b) => {
      const byFecha = a.fecha.localeCompare(b.fecha);
      if (byFecha !== 0) return byFecha;
      const byOrden = a.orden - b.orden;
      if (byOrden !== 0) return byOrden;
      return a.id - b.id;
    });
  });

  readonly alumnosFiltrados = computed<readonly AsistenciaAlumno[]>(() => {
    const texto = this.q().trim().toLowerCase();
    if (!texto) return this.alumnos();
    return this.alumnos().filter(
      (a) =>
        a.apellidoNombre.toLowerCase().includes(texto) ||
        a.dniMostrar.toLowerCase().includes(texto),
    );
  });

  readonly guardadoOk = computed(() => this.ok().length > 0 && !this.dirty());

  /** Habilitado con cambios pendientes o con presentes para (re)generar. */
  readonly puedeGuardarYGenerar = computed(
    () => !this.guardando() && (this.dirty() || this.marcadosCount() > 0),
  );

  private readonly fmtFechaCorta = new Intl.DateTimeFormat('es-AR', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });
  private readonly fmtFechaLarga = new Intl.DateTimeFormat('es-AR', {
    weekday: 'long',
    day: '2-digit',
    month: 'long',
    year: 'numeric',
  });

  private loadGen = 0;

  constructor() {
    effect(() => {
      const id = this.id();
      const fid = this.fechaId();
      untracked(() => void this.cargar(id, fid));
    });
  }

  private async cargar(idStr: string, fechaIdStr: string): Promise<void> {
    const gen = ++this.loadGen;
    const cid = this.parseId(idStr);
    const fid = this.parseId(fechaIdStr);
    this.detalle.set(null);
    this.alumnos.set([]);
    this.baseline.set(new Set());
    this.seleccion.set(new Set());
    this.q.set('');
    this.ok.set('');
    this.error.set('');
    this.resumenGen.set(null);
    this.cargando.set(true);
    this.guardando.set(false);
    if (cid === null || fid === null) {
      if (gen === this.loadGen) this.error.set('Curso o fecha no encontrados.');
      this.cargando.set(false);
      return;
    }
    try {
      const [det, alumnos, asistencias] = await Promise.all([
        this.courses.obtener(cid),
        this.attendance.listarAlumnos(cid),
        this.attendance.listarAsistencias(cid, fid),
      ]);
      if (gen !== this.loadGen) return;
      this.detalle.set(det);
      this.alumnos.set(alumnos);
      const presentes = new Set(asistencias.map((a) => a.alumnoId));
      this.baseline.set(presentes);
      this.seleccion.set(new Set(presentes));
    } catch (e) {
      if (gen === this.loadGen) this.error.set((e as Error).message);
    } finally {
      if (gen === this.loadGen) this.cargando.set(false);
    }
  }

  private parseId(s: string): number | null {
    const n = Number(s);
    return !s || Number.isNaN(n) || n <= 0 ? null : n;
  }

  /** Extrae message del envelope API o fallback genérico. */
  private mensajeErrorApi(err: unknown): string {
    if (err instanceof HttpErrorResponse) {
      const body = err.error as { error?: { message?: string } } | null;
      const msg = body?.error?.message;
      if (typeof msg === 'string' && msg.trim()) return msg.trim();
    }
    if (err instanceof Error && err.message.trim()) return err.message.trim();
    return 'Solicitud inválida.';
  }

  private hoyIso(): string {
    return new Intl.DateTimeFormat('en-CA', {
      timeZone: 'America/Argentina/Buenos_Aires',
    }).format(new Date());
  }

  onSearch(event: Event): void {
    this.q.set((event.target as HTMLInputElement).value);
  }

  onLimpiarBusqueda(): void {
    this.q.set('');
  }

  formatFechaCorta(iso: string): string {
    return this.formatIso(iso, this.fmtFechaCorta);
  }

  formatFechaLarga(iso: string): string {
    return this.formatIso(iso, this.fmtFechaLarga);
  }

  private formatIso(iso: string, fmt: Intl.DateTimeFormat): string {
    const [y, m, d] = iso.split('-').map(Number);
    if (!y || !m || !d) return iso;
    return fmt.format(new Date(y, m - 1, d));
  }

  etiquetaOpcionFecha(opt: { fecha: string; descripcion: string | null; estado: string }): string {
    const base = this.formatFechaCorta(opt.fecha);
    const detalle = opt.descripcion?.trim();
    let label = detalle ? `${base} — ${detalle}` : base;
    if (opt.estado === 'cancelada') label += ' (cancelada)';
    else if (opt.estado === 'realizada') label += ' (realizada)';
    return label;
  }

  indiceFila(i: number): string {
    return String(i + 1).padStart(2, '0');
  }

  togglePresente(alumnoId: number): void {
    this.seleccion.update((set) => {
      const next = new Set(set);
      if (next.has(alumnoId)) next.delete(alumnoId);
      else next.add(alumnoId);
      return next;
    });
  }

  estaMarcado(alumnoId: number): boolean {
    return this.seleccion().has(alumnoId);
  }

  onFechaSeleccionada(event: Event): void {
    const select = event.target as HTMLSelectElement;
    const nuevoId = select.value;
    const cid = this.courseId();
    if (cid === null || nuevoId === this.fechaId()) return;
    if (
      this.dirty() &&
      !window.confirm(
        'Hay cambios sin guardar que se descartarán al cambiar de fecha. ¿Continuar?',
      )
    ) {
      select.value = this.fechaId();
      return;
    }
    void this.router.navigate([
      '/admin/cursos',
      cid,
      'fechas',
      Number(nuevoId),
      'asistencias',
    ]);
  }

  /** Alias de compatibilidad para tests/specs previos. */
  async guardar(): Promise<void> {
    return this.guardarYGenerar();
  }

  async guardarYGenerar(): Promise<void> {
    const cid = this.courseId();
    const fid = this.fechaIdNumber();
    if (cid === null || fid === null) {
      this.error.set('Curso o fecha no encontrados.');
      return;
    }
    if (!this.puedeGuardarYGenerar()) return;

    this.guardando.set(true);
    this.error.set('');
    this.ok.set('');
    this.resumenGen.set(null);
    const saveCid = cid;
    const saveFid = fid;
    try {
      const todosMarcados = this.alumnos().map((a) => ({
        alumnoId: a.id,
        presente: this.seleccion().has(a.id),
      }));
      const asistencias = await this.attendance.marcar(cid, fid, todosMarcados);
      if (this.courseId() !== saveCid || this.fechaIdNumber() !== saveFid) return;
      this.baseline.set(new Set(asistencias.map((a) => a.alumnoId)));
      this.seleccion.set(new Set(asistencias.map((a) => a.alumnoId)));

      const presentesIds = [...this.baseline()];
      let emitidos = 0;
      let actualizados = 0;
      let fallidos = 0;
      const issuedAt = this.hoyIso();
      const fechaClase = this.fechaActual()?.fecha ?? null;
      let motivoFallo: string | null = null;

      // Fecha futura: permanece programada; emitir exige fecha realizada.
      if (fechaClase !== null && fechaClase > issuedAt) {
        fallidos = presentesIds.length;
        motivoFallo =
          'La fecha de clase es futura: queda programada y no se pueden emitir certificados hasta el día de la clase (o anterior).';
      } else {
        // Un listado por curso (no N listados por alumno) + emitir/regenerar en paralelo.
        const vigentesCurso = await this.certs.listar({
          cursoId: cid,
          estado: 'vigente',
        });
        if (this.courseId() !== saveCid || this.fechaIdNumber() !== saveFid) return;

        const vigentePorAlumno = new Map<number, (typeof vigentesCurso)[number]>();
        for (const c of vigentesCurso) {
          if (c.alumnoId != null) vigentePorAlumno.set(c.alumnoId, c);
        }

        const resultados = await Promise.allSettled(
          presentesIds.map(async (alumnoId) => {
            const vigente = vigentePorAlumno.get(alumnoId);
            if (vigente) {
              await this.certs.regenerarPdf(vigente.id);
              return 'actualizado' as const;
            }
            await this.certs.emitir({
              alumnoId,
              cursoId: cid,
              issuedAt,
              expiresAt: null,
            });
            return 'emitido' as const;
          }),
        );

        if (this.courseId() !== saveCid || this.fechaIdNumber() !== saveFid) return;

        for (const r of resultados) {
          if (r.status === 'rejected') {
            fallidos++;
            motivoFallo ??= this.mensajeErrorApi(r.reason);
            continue;
          }
          if (r.value === 'emitido') emitidos++;
          else actualizados++;
        }
      }
      const resumen: ResumenGeneracion = { emitidos, actualizados, fallidos };
      this.resumenGen.set(resumen);

      const partes = [
        'Asistencias guardadas.',
        emitidos > 0 ? `${emitidos} certificado${emitidos === 1 ? '' : 's'} emitido${emitidos === 1 ? '' : 's'}` : null,
        actualizados > 0
          ? `${actualizados} actualizado${actualizados === 1 ? '' : 's'}`
          : null,
        fallidos > 0
          ? `${fallidos} con error${motivoFallo ? `: ${motivoFallo}` : ''}`
          : null,
      ].filter(Boolean);
      const mensaje = partes.join(' ');
      this.ok.set(mensaje);

      await this.router.navigate(
        ['/admin/cursos', saveCid, 'fechas', saveFid, 'asistencias', 'certificados'],
        { state: { resumenGen: resumen, mensaje } },
      );
    } catch (e) {
      if (this.courseId() !== saveCid || this.fechaIdNumber() !== saveFid) return;
      this.error.set((e as Error).message);
    } finally {
      if (this.courseId() === saveCid && this.fechaIdNumber() === saveFid) {
        this.guardando.set(false);
      }
    }
  }

  descartar(): void {
    this.seleccion.set(new Set(this.baseline()));
    this.ok.set('');
    this.error.set('');
    this.resumenGen.set(null);
  }
}
