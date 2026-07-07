import { TestBed } from '@angular/core/testing';
import { FolioShell } from './folio-shell';

describe('FolioShell', () => {
  async function render(title = 'Título', certificateCode = 'COD-1') {
    await TestBed.configureTestingModule({ imports: [FolioShell] }).compileComponents();
    const fixture = TestBed.createComponent(FolioShell);
    fixture.componentRef.setInput('title', title);
    fixture.componentRef.setInput('certificateCode', certificateCode);
    fixture.detectChanges();
    return fixture;
  }

  it('NO agrega role=banner interno (evita duplicar landmarks)', async () => {
    const f = await render();
    const el = f.nativeElement as HTMLElement;
    expect(el.querySelector('[role="banner"]')).toBeNull();
  });

  it('NO duplica main ni contentinfo', async () => {
    const f = await render();
    const el = f.nativeElement as HTMLElement;
    expect(el.querySelector('[role="main"]')).toBeNull();
    expect(el.querySelector('[role="contentinfo"]')).toBeNull();
  });

  it('muestra título requerido y kicker por defecto', async () => {
    const f = await render('Validación');
    const el = f.nativeElement as HTMLElement;
    expect(el.textContent).toContain('Validación');
    expect(el.textContent).toContain('ACTA DE VALIDACIÓN ACADÉMICA');
  });

  it('muestra código de certificado cuando se pasa', async () => {
    const f = await render('T', 'ABC-123');
    const el = f.nativeElement as HTMLElement;
    expect(el.textContent).toContain('ABC-123');
  });

  it('oculta código cuando no se pasa', async () => {
    const f = await render();
    f.componentRef.setInput('certificateCode', '');
    f.detectChanges();
    const el = f.nativeElement as HTMLElement;
    expect(el.querySelector('.folio-code')).toBeNull();
  });
});