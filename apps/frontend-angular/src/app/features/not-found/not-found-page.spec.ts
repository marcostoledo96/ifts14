import { TestBed } from '@angular/core/testing';
import { NotFoundPage } from './not-found-page';

describe('NotFoundPage', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [NotFoundPage],
    }).compileComponents();
  });

  it('renderiza mensaje de no encontrada', () => {
    const fixture = TestBed.createComponent(NotFoundPage);
    fixture.detectChanges();
    const text = (fixture.nativeElement as HTMLElement).textContent ?? '';
    expect(text).toContain('Página no encontrada');
  });

  it('no menciona validación ni tokens de demo', () => {
    const fixture = TestBed.createComponent(NotFoundPage);
    fixture.detectChanges();
    const text = (fixture.nativeElement as HTMLElement).textContent ?? '';
    expect(text).not.toContain('demo-valido');
    expect(text).not.toContain('Certificado verificable');
  });
});