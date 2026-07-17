import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { Router } from '@angular/router';
import { ADMIN_AUTH, AdminAuthCredentials } from './admin-auth.service';
import { LoginForm } from './login-form';

@Component({
  selector: 'app-login-page',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [LoginForm],
  templateUrl: './login-page.html',
  styleUrl: './login-page.css',
})
export class LoginPage {
  private readonly auth = inject(ADMIN_AUTH);
  private readonly router = inject(Router);

  readonly errorMsg = signal('');
  readonly loading = signal(false);
  readonly anioActual = new Date().getFullYear();

  async onAccesoSimulado(credentials: AdminAuthCredentials): Promise<void> {
    this.errorMsg.set('');
    this.loading.set(true);
    try {
      await this.auth.login(credentials);
      void this.router.navigate(['/admin/dashboard']);
    } catch (err: unknown) {
      const status = (err as { status?: number }).status;
      if (status === 429) {
        this.errorMsg.set('Demasiados intentos. Aguardá unos minutos e intentá nuevamente.');
      } else {
        this.errorMsg.set(
          'Las credenciales no coinciden con un registro autorizado. Verificá los datos e intentá nuevamente.',
        );
      }
    } finally {
      this.loading.set(false);
    }
  }
}
