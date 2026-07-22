import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { UiBackLink } from './ui-back-link';

describe('UiBackLink', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [UiBackLink],
      providers: [provideRouter([])],
    }).compileComponents();
  });

  it('renderiza label y href string', () => {
    const f = TestBed.createComponent(UiBackLink);
    f.componentRef.setInput('to', '/admin/alumnos');
    f.componentRef.setInput('label', 'Volver a Alumnos');
    f.componentRef.setInput('testId', 'volver-alumnos');
    f.detectChanges();
    const a = f.nativeElement.querySelector('a.ui-back-link') as HTMLAnchorElement;
    expect(a).toBeTruthy();
    expect(a.getAttribute('href')).toBe('/admin/alumnos');
    expect(a.getAttribute('data-testid')).toBe('volver-alumnos');
    expect(a.textContent).toContain('Volver a Alumnos');
  });

  it('acepta comandos de ruta como array', () => {
    const f = TestBed.createComponent(UiBackLink);
    f.componentRef.setInput('to', ['/admin/cursos', 3]);
    f.componentRef.setInput('label', 'Volver al curso');
    f.detectChanges();
    const a = f.nativeElement.querySelector('a.ui-back-link') as HTMLAnchorElement;
    expect(a.getAttribute('href')).toBe('/admin/cursos/3');
  });
});
