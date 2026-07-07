// Sesión mock en memoria para habilitar navegación visual del panel admin.
// NO usa storage, red, cookies ni la clave admin temporal. Ver spec admin-foundation.
import { Injectable, signal, InjectionToken, Signal } from '@angular/core';

export interface MockSession {
  readonly isActive: Signal<boolean>;
  hasSession(): boolean;
  signIn(): void;
  signOut(): void;
}

// ponytail: token único para inyectar la implementación mock concreta.
export const MOCK_SESSION = new InjectionToken<MockSession>('MOCK_SESSION');

@Injectable({ providedIn: 'root' })
export class InMemoryMockSession implements MockSession {
  private readonly _isActive = signal(false);

  readonly isActive: Signal<boolean> = this._isActive.asReadonly();

  hasSession(): boolean {
    return this._isActive();
  }

  signIn(): void {
    this._isActive.set(true);
  }

  signOut(): void {
    this._isActive.set(false);
  }
}