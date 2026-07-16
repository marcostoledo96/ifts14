// Servicio de autenticación admin real contra backend PHP (P5-01).
// Reemplaza la sesión mock en memoria por HTTP + cookies de sesión.
import { HttpClient } from '@angular/common/http';
import { Injectable, InjectionToken, Signal, inject, signal } from '@angular/core';
import { firstValueFrom } from 'rxjs';
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

interface AuthResponse {
  authenticated: boolean;
  csrfToken?: string;
}

@Injectable({ providedIn: 'root' })
export class HttpAdminAuthService implements AdminAuthService {
  private readonly http = inject(HttpClient);
  private readonly _csrfToken = signal<string | null>(null);
  readonly csrfToken: Signal<string | null> = this._csrfToken.asReadonly();

  async login(credentials: AdminAuthCredentials): Promise<void> {
    const res = await firstValueFrom(
      this.http.post<AuthResponse>(
        `${environment.apiBaseUrl}/admin/auth/login`,
        credentials,
      ),
    );
    if (res.authenticated && res.csrfToken) {
      this._csrfToken.set(res.csrfToken);
    }
  }

  async session(): Promise<boolean> {
    try {
      const res = await firstValueFrom(
        this.http.get<AuthResponse>(
          `${environment.apiBaseUrl}/admin/auth/session`,
        ),
      );
      if (res.authenticated && res.csrfToken) {
        this._csrfToken.set(res.csrfToken);
      }
      return res.authenticated === true;
    } catch {
      return false;
    }
  }

  async logout(): Promise<void> {
    try {
      await firstValueFrom(
        this.http.post(`${environment.apiBaseUrl}/admin/auth/logout`, {}),
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
  }

  async login(): Promise<void> {
    this.authenticated = true;
  }

  async session(): Promise<boolean> {
    return this.authenticated;
  }

  async logout(): Promise<void> {
    this.authenticated = false;
  }

  clearSession(): void {
    this._csrfToken.set(null);
    this.authenticated = false;
  }
}