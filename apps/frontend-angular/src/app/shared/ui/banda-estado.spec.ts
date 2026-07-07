import { TestBed } from '@angular/core/testing';
import { BandaEstado, EstadoBanda } from './banda-estado';

async function render(kind: EstadoBanda, title = 'T') {
  await TestBed.configureTestingModule({ imports: [BandaEstado] }).compileComponents();
  const fixture = TestBed.createComponent(BandaEstado);
  fixture.componentRef.setInput('kind', kind);
  fixture.componentRef.setInput('title', title);
  fixture.detectChanges();
  return fixture;
}

describe('BandaEstado', () => {
  it('usa role=status para estados no críticos', async () => {
    const f = await render('valid', 'Verificado');
    const el = f.nativeElement as HTMLElement;
    expect(el.querySelector('[role="status"]')).not.toBeNull();
    expect(el.textContent).toContain('Verificado');
  });

  it('usa role=alert solo para error técnico', async () => {
    const f = await render('error', 'Error');
    const el = f.nativeElement as HTMLElement;
    const alert = el.querySelector('[role="alert"]');
    expect(alert).not.toBeNull();
  });

  it('estados no críticos NO usan role=alert', async () => {
    const f = await render('valid', 'Ok');
    const el = f.nativeElement as HTMLElement;
    expect(el.querySelector('[role="alert"]')).toBeNull();
  });

  it('preserva aria-live polite y aria-atomic', async () => {
    const f = await render('loading', 'Cargando');
    const el = f.nativeElement as HTMLElement;
    const live = el.querySelector('[aria-live="polite"]');
    expect(live).not.toBeNull();
    expect(live?.getAttribute('aria-atomic')).toBe('true');
  });

  it('aplica clase por kind y muestra stateLabel si se pasa', async () => {
    const f = await render('valid', 'Válido');
    f.componentRef.setInput('stateLabel', 'ESTADO: VÁLIDO');
    f.detectChanges();
    const el = f.nativeElement as HTMLElement;
    expect(el.querySelector('.banda-valid')).not.toBeNull();
    expect(el.textContent).toContain('ESTADO: VÁLIDO');
  });
});