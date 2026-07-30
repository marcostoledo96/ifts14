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
import { COURSES_SOURCE } from './courses.service';
import {
  CursoDetalle,
  CursoDraft,
  CursoFecha,
  CursoFechaDraft,
  EstadoCurso,
  EstadoFecha,
} from './courses.models';
import { UiBackLink } from '../../../shared/ui/ui-back-link';
import { UiSpinner } from '../../../shared/ui/ui-spinner';

const CODIGO_MAX = 40;
const NOMBRE_MAX = 180;
const ERROR_GENERICO = 'No pudimos guardar el curso. Reintentá.';
const MSG_NOT_FOUND = 'Curso no encontrado.';
const MSG_CARGA_RECUPERABLE = 'No se pudo cargar el curso. Reintentá.';
const MSG_NO_AUTORIZADO = 'No tenés autorización para ver este curso.';

const ESTADO_FECHA_LABEL: Record<EstadoFecha, string> = {
  programada: 'Programada',
  realizada: 'Realizada',
  cancelada: 'Cancelada',
};

const ESTADO_CURSO_LABEL: Record<EstadoCurso, string> = {
  activo: 'Activo',
  borrador: 'Inactivo (borrador)',
  cerrado: 'Inactivo (cerrado)',
  archivado: 'Inactivo (archivado)',
};

// Editor de curso: create (alta) o edit (estado + fechas).
// Layout v0 con contrato estricto: sin campos fantasma.
@Component({
  selector: 'app-course-editor-page',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [FormsModule, RouterLink, UiBackLink, UiSpinner],
  templateUrl: './course-editor-page.html',
  styleUrl: './course-editor-page.css',
})
export class CourseEditorPage {
  readonly mode = input<'create' | 'edit'>('create');
  readonly id = input<string>('');

  private readonly courses = inject(COURSES_SOURCE);
  private readonly router = inject(Router);

  readonly estadosFecha: readonly EstadoFecha[] = ['programada', 'realizada', 'cancelada'];
  readonly estadoFechaLabel = ESTADO_FECHA_LABEL;
  readonly codigoMax = CODIGO_MAX;
  readonly nombreMax = NOMBRE_MAX;

  readonly codigo = signal('');
  readonly nombre = signal('');
  /** Toggle UI "Curso activo" (solo edit). */
  readonly activo = signal(true);
  /** Estado persistido al cargar (edit); base para mapear el toggle. */
  readonly estadoOriginal = signal<EstadoCurso>('activo');

  readonly fechas = signal<CursoFechaDraft[]>([]);
  /**
   * Soft-deletes HTTP (cancelada) ocultas en UI pero incluidas al guardar
   * para no liberar/reusar su orden|fecha (uniques del backend).
   */
  private readonly fechasCanceladas = signal<CursoFechaDraft[]>([]);
  /** Snapshot de fechas al cargar; base del aviso de impacto. */
  private readonly fechasOriginales = signal<readonly CursoFecha[]>([]);
  readonly detalle = signal<CursoDetalle | null>(null);

  readonly cargando = signal(true);
  readonly guardando = signal(false);
  readonly error = signal('');
  readonly ok = signal('');
  /** True solo ante fallo recuperable de carga inicial en edit (no not-found ni submit). */
  readonly errorRecuperable = signal(false);

  readonly idNumber = computed<number | null>(() => {
    const n = Number(this.id());
    return !this.id() || Number.isNaN(n) || n <= 0 ? null : n;
  });

  /** Edit sin curso cargable: id inválido o fallo de obtener. */
  readonly sinCurso = computed(
    () => this.mode() === 'edit' && !this.cargando() && this.detalle() === null,
  );

  /** Estado a persistir al guardar en edit. */
  readonly estadoResultante = computed<EstadoCurso>(() => {
    if (this.activo()) return 'activo';
    const original = this.estadoOriginal();
    return original === 'activo' ? 'cerrado' : original;
  });

  /**
   * True si alguna fecha original `realizada` fue modificada o quitada
   * del borrador (el backend sincroniza certificados al mutar realizadas).
   */
  readonly impactoRealizadas = computed(() => {
    const drafts = this.fechas();
    for (const orig of this.fechasOriginales()) {
      if (orig.estado !== 'realizada') continue;
      const draft = drafts.find((d) => d.id === orig.id);
      if (!draft) return true;
      if (
        draft.fecha !== orig.fecha ||
        (draft.descripcion ?? null) !== (orig.descripcion ?? null) ||
        draft.estado !== orig.estado
      ) {
        return true;
      }
    }
    return false;
  });

