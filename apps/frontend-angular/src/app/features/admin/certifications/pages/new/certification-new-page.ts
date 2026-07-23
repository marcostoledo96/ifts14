import {
  ChangeDetectionStrategy,
  Component,
  computed,
  ElementRef,
  HostListener,
  inject,
  OnInit,
  signal,
  viewChild,
} from '@angular/core';
import { ActivatedRoute, ParamMap, Router, RouterLink } from '@angular/router';
import { ATTENDANCE_SOURCE } from '../../../attendances/data/attendance.token';
import { Asistencia } from '../../../attendances/models/attendance.types';
import { COURSES_SOURCE } from '../../../courses/courses.service';
import { Curso, CursoFecha } from '../../../courses/courses.models';
import {
  INSTITUTIONAL_CONFIG_SOURCE,
  InstitutionalConfig,
} from '../../../institutional-config/institutional-config.service';
import { STUDENTS_SOURCE } from '../../../students/students.service';
import { Alumno } from '../../../students/students.models';
import { CERTIFICATIONS_SOURCE } from '../../certifications.service';
import { EmitirCertificacionPayload } from '../../certifications.models';
import { UiBackLink } from '../../../../../shared/ui/ui-back-link';
import { UiSpinner } from '../../../../../shared/ui/ui-spinner';

export interface PresenteVista {
  readonly fecha: string;
  readonly descripcion: string | null;
  readonly cursoFechaId: number;
}

