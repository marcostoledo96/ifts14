// Servicio de autenticación admin real contra backend PHP (P5-01).
// Reemplaza la sesión mock en memoria por HTTP + cookies de sesión.
import { HttpClient } from '@angular/common/http';
import { Injectable, InjectionToken, Signal, inject, signal } from '@angular/core';
import { catchError, firstValueFrom, of, timeout } from 'rxjs';
import { environment } from '../../../environments/environment';

export interface AdminAuthCredentials {
  readonly username: string;
  readonly password: string;
}

export interface AdminAuthService {
  readonly csrfToken: Signal<string | null>;
  login(credentials: AdminAuthCredentials): Promise<void>;
  session(): Promise<boolean>;
  logout(): Promise<void>;
  clearSession(): void;
}

export const ADMIN_AUTH = new InjectionToken<AdminAuthService>('ADMIN_AUTH');

interface AuthData {
  authenticated: boolean;
  csrfToken?: string;
}

interface AuthEnvelope {
  data: AuthData;
}

@Injectable({ providedIn: 'root' })
export class HttpAdminAuthService implements AdminAuthService {
  private readonly http = inject(HttpClient);
  private readonly _csrfToken = signal<string | null>(null);
  readonly csrfToken: Signal<string | null> = this._csrfToken.asReadonly();

  async login(credentials: AdminAuthCredentials): Promise<void> {
    const res = await firstValueFrom(
      this.http.post<AuthEnvelope>(
        `${environment.apiBaseUrl}/admin/auth/login`,
        credentials,
      ),
    );
    const data = res.data;
    if (data?.authenticated && data.csrfToken) {
      this._csrfToken.set(data.csrfToken);
      return;
    }
    // 2xx sin sesión usable: no es “credenciales inválidas” (eso viene como 401 real).
    throw { status: 502 };
  }

  async session(): Promise<boolean> {
    try {
      const res = await firstValueFrom(
        this.http.get<AuthEnvelope>(
          `${environment.apiBaseUrl}/admin/auth/session`,
        ),
      );
      const data = res.data;
      // Misma barra que login: sin CSRF usable no hay sesión de mutaciones.
      if (data?.authenticated === true && data.csrfToken) {
        this._csrfToken.set(data.csrfToken);
        return true;
      }
      this.clearSession();
      return false;
    } catch {
      this.clearSession();
      return false;
    }
  }

  async logout(): Promise<void> {
    try {
      // timeout: el interceptor 401 puede devolver NEVER; no colgar el shell.
      await firstValueFrom(
        this.http.post(`${environment.apiBaseUrl}/admin/auth/logout`, {}).pipe(
          timeout({ first: 8_000 }),
          catchError(() => of(null)),
        ),
      );
    } finally {
      this.clearSession();
    }
  }

  clearSession(): void {
    this._csrfToken.set(null);
  }
}

// Helper para tests: sesión controlable sin red.
@Injectable({ providedIn: 'root' })
export class FakeAdminAuthService implements AdminAuthService {
  private readonly _csrfToken = signal<string | null>('fake-csrf-token');
  readonly csrfToken: Signal<string | null> = this._csrfToken.asReadonly();
  private authenticated = false;

  setAuthenticated(value: boolean): void {
    this.authenticated = value;
    if (value) {
      if (!this._csrfToken()) this._csrfToken.set('fake-csrf-token');
    } else {
      this._csrfToken.set(null);
    }
  }

  async login(): Promise<void> {
    this.authenticated = true;
    this._csrfToken.set('fake-csrf-token');
  }

  async session(): Promise<boolean> {
    return this.authenticated && !!this._csrfToken();
  }

  async logout(): Promise<void> {
    this.authenticated = false;
    this.clearSession();
  }

  clearSession(): void {
    this._csrfToken.set(null);
    this.authenticated = false;
  }
}