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
import { UiSpinner } from '../../../shared/ui/ui-spinner';

// Editor de curso: create (alta) o edit (estado + fechas).
// Layout v0 con contrato estricto: sin campos fantasma.
@Component({
  selector: 'app-course-editor-page',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [FormsModule, RouterLink, UiSpinner],
  templateUrl: './course-editor-page.html',
  styleUrl: './course-editor-page.css',
})
export class CourseEditorPage {
  readonly mode = input<'create' | 'edit'>('create');
  readonly id = input<string>('');

  private readonly courses = inject(COURSES_SOURCE);
  private readonly router = inject(Router);

  readonly estadosFecha: readonly EstadoFecha[] = ['programada', 'realizada', 'cancelada'];

  readonly codigo = signal('');
  readonly nombre = signal('');
  /** Toggle UI "Curso activo" (solo edit). */
  readonly activo = signal(true);
  /** Estado persistido al cargar (edit); base para mapear el toggle. */
  readonly estadoOriginal = signal<EstadoCurso>('activo');

  readonly fechas = signal<CursoFechaDraft[]>([]);
  /** Snapshot de fechas al cargar; base del aviso de impacto. */
  private readonly fechasOriginales = signal<readonly CursoFecha[]>([]);
  readonly detalle = signal<CursoDetalle | null>(null);

  readonly cargando = signal(true);
  readonly guardando = signal(false);
  readonly error = signal('');
  readonly ok = signal('');

  readonly idNumber = computed<number | null>(() => {
    const n = Number(this.id());
    return !this.id() || Number.isNaN(n) || n <= 0 ? null : n;
  });

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
    this.fechasOriginales.set([]);
    this.codigo.set('');
    this.nombre.set('');
    this.activo.set(true);
    this.estadoOriginal.set('activo');
    this.ok.set('');
    this.error.set('');
    this.cargando.set(true);
    try {
      if (mode === 'edit') {
        const n = Number(id);
        const cid = !id || Number.isNaN(n) || n <= 0 ? null : n;
        if (cid === null) {
          if (gen === this.loadGen) this.error.set('Curso no encontrado.');
          return;
        }
        const d = await this.courses.obtener(cid);
        if (gen !== this.loadGen) return;
        this.detalle.set(d);
        this.codigo.set(d.codigo);
        this.nombre.set(d.nombre);
        this.estadoOriginal.set(d.estado);
        this.activo.set(d.estado === 'activo');
        this.fechasOriginales.set(d.fechas);
        this.fechas.set(
          d.fechas.map((f) => ({
            id: f.id,
            fecha: f.fecha,
            descripcion: f.descripcion,
            orden: f.orden,
            estado: f.estado,
          })),
        );
      }
    } catch (e) {
      if (gen === this.loadGen) this.error.set((e as Error).message);
    } finally {
      if (gen === this.loadGen) this.cargando.set(false);
    }
  }

  toggleActivo(): void {
    this.activo.update((v) => !v);
    this.ok.set('');
  }

  agregarFecha(): void {
    this.fechas.update((list) => [
      ...list,
      { id: null, fecha: '', descripcion: null, orden: list.length + 1, estado: 'programada' },
    ]);
    this.ok.set('');
  }

  quitarFecha(index: number): void {
    this.fechas.update((list) => list.filter((_, i) => i !== index));
    this.ok.set('');
  }

  onFechaInput(index: number, event: Event): void {
    const value = (event.target as HTMLInputElement).value;
    this.fechas.update((list) =>
      list.map((f, i) => (i === index ? { ...f, fecha: value } : f)),
    );
    this.ok.set('');
  }

  onDescripcionInput(index: number, event: Event): void {
    const value = (event.target as HTMLInputElement).value;
    this.fechas.update((list) =>
      list.map((f, i) => (i === index ? { ...f, descripcion: value || null } : f)),
    );
    this.ok.set('');
  }

  onEstadoFecha(index: number, event: Event): void {
    const value = (event.target as HTMLSelectElement).value as EstadoFecha;
    this.fechas.update((list) =>
      list.map((f, i) => (i === index ? { ...f, estado: value } : f)),
    );
    this.ok.set('');
  }

  onCodigo(event: Event): void {
    this.codigo.set((event.target as HTMLInputElement).value);
    this.ok.set('');
  }

  onNombre(event: Event): void {
    this.nombre.set((event.target as HTMLInputElement).value);
    this.ok.set('');
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

  validar(): string {
    if (!this.codigo().trim() || !this.nombre().trim()) {
      return 'Código y nombre son obligatorios.';
    }
    for (const f of this.fechas()) {
      if (!f.fecha) {
        return 'Todas las fechas deben tener una fecha definida.';
      }
    }
    return '';
  }

  async guardar(): Promise<void> {
    this.error.set('');
    this.ok.set('');
    const err = this.validar();
    if (err) {
      this.error.set(err);
      return;
    }
    this.guardando.set(true);
    try {
      if (this.mode() === 'create') {
        // Backend createCourse ignora estado e inserta siempre 'activo'.
        const draft: CursoDraft = {
          codigo: this.codigo().trim(),
          nombre: this.nombre().trim(),
          estado: 'activo',
        };
        const creado = await this.courses.crear(draft);
        for (const f of this.fechas()) {
          await this.courses.guardarFecha(creado.id, f);
        }
        await this.router.navigate(['/admin/cursos', creado.id]);
        return;
      }
      const cid = this.idNumber();
      if (cid === null) {
        this.error.set('Curso no encontrado.');
        return;
      }
      const codigo = this.codigo().trim();
      const nombre = this.nombre().trim();
      const d0 = this.detalle();
      if (!d0 || d0.codigo !== codigo || d0.nombre !== nombre) {
        await this.courses.actualizar(cid, { codigo, nombre });
      }
      const nuevoEstado = this.estadoResultante();
      if (nuevoEstado !== this.estadoOriginal()) {
        await this.courses.actualizarEstado(cid, nuevoEstado);
      }
      await this.courses.reemplazarFechas(cid, this.fechas());
      const d = await this.courses.obtener(cid);
      this.detalle.set(d);
      this.codigo.set(d.codigo);
      this.nombre.set(d.nombre);
      this.estadoOriginal.set(d.estado);
      this.activo.set(d.estado === 'activo');
      this.fechasOriginales.set(d.fechas);
      this.fechas.set(
        d.fechas.map((f) => ({
          id: f.id,
          fecha: f.fecha,
          descripcion: f.descripcion,
          orden: f.orden,
          estado: f.estado,
        })),
      );
      this.ok.set('Cambios guardados.');
    } catch (e) {
      this.error.set((e as Error).message);
    } finally {
      this.guardando.set(false);
    }
  }
}
