import { TestBed } from '@angular/core/testing';
import { MOCK_SESSION, InMemoryMockSession, MockSession } from './mock-session';

describe('InMemoryMockSession', () => {
  let session: MockSession;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [{ provide: MOCK_SESSION, useClass: InMemoryMockSession }],
    });
    session = TestBed.inject(MOCK_SESSION);
  });

  it('inicia sin sesión activa', () => {
    expect(session.hasSession()).toBe(false);
    expect(session.isActive()).toBe(false);
  });

  it('signIn activa la sesión solo en memoria', () => {
    const setItemSpy = spyOn(Storage.prototype, 'setItem').and.callThrough();
    session.signIn();
    expect(session.hasSession()).toBe(true);
    expect(session.isActive()).toBe(true);
    expect(setItemSpy).not.toHaveBeenCalled();
  });

  it('signOut desactiva la sesión', () => {
    session.signIn();
    session.signOut();
    expect(session.hasSession()).toBe(false);
    expect(session.isActive()).toBe(false);
  });

  it('no escribe en storage al cerrar sesión tras abrir', () => {
    const setItemSpy = spyOn(Storage.prototype, 'setItem').and.callThrough();
    session.signIn();
    session.signOut();
    expect(setItemSpy).not.toHaveBeenCalled();
  });
});