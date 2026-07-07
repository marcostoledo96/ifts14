import { ChangeDetectionStrategy, Component, output, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';

interface LoginFormValue {
  readonly usuario: string;
  readonly clave: string;
}

@Component({
  selector: 'app-login-form',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [FormsModule],
  templateUrl: './login-form.html',
  styleUrl: './login-form.css',
})
export class LoginForm {
  readonly accesoSimulado = output<void>();

  // Señales locales reactivas para el estado del formulario.
  readonly usuario = signal('');
  readonly clave = signal('');
  readonly errorMsg = signal('');

  private validar(value: LoginFormValue): string {
    if (!value.usuario.trim() || !value.clave) {
      return 'Completá tu ID institucional y tu clave de acceso para continuar.';
    }
    if (value.usuario.trim().length < 3) {
      return 'El ID institucional debe tener al menos 3 caracteres.';
    }
    if (value.clave.length < 6) {
      return 'La clave de acceso debe tener al menos 6 caracteres.';
    }
    return '';
  }

  enviar(): void {
    const value: LoginFormValue = { usuario: this.usuario(), clave: this.clave() };
    const error = this.validar(value);
    if (error) {
      this.errorMsg.set(error);
      // El alert role=alert se renderiza por @if(errorMsg()) en la plantilla.
      // OnPush+signal agenda CD vía zone.onMicrotaskEmpty; un queueMicrotask
      // corre ANTES de ese flush y el <p> aún no existe. setTimeout(0) es una
      // macrotask: corre después del flush de CD y del render, cuando el alert
      // ya está en el DOM. Estable en el flujo real de ngSubmit.
      setTimeout(() => {
        document.getElementById('login-error')?.focus();
      }, 0);
      return;
    }
    this.errorMsg.set('');
    this.accesoSimulado.emit();
  }

  onUsuario(event: Event): void {
    this.usuario.set((event.target as HTMLInputElement).value);
  }

  onClave(event: Event): void {
    this.clave.set((event.target as HTMLInputElement).value);
  }
}