  private loadGen = 0;

  constructor() {
    effect(() => {
      const mode = this.mode();
      const id = this.id();
      untracked(() => void this.recargar(mode, id));
    });
  }

  private async recargar(mode: 'create' | 'edit', id: string): Promise<void> {
    const gen = ++this.loadGen;
    this.detalle.set(null);
    this.fechas.set([]);
    this.fechasCanceladas.set([]);
    this.fechasOriginales.set([]);
    this.codigo.set('');
    this.nombre.set('');
    this.activo.set(true);
    this.estadoOriginal.set('activo');
    this.ok.set('');
    this.error.set('');
    this.errorRecuperable.set(false);
    this.guardando.set(false);
    this.cargando.set(true);
    const flash = this.consumeFlashError();
    try {
      if (mode === 'edit') {
        const n = Number(id);
        const cid = !id || Number.isNaN(n) || n <= 0 ? null : n;
        if (cid === null) {
          if (gen === this.loadGen) {
            this.error.set(flash || MSG_NOT_FOUND);
            this.errorRecuperable.set(false);
          }
          return;
        }
        const d = await this.courses.obtener(cid);
        if (gen !== this.loadGen) return;
        this.aplicarDetalle(d);
        if (flash) this.error.set(flash);
      } else if (flash && gen === this.loadGen) {
        this.error.set(flash);
      }
    } catch (e) {
      if (gen === this.loadGen) {
        if (flash) {
          this.error.set(flash);
          this.errorRecuperable.set(false);
        } else {
          const mapped = this.mapearErrorCarga(e);
          this.error.set(mapped.message);
          this.errorRecuperable.set(mapped.recuperable);
        }
      }
    } finally {
      if (gen === this.loadGen) this.cargando.set(false);
    }
  }

  onReintentar(): void {
    if (!this.errorRecuperable()) return;
    void this.recargar(this.mode(), this.id());
  }

  /**
   * Not-found: HTTP 404 o mensaje in-memory con prefijo «Curso no encontrado».
   * 401/403: no recuperable. Resto → recuperable con Reintentar.
   */
  private mapearErrorCarga(e: unknown): { message: string; recuperable: boolean } {
    if (e instanceof HttpErrorResponse) {
      if (e.status === 404) return { message: MSG_NOT_FOUND, recuperable: false };
      if (e.status === 401 || e.status === 403) {
        return { message: MSG_NO_AUTORIZADO, recuperable: false };
      }
    }
    if (e instanceof Error && e.message.startsWith('Curso no encontrado')) {
      return { message: MSG_NOT_FOUND, recuperable: false };
    }
    return { message: MSG_CARGA_RECUPERABLE, recuperable: true };
  }

  /** Aplica detalle: visibles en form; canceladas reservadas para el payload. */
  private aplicarDetalle(d: CursoDetalle): void {
    const visibles = d.fechas.filter((f) => f.estado !== 'cancelada');
    const canceladas = d.fechas.filter((f) => f.estado === 'cancelada');
    this.detalle.set(d);
    this.codigo.set(d.codigo);
    this.nombre.set(d.nombre);
    this.estadoOriginal.set(d.estado);
    this.activo.set(d.estado === 'activo');
    this.fechasOriginales.set(visibles);
    this.fechasCanceladas.set(canceladas.map((f) => this.toDraft(f)));
    // Conserva orden original: no renumerar 1..n (choca con uniques de canceladas).
    this.fechas.set(visibles.map((f) => this.toDraft(f)));
  }

  private toDraft(f: CursoFecha): CursoFechaDraft {
    return {
      id: f.id,
      fecha: f.fecha,
      descripcion: f.descripcion,
      orden: f.orden,
      estado: f.estado,
    };
  }

  private proximoOrden(): number {
    const usados = [...this.fechas(), ...this.fechasCanceladas()].map((f) => f.orden);
    return (usados.length ? Math.max(...usados) : 0) + 1;
  }

