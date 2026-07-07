import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { Router } from '@angular/router';
import { MOCK_SESSION } from './mock-session';
import { LoginForm } from './login-form';

@Component({
  selector: 'app-login-page',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [LoginForm],
  templateUrl: './login-page.html',
  styleUrl: './login-page.css',
})
export class LoginPage {
  private readonly session = inject(MOCK_SESSION);
  private readonly router = inject(Router);

  onAccesoSimulado(): void {
    this.session.signIn();
    void this.router.navigate(['/admin/dashboard']);
  }
}