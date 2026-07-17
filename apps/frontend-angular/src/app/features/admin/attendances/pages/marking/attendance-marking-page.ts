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
import { COURSES_SOURCE } from '../../../courses/courses.service';
import { CursoDetalle } from '../../../courses/courses.models';
import { ATTENDANCE_SOURCE } from '../../data/attendance.token';
import { AsistenciaAlumno } from '../../models/attendance.types';

// Marcado de presentes por fecha. Reutiliza el patrón F2-04 de effect() +
// loadGen para descartar cargas stale en route reuse. Sin HTTP/storage.
@Component({
  selector: 'app-attendance-marking-page',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [FormsModule, RouterLink],
  templateUrl: './attendance-marking-page.html',
  styleUrl: './attendance-marking-page.css',
})
export class AttendanceMarkingPage {
  // withComponentInputBinding() pasa :id y :fechaId como strings.
  readonly id = input<string>('');
  readonly fechaId = input<string>('');

  private readonly courses = inject(COURSES_SOURCE);
  private readonly attendance = inject(ATTENDANCE_SOURCE);
  private readonly router = inject(Router);

  readonly detalle = signal<CursoDetalle | null>(null);
  readonly alumnos = signal<readonly AsistenciaAlumno[]>([]);
  readonly baseline = signal<Set<number>>(new Set()); // presentes guardados
  readonly seleccion = signal<Set<number>>(new Set()); // presentes en edición
  readonly cargando = signal(true);
  readonly guardando = signal(false);
  readonly error = signal('');
  readonly ok = signal('');

  readonly q = signal('');

  // Ids numéricos validados.
  readonly courseId = computed<number | null>(() => {
    const n = Number(this.id());
    return !this.id() || Number.isNaN(n) || n <= 0 ? null : n;
  });
  readonly fechaIdNumber = computed<number | null>(() => {
    const n = Number(this.fechaId());
    return !this.fechaId() || Number.isNaN(n) || n <= 0 ? null : n;
  });

  // Fecha vigente del detalle.
  readonly fechaActual = computed(() => {
    const d = this.detalle();
    const fid = this.fechaIdNumber();
    if (!d || fid === null) return null;
    return d.fechas.find((f) => f.id === fid) || null;
  });

  // True cuando el curso cargó pero el fechaId no existe en detalle.fechas.
  // Evita body en blanco para URLs como /admin/cursos/1/fechas/999/asistencias.
  readonly fechaNoEncontrada = computed(() => {
    if (this.cargando() || this.error()) return false;
    const d = this.detalle();
    const fid = this.fechaIdNumber();
    if (!d || fid === null) return false;
    return !d.fechas.some((f) => f.id === fid);
  });

  // Contador de marcados en edición.
  readonly marcadosCount = computed(() => this.seleccion().size);

  // Diferencias respecto de la baseline guardada (resumen "cambios sin guardar").
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

  // Fechas del curso para el selector inline (orden natural del detalle).
  readonly fechasOrdenadas = computed(() => this.detalle()?.fechas ?? []);

  // Alumnos filtrados por búsqueda (nombre o dniMostrar).
  readonly alumnosFiltrados = computed<readonly AsistenciaAlumno[]>(() => {
    const texto = this.q().trim().toLowerCase();
    if (!texto) return this.alumnos();
    return this.alumnos().filter(
      (a) =>
        a.apellidoNombre.toLowerCase().includes(texto) ||
        a.dniMostrar.toLowerCase().includes(texto),
    );
  });

  // ponytail: generación de carga para descartar resultados stale cuando el
  // cursoId/fechaId cambia antes de que termine la carga anterior (route reuse).
  private loadGen = 0;

  constructor() {
    // Reacciona a cambios de id()/fechaId() tras la ligadura inicial y
    // cuando Angular reutiliza la misma instancia al navegar entre URLs de
    // marcado. ngOnInit no vuelve a correr en route reuse, pero el effect sí.
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
    // Reset stale antes de cargar.
    this.detalle.set(null);
    this.alumnos.set([]);
    this.baseline.set(new Set());
    this.seleccion.set(new Set());
    this.q.set('');
    this.ok.set('');
    this.error.set('');
    this.cargando.set(true);
    // Si había un guardado en vuelo de la ruta anterior, cancelar su flag:
    // cargar() corre por el effect al cambiar de ruta, y el finally de
    // guardar() de la ruta anterior no debe dejar guardando atascado.
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
      if (gen !== this.loadGen) return; // carga stale, ignorar
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

  onSearch(event: Event): void {
    this.q.set((event.target as HTMLInputElement).value);
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

  // Cambio de fecha vía selector inline. Navega al mismo patrón de ruta para
  // reutilizar el componente (el effect() recarga y resetea baseline/selección).
  // Si hay cambios sin guardar, confirma el descarte; al cancelar, revierte el
  // <select> a la fecha vigente y no navega.
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
      select.value = this.fechaId(); // revertir selección visual
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

  async guardar(): Promise<void> {
    const cid = this.courseId();
    const fid = this.fechaIdNumber();
    if (cid === null || fid === null) {
      this.error.set('Curso o fecha no encontrados.');
      return;
    }
    this.guardando.set(true);
    this.error.set('');
    this.ok.set('');
    // Generación de guardado: si la ruta cambia (route reuse) mientras
    // marcar() está en vuelo, el resultado es stale y no debe mutar
    // baseline/ok/guardando de la pantalla vigente. Guard el par (cid, fid)
    // vigente al iniciar el guardado.
    const saveCid = cid;
    const saveFid = fid;
    try {
      // Contrato: enviamos todos los alumnos con su estado presente/ausente.
      // marcar() solo registra presentes, pero recibimos el set completo
      // para mantener el contrato de reemplazo y permitir auditoría futura.
      const todosMarcados = this.alumnos().map((a) => ({
        alumnoId: a.id,
        presente: this.seleccion().has(a.id),
      }));
      const asistencias = await this.attendance.marcar(cid, fid, todosMarcados);
      // Si la ruta cambió durante el guardado, descartar el resultado stale.
      if (this.courseId() !== saveCid || this.fechaIdNumber() !== saveFid) return;
      this.baseline.set(new Set(asistencias.map((a) => a.alumnoId)));
      this.ok.set('Asistencia guardada en memoria (demo). No persiste al recargar.');
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
  }
}