  /**
   * Payload de sync: visibles (+ revive si reusa día cancelado) + canceladas restantes.
   * Así reemplazarFechas no reasigna orden/fecha ocupados por soft-deletes.
   */
  private payloadFechas(): CursoFechaDraft[] {
    const canceladas = [...this.fechasCanceladas()];
    const visibles: CursoFechaDraft[] = [];
    for (const f of this.fechas()) {
      if (f.id !== null) {
        visibles.push(f);
        continue;
      }
      const idx = canceladas.findIndex((c) => c.fecha === f.fecha);
      if (idx >= 0) {
        const revived = canceladas.splice(idx, 1)[0]!;
        visibles.push({
          ...f,
          id: revived.id,
          orden: revived.orden,
          estado: f.estado === 'cancelada' ? 'programada' : f.estado,
        });
      } else {
        visibles.push(f);
      }
    }
    return [...visibles, ...canceladas];
  }

  private consumeFlashError(): string {
    const st = history.state as { flashError?: string } | null;
    const msg = typeof st?.flashError === 'string' ? st.flashError.trim() : '';
    if (!msg) return '';
    history.replaceState({ ...(st ?? {}), flashError: undefined }, '');
    return msg;
  }

  /** Extrae message del envelope API; nunca expone URL del endpoint. */
  private mensajeErrorApi(err: unknown, contexto: 'curso' | 'fecha' = 'curso'): string {
    if (err instanceof HttpErrorResponse) {
      const body = err.error as { error?: { message?: string; code?: string } } | null;
      const msg = body?.error?.message?.trim() ?? '';
      if (err.status === 409) {
        if (contexto === 'fecha' || /fecha|orden/i.test(msg)) {
          return 'Ya existe una fecha con esa misma fecha u orden.';
        }
        if (contexto === 'curso' && (!msg || /recurso ya existe/i.test(msg))) {
          return 'Ya existe un curso con ese código.';
        }
        if (!msg || /recurso ya existe/i.test(msg)) {
          return 'El recurso ya existe. Revisá código o fechas e intentá de nuevo.';
        }
      }
      if (msg && !/^Http failure response/i.test(msg)) return msg;
      if (err.status >= 500) return 'El servidor no respondió bien. Reintentá en unos minutos.';
      return ERROR_GENERICO;
    }
    if (err instanceof Error && err.message.trim() && !/^Http failure response/i.test(err.message)) {
      return err.message.trim();
    }
    return ERROR_GENERICO;
  }

  toggleActivo(): void {
    this.activo.update((v) => !v);
    this.ok.set('');
    this.error.set('');
  }

  agregarFecha(): void {
    this.fechas.update((list) => [
      ...list,
      {
        id: null,
        fecha: '',
        descripcion: null,
        orden: this.proximoOrden(),
        estado: 'programada',
      },
    ]);
    this.ok.set('');
    this.error.set('');
  }

  quitarFecha(index: number): void {
    this.fechas.update((list) => list.filter((_, i) => i !== index));
    this.ok.set('');
    this.error.set('');
  }

  onFechaInput(index: number, event: Event): void {
    const value = (event.target as HTMLInputElement).value;
    this.fechas.update((list) =>
      list.map((f, i) => (i === index ? { ...f, fecha: value } : f)),
    );
    this.ok.set('');
    this.error.set('');
  }

  onDescripcionInput(index: number, event: Event): void {
    const value = (event.target as HTMLInputElement).value;
    this.fechas.update((list) =>
      list.map((f, i) => (i === index ? { ...f, descripcion: value || null } : f)),
    );
    this.ok.set('');
    this.error.set('');
  }

  onEstadoFecha(index: number, event: Event): void {
    const value = (event.target as HTMLSelectElement).value as EstadoFecha;
    this.fechas.update((list) =>
      list.map((f, i) => (i === index ? { ...f, estado: value } : f)),
    );
    this.ok.set('');
    this.error.set('');
  }

  onCodigo(event: Event): void {
    this.codigo.set((event.target as HTMLInputElement).value);
    this.ok.set('');
    this.error.set('');
  }

  onNombre(event: Event): void {
    this.nombre.set((event.target as HTMLInputElement).value);
    this.ok.set('');
    this.error.set('');
  }

  formatearTs(iso: string | undefined | null): string {
    if (!iso) return '—';
    // ISO → YYYY-MM-DD HH:mm (sin inventar timezone local compleja).
    const m = /^(\d{4}-\d{2}-\d{2})[T ](\d{2}:\d{2})/.exec(iso);
    return m ? `${m[1]} ${m[2]}` : iso;
  }

  indiceFecha(i: number): string {
    return String(i + 1).padStart(2, '0');
  }

  etiquetaEstadoCurso(estado: EstadoCurso): string {
    return ESTADO_CURSO_LABEL[estado] ?? estado;
  }