/** Hoy en America/Argentina/Buenos_Aires como YYYY-MM-DD. */
export function hoyBuenosAires(date: Date = new Date()): string {
  return new Intl.DateTimeFormat('en-CA', {
    timeZone: 'America/Argentina/Buenos_Aires',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).format(date);
}

export function normalizarTexto(t: string): string {
  return t.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
}

/** Fecha ISO YYYY-MM-DD → dd/mm/aaaa (es-AR). */
export function formatearFechaCorta(iso: string): string {
  const [y, m, d] = iso.split('-').map(Number);
  if (!y || !m || !d) return iso;
  return new Intl.DateTimeFormat('es-AR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  }).format(new Date(y, m - 1, d));
}

function statusOf(err: unknown): number | null {
  if (err && typeof err === 'object' && 'status' in err) {
    const s = (err as { status: unknown }).status;
    return typeof s === 'number' ? s : null;
  }
  return null;
}

function iniciales(a: Alumno): string {
  const n = (a.nombre || '').trim().charAt(0);
  const ap = (a.apellido || '').trim().charAt(0);
  return `${n}${ap}`.toUpperCase() || '·';
}

@Component({
  selector: 'app-certification-new-page',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterLink, UiBackLink, UiSpinner],
  templateUrl: './certification-new-page.html',
  styleUrl: './certification-new-page.css',
})
export class CertificationNewPage implements OnInit {
  private readonly certs = inject(CERTIFICATIONS_SOURCE);
  private readonly courses = inject(COURSES_SOURCE);
  private readonly students = inject(STUDENTS_SOURCE);
  private readonly attendance = inject(ATTENDANCE_SOURCE);
  private readonly config = inject(INSTITUTIONAL_CONFIG_SOURCE);
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);

  private readonly comboboxWrap = viewChild<ElementRef<HTMLElement>>('comboboxWrap');

  readonly cursos = signal<readonly Curso[]>([]);
  readonly alumnos = signal<readonly Alumno[]>([]);
  readonly configInst = signal<InstitutionalConfig | null>(null);

  readonly alumnoId = signal<number | null>(null);
  readonly cursoId = signal<number | null>(null);

  readonly fechasRealizadas = signal<readonly CursoFecha[]>([]);
  readonly presentes = signal<readonly PresenteVista[]>([]);
  readonly avisoDuplicado = signal(false);
  readonly avisoQuery = signal('');

  readonly cargandoCatalogos = signal(true);
  readonly cargandoPar = signal(false);
  readonly errorCatalogos = signal('');
  readonly errorPar = signal('');
  readonly errorEmit = signal('');
  readonly emitiendo = signal(false);

  /** Combobox alumno */
  readonly alumnoQuery = signal('');
  readonly alumnoOpen = signal(false);

  private loadGen = 0;

  /** Patrón decorativo QR (sin datos personales). */
  readonly qrCells = [
    1, 1, 1, 0, 1, 0, 1, 1, 1, 1, 0, 1, 1, 0, 0, 1, 0, 1, 1, 0, 1, 0, 1, 1, 0, 1, 1, 0, 1, 1, 1,
    0, 0, 1, 0, 0, 1, 0, 1, 1, 1, 0, 1, 0, 1, 1, 0, 1, 1, 0, 1, 1, 1, 0, 1, 0, 0, 1, 1, 0, 1, 0,
    1, 1,
  ] as const;

  readonly alumnoSeleccionado = computed(() => {
    const id = this.alumnoId();
    return id == null ? null : (this.alumnos().find((a) => a.id === id) ?? null);
  });

  readonly cursoSeleccionado = computed(() => {
    const id = this.cursoId();
    return id == null ? null : (this.cursos().find((c) => c.id === id) ?? null);
  });

  readonly cicloLectivo = computed(() => this.cursoSeleccionado()?.cuatrimestre || '—');

  readonly alumnosFiltrados = computed(() => {
    const q = normalizarTexto(this.alumnoQuery().trim());
    const list = this.alumnos();
    if (!q) return list;
    return list.filter((a) => {
      const dniPlano = a.dniMostrar.replace(/[.*\s]/g, '');
      const qDni = q.replace(/[.\s]/g, '');
      return (
        normalizarTexto(`${a.apellido} ${a.nombre}`).includes(q) ||
        normalizarTexto(`${a.nombre} ${a.apellido}`).includes(q) ||
        normalizarTexto(a.dniMostrar).includes(q) ||
        dniPlano.includes(qDni)
      );
    });
  });

  readonly sinFechasRealizadas = computed(
    () =>
      this.alumnoId() != null &&
      this.cursoId() != null &&
      !this.cargandoPar() &&
      this.fechasRealizadas().length === 0,
  );

  readonly sinPresentes = computed(
    () =>
      this.alumnoId() != null &&
      this.cursoId() != null &&
      !this.cargandoPar() &&
      this.fechasRealizadas().length > 0 &&
      this.presentes().length === 0,
  );

  readonly sinEmail = computed(() => this.alumnoSeleccionado()?.tieneEmail === false);

  readonly puedeEmitir = computed(
    () =>
      this.alumnoId() != null &&
      this.cursoId() != null &&
      !this.cargandoPar() &&
      !this.emitiendo() &&
      this.fechasRealizadas().length > 0 &&
      this.presentes().length > 0 &&
      !this.avisoDuplicado() &&
      !this.errorPar(),
  );

  readonly nombreCompleto = computed(() => {
    const a = this.alumnoSeleccionado();
    if (!a) return '';
    return `${a.nombre} ${a.apellido}`.trim();
  });

  readonly etiquetaAlumno = computed(() => {
    const a = this.alumnoSeleccionado();
    if (!a) return '—';
    return `${a.apellido}, ${a.nombre}`;
  });

  readonly inicialesAlumno = computed(() => {
    const a = this.alumnoSeleccionado();
    return a ? iniciales(a) : '';
  });

  readonly muestraAvisos = computed(
    () =>
      this.avisoDuplicado() ||
      this.sinFechasRealizadas() ||
      this.sinPresentes() ||
      this.sinEmail() ||
      !!this.errorPar() ||
      !!this.errorEmit() ||
      !!this.avisoQuery(),
  );

  ngOnInit(): void {
    void this.cargarCatalogos();
  }

  @HostListener('document:pointerdown', ['$event'])
  onDocPointer(ev: PointerEvent): void {
    const wrap = this.comboboxWrap()?.nativeElement;
    if (!wrap || !this.alumnoOpen()) return;
    if (!wrap.contains(ev.target as Node)) {
      this.alumnoOpen.set(false);
      this.alumnoQuery.set('');
    }
  }

  async cargarCatalogos(): Promise<void> {
    this.cargandoCatalogos.set(true);
    this.errorCatalogos.set('');
    try {
      const [cursos, alumnos, cfg] = await Promise.all([
        this.courses.listar({ estado: 'activo' }),
        this.students.listar(),
        this.config.obtener(),
      ]);
      this.cursos.set(cursos);
      this.alumnos.set(alumnos.filter((a) => a.estado === 'activo'));
      this.configInst.set(cfg);
      this.aplicarQueryPreselect(this.route.snapshot.queryParamMap);
    } catch (e) {
      this.errorCatalogos.set((e as Error).message || 'No se pudieron cargar los catálogos.');
    } finally {
      this.cargandoCatalogos.set(false);
    }
  }

  /** Preselección no bloqueante desde ?alumno= y opcional ?curso=. */
  private aplicarQueryPreselect(qp: ParamMap): void {
    const alumnoRaw = qp.get('alumno');
    const cursoRaw = qp.get('curso');
    const avisos: string[] = [];

    if (alumnoRaw != null && alumnoRaw !== '') {
      if (/^\d+$/.test(alumnoRaw)) {
        const id = Number(alumnoRaw);
        if (this.alumnos().some((a) => a.id === id)) {
          this.alumnoId.set(id);
        } else {
          avisos.push('El alumno de la URL no está disponible o no está activo.');
        }
      } else {
        avisos.push('El alumno de la URL no es válido.');
      }
    }

    if (cursoRaw != null && cursoRaw !== '') {
      if (/^\d+$/.test(cursoRaw)) {
        const id = Number(cursoRaw);
        if (this.cursos().some((c) => c.id === id)) {
          this.cursoId.set(id);
        } else {
          avisos.push('El curso de la URL no está disponible o no está activo.');
        }
      } else {
        avisos.push('El curso de la URL no es válido.');
      }
    }

    this.avisoQuery.set(avisos.join(' '));
    if (this.alumnoId() != null && this.cursoId() != null) {
      void this.cargarPar();
    }
  }

  abrirBusquedaAlumno(): void {
    this.alumnoOpen.set(true);
    this.alumnoQuery.set('');
  }

  onAlumnoQuery(event: Event): void {
    this.alumnoQuery.set((event.target as HTMLInputElement).value);
    this.alumnoOpen.set(true);
  }

  elegirAlumno(a: Alumno): void {
    this.alumnoId.set(a.id);
    this.alumnoOpen.set(false);
    this.alumnoQuery.set('');
    void this.cargarPar();
  }

  onCurso(event: Event): void {
    const raw = (event.target as HTMLSelectElement).value;
    this.cursoId.set(raw ? Number(raw) : null);
    void this.cargarPar();
  }

  fechaCorta(iso: string): string {
    return formatearFechaCorta(iso);
  }

  seqPad(i: number): string {
    return String(i + 1).padStart(3, '0');
  }

  inicialesDe(a: Alumno): string {
    return iniciales(a);
  }

  async cargarPar(): Promise<void> {
    const gen = ++this.loadGen;
    const alumnoId = this.alumnoId();
    const cursoId = this.cursoId();
    this.fechasRealizadas.set([]);
    this.presentes.set([]);
    this.avisoDuplicado.set(false);
    this.errorPar.set('');
    this.errorEmit.set('');

    if (alumnoId == null || cursoId == null) {
      this.cargandoPar.set(false);
      return;
    }

    this.cargandoPar.set(true);
    try {
      const [fechas, asistencias, vigentes] = await Promise.all([
        this.courses.listarFechas(cursoId),
        this.attendance.listarAsistenciasPorPar(cursoId, alumnoId),
        this.certs.listar({ estado: 'vigente', cursoId, alumnoId }),
      ]);
      if (gen !== this.loadGen) return;

      const realizadas = fechas.filter((f) => f.estado === 'realizada');
      this.fechasRealizadas.set(realizadas);
      this.presentes.set(this.mapPresentes(asistencias, realizadas));
      this.avisoDuplicado.set(vigentes.length > 0);
    } catch (e) {
      if (gen === this.loadGen) {
        this.errorPar.set((e as Error).message || 'No se pudo evaluar la elegibilidad.');
      }
    } finally {
      if (gen === this.loadGen) this.cargandoPar.set(false);
    }
  }

  private mapPresentes(
    asistencias: readonly Asistencia[],
    realizadas: readonly CursoFecha[],
  ): PresenteVista[] {
    const byFechaId = new Map(realizadas.map((f) => [f.id, f]));
    const vistas: PresenteVista[] = [];
    for (const a of asistencias) {
      if (a.fechaEstado !== 'realizada') continue;
      const meta = byFechaId.get(a.cursoFechaId);
      vistas.push({
        fecha: a.fecha,
        descripcion: meta?.descripcion ?? null,
        cursoFechaId: a.cursoFechaId,
      });
    }
    return vistas.sort((x, y) => x.fecha.localeCompare(y.fecha));
  }

  async onEmitir(): Promise<void> {
    if (!this.puedeEmitir() || this.emitiendo()) return;
    const alumnoId = this.alumnoId();
    const cursoId = this.cursoId();
    if (alumnoId == null || cursoId == null) return;

    const payload: EmitirCertificacionPayload = {
      alumnoId,
      cursoId,
      issuedAt: hoyBuenosAires(),
      expiresAt: null,
    };

    this.emitiendo.set(true);
    this.errorEmit.set('');
    try {
      const result = await this.certs.emitir(payload);
      await this.router.navigate(['/admin/certificaciones', result.id]);
    } catch (e) {
      const status = statusOf(e);
      if (status === 409) {
        this.errorEmit.set('Ya existe un certificado vigente para este alumno y curso.');
      } else if (status === 400) {
        this.errorEmit.set('No se pudo emitir: los datos no son válidos.');
      } else if (status === 500) {
        this.errorEmit.set('Error del servidor al emitir. Intentá de nuevo.');
      } else {
        this.errorEmit.set((e as Error).message || 'No se pudo emitir la certificación.');
      }
    } finally {
      this.emitiendo.set(false);
    }
  }
}
