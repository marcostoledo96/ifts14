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
import { existingStudentIdOf } from '../../student-duplicate.error';
import { AlumnoDraft } from '../../students.models';
import { STUDENTS_SOURCE } from '../../students.service';
import { UiBackLink } from '../../../../../shared/ui/ui-back-link';
import { UiSpinner } from '../../../../../shared/ui/ui-spinner';

export interface AlumnoFormRow {
  apellido: string;
  nombre: string;
  dni: string;
  email: string;
  errorApellido: string;
  errorNombre: string;
  errorDni: string;
  errorEmail: string;
}

/** Resumen de un alumno creado en el lote. */
export interface AlumnoAltaOk {
  readonly id: number;
  readonly apellido: string;
  readonly nombre: string;
  readonly dniMostrar: string;
}

/** Resumen de un alumno que ya existía (conflicto 409). */
export interface AlumnoYaRegistrado {
  readonly existingId: number | null;
  readonly apellido: string;
  readonly nombre: string;
  readonly dniMostrar: string;
}

export interface ResultadoAltaLote {
  readonly creados: readonly AlumnoAltaOk[];
  readonly yaRegistrados: readonly AlumnoYaRegistrado[];
  readonly otrosErrores: readonly string[];
}

function emptyRow(): AlumnoFormRow {
  return {
    apellido: '',
    nombre: '',
    dni: '',
    email: '',
    errorApellido: '',
    errorNombre: '',
    errorDni: '',
    errorEmail: '',
  };
}

function statusOf(err: unknown): number | null {
  if (err && typeof err === 'object' && 'status' in err) {
    const s = (err as { status: unknown }).status;
    return typeof s === 'number' ? s : null;
  }
  return null;
}

/** Mensaje de error seguro: nunca incluye el DNI completo tipado. */
export function mensajeErrorAlta(err: unknown, modo: 'create' | 'edit' = 'create'): string {
  const status = statusOf(err);
  const verbo = modo === 'edit' ? 'actualizar' : 'crear';
  if (status === 409) {
    return 'Ya existe un alumno con ese documento.';
  }
  if (status === 400) {
    return `No se pudo ${verbo} el alumno. Revisá los datos e intentá de nuevo.`;
  }
  return `No se pudo ${verbo} el alumno. Intentá de nuevo.`;
}

@Component({
  selector: 'app-student-editor-page',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [FormsModule, RouterLink, UiBackLink, UiSpinner],
  templateUrl: './student-editor-page.html',
  styleUrl: './student-editor-page.css',
})
export class StudentEditorPage {
  /** create (alta) o edit (datos personales). */
  readonly mode = input<'create' | 'edit'>('create');
  readonly id = input<string>('');

  private readonly students = inject(STUDENTS_SOURCE);
  private readonly router = inject(Router);
  /** Descarta respuestas obsoletas de `cargarEdicion` (Reintentar / cambio de :id). */
  private loadGeneration = 0;

  readonly filas = signal<AlumnoFormRow[]>([emptyRow()]);
  readonly errorSubmit = signal('');
  /** Id del alumno existente cuando el DNI ya está registrado (alta simple / edit). */
  readonly alumnoExistenteId = signal<number | null>(null);
  /** Resultado del último lote de alta (parcial o total con conflictos). */
  readonly resultadoLote = signal<ResultadoAltaLote | null>(null);
  readonly guardando = signal(false);
  readonly cargando = signal(false);
  readonly errorCarga = signal('');
  /** True solo ante fallo de red/servicio en `cargarEdicion` (no id inválido ni null). */
  readonly errorCargaRecuperable = signal(false);

  readonly esEdicion = computed(() => this.mode() === 'edit');
  readonly esAltaMultiple = computed(() => this.mode() === 'create');
  readonly cantidad = computed(() => this.filas().length);
  readonly puedeQuitar = computed(() => this.esAltaMultiple() && this.cantidad() > 1);
  readonly hayResultadoLote = computed(() => this.resultadoLote() !== null);

  constructor() {
    effect(() => {
      const mode = this.mode();
      const id = this.id();
      untracked(() => {
        if (mode === 'edit') void this.cargarEdicion(id);
        else {
          this.filas.set([emptyRow()]);
          this.resultadoLote.set(null);
          this.errorCarga.set('');
          this.errorCargaRecuperable.set(false);
        }
      });
    });
  }

  private async cargarEdicion(idRaw: string): Promise<void> {
    const generation = ++this.loadGeneration;
    this.errorCarga.set('');
    this.errorCargaRecuperable.set(false);
    this.resultadoLote.set(null);
    if (!/^[1-9]\d*$/.test(idRaw.trim())) {
      this.errorCarga.set('Identificador de alumno inválido.');
      return;
    }
    const id = Number(idRaw);
    this.cargando.set(true);
    try {
      const det = await this.students.obtener(id);
      if (generation !== this.loadGeneration) return;
      if (!det) {
        this.errorCarga.set('Alumno no encontrado.');
        return;
      }
      this.filas.set([
        {
          ...emptyRow(),
          apellido: det.apellido,
          nombre: det.nombre,
          dni: det.dniMostrar,
          email: det.email ?? '',
        },
      ]);
    } catch {
      if (generation !== this.loadGeneration) return;
      this.errorCarga.set('No se pudo cargar el alumno. Reintentá.');
      this.errorCargaRecuperable.set(true);
    } finally {
      if (generation === this.loadGeneration) this.cargando.set(false);
    }
  }

