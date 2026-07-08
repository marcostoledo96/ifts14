import { ChangeDetectionStrategy, Component, computed, inject, input, OnInit, signal } from '@angular/core';
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
export class CourseEditorPage implements OnInit {
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

  // ngOnInit: las signals de input() se ligan antes del primer
  // detectChanges, no en el ctor. Inicializar acá garantiza que mode()/id()
  // ya tengan valor.
  ngOnInit(): void {
    void this.inicializar();
  }

  async inicializar(): Promise<void> {
    this.cargando.set(true);
    try {
      if (this.mode() === 'edit') {
        const cid = this.idNumber();
        if (cid === null) {
          this.error.set('Curso no encontrado.');
          return;
        }
        const d = await this.courses.obtener(cid);
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
      this.error.set((e as Error).message);
    } finally {
      this.cargando.set(false);
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