import { TestBed } from '@angular/core/testing';
import { HeaderInstitucional } from './header-institucional';

describe('HeaderInstitucional', () => {
  async function render(showOnlineBadge = true) {
    await TestBed.configureTestingModule({ imports: [HeaderInstitucional] }).compileComponents();
    const fixture = TestBed.createComponent(HeaderInstitucional);
    fixture.componentRef.setInput('showOnlineBadge', showOnlineBadge);
    fixture.detectChanges();
    return fixture;
  }

  it('expone role=banner a nivel raíz (único banner de página)', async () => {
    const f = await render();
    const el = f.nativeElement as HTMLElement;
    expect(el.querySelector('[role="banner"]')).not.toBeNull();
  });

  it('muestra IFTS N.° 14 y subtítulo por defecto', async () => {
    const f = await render();
    const el = f.nativeElement as HTMLElement;
    expect(el.textContent).toContain('IFTS N.° 14');
    expect(el.textContent).toContain('Validación oficial de certificados');
  });

  it('oculta el badge cuando showOnlineBadge=false', async () => {
    const f = await render(false);
    const el = f.nativeElement as HTMLElement;
    expect(el.querySelector('.badge')).toBeNull();
  });

  it('SVG decorativo con aria-hidden', async () => {
    const f = await render();
    const el = f.nativeElement as HTMLElement;
    const svg = el.querySelector('svg');
    expect(svg?.getAttribute('aria-hidden')).toBe('true');
  });
});