  onReintentar(): void {
    if (!this.errorCargaRecuperable()) return;
    void this.cargarEdicion(this.id());
  }

  agregarFila(): void {
    if (!this.esAltaMultiple() || this.guardando()) return;
    this.filas.update((list) => [...list, emptyRow()]);
    this.clearSubmitFeedback();
  }

  quitarFila(index: number): void {
    if (!this.puedeQuitar() || this.guardando()) return;
    this.filas.update((list) => list.filter((_, i) => i !== index));
    this.clearSubmitFeedback();
  }

  onCampo(
    index: number,
    campo: 'apellido' | 'nombre' | 'dni' | 'email',
    event: Event,
  ): void {
    const value = (event.target as HTMLInputElement).value;
    this.filas.update((list) =>
      list.map((row, i) => {
        if (i !== index) return row;
        const errorKey =
          campo === 'apellido'
            ? 'errorApellido'
            : campo === 'nombre'
              ? 'errorNombre'
              : campo === 'dni'
                ? 'errorDni'
                : 'errorEmail';
        return { ...row, [campo]: value, [errorKey]: '' };
      }),
    );
    this.clearSubmitFeedback();
  }

  private clearSubmitFeedback(): void {
    this.errorSubmit.set('');
    this.alumnoExistenteId.set(null);
    this.resultadoLote.set(null);
  }

  private validar(): boolean {
    let ok = true;
    const seen = new Map<string, number>();
    const next = this.filas().map((row, index) => {
      let errorApellido = '';
      let errorNombre = '';
      let errorDni = '';
      let errorEmail = '';

      if (!row.apellido.trim()) {
        errorApellido = 'El apellido es obligatorio.';
        ok = false;
      }
      if (!row.nombre.trim()) {
        errorNombre = 'El nombre es obligatorio.';
        ok = false;
      }
      const digits = row.dni.trim().replace(/\D/g, '');
      if (!digits) {
        errorDni = 'El DNI es obligatorio.';
        ok = false;
      } else if (digits.length < 6 || digits.length > 10) {
        errorDni = 'Ingresá un DNI válido (6 a 10 dígitos).';
        ok = false;
      } else if (seen.has(digits)) {
        errorDni = 'Este documento está repetido en el formulario.';
        ok = false;
      } else {
        seen.set(digits, index);
      }
      const email = row.email.trim();
      if (email !== '' && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
        errorEmail = 'Ingresá un email válido o dejá el campo vacío.';
        ok = false;
      }

      return { ...row, errorApellido, errorNombre, errorDni, errorEmail };
    });
    this.filas.set(next);
    return ok;
  }

  private toDraft(row: AlumnoFormRow): AlumnoDraft {
    const email = row.email.trim();
    return {
      apellido: row.apellido.trim(),
      nombre: row.nombre.trim(),
      dni: row.dni.trim().replace(/\D/g, ''),
      email: email === '' ? null : email,
    };
  }

  async guardar(): Promise<void> {
    this.clearSubmitFeedback();
    if (this.guardando() || this.cargando() || this.errorCarga()) return;
    if (!this.validar()) return;

    this.guardando.set(true);
    try {
      if (this.mode() === 'edit') {
        const id = Number(this.id());
        const updated = await this.students.actualizar(id, this.toDraft(this.filas()[0]));
        await this.router.navigate(['/admin/alumnos', updated.id]);
        return;
      }

      const drafts = this.filas().map((r) => this.toDraft(r));
      const creados: AlumnoAltaOk[] = [];
      const yaRegistrados: AlumnoYaRegistrado[] = [];
      const otrosErrores: string[] = [];

      for (let i = 0; i < drafts.length; i++) {
        const draft = drafts[i];
        try {
          const created = await this.students.crear(draft);
          creados.push({
            id: created.id,
            apellido: created.apellido,
            nombre: created.nombre,
            dniMostrar: created.dniMostrar,
          });
        } catch (err) {
          if (statusOf(err) === 409) {
            yaRegistrados.push({
              existingId: existingStudentIdOf(err),
              apellido: draft.apellido,
              nombre: draft.nombre,
              dniMostrar: draft.dni,
            });
          } else {
            otrosErrores.push(
              `Alumno N.° ${i + 1} (${draft.apellido}, ${draft.nombre}): ${mensajeErrorAlta(err, 'create')}`,
            );
          }
        }
      }

      this.resultadoLote.set({ creados, yaRegistrados, otrosErrores });
      if (otrosErrores.length > 0 && creados.length === 0 && yaRegistrados.length === 0) {
        this.errorSubmit.set(otrosErrores[0]);
      }
      // Deja el formulario listo para otra carga.
      this.filas.set([emptyRow()]);
    } catch (err) {
      this.errorSubmit.set(mensajeErrorAlta(err, this.mode()));
      this.alumnoExistenteId.set(existingStudentIdOf(err));
    } finally {
      this.guardando.set(false);
    }
  }
}
