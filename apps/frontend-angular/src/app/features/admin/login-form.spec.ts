import { TestBed } from '@angular/core/testing';
import { FormsModule } from '@angular/forms';
import { LoginForm } from './login-form';

describe('LoginForm', () => {
  async function render(loading = false) {
    await TestBed.configureTestingModule({
      imports: [LoginForm, FormsModule],
    }).compileComponents();
    const fixture = TestBed.createComponent(LoginForm);
    fixture.componentRef.setInput('loading', loading);
    fixture.detectChanges();
    return fixture;
  }

  it('muestra el aviso de auditoría institucional', async () => {
    const f = await render();
    const el = f.nativeElement as HTMLElement;
    expect(el.textContent).toContain('Todas las acciones administrativas quedan registradas.');
    expect(el.querySelector('.aviso-auditoria[role="note"]')).not.toBeNull();
    expect(el.textContent).not.toContain('Acceso simulado');
  });

  it('usa fieldset/legend sr-only y label asociados', async () => {
    const f = await render();
    const el = f.nativeElement as HTMLElement;
    expect(el.querySelector('fieldset')).not.toBeNull();
    expect(el.querySelector('legend')).not.toBeNull();
    const usuarioLabel = el.querySelector('label[for="login-usuario"]');
    const claveLabel = el.querySelector('label[for="login-clave"]');
    expect(usuarioLabel).not.toBeNull();
    expect(claveLabel).not.toBeNull();
    expect(el.querySelector('#login-usuario')).not.toBeNull();
    expect(el.querySelector('#login-clave')).not.toBeNull();
  });

  it('incluye iconos SVG decorativos en los inputs', async () => {
    const f = await render();
    const el = f.nativeElement as HTMLElement;
    expect(el.querySelectorAll('.input-icon[aria-hidden="true"]').length).toBeGreaterThanOrEqual(2);
  });

  it('autocomplete correcto en los inputs', async () => {
    const f = await render();
    const el = f.nativeElement as HTMLElement;
    expect(el.querySelector('#login-usuario')?.getAttribute('autocomplete')).toBe('username');
    expect(el.querySelector('#login-clave')?.getAttribute('autocomplete')).toBe(
      'current-password',
    );
  });

  it('alterna visibilidad de la clave con aria-pressed', async () => {
    const f = await render();
    const el = f.nativeElement as HTMLElement;
    const toggle = el.querySelector<HTMLButtonElement>('button.toggle-password');
    const clave = el.querySelector<HTMLInputElement>('#login-clave');
    expect(toggle).not.toBeNull();
    expect(clave?.getAttribute('type')).toBe('password');
    expect(toggle?.getAttribute('aria-label')).toBe('Mostrar clave');
    expect(toggle?.getAttribute('aria-pressed')).toBe('false');
    toggle?.click();
    f.detectChanges();
    expect(clave?.getAttribute('type')).toBe('text');
    expect(toggle?.getAttribute('aria-label')).toBe('Ocultar clave');
    expect(toggle?.getAttribute('aria-pressed')).toBe('true');
  });

  it('muestra Verificando… y deshabilita el fieldset cuando loading', async () => {
    const f = await render(true);
    const el = f.nativeElement as HTMLElement;
    const submit = el.querySelector<HTMLButtonElement>('button[type="submit"]');
    const fieldset = el.querySelector<HTMLFieldSetElement>('fieldset');
    expect(submit?.textContent).toContain('Verificando');
    expect(submit?.getAttribute('aria-busy')).toBe('true');
    expect(fieldset?.disabled).toBe(true);
  });

  it('CTA idle es Ingresar con flecha', async () => {
    const f = await render();
    const el = f.nativeElement as HTMLElement;
    const submit = el.querySelector('button[type="submit"]');
    expect(submit?.textContent).toContain('Ingresar');
    expect(submit?.querySelector('svg.arrow')).not.toBeNull();
  });

  it('usa placeholder institucional sin credenciales demo', async () => {
    const f = await render();
    const el = f.nativeElement as HTMLElement;
    const usuario = el.querySelector<HTMLInputElement>('#login-usuario');
    expect(usuario?.getAttribute('placeholder')).toBe('docente.apellido@ifts14.edu.ar');
    expect(el.textContent).not.toContain('usuario.demo@example.invalid');
    expect(el.innerHTML).not.toContain('usuario.demo');
  });

  it('coloca el alert de error antes de los campos', async () => {
    const f = await render();
    f.componentInstance.enviar();
    f.detectChanges();
    const el = f.nativeElement as HTMLElement;
    const fieldset = el.querySelector('fieldset');
    const alert = el.querySelector('#login-error[role="alert"]');
    const firstCampo = el.querySelector('.campo');
    expect(alert).not.toBeNull();
    expect(firstCampo).not.toBeNull();
    expect(fieldset?.firstElementChild?.tagName?.toLowerCase()).toBe('legend');
    const position = alert!.compareDocumentPosition(firstCampo!);
    expect(position & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy();
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

  it('muestra serverError en el mismo alert del formulario', async () => {
    const f = await render();
    f.componentRef.setInput('serverError', 'Las credenciales no coinciden con un registro autorizado.');
    f.detectChanges();
    const el = f.nativeElement as HTMLElement;
    const alert = el.querySelector('#login-error[role="alert"]');
    expect(alert?.textContent).toContain('no coinciden con un registro autorizado');
  });

  it('mueve el foco al alert de error tras envío inválido por flujo real de submit', async () => {
    const f = await render();
    const el = f.nativeElement as HTMLElement;
    const form = el.querySelector('form') as HTMLFormElement;
    form.dispatchEvent(new Event('submit'));
    f.detectChanges();
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

  it('emite submitted con credenciales y limpia el error', async () => {
    const f = await render();
    let emitted: { username: string; password: string } | undefined;
    f.componentInstance.submitted.subscribe((creds) => (emitted = creds));
    f.componentInstance.usuario.set('admin');
    f.componentInstance.clave.set('clave123');
    f.componentInstance.enviar();
    f.detectChanges();
    expect(emitted).toBeDefined();
    expect(emitted?.username).toBe('admin');
    expect(emitted?.password).toBe('clave123');
    const el = f.nativeElement as HTMLElement;
    expect(el.querySelector('#login-error')).toBeNull();
  });

  it('limpia solo la clave tras el envío válido (conserva el usuario)', async () => {
    const f = await render();
    f.componentInstance.usuario.set('admin');
    f.componentInstance.clave.set('clave123');
    f.componentInstance.enviar();
    f.detectChanges();
    expect(f.componentInstance.usuario()).toBe('admin');
    expect(f.componentInstance.clave()).toBe('');
  });

  it('acepta ID institucional sin formato email (type=text)', async () => {
    const f = await render();
    const el = f.nativeElement as HTMLElement;
    expect(el.querySelector('#login-usuario')?.getAttribute('type')).toBe('text');
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

  it('no contiene credenciales demo de la referencia React', async () => {
    const f = await render();
    const el = f.nativeElement as HTMLElement;
    expect(el.textContent).not.toContain('usuario.demo@example.invalid');
    expect(el.innerHTML).not.toContain('usuario.demo');
  });
});
