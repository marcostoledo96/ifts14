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
  CursoFechaDraft,
  EstadoCurso,
  EstadoFecha,
} from './courses.models';

// Editor de curso: modo create (alta) o edit (gestión de fechas).
// Sin HTTP/storage. Mutaciones solo en memoria.
@Component({
  selector: 'app-course-editor-page',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [FormsModule, RouterLink],
  templateUrl: './course-editor-page.html',
  styleUrl: './course-editor-page.css',
})
export class CourseEditorPage {
  // El route define data.mode ('create' | 'edit'). Angular inyecta el
  // snapshot de la ruta en `data` vía withComponentInputBinding().
  readonly mode = input<'create' | 'edit'>('create');
  // withComponentInputBinding() pasa :id como string; el id numérico se
  // computa con idNumber() y se valida antes de usarlo en el servicio.
  readonly id = input<string>('');

  private readonly courses = inject(COURSES_SOURCE);
  private readonly router = inject(Router);

  readonly estados: readonly EstadoCurso[] = ['borrador', 'activo', 'cerrado', 'archivado'];
  readonly estadosFecha: readonly EstadoFecha[] = ['programada', 'realizada', 'cancelada'];

  // Campos del curso (modo create).
  readonly codigo = signal('');
  readonly nombre = signal('');
  readonly estado = signal<EstadoCurso>('borrador');

  // Fechas del curso (modo edit). Cada item es un draft editable.
  readonly fechas = signal<CursoFechaDraft[]>([]);
  readonly detalle = signal<CursoDetalle | null>(null);

  readonly cargando = signal(true);
  readonly guardando = signal(false);
  readonly error = signal('');
  readonly ok = signal('');

  // Id numérico validado. NaN, vacío o <= 0 → null (tratado como no encontrado).
  readonly idNumber = computed<number | null>(() => {
    const n = Number(this.id());
    return !this.id() || Number.isNaN(n) || n <= 0 ? null : n;
  });

  // ponytail: generación de carga para descartar resultados stale cuando el
  // id/mode cambia antes de que termine la carga anterior (route reuse).
  private loadGen = 0;

  constructor() {
    // Reacciona a cambios de mode()/id() tras la ligadura inicial y también
    // cuando Angular reutiliza la misma instancia de componente al navegar
    // entre URLs que comparten la misma route config (p.ej. /cursos/1/editar
    // -> /cursos/2/editar). ngOnInit no vuelve a correr en ese caso, pero el
    // effect sí re-ejecuta porque las signals input() cambian.
    effect(() => {
      const mode = this.mode();
      const id = this.id();
      untracked(() => void this.recargar(mode, id));
    });
  }

  private async recargar(mode: 'create' | 'edit', id: string): Promise<void> {
    const gen = ++this.loadGen;
    // Reset de estado stale antes de cargar para que no queden fechas del
    // curso anterior visibles/ediciones mientras carga el nuevo.
    this.detalle.set(null);
    this.fechas.set([]);
    this.codigo.set('');
    this.nombre.set('');
    this.estado.set('borrador');
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
        if (gen !== this.loadGen) return; // carga stale, ignorar
        this.detalle.set(d);
        this.codigo.set(d.codigo);
        this.nombre.set(d.nombre);
        this.estado.set(d.estado);
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

  agregarFecha(): void {
    this.fechas.update((list) => [
      ...list,
      { id: null, fecha: '', descripcion: null, orden: list.length + 1, estado: 'programada' },
    ]);
  }

  quitarFecha(index: number): void {
    this.fechas.update((list) => list.filter((_, i) => i !== index));
  }

  onFechaInput(index: number, event: Event): void {
    const value = (event.target as HTMLInputElement).value;
    this.fechas.update((list) =>
      list.map((f, i) => (i === index ? { ...f, fecha: value } : f)),
    );
  }

  onDescripcionInput(index: number, event: Event): void {
    const value = (event.target as HTMLInputElement).value;
    this.fechas.update((list) =>
      list.map((f, i) => (i === index ? { ...f, descripcion: value || null } : f)),
    );
  }

  onEstadoFecha(index: number, event: Event): void {
    const value = (event.target as HTMLSelectElement).value as EstadoFecha;
    this.fechas.update((list) =>
      list.map((f, i) => (i === index ? { ...f, estado: value } : f)),
    );
  }

  onCodigo(event: Event): void {
    this.codigo.set((event.target as HTMLInputElement).value);
  }

  onNombre(event: Event): void {
    this.nombre.set((event.target as HTMLInputElement).value);
  }

  onEstado(event: Event): void {
    this.estado.set((event.target as HTMLSelectElement).value as EstadoCurso);
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
        const draft: CursoDraft = {
          codigo: this.codigo().trim(),
          nombre: this.nombre().trim(),
          estado: this.estado(),
        };
        const creado = await this.courses.crear(draft);
        // Tras crear, guardar fechas (si las hubo) y volver al detalle.
        for (const f of this.fechas()) {
          await this.courses.guardarFecha(creado.id, f);
        }
        await this.router.navigate(['/admin/cursos', creado.id]);
        return;
      }
      // modo edit: reemplazo completo del set de fechas (crea nuevas, actualiza
      // existentes y elimina las quitadas). Sin esto, quitarFecha solo remueve
      // del signal local y la fecha quitada reaparece al recargar el detalle.
      const cid = this.idNumber();
      if (cid === null) {
        this.error.set('Curso no encontrado.');
        return;
      }
      await this.courses.reemplazarFechas(cid, this.fechas());
      this.ok.set('Cambios guardados en memoria (demo). No persisten al recargar.');
    } catch (e) {
      this.error.set((e as Error).message);
    } finally {
      this.guardando.set(false);
    }
  }
}