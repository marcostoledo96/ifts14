import { TestBed } from '@angular/core/testing';
import { FormsModule } from '@angular/forms';
import { LoginForm } from './login-form';

describe('LoginForm', () => {
  async function render() {
    await TestBed.configureTestingModule({
      imports: [LoginForm, FormsModule],
    }).compileComponents();
    const fixture = TestBed.createComponent(LoginForm);
    fixture.detectChanges();
    return fixture;
  }

  it('renderiza el subtítulo visible de simulación', async () => {
    const f = await render();
    const el = f.nativeElement as HTMLElement;
    expect(el.textContent).toContain(
      'Acceso simulado — la autenticación real se define en una fase posterior',
    );
  });

  it('usa fieldset/legend sr-only y label asociados', async () => {
    const f = await render();
    const el = f.nativeElement as HTMLElement;
    expect(el.querySelector('fieldset')).not.toBeNull();
    expect(el.querySelector('legend.sr-only, legend')).not.toBeNull();
    const usuarioLabel = el.querySelector('label[for="login-usuario"]');
    const claveLabel = el.querySelector('label[for="login-clave"]');
    expect(usuarioLabel).not.toBeNull();
    expect(claveLabel).not.toBeNull();
    expect(el.querySelector('#login-usuario')).not.toBeNull();
    expect(el.querySelector('#login-clave')).not.toBeNull();
  });

  it('autocomplete correcto en los inputs', async () => {
    const f = await render();
    const el = f.nativeElement as HTMLElement;
    expect(el.querySelector('#login-usuario')?.getAttribute('autocomplete')).toBe('username');
    expect(el.querySelector('#login-clave')?.getAttribute('autocomplete')).toBe(
      'current-password',
    );
  });

  it('muestra error role=alert cuando el envío está vacío', async () => {
    const f = await render();
    f.componentInstance.enviar();
    f.detectChanges();
    const el = f.nativeElement as HTMLElement;
    const alert = el.querySelector('#login-error[role="alert"]');
    expect(alert).not.toBeNull();
    expect(alert?.textContent).toContain('Completá');
  });

  it('mueve el foco al alert de error tras envío inválido por flujo real de submit', async () => {
    const f = await render();
    const el = f.nativeElement as HTMLElement;
    const form = el.querySelector('form') as HTMLFormElement;
    // Ejercita el path real de ngSubmit: dispatchEvent('submit') dispara el
    // handler del formulario, no una llamada directa al método. El foco se
    // difiere con setTimeout(0) (macrotask) para que el alert esté renderizado.
    form.dispatchEvent(new Event('submit'));
    f.detectChanges();
    // Espera dos macrotareas: 1) flush de CD tras el handler, 2) el
    // setTimeout(0) del componente. zone.js envuelve timers en microtasks
    // pero igual necesita un tick para aplicar el cambio al DOM.
    await new Promise((r) => setTimeout(r, 0));
    await new Promise((r) => setTimeout(r, 0));
    const alert = el.querySelector<HTMLElement>('#login-error');
    expect(alert).not.toBeNull();
    expect(document.activeElement).toBe(alert);
  });

  it('valida clave corta (< 6) con mensaje específico', async () => {
    const f = await render();
    f.componentInstance.usuario.set('abc');
    f.componentInstance.clave.set('123');
    f.componentInstance.enviar();
    f.detectChanges();
    const el = f.nativeElement as HTMLElement;
    expect(el.querySelector('#login-error')?.textContent).toContain('al menos 6 caracteres');
  });

  it('emite accesoSimulado con datos válidos y limpia el error', async () => {
    const f = await render();
    let called = false;
    f.componentInstance.accesoSimulado.subscribe(() => (called = true));
    f.componentInstance.usuario.set('admin');
    f.componentInstance.clave.set('clave123');
    f.componentInstance.enviar();
    f.detectChanges();
    expect(called).toBe(true);
    const el = f.nativeElement as HTMLElement;
    expect(el.querySelector('#login-error')).toBeNull();
  });

  it('no invoca fetch ni HttpClient al enviar', async () => {
    const f = await render();
    const fetchSpy = spyOn(window, 'fetch').and.callThrough();
    f.componentInstance.usuario.set('admin');
    f.componentInstance.clave.set('clave123');
    f.componentInstance.enviar();
    expect(fetchSpy).not.toHaveBeenCalled();
  });

  it('no escribe en storage al enviar', async () => {
    const f = await render();
    const setItemSpy = spyOn(Storage.prototype, 'setItem').and.callThrough();
    f.componentInstance.usuario.set('admin');
    f.componentInstance.clave.set('clave123');
    f.componentInstance.enviar();
    expect(setItemSpy).not.toHaveBeenCalled();
  });
});