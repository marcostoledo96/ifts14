import {
  ChangeDetectionStrategy,
  Component,
  inject,
  signal,
} from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { existingStudentIdOf } from '../../student-duplicate.error';
import { AlumnoDraft } from '../../students.models';
import { STUDENTS_SOURCE } from '../../students.service';

function statusOf(err: unknown): number | null {
  if (err && typeof err === 'object' && 'status' in err) {
    const s = (err as { status: unknown }).status;
    return typeof s === 'number' ? s : null;
  }
  return null;
}

/** Mensaje de error seguro: nunca incluye el DNI completo tipado. */
export function mensajeErrorAlta(err: unknown): string {
  const status = statusOf(err);
  if (status === 409) {
    return 'Ya existe un alumno con ese documento.';
  }
  if (status === 400) {
    return 'No se pudo crear el alumno. Revisá los datos e intentá de nuevo.';
  }
  return 'No se pudo crear el alumno. Intentá de nuevo.';
}

@Component({
  selector: 'app-student-editor-page',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [FormsModule, RouterLink],
  templateUrl: './student-editor-page.html',
  styleUrl: './student-editor-page.css',
})
export class StudentEditorPage {
  private readonly students = inject(STUDENTS_SOURCE);
  private readonly router = inject(Router);

  readonly apellidoNombre = signal('');
  readonly dni = signal('');
  readonly email = signal('');
  readonly errorApellido = signal('');
  readonly errorDni = signal('');
  readonly errorEmail = signal('');
  readonly errorSubmit = signal('');
  /** Id del alumno existente cuando el DNI ya está registrado. */
  readonly alumnoExistenteId = signal<number | null>(null);
  readonly guardando = signal(false);

  onApellidoNombre(event: Event): void {
    this.apellidoNombre.set((event.target as HTMLInputElement).value);
    this.errorApellido.set('');
    this.clearSubmitError();
  }

  onDni(event: Event): void {
    this.dni.set((event.target as HTMLInputElement).value);
    this.errorDni.set('');
    this.clearSubmitError();
  }

  onEmail(event: Event): void {
    this.email.set((event.target as HTMLInputElement).value);
    this.errorEmail.set('');
    this.clearSubmitError();
  }

  private clearSubmitError(): void {
    this.errorSubmit.set('');
    this.alumnoExistenteId.set(null);
  }

  private validar(): boolean {
    let ok = true;
    if (!this.apellidoNombre().trim()) {
      this.errorApellido.set('El apellido y nombre son obligatorios.');
      ok = false;
    }
    const digits = this.dni().trim().replace(/\D/g, '');
    if (!digits) {
      this.errorDni.set('El DNI es obligatorio.');
      ok = false;
    } else if (digits.length < 7 || digits.length > 8) {
      this.errorDni.set('Ingresá un DNI válido (7 u 8 dígitos).');
      ok = false;
    }
    const email = this.email().trim();
    if (email !== '' && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      this.errorEmail.set('Ingresá un email válido o dejá el campo vacío.');
      ok = false;
    }
    return ok;
  }

  async guardar(): Promise<void> {
    this.clearSubmitError();
    if (this.guardando()) return;
    if (!this.validar()) return;

    this.guardando.set(true);
    try {
      const digits = this.dni().trim().replace(/\D/g, '');
      const email = this.email().trim();
      const draft: AlumnoDraft = {
        apellidoNombre: this.apellidoNombre().trim(),
        dni: digits,
        email: email === '' ? null : email,
      };
      const created = await this.students.crear(draft);
      await this.router.navigate(['/admin/alumnos', created.id]);
    } catch (err) {
      this.errorSubmit.set(mensajeErrorAlta(err));
      this.alumnoExistenteId.set(existingStudentIdOf(err));
    } finally {
      this.guardando.set(false);
    }
  }
}
