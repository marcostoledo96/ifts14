import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { Router } from '@angular/router';
import {
  INSTITUTIONAL_BRAND,
  INSTITUTIONAL_PARTNER_LOGOS,
} from '../../shared/brand/institutional-brand';
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
  readonly logoSrc = INSTITUTIONAL_BRAND.logoIfts;
  readonly partnerLogos = INSTITUTIONAL_PARTNER_LOGOS;

  async onLoginSubmitted(credentials: AdminAuthCredentials): Promise<void> {
    this.errorMsg.set('');
    this.loading.set(true);
    try {
      await this.auth.login(credentials);
      void this.router.navigate(['/admin/dashboard']);
    } catch (err: unknown) {
      this.errorMsg.set(mensajeErrorLogin(err));
    } finally {
      this.loading.set(false);
    }
  }
}

function mensajeErrorLogin(err: unknown): string {
  const status = (err as { status?: number }).status;
  if (status === 429) {
    return 'Demasiados intentos. Aguardá unos minutos e intentá nuevamente.';
  }
  if (status === 401) {
    return 'Las credenciales no coinciden con un registro autorizado. Verificá los datos e intentá nuevamente.';
  }
  if (status === 0 || status === undefined) {
    return 'No se pudo conectar con el servidor. Verificá tu conexión e intentá nuevamente.';
  }
  return 'No se pudo completar el acceso. Intentá nuevamente en unos momentos.';
}
