import { TestBed } from '@angular/core/testing';
import { LandingPage } from './landing-page';

describe('LandingPage', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [LandingPage],
    }).compileComponents();
  });

  it('renderiza mensaje de inicio', () => {
    const fixture = TestBed.createComponent(LandingPage);
    fixture.detectChanges();
    const text = (fixture.nativeElement as HTMLElement).textContent ?? '';
    expect(text).toContain('Certificados IFTS 14');
  });

  it('no menciona validación ni tokens de demo', () => {
    const fixture = TestBed.createComponent(LandingPage);
    fixture.detectChanges();
    const text = (fixture.nativeElement as HTMLElement).textContent ?? '';
    expect(text).not.toContain('demo-valido');
    expect(text).not.toContain('Certificado verificable');
  });
});