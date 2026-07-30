import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { NotFoundPage } from './not-found-page';

describe('NotFoundPage', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [NotFoundPage],
      providers: [provideRouter([])],
    }).compileComponents();
  });

  it('renderiza mensaje de no encontrada', () => {
    const fixture = TestBed.createComponent(NotFoundPage);
    fixture.detectChanges();
    const text = (fixture.nativeElement as HTMLElement).textContent ?? '';
    expect(text).toContain('Página no encontrada');
  });

  it('ofrece un único CTA a /admin/login con etiqueta ES-AR', () => {
    const fixture = TestBed.createComponent(NotFoundPage);
    fixture.detectChanges();
    const el = fixture.nativeElement as HTMLElement;
    const links = Array.from(el.querySelectorAll('a'));
    expect(links.length).toBe(1);
    const cta = links[0];
    expect(cta.getAttribute('href')).toBe('/admin/login');
    expect(cta.textContent?.trim()).toBe('Ir al acceso administrativo');
  });

  it('no menciona validación ni tokens de demo', () => {
    const fixture = TestBed.createComponent(NotFoundPage);
    fixture.detectChanges();
    const el = fixture.nativeElement as HTMLElement;
    const text = el.textContent ?? '';
    const html = el.innerHTML;
    expect(text).not.toContain('demo-valido');
    expect(text).not.toContain('Certificado verificable');
    expect(text).not.toContain('/validar');
    expect(html).not.toContain('/validar');
    expect(text).not.toContain('Error');
    expect(text).not.toContain('token');
    expect(text).not.toContain('DNI');
    expect(text).not.toMatch(/stack/i);
  });
});