  validar(): string {
    const codigo = this.codigo().trim();
    const nombre = this.nombre().trim();
    if (!codigo || !nombre) {
      return 'Código y nombre son obligatorios.';
    }
    if (codigo.length > CODIGO_MAX) {
      return `El código no puede superar ${CODIGO_MAX} caracteres.`;
    }
    if (nombre.length > NOMBRE_MAX) {
      return `El nombre no puede superar ${NOMBRE_MAX} caracteres.`;
    }
    const fechas = this.fechas();
    for (const f of fechas) {
      if (!f.fecha) {
        return 'Todas las fechas deben tener una fecha definida.';
      }
    }
    const seen = new Set<string>();
    for (const f of fechas) {
      if (seen.has(f.fecha)) {
        return 'Hay fechas duplicadas. Cada día debe figurar una sola vez.';
      }
      seen.add(f.fecha);
    }
    return '';
  }

  async guardar(): Promise<void> {
    if (this.guardando()) return;
    this.error.set('');
    this.ok.set('');
    const err = this.validar();
    if (err) {
      this.error.set(err);
      return;
    }
    const gen = this.loadGen;
    const mode = this.mode();
    this.guardando.set(true);
    let fase: 'curso' | 'fecha' = 'curso';
    let escribioParcial = false;
    try {
      const drafts =
        mode === 'create'
          ? this.fechas().map((f, i) => ({ ...f, orden: i + 1 }))
          : this.payloadFechas();
      if (mode === 'create') {
        // Backend createCourse ignora estado e inserta siempre 'activo'.
        const draft: CursoDraft = {
          codigo: this.codigo().trim(),
          nombre: this.nombre().trim(),
          estado: 'activo',
        };
        const creado = await this.courses.crear(draft);
        escribioParcial = true;
        fase = 'fecha';
        try {
          for (const f of drafts) {
            await this.courses.guardarFecha(creado.id, f);
          }
        } catch (fechaErr) {
          const msg = this.mensajeErrorApi(fechaErr, 'fecha');
          await this.router.navigate(['/admin/cursos', creado.id, 'editar'], {
            state: {
              flashError: `El curso se creó, pero no pudimos guardar todas las fechas. ${msg}`,
            },
          });
          return;
        }
        if (gen !== this.loadGen) return;
        await this.router.navigate(['/admin/cursos', creado.id]);
        return;
      }
      const cid = this.idNumber();
      if (cid === null) {
        this.error.set(MSG_NOT_FOUND);
        return;
      }
      const codigo = this.codigo().trim();
      const nombre = this.nombre().trim();
      const d0 = this.detalle();
      if (!d0 || d0.codigo !== codigo || d0.nombre !== nombre) {
        await this.courses.actualizar(cid, { codigo, nombre });
        escribioParcial = true;
      }
      if (gen !== this.loadGen || this.idNumber() !== cid) {
        this.error.set(
          'Había otra ficha abierta. Los cambios pueden haberse aplicado en parte; recargá el curso.',
        );
        return;
      }
      const nuevoEstado = this.estadoResultante();
      if (nuevoEstado !== this.estadoOriginal()) {
        await this.courses.actualizarEstado(cid, nuevoEstado);
        escribioParcial = true;
      }
      if (gen !== this.loadGen || this.idNumber() !== cid) {
        this.error.set(
          'Había otra ficha abierta. Los cambios pueden haberse aplicado en parte; recargá el curso.',
        );
        return;
      }
      fase = 'fecha';
      await this.courses.reemplazarFechas(cid, drafts);
      escribioParcial = true;
      if (gen !== this.loadGen || this.idNumber() !== cid) {
        this.error.set(
          'Había otra ficha abierta. Los cambios pueden haberse aplicado en parte; recargá el curso.',
        );
        return;
      }
      const d = await this.courses.obtener(cid);
      if (gen !== this.loadGen || this.idNumber() !== cid) return;
      this.aplicarDetalle(d);
      this.ok.set('Cambios guardados.');
    } catch (e) {
      if (gen !== this.loadGen) {
        if (escribioParcial) {
          this.error.set(
            'Había otra ficha abierta. Los cambios pueden haberse aplicado en parte; recargá el curso.',
          );
        }
        return;
      }
      this.error.set(this.mensajeErrorApi(e, fase));
    } finally {
      this.guardando.set(false);
    }
  }
}
