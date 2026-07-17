import {
  ChangeDetectionStrategy,
  Component,
  computed,
  effect,
  input,
  output,
  signal,
} from '@angular/core';
import { FormsModule } from '@angular/forms';
import { AdminAuthCredentials } from './admin-auth.service';

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
  readonly loading = input(false);
  /** Error del login HTTP (401/429); se muestra en el mismo alert que la validación local. */
  readonly serverError = input('');
  readonly accesoSimulado = output<AdminAuthCredentials>();

  readonly usuario = signal('');
  readonly clave = signal('');
  readonly errorMsg = signal('');
  readonly showPassword = signal(false);

  readonly displayError = computed(() => this.errorMsg() || this.serverError());

  constructor() {
    effect(() => {
      const msg = this.serverError();
      if (!msg) return;
      queueMicrotask(() => document.getElementById('login-error')?.focus());
    });
  }

  togglePasswordVisibility(): void {
    this.showPassword.update((v) => !v);
  }

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
    if (this.loading()) {
      return;
    }
    const value: LoginFormValue = { usuario: this.usuario(), clave: this.clave() };
    const error = this.validar(value);
    if (error) {
      this.errorMsg.set(error);
      setTimeout(() => {
        document.getElementById('login-error')?.focus();
      }, 0);
      return;
    }
    this.errorMsg.set('');
    this.accesoSimulado.emit({ username: value.usuario, password: value.clave });
    this.clave.set('');
    this.usuario.set('');
  }

  onUsuario(event: Event): void {
    this.usuario.set((event.target as HTMLInputElement).value);
  }

  onClave(event: Event): void {
    this.clave.set((event.target as HTMLInputElement).value);
  }